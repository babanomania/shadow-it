import type { ArcDef } from '../types';

// Multi-day arcs — cases whose clues span several days.
// Each arc registers beats (per-day content). The beats' logs/emails/alerts
// are merged into those days at load time. On the arc's resolveDay an
// additional Case is appended to the day's cases array.

// ── ARC 1 ─────────────────────────────────────────────────────
// AI tool creep — three days, escalates from one expense to a full
// data-exposure incident. Sits between anchor days 10 and 25.

const arc1: ArcDef = {
  id: 'arc-1-ai-creep',
  title: 'AI tool creep · CS team',
  archetype: 'shadow-ai',
  perpetrator: 'Customer-Success team · led by Reese Mathur',
  perpetratorDept: 'customer-success',
  briefing:
    'A pattern spread across three days: a single Claude Pro charge on day 13 became a multi-seat ask on day 14, and by day 15 a CS manager was forwarding live support tickets — with customer PII — into the model. No DPA, no enterprise tier, no audit trail. The team thinks they\'re being productive.',
  startDay: 13,
  resolveDay: 15,
  requiredClueIds: ['arc1-d13-l1', 'arc1-d14-e1', 'arc1-d15-l1'],
  correctAction: 'escalate',
  weight: 1.0,
  narratives: {
    vindicated:
      'You walk the thread end-to-end: the first expense, the multi-seat ask, the live-PII forward. Legal opens a DPA conversation with Anthropic. The CS team gets an enterprise tier and a clear playbook within a week. Two affected customers are notified proactively under the standard schedule. Board notes the catch: you saw the creep before anyone called it a breach.',
    'right-partial':
      "You escalate on partial evidence. Legal works it but the forwarding incident details surface late. The remediation is the same; the optics aren't.",
    lucky:
      "You escalated on the first expense — before the PII forward existed in evidence. Correct call. Board flags the timing.",
    'missed-soft':
      "You warn. Reese promises to switch to the enterprise tier 'this week.' Three weeks later support tickets are still being forwarded; a customer complains about a 'weird ai-sounding follow-up' and the trail leads back. The original alert is still in your archive.",
    overreacted:
      "You terminate Reese. The team and the affected customers find out at roughly the same time; the messaging spirals. The pattern was real, the response was disproportionate, the board overturns it.",
  },
  beats: [
    {
      day: 13,
      alerts: [
        {
          id: 'arc1-d13-a1',
          title: 'Personal Claude Pro charge — customer success',
          surface: 'expenses',
          severity: 'warn',
          preview: 'reese@helix.corp expensed claude-pro personal tier',
          caseId: null,
          clueId: 'arc1-d13-l1',
          arcId: 'arc-1-ai-creep',
          triaged: 'pending',
        },
      ],
      logs: [
        {
          id: 'arc1-d13-l1',
          ts: '14:18:22',
          service: 'expense',
          event: 'charge',
          user: 'reese@helix.corp',
          detail: 'vendor="claude-pro" amount=$200.00 plan=personal',
          severity: 'warn',
          caseId: null,
          arcId: 'arc-1-ai-creep',
        },
      ],
    },
    {
      day: 14,
      alerts: [
        {
          id: 'arc1-d14-a1',
          title: 'CS team — request to expense AI seats',
          surface: 'emails',
          severity: 'warn',
          preview: 'reese → it-desk: "team would love 6 seats"',
          caseId: null,
          clueId: 'arc1-d14-e1',
          arcId: 'arc-1-ai-creep',
          triaged: 'pending',
        },
        {
          id: 'arc1-d14-a2',
          title: 'Two more personal-tier AI charges',
          surface: 'expenses',
          severity: 'info',
          preview: 'mei@helix.corp · noor@helix.corp',
          caseId: null,
          clueId: 'arc1-d14-l1',
          arcId: 'arc-1-ai-creep',
          triaged: 'pending',
        },
      ],
      logs: [
        {
          id: 'arc1-d14-l1',
          ts: '09:42:18',
          service: 'expense',
          event: 'charge',
          user: 'mei@helix.corp',
          detail: 'vendor="claude-pro" amount=$200.00 plan=personal',
          severity: 'info',
          caseId: null,
          arcId: 'arc-1-ai-creep',
        },
        {
          id: 'arc1-d14-l2',
          ts: '11:08:50',
          service: 'expense',
          event: 'charge',
          user: 'noor@helix.corp',
          detail: 'vendor="claude-pro" amount=$200.00 plan=personal',
          severity: 'info',
          caseId: null,
          arcId: 'arc-1-ai-creep',
        },
      ],
      emails: [
        {
          id: 'arc1-d14-e1',
          ts: '15:30:42',
          from: 'reese@helix.corp',
          fromName: 'Reese Mathur',
          to: 'it-desk@helix.corp',
          subject: 'Can we get 6 Claude seats for CS?',
          preview: 'Half the team is paying personally — saves so much time',
          body: "Hey IT,\n\nThe team's been using Claude for triaging ticket queues — drafts of responses, classification, summarising threads. Six of us are already on personal seats. Would love to get a shared org account so we're not all expensing it separately.\n\nIf it helps, I can put together a quick doc on what we're using it for.\n\n— Reese",
          severity: 'warn',
          caseId: null,
          arcId: 'arc-1-ai-creep',
        },
      ],
    },
    {
      day: 15,
      alerts: [
        {
          id: 'arc1-d15-a1',
          title: 'Support ticket forwarded to Claude — contains PII',
          surface: 'traffic',
          severity: 'critical',
          preview: 'reese@helix.corp → api.anthropic.com with ticket body',
          caseId: null,
          clueId: 'arc1-d15-l1',
          arcId: 'arc-1-ai-creep',
          triaged: 'pending',
        },
        {
          id: 'arc1-d15-a2',
          title: 'CS — internal slack mentions of "the bot"',
          surface: 'emails',
          severity: 'warn',
          preview: 'team thread normalising the workflow',
          caseId: null,
          clueId: 'arc1-d15-e1',
          arcId: 'arc-1-ai-creep',
          triaged: 'pending',
        },
      ],
      logs: [
        {
          id: 'arc1-d15-l1',
          ts: '10:42:09',
          service: 'traffic',
          event: 'egress',
          user: 'reese@helix.corp',
          detail: 'dest=api.anthropic.com/v1/messages bytes=18KB payload_contains=ticket_body pii_fields=[email,phone,acct_id]',
          severity: 'critical',
          caseId: null,
          arcId: 'arc-1-ai-creep',
        },
        {
          id: 'arc1-d15-l2',
          ts: '12:14:33',
          service: 'traffic',
          event: 'egress',
          user: 'mei@helix.corp',
          detail: 'dest=api.anthropic.com/v1/messages bytes=22KB payload_contains=ticket_body',
          severity: 'critical',
          caseId: null,
          arcId: 'arc-1-ai-creep',
        },
      ],
      emails: [
        {
          id: 'arc1-d15-e1',
          ts: '11:08:18',
          from: 'reese@helix.corp',
          fromName: 'Reese Mathur',
          to: 'cs-team@helix.corp',
          subject: 'New triage workflow with Claude — try it',
          preview: 'Paste the ticket body, get a draft back in 5 seconds',
          body: "Team,\n\nThe new workflow is saving so much time. Just paste the ticket body — including the customer's reply — and Claude drafts the response. I've been doing this for a week and it's cut my queue time in half.\n\nIf you want help getting started, ping me.\n\n— Reese",
          severity: 'warn',
          caseId: null,
          arcId: 'arc-1-ai-creep',
        },
      ],
    },
  ],
};

