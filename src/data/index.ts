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
import { ARCS_BY_RESOLVE_DAY, arcToCase, getArcsTouchingDay } from './arcs';

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

// Layer arc beats (cross-day cases) on top of the base day.
function augmentWithArcs(base: Day, n: number): Day {
  const touching = getArcsTouchingDay(n);
  if (touching.length === 0) return base;

  let alerts = base.alerts;
  let logs = base.logs;
  let emails = base.emails;

  for (const arc of touching) {
    const beat = arc.beats.find((b) => b.day === n);
    if (!beat) continue;
    if (beat.alerts) alerts = [...alerts, ...beat.alerts];
    if (beat.logs) logs = [...logs, ...beat.logs];
    if (beat.emails) emails = [...emails, ...beat.emails];
  }

  // Append arc cases to days where arcs resolve.
  const resolvingArcs = ARCS_BY_RESOLVE_DAY[n] ?? [];
  const cases =
    resolvingArcs.length > 0
      ? [...base.cases, ...resolvingArcs.map(arcToCase)]
      : base.cases;

  // Re-sort logs/emails by timestamp so arc beats interleave naturally.
  const sortedLogs = [...logs].sort((a, b) => a.ts.localeCompare(b.ts));
  const sortedEmails = [...emails].sort((a, b) => a.ts.localeCompare(b.ts));

  return {
    ...base,
    alerts,
    logs: sortedLogs,
    emails: sortedEmails,
    cases,
  };
}

export const days: Day[] = Array.from({ length: TOTAL_DAYS }, (_, i) => {
  const n = i + 1;
  const base = ANCHORS[n] ?? generateFillerDay(n);
  return augmentWithArcs(base, n);
});

// ── quarter helpers ──────────────────────────────────────────
export const TRUST_BASELINE = 55;
export const RISK_BASELINE = 25;
export const REGRESSION_FACTOR = 0.4;

export function isLastDayOfQuarter(day: number): boolean {
  return day % DAYS_PER_QUARTER === 0 && day < TOTAL_DAYS;
}

export function quarterOf(day: number): number {
  return Math.ceil(day / DAYS_PER_QUARTER);
}

/** Pull both meters toward their baselines by REGRESSION_FACTOR.
 *  Returns the post-regression values (still clamped 0..100). */
export function applyQuarterEndRegression(
  trust: number,
  risk: number,
): { trust: number; risk: number } {
  const trustDelta = Math.round((trust - TRUST_BASELINE) * REGRESSION_FACTOR);
  const riskDelta = Math.round((risk - RISK_BASELINE) * REGRESSION_FACTOR);
  return {
    trust: Math.max(0, Math.min(100, trust - trustDelta)),
    risk: Math.max(0, Math.min(100, risk - riskDelta)),
  };
}

// Re-export arc helpers for components.
export { ARCS, getArcsTouchingDay } from './arcs';
