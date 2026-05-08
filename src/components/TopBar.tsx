import { useStore } from '../store';

export function TopBar() {
  const day = useStore((s) => s.day);
  const attention = useStore((s) => s.attention);
  const attentionMax = useStore((s) => s.attentionMax);
  const pct = Math.round((attention / attentionMax) * 100);

  return (
    <header className="border-b border-slate-800 px-4 pt-4 pb-3">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] font-mono">
        <span className="text-slate-500">helix-corp · day {day}</span>
        <span className="text-slate-400">
          attention <span className="text-amber-400">{attention}</span>/{attentionMax}
        </span>
      </div>
      <div className="mt-2 h-[3px] bg-slate-800 rounded">
        <div
          className="h-full bg-amber-500 rounded transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </header>
  );
}
