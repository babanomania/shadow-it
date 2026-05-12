import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { del as idbDel, get as idbGet, set as idbSet } from 'idb-keyval';
import type {
  ActionType,
  Alert,
  Case,
  EmailThread,
  LogEntry,
  OutcomeTier,
  Resolution,
  Status,
  VerdictTier,
} from './types';
import { days } from './data';

type TriageAction = 'investigate' | 'dismiss';
type AlertOutcome = 'investigated' | 'dismissed';

const ACTION_ORDER: ActionType[] = ['ignore', 'warn', 'escalate', 'terminate'];

const SEED_DEPTS = ['marketing', 'engineering', 'sales', 'finance', 'hr'];

const seedMorale = (): Record<string, number> =>
  Object.fromEntries(SEED_DEPTS.map((d) => [d, 70]));

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export function evaluate(
  caseDef: Case,
  pinnedClueIds: string[],
  action: ActionType,
  day: number,
): Resolution {
  const matched = pinnedClueIds.filter((id) => caseDef.requiredClueIds.includes(id)).length;
  const total = caseDef.requiredClueIds.length;

  let verdictTier: VerdictTier;
  if (matched === 0) verdictTier = 'no-evidence';
  else if (matched < total) verdictTier = 'partial';
  else verdictTier = 'proved';

  const chosenIdx = ACTION_ORDER.indexOf(action);
  const correctIdx = ACTION_ORDER.indexOf(caseDef.correctAction);
  const distance = Math.abs(chosenIdx - correctIdx);
  const direction =
    chosenIdx === correctIdx ? 'right' : chosenIdx < correctIdx ? 'soft' : 'harsh';

  let outcomeTier: OutcomeTier;
  let trustDelta = 0;
  let riskDelta = 0;
  let perpMoraleDelta = 0;

  if (direction === 'right') {
    if (verdictTier === 'proved') {
      outcomeTier = 'vindicated';
      trustDelta = 12;
      riskDelta = -25;
      perpMoraleDelta = -15;
    } else if (verdictTier === 'partial') {
      outcomeTier = 'right-partial';
      trustDelta = 5;
      riskDelta = -12;
      perpMoraleDelta = -8;
    } else {
      outcomeTier = 'lucky';
      trustDelta = 2;
      riskDelta = -8;
      perpMoraleDelta = -3;
    }
  } else if (direction === 'soft') {
    outcomeTier = 'missed-soft';
    trustDelta = -3 * distance;
    riskDelta = 8 * distance;
    perpMoraleDelta = 2;
  } else {
    outcomeTier = 'overreacted';
    trustDelta = -4 * distance;
    riskDelta = -3;
    perpMoraleDelta = -10 * distance;
  }

  // Procedural filler cases run at fractional weight so 100 days of
  // routine decisions don't pin the meters at 0/100. Anchor cases
  // (default weight 1) keep their full swing.
  const w = caseDef.weight ?? 1;
  trustDelta = Math.round(trustDelta * w);
  riskDelta = Math.round(riskDelta * w);
  perpMoraleDelta = Math.round(perpMoraleDelta * w);

  return {
    caseId: caseDef.id,
    day,
    action,
    verdictTier,
    outcomeTier,
    trustDelta,
    riskDelta,
    moraleDeltas: { [caseDef.perpetratorDept]: perpMoraleDelta },
    narrative: caseDef.narratives[outcomeTier],
  };
}

interface State {
  day: number;
  attention: number;
  attentionMax: number;
  trust: number;
  risk: number;
  morale: Record<string, number>;
  alerts: Alert[];
  logs: LogEntry[];
  emails: EmailThread[];
  cases: Case[];
  pinnedClueIds: string[];
  resolutions: Resolution[];
  status: Status;

  triage: (id: string, action: TriageAction) => void;
  togglePin: (logId: string) => void;
  decide: (caseId: string, action: ActionType) => void;
  nextDay: () => void;
  reset: () => void;
}

const buildDayState = (dayNumber: number) => {
  const day = days[dayNumber - 1];
  if (!day) {
    return {
      day: dayNumber,
      attention: 0,
      attentionMax: 0,
      alerts: [] as Alert[],
      logs: [] as LogEntry[],
      emails: [] as EmailThread[],
      cases: [] as Case[],
    };
  }
  return {
    day: day.number,
    attention: day.attention,
    attentionMax: day.attention,
    alerts: day.alerts,
    logs: day.logs,
    emails: day.emails,
    cases: day.cases,
  };
};

const buildInitialState = () => ({
  ...buildDayState(1),
  trust: 60,
  risk: 20,
  morale: seedMorale(),
  pinnedClueIds: [] as string[],
  resolutions: [] as Resolution[],
  status: 'playing' as Status,
});

const triageActionsFrom = (alerts: Alert[]): Record<string, AlertOutcome> => {
  const acc: Record<string, AlertOutcome> = {};
  for (const a of alerts) {
    if (a.triaged !== 'pending') acc[a.id] = a.triaged;
  }
  return acc;
};

const applyTriageActions = (
  alerts: Alert[],
  triageActions: Record<string, AlertOutcome> | undefined,
): Alert[] => {
  if (!triageActions) return alerts;
  return alerts.map((a) => ({
    ...a,
    triaged: triageActions[a.id] ?? a.triaged,
  }));
};

