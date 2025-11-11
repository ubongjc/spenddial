import { z } from "zod";

// Dial State schemas
export const dialStateSchema = z.object({
  id: z.string(),
  userId: z.string(),
  todayBudget: z.number(),
  remaining: z.number(),
  spent: z.number(),
  lastCalculated: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const updateDialStateSchema = z.object({
  todayBudget: z.number().optional(),
  remaining: z.number().optional(),
  spent: z.number().optional(),
});

export type DialState = z.infer<typeof dialStateSchema>;
export type UpdateDialState = z.infer<typeof updateDialStateSchema>;

// API Response types
export type ApiResponse<T = unknown> = {
  data?: T;
  error?: string;
  message?: string;
};
