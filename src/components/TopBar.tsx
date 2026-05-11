import { useStore } from '../store';

function MeterBar({
  value,
  kind,
}: {
  value: number;
  kind: 'good' | 'bad';
}) {
  const danger =
    kind === 'good' ? value <= 25 : value >= 75;
  const caution =
    kind === 'good' ? value <= 50 : value >= 50;

  const barColor = danger
    ? 'bg-red-500'
    : caution
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  const glowColor = danger
    ? 'shadow-[0_0_6px_rgba(239,68,68,0.6)]'
    : caution
      ? 'shadow-[0_0_4px_rgba(245,158,11,0.4)]'
      : '';

  return (
    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${barColor} ${glowColor}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function TopBar() {
  const day = useStore((s) => s.day);
  const attention = useStore((s) => s.attention);
  const attentionMax = useStore((s) => s.attentionMax);
  const trust = useStore((s) => s.trust);
  const risk = useStore((s) => s.risk);
  const attPct = (attention / attentionMax) * 100;

  const trustDanger = trust <= 25;
  const riskDanger = risk >= 75;
  const anyDanger = trustDanger || riskDanger;

  return (
    <header className="border-b border-slate-800 bg-[#0b1220] px-4 pt-3 pb-3">
      {/* Title row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${anyDanger ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-slate-500">
            helix-corp
          </span>
          <span className="text-[10px] font-mono text-slate-700">·</span>
          <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-slate-400">
            day {day}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wider font-mono text-slate-600">attn</span>
          <span className={`text-[10px] font-mono tabular-nums ${attention <= 1 ? 'text-red-400' : 'text-amber-400'}`}>
            {attention}/{attentionMax}
          </span>
        </div>
      </div>

      {/* Attention bar */}
      <div className="h-1 bg-slate-800 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            attention <= 1 ? 'bg-red-500' : attention <= 3 ? 'bg-amber-500' : 'bg-amber-400'
          }`}
          style={{ width: `${attPct}%` }}
        />
      </div>

      {/* Meters */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <div className="flex justify-between text-[10px] font-mono uppercase tracking-[0.15em]">
          <span className="text-slate-500">trust</span>
          <span className={`tabular-nums ${trustDanger ? 'text-red-400' : 'text-slate-300'}`}>{trust}</span>
        </div>
        <div className="flex justify-between text-[10px] font-mono uppercase tracking-[0.15em]">
          <span className="text-slate-500">risk</span>
          <span className={`tabular-nums ${riskDanger ? 'text-red-400' : 'text-slate-300'}`}>{risk}</span>
        </div>
        <MeterBar value={trust} kind="good" />
        <MeterBar value={risk} kind="bad" />
      </div>
    </header>
  );
}
