import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createBillSchema = z.object({
  name: z.string().min(1).max(100),
  amount: z.number().min(0),
  dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  isRecurring: z.boolean().default(false),
  frequency: z.enum(["weekly", "monthly", "yearly"]).optional(),
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
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json({
      data: bills.map((bill) => ({
        id: bill.id,
        name: bill.name,
        amount: Number(bill.amount),
        dueDate: bill.dueDate.toISOString(),
        isPaid: bill.isPaid,
        isRecurring: bill.isRecurring,
        frequency: bill.frequency,
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
        name: validation.data.name,
        amount: validation.data.amount,
        dueDate: new Date(validation.data.dueDate),
        isRecurring: validation.data.isRecurring,
        frequency: validation.data.frequency,
      },
    });

    return NextResponse.json({
      data: {
        id: bill.id,
        name: bill.name,
        amount: Number(bill.amount),
        dueDate: bill.dueDate.toISOString(),
        isPaid: bill.isPaid,
        isRecurring: bill.isRecurring,
        frequency: bill.frequency,
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
