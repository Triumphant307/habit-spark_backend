import {
  addHabit,
  completeHabit,
  deleteHabit,
} from "../services/habitService.js";
import { prisma } from "../prisma/client.js";

describe("Habit Service Streak Logic", () => {
  let testHabitId;

  beforeAll(async () => {
    const habit = await addHabit({
      title: "Streak Test Habit",
      icon: "🔥",
      category: "Testing",
      target: 3,
    });
    testHabitId = habit.id;
  });

  afterAll(async () => {
    if (testHabitId) {
      try {
        await deleteHabit(testHabitId);
      } catch (err) {
        // Ignore
      }
    }
    await prisma.$disconnect();
  });

  test("should track streaks correctly when toggling completion", async () => {
    const date1 = "2026-02-21";
    const date2 = "2026-02-22";

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
});
