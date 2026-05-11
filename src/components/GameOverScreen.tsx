import { useState } from 'react';
import { useStore } from '../store';

export function GameOverScreen({ onExit }: { onExit?: () => void }) {
  const trust = useStore((s) => s.trust);
  const risk = useStore((s) => s.risk);
  const day = useStore((s) => s.day);
  const resolutions = useStore((s) => s.resolutions);
  const reset = useStore((s) => s.reset);
  const [confirmReset, setConfirmReset] = useState(false);

  const reason =
    trust <= 0
      ? 'Board lost confidence. Vote of no confidence carried 7-2.'
      : 'Risk hit 100. A breach made the trade press by lunchtime.';

  return (
    <div className="flex h-full max-w-md mx-auto flex-col bg-[#0b1220] border-x border-slate-900">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="border border-red-700/40 rounded-lg p-4 bg-red-900/10">
          <div className="text-[10px] uppercase tracking-[0.3em] text-red-400 font-mono mb-2">
            game over
          </div>
          <h1 className="text-lg font-medium text-slate-100 mb-2">
            Day {day} · you&apos;re out
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">{reason}</p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-mono">
            final standing
          </div>
          <Row label="trust" value={trust} />
          <Row label="risk" value={risk} />
          <Row label="cases handled" value={resolutions.length} />
        </div>

        {resolutions.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-mono">
              record
            </div>
            {resolutions.map((r) => (
              <div
                key={r.caseId}
                className="border border-slate-800 rounded p-2 font-mono text-xs"
              >
                <div className="flex justify-between text-slate-500">
                  <span>day {r.day} · {r.action}</span>
                  <span>{r.outcomeTier}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-slate-900 pt-4">
          {confirmReset ? (
            <div className="space-y-2">
              <p className="text-[11px] text-slate-500 text-center font-mono uppercase tracking-wider">
                wipe save and try again?
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setConfirmReset(false)}
                  className="py-2 text-[11px] uppercase tracking-wider text-slate-400 border border-slate-800 rounded active:bg-slate-800/50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    reset();
                    setConfirmReset(false);
                  }}
                  className="py-2 text-[11px] uppercase tracking-wider text-amber-300 border border-amber-700/40 rounded active:bg-amber-900/30"
                >
                  Confirm
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => setConfirmReset(true)}
                className="w-full py-3 text-[11px] uppercase tracking-[0.2em] text-amber-300 border border-amber-700/40 rounded font-mono active:bg-amber-900/30"
              >
                start over
              </button>
              {onExit && (
                <button
                  onClick={onExit}
                  className="w-full py-2 text-[11px] uppercase tracking-[0.2em] text-slate-500 border border-slate-800 rounded font-mono active:bg-slate-800/50"
                >
                  back to landing
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between font-mono text-xs">
      <span className="text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="text-slate-200 tabular-nums">{value}</span>
    </div>
  );
}
