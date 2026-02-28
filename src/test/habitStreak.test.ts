import {
  addHabit,
  completeHabit,
  deleteHabit,
} from '../services/habitService.js';
import { prisma } from '../config/database.js';

describe('Habit Service Streak Logic', () => {
  // Definite assignment — populated in beforeAll before any test uses it
  let testHabitId!: string;
  let testUserId: string;

  beforeAll(async () => {
    // Create a test user for streak tests
    const testUser = await prisma.user.upsert({
      where: { email: 'streak-test@example.com' },
      update: {},
      create: {
        email: 'streak-test@example.com',
        name: 'Streak Test User',
        passwordHash: 'hashed_password',
      },
    });
    testUserId = testUser.id;

    const habit = await addHabit({
      title: 'Streak Test Habit',
      icon: '🔥',
      category: 'Testing',
      userId: testUserId,
      target: 3,
    });
    testHabitId = habit.id;
  });

  afterAll(async () => {
    if (testHabitId) {
      try {
        await prisma.habit.delete({ where: { id: testHabitId } });
      } catch (err) {
        // Ignore
      }
    }
    if (testUserId) {
      try {
        await prisma.user.delete({ where: { id: testUserId } });
      } catch (err) {
        // Ignore
      }
    }
    await prisma.$disconnect();
  });

  test('should track streaks correctly when toggling completion', async () => {
    const date1 = '2026-02-21';
    const date2 = '2026-02-22';

    // First completion
    const res1 = await completeHabit(testHabitId, date1);
    expect(res1.isNowCompleted).toBe(true);
    expect(res1.streak).toBe(1);

    // Second consecutive completion
    const res2 = await completeHabit(testHabitId, date2);
    expect(res2.isNowCompleted).toBe(true);
    expect(res2.streak).toBe(2);

    // Un-toggle date1
    const res3 = await completeHabit(testHabitId, date1);
    expect(res3.isNowCompleted).toBe(false);
    // Streak for date2 becomes 1 when the preceding completion is removed
    expect(res3.streak).toBe(1);
  });

  describe('Negative Tests', () => {
    test('should throw error when toggling completion for non-existent habit', async () => {
      await expect(completeHabit('invalid-id', '2026-02-22')).rejects.toThrow(
        'Habit not found',
      );
    });
  });
});
