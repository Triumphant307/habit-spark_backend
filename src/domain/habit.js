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
    // Remove the completion
    await prisma.habitEntry.delete({ where: { id: existing.id } });
  } else {
    // Add the completion
    await prisma.habitEntry.create({ data: { habitId, date } });
  }

  // --- Recalculate streak ---
  const entries = await prisma.habitEntry.findMany({
    where: { habitId },
    orderBy: { date: "desc" },
  });

  let streak = 0;
  let prevDate = null;

  const today = new Date(date);
  today.setHours(0, 0, 0, 0);

  for (const entry of entries) {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);

    if (prevDate === null) {
      // First iteration
      if ((today - entryDate) / (1000 * 60 * 60 * 24) <= 1) {
        streak = 1;
        prevDate = entryDate;
      } else break;
    } else {
      // Check if previous date - current date = 1 day
      const diffDays = (prevDate - entryDate) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) {
        streak++;
        prevDate = entryDate;
      } else break;
    }
  }

  // Update habit streak
  await prisma.habit.update({
    where: { id: habitId },
    data: { streak },
  });

  return { isNowCompleted: !existing, streak };
};