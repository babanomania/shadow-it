import { useStore } from '../store';
import type { LogEntry } from '../types';

interface ParsedExpense {
  log: LogEntry;
  vendor: string;
  amount: string;
  dept: string;
}

const parse = (l: LogEntry): ParsedExpense => {
  const vendor = l.detail.match(/vendor="([^"]+)"/)?.[1] ?? l.event;
  const amount = l.detail.match(/amount=\$?([\d,.]+)/)?.[1] ?? '—';
  const dept = l.detail.match(/dept=([^\s]+)/)?.[1] ?? '';
  return { log: l, vendor, amount, dept };
};

export function ExpensesSurface() {
  const logs = useStore((s) => s.logs);
  const pinnedClueIds = useStore((s) => s.pinnedClueIds);
  const togglePin = useStore((s) => s.togglePin);

  const expenses = logs.filter((l) => l.service === 'expense').map(parse);

  if (expenses.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 mb-2 font-mono">
          expenses
        </div>
        <p className="text-sm text-slate-500">No charges today.</p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-slate-600 px-1 mb-2 font-mono">
        <span>{expenses.length} charge{expenses.length === 1 ? '' : 's'}</span>
        <span>card statement view</span>
      </div>
      {expenses.map(({ log, vendor, amount, dept }) => {
        const pinned = pinnedClueIds.includes(log.id);
        const flagged = log.severity !== 'info';
        return (
          <article
            key={log.id}
            className={`border rounded-lg p-3 ${
              pinned
                ? 'border-amber-500 bg-amber-900/10'
                : flagged
                  ? 'border-amber-700/40 bg-slate-900/40'
                  : 'border-slate-800 bg-slate-900/30'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-mono text-slate-500 mb-1">
                  <span>{log.ts}</span>
                  {dept && <span className="text-slate-700">·</span>}
                  {dept && <span>{dept}</span>}
                  {flagged && <span className="text-amber-400">⚠</span>}
                </div>
                <div className="text-sm text-slate-100 truncate font-mono">{vendor}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 font-mono truncate">
                  {log.user}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm text-slate-100 font-mono tabular-nums">
                  ${amount}
                </div>
                <button
                  onClick={() => togglePin(log.id)}
                  className={`mt-2 px-2 py-1 text-[10px] uppercase tracking-wider rounded border font-mono ${
                    pinned
                      ? 'border-amber-600/40 text-amber-300 bg-amber-900/20'
                      : 'border-slate-700 text-slate-300'
                  }`}
                >
                  {pinned ? 'pinned' : 'pin'}
                </button>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 mt-2 font-mono break-all">
              {log.detail}
            </div>
          </article>
        );
      })}
    </div>
  );
}
