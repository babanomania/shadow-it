import { useStore } from '../store';

const QUARTER_LABELS = ['Q1', 'Q2', 'Q3', 'Q4'];

function DeltaRow({
  label,
  pre,
  post,
  kind,
}: {
  label: string;
  pre: number;
  post: number;
  kind: 'good' | 'bad';
}) {
  const delta = post - pre;
  const arrow = delta === 0 ? '·' : delta > 0 ? '▲' : '▼';
  // For trust, going up is good; for risk, going down is good.
  const isGood = kind === 'good' ? delta >= 0 : delta <= 0;
  const color =
    delta === 0
      ? 'text-slate-500'
      : isGood
        ? 'text-emerald-400'
        : 'text-red-400';

  return (
    <div className="flex items-center justify-between font-mono text-sm">
      <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{label}</span>
      <div className="flex items-center gap-2 tabular-nums">
        <span className="text-slate-500">{pre}</span>
        <span className="text-slate-700">→</span>
        <span className="text-slate-200">{post}</span>
        <span className={`text-xs ${color}`}>
          {arrow} {Math.abs(delta)}
        </span>
      </div>
    </div>
  );
}

export function QuarterEndScreen() {
  const snapshot = useStore((s) => s.quarterSnapshot);
  const resolutions = useStore((s) => s.resolutions);
  const nextDay = useStore((s) => s.nextDay);

  if (!snapshot) return null;

  const quarter = snapshot.quarter;
  const label = QUARTER_LABELS[quarter - 1] ?? `Q${quarter}`;

  // Resolutions from this quarter (days (q-1)*25+1 .. q*25)
  const lo = (quarter - 1) * 25 + 1;
  const hi = quarter * 25;
  const quarterResolutions = resolutions.filter((r) => r.day >= lo && r.day <= hi);
  const vindicated = quarterResolutions.filter((r) => r.outcomeTier === 'vindicated').length;
  const missed = quarterResolutions.filter((r) => r.outcomeTier === 'missed-soft').length;
  const overreached = quarterResolutions.filter((r) => r.outcomeTier === 'overreacted').length;

  return (
    <div className="flex h-full max-w-md mx-auto flex-col bg-[#0b1220] border-x border-slate-900">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-amber-400 font-mono mb-2">
            quarter close · {label.toLowerCase()}
          </div>
          <h1 className="text-lg font-medium text-slate-100 mb-2">
            Board review.
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            The board takes stock. Past calls regress toward the institutional
            mean — a hot streak gets you partial credit, a rough stretch resets
            faster than you deserve. Bars start to drift toward the baseline.
          </p>
        </div>

        {/* Meter regression */}
        <div className="border border-slate-800 rounded-lg p-4 space-y-3 bg-slate-900/30">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-mono">
            meter regression
          </div>
          <DeltaRow label="trust" pre={snapshot.preTrust} post={snapshot.postTrust} kind="good" />
          <DeltaRow label="risk"  pre={snapshot.preRisk}  post={snapshot.postRisk}  kind="bad" />
          <div className="text-[10px] text-slate-600 font-mono pt-1">
            baseline · trust 55 · risk 25 · regression 40%
          </div>
        </div>

        {/* Quarter performance */}
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-mono">
            quarter performance · {quarterResolutions.length} cases closed
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="border border-emerald-700/40 rounded p-2 bg-emerald-900/10">
              <div className="text-lg font-mono tabular-nums text-emerald-300">{vindicated}</div>
              <div className="text-[9px] uppercase tracking-wider text-slate-500 font-mono mt-1">
                vindicated
              </div>
            </div>
            <div className="border border-amber-700/40 rounded p-2 bg-amber-900/10">
              <div className="text-lg font-mono tabular-nums text-amber-300">{missed}</div>
              <div className="text-[9px] uppercase tracking-wider text-slate-500 font-mono mt-1">
                missed
              </div>
            </div>
            <div className="border border-red-700/40 rounded p-2 bg-red-900/10">
              <div className="text-lg font-mono tabular-nums text-red-300">{overreached}</div>
              <div className="text-[9px] uppercase tracking-wider text-slate-500 font-mono mt-1">
                overreached
              </div>
            </div>
          </div>
        </div>

        {/* Next quarter framing */}
        <div className="border-l-2 border-amber-500/40 pl-3 text-sm text-slate-300 leading-relaxed">
          {quarter < 4 ? (
            <>
              Next quarter opens with the meters where the board thinks you{' '}
              <em className="text-slate-200">probably</em> are. Earn your way
              back to whatever number you had.
            </>
          ) : (
            <>The last quarter. Land it.</>
          )}
        </div>
      </div>

      {/* Footer button */}
      <div className="p-4 border-t border-slate-900">
        <button
          onClick={nextDay}
          className="w-full py-3 text-[11px] uppercase tracking-[0.3em] font-mono font-medium text-slate-950 bg-amber-400 rounded-lg active:bg-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
        >
          ▸ open {QUARTER_LABELS[quarter] ?? 'final stretch'}
        </button>
      </div>
    </div>
  );
}
