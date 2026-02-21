import {
  addHabit,
  getHabit,
  updateHabit,
  deleteHabit,
} from "../services/habitService.js";
import { prisma } from "../prisma/client.js";

describe("Habit Service CRUD Operations", () => {
  let testHabitId;
  const habitData = {
    title: "CRUD Test Habit",
    icon: "🧪",
    category: "Development",
    target: 5,
  };

  afterAll(async () => {
    if (testHabitId) {
      try {
        await deleteHabit(testHabitId);
      } catch (err) {
        // Ignore if already deleted
      }
    }
    await prisma.$disconnect();
  });

  test("should create a new habit", async () => {
    const habit = await addHabit(habitData);
    expect(habit).toHaveProperty("id");
    expect(habit.title).toBe(habitData.title);
    testHabitId = habit.id;
  });

  test("should fetch a single habit by id", async () => {
    const habit = await getHabit(testHabitId);
    expect(habit.id).toBe(testHabitId);
    expect(habit.category).toBe(habitData.category);
  });

  test("should update habit details", async () => {
    const updateData = { title: "Updated CRUD Habit", target: 10 };
    const updated = await updateHabit(testHabitId, updateData);
    expect(updated.title).toBe(updateData.title);
    expect(updated.target).toBe(updateData.target);
  });

  test("should delete a habit", async () => {
    const result = await deleteHabit(testHabitId);
    expect(result.message).toMatch(/deleted successfully/);

    // Verify it's gone
    await expect(getHabit(testHabitId)).rejects.toThrow("Habit not found");
    testHabitId = null;
  });
});
