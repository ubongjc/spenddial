import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { plaidClient } from "@/lib/plaid";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const exchangeSchema = z.object({
  public_token: z.string(),
  institution: z.object({
    name: z.string(),
    institution_id: z.string(),
  }).optional(),
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

    const body = await request.json();
    const validation = exchangeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { public_token, institution } = validation.data;

    // Exchange public token for access token
    const tokenResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const accessToken = tokenResponse.data.access_token;
    const itemId = tokenResponse.data.item_id;

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

    // Get account details from Plaid
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    // Store accounts in database
    const accounts = await Promise.all(
      accountsResponse.data.accounts.map(async (account) => {
        return prisma.account.create({
          data: {
            userId: user.id,
            connector: "plaid",
            accountId: account.account_id,
            accountName: account.name,
            accountType: account.type,
            balance: account.balances.current || 0,
            currency: account.balances.iso_currency_code || "USD",
            isActive: true,
          },
        });
      })
    );

    // Store access token securely (in production, encrypt this)
    // For now, we'll store in a separate table
    await prisma.$executeRaw`
      INSERT INTO "PlaidItem" ("itemId", "accessToken", "userId", "institutionId", "institutionName", "createdAt", "updatedAt")
      VALUES (${itemId}, ${accessToken}, ${user.id}, ${institution?.institution_id || ""}, ${institution?.name || ""}, NOW(), NOW())
      ON CONFLICT ("itemId") DO UPDATE SET
        "accessToken" = ${accessToken},
        "updatedAt" = NOW()
    `;

    // Trigger initial transaction sync
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/plaid/sync-transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: user.id }),
    });

    return NextResponse.json({
      success: true,
      accounts: accounts.map((acc) => ({
        id: acc.id,
        name: acc.accountName,
        type: acc.accountType,
        balance: Number(acc.balance),
      })),
    });
  } catch (error) {
    console.error("Error exchanging token:", error);
    return NextResponse.json(
      { error: "Failed to exchange token" },
      { status: 500 }
    );
  }
}
