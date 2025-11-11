import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().min(1).max(50),
  budget: z.number().min(0),
  isDiscretionary: z.boolean().default(true),
  color: z.string().optional(),
  icon: z.string().optional(),
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

    const categories = await prisma.category.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
    });

    // Calculate spent amount for each category this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const categoriesWithSpent = await Promise.all(
      categories.map(async (cat) => {
        const transactions = await prisma.transaction.findMany({
          where: {
            userId: user.id,
            category: cat.name,
            date: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        });

        const spent = transactions.reduce((sum, txn) => sum + Number(txn.amount), 0);

        return {
          id: cat.id,
          name: cat.name,
          budget: Number(cat.budget),
          spent,
          isDiscretionary: cat.isDiscretionary,
          color: cat.color,
          icon: cat.icon,
          createdAt: cat.createdAt.toISOString(),
        };
      })
    );

    return NextResponse.json({
      categories: categoriesWithSpent,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
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
    const validation = createCategorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.errors },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        userId: user.id,
        ...validation.data,
      },
    });

    return NextResponse.json({
      data: {
        id: category.id,
        name: category.name,
        budget: Number(category.budget),
        isDiscretionary: category.isDiscretionary,
        color: category.color,
        icon: category.icon,
      },
    }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 409 }
      );
    }
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