// ── ARC 2 ─────────────────────────────────────────────────────
// Lingering partner access — a vendor was offboarded but their
// service token never died. Three days, ends in Q2.

const arc2: ArcDef = {
  id: 'arc-2-zombie-partner',
  title: 'Zombie partner access',
  archetype: 'exposed-api',
  perpetrator: 'IT Operations · partner-offboarding gap',
  perpetratorDept: 'ops',
  briefing:
    "A vendor (data-pipe-llc) was offboarded on day 35 — contract terminated, accounts payable closed out. But their service token kept working. Day 36 it was used. Day 37 a routine egress pull moved customer-segment data to their endpoint. The original offboarding checklist had no token-revocation step. Pattern hasn't shown up before because vendors usually time out their own integrations.",
  startDay: 35,
  resolveDay: 37,
  requiredClueIds: ['arc2-d35-l1', 'arc2-d36-l1', 'arc2-d37-l1'],
  correctAction: 'terminate',
  weight: 1.0,
  narratives: {
    vindicated:
      "You revoke the token within the hour, audit every offboarded-vendor token from the last twelve months, and publish a one-page addendum to the offboarding checklist. Two other zombie tokens turn up in the audit; both revoked the same day. The board treats this as the kind of structural fix a governance role exists to find.",
    'right-partial':
      'You terminate the token without the full audit. The fix lands but a second zombie surfaces two weeks later and someone has to ask why the audit was scoped so narrowly.',
    lucky:
      'You revoke on the egress alone; the offboarding gap is found by Legal after the fact. Right call, partial credit.',
    'missed-soft':
      "You escalate to ops; the token sits live for two more weeks while the team debates the right process. The vendor pulls another segment-data dump in that window. The leak is small but it's yours.",
    overreacted:
      "You move to terminate the head of IT Ops over a checklist gap. The board agrees it was a real gap but disagrees this is a firing. The morale hit lingers into the next quarter.",
  },
  beats: [
    {
      day: 35,
      alerts: [
        {
          id: 'arc2-d35-a1',
          title: 'Partner offboarded — data-pipe-llc',
          surface: 'logs',
          severity: 'info',
          preview: 'contract ended, AP closed',
          caseId: null,
          clueId: 'arc2-d35-l1',
          arcId: 'arc-2-zombie-partner',
          triaged: 'pending',
        },
      ],
      logs: [
        {
          id: 'arc2-d35-l1',
          ts: '11:18:42',
          service: 'legal',
          event: 'partner.offboard',
          user: 'legal-bot',
          detail: 'partner="data-pipe-llc" contract=terminated ap_status=closed final_payment=2024-09 note="standard sunset"',
          severity: 'info',
          caseId: null,
          arcId: 'arc-2-zombie-partner',
        },
      ],
    },
    {
      day: 36,
      alerts: [
        {
          id: 'arc2-d36-a1',
          title: 'Token use from offboarded partner',
          surface: 'logs',
          severity: 'warn',
          preview: 'partner-token-data-pipe-llc · still active',
          caseId: null,
          clueId: 'arc2-d36-l1',
          arcId: 'arc-2-zombie-partner',
          triaged: 'pending',
        },
      ],
      logs: [
        {
          id: 'arc2-d36-l1',
          ts: '14:08:50',
          service: 'api',
          event: 'token.used',
          user: 'partner-token-data-pipe-llc',
          detail: 'src=198.51.100.88 endpoint=/v1/customers method=GET rows=200 note="token issued 14mo ago, never rotated"',
          severity: 'warn',
          caseId: null,
          arcId: 'arc-2-zombie-partner',
        },
      ],
    },
    {
      day: 37,
      alerts: [
        {
          id: 'arc2-d37-a1',
          title: 'Egress to offboarded partner — customer-segment data',
          surface: 'traffic',
          severity: 'critical',
          preview: 'partner-token-data-pipe-llc pulled 4800 rows',
          caseId: null,
          clueId: 'arc2-d37-l1',
          arcId: 'arc-2-zombie-partner',
          triaged: 'pending',
        },
      ],
      logs: [
        {
          id: 'arc2-d37-l1',
          ts: '09:42:11',
          service: 'traffic',
          event: 'egress',
          user: 'partner-token-data-pipe-llc',
          detail: 'dest=ingest.data-pipe-llc.example bytes=420KB rows=4800 fields=[acct_id,segment,ltv,renewal_at] proto=https',
          severity: 'critical',
          caseId: null,
          arcId: 'arc-2-zombie-partner',
        },
      ],
    },
  ],
};

export const ARCS: ArcDef[] = [arc1, arc2];

export const ARCS_BY_RESOLVE_DAY: Record<number, ArcDef[]> = ARCS.reduce(
  (acc, arc) => {
    (acc[arc.resolveDay] ??= []).push(arc);
    return acc;
  },
  {} as Record<number, ArcDef[]>,
);

export function getArcsTouchingDay(day: number): ArcDef[] {
  return ARCS.filter((a) => a.beats.some((b) => b.day === day));
}

/** Build a Case object from an arc definition for injection on resolveDay. */
export function arcToCase(arc: ArcDef): import('../types').Case {
  return {
    id: arc.id,
    title: arc.title,
    archetype: arc.archetype,
    perpetrator: arc.perpetrator,
    perpetratorDept: arc.perpetratorDept,
    briefing: arc.briefing,
    requiredClueIds: arc.requiredClueIds,
    correctAction: arc.correctAction,
    weight: arc.weight,
    arcId: arc.id,
    narratives: arc.narratives,
  };
}
