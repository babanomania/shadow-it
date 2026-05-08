import { useEffect, useState } from 'react';
import { useStore } from './store';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { TriageInbox } from './components/TriageInbox';
import { LogsSurface } from './components/LogsSurface';
import { CaseBoard } from './components/CaseBoard';
import { SurfaceStub } from './components/SurfaceStub';

export type Tab = 'triage' | 'logs' | 'emails' | 'cases';

export function App() {
  const [hydrated, setHydrated] = useState(useStore.persist.hasHydrated());
  const [tab, setTab] = useState<Tab>('triage');

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

  return (
    <div className="flex h-full max-w-md mx-auto flex-col bg-[#0b1220] border-x border-slate-900">
      <TopBar />
      <main className="flex-1 overflow-y-auto">
        {tab === 'triage' && <TriageInbox onInvestigate={() => setTab('logs')} />}
        {tab === 'logs' && <LogsSurface />}
        {tab === 'emails' && (
          <SurfaceStub
            name="Emails"
            blurb="Threaded inbox lens. Coming after logs lands."
          />
        )}
        {tab === 'cases' && <CaseBoard />}
      </main>
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  );
}
