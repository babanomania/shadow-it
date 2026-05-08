import { useEffect, useState } from 'react';
import { useStore } from './store';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { TriageInbox } from './components/TriageInbox';
import { LogsSurface } from './components/LogsSurface';
import { EmailsSurface } from './components/EmailsSurface';
import { CaseBoard } from './components/CaseBoard';
import { GameOverScreen } from './components/GameOverScreen';
import { WinScreen } from './components/WinScreen';
import type { Surface } from './types';

export type Tab = 'triage' | 'logs' | 'emails' | 'cases';

const SURFACE_TO_TAB: Record<Surface, Tab> = {
  logs: 'logs',
  emails: 'emails',
  expenses: 'logs',
  traffic: 'logs',
};

export function App() {
  const [hydrated, setHydrated] = useState(useStore.persist.hasHydrated());
  const [tab, setTab] = useState<Tab>('triage');
  const status = useStore((s) => s.status);

  useEffect(() => {
    if (useStore.persist.hasHydrated()) setHydrated(true);
    return useStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

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
        {tab === 'triage' && (
          <TriageInbox onInvestigate={(surface) => setTab(SURFACE_TO_TAB[surface])} />
        )}
        {tab === 'logs' && <LogsSurface />}
        {tab === 'emails' && <EmailsSurface />}
        {tab === 'cases' && <CaseBoard onContinue={() => setTab('triage')} />}
      </main>
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  );
}
