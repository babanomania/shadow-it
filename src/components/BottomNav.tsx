import type { Tab } from '../App';
import { useStore } from '../store';

const TARGET_EVIDENCE = 3;

const tabs: { id: Tab; label: string }[] = [
  { id: 'cases', label: 'Cases' },
  { id: 'surfaces', label: 'Surfaces' },
];

export function BottomNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const pendingCount = useStore(
    (s) => s.alerts.filter((a) => a.triaged === 'pending').length,
  );
  const pinnedCount = useStore((s) => s.pinnedClueIds.length);

  const badge = (id: Tab): { count: number; tone: 'pending' | 'good' | 'progress' } | null => {
    if (id === 'cases' && pendingCount > 0) {
      return { count: pendingCount, tone: 'pending' };
    }
    if (id === 'surfaces' && pinnedCount > 0) {
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
            className={`relative py-3 text-[10px] uppercase tracking-[0.2em] font-mono transition-colors ${
              active ? 'text-amber-400' : 'text-slate-500 active:text-slate-200'
            }`}
          >
            {t.label}
            {b !== null && (
              <span
                className={`absolute top-2 ml-1 inline-block min-w-[14px] px-[3px] text-[9px] leading-[14px] rounded ${
                  active
                    ? b.tone === 'good'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-amber-500 text-slate-950'
                    : b.tone === 'good'
                      ? 'bg-emerald-700/70 text-emerald-100'
                      : b.tone === 'pending'
                        ? 'bg-red-800/70 text-red-100'
                        : 'bg-slate-800 text-slate-300'
                }`}
              >
                {b.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
