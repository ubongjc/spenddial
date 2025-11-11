import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
}

export async function sendEmail({ to, subject, react }: EmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: "SpendDial <noreply@spenddial.com>",
      to: Array.isArray(to) ? to : [to],
      subject,
      react,
    });

    if (error) {
      console.error("Email send error:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

// Email notification types
export const emailNotifications = {
  welcome: async (email: string, name: string) => {
    const { WelcomeEmail } = await import("./templates/WelcomeEmail");
    return sendEmail({
      to: email,
      subject: "Welcome to SpendDial!",
      react: WelcomeEmail({ name }),
    });
  },

  budgetAlert: async (email: string, remaining: number, budget: number) => {
    const { BudgetAlertEmail } = await import("./templates/BudgetAlertEmail");
    return sendEmail({
      to: email,
      subject: "Budget Alert: You're running low!",
      react: BudgetAlertEmail({ remaining, budget }),
    });
  },

  dailySummary: async (
    email: string,
    spent: number,
    remaining: number,
    topCategories: Array<{ name: string; amount: number }>
  ) => {
    const { DailySummaryEmail } = await import("./templates/DailySummaryEmail");
    return sendEmail({
      to: email,
      subject: "Your Daily Spending Summary",
      react: DailySummaryEmail({ spent, remaining, topCategories }),
    });
  },

  billReminder: async (
    email: string,
    billName: string,
    amount: number,
    dueDate: Date
  ) => {
    const { BillReminderEmail } = await import("./templates/BillReminderEmail");
    return sendEmail({
      to: email,
      subject: `Bill Reminder: ${billName} due soon`,
      react: BillReminderEmail({ billName, amount, dueDate }),
    });
  },

  weeklyReport: async (
    email: string,
    weekSpent: number,
    weekBudget: number,
    insights: string[]
  ) => {
    const { WeeklyReportEmail } = await import("./templates/WeeklyReportEmail");
    return sendEmail({
      to: email,
      subject: "Your Weekly Spending Report",
      react: WeeklyReportEmail({ weekSpent, weekBudget, insights }),
    });
  },

  unusualActivity: async (
    email: string,
    transaction: { merchant: string; amount: number; date: Date }
  ) => {
    const { UnusualActivityEmail } = await import(
      "./templates/UnusualActivityEmail"
    );
    return sendEmail({
      to: email,
      subject: "Unusual Activity Detected",
      react: UnusualActivityEmail({ transaction }),
    });
  },
};
