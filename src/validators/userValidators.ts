import { z } from 'zod';
import { createHabitSchema } from './habitValidators.js';

/**
 * Schema for the 5-step onboarding wizard.
 */
export const onboardingSchema = z.object({
  nickname: z.string().min(2, 'Nickname must be at least 2 characters'),
  goal: z.string().min(1, 'Please select a focus goal'),
  commitment: z.string().min(1, 'Please select a commitment level'),
  firstHabit: createHabitSchema,
});

/**
 * Schema for updating UI preferences.
 */
export const updatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark']).optional(),
  sidebarCollapsed: z.boolean().optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
