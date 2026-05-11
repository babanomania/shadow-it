import { useEffect, useState } from 'react';
import { useStore } from './store';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { TriageInbox } from './components/TriageInbox';
import { LogsSurface } from './components/LogsSurface';
import { EmailsSurface } from './components/EmailsSurface';
import { ExpensesSurface } from './components/ExpensesSurface';
import { TrafficSurface } from './components/TrafficSurface';
import { CaseBoard } from './components/CaseBoard';
import { GameOverScreen } from './components/GameOverScreen';
import { WinScreen } from './components/WinScreen';
import type { Surface } from './types';

export type Tab = 'triage' | 'surfaces' | 'cases';

const SURFACE_TO_TAB: Record<Surface, Tab> = {
  logs: 'surfaces',
  emails: 'surfaces',
  expenses: 'surfaces',
  traffic: 'surfaces',
};

const SURFACES: { id: Surface; label: string }[] = [
  { id: 'logs', label: 'Logs' },
  { id: 'emails', label: 'Email' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'traffic', label: 'Traffic' },
];

function SurfaceChips({
  active,
  onChange,
}: {
  active: Surface;
  onChange: (s: Surface) => void;
}) {
  return (
    <div className="flex gap-1 px-3 pt-2 pb-1 border-b border-slate-800/60 bg-[#0b1220]">
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

export function App() {
  const [hydrated, setHydrated] = useState(useStore.persist.hasHydrated());
  const [tab, setTab] = useState<Tab>('triage');
  const [surface, setSurface] = useState<Surface>('logs');
  const status = useStore((s) => s.status);

  useEffect(() => {
    if (useStore.persist.hasHydrated()) setHydrated(true);
    return useStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  const handleInvestigate = (s: Surface) => {
    setSurface(s);
    setTab(SURFACE_TO_TAB[s]);
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
        {tab === 'triage' && <TriageInbox onInvestigate={handleInvestigate} />}
        {tab === 'surfaces' && (
          <>
            <SurfaceChips active={surface} onChange={setSurface} />
            {surface === 'logs' && <LogsSurface />}
            {surface === 'emails' && <EmailsSurface />}
            {surface === 'expenses' && <ExpensesSurface />}
            {surface === 'traffic' && <TrafficSurface />}
          </>
        )}
        {tab === 'cases' && <CaseBoard onContinue={() => setTab('triage')} />}
      </main>
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  );
}
