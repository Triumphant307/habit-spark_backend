import { createHabit, toggleCompletion } from "./domain/habit.js";
import { getAll, save, getById, update } from "./repositories/habitRepository.js";

// Create a habit using domain logic
const habit = createHabit({
  title: "Read 10 pages",
  emoji: "📘",
  category: "Learning",
});

// Save it in repository
save(habit);

console.log("All habits after save:", getAll());

// Complete habit for today
const habitFromRepo = getById(habit.id);
const updatedHabit = toggleCompletion(habitFromRepo, "2026-01-30");
update(updatedHabit);

console.log("All habits after completion:", getAll());
