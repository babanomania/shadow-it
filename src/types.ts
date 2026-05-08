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

export interface Case {
  id: string;
  title: string;
  archetype: Archetype;
  perpetrator: string;
}
