// Deterministic procedural day generator for the ~75 filler days
// between hand-authored anchors. Seeded by day number, so the same
// day always produces the same content (cross-session replay works).

import type {
  Day,
  Case,
  Alert,
  LogEntry,
  EmailThread,
  Archetype,
  ActionType,
  OutcomeTier,
  Severity,
} from '../types';
import {
  FIRST_NAMES,
  LAST_NAMES,
  DEPTS,
  VENDORS_AI,
  VENDORS_SAAS,
  VENDORS_CLOUD,
  EXTERNAL_DOMAINS_BENIGN,
  PARTNER_NAMES,
  NOISE_EMAIL_SUBJECTS,
  NOISE_LOG_TEMPLATES,
} from './pools';

// ── seeded RNG ──────────────────────────────────────────────
// mulberry32 — small, deterministic, decent distribution
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(arr: readonly T[], rng: () => number): T =>
  arr[Math.floor(rng() * arr.length)];

const padTs = (h: number, m: number, s: number) =>
  `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

// ── archetype templates (minor-stakes only) ─────────────────
// Insider-exfil / leak-deliberate are reserved for anchor days.

type ArchetypeSpec = {
  archetype: Archetype;
  buildCaseLog: (ctx: GenCtx) => Omit<LogEntry, 'id' | 'ts'>;
  alertTitle: (ctx: GenCtx) => string;
  alertPreview: (ctx: GenCtx) => string;
  briefing: (ctx: GenCtx) => string;
  correctAction: ActionType;
  caseSeverity: Severity;
};

interface GenCtx {
  day: number;
  name: string;
  email: string;
  displayName: string;
  dept: string;
  vendor: string;
  partner: string;
}

const ARCHETYPE_SPECS: ArchetypeSpec[] = [
  {
    archetype: 'shadow-ai',
    caseSeverity: 'warn',
    correctAction: 'warn',
    buildCaseLog: (c) => ({
      service: 'expense',
      event: 'charge',
      user: c.email,
      detail: `vendor="${c.vendor}" amount=$${20 + Math.floor((c.vendor.length * 11) % 200)}.00 plan=personal`,
      severity: 'warn',
      caseId: `case-d${c.day}`,
    }),
    alertTitle: (c) => `Personal AI tool charge — ${c.dept}`,
    alertPreview: (c) => `${c.email} expensed ${c.vendor} on personal plan`,
    briefing: (c) =>
      `${c.displayName} (${c.dept}) expensed a personal-tier subscription to ${c.vendor}. No data egress linked yet. Worth a friendly nudge toward the corp tier before it becomes habit.`,
  },
  {
    archetype: 'leak-accidental',
    caseSeverity: 'warn',
    correctAction: 'warn',
    buildCaseLog: (c) => ({
      service: 'github',
      event: 'gist.publish',
      user: c.email,
      detail: `gist_id=${c.day.toString(16)}${c.name.slice(0, 3)} visibility=public files=["scratch.${c.day % 2 === 0 ? 'py' : 'sh'}"] size=${1 + (c.day % 5)}.${c.day % 9}KB`,
      severity: 'warn',
      caseId: `case-d${c.day}`,
    }),
    alertTitle: (c) => `Public gist published by ${c.dept}`,
    alertPreview: (c) => `${c.email} pushed a snippet to a public gist`,
    briefing: (c) =>
      `${c.displayName} (${c.dept}) pushed a scratch file to a public gist. Secret scanner came back clean — no live tokens — but the snippet referenced internal endpoint names. Low blast radius, easy to remind.`,
  },
  {
    archetype: 'shadow-cloud',
    caseSeverity: 'warn',
    correctAction: 'warn',
    buildCaseLog: (c) => ({
      service: 'iam',
      event: 'role.create',
      user: c.email,
      detail: `target=staging-readonly trust=external partner="${c.partner}" ttl=30d`,
      severity: 'warn',
      caseId: `case-d${c.day}`,
    }),
    alertTitle: (c) => `New external IAM role — ${c.dept}`,
    alertPreview: (c) => `${c.email} granted ${c.partner} staging read access`,
    briefing: (c) =>
      `${c.displayName} (${c.dept}) granted ${c.partner} a 30-day staging-readonly role. Scope is tight and TTL is set; this is the kind of thing that's fine if it's tracked, less fine if it accumulates. Nudge and log.`,
  },
  {
    archetype: 'exposed-api',
    caseSeverity: 'warn',
    correctAction: 'ignore',
    buildCaseLog: (c) => ({
      service: 'api',
      event: 'token.create',
      user: c.email,
      detail: `token=integration-${c.day} scope=read ttl=7d partner="${c.partner}" note="signed DPA on file"`,
      severity: 'info',
      caseId: `case-d${c.day}`,
    }),
    alertTitle: (c) => `Short-lived API token issued — ${c.dept}`,
    alertPreview: (c) => `${c.email} minted a 7-day token for ${c.partner}`,
    briefing: (c) =>
      `${c.displayName} (${c.dept}) issued a 7-day read-only API token to ${c.partner}. Token is scoped, TTL is short, and there's a signed DPA in the binder. The alert fired because it matches a pattern, not because anything is wrong.`,
  },
];

