import { useState } from 'react';
import { useStore } from '../store';
import type { LogEntry, Severity } from '../types';

const severityColor: Record<Severity, string> = {
  info: 'text-slate-500',
  warn: 'text-amber-400',
  critical: 'text-red-400',
};

type Filter = 'all' | 'warn' | 'critical';

export function LogsSurface() {
  const logs = useStore((s) => s.logs);
  const pinnedClueIds = useStore((s) => s.pinnedClueIds);
  const togglePin = useStore((s) => s.togglePin);

  const [filter, setFilter] = useState<Filter>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = logs.filter((l) => {
    if (filter === 'all') return true;
    if (filter === 'warn') return l.severity === 'warn' || l.severity === 'critical';
    return l.severity === 'critical';
  });

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-1">
          {(['all', 'warn', 'critical'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 text-[10px] uppercase tracking-wider rounded font-mono border ${
                filter === f
                  ? 'bg-slate-800 text-slate-100 border-slate-700'
                  : 'bg-transparent text-slate-500 border-slate-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="text-[10px] uppercase tracking-widest text-slate-600 font-mono">
          {filtered.length} rows
        </span>
      </div>

      <div className="font-mono text-[12px] divide-y divide-slate-900/70">
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
  return (
    <div
      className={`border-l-2 transition-colors ${
        pinned ? 'border-amber-500 bg-amber-900/10' : 'border-transparent'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full text-left flex gap-2 py-1.5 px-2 active:bg-slate-900/60"
      >
        <span className="text-slate-600 shrink-0">{log.ts}</span>
        <span className={`${severityColor[log.severity]} shrink-0`}>
          {log.service}.{log.event}
        </span>
        <span className="text-slate-500 truncate">{log.user}</span>
      </button>
      {open && (
        <div className="px-2 pb-3 pt-1 ml-1 text-slate-400 leading-relaxed">
          <div className="break-all">
            {log.detail || <span className="text-slate-600">(no detail)</span>}
          </div>
          <button
            onClick={onPin}
            className={`mt-2 px-2 py-1 text-[10px] uppercase tracking-wider rounded border ${
              pinned
                ? 'border-amber-600/40 text-amber-300 bg-amber-900/20'
                : 'border-slate-700 text-slate-300'
            }`}
          >
            {pinned ? 'pinned ✓' : 'pin to case'}
          </button>
        </div>
      )}
    </div>
  );
}
