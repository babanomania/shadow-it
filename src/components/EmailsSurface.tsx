import { useState } from 'react';
import { selectAllPinnedClueIds, useStore } from '../store';
import type { EmailThread, Severity } from '../types';

const severityRing: Record<Severity, string> = {
  info: 'border-slate-800',
  warn: 'border-amber-700/40',
  critical: 'border-red-700/50',
};

function isExternal(addr: string): boolean {
  return !addr.endsWith('@helix.corp');
}

export function EmailsSurface() {
  const emails = useStore((s) => s.emails);
  const allPinned = useStore(selectAllPinnedClueIds);
  const togglePin = useStore((s) => s.togglePin);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'external' | 'flagged'>('all');
  const [query, setQuery] = useState('');

  const lowerQuery = query.trim().toLowerCase();

  const filtered = emails.filter((e) => {
    if (filter === 'external' && !isExternal(e.from) && !isExternal(e.to)) return false;
    if (filter === 'flagged' && e.severity === 'info') return false;
    if (lowerQuery) {
      const haystack = `${e.fromName} ${e.from} ${e.to} ${e.subject} ${e.preview}`.toLowerCase();
      if (!haystack.includes(lowerQuery)) return false;
    }
    return true;
  });

  const externalCount = emails.filter((e) => isExternal(e.from) || isExternal(e.to)).length;
  const flaggedCount = emails.filter((e) => e.severity !== 'info').length;

  if (emails.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 mb-2 font-mono">
          inbox
        </div>
        <p className="text-sm text-slate-500">No threads today.</p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3">
      {/* Stats header */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/30 px-3 py-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-violet-400">
            email threads
          </span>
          <span className="text-[10px] font-mono tabular-nums text-slate-600">
            {emails.length} messages
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="text-violet-300">● {externalCount} external</span>
          {flaggedCount > 0 ? (
            <span className="text-amber-400">● {flaggedCount} flagged</span>
          ) : (
            <span className="text-slate-700">● 0 flagged</span>
          )}
          <span className="text-slate-600">● {emails.length - externalCount} internal</span>
        </div>
      </div>

      {/* Filter + search */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {(['all', 'external', 'flagged'] as const).map((f) => (
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
          placeholder="search sender, subject…"
          className="flex-1 bg-slate-900/60 border border-slate-800 rounded px-2 py-1 text-[11px] font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-700/40"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xs text-slate-600 font-mono">no threads match.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((e) => (
            <EmailCard
              key={e.id}
              email={e}
              pinned={allPinned.has(e.id)}
              open={openId === e.id}
              onToggle={() => setOpenId(openId === e.id ? null : e.id)}
              onPin={() => togglePin(e.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmailCard({
  email,
  pinned,
  open,
  onToggle,
  onPin,
}: {
  email: EmailThread;
  pinned: boolean;
  open: boolean;
  onToggle: () => void;
  onPin: () => void;
}) {
  const external = isExternal(email.from) || isExternal(email.to);

  return (
    <article
      className={`border rounded-lg ${
        pinned ? 'border-amber-500 bg-amber-900/10' : `${severityRing[email.severity]} bg-slate-900/40`
      }`}
    >
      <button onClick={onToggle} className="w-full text-left p-3">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-mono mb-1">
          <span className="text-slate-500 truncate mr-2 flex items-center gap-1.5">
            {external && (
              <span className="inline-block px-1 py-0.5 rounded text-[8px] border border-violet-800/60 text-violet-300 bg-violet-950/30">
                ext
              </span>
            )}
            <span>
              {email.fromName} <span className="text-slate-700">·</span>{' '}
              <span className="text-slate-600 normal-case">{email.from}</span>
            </span>
          </span>
          <span className="text-slate-600 shrink-0">{email.ts}</span>
        </div>
        <h3 className="text-sm text-slate-100 leading-snug">{email.subject}</h3>
        {!open && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 font-mono">{email.preview}</p>
        )}
      </button>
      {open && (
        <div className="px-3 pb-3 border-t border-slate-800 pt-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-600 font-mono mb-2 flex items-center gap-1.5 flex-wrap">
            <span>to:</span>
            <span className="text-slate-400 normal-case">{email.to}</span>
            {isExternal(email.to) && (
              <span className="inline-block px-1 py-0.5 rounded text-[8px] border border-violet-800/60 text-violet-300 bg-violet-950/30">
                external
              </span>
            )}
          </div>
          <pre className="whitespace-pre-wrap text-sm text-slate-300 font-sans leading-relaxed">
            {email.body}
          </pre>
          <button
            onClick={onPin}
            className={`mt-3 px-2 py-1 text-[10px] uppercase tracking-wider rounded border font-mono ${
              pinned
                ? 'border-amber-600/40 text-amber-300 bg-amber-900/20'
                : 'border-slate-700 text-slate-300'
            }`}
          >
            {pinned ? 'pinned ✓ · unpin' : 'pin to case'}
          </button>
        </div>
      )}
    </article>
  );
}
