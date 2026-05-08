import { useStore } from '../store';
import type { Alert, Severity, Surface } from '../types';

const severityRing: Record<Severity, string> = {
  info: 'border-slate-800',
  warn: 'border-amber-700/40',
  critical: 'border-red-700/50',
};

const severityChip: Record<Severity, string> = {
  info: 'text-slate-400',
  warn: 'text-amber-400',
  critical: 'text-red-400',
};

const surfaceLabel: Record<Surface, string> = {
  logs: 'logs',
  emails: 'email',
  expenses: 'expense',
  traffic: 'traffic',
};

export function TriageInbox({ onInvestigate }: { onInvestigate: (surface: Surface) => void }) {
  const alerts = useStore((s) => s.alerts);
  const triage = useStore((s) => s.triage);
  const attention = useStore((s) => s.attention);

  const pending = alerts.filter((a) => a.triaged === 'pending');

  if (pending.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-xs uppercase tracking-[0.2em] text-slate-600 mb-3 font-mono">
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
        <span>{pending.length} pending</span>
        <span>noise : signal unknown</span>
      </div>

      {pending.map((a) => {
        const broke = attention <= 0;
        return (
          <article
            key={a.id}
            className={`border ${severityRing[a.severity]} bg-slate-900/40 rounded-lg p-3`}
          >
            <div className="flex items-center gap-2 mb-1 font-mono text-[10px] uppercase tracking-wider">
              <span className="text-slate-600">{surfaceLabel[a.surface]}</span>
              <span className="text-slate-700">·</span>
              <span className={severityChip[a.severity]}>{a.severity}</span>
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
                className="py-2 text-[11px] uppercase tracking-wider text-slate-400 border border-slate-800 rounded active:bg-slate-800/50"
              >
                Dismiss
              </button>
              <button
                onClick={() => handleInvestigate(a)}
                disabled={broke}
                className="py-2 text-[11px] uppercase tracking-wider text-amber-300 border border-amber-700/40 rounded active:bg-amber-900/30 disabled:opacity-40 disabled:cursor-not-allowed"
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
