import { calculateStreak } from '../domain/habit.js';

/**
 * Helper: returns a UTC-midnight Date that is N days before a base date.
 * Using UTC avoids daylight-saving-time edge cases where a "day" is not
 * exactly 86,400,000ms, which would cause off-by-one failures.
 */
const daysAgo = (base: Date, n: number): Date => {
  const d = new Date(base);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
};

describe('calculateStreak — pure unit tests (no DB)', () => {
  // Fixed reference date so tests are never time-dependent.
  // The function receives this as the "today" anchor for streak counting.
  const today = new Date('2026-02-25T00:00:00.000Z');

  // ── Zero cases ───────────────────────────────────────────────────────────

  test('returns 0 for an empty entries array', () => {
    expect(calculateStreak([], today)).toBe(0);
  });

  test('returns 0 when the most recent entry is 2 or more days ago', () => {
    const entries = [daysAgo(today, 2)];
    expect(calculateStreak(entries, today)).toBe(0);
  });

  test('returns 0 when all entries are far in the past', () => {
    const entries = [daysAgo(today, 5), daysAgo(today, 6), daysAgo(today, 7)];
    expect(calculateStreak(entries, today)).toBe(0);
  });

  // ── Single-entry cases ───────────────────────────────────────────────────

  test('returns 1 for a single entry completed today', () => {
    const entries = [daysAgo(today, 0)];
    expect(calculateStreak(entries, today)).toBe(1);
  });

  test('returns 1 for a single entry completed yesterday', () => {
    // Yesterday is within the allowed 1-day window from the reference date
    const entries = [daysAgo(today, 1)];
    expect(calculateStreak(entries, today)).toBe(1);
  });

  // ── Consecutive streak cases ─────────────────────────────────────────────

  test('returns 2 for today and yesterday', () => {
    const entries = [daysAgo(today, 0), daysAgo(today, 1)];
    expect(calculateStreak(entries, today)).toBe(2);
  });

  test('returns 3 for three consecutive days', () => {
    const entries = [daysAgo(today, 0), daysAgo(today, 1), daysAgo(today, 2)];
    expect(calculateStreak(entries, today)).toBe(3);
  });

  test('counts a long consecutive streak of 10 days correctly', () => {
    const entries = Array.from({ length: 10 }, (_, i) => daysAgo(today, i));
    expect(calculateStreak(entries, today)).toBe(10);
  });

  // ── Gap / break cases ────────────────────────────────────────────────────

  test('breaks the streak at the first gap and only counts the recent run', () => {
    // Today and yesterday are consecutive, then a gap (day 3 missing), then older entries
    const entries = [
      daysAgo(today, 0),
      daysAgo(today, 1),
      daysAgo(today, 3), // gap — day 2 is missing
      daysAgo(today, 4),
    ];
    expect(calculateStreak(entries, today)).toBe(2);
  });

  test('stops counting exactly at the break point in a longer streak', () => {
    // 5 consecutive days then a skip to day 6
    const entries = [
      daysAgo(today, 0),
      daysAgo(today, 1),
      daysAgo(today, 2),
      daysAgo(today, 3),
      daysAgo(today, 4),
      daysAgo(today, 6), // day 5 is missing — streak should stop at 5
    ];
    expect(calculateStreak(entries, today)).toBe(5);
  });

  test('ignores trailing entries after the streak breaks', () => {
    // Only today is recent; the subsequent entries have a large gap
    const entries = [
      daysAgo(today, 0),
      daysAgo(today, 10),
      daysAgo(today, 11),
      daysAgo(today, 12),
    ];
    expect(calculateStreak(entries, today)).toBe(1);
  });
});
