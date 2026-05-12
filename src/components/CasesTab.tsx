import { useState } from 'react';
import { selectActiveCase, selectLastResolution, useStore } from '../store';
import type {
  ActionType,
  Alert,
  Case,
  EmailThread,
  LogEntry,
  OutcomeTier,
  Resolution,
  Severity,
  Surface,
} from '../types';

// ─── DAY BRIEF DATA ─────────────────────────────────────────────────────────

const DAY_BRIEF: Record<number, { weekday: string; tone: string }> = {
  1: { weekday: 'tuesday', tone: 'Marketing has been busy. Watch their channel.' },
  2: { weekday: 'wednesday', tone: 'Engineering pushed late last night. Receipts to chase.' },
  3: { weekday: 'thursday', tone: 'Compliance flagged a public gist. Carlos is involved.' },
  4: { weekday: 'friday', tone: 'Partner integration is acting up. Audit found a pattern.' },
  5: { weekday: 'monday', tone: "Tomás Aguilar's last day. He has been here eleven years." },
};

const SURFACE_LABEL: Record<Surface, string> = {
  logs:     'logs',
  emails:   'email',
  expenses: 'expense',
  traffic:  'traffic',
};

const ACTIONS: { id: ActionType; label: string; tone: string }[] = [
  { id: 'ignore',    label: 'Ignore',    tone: 'border-slate-700 text-slate-300' },
  { id: 'warn',      label: 'Warn',      tone: 'border-slate-600 text-slate-200' },
  { id: 'escalate',  label: 'Escalate',  tone: 'border-amber-700/50 text-amber-300' },
  { id: 'terminate', label: 'Terminate', tone: 'border-red-700/50 text-red-300' },
];

// ─── ROOT ───────────────────────────────────────────────────────────────────

export function CasesTab({ onInvestigate }: { onInvestigate: (surface: Surface) => void }) {
  const status = useStore((s) => s.status);
  const lastResolution = useStore(selectLastResolution);
  const cases = useStore((s) => s.cases);
  const activeCase = useStore(selectActiveCase);

  // Day-end takes over the whole tab
  if (status === 'day-end' && lastResolution) {
    const caseDef = cases.find((c) => c.id === lastResolution.caseId);
    if (caseDef) {
      return <ResolutionView resolution={lastResolution} caseDef={caseDef} />;
    }
  }

  return (
    <div className="p-3 space-y-3">
      <DayHero />
      {activeCase && <ActiveCaseCard caseDef={activeCase} onInvestigate={onInvestigate} />}
      <PendingAlertsSection onInvestigate={onInvestigate} />
    </div>
  );
}

// ─── DAY HERO ───────────────────────────────────────────────────────────────

function DayHero() {
  const day = useStore((s) => s.day);
  const alerts = useStore((s) => s.alerts);

  const pending = alerts.filter((a) => a.triaged === 'pending');
  const total = alerts.length;
  const handled = total - pending.length;
  const handledPct = total > 0 ? (handled / total) * 100 : 0;

  const critCount = pending.filter((a) => a.severity === 'critical').length;
  const warnCount = pending.filter((a) => a.severity === 'warn').length;
  const infoCount = pending.filter((a) => a.severity === 'info').length;

  const brief = DAY_BRIEF[day] ?? { weekday: 'today', tone: 'Another shift. Watch the feeds.' };

  const headline =
    pending.length === 0
      ? "Inbox clear. File your decision below."
      : `${pending.length} new alert${pending.length === 1 ? '' : 's'} on your desk.`;

  return (
    <section className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950 p-4">
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-amber-500/5 blur-2xl pointer-events-none" />
      <div className="absolute right-3 top-3 text-[10px] font-mono text-slate-700 uppercase tracking-[0.2em] pointer-events-none">
        shift {day}/5
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-[10px] uppercase tracking-[0.25em] font-mono text-slate-600">
          {brief.weekday}
        </span>
        <span className="text-slate-800">·</span>
        <span className="text-[10px] uppercase tracking-[0.25em] font-mono text-amber-400">
          day {day}
        </span>
      </div>

      <h1 className="text-base font-medium text-slate-100 leading-snug mb-3">
        {headline}
      </h1>

      <p className="text-[12px] text-slate-400 italic leading-relaxed font-mono mb-3">
        "{brief.tone}"
      </p>

      <div className="mb-3">
        <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider mb-1">
          <span className="text-slate-600">triage progress</span>
          <span className="text-slate-400 tabular-nums">{handled} / {total}</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
            style={{ width: `${handledPct}%` }}
          />
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {critCount > 0 && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border border-red-700/50 bg-red-950/40 text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {critCount} critical
          </span>
        )}
        {warnCount > 0 && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border border-amber-700/50 bg-amber-950/40 text-amber-400">
            {warnCount} warn
          </span>
        )}
        {infoCount > 0 && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border border-slate-700 bg-slate-900/40 text-slate-400">
            {infoCount} info
          </span>
        )}
        {pending.length === 0 && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border border-emerald-700/40 bg-emerald-950/30 text-emerald-400">
            inbox · zero
          </span>
        )}
      </div>
    </section>
  );
}

