import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { plaidClient } from "@/lib/plaid";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const syncSchema = z.object({
  userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId: authUserId } = await auth();
    const body = await request.json();
    const { userId: requestUserId } = syncSchema.parse(body);

    // Use authenticated user ID or provided user ID (for background jobs)
    const userId = requestUserId || authUserId;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get all Plaid items for user
    const plaidItems = await prisma.$queryRaw<Array<{
      itemId: string;
      accessToken: string;
    }>>`
      SELECT "itemId", "accessToken"
      FROM "PlaidItem"
      WHERE "userId" = ${user.id}
    `;

    if (plaidItems.length === 0) {
      return NextResponse.json({
        message: "No linked accounts found",
        synced: 0,
      });
    }

    let totalSynced = 0;

    // Sync transactions for each item
    for (const item of plaidItems) {
      try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const transactionsResponse = await plaidClient.transactionsGet({
          access_token: item.accessToken,
          start_date: thirtyDaysAgo.toISOString().split("T")[0],
          end_date: now.toISOString().split("T")[0],
          options: {
            include_personal_finance_category: true,
          },
        });

        const transactions = transactionsResponse.data.transactions;

        // Get account mappings
        const accounts = await prisma.account.findMany({
          where: {
            userId: user.id,
            connector: "plaid",
          },
        });

        const accountMap = new Map(
          accounts.map((acc) => [acc.accountId, acc.id])
        );

        // Store transactions
        for (const txn of transactions) {
          const accountId = accountMap.get(txn.account_id);
          if (!accountId) continue;

          await prisma.transaction.upsert({
            where: {
              id: txn.transaction_id,
            },
            create: {
              id: txn.transaction_id,
              accountId,
              amount: Math.abs(txn.amount),
              description: txn.name,
              merchantName: txn.merchant_name || txn.name,
              mcc: txn.merchant_entity_id || undefined,
              category: txn.personal_finance_category?.primary || txn.category?.[0],
              date: new Date(txn.date),
              pending: txn.pending,
            },
            update: {
              amount: Math.abs(txn.amount),
              description: txn.name,
              merchantName: txn.merchant_name || txn.name,
              category: txn.personal_finance_category?.primary || txn.category?.[0],
              pending: txn.pending,
            },
          });

          totalSynced++;
        }

        // Update account balances
        const balancesResponse = await plaidClient.accountsBalanceGet({
          access_token: item.accessToken,
        });

        for (const account of balancesResponse.data.accounts) {
          const dbAccountId = accountMap.get(account.account_id);
          if (dbAccountId) {
            await prisma.account.update({
              where: { id: dbAccountId },
              data: {
                balance: account.balances.current || 0,
              },
            });
          }
        }
      } catch (error) {
        console.error(`Error syncing item ${item.itemId}:`, error);
        continue;
      }
    }

    // Recalculate dial state after sync
    await recalculateDialState(user.id);

    return NextResponse.json({
      message: "Transactions synced successfully",
      synced: totalSynced,
    });
  } catch (error) {
    console.error("Error syncing transactions:", error);
    return NextResponse.json(
      { error: "Failed to sync transactions" },
      { status: 500 }
    );
  }
}

async function recalculateDialState(userId: string) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Get user's accounts
  const accounts = await prisma.account.findMany({
    where: { userId },
  });

  const accountIds = accounts.map((a) => a.id);

  // Calculate today's spending
  const todayTransactions = await prisma.transaction.findMany({
    where: {
      accountId: { in: accountIds },
      date: { gte: startOfDay },
    },
  });

  const spent = todayTransactions.reduce(
    (sum, txn) => sum + Number(txn.amount),
    0
  );

  // Get upcoming bills this month
  const upcomingBills = await prisma.bill.findMany({
    where: {
      userId,
      dueDate: {
        gte: now,
        lte: endOfMonth,
      },
      isPaid: false,
    },
  });

  const totalBills = upcomingBills.reduce(
    (sum, bill) => sum + Number(bill.amount),
    0
  );

  // Calculate total available balance
  const totalBalance = accounts.reduce(
    (sum, acc) => sum + Number(acc.balance),
    0
  );

  // Simple budget calculation
  const daysLeftInMonth = Math.ceil(
    (endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  const availableForSpending = totalBalance - totalBills;
  const todayBudget = availableForSpending / (daysLeftInMonth || 1);
  const remaining = todayBudget - spent;

  // Update dial state
  await prisma.dialState.upsert({
    where: { userId },
    create: {
      userId,
      todayBudget,
      spent,
      remaining,
      lastCalculated: now,
    },
    update: {
      todayBudget,
      spent,
      remaining,
      lastCalculated: now,
    },
  });
}
