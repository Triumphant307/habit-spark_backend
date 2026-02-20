import {
  listHabits,
  addHabit,
  completeHabit,
} from "./services/habitService.js";

const test = async () => {
  //Add a habit
  const habit = await addHabit({
   title: "Eat Healthy",
    icon: "🍎",
    category: "Health",
    target: 1,   
  });

  console.log("Habit added:", habit);

  const allHabitsAfterCreation = await listHabits();
  console.log("All habits after creation:", allHabitsAfterCreation);

  const completedHabit = await completeHabit(habit.id, new Date("2026-02-20"));

  console.log("Completed habit:", completedHabit);

  const allHabitsAfterCompletion = await listHabits();
  console.log("All habits after completion:", allHabitsAfterCompletion);
};

test().catch((err) => console.error(err));
