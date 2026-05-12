import { useState } from 'react';
import { selectAllPinnedClueIds, useStore } from '../store';
import type { LogEntry, Severity } from '../types';

interface ParsedFlow {
  log: LogEntry;
  dest: string;
  bytesRaw: string;
  bytesNum: number;
  proto: string;
  direction: 'egress' | 'ingress' | 'audit';
  note: string;
}

const BYTES_SCALE_GB = 1024 * 1024 * 1024;
const BYTES_SCALE_MB = 1024 * 1024;
const BYTES_SCALE_KB = 1024;

function parseBytes(raw: string): number {
  const m = raw.match(/([\d.]+)\s*(GB|MB|KB|B)/i);
  if (!m) return 0;
  const val = parseFloat(m[1]);
  switch (m[2].toUpperCase()) {
    case 'GB': return val * BYTES_SCALE_GB;
    case 'MB': return val * BYTES_SCALE_MB;
    case 'KB': return val * BYTES_SCALE_KB;
    default: return val;
  }
}

const parseFlow = (l: LogEntry): ParsedFlow => {
  const dest = l.detail.match(/dest=(\S+)/)?.[1] ?? l.event;
  const bytesRaw = l.detail.match(/bytes=(\S+)/)?.[1] ?? '0B';
  const proto = l.detail.match(/proto=(\S+)/)?.[1] ?? '';
  const note = l.detail.match(/note="([^"]+)"/)?.[1] ?? '';
  const bytesNum = parseBytes(bytesRaw);
  const direction =
    l.event === 'egress' ? 'egress' :
    l.event === 'ingress' ? 'ingress' :
    'audit';
  return { log: l, dest, bytesRaw, bytesNum, proto, direction, note };
};

const severityBar: Record<Severity, string> = {
  info: 'bg-slate-600',
  warn: 'bg-amber-500',
  critical: 'bg-red-500',
};

const severityText: Record<Severity, string> = {
  info: 'text-slate-400',
  warn: 'text-amber-400',
  critical: 'text-red-400',
};

const directionGlyph: Record<ParsedFlow['direction'], string> = {
  egress: '↑',
  ingress: '↓',
  audit: '⊙',
};

function BytesBar({ bytesNum, maxBytes, severity }: { bytesNum: number; maxBytes: number; severity: Severity }) {
  const pct = maxBytes > 0 ? Math.max(2, (bytesNum / maxBytes) * 100) : 2;
  return (
    <div className="mt-2 h-1 rounded-full bg-slate-800 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${severityBar[severity]}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function TrafficSurface() {
  const logs = useStore((s) => s.logs);
  const allPinned = useStore(selectAllPinnedClueIds);
  const togglePin = useStore((s) => s.togglePin);

  const [query, setQuery] = useState('');
  const [direction, setDirection] = useState<'all' | 'egress' | 'ingress'>('all');

  const allFlows = logs.filter((l) => l.service === 'traffic').map(parseFlow);
  const maxBytes = allFlows.reduce((m, f) => Math.max(m, f.bytesNum), 1);

  const lowerQuery = query.trim().toLowerCase();
  const flows = allFlows.filter((f) => {
    if (direction === 'egress' && f.direction !== 'egress') return false;
    if (direction === 'ingress' && f.direction !== 'ingress') return false;
    if (lowerQuery) {
      const haystack = `${f.dest} ${f.log.user} ${f.log.detail}`.toLowerCase();
      if (!haystack.includes(lowerQuery)) return false;
    }
    return true;
  });

  if (allFlows.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 mb-2 font-mono">
          traffic
        </div>
        <p className="text-sm text-slate-500">No flows captured today.</p>
      </div>
    );
  }

  const critCount = allFlows.filter((f) => f.log.severity === 'critical').length;
  const warnCount = allFlows.filter((f) => f.log.severity === 'warn').length;
  const totalBytes = allFlows.reduce((s, f) => s + f.bytesNum, 0);
  const totalLabel =
    totalBytes >= BYTES_SCALE_GB
      ? `${(totalBytes / BYTES_SCALE_GB).toFixed(1)} GB`
      : totalBytes >= BYTES_SCALE_MB
      ? `${(totalBytes / BYTES_SCALE_MB).toFixed(0)} MB`
      : `${(totalBytes / BYTES_SCALE_KB).toFixed(0)} KB`;

  return (
    <div className="p-3 space-y-3">
      {/* Summary strip */}
      <div className="border border-slate-800 rounded-lg p-3 bg-slate-900/30">
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-mono mb-2">
          today's egress summary
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-mono text-slate-100 tabular-nums leading-none">{totalLabel}</div>
            <div className="text-[10px] font-mono text-slate-600 mt-1 uppercase tracking-wider">total outbound</div>
          </div>
          <div className="text-right space-y-1">
            {critCount > 0 && (
              <div className="text-[11px] font-mono text-red-400">{critCount} critical</div>
            )}
            {warnCount > 0 && (
              <div className="text-[11px] font-mono text-amber-400">{warnCount} flagged</div>
            )}
            <div className="text-[11px] font-mono text-slate-600">{flows.length} flows</div>
          </div>
        </div>

        {/* Stacked severity bar — each segment proportional to its bytes */}
        <div className="mt-3 h-1.5 rounded-full bg-slate-800 flex overflow-hidden gap-px">
          {allFlows.map((f) => {
            const pct = totalBytes > 0 ? Math.max(2, (f.bytesNum / totalBytes) * 100) : 100 / allFlows.length;
            return (
              <div
                key={f.log.id}
                className={`h-full ${severityBar[f.log.severity]}`}
                style={{ width: `${pct}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Filter + search */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {(['all', 'egress', 'ingress'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDirection(d)}
              className={`px-2 py-1 text-[10px] uppercase tracking-wider rounded font-mono border transition-colors ${
                direction === d
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
          placeholder="search dest, user…"
          className="flex-1 bg-slate-900/60 border border-slate-800 rounded px-2 py-1 text-[11px] font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-700/40"
        />
      </div>

      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 px-1 font-mono">
        flow detail · {flows.length} of {allFlows.length}
      </div>

      {/* Flow cards */}
      {flows.map(({ log, dest, bytesRaw, bytesNum, proto, direction, note }) => {
        const pinned = allPinned.has(log.id);
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
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-mono mb-1">
                  <span className="text-slate-600">{log.ts}</span>
                  <span className={severityText[log.severity]}>
                    {directionGlyph[direction]} {direction}
                  </span>
                  {proto && (
                    <span className="border border-slate-700 text-slate-500 px-1 rounded text-[9px]">
                      {proto}
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-100 truncate font-mono">{dest}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 font-mono truncate">{log.user}</div>
                {note && (
                  <div className="text-[10px] text-amber-400/70 mt-1 font-mono">note: {note}</div>
                )}
                <BytesBar bytesNum={bytesNum} maxBytes={maxBytes} severity={log.severity} />
              </div>
              <div className="text-right shrink-0 ml-2">
                <div className={`text-sm font-mono tabular-nums ${severityText[log.severity]}`}>
                  {bytesRaw}
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
  );
}
