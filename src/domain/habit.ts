// CreateHabitInput describes the raw data that createHabit accepts
interface CreateHabitInput {
  title: string;
  icon: string;
  category: string;
  userId: string;
  target?: number;
  startDate?: Date;
}

// HabitData is what createHabit returns — the shaped object ready for persistence
export interface HabitData {
  title: string;
  icon: string;
  category: string;
  target: number;
  slug: string;
  startDate: Date;
  userId: string;
}

export const createHabit = ({
  title,
  icon,
  category,
  userId,
  target,
  startDate = new Date(),
}: CreateHabitInput): HabitData => {
  const slug = title.toLowerCase().replace(/\s+/g, '-');

  return {
    title,
    icon,
    category,
    target: target ?? 1,
    slug,
    startDate,
    userId,
  };
};

/**
 * Pure function — no I/O, no side effects, fully unit-testable.
 *
 * @param entries - Completion dates sorted descending (most recent first).
 *                  This matches the orderBy: { date: "desc" } from the repository.
 * @param referenceDate - Typically today at UTC midnight, used as the streak anchor.
 * @returns The current consecutive streak count.
 */
export const calculateStreak = (
  entries: Date[],
  referenceDate: Date,
): number => {
  let streak = 0;
  let prevDate: Date | null = null;

  for (const entry of entries) {
    const entryDate = new Date(entry);
    entryDate.setUTCHours(0, 0, 0, 0); // UTC — Prisma stores dates in UTC

    if (prevDate === null) {
      // First entry must be today or yesterday relative to the reference date
      const diffDays =
        (referenceDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays <= 1) {
        streak = 1;
        prevDate = entryDate;
      } else {
        break;
      }
    } else {
      // Each subsequent entry must be exactly one day before the previous
      const diffDays =
        (prevDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
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
