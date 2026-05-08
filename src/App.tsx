import { useState } from 'react';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { TriageInbox } from './components/TriageInbox';
import { LogsSurface } from './components/LogsSurface';
import { CaseBoard } from './components/CaseBoard';
import { SurfaceStub } from './components/SurfaceStub';

export type Tab = 'triage' | 'logs' | 'emails' | 'cases';

export function App() {
  const [tab, setTab] = useState<Tab>('triage');

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
