

const generateId = () =>
  Math.random().toString(36).substring(2, 10);

export const createHabit = ({ title, emoji, category }) => {
  if (!title) {
    throw new Error("Habit title is required");
  }

  if (!category) {
    throw new Error("Habit category is required");
  }

  return {
    id: generateId(),
    title,
    emoji: emoji || "🔥",
    category,
    completedDates: [],
    createdAt: new Date().toISOString(),
  };
};

export const toggleCompletion = (habit, date) => {
  if (!date) {
    throw new Error("Date is required");
  }

  const alreadyDone = habit.completedDates.includes(date);

  return {
    ...habit,
    completedDates: alreadyDone
      ? habit.completedDates.filter(d => d !== date)
      : [...habit.completedDates, date],
  };
};
