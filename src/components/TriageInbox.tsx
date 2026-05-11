import { useStore } from '../store';
import type { Alert, Severity, Surface } from '../types';

const severityBorder: Record<Severity, string> = {
  info:     'border-slate-800  border-l-slate-600',
  warn:     'border-amber-800/30 border-l-amber-500',
  critical: 'border-red-800/30  border-l-red-500',
};

const severityChip: Record<Severity, string> = {
  info:     'text-slate-400  border-slate-700   bg-slate-900/50',
  warn:     'text-amber-400  border-amber-700/50 bg-amber-950/30',
  critical: 'text-red-400    border-red-700/50   bg-red-950/30',
};

const surfaceLabel: Record<Surface, string> = {
  logs:     'logs',
  emails:   'email',
  expenses: 'expense',
  traffic:  'traffic',
};

const surfaceBadge: Record<Surface, string> = {
  logs:     'text-slate-400    border-slate-700',
  emails:   'text-violet-400   border-violet-800/50',
  expenses: 'text-emerald-400  border-emerald-800/50',
  traffic:  'text-cyan-400     border-cyan-800/50',
};

export function TriageInbox({ onInvestigate }: { onInvestigate: (surface: Surface) => void }) {
  const alerts = useStore((s) => s.alerts);
  const triage = useStore((s) => s.triage);
  const attention = useStore((s) => s.attention);

  const pending = alerts.filter((a) => a.triaged === 'pending');
  const critCount = pending.filter((a) => a.severity === 'critical').length;

  if (pending.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="w-8 h-8 mx-auto mb-4 rounded-full border border-emerald-800/50 bg-emerald-950/30 flex items-center justify-center">
          <span className="text-emerald-500 text-sm">✓</span>
        </div>
        <div className="text-xs uppercase tracking-[0.2em] text-slate-600 mb-2 font-mono">
          inbox clear
        </div>
        <p className="text-sm text-slate-500">
          End-of-day debrief will land here next. Open Cases to review pinned clues.
        </p>
      </div>
    );
  }

  const handleInvestigate = (a: Alert) => {
    triage(a.id, 'investigate');
    onInvestigate(a.surface);
  };

  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-slate-600 px-1 mb-2 font-mono">
        <span className="flex items-center gap-2">
          {critCount > 0 && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          )}
          {pending.length} pending
        </span>
        <span className="text-slate-700">noise : signal unknown</span>
      </div>

      {pending.map((a) => {
        const broke = attention <= 0;
        return (
          <article
            key={a.id}
            className={`border border-l-4 rounded-lg p-3 bg-slate-900/40 ${severityBorder[a.severity]}`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider border font-mono ${surfaceBadge[a.surface]}`}>
                {surfaceLabel[a.surface]}
              </span>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider border font-mono ${severityChip[a.severity]}`}>
                {a.severity}
              </span>
            </div>
            <h3 className="text-sm text-slate-100 font-medium leading-snug mb-1">
              {a.title}
            </h3>
            <p className="text-xs text-slate-400 font-mono leading-snug mb-3 break-words">
              {a.preview}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => triage(a.id, 'dismiss')}
                className="py-2 text-[11px] uppercase tracking-wider text-slate-400 border border-slate-800 rounded active:bg-slate-800/50 font-mono"
              >
                Dismiss
              </button>
              <button
                onClick={() => handleInvestigate(a)}
                disabled={broke}
                className="py-2 text-[11px] uppercase tracking-wider text-amber-300 border border-amber-700/40 rounded active:bg-amber-900/30 disabled:opacity-40 disabled:cursor-not-allowed font-mono"
              >
                Investigate
              </button>
            </div>
            {broke && (
              <p className="mt-2 text-[10px] text-red-400/80 font-mono uppercase tracking-wider">
                attention exhausted — dismiss only
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}