// ─── ACTIVE CASE ────────────────────────────────────────────────────────────

const TARGET_EVIDENCE = 3;

function ActiveCaseCard({
  caseDef,
  onInvestigate: _onInvestigate,
}: {
  caseDef: Case;
  onInvestigate: (surface: Surface) => void;
}) {
  const logs = useStore((s) => s.logs);
  const emails = useStore((s) => s.emails);
  const alerts = useStore((s) => s.alerts);
  const pinnedClueIds = useStore((s) => s.pinnedClueIds);
  const togglePin = useStore((s) => s.togglePin);
  const decide = useStore((s) => s.decide);

  const pinnedLogs = logs.filter((l) => pinnedClueIds.includes(l.id));
  const pinnedEmails = emails.filter((e) => pinnedClueIds.includes(e.id));
  const pinnedCount = pinnedLogs.length + pinnedEmails.length;

  const pendingCount = alerts.filter((a) => a.triaged === 'pending').length;
  const inboxClear = pendingCount === 0;

  const [showDecide, setShowDecide] = useState(false);

  return (
    <section className="rounded-xl border border-amber-700/30 bg-gradient-to-b from-amber-950/10 to-slate-900/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-400">
            active investigation
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600">
          {caseDef.archetype}
        </span>
      </div>

      <h2 className="text-base font-medium text-slate-100 leading-snug">
        {caseDef.title}
      </h2>

      <p className="text-[12px] text-slate-400 leading-relaxed">
        {caseDef.briefing}
      </p>

      <EvidenceMeter pinnedCount={pinnedCount} />

      {pinnedCount > 0 && (
        <PinnedCluesList
          pinnedLogs={pinnedLogs}
          pinnedEmails={pinnedEmails}
          onUnpin={togglePin}
        />
      )}

      {!showDecide ? (
        inboxClear ? (
          <button
            onClick={() => setShowDecide(true)}
            className="w-full py-2.5 text-[11px] uppercase tracking-[0.2em] font-mono text-amber-200 border border-amber-700/50 bg-amber-950/30 rounded-lg active:bg-amber-900/40 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
          >
            file decision →
          </button>
        ) : (
          <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3 space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider">
              <span className="text-slate-600">▸</span>
              <span className="text-slate-500">decision locked</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Clear your inbox before filing. You still have{' '}
              <span className="text-amber-300">{pendingCount} alert{pendingCount === 1 ? '' : 's'}</span>{' '}
              waiting — dismiss the noise, investigate what you want to pull receipts on.
            </p>
            <button
              disabled
              className="w-full py-2.5 text-[11px] uppercase tracking-[0.2em] font-mono text-slate-600 border border-slate-800 bg-slate-900/40 rounded-lg cursor-not-allowed"
            >
              file decision · locked
            </button>
          </div>
        )
      ) : (
        <InlineDecisionPanel
          caseDef={caseDef}
          pinnedCount={pinnedCount}
          onCancel={() => setShowDecide(false)}
          onDecide={(action) => {
            decide(caseDef.id, action);
            setShowDecide(false);
          }}
        />
      )}
    </section>
  );
}

