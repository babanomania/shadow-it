import type { Day } from '../types';
import { day1 } from './day1';
import { day2 } from './day2';
import { day3 } from './day3';
import { day4 } from './day4';
import { day5 } from './day5';
import { day10 } from './day10';
import { day25 } from './day25';
import { day50 } from './day50';
import { generateFillerDay } from './generator';

export const TOTAL_DAYS = 100;
export const DAYS_PER_QUARTER = 25;

// Hand-authored anchor days keyed by day number.
// Anchors get full meter weight (1.0); gaps are procedurally filled (0.25).
const ANCHORS: Record<number, Day> = {
  1: day1,
  2: day2,
  3: day3,
  4: day4,
  5: day5,
  10: day10,
  25: day25,
  50: day50,
};

export const isAnchorDay = (n: number): boolean => n in ANCHORS;

export const days: Day[] = Array.from({ length: TOTAL_DAYS }, (_, i) => {
  const n = i + 1;
  return ANCHORS[n] ?? generateFillerDay(n);
});
