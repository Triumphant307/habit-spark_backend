//Using Prisma
import { prisma } from "../config/database.js";
// List all habits
export const getAll = async () => {
  return await prisma.habit.findMany({
    include: { history: true },
  });
}; // return a copy to avoid direct mutation

// Find habit by id
export const getById = async (id) => {
  return await prisma.habit.findUnique({
    where: { id },
    include: { history: true },
  });
};

// Save a new habit (upserts on slug to avoid unique constraint errors)
export const save = async (habit) => {
  const { slug, ...rest } = habit;
  return await prisma.habit.upsert({
    where: { slug },
    create: habit,
    update: rest,
  });
};

// Update an existing habit
export const update = async (updatedHabit) => {
  return await prisma.habit.update({
    where: { id: updatedHabit.id },
    data: updatedHabit,
    include: { history: true },
  });
};

//Delete a habit
export const remove = async (id) => {
  return await prisma.habit.delete({
    where: { id },
  });
};
