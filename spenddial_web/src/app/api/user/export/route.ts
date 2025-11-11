import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { logAudit, AuditAction, getAuditContext } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

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

    // Fetch all user data
    const [accounts, transactions, categories, bills, dialState] = await Promise.all([
      prisma.account.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          accountName: true,
          accountType: true,
          balance: true,
          currency: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.transaction.findMany({
        where: {
          account: {
            userId: user.id,
          },
        },
        select: {
          id: true,
          amount: true,
          description: true,
          merchantName: true,
          category: true,
          date: true,
          pending: true,
          createdAt: true,
        },
        orderBy: { date: "desc" },
      }),
      prisma.category.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          name: true,
          budget: true,
          isDiscretionary: true,
          color: true,
          icon: true,
          createdAt: true,
        },
      }),
      prisma.bill.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          name: true,
          amount: true,
          dueDay: true,
          category: true,
          recurring: true,
          frequency: true,
          isAutoPay: true,
          isPaid: true,
          createdAt: true,
        },
      }),
      prisma.dialState.findUnique({
        where: { userId: user.id },
        select: {
          todayBudget: true,
          remaining: true,
          spent: true,
          lastCalculated: true,
        },
      }),
    ]);

    // Convert Decimals to numbers for JSON serialization
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
      },
      accounts: accounts.map((acc) => ({
        ...acc,
        balance: Number(acc.balance),
        createdAt: acc.createdAt.toISOString(),
        updatedAt: acc.updatedAt.toISOString(),
      })),
      transactions: transactions.map((txn) => ({
        ...txn,
        amount: Number(txn.amount),
        date: txn.date.toISOString(),
        createdAt: txn.createdAt.toISOString(),
      })),
      categories: categories.map((cat) => ({
        ...cat,
        budget: Number(cat.budget),
        createdAt: cat.createdAt.toISOString(),
      })),
      bills: bills.map((bill) => ({
        ...bill,
        amount: Number(bill.amount),
        createdAt: bill.createdAt.toISOString(),
      })),
      dialState: dialState
        ? {
            todayBudget: Number(dialState.todayBudget),
            remaining: Number(dialState.remaining),
            spent: Number(dialState.spent),
            lastCalculated: dialState.lastCalculated.toISOString(),
          }
        : null,
      summary: {
        totalAccounts: accounts.length,
        totalTransactions: transactions.length,
        totalCategories: categories.length,
        totalBills: bills.length,
        totalBalance: accounts.reduce((sum, acc) => sum + Number(acc.balance), 0),
      },
    };

    // Log audit event
    const auditContext = getAuditContext(request);
    await logAudit({
      userId: user.id,
      action: AuditAction.DATA_EXPORTED,
      metadata: {
        format: "json",
        recordCount: {
          accounts: accounts.length,
          transactions: transactions.length,
          categories: categories.length,
          bills: bills.length,
        },
      },
      ...auditContext,
      success: true,
    });

    // Return JSON file
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="spenddial-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
