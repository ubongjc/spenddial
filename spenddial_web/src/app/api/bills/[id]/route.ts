import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateBillSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  amount: z.number().min(0).optional(),
  dueDay: z.number().min(1).max(28).optional(),
  category: z.string().optional(),
  recurring: z.boolean().optional(),
  frequency: z.enum(["monthly", "quarterly", "yearly"]).optional(),
  isAutoPay: z.boolean().optional(),
  isPaid: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify bill belongs to user
    const existingBill = await prisma.bill.findUnique({
      where: { id: params.id },
    });

    if (!existingBill || existingBill.userId !== user.id) {
      return NextResponse.json(
        { error: "Bill not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = updateBillSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.errors },
        { status: 400 }
      );
    }

    const bill = await prisma.bill.update({
      where: { id: params.id },
      data: validation.data,
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
    });
  } catch (error) {
    console.error("Error updating bill:", error);
    return NextResponse.json(
      { error: "Failed to update bill" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify bill belongs to user
    const existingBill = await prisma.bill.findUnique({
      where: { id: params.id },
    });

    if (!existingBill || existingBill.userId !== user.id) {
      return NextResponse.json(
        { error: "Bill not found" },
        { status: 404 }
      );
    }

    // Delete bill
    await prisma.bill.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "Bill deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting bill:", error);
    return NextResponse.json(
      { error: "Failed to delete bill" },
      { status: 500 }
    );
  }
}
