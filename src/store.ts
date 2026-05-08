import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { del as idbDel, get as idbGet, set as idbSet } from 'idb-keyval';
import type {
  ActionType,
  Alert,
  Case,
  LogEntry,
  OutcomeTier,
  Resolution,
  VerdictTier,
} from './types';
import { alerts as seedAlerts, cases as seedCases, logs as seedLogs } from './data/day1';

type TriageAction = 'investigate' | 'dismiss';

const ACTION_ORDER: ActionType[] = ['ignore', 'warn', 'escalate', 'terminate'];

const SEED_DEPTS = ['marketing', 'engineering', 'sales', 'finance', 'hr'];

const seedMorale = (): Record<string, number> =>
  Object.fromEntries(SEED_DEPTS.map((d) => [d, 70]));

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export function evaluate(
  caseDef: Case,
  pinnedClueIds: string[],
  action: ActionType,
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

  return {
    caseId: caseDef.id,
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
  cases: Case[];
  pinnedClueIds: string[];
  resolutions: Resolution[];

  triage: (id: string, action: TriageAction) => void;
  togglePin: (logId: string) => void;
  decide: (caseId: string, action: ActionType) => void;
  reset: () => void;
}

const buildInitialState = () => ({
  day: 1,
  attention: 10,
  attentionMax: 10,
  trust: 60,
  risk: 20,
  morale: seedMorale(),
  alerts: seedAlerts,
  logs: seedLogs,
  cases: seedCases,
  pinnedClueIds: [] as string[],
  resolutions: [] as Resolution[],
});

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

          const resolution = evaluate(caseDef, s.pinnedClueIds, action);

          const nextMorale = { ...s.morale };
          for (const [dept, delta] of Object.entries(resolution.moraleDeltas)) {
            nextMorale[dept] = clamp((nextMorale[dept] ?? 70) + delta, 0, 100);
          }

          return {
            resolutions: [...s.resolutions, resolution],
            trust: clamp(s.trust + resolution.trustDelta, 0, 100),
            risk: clamp(s.risk + resolution.riskDelta, 0, 100),
            morale: nextMorale,
            pinnedClueIds: [],
            alerts: s.alerts.map((a) =>
              a.caseId === caseId && a.triaged === 'pending'
                ? { ...a, triaged: 'dismissed' }
                : a,
            ),
          };
        }),

      reset: () => set(buildInitialState()),
    }),
    {
      name: 'shadow-it/v1',
      storage: createJSONStorage(() => idbStorage),
      version: 1,
    },
  ),
);

export const selectActiveCase = (s: State): Case | null =>
  s.cases.find((c) => !s.resolutions.some((r) => r.caseId === c.id)) ?? null;

export const selectLastResolution = (s: State): Resolution | null =>
  s.resolutions[s.resolutions.length - 1] ?? null;
