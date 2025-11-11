import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get user's accounts
    const accounts = await prisma.account.findMany({
      where: { userId: user.id },
    });

    const accountIds = accounts.map((a) => a.id);

    // Get this month's transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        accountId: { in: accountIds },
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Calculate spending by category
    const spendingByCategory = transactions.reduce((acc, txn) => {
      const category = txn.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += Number(txn.amount);
      return acc;
    }, {} as Record<string, number>);

    // Calculate daily spending
    const dailySpending: Record<string, number> = {};
    transactions.forEach((txn) => {
      const day = txn.date.toISOString().split("T")[0];
      if (!dailySpending[day]) {
        dailySpending[day] = 0;
      }
      dailySpending[day] += Number(txn.amount);
    });

    // Get upcoming bills
    const upcomingBills = await prisma.bill.findMany({
      where: {
        userId: user.id,
        dueDate: {
          gte: now,
          lte: endOfMonth,
        },
        isPaid: false,
      },
      orderBy: { dueDate: "asc" },
      take: 5,
    });

    // Calculate total balance
    const totalBalance = accounts.reduce(
      (sum, acc) => sum + Number(acc.balance),
      0
    );

    // Get dial state
    const dialState = await prisma.dialState.findUnique({
      where: { userId: user.id },
    });

    // Calculate monthly spending
    const monthlySpending = transactions.reduce(
      (sum, txn) => sum + Number(txn.amount),
      0
    );

    return NextResponse.json({
      data: {
        totalBalance,
        monthlySpending,
        spendingByCategory: Object.entries(spendingByCategory).map(
          ([category, amount]) => ({
            category,
            amount,
          })
        ),
        dailySpending: Object.entries(dailySpending).map(([date, amount]) => ({
          date,
          amount,
        })),
        upcomingBills: upcomingBills.map((bill) => ({
          id: bill.id,
          name: bill.name,
          amount: Number(bill.amount),
          dueDate: bill.dueDate.toISOString(),
        })),
        dialState: dialState
          ? {
              todayBudget: Number(dialState.todayBudget),
              remaining: Number(dialState.remaining),
              spent: Number(dialState.spent),
              lastCalculated: dialState.lastCalculated.toISOString(),
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
