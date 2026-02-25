import { AppError } from "../utils/errors.js";

export const createHabit = ({
  title,
  icon,
  category,
  target,
  startDate = new Date(),
}) => {
  if (!title) throw new AppError("Habit title is required", 400);
  if (!category) throw new AppError("Habit category is required", 400);
  if (!icon) throw new AppError("Habit icon is required", 400);

  const slug = title.toLowerCase().replace(/\s+/g, "-");

  return {
    title,
    icon,
    category,
    target: target || 1,
    slug,
    startDate,
  };
};

/**
 * Pure streak calculation — no I/O, no side effects.
 * @param {Date[]} entries - All completion dates for the habit, sorted descending.
 * @param {Date}   referenceDate - The date of the toggle action (UTC midnight).
 * @returns {number} The current streak length.
 */
export const calculateStreak = (entries, referenceDate) => {
  let streak = 0;
  let prevDate = null;

  for (const entry of entries) {
    const entryDate = new Date(entry);
    entryDate.setUTCHours(0, 0, 0, 0); // UTC — Prisma stores dates in UTC

    if (prevDate === null) {
      // First entry must be today or yesterday relative to the reference date
      const diffDays = (referenceDate - entryDate) / (1000 * 60 * 60 * 24);
      if (diffDays <= 1) {
        streak = 1;
        prevDate = entryDate;
      } else {
        break;
      }
    } else {
      // Each subsequent entry must be exactly one day before the previous
      const diffDays = (prevDate - entryDate) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) {
        streak++;
        prevDate = entryDate;
      } else {
        break;
      }
    }
  }

  return streak;
};
