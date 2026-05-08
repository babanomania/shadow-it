import { useStore } from '../store';

export function TopBar() {
  const day = useStore((s) => s.day);
  const attention = useStore((s) => s.attention);
  const attentionMax = useStore((s) => s.attentionMax);
  const trust = useStore((s) => s.trust);
  const risk = useStore((s) => s.risk);
  const attPct = Math.round((attention / attentionMax) * 100);

  return (
    <header className="border-b border-slate-800 px-4 pt-3 pb-3 space-y-2">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] font-mono">
        <span className="text-slate-500">helix-corp · day {day}</span>
        <span className="text-slate-400">
          attention <span className="text-amber-400">{attention}</span>/{attentionMax}
        </span>
      </div>
      <div className="h-[2px] bg-slate-800 rounded">
        <div
          className="h-full bg-amber-500 rounded transition-all"
          style={{ width: `${attPct}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 pt-1">
        <Meter label="trust" value={trust} kind="good" />
        <Meter label="risk" value={risk} kind="bad" />
      </div>
    </header>
  );
}

function Meter({ label, value, kind }: { label: string; value: number; kind: 'good' | 'bad' }) {
  const color =
    kind === 'good'
      ? value > 50
        ? 'bg-emerald-500'
        : value > 25
          ? 'bg-amber-500'
          : 'bg-red-500'
      : value < 50
        ? 'bg-emerald-500'
        : value < 75
          ? 'bg-amber-500'
          : 'bg-red-500';
  return (
    <div>
      <div className="flex justify-between text-[10px] font-mono uppercase tracking-[0.15em]">
        <span className="text-slate-500">{label}</span>
        <span className="text-slate-300 tabular-nums">{value}</span>
      </div>
      <div className="h-[2px] bg-slate-800 rounded mt-1">
        <div
          className={`h-full ${color} rounded transition-all`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