// Outcome narratives are templated; placeholders {name}/{dept} are filled in.
const TEMPLATED_NARRATIVES: Record<ActionType, Record<OutcomeTier, string>> = {
  warn: {
    vindicated:
      'You pull the full thread, write a quiet note to {name} and their lead, and post a team-wide reminder without naming names. {dept} appreciates the proportional handling.',
    'right-partial':
      'You warn on the surface signal. {name} acknowledges. A few days later more context surfaces but the call holds.',
    lucky:
      'You warn before pulling the supporting evidence. The call lands; the board notes the timing in passing.',
    'missed-soft':
      'Six weeks later the same pattern from {name} repeats with worse blast radius. The original alert is still in your inbox, dismissed.',
    overreacted:
      "You escalated past the proportionality line. {name}'s manager pushes back; the board flags that warn was the right tier.",
  },
  ignore: {
    vindicated:
      'You pull the signals, confirm the pattern is benign, move on. Quiet wins are still wins — {dept} notices you didn\'t cry wolf.',
    'right-partial':
      "You ignore on partial evidence and you're right. Board notes that the decision happened before the audit closed.",
    lucky:
      "You ignored on a hunch and the audit later agrees. Right call, not for the right reason.",
    'missed-soft':
      "You warned on what turned out to be a benign integration. {name} hears about it secondhand. {dept} goes quieter around you.",
    overreacted:
      'You escalated/terminated on a properly-scoped, DPA-backed integration. {name} lawyers up. The board overturns it and notes the overreach.',
  },
  escalate: {
    vindicated:
      'Legal opens the loop with {name} and their lead. The contour matches their suspicion; the partner cooperates. {dept} morale takes a small hit but the trust gain holds.',
    'right-partial':
      'You escalate without the full trail. Legal works it; settlement is messier than it had to be.',
    lucky:
      "Escalation lands on instinct. The audit catches up and confirms. Board notes you got there first — but not why.",
    'missed-soft':
      'You warned when escalation was warranted. The slow burn becomes a fast one. Trust takes a hit; the trail is yours.',
    overreacted:
      'You terminated where escalation was the call. {name} and their lead push back hard. The board agrees the issue was real and the response was not.',
  },
  terminate: {
    vindicated:
      'You walk {name} out with security. The exit interview becomes a deposition. The board notes this is the cleanest insider response they\'ve seen.',
    'right-partial':
      "You terminate without the full trail. {name} lawyers up and claims context. Legal wins, but it costs more than it should have.",
    lucky:
      'You terminate on a hunch; the evidence backs you up after the fact. Right answer, but the board flags that you decided before pulling the receipts.',
    'missed-soft':
      'You escalated when termination was the call. The bleeding continues for another two weeks before the next signal forces your hand.',
    overreacted:
      'There is no harsher action available — termination is the strictest call in policy.',
  },
};

