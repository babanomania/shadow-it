import { useStore } from '../store';

export function CaseBoard() {
  const logs = useStore((s) => s.logs);
  const pinnedClueIds = useStore((s) => s.pinnedClueIds);
  const togglePin = useStore((s) => s.togglePin);

  const pinned = logs.filter((l) => pinnedClueIds.includes(l.id));

  if (pinned.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-xs uppercase tracking-[0.2em] text-slate-600 mb-3 font-mono">
          case board
        </div>
        <p className="text-sm text-slate-500">
          No clues yet. Open Logs and pin rows you find suspicious.
        </p>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 mb-3 px-1 font-mono">
        {pinned.length} clue{pinned.length === 1 ? '' : 's'} pinned
      </div>

      <div className="space-y-2 mb-4">
        {pinned.map((l) => (
          <div
            key={l.id}
            className="border border-amber-700/30 bg-amber-900/10 rounded p-2 font-mono text-[12px]"
          >
            <div className="flex gap-2 flex-wrap">
              <span className="text-slate-500">{l.ts}</span>
              <span className="text-amber-300">
                {l.service}.{l.event}
              </span>
              <span className="text-slate-500 truncate">{l.user}</span>
            </div>
            <div className="text-slate-400 mt-1 break-all">{l.detail}</div>
            <button
              onClick={() => togglePin(l.id)}
              className="mt-2 text-[10px] uppercase tracking-wider text-slate-500 active:text-slate-200"
            >
              unpin
            </button>
          </div>
        ))}
      </div>

      <div className="border border-slate-800 rounded p-3 text-xs text-slate-500 leading-relaxed">
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 mb-2 font-mono">
          decision
        </div>
        <p className="mb-3">
          Decision UI lands next: ignore · warn · escalate · terminate. Each
          choice will cost or earn board trust based on whether the clues
          actually convict the perpetrator.
        </p>
        <div className="grid grid-cols-2 gap-2 opacity-40 pointer-events-none">
          {(['ignore', 'warn', 'escalate', 'terminate'] as const).map((a) => (
            <button
              key={a}
              className="py-2 text-[11px] uppercase tracking-wider border border-slate-800 rounded text-slate-400"
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
