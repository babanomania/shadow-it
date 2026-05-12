import { useState } from 'react';
import { useStore } from '../store';

const TIER_LABEL: Record<string, string> = {
  vindicated: 'vindicated',
  'right-partial': 'right · thin',
  lucky: 'right · lucky',
  'missed-soft': 'missed',
  overreacted: 'overreached',
};

export function WinScreen({ onExit }: { onExit?: () => void }) {
  const trust = useStore((s) => s.trust);
  const risk = useStore((s) => s.risk);
  const morale = useStore((s) => s.morale);
  const resolutions = useStore((s) => s.resolutions);
  const reset = useStore((s) => s.reset);
  const [confirmReset, setConfirmReset] = useState(false);

  const vindicated = resolutions.filter((r) => r.outcomeTier === 'vindicated').length;

  return (
    <div className="flex h-full max-w-md mx-auto flex-col bg-[#0b1220] border-x border-slate-900">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="border border-emerald-700/40 rounded-lg p-4 bg-emerald-900/10">
          <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 font-mono mb-2">
            run complete · 100 days
          </div>
          <h1 className="text-lg font-medium text-slate-100 mb-2">You survived.</h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Four quarters, one hundred days, no breach above the fold. The board signs
            off and renews your mandate. Whether they&apos;d hire you again is a different
            question.
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-mono">
            final standing
          </div>
          <Row label="trust" value={trust} />
          <Row label="risk" value={risk} />
          <Row label="vindicated" value={`${vindicated}/${resolutions.length}`} />
        </div>

        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-mono">
            case log
          </div>
          {resolutions.map((r) => (
            <div
              key={r.caseId}
              className="border border-slate-800 rounded p-2 font-mono text-xs"
            >
              <div className="flex justify-between text-slate-400">
                <span>day {r.day}</span>
                <span className="uppercase tracking-wider">{r.action}</span>
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">
                {TIER_LABEL[r.outcomeTier] ?? r.outcomeTier}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-mono">
            morale by department
          </div>
          {Object.entries(morale).map(([dept, v]) => (
            <Row key={dept} label={dept} value={v} />
          ))}
        </div>

        <div className="border-t border-slate-900 pt-4">
          {confirmReset ? (
            <div className="space-y-2">
              <p className="text-[11px] text-slate-500 text-center font-mono uppercase tracking-wider">
                start a new run?
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
                  className="py-2 text-[11px] uppercase tracking-wider text-emerald-300 border border-emerald-700/40 rounded active:bg-emerald-900/30"
                >
                  Confirm
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => setConfirmReset(true)}
                className="w-full py-3 text-[11px] uppercase tracking-[0.2em] text-emerald-300 border border-emerald-700/40 rounded font-mono active:bg-emerald-900/30"
              >
                new run
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

function Row({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex justify-between font-mono text-xs">
      <span className="text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="text-slate-200 tabular-nums">{value}</span>
    </div>
  );
}
