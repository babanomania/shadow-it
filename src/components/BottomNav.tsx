import type { Tab } from '../App';
import { useStore } from '../store';

const tabs: { id: Tab; label: string }[] = [
  { id: 'triage', label: 'Triage' },
  { id: 'logs', label: 'Logs' },
  { id: 'emails', label: 'Emails' },
  { id: 'cases', label: 'Cases' },
];

export function BottomNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const pendingCount = useStore(
    (s) => s.alerts.filter((a) => a.triaged === 'pending').length,
  );
  const pinnedCount = useStore((s) => s.pinnedClueIds.length);

  const badge = (id: Tab): number | null => {
    if (id === 'triage' && pendingCount > 0) return pendingCount;
    if (id === 'cases' && pinnedCount > 0) return pinnedCount;
    return null;
  };

  return (
    <nav className="border-t border-slate-800 grid grid-cols-4 bg-[#0b1220]">
      {tabs.map((t) => {
        const active = t.id === tab;
        const count = badge(t.id);
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`relative py-3 text-[10px] uppercase tracking-[0.2em] font-mono transition-colors ${
              active ? 'text-amber-400' : 'text-slate-500 active:text-slate-200'
            }`}
          >
            {t.label}
            {count !== null && (
              <span
                className={`absolute top-2 ml-1 inline-block min-w-[14px] px-[3px] text-[9px] leading-[14px] rounded ${
                  active
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
