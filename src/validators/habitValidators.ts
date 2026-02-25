import { z } from "zod";

// Valid frequency values mirror the Prisma enum
const FrequencyEnum = z.enum(["DAILY", "WEEKLY", "CUSTOM"]);

// ── Create ───────────────────────────────────────────────────────────────────

export const createHabitSchema = z.object({
  title: z.string().min(1, "Title is required"),
  icon: z.string().min(1, "Icon is required"),
  category: z.string().min(1, "Category is required"),
  target: z
    .number()
    .int()
    .positive("Target must be a positive integer")
    .optional(),
  startDate: z.string().datetime({ offset: true }).optional(),
  frequency: FrequencyEnum.optional(),
  // Zod v4: z.record() requires two args — key schema + value schema
  customFrequency: z.record(z.string(), z.unknown()).optional(),
  reminderEnabled: z.boolean().optional(),
  reminderTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Reminder time must be in HH:MM format")
    .optional(),
});

// ── Update ───────────────────────────────────────────────────────────────────
// All fields are optional — only the sent fields are updated (PATCH semantics).

export const updateHabitSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").optional(),
  icon: z.string().min(1, "Icon cannot be empty").optional(),
  category: z.string().min(1, "Category cannot be empty").optional(),
  target: z
    .number()
    .int()
    .positive("Target must be a positive integer")
    .optional(),
  frequency: FrequencyEnum.optional(),
  customFrequency: z.record(z.string(), z.unknown()).optional(),
  reminderEnabled: z.boolean().optional(),
  reminderTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Reminder time must be in HH:MM format")
    .optional(),
});

// ── Toggle completion ─────────────────────────────────────────────────────────

export const completeHabitSchema = z.object({
  // Using regex instead of .date() to avoid Zod v4 overload signature changes
  date: z
    .string({ error: "Date is required" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});
