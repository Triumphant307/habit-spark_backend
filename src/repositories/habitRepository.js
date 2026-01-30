// In-memory storage for habits
const habits = [];

// List all habits
export const getAll = () => [...habits]; // return a copy to avoid direct mutation

// Find habit by id
export const getById = (id) => habits.find((h) => h.id === id);

// Save a new habit
export const save = (habit) => {
  habits.push(habit);
  return habit;
};

// Update an existing habit
export const update = (updatedHabit) => {
  const index = habits.findIndex((h) => h.id === updatedHabit.id);
  if (index === -1) return null;

  habits[index] = updatedHabit;
  return updatedHabit;
};
