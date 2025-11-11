import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { logAudit, AuditAction, getAuditContext } from "@/lib/audit";
import { z } from "zod";

const deleteAccountSchema = z.object({
  confirmation: z.literal("DELETE MY ACCOUNT"),
  reason: z.string().optional(),
});

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
    const validation = deleteAccountSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid confirmation",
          details: "Please type 'DELETE MY ACCOUNT' to confirm deletion"
        },
        { status: 400 }
      );
    }

    const auditContext = getAuditContext(request);

    // Log deletion request before actually deleting
    await logAudit({
      userId: user.id,
      action: AuditAction.ACCOUNT_DELETED,
      metadata: {
        reason: validation.data.reason,
        email: user.email,
        accountAge: Date.now() - user.createdAt.getTime(),
      },
      ...auditContext,
      success: true,
    });

    // Get counts before deletion for response
    const [accountCount, transactionCount, categoryCount, billCount] = await Promise.all([
      prisma.account.count({ where: { userId: user.id } }),
      prisma.transaction.count({
        where: {
          account: {
            userId: user.id,
          },
        },
      }),
      prisma.category.count({ where: { userId: user.id } }),
      prisma.bill.count({ where: { userId: user.id } }),
    ]);

    // Delete all user data (cascade will handle most of this, but being explicit)
    // Prisma will handle cascading deletes based on schema relations
    await prisma.$transaction([
      // Delete PlaidItems
      prisma.plaidItem.deleteMany({ where: { userId: user.id } }),

      // Delete DialStates
      prisma.dialState.deleteMany({ where: { userId: user.id } }),

      // Delete Bills
      prisma.bill.deleteMany({ where: { userId: user.id } }),

      // Delete Categories
      prisma.category.deleteMany({ where: { userId: user.id } }),

      // Delete Encryption Keys
      prisma.encryptionKey.deleteMany({ where: { userId: user.id } }),

      // Delete Subscriptions
      prisma.subscription.deleteMany({ where: { userId: user.id } }),

      // Transactions will be deleted via cascade when Accounts are deleted
      // Delete Accounts (and their transactions via cascade)
      prisma.account.deleteMany({ where: { userId: user.id } }),

      // Finally delete the User
      prisma.user.delete({ where: { id: user.id } }),
    ]);

    // Delete from Clerk (authentication provider)
    try {
      await clerkClient().users.deleteUser(userId);
    } catch (clerkError) {
      console.error("Error deleting user from Clerk:", clerkError);
      // Continue even if Clerk deletion fails - data is already gone
    }

    return NextResponse.json({
      message: "Account successfully deleted",
      deletedData: {
        accounts: accountCount,
        transactions: transactionCount,
        categories: categoryCount,
        bills: billCount,
      },
    });
  } catch (error: any) {
    console.error("Error deleting account:", error);

    // Log failed deletion attempt
    const auditContext = getAuditContext(request);
    await logAudit({
      userId: undefined,
      action: AuditAction.ACCOUNT_DELETED,
      metadata: {
        error: error.message,
      },
      ...auditContext,
      success: false,
      error: error.message,
    });

    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
