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
  /** If set, this clue belongs to a multi-day arc. Pins go to the arc's
   *  persistent pin set rather than the transient daily one. */
  arcId?: string;
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
  arcId?: string;
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
  /** When set, the alert is flagged as part of a multi-day arc thread. */
  arcId?: string;
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
  /** Set on the synthetic case injected on an arc's resolve day. The verdict
   *  engine pulls pinned clues from arcPins[arcId] instead of the transient set. */
  arcId?: string;
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

/** A beat is one day's worth of arc-tagged content injected into the day's surfaces. */
export interface ArcBeat {
  day: number;
  alerts?: Alert[];
  logs?: LogEntry[];
  emails?: EmailThread[];
}

/** Multi-day arc — a single case whose required clues live across N days.
 *  On the arc's resolveDay, the arc is injected as an extra Case alongside
 *  the day's daily case. Player must have pinned the arc clues across days. */
export interface ArcDef {
  id: string;
  title: string;
  archetype: Archetype;
  perpetrator: string;
  perpetratorDept: string;
  briefing: string;
  startDay: number;
  resolveDay: number;
  requiredClueIds: string[];
  correctAction: ActionType;
  weight: number;
  narratives: Record<OutcomeTier, string>;
  beats: ArcBeat[];
}

export type Status = 'playing' | 'day-end' | 'quarter-end' | 'game-over' | 'won';
