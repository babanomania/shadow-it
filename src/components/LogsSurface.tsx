import { useState } from 'react';
import { useStore } from '../store';
import type { LogEntry, Severity } from '../types';

const severityColor: Record<Severity, string> = {
  info: 'text-slate-500',
  warn: 'text-amber-400',
  critical: 'text-red-400',
};

const severityBorder: Record<Severity, string> = {
  info: 'border-transparent',
  warn: 'border-amber-700/30',
  critical: 'border-red-700/40',
};

const serviceBadge: Record<string, string> = {
  auth:           'text-blue-400    border-blue-800/50    bg-blue-950/30',
  api:            'text-violet-400  border-violet-800/50  bg-violet-950/30',
  traffic:        'text-cyan-400    border-cyan-800/50    bg-cyan-950/30',
  expense:        'text-emerald-400 border-emerald-800/50 bg-emerald-950/30',
  iam:            'text-pink-400    border-pink-800/50    bg-pink-950/30',
  github:         'text-slate-300   border-slate-700      bg-slate-900/50',
  hr:             'text-amber-400   border-amber-800/50   bg-amber-950/30',
  pagerduty:      'text-orange-400  border-orange-800/50  bg-orange-950/30',
  ci:             'text-teal-400    border-teal-800/50    bg-teal-950/30',
  cdn:            'text-sky-400     border-sky-800/50     bg-sky-950/30',
  mail:           'text-fuchsia-400 border-fuchsia-800/50 bg-fuchsia-950/30',
  legal:          'text-stone-400   border-stone-700/50   bg-stone-900/40',
  'secret-scanner': 'text-rose-400  border-rose-800/50    bg-rose-950/30',
};

const badgeFallback = 'text-slate-400 border-slate-700/50 bg-slate-900/30';

type Filter = 'all' | 'warn' | 'critical';

export function LogsSurface() {
  const logs = useStore((s) => s.logs);
  const pinnedClueIds = useStore((s) => s.pinnedClueIds);
  const togglePin = useStore((s) => s.togglePin);

  const [filter, setFilter] = useState<Filter>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const lowerQuery = query.trim().toLowerCase();

  const filtered = logs.filter((l) => {
    if (filter === 'warn' && l.severity === 'info') return false;
    if (filter === 'critical' && l.severity !== 'critical') return false;
    if (lowerQuery) {
      const haystack = `${l.user} ${l.service} ${l.event} ${l.detail}`.toLowerCase();
      if (!haystack.includes(lowerQuery)) return false;
    }
    return true;
  });

  const critCount = logs.filter((l) => l.severity === 'critical').length;
  const warnCount = logs.filter((l) => l.severity === 'warn').length;
  const services = new Set(logs.map((l) => l.service)).size;

  return (
    <div className="p-3 space-y-3">
      {/* Stats header */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/30 px-3 py-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-slate-500">
            system logs
          </span>
          <span className="text-[10px] font-mono tabular-nums text-slate-600">
            {logs.length} entries · {services} services
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          {critCount > 0 ? (
            <span className="text-red-400">● {critCount} critical</span>
          ) : (
            <span className="text-slate-700">● 0 critical</span>
          )}
          {warnCount > 0 ? (
            <span className="text-amber-400">● {warnCount} warn</span>
          ) : (
            <span className="text-slate-700">● 0 warn</span>
          )}
          <span className="text-slate-600">●  {logs.length - critCount - warnCount} info</span>
        </div>
      </div>

      {/* Filter + search */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {(['all', 'warn', 'critical'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 text-[10px] uppercase tracking-wider rounded font-mono border transition-colors ${
                filter === f
                  ? 'bg-slate-800 text-slate-100 border-slate-700'
                  : 'bg-transparent text-slate-500 border-slate-800 active:text-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search user, service…"
          className="flex-1 bg-slate-900/60 border border-slate-800 rounded px-2 py-1 text-[11px] font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-700/40"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xs text-slate-600 font-mono">no entries match.</p>
        </div>
      ) : (
        <div className="font-mono text-[12px] divide-y divide-slate-900/60 -mx-1">
          {filtered.map((l) => (
            <LogRow
              key={l.id}
              log={l}
              pinned={pinnedClueIds.includes(l.id)}
              open={openId === l.id}
              onToggle={() => setOpenId(openId === l.id ? null : l.id)}
              onPin={() => togglePin(l.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LogRow({
  log,
  pinned,
  open,
  onToggle,
  onPin,
}: {
  log: LogEntry;
  pinned: boolean;
  open: boolean;
  onToggle: () => void;
  onPin: () => void;
}) {
  const badge = serviceBadge[log.service] ?? badgeFallback;

  return (
    <div
      className={`border-l-2 transition-colors ${
        pinned
          ? 'border-amber-500 bg-amber-900/10'
          : log.severity === 'critical'
            ? 'border-red-700/50 bg-red-950/10'
            : log.severity === 'warn'
              ? severityBorder[log.severity] + ' bg-amber-950/5'
              : 'border-transparent'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full text-left flex items-center gap-2 py-2 px-2 active:bg-slate-900/60"
      >
        <span className="text-slate-700 shrink-0 text-[10px]">{log.ts}</span>
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider border shrink-0 ${badge}`}>
          {log.service}
        </span>
        <span className={`${severityColor[log.severity]} shrink-0 text-[11px]`}>
          {log.event}
        </span>
        <span className="text-slate-500 truncate text-[11px]">{log.user}</span>
        {pinned && <span className="ml-auto shrink-0 text-amber-400 text-[10px]">📌</span>}
        {!pinned && log.severity === 'critical' && (
          <span className="ml-auto shrink-0 text-red-500 text-[10px]">●</span>
        )}
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 ml-1 space-y-2">
          <div className="text-slate-400 break-all leading-relaxed text-[11px]">
            {log.detail || <span className="text-slate-600">(no detail)</span>}
          </div>
          <button
            onClick={onPin}
            className={`px-2 py-1 text-[10px] uppercase tracking-wider rounded border font-mono ${
              pinned
                ? 'border-amber-600/40 text-amber-300 bg-amber-900/20'
                : 'border-slate-700 text-slate-300 active:bg-slate-800/40'
            }`}
          >
            {pinned ? 'pinned ✓ · unpin' : 'pin to case'}
          </button>
        </div>
      )}
    </div>
  );
}