function fillTemplate(s: string, ctx: GenCtx): string {
  return s.replace(/{name}/g, ctx.displayName).replace(/{dept}/g, ctx.dept);
}

// ── main generator ──────────────────────────────────────────
export function generateFillerDay(dayNumber: number): Day {
  // Seed mixes the day number with a large prime so day 6 doesn't look like day 5+1.
  const rng = mulberry32(dayNumber * 2654435761);

  const archetypeSpec = ARCHETYPE_SPECS[dayNumber % ARCHETYPE_SPECS.length];
  const first = pick(FIRST_NAMES, rng);
  const last = pick(LAST_NAMES, rng);
  const dept = pick(DEPTS, rng);
  const partner = `${pick(PARTNER_NAMES, rng)}-llc`;

  // Vendor selection depends on archetype so the cover-story is plausible.
  let vendor: string;
  switch (archetypeSpec.archetype) {
    case 'shadow-ai':
      vendor = pick(VENDORS_AI, rng);
      break;
    case 'shadow-cloud':
      vendor = pick(VENDORS_CLOUD, rng);
      break;
    default:
      vendor = pick(VENDORS_SAAS, rng);
  }

  const ctx: GenCtx = {
    day: dayNumber,
    name: first,
    email: `${first}@helix.corp`,
    displayName: `${first[0].toUpperCase()}${first.slice(1)} ${last[0].toUpperCase()}${last.slice(1)}`,
    dept,
    vendor,
    partner,
  };

  // ── build logs ────────────────────────────────────────────
  const logs: LogEntry[] = [];
  const caseLogId = `d${dayNumber}-c1`;

  // Noise logs — ~12 of them, spread across the workday.
  const noiseCount = 10 + Math.floor(rng() * 5);
  for (let i = 0; i < noiseCount; i++) {
    const template = pick(NOISE_LOG_TEMPLATES, rng);
    const noiseName = pick(FIRST_NAMES, rng);
    const noiseVendor = pick(VENDORS_SAAS, rng);
    const h = 7 + Math.floor((i / noiseCount) * 11);
    const m = Math.floor(rng() * 60);
    const s = Math.floor(rng() * 60);
    const parts = template(noiseName, noiseVendor);
    logs.push({
      id: `d${dayNumber}-n${i}`,
      ts: padTs(h, m, s),
      service: parts.service,
      event: parts.event,
      user: parts.user,
      detail: parts.detail,
      severity: 'info',
      caseId: null,
    });
  }

  // Case log slots in around mid-morning.
  const caseLogPayload = archetypeSpec.buildCaseLog(ctx);
  const caseHour = 9 + Math.floor(rng() * 4);
  const caseMin = Math.floor(rng() * 60);
  const caseLog: LogEntry = {
    id: caseLogId,
    ts: padTs(caseHour, caseMin, Math.floor(rng() * 60)),
    ...caseLogPayload,
  };
  logs.push(caseLog);

  // Sort chronologically so the surface view reads naturally.
  logs.sort((a, b) => a.ts.localeCompare(b.ts));

  // ── build emails ─────────────────────────────────────────
  const emails: EmailThread[] = [];
  const noiseEmailCount = 3 + Math.floor(rng() * 3);
  for (let i = 0; i < noiseEmailCount; i++) {
    const sender = pick(FIRST_NAMES, rng);
    const subj = pick(NOISE_EMAIL_SUBJECTS, rng);
    const h = 8 + Math.floor((i / noiseEmailCount) * 9);
    const m = Math.floor(rng() * 60);
    emails.push({
      id: `d${dayNumber}-ne${i}`,
      ts: padTs(h, m, 0),
      from: `${sender}@helix.corp`,
      fromName: `${sender[0].toUpperCase()}${sender.slice(1)}`,
      to: 'all-hands@helix.corp',
      subject: subj,
      preview: subj.slice(0, 60),
      body: `${subj}.\n\nDetails in the linked doc.`,
      severity: 'info',
      caseId: null,
    });
  }
  emails.sort((a, b) => a.ts.localeCompare(b.ts));

  // ── build alerts ────────────────────────────────────────
  const alerts: Alert[] = [];

  // Primary case alert.
  alerts.push({
    id: `d${dayNumber}-a-case`,
    title: archetypeSpec.alertTitle(ctx),
    surface: archetypeSpec.archetype === 'shadow-ai' ? 'expenses' : 'logs',
    severity: archetypeSpec.caseSeverity,
    preview: archetypeSpec.alertPreview(ctx),
    caseId: `case-d${dayNumber}`,
    clueId: caseLogId,
    triaged: 'pending',
  });

  // 3-5 noise alerts, tied to actual noise logs/emails so pinning works.
  const noiseAlertCount = 3 + Math.floor(rng() * 3);
  for (let i = 0; i < noiseAlertCount; i++) {
    const source = logs[i % logs.length];
    alerts.push({
      id: `d${dayNumber}-a-n${i}`,
      title: noiseAlertTitle(source),
      surface: 'logs',
      severity: 'info',
      preview: source.detail.slice(0, 64),
      caseId: null,
      clueId: source.id,
      triaged: 'pending',
    });
  }

  // ── build the case ─────────────────────────────────────
  const caseDef: Case = {
    id: `case-d${dayNumber}`,
    title: `${ctx.displayName.split(' ')[0]}'s ${shortLabel(archetypeSpec.archetype)}`,
    archetype: archetypeSpec.archetype,
    perpetrator: `${ctx.displayName} · ${capitalize(ctx.dept)}`,
    perpetratorDept: ctx.dept,
    briefing: archetypeSpec.briefing(ctx),
    requiredClueIds: [caseLogId],
    correctAction: archetypeSpec.correctAction,
    weight: 0.25,
    narratives: Object.fromEntries(
      (Object.entries(TEMPLATED_NARRATIVES[archetypeSpec.correctAction]) as Array<
        [OutcomeTier, string]
      >).map(([tier, str]) => [tier, fillTemplate(str, ctx)]),
    ) as Record<OutcomeTier, string>,
  };

  return {
    number: dayNumber,
    attention: 6 + Math.floor(rng() * 3), // 6-8
    alerts,
    logs,
    emails,
    cases: [caseDef],
  };
}

function noiseAlertTitle(log: LogEntry): string {
  switch (log.service) {
    case 'auth':
      return log.event === 'login' ? 'Routine login' : 'Routine logout';
    case 'expense':
      return 'Routine vendor charge';
    case 'traffic':
      return log.event === 'egress' ? 'Outbound traffic — known dest' : 'Inbound webhook';
    case 'api':
      return 'API read — internal caller';
    case 'pagerduty':
      return 'Oncall handoff';
    case 'iam':
      return 'Role expired (ttl)';
    default:
      return 'Routine event';
  }
}

function shortLabel(a: Archetype): string {
  switch (a) {
    case 'shadow-ai':
      return 'side AI tool';
    case 'shadow-cloud':
      return 'partner role grant';
    case 'leak-accidental':
      return 'public gist';
    case 'exposed-api':
      return 'short-lived token';
    case 'leak-deliberate':
      return 'deliberate leak';
    case 'insider-exfil':
      return 'exit-week pull';
  }
}

function capitalize(s: string): string {
  return s[0].toUpperCase() + s.slice(1);
}

// Re-export available domains so tests / debug tools can use them.
export const _internal = {
  EXTERNAL_DOMAINS_BENIGN,
};
