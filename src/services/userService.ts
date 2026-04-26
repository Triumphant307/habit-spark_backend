import * as userRepository from '../repositories/userRepository.js';
import { createHabit } from '../domain/habit.js';
import { OnboardingInput, UpdatePreferencesInput } from '../validators/userValidators.js';
import { prisma } from '../config/database.js';
import { AppError } from '../utils/errors.js';

/**
 * Orchestrates the completion of the 5-step onboarding wizard.
 * Uses a transaction to ensure all-or-nothing setup.
 */
export const completeOnboarding = async (userId: string, data: OnboardingInput) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Update nickname in core User model
    await tx.user.update({
      where: { id: userId },
      data: { name: data.nickname },
    });

    // 2. Update goal and commitment in UserPreference model
    await tx.userPreference.update({
      where: { userId },
      data: {
        onboardingGoal: data.goal,
        onboardingCommitment: data.commitment,
      },
    });

    // 3. Create the first habit using domain logic for slugs/dates
    const habitData = createHabit({
      ...data.firstHabit,
      userId,
      startDate: data.firstHabit.startDate ? new Date(data.firstHabit.startDate) : undefined,
    });

    const firstHabit = await tx.habit.create({
      data: habitData,
    });

    return { nickname: data.nickname, firstHabit };
  });
};

/**
 * Fetches user-specific UI preferences.
 */
export const getUserPreferences = async (userId: string) => {
  const user = await userRepository.findUserById(userId);
  if (!user || !user.preferences) {
    throw new AppError('User preferences not found', 404);
  }
  return user.preferences;
};

/**
 * Performs a partial update on theme or UI settings.
 */
export const updateUserPreferences = async (userId: string, data: UpdatePreferencesInput) => {
  return await userRepository.updatePreferences(userId, data);
};