type PersistedShape = {
  day: number;
  attention: number;
  trust: number;
  risk: number;
  morale: Record<string, number>;
  pinnedClueIds: string[];
  resolutions: Resolution[];
  status: Status;
  triageActions: Record<string, AlertOutcome>;
};

const idbStorage: StateStorage = {
  getItem: async (name) => {
    const value = await idbGet<string>(name);
    return value ?? null;
  },
  setItem: async (name, value) => {
    await idbSet(name, value);
  },
  removeItem: async (name) => {
    await idbDel(name);
  },
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      ...buildInitialState(),

      triage: (id, action) =>
        set((s) => ({
          alerts: s.alerts.map((a) =>
            a.id === id
              ? { ...a, triaged: action === 'investigate' ? 'investigated' : 'dismissed' }
              : a,
          ),
          attention: action === 'investigate' ? Math.max(0, s.attention - 1) : s.attention,
        })),

      togglePin: (logId) =>
        set((s) => ({
          pinnedClueIds: s.pinnedClueIds.includes(logId)
            ? s.pinnedClueIds.filter((id) => id !== logId)
            : [...s.pinnedClueIds, logId],
        })),

      decide: (caseId, action) =>
        set((s) => {
          const caseDef = s.cases.find((c) => c.id === caseId);
          if (!caseDef) return s;
          if (s.resolutions.some((r) => r.caseId === caseId)) return s;

          const resolution = evaluate(caseDef, s.pinnedClueIds, action, s.day);

          const nextMorale = { ...s.morale };
          for (const [dept, delta] of Object.entries(resolution.moraleDeltas)) {
            nextMorale[dept] = clamp((nextMorale[dept] ?? 70) + delta, 0, 100);
          }

          const nextTrust = clamp(s.trust + resolution.trustDelta, 0, 100);
          const nextRisk = clamp(s.risk + resolution.riskDelta, 0, 100);

          const newResolutions = [...s.resolutions, resolution];
          const allResolved = s.cases.every((c) =>
            newResolutions.some((r) => r.caseId === c.id),
          );

          let nextStatus: Status;
          if (nextTrust <= 0 || nextRisk >= 100) nextStatus = 'game-over';
          else if (allResolved) nextStatus = 'day-end';
          else nextStatus = 'playing';

          return {
            resolutions: newResolutions,
            trust: nextTrust,
            risk: nextRisk,
            morale: nextMorale,
            pinnedClueIds: [],
            status: nextStatus,
            alerts: s.alerts.map((a) =>
              a.caseId === caseId && a.triaged === 'pending'
                ? { ...a, triaged: 'dismissed' }
                : a,
            ),
          };
        }),

      nextDay: () =>
        set((s) => {
          const next = s.day + 1;
          if (next > days.length) {
            return { status: 'won' as Status };
          }
          return {
            ...buildDayState(next),
            pinnedClueIds: [],
            status: 'playing' as Status,
          };
        }),

      reset: () => set(buildInitialState()),
    }),
    {
      name: 'shadow-it/v1',
      storage: createJSONStorage(() => idbStorage),
      version: 3,
      partialize: (state): PersistedShape => ({
        day: state.day,
        attention: state.attention,
        trust: state.trust,
        risk: state.risk,
        morale: state.morale,
        pinnedClueIds: state.pinnedClueIds,
        resolutions: state.resolutions,
        status: state.status,
        triageActions: triageActionsFrom(state.alerts),
      }),
      merge: (persisted, current) => {
        const p = (persisted as Partial<PersistedShape> | null) ?? {};
        const dayNum = typeof p.day === 'number' ? p.day : current.day;
        const dayContent = buildDayState(dayNum);
        return {
          ...current,
          ...dayContent,
          attention:
            typeof p.attention === 'number' ? p.attention : dayContent.attention,
          alerts: applyTriageActions(dayContent.alerts, p.triageActions),
          trust: typeof p.trust === 'number' ? p.trust : current.trust,
          risk: typeof p.risk === 'number' ? p.risk : current.risk,
          morale: p.morale ?? current.morale,
          pinnedClueIds: p.pinnedClueIds ?? current.pinnedClueIds,
          resolutions: p.resolutions ?? current.resolutions,
          status: p.status ?? current.status,
        };
      },
      migrate: (persistedState, version) => {
        if (version === 2 && persistedState && typeof persistedState === 'object') {
          const old = persistedState as { alerts?: Alert[] } & Record<string, unknown>;
          return {
            ...old,
            triageActions: triageActionsFrom(old.alerts ?? []),
          };
        }
        return persistedState;
      },
    },
  ),
);

export const selectActiveCase = (s: State): Case | null =>
  s.cases.find((c) => !s.resolutions.some((r) => r.caseId === c.id)) ?? null;

export const selectLastResolution = (s: State): Resolution | null =>
  s.resolutions[s.resolutions.length - 1] ?? null;

export const selectCurrentDayResolution = (s: State): Resolution | null => {
  const forDay = s.resolutions.filter((r) => r.day === s.day);
  return forDay[forDay.length - 1] ?? null;
};
