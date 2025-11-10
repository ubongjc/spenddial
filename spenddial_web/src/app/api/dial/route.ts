import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { updateDialStateSchema } from "@/types/api";

/**
 * GET /api/dial
 *
 * Get the current dial state for the authenticated user
 *
 * @openapi
 * /api/dial:
 *   get:
 *     summary: Get current dial state
 *     tags:
 *       - Dial
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dial state retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/DialState'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Dial state not found
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      // Create user if they don't exist
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: "", // Will be updated by webhook
        },
      });
    }

    // Get or create dial state
    let dialState = await prisma.dialState.findUnique({
      where: { userId: user.id },
    });

    if (!dialState) {
      dialState = await prisma.dialState.create({
        data: {
          userId: user.id,
          todayBudget: 0,
          remaining: 0,
          spent: 0,
        },
      });
    }

    return NextResponse.json({
      data: {
        id: dialState.id,
        userId: dialState.userId,
        todayBudget: Number(dialState.todayBudget),
        remaining: Number(dialState.remaining),
        spent: Number(dialState.spent),
        lastCalculated: dialState.lastCalculated.toISOString(),
        createdAt: dialState.createdAt.toISOString(),
        updatedAt: dialState.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching dial state:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/dial
 *
 * Update the dial state for the authenticated user
 *
 * @openapi
 * /api/dial:
 *   patch:
 *     summary: Update dial state
 *     tags:
 *       - Dial
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               todayBudget:
 *                 type: number
 *               remaining:
 *                 type: number
 *               spent:
 *                 type: number
 *     responses:
 *       200:
 *         description: Dial state updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/DialState'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = updateDialStateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.errors },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update dial state
    const dialState = await prisma.dialState.upsert({
      where: { userId: user.id },
      update: {
        ...(validation.data.todayBudget !== undefined && {
          todayBudget: validation.data.todayBudget,
        }),
        ...(validation.data.remaining !== undefined && {
          remaining: validation.data.remaining,
        }),
        ...(validation.data.spent !== undefined && {
          spent: validation.data.spent,
        }),
        lastCalculated: new Date(),
      },
      create: {
        userId: user.id,
        todayBudget: validation.data.todayBudget ?? 0,
        remaining: validation.data.remaining ?? 0,
        spent: validation.data.spent ?? 0,
      },
    });

    return NextResponse.json({
      data: {
        id: dialState.id,
        userId: dialState.userId,
        todayBudget: Number(dialState.todayBudget),
        remaining: Number(dialState.remaining),
        spent: Number(dialState.spent),
        lastCalculated: dialState.lastCalculated.toISOString(),
        createdAt: dialState.createdAt.toISOString(),
        updatedAt: dialState.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating dial state:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
