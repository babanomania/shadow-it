export type Surface = 'logs' | 'emails' | 'expenses' | 'traffic';
export type Severity = 'info' | 'warn' | 'critical';

export type Archetype =
  | 'shadow-ai'
  | 'shadow-cloud'
  | 'exposed-api'
  | 'leak-accidental'
  | 'leak-deliberate'
  | 'insider-exfil';

export interface LogEntry {
  id: string;
  ts: string;
  service: string;
  event: string;
  user: string;
  detail: string;
  severity: Severity;
  caseId: string | null;
}

export interface Alert {
  id: string;
  title: string;
  surface: Surface;
  severity: Severity;
  preview: string;
  caseId: string | null;
  triaged: 'pending' | 'investigated' | 'dismissed';
}

export type ActionType = 'ignore' | 'warn' | 'escalate' | 'terminate';
export type VerdictTier = 'no-evidence' | 'partial' | 'proved';
export type OutcomeTier =
  | 'vindicated'
  | 'right-partial'
  | 'lucky'
  | 'missed-soft'
  | 'overreacted';

export interface Case {
  id: string;
  title: string;
  archetype: Archetype;
  perpetrator: string;
  perpetratorDept: string;
  briefing: string;
  requiredClueIds: string[];
  correctAction: ActionType;
  narratives: Record<OutcomeTier, string>;
}

export interface Resolution {
  caseId: string;
  day: number;
  action: ActionType;
  verdictTier: VerdictTier;
  outcomeTier: OutcomeTier;
  trustDelta: number;
  riskDelta: number;
  moraleDeltas: Record<string, number>;
  narrative: string;
}

export interface Day {
  number: number;
  attention: number;
  alerts: Alert[];
  logs: LogEntry[];
  cases: Case[];
}

export type Status = 'playing' | 'day-end' | 'game-over' | 'won';