function EvidenceMeter({ pinnedCount }: { pinnedCount: number }) {
  const reachedTarget = pinnedCount >= TARGET_EVIDENCE;
  const slots = Math.max(TARGET_EVIDENCE, pinnedCount);

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
          evidence
        </span>
        <span className={`text-[10px] font-mono uppercase tracking-wider ${reachedTarget ? 'text-emerald-400' : 'text-slate-400'}`}>
          {pinnedCount} pinned {reachedTarget ? '✓' : `· target ${TARGET_EVIDENCE}+`}
        </span>
      </div>

      <div className="flex gap-1 mb-2">
        {Array.from({ length: slots }).map((_, i) => {
          const filled = i < pinnedCount;
          const reached = i < TARGET_EVIDENCE;
          return (
            <div
              key={i}
              className={`h-2 flex-1 rounded-sm transition-colors ${
                filled
                  ? reachedTarget
                    ? 'bg-emerald-500'
                    : reached
                      ? 'bg-amber-500'
                      : 'bg-amber-400/70'
                  : 'bg-slate-800'
              }`}
            />
          );
        })}
      </div>

      <p className="text-[10px] font-mono text-slate-600 leading-relaxed">
        {pinnedCount === 0
          ? 'Pin clues from Records to build your case.'
          : reachedTarget
            ? 'Solid stack. Decide when you are ready.'
            : `${TARGET_EVIDENCE - pinnedCount} more clue${TARGET_EVIDENCE - pinnedCount === 1 ? '' : 's'} usually clears a case.`}
      </p>
    </div>
  );
}

function PinnedCluesList({
  pinnedLogs,
  pinnedEmails,
  onUnpin,
}: {
  pinnedLogs: LogEntry[];
  pinnedEmails: EmailThread[];
  onUnpin: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-mono">
        pinned · {pinnedLogs.length + pinnedEmails.length}
      </div>
      {pinnedLogs.map((l) => (
        <div
          key={l.id}
          className="border border-amber-700/30 bg-amber-900/10 rounded p-2 font-mono text-[11px]"
        >
          <div className="flex gap-2 flex-wrap">
            <span className="text-slate-500">{l.ts}</span>
            <span className="text-amber-300">
              {l.service}.{l.event}
            </span>
            <span className="text-slate-500 truncate">{l.user}</span>
          </div>
          <div className="text-slate-400 mt-1 break-all">{l.detail}</div>
          <button
            onClick={() => onUnpin(l.id)}
            className="mt-2 text-[10px] uppercase tracking-wider text-slate-500 active:text-slate-200"
          >
            unpin
          </button>
        </div>
      ))}
      {pinnedEmails.map((e) => (
        <div
          key={e.id}
          className="border border-amber-700/30 bg-amber-900/10 rounded p-2 text-[11px]"
        >
          <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1">
            {e.ts} · {e.fromName}
          </div>
          <div className="text-amber-300 leading-snug">{e.subject}</div>
          <div className="text-slate-500 mt-1 text-[10px] font-mono">→ {e.to}</div>
          <button
            onClick={() => onUnpin(e.id)}
            className="mt-2 text-[10px] uppercase tracking-wider font-mono text-slate-500 active:text-slate-200"
          >
            unpin
          </button>
        </div>
      ))}
    </div>
  );
}

