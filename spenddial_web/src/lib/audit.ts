import { prisma } from "./prisma";

export enum AuditAction {
  // Authentication
  USER_LOGIN = "USER_LOGIN",
  USER_LOGOUT = "USER_LOGOUT",
  USER_REGISTER = "USER_REGISTER",
  PASSWORD_CHANGE = "PASSWORD_CHANGE",

  // Banking
  BANK_ACCOUNT_CONNECTED = "BANK_ACCOUNT_CONNECTED",
  BANK_ACCOUNT_DISCONNECTED = "BANK_ACCOUNT_DISCONNECTED",
  TRANSACTIONS_SYNCED = "TRANSACTIONS_SYNCED",

  // Data Management
  DATA_EXPORTED = "DATA_EXPORTED",
  ACCOUNT_DELETED = "ACCOUNT_DELETED",

  // Billing
  SUBSCRIPTION_CREATED = "SUBSCRIPTION_CREATED",
  SUBSCRIPTION_UPDATED = "SUBSCRIPTION_UPDATED",
  SUBSCRIPTION_CANCELED = "SUBSCRIPTION_CANCELED",
  PAYMENT_SUCCEEDED = "PAYMENT_SUCCEEDED",
  PAYMENT_FAILED = "PAYMENT_FAILED",

  // Budget
  CATEGORY_CREATED = "CATEGORY_CREATED",
  CATEGORY_UPDATED = "CATEGORY_UPDATED",
  CATEGORY_DELETED = "CATEGORY_DELETED",
  BILL_CREATED = "BILL_CREATED",
  BILL_UPDATED = "BILL_UPDATED",
  BILL_DELETED = "BILL_DELETED",

  // Security
  SECURITY_ALERT = "SECURITY_ALERT",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
}

export interface AuditLogEntry {
  userId?: string;
  action: AuditAction;
  resource?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  error?: string;
}

// Log audit event to database
export async function logAudit(entry: AuditLogEntry) {
  try {
    // In production, store in database or send to logging service
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...entry,
    };

    // Log to console for now (in production, use proper logging service)
    console.log("[AUDIT]", JSON.stringify(logEntry));

    // Store in database if critical
    if (isCriticalAction(entry.action)) {
      await prisma.$executeRaw`
        INSERT INTO "AuditLog" ("userId", "action", "resource", "resourceId", "metadata", "ipAddress", "userAgent", "success", "error", "timestamp")
        VALUES (
          ${entry.userId || null},
          ${entry.action},
          ${entry.resource || null},
          ${entry.resourceId || null},
          ${JSON.stringify(entry.metadata || {})},
          ${entry.ipAddress || null},
          ${entry.userAgent || null},
          ${entry.success},
          ${entry.error || null},
          NOW()
        )
      `;
    }
  } catch (error) {
    // Don't throw - logging should never break the application
    console.error("[AUDIT ERROR]", error);
  }
}

// Helper to extract audit context from request
export function getAuditContext(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const userAgent = request.headers.get("user-agent");

  return {
    ipAddress: forwarded?.split(",")[0].trim() || realIP || "unknown",
    userAgent: userAgent || "unknown",
  };
}

// Check if action is critical and needs database storage
function isCriticalAction(action: AuditAction): boolean {
  const criticalActions = [
    AuditAction.USER_REGISTER,
    AuditAction.USER_LOGOUT,
    AuditAction.BANK_ACCOUNT_CONNECTED,
    AuditAction.BANK_ACCOUNT_DISCONNECTED,
    AuditAction.DATA_EXPORTED,
    AuditAction.ACCOUNT_DELETED,
    AuditAction.SUBSCRIPTION_CREATED,
    AuditAction.SUBSCRIPTION_CANCELED,
    AuditAction.SECURITY_ALERT,
    AuditAction.SUSPICIOUS_ACTIVITY,
  ];

  return criticalActions.includes(action);
}

// Query audit logs for a user
export async function getUserAuditLogs(
  userId: string,
  limit: number = 50
): Promise<any[]> {
  try {
    const logs = await prisma.$queryRaw<any[]>`
      SELECT * FROM "AuditLog"
      WHERE "userId" = ${userId}
      ORDER BY "timestamp" DESC
      LIMIT ${limit}
    `;
    return logs;
  } catch (error) {
    console.error("[AUDIT QUERY ERROR]", error);
    return [];
  }
}

// Security alert helper
export async function logSecurityAlert(
  userId: string | undefined,
  message: string,
  severity: "low" | "medium" | "high" | "critical",
  request?: Request
) {
  const context = request ? getAuditContext(request) : {};

  await logAudit({
    userId,
    action: AuditAction.SECURITY_ALERT,
    metadata: {
      message,
      severity,
    },
    ...context,
    success: true,
  });

  // In production, send to security monitoring service
  if (severity === "critical") {
    console.error(`[CRITICAL SECURITY ALERT] ${message}`, {
      userId,
      ...context,
    });
  }
}
