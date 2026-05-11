import type { Tab } from '../App';
import { useStore } from '../store';

const TARGET_EVIDENCE = 3;

const tabs: { id: Tab; label: string; hint: string }[] = [
  { id: 'desk',    label: 'Desk',    hint: 'inbox · case · decide' },
  { id: 'records', label: 'Records', hint: 'logs · email · $ · traffic' },
];

export function BottomNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const pendingCount = useStore(
    (s) => s.alerts.filter((a) => a.triaged === 'pending').length,
  );
  const pinnedCount = useStore((s) => s.pinnedClueIds.length);

  const badge = (id: Tab): { count: number; tone: 'pending' | 'good' | 'progress' } | null => {
    if (id === 'desk' && pendingCount > 0) {
      return { count: pendingCount, tone: 'pending' };
    }
    if (id === 'records' && pinnedCount > 0) {
      return {
        count: pinnedCount,
        tone: pinnedCount >= TARGET_EVIDENCE ? 'good' : 'progress',
      };
    }
    return null;
  };

  return (
    <nav className="border-t border-slate-800 grid grid-cols-2 bg-[#0b1220]">
      {tabs.map((t) => {
        const active = t.id === tab;
        const b = badge(t.id);
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`relative py-2.5 flex flex-col items-center gap-0.5 transition-colors ${
              active ? 'text-amber-400' : 'text-slate-500 active:text-slate-200'
            }`}
          >
            {active && (
              <span className="absolute top-0 inset-x-8 h-[2px] bg-amber-400 rounded-b-sm" />
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] uppercase tracking-[0.2em] font-mono font-medium">
                {t.label}
              </span>
              {b !== null && (
                <span
                  className={`inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-mono rounded-full ${
                    active
                      ? b.tone === 'good'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-amber-500 text-slate-950'
                      : b.tone === 'good'
                        ? 'bg-emerald-700/70 text-emerald-100'
                        : b.tone === 'pending'
                          ? 'bg-red-800/80 text-red-100'
                          : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {b.count}
                </span>
              )}
            </div>
            <span className={`text-[9px] font-mono tracking-wider ${active ? 'text-amber-400/70' : 'text-slate-700'}`}>
              {t.hint}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
