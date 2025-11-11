import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const querySchema = z.object({
  limit: z.string().optional(),
  offset: z.string().optional(),
  category: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const query = querySchema.parse({
      limit: searchParams.get("limit") || undefined,
      offset: searchParams.get("offset") || undefined,
      category: searchParams.get("category") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    });

    const limit = parseInt(query.limit || "50");
    const offset = parseInt(query.offset || "0");

    // Get user's accounts
    const accounts = await prisma.account.findMany({
      where: { userId: user.id },
      select: { id: true },
    });

    const accountIds = accounts.map((a) => a.id);

    // Build where clause
    const where: any = {
      accountId: { in: accountIds },
    };

    if (query.category) {
      where.category = query.category;
    }

    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) {
        where.date.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.date.lte = new Date(query.endDate);
      }
    }

    // Get transactions with pagination
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          account: {
            select: {
              accountName: true,
              accountType: true,
            },
          },
        },
        orderBy: { date: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({
      data: transactions.map((txn) => ({
        id: txn.id,
        amount: Number(txn.amount),
        description: txn.description,
        merchantName: txn.merchantName,
        category: txn.category,
        date: txn.date.toISOString(),
        pending: txn.pending,
        account: txn.account,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
