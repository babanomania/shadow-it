import { create } from 'zustand';
import type { Alert, LogEntry } from './types';
import { alerts as seedAlerts, logs as seedLogs } from './data/day1';

type TriageAction = 'investigate' | 'dismiss';

interface State {
  day: number;
  attention: number;
  attentionMax: number;
  alerts: Alert[];
  logs: LogEntry[];
  pinnedClueIds: string[];

  triage: (id: string, action: TriageAction) => void;
  togglePin: (logId: string) => void;
}

export const useStore = create<State>((set) => ({
  day: 1,
  attention: 10,
  attentionMax: 10,
  alerts: seedAlerts,
  logs: seedLogs,
  pinnedClueIds: [],

  triage: (id, action) =>
    set((s) => ({
      alerts: s.alerts.map((a) =>
        a.id === id
          ? { ...a, triaged: action === 'investigate' ? 'investigated' : 'dismissed' }
          : a,
      ),
      // investigating costs attention; dismissing is free
      attention: action === 'investigate' ? Math.max(0, s.attention - 1) : s.attention,
    })),

  togglePin: (logId) =>
    set((s) => ({
      pinnedClueIds: s.pinnedClueIds.includes(logId)
        ? s.pinnedClueIds.filter((id) => id !== logId)
        : [...s.pinnedClueIds, logId],
    })),
}));
