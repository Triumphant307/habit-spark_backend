import {
  addHabit,
  getHabit,
  updateHabit,
  deleteHabit,
} from "../services/habitService.js";
import { createHabitSchema } from "../validators/habitValidators.js";
import { prisma } from "../config/database.js";

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

  test("should throw error when fetching non-existent habit", async () => {
    await expect(getHabit("non-existent-id")).rejects.toThrow(
      "Habit not found",
    );
  });

  // Validation is now handled by Zod at the route boundary, not by the domain.
  // These tests verify the schema directly — no DB or service calls needed.
  describe("Zod Schema Validation — createHabitSchema", () => {
    test("should fail validation when title is missing", () => {
      const result = createHabitSchema.safeParse({
        icon: "🍎",
        category: "Health",
      });
      expect(result.success).toBe(false);
      const fields = result.error.issues.map((e) => e.path[0]);
      expect(fields).toContain("title");
    });

    test("should fail validation when icon is missing", () => {
      const result = createHabitSchema.safeParse({
        title: "No Icon",
        category: "Health",
      });
      expect(result.success).toBe(false);
      const fields = result.error.issues.map((e) => e.path[0]);
      expect(fields).toContain("icon");
    });

    test("should fail validation when category is missing", () => {
      const result = createHabitSchema.safeParse({
        title: "No Category",
        icon: "🍎",
      });
      expect(result.success).toBe(false);
      const fields = result.error.issues.map((e) => e.path[0]);
      expect(fields).toContain("category");
    });

    test("should fail validation when target is not a positive integer", () => {
      const result = createHabitSchema.safeParse({
        title: "Test",
        icon: "🍎",
        category: "Health",
        target: -5,
      });
      expect(result.success).toBe(false);
      const fields = result.error.issues.map((e) => e.path[0]);
      expect(fields).toContain("target");
    });

    test("should fail validation when reminderTime format is invalid", () => {
      const result = createHabitSchema.safeParse({
        title: "Test",
        icon: "🍎",
        category: "Health",
        reminderTime: "9am",
      });
      expect(result.success).toBe(false);
      const fields = result.error.issues.map((e) => e.path[0]);
      expect(fields).toContain("reminderTime");
    });

    test("should pass validation with all required fields", () => {
      const result = createHabitSchema.safeParse({
        title: "Morning Run",
        icon: "🏃",
        category: "Fitness",
      });
      expect(result.success).toBe(true);
    });
  });
});
