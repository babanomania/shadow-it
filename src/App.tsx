import { useEffect, useState } from 'react';
import { useStore } from './store';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { CasesTab } from './components/CasesTab';
import { LogsSurface } from './components/LogsSurface';
import { EmailsSurface } from './components/EmailsSurface';
import { ExpensesSurface } from './components/ExpensesSurface';
import { TrafficSurface } from './components/TrafficSurface';
import { GameOverScreen } from './components/GameOverScreen';
import { WinScreen } from './components/WinScreen';
import type { Surface } from './types';

export type Tab = 'cases' | 'surfaces';

const SURFACES: { id: Surface; label: string }[] = [
  { id: 'logs', label: 'Logs' },
  { id: 'emails', label: 'Email' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'traffic', label: 'Traffic' },
];

const TARGET_EVIDENCE = 3;

function SurfaceChips({
  active,
  onChange,
}: {
  active: Surface;
  onChange: (s: Surface) => void;
}) {
  return (
    <div className="flex gap-1 px-3 pt-2 pb-1 bg-[#0b1220]">
      {SURFACES.map((s) => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          className={`px-2 py-1 text-[10px] uppercase tracking-wider rounded font-mono border transition-colors ${
            active === s.id
              ? 'bg-slate-800 text-slate-100 border-slate-700'
              : 'bg-transparent text-slate-500 border-slate-800 active:text-slate-200'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

function EvidenceCounterStrip() {
  const pinnedCount = useStore((s) => s.pinnedClueIds.length);
  const reached = pinnedCount >= TARGET_EVIDENCE;
  const slots = Math.max(TARGET_EVIDENCE, pinnedCount);

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-slate-800/60 bg-[#0b1220]">
      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider">
        <span className="text-slate-600">evidence</span>
        <span className={reached ? 'text-emerald-400' : 'text-amber-400'}>
          {pinnedCount} pinned
        </span>
        <span className="text-slate-700">
          {reached ? '✓' : `· target ${TARGET_EVIDENCE}+`}
        </span>
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: slots }).map((_, i) => {
          const filled = i < pinnedCount;
          return (
            <div
              key={i}
              className={`w-3 h-1.5 rounded-sm ${
                filled
                  ? reached
                    ? 'bg-emerald-500'
                    : 'bg-amber-500'
                  : 'bg-slate-800'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

export function App() {
  const [hydrated, setHydrated] = useState(useStore.persist.hasHydrated());
  const [tab, setTab] = useState<Tab>('cases');
  const [surface, setSurface] = useState<Surface>('logs');
  const status = useStore((s) => s.status);

  useEffect(() => {
    if (useStore.persist.hasHydrated()) setHydrated(true);
    return useStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  const handleInvestigate = (s: Surface) => {
    setSurface(s);
    setTab('surfaces');
  };

  if (!hydrated) {
    return (
      <div className="flex h-full max-w-md mx-auto flex-col items-center justify-center bg-[#0b1220] border-x border-slate-900">
        <div className="font-mono text-slate-400 text-sm">
          <span className="text-slate-600">$ </span>shadow-it
          <span className="text-amber-400 animate-pulse">_</span>
        </div>
        <div className="mt-3 text-[10px] uppercase tracking-[0.2em] text-slate-700 font-mono">
          rehydrating
        </div>
      </div>
    );
  }

  if (status === 'game-over') return <GameOverScreen />;
  if (status === 'won') return <WinScreen />;

  return (
    <div className="flex h-full max-w-md mx-auto flex-col bg-[#0b1220] border-x border-slate-900">
      <TopBar />
      <main className="flex-1 overflow-y-auto">
        {tab === 'cases' && <CasesTab onInvestigate={handleInvestigate} />}
        {tab === 'surfaces' && (
          <>
            <SurfaceChips active={surface} onChange={setSurface} />
            <EvidenceCounterStrip />
            {surface === 'logs' && <LogsSurface />}
            {surface === 'emails' && <EmailsSurface />}
            {surface === 'expenses' && <ExpensesSurface />}
            {surface === 'traffic' && <TrafficSurface />}
          </>
        )}
      </main>
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  );
}
