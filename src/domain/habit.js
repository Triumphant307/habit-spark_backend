import { prisma } from "../prisma/client.js";

const generateId = () => Math.random().toString(36).substring(2, 10);

export const createHabit = ({
  title,
  icon,
  category,
  target,
  startDate = new Date(),
}) => {
  if (!title) throw new Error("Habit title is required");

  if (!category) throw new Error("Habit category is required");

  const slug = title.toLowerCase().replace(/\s+/g, "-");

  return {
    title,
    icon: icon || "🔥",
    category,
    target: target || 1,
    slug,
    startDate,
  };
};

export const toggleCompletion = async (habitId, date) => {
  const existing = await prisma.habitEntry.findUnique({
    where: { habitId_date: { habitId, date } },
  });

  if (existing) {
    await prisma.habitEntry.delete({
      where: { id: existing.id },
    });
    return false;
  } else {
    await prisma.habitEntry.create({
      data: { habitId, date },
    });
    return true;
  }
};
