import { useState } from 'react';
import { useStore } from '../store';
import type { LogEntry } from '../types';

interface ParsedExpense {
  log: LogEntry;
  vendor: string;
  amount: string;
  amountNum: number;
  dept: string;
}

const parse = (l: LogEntry): ParsedExpense => {
  const vendor = l.detail.match(/vendor="([^"]+)"/)?.[1] ?? l.event;
  const amountStr = l.detail.match(/amount=\$?([\d,.]+)/)?.[1] ?? '';
  const amountNum = amountStr ? parseFloat(amountStr.replace(/,/g, '')) : 0;
  const dept = l.detail.match(/dept=([^\s]+)/)?.[1] ?? '';
  return {
    log: l,
    vendor,
    amount: amountStr || '—',
    amountNum,
    dept,
  };
};

const formatTotal = (n: number) => {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
};

export function ExpensesSurface() {
  const logs = useStore((s) => s.logs);
  const pinnedClueIds = useStore((s) => s.pinnedClueIds);
  const togglePin = useStore((s) => s.togglePin);

  const [query, setQuery] = useState('');
  const [filterDept, setFilterDept] = useState<string>('all');

  const expenses = logs.filter((l) => l.service === 'expense').map(parse);
  const allDepts = [...new Set(expenses.map((e) => e.dept).filter(Boolean))];
  const total = expenses.reduce((s, e) => s + e.amountNum, 0);
  const flaggedCount = expenses.filter((e) => e.log.severity !== 'info').length;

  const lowerQuery = query.trim().toLowerCase();

  const filtered = expenses.filter((e) => {
    if (filterDept !== 'all' && e.dept !== filterDept) return false;
    if (lowerQuery) {
      const haystack = `${e.vendor} ${e.dept} ${e.log.user} ${e.log.detail}`.toLowerCase();
      if (!haystack.includes(lowerQuery)) return false;
    }
    return true;
  });

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
    <div className="p-3 space-y-3">
      {/* Stats header */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/30 px-3 py-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-emerald-400">
            corporate charges
          </span>
          <span className="text-[10px] font-mono tabular-nums text-slate-600">
            {expenses.length} charges · {allDepts.length} depts
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-mono text-slate-100 tabular-nums">{formatTotal(total)}</span>
            <span className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">today's total</span>
          </div>
          {flaggedCount > 0 ? (
            <span className="text-[10px] font-mono text-amber-400">● {flaggedCount} flagged</span>
          ) : (
            <span className="text-[10px] font-mono text-slate-700">● clean</span>
          )}
        </div>
      </div>

      {/* Dept filter + search */}
      <div className="space-y-2">
        <div className="flex gap-1 overflow-x-auto -mx-1 px-1 pb-0.5">
          <button
            onClick={() => setFilterDept('all')}
            className={`px-2 py-1 text-[10px] uppercase tracking-wider rounded font-mono border whitespace-nowrap transition-colors ${
              filterDept === 'all'
                ? 'bg-slate-800 text-slate-100 border-slate-700'
                : 'bg-transparent text-slate-500 border-slate-800 active:text-slate-200'
            }`}
          >
            all depts
          </button>
          {allDepts.map((d) => (
            <button
              key={d}
              onClick={() => setFilterDept(d)}
              className={`px-2 py-1 text-[10px] uppercase tracking-wider rounded font-mono border whitespace-nowrap transition-colors ${
                filterDept === d
                  ? 'bg-slate-800 text-slate-100 border-slate-700'
                  : 'bg-transparent text-slate-500 border-slate-800 active:text-slate-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search vendor, user…"
          className="w-full bg-slate-900/60 border border-slate-800 rounded px-2 py-1 text-[11px] font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-700/40"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xs text-slate-600 font-mono">no charges match.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(({ log, vendor, amount, dept }) => {
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
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
