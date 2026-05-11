import type { JSX } from 'react';
import { useStore } from '../store';
import type { Alert, Severity, Surface } from '../types';

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

const SURFACE_BADGE: Record<Surface, string> = {
  logs:     'text-slate-300    border-slate-700   bg-slate-900/60',
  emails:   'text-violet-300   border-violet-800/50 bg-violet-950/30',
  expenses: 'text-emerald-300  border-emerald-800/50 bg-emerald-950/30',
  traffic:  'text-cyan-300     border-cyan-800/50 bg-cyan-950/30',
};

function SurfaceIcon({ surface, className = 'w-3 h-3' }: { surface: Surface; className?: string }) {
  const icons: Record<Surface, JSX.Element> = {
    logs: (
      <svg viewBox="0 0 16 16" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
        <path d="M3 5l3 3-3 3M8 11h5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    emails: (
      <svg viewBox="0 0 16 16" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="4" width="12" height="8" rx="1" />
        <path d="M2.5 5l5.5 4 5.5-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    expenses: (
      <svg viewBox="0 0 16 16" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
        <path d="M8 3v10M10.5 5.5h-3a1.75 1.75 0 100 3.5h1a1.75 1.75 0 110 3.5h-3" strokeLinecap="round" />
      </svg>
    ),
    traffic: (
      <svg viewBox="0 0 16 16" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
        <path d="M2 11h2l1.5-3.5L7.5 12 10 4l1.5 5H14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };
  return icons[surface];
}

function CriticalGlyph({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
      <path d="M8 2L1.5 13h13L8 2zM8 6.5v3.5M8 11.5v.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Avatar({ name }: { name: string }) {
  // Deterministic monogram + hue from name
  const initial = name.trim()[0]?.toUpperCase() ?? '?';
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  const hue = Math.abs(hash) % 360;
  return (
    <div
      className="w-7 h-7 rounded-md border flex items-center justify-center font-mono text-[10px] tracking-wide shrink-0"
      style={{
        backgroundColor: `hsl(${hue} 30% 14%)`,
        borderColor: `hsl(${hue} 40% 24%)`,
        color: `hsl(${hue} 70% 70%)`,
      }}
    >
      {initial}
    </div>
  );
}

export function TriageInbox({ onInvestigate }: { onInvestigate: (surface: Surface) => void }) {
  const alerts = useStore((s) => s.alerts);
  const day = useStore((s) => s.day);
  const triage = useStore((s) => s.triage);
  const attention = useStore((s) => s.attention);

  const pending = alerts.filter((a) => a.triaged === 'pending');
  const total = alerts.length;
  const handled = total - pending.length;
  const handledPct = total > 0 ? (handled / total) * 100 : 0;

  const critCount = pending.filter((a) => a.severity === 'critical').length;
  const warnCount = pending.filter((a) => a.severity === 'warn').length;
  const infoCount = pending.filter((a) => a.severity === 'info').length;

  // Sort: critical → warn → info, preserving order within each
  const sortOrder: Record<Severity, number> = { critical: 0, warn: 1, info: 2 };
  const sorted = [...pending].sort((a, b) => sortOrder[a.severity] - sortOrder[b.severity]);

  const brief = DAY_BRIEF[day] ?? { weekday: 'today', tone: 'Another shift. Watch the feeds.' };

  if (pending.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="relative w-14 h-14 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border border-emerald-700/40 bg-emerald-950/30" />
          <div className="absolute inset-0 flex items-center justify-center text-emerald-400 text-xl">✓</div>
          <div className="absolute -inset-1 rounded-full border border-emerald-700/20 animate-pulse" />
        </div>
        <div className="text-xs uppercase tracking-[0.2em] text-emerald-400/80 mb-2 font-mono">
          inbox · zero
        </div>
        <p className="text-sm text-slate-400 mb-1">
          You've cleared every alert for day {day}.
        </p>
        <p className="text-xs text-slate-600 leading-relaxed">
          End-of-day debrief lands here next. Open <span className="text-amber-400">Cases</span> to file a decision on your pinned clues.
        </p>
      </div>
    );
  }

  const handleInvestigate = (a: Alert) => {
    triage(a.id, 'investigate');
    onInvestigate(a.surface);
  };

  return (
    <div className="p-3 space-y-3">
      {/* HERO / DAY BRIEF */}
      <section className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950 p-4">
        {/* faint corner glyph */}
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
          {pending.length} new alert{pending.length === 1 ? '' : 's'} on your desk.
        </h1>

        <p className="text-[12px] text-slate-400 italic leading-relaxed font-mono mb-3">
          "{brief.tone}"
        </p>

        {/* progress bar */}
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

        {/* severity breakdown */}
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
        </div>
      </section>

      {/* HOW TO PLAY hint — soft, can be ignored */}
      <div className="flex items-start gap-2 px-1 text-[10px] font-mono text-slate-600 leading-relaxed">
        <span className="text-slate-700 mt-0.5">›</span>
        <span>
          <span className="text-slate-400">Dismiss</span> noise · <span className="text-amber-400">Investigate</span> to pull receipts (costs 1 attention)
        </span>
      </div>

      {/* PRIORITY BANNER for critical alerts */}
      {critCount > 0 && (
        <div className="relative rounded-lg border border-red-700/50 bg-red-950/20 px-3 py-2 overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1 bg-red-500 animate-pulse" />
          <div className="flex items-center gap-2 text-red-400">
            <CriticalGlyph className="w-4 h-4 shrink-0" />
            <span className="text-[11px] font-mono uppercase tracking-wider">
              priority · address {critCount === 1 ? 'this one' : `these ${critCount}`} first
            </span>
          </div>
        </div>
      )}

      {/* ALERT CARDS */}
      <div className="space-y-2.5">
        {sorted.map((a) => {
          const broke = attention <= 0;
          if (a.severity === 'critical') {
            return (
              <CriticalAlertCard
                key={a.id}
                alert={a}
                broke={broke}
                onDismiss={() => triage(a.id, 'dismiss')}
                onInvestigate={() => handleInvestigate(a)}
              />
            );
          }
          return (
            <StandardAlertCard
              key={a.id}
              alert={a}
              broke={broke}
              onDismiss={() => triage(a.id, 'dismiss')}
              onInvestigate={() => handleInvestigate(a)}
            />
          );
        })}
      </div>
    </div>
  );
}

function CriticalAlertCard({
  alert,
  broke,
  onDismiss,
  onInvestigate,
}: {
  alert: Alert;
  broke: boolean;
  onDismiss: () => void;
  onInvestigate: () => void;
}) {
  // Try to extract a user-ish hint from the preview for the avatar
  const userMatch = alert.preview.match(/([\w.-]+@[\w.-]+)|([\w-]+-bot)/);
  const subject = userMatch?.[0] ?? alert.title;

  return (
    <article className="relative overflow-hidden rounded-xl border-2 border-red-700/60 bg-gradient-to-b from-red-950/30 to-slate-950 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
      {/* glow scan strip */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
      {/* priority strip */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1.5 bg-red-950/40 border-b border-red-900/50">
        <div className="flex items-center gap-1.5 text-red-400">
          <CriticalGlyph className="w-3.5 h-3.5" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-medium">
            critical
          </span>
        </div>
        <div className="flex items-center gap-1 text-red-500/80">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-wider">live</span>
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-start gap-2.5 mb-2">
          <Avatar name={subject} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider border font-mono ${SURFACE_BADGE[alert.surface]}`}>
                <SurfaceIcon surface={alert.surface} className="w-3 h-3" />
                {SURFACE_LABEL[alert.surface]}
              </span>
            </div>
            <h3 className="text-[15px] text-slate-50 font-semibold leading-snug">
              {alert.title}
            </h3>
            <p className="text-[12px] text-slate-300 font-mono leading-snug mt-1 break-words">
              {alert.preview}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            onClick={onDismiss}
            className="py-2.5 text-[11px] uppercase tracking-wider text-slate-500 border border-slate-800 rounded font-mono active:bg-slate-800/50"
          >
            Dismiss
          </button>
          <button
            onClick={onInvestigate}
            disabled={broke}
            className="py-2.5 text-[11px] uppercase tracking-wider text-red-200 border border-red-600/50 bg-red-900/30 rounded font-mono font-medium active:bg-red-900/50 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_8px_rgba(239,68,68,0.2)]"
          >
            Investigate · −1
          </button>
        </div>
        {broke && (
          <p className="mt-2 text-[10px] text-red-400/80 font-mono uppercase tracking-wider">
            attention exhausted — dismiss only
          </p>
        )}
      </div>
    </article>
  );
}

function StandardAlertCard({
  alert,
  broke,
  onDismiss,
  onInvestigate,
}: {
  alert: Alert;
  broke: boolean;
  onDismiss: () => void;
  onInvestigate: () => void;
}) {
  const isWarn = alert.severity === 'warn';
  const borderClass = isWarn
    ? 'border-slate-800 border-l-4 border-l-amber-500'
    : 'border-slate-800 border-l-4 border-l-slate-700';

  const userMatch = alert.preview.match(/([\w.-]+@[\w.-]+)|([\w-]+-bot)/);
  const subject = userMatch?.[0] ?? alert.title;

  return (
    <article className={`rounded-lg border bg-slate-900/40 p-3 ${borderClass}`}>
      <div className="flex items-start gap-2.5">
        <Avatar name={subject} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider border font-mono ${SURFACE_BADGE[alert.surface]}`}>
              <SurfaceIcon surface={alert.surface} className="w-3 h-3" />
              {SURFACE_LABEL[alert.surface]}
            </span>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider border font-mono ${
              isWarn
                ? 'text-amber-400 border-amber-700/50 bg-amber-950/30'
                : 'text-slate-500 border-slate-700 bg-slate-900/50'
            }`}>
              {alert.severity}
            </span>
          </div>
          <h3 className="text-[13px] text-slate-100 font-medium leading-snug">
            {alert.title}
          </h3>
          <p className="text-[11px] text-slate-400 font-mono leading-snug mt-0.5 break-words">
            {alert.preview}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <button
          onClick={onDismiss}
          className="py-2 text-[11px] uppercase tracking-wider text-slate-400 border border-slate-800 rounded font-mono active:bg-slate-800/50"
        >
          Dismiss
        </button>
        <button
          onClick={onInvestigate}
          disabled={broke}
          className="py-2 text-[11px] uppercase tracking-wider text-amber-300 border border-amber-700/40 rounded font-mono active:bg-amber-900/30 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Investigate · −1
        </button>
      </div>
      {broke && (
        <p className="mt-2 text-[10px] text-red-400/80 font-mono uppercase tracking-wider">
          attention exhausted — dismiss only
        </p>
      )}
    </article>
  );
}
