import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createBillSchema = z.object({
  name: z.string().min(1).max(100),
  amount: z.number().min(0),
  dueDay: z.number().min(1).max(28),
  category: z.string().optional(),
  recurring: z.boolean().default(true),
  frequency: z.enum(["monthly", "quarterly", "yearly"]).default("monthly"),
  isAutoPay: z.boolean().default(false),
});

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

    const bills = await prisma.bill.findMany({
      where: { userId: user.id },
      orderBy: { dueDay: "asc" },
    });

    return NextResponse.json({
      bills: bills.map((bill) => ({
        id: bill.id,
        name: bill.name,
        amount: Number(bill.amount),
        dueDay: bill.dueDay,
        category: bill.category,
        isPaid: bill.isPaid,
        recurring: bill.recurring,
        frequency: bill.frequency,
        isAutoPay: bill.isAutoPay,
        createdAt: bill.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching bills:", error);
    return NextResponse.json(
      { error: "Failed to fetch bills" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validation = createBillSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.errors },
        { status: 400 }
      );
    }

    const bill = await prisma.bill.create({
      data: {
        userId: user.id,
        ...validation.data,
      },
    });

    return NextResponse.json({
      bill: {
        id: bill.id,
        name: bill.name,
        amount: Number(bill.amount),
        dueDay: bill.dueDay,
        category: bill.category,
        isPaid: bill.isPaid,
        recurring: bill.recurring,
        frequency: bill.frequency,
        isAutoPay: bill.isAutoPay,
        createdAt: bill.createdAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating bill:", error);
    return NextResponse.json(
      { error: "Failed to create bill" },
      { status: 500 }
    );
  }
}
