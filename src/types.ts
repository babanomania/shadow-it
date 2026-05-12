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

export interface EmailThread {
  id: string;
  ts: string;
  from: string;
  fromName: string;
  to: string;
  subject: string;
  preview: string;
  body: string;
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
  /** Optional pointer to the underlying log/email this alert summarises.
   *  When present, the player can pin the alert directly from the inbox. */
  clueId?: string;
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
  /** Meter-impact multiplier. Anchor (hand-authored) cases default to 1.
   *  Procedural filler cases run at ~0.25 so 100 days don't pin the meters. */
  weight?: number;
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
  emails: EmailThread[];
  cases: Case[];
}

export type Status = 'playing' | 'day-end' | 'game-over' | 'won';
