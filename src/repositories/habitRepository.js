import { prisma } from "../config/database.js";

// ── Habit queries ────────────────────────────────────────────────────────────

export const getAll = async () => {
  return await prisma.habit.findMany({
    include: { history: true },
  });
};

export const getById = async (id) => {
  return await prisma.habit.findUnique({
    where: { id },
    include: { history: true },
  });
};

// Save a new habit — upserts on slug to avoid unique constraint errors on retry
export const save = async (habit) => {
  const { slug, ...rest } = habit;
  return await prisma.habit.upsert({
    where: { slug },
    create: habit,
    update: rest,
  });
};

export const update = async (updatedHabit) => {
  return await prisma.habit.update({
    where: { id: updatedHabit.id },
    data: updatedHabit,
    include: { history: true },
  });
};

export const remove = async (id) => {
  return await prisma.habit.delete({
    where: { id },
  });
};

export const updateStreak = async (habitId, streak) => {
  return await prisma.habit.update({
    where: { id: habitId },
    data: { streak },
  });
};

// ── HabitEntry queries ───────────────────────────────────────────────────────

export const findEntry = async (habitId, date) => {
  return await prisma.habitEntry.findUnique({
    where: { habitId_date: { habitId, date } },
  });
};

export const addEntry = async (habitId, date) => {
  return await prisma.habitEntry.create({ data: { habitId, date } });
};

export const removeEntry = async (id) => {
  return await prisma.habitEntry.delete({ where: { id } });
};

export const getEntries = async (habitId) => {
  return await prisma.habitEntry.findMany({
    where: { habitId },
    orderBy: { date: "desc" },
  });
};