function InlineDecisionPanel({
  caseDef,
  pinnedCount,
  onCancel,
  onDecide,
}: {
  caseDef: Case;
  pinnedCount: number;
  onCancel: () => void;
  onDecide: (action: ActionType) => void;
}) {
  const [pending, setPending] = useState<ActionType | null>(null);

  if (pending) {
    const meta = ACTIONS.find((a) => a.id === pending)!;
    return (
      <div className="border border-slate-800 rounded-lg p-3 bg-slate-950/50">
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-mono mb-2">
          confirm decision
        </div>
        <p className="text-sm text-slate-300 mb-1">
          <span className={`font-mono uppercase ${meta.tone.split(' ')[1]}`}>{meta.label}</span>{' '}
          on <span className="text-slate-100">{caseDef.title}</span>?
        </p>
        <p className="text-xs text-slate-500 mb-3">
          {pinnedCount === 0
            ? 'You have no pinned evidence. This will be a no-evidence call.'
            : 'Pinned clues become your evidence of record.'}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setPending(null)}
            className="py-2 text-[11px] uppercase tracking-wider text-slate-400 border border-slate-800 rounded active:bg-slate-800/50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onDecide(pending);
              setPending(null);
            }}
            className={`py-2 text-[11px] uppercase tracking-wider border rounded active:bg-slate-800/50 ${meta.tone}`}
          >
            Confirm {meta.label.toLowerCase()}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-slate-800 rounded-lg p-3 bg-slate-950/50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-mono">
          decision
        </span>
        <button
          onClick={onCancel}
          className="text-[10px] uppercase tracking-wider text-slate-600 font-mono active:text-slate-200"
        >
          cancel
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {ACTIONS.map((a) => (
          <button
            key={a.id}
            onClick={() => setPending(a.id)}
            className={`py-2 text-[11px] uppercase tracking-wider border rounded active:bg-slate-800/50 ${a.tone}`}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── PENDING ALERTS SECTION ─────────────────────────────────────────────────

function PinIcon({ className = 'w-4 h-4', filled }: { className?: string; filled?: boolean }) {
  if (filled) {
    return (
      <svg viewBox="0 0 16 16" className={className} fill="currentColor">
        <path d="M8 1.5a.5.5 0 01.5.5v.5h2a.5.5 0 01.354.854L9.207 5h.293a2 2 0 012 2v1a.5.5 0 01-.5.5h-2.5v4.5a1 1 0 11-2 0V8.5H4a.5.5 0 01-.5-.5V7a2 2 0 012-2h.293L4.146 3.354A.5.5 0 014.5 2.5h2V2a.5.5 0 01.5-.5h1z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 2v.5h2.5L9 4.5h.5a1.5 1.5 0 011.5 1.5V8H5V6a1.5 1.5 0 011.5-1.5H7L5.5 2.5H8V2zM8 8.5V13" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
    </svg>
  );
}

const SEVERITY_DOT: Record<Severity, string> = {
  critical: 'bg-red-500',
  warn:     'bg-amber-500',
  info:     'bg-slate-600',
};

const SEVERITY_STRIPE: Record<Severity, string> = {
  critical: 'bg-red-500',
  warn:     'bg-amber-500',
  info:     'bg-slate-700',
};

const SEVERITY_TEXT: Record<Severity, string> = {
  critical: 'text-red-400',
  warn:     'text-amber-400',
  info:     'text-slate-500',
};

function PendingAlertsSection({ onInvestigate: _ }: { onInvestigate: (surface: Surface) => void }) {
  const alerts = useStore((s) => s.alerts);
  const logs = useStore((s) => s.logs);
  const emails = useStore((s) => s.emails);
  const triage = useStore((s) => s.triage);
  const togglePin = useStore((s) => s.togglePin);
  const pinnedClueIds = useStore((s) => s.pinnedClueIds);
  const attention = useStore((s) => s.attention);

  const pending = alerts.filter((a) => a.triaged === 'pending');
  if (pending.length === 0) return null;

  const critCount = pending.filter((a) => a.severity === 'critical').length;
  const warnCount = pending.filter((a) => a.severity === 'warn').length;

  const sortOrder: Record<Severity, number> = { critical: 0, warn: 1, info: 2 };
  const sorted = [...pending].sort((a, b) => sortOrder[a.severity] - sortOrder[b.severity]);

  const handlePinFromAlert = (a: Alert) => {
    if (!a.clueId) return;
    if (!pinnedClueIds.includes(a.clueId)) {
      togglePin(a.clueId);
    }
    triage(a.id, 'investigate');
  };

  // resolve an alert's timestamp from the underlying log/email
  const tsFor = (a: Alert): string | null => {
    if (!a.clueId) return null;
    const l = logs.find((x) => x.id === a.clueId);
    if (l) return l.ts;
    const e = emails.find((x) => x.id === a.clueId);
    if (e) return e.ts;
    return null;
  };

  return (
    <section>
      {/* Section header — PD-style with severity counts */}
      <div className="flex items-center justify-between px-1 mb-2 mt-1">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em]">
          <span className="text-slate-600">▸</span>
          <span className="text-slate-400">incoming</span>
          <span className="text-slate-700">·</span>
          <span className="text-slate-300 tabular-nums">{pending.length}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          {critCount > 0 && (
            <span className="flex items-center gap-1 text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {critCount}
            </span>
          )}
          {warnCount > 0 && (
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {warnCount}
            </span>
          )}
        </div>
      </div>

      {/* Compact incident list */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/30 overflow-hidden divide-y divide-slate-800/70">
        {sorted.map((a) => {
          const broke = attention <= 0;
          const pinned = !!(a.clueId && pinnedClueIds.includes(a.clueId));
          return (
            <AlertRow
              key={a.id}
              alert={a}
              ts={tsFor(a)}
              broke={broke}
              pinned={pinned}
              onDismiss={() => triage(a.id, 'dismiss')}
              onPin={() => handlePinFromAlert(a)}
            />
          );
        })}
      </div>
    </section>
  );
}

function AlertRow({
  alert,
  ts,
  broke,
  pinned,
  onDismiss,
  onPin,
}: {
  alert: Alert;
  ts: string | null;
  broke: boolean;
  pinned: boolean;
  onDismiss: () => void;
  onPin: () => void;
}) {
  const canPin = !!alert.clueId;
  const isCritical = alert.severity === 'critical';

  return (
    <article
      className={`relative flex items-stretch ${
        isCritical ? 'bg-red-950/15' : pinned ? 'bg-amber-950/10' : ''
      }`}
    >
      {/* Severity stripe */}
      <div className={`shrink-0 w-[3px] ${SEVERITY_STRIPE[alert.severity]} ${isCritical ? 'animate-pulse' : ''}`} />

      <div className="flex-1 min-w-0 py-2.5 pl-2.5 pr-2">
        {/* Metadata row: severity dot · service · timestamp */}
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${SEVERITY_DOT[alert.severity]} ${isCritical ? 'animate-pulse' : ''}`} />
            <span className={`text-[9px] font-mono uppercase tracking-[0.15em] ${SEVERITY_TEXT[alert.severity]}`}>
              {alert.severity}
            </span>
            <span className="text-slate-700 text-[9px]">·</span>
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 truncate">
              {SURFACE_LABEL[alert.surface]}
            </span>
            {pinned && (
              <>
                <span className="text-slate-700 text-[9px]">·</span>
                <span className="inline-flex items-center gap-0.5 text-[9px] font-mono uppercase tracking-wider text-amber-400">
                  <PinIcon className="w-2.5 h-2.5" filled />
                  pinned
                </span>
              </>
            )}
          </div>
          {ts && (
            <span className="text-[9px] font-mono text-slate-700 shrink-0 tabular-nums">
              {ts}
            </span>
          )}
        </div>

        {/* Title + preview */}
        <h3 className="text-[12.5px] text-slate-100 leading-snug font-medium">
          {alert.title}
        </h3>
        <p className="text-[11px] text-slate-500 leading-snug font-mono mt-0.5 break-words">
          {alert.preview}
        </p>
      </div>

      {/* Action buttons — icon only, PagerDuty-style */}
      <div className="flex items-center gap-0.5 px-1.5 shrink-0 border-l border-slate-800/60">
        {canPin && (
          <button
            onClick={onPin}
            disabled={broke}
            aria-label={pinned ? 'Unpin from case' : 'Pin to case'}
            title={pinned ? 'Pinned to case' : 'Pin to case (−1 attn)'}
            className={`w-9 h-9 flex items-center justify-center rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
              pinned
                ? 'text-amber-300 bg-amber-950/40'
                : 'text-amber-400 active:bg-amber-950/30'
            }`}
          >
            <PinIcon className="w-4 h-4" filled={pinned} />
          </button>
        )}
        <button
          onClick={onDismiss}
          aria-label="Dismiss alert"
          title="Dismiss"
          className="w-9 h-9 flex items-center justify-center text-slate-500 active:text-slate-200 active:bg-slate-800/40 rounded"
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
}

// ─── RESOLUTION (day-end takeover) ──────────────────────────────────────────

const OUTCOME_LABEL: Record<OutcomeTier, string> = {
  vindicated: 'vindicated',
  'right-partial': 'right call · thin paperwork',
  lucky: 'right answer · no proof',
  'missed-soft': 'missed it',
  overreacted: 'overreached',
};

const OUTCOME_TONE: Record<OutcomeTier, string> = {
  vindicated: 'text-emerald-400 border-emerald-700/40 from-emerald-950/30',
  'right-partial': 'text-amber-300 border-amber-700/40 from-amber-950/30',
  lucky: 'text-amber-300 border-amber-700/40 from-amber-950/30',
  'missed-soft': 'text-red-400 border-red-700/40 from-red-950/30',
  overreacted: 'text-red-400 border-red-700/40 from-red-950/30',
};

function ResolutionView({
  resolution,
  caseDef,
}: {
  resolution: Resolution;
  caseDef: Case;
}) {
  const day = useStore((s) => s.day);
  const totalDays = 5;
  const nextDay = useStore((s) => s.nextDay);
  const isLastDay = day >= totalDays;

  return (
    <div className="p-4 space-y-4">
      <div
        className={`border rounded-xl p-4 bg-gradient-to-b to-slate-950 ${OUTCOME_TONE[resolution.outcomeTier]}`}
      >
        <div className="text-[10px] uppercase tracking-[0.2em] font-mono mb-1 opacity-70">
          verdict · day {resolution.day}
        </div>
        <div className="text-base font-mono uppercase tracking-wider">
          {OUTCOME_LABEL[resolution.outcomeTier]}
        </div>
        <div className="text-[11px] text-slate-500 mt-1 font-mono uppercase tracking-wider">
          you chose: {resolution.action}
        </div>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-mono mb-1">
          {caseDef.title}
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{resolution.narrative}</p>
      </div>

      <div className="border border-slate-800 rounded-lg p-3 bg-slate-900/30">
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-mono mb-2">
          aftermath
        </div>
        <div className="space-y-1.5 text-xs font-mono">
          <DeltaRow label="trust" delta={resolution.trustDelta} good />
          <DeltaRow label="risk" delta={resolution.riskDelta} good={false} />
          {Object.entries(resolution.moraleDeltas).map(([dept, d]) => (
            <DeltaRow key={dept} label={`${dept} morale`} delta={d} good />
          ))}
        </div>
      </div>

      <button
        onClick={() => nextDay()}
        className="w-full py-3 text-[11px] uppercase tracking-[0.2em] text-amber-300 border border-amber-700/40 rounded-lg font-mono active:bg-amber-900/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
      >
        {isLastDay ? 'wrap the quarter' : `advance to day ${day + 1}`}
      </button>
    </div>
  );
}

function DeltaRow({ label, delta, good }: { label: string; delta: number; good: boolean }) {
  if (delta === 0) {
    return (
      <div className="flex justify-between">
        <span className="text-slate-500 uppercase tracking-wider">{label}</span>
        <span className="text-slate-600">no change</span>
      </div>
    );
  }
  const positive = good ? delta > 0 : delta < 0;
  const color = positive ? 'text-emerald-400' : 'text-red-400';
  const sign = delta > 0 ? '+' : '';
  return (
    <div className="flex justify-between">
      <span className="text-slate-500 uppercase tracking-wider">{label}</span>
      <span className={color}>
        {sign}
        {delta}
      </span>
    </div>
  );
}
