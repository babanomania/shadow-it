import { useState } from 'react';
import { useStore } from '../store';
import type { EmailThread, Severity } from '../types';

const severityRing: Record<Severity, string> = {
  info: 'border-slate-800',
  warn: 'border-amber-700/40',
  critical: 'border-red-700/50',
};

export function EmailsSurface() {
  const emails = useStore((s) => s.emails);
  const pinnedClueIds = useStore((s) => s.pinnedClueIds);
  const togglePin = useStore((s) => s.togglePin);
  const [openId, setOpenId] = useState<string | null>(null);

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
    <div className="p-3 space-y-2">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-slate-600 px-1 mb-2 font-mono">
        <span>{emails.length} threads</span>
        <span>tap to read</span>
      </div>
      {emails.map((e) => (
        <EmailCard
          key={e.id}
          email={e}
          pinned={pinnedClueIds.includes(e.id)}
          open={openId === e.id}
          onToggle={() => setOpenId(openId === e.id ? null : e.id)}
          onPin={() => togglePin(e.id)}
        />
      ))}
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
  return (
    <article
      className={`border rounded-lg ${
        pinned ? 'border-amber-500 bg-amber-900/10' : `${severityRing[email.severity]} bg-slate-900/40`
      }`}
    >
      <button onClick={onToggle} className="w-full text-left p-3">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-mono mb-1">
          <span className="text-slate-500 truncate mr-2">
            {email.fromName} <span className="text-slate-700">·</span>{' '}
            <span className="text-slate-600">{email.from}</span>
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
          <div className="text-[10px] uppercase tracking-wider text-slate-600 font-mono mb-2">
            to: <span className="text-slate-400">{email.to}</span>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-slate-300 font-sans leading-relaxed">
            {email.body}
          </pre>
          <button
            onClick={onPin}
            className={`mt-3 px-2 py-1 text-[10px] uppercase tracking-wider rounded border ${
              pinned
                ? 'border-amber-600/40 text-amber-300 bg-amber-900/20'
                : 'border-slate-700 text-slate-300'
            }`}
          >
            {pinned ? 'pinned ✓' : 'pin to case'}
          </button>
        </div>
      )}
    </article>
  );
}
