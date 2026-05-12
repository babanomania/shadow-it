import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useStore, selectAllPinnedClueIds } from './store';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { CasesTab } from './components/CasesTab';
import { LogsSurface } from './components/LogsSurface';
import { EmailsSurface } from './components/EmailsSurface';
import { ExpensesSurface } from './components/ExpensesSurface';
import { TrafficSurface } from './components/TrafficSurface';
import { GameOverScreen } from './components/GameOverScreen';
import { WinScreen } from './components/WinScreen';
import { LandingPage } from './components/LandingPage';
import { QuarterEndScreen } from './components/QuarterEndScreen';
import type { Surface } from './types';

export type Tab = 'desk' | 'records';

const TARGET_EVIDENCE = 3;

// ─── INLINE SURFACE ICONS ───────────────────────────────────────────────────

function SurfaceIcon({ surface, className = 'w-4 h-4' }: { surface: Surface; className?: string }) {
  const icons: Record<Surface, JSX.Element> = {
    logs: (
      <svg viewBox="0 0 16 16" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
        <path d="M3 5l3 3-3 3M8 11h5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    emails: (
      <svg viewBox="0 0 16 16" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="4" width="12" height="8" rx="1" />
        <path d="M2.5 5l5.5 4 5.5-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    expenses: (
      <svg viewBox="0 0 16 16" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
        <path d="M8 3v10M10.5 5.5h-3a1.75 1.75 0 100 3.5h1a1.75 1.75 0 110 3.5h-3" strokeLinecap="round" />
      </svg>
    ),
    traffic: (
      <svg viewBox="0 0 16 16" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
        <path d="M2 11h2l1.5-3.5L7.5 12 10 4l1.5 5H14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };
  return icons[surface];
}

const SURFACE_META: Record<Surface, { label: string; accent: string; activeAccent: string }> = {
  logs:     { label: 'Logs',     accent: 'text-slate-400',   activeAccent: 'text-slate-100' },
  emails:   { label: 'Email',    accent: 'text-violet-400',  activeAccent: 'text-violet-200' },
  expenses: { label: 'Expenses', accent: 'text-emerald-400', activeAccent: 'text-emerald-200' },
  traffic:  { label: 'Traffic',  accent: 'text-cyan-400',    activeAccent: 'text-cyan-200' },
};

const SURFACE_ORDER: Surface[] = ['logs', 'emails', 'expenses', 'traffic'];

function SurfaceTabBar({
  active,
  onChange,
}: {
  active: Surface;
  onChange: (s: Surface) => void;
}) {
  const logs = useStore((s) => s.logs);
  const emails = useStore((s) => s.emails);
  const allPinned = useStore(selectAllPinnedClueIds);

  const counts: Record<Surface, number> = {
    logs: logs.length,
    emails: emails.length,
    expenses: logs.filter((l) => l.service === 'expense').length,
    traffic: logs.filter((l) => l.service === 'traffic').length,
  };

  const pinnedPer: Record<Surface, number> = {
    logs: logs.filter((l) => allPinned.has(l.id) && l.service !== 'expense' && l.service !== 'traffic').length,
    emails: emails.filter((e) => allPinned.has(e.id)).length,
    expenses: logs.filter((l) => l.service === 'expense' && allPinned.has(l.id)).length,
    traffic: logs.filter((l) => l.service === 'traffic' && allPinned.has(l.id)).length,
  };

  return (
    <div className="grid grid-cols-4 border-b border-slate-800 bg-[#0b1220]">
      {SURFACE_ORDER.map((s) => {
        const isActive = s === active;
        const meta = SURFACE_META[s];
        const pinned = pinnedPer[s];
        return (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`relative py-2.5 flex flex-col items-center gap-0.5 transition-colors ${
              isActive
                ? 'bg-slate-900/60'
                : 'active:bg-slate-900/30'
            }`}
          >
            {isActive && (
              <span className="absolute top-0 inset-x-2 h-[2px] bg-amber-400 rounded-b-sm" />
            )}
            <span className={isActive ? meta.activeAccent : meta.accent}>
              <SurfaceIcon surface={s} className="w-4 h-4" />
            </span>
            <span
              className={`text-[10px] uppercase tracking-wider font-mono ${
                isActive ? 'text-slate-100' : 'text-slate-500'
              }`}
            >
              {meta.label}
            </span>
            <span
              className={`text-[9px] font-mono tabular-nums ${
                isActive ? meta.activeAccent : 'text-slate-600'
              }`}
            >
              {counts[s]}
            </span>
            {pinned > 0 && (
              <span className="absolute top-1 right-2 w-3.5 h-3.5 rounded-full bg-amber-500/90 text-slate-950 text-[9px] font-mono flex items-center justify-center">
                {pinned}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function EvidenceCounterStrip() {
  const allPinned = useStore(selectAllPinnedClueIds);
  const pinnedCount = allPinned.size;
  const reached = pinnedCount >= TARGET_EVIDENCE;
  const slots = Math.max(TARGET_EVIDENCE, pinnedCount);

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-1.5 border-b border-slate-800/60 bg-slate-950/40">
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
                filled ? (reached ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-slate-800'
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
  const [started, setStarted] = useState(false);
  const [tab, setTab] = useState<Tab>('desk');
  const [surface, setSurface] = useState<Surface>('logs');
  const status = useStore((s) => s.status);

  useEffect(() => {
    if (useStore.persist.hasHydrated()) setHydrated(true);
    return useStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  const handleInvestigate = (s: Surface) => {
    setSurface(s);
    setTab('records');
  };

  const handleExit = () => {
    setStarted(false);
    setTab('desk');
    setSurface('logs');
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

  if (!started) {
    return <LandingPage onStart={() => setStarted(true)} />;
  }

  if (status === 'game-over') return <GameOverScreen onExit={handleExit} />;
  if (status === 'won') return <WinScreen onExit={handleExit} />;
  if (status === 'quarter-end') return <QuarterEndScreen />;

  return (
    <div className="flex h-full max-w-md mx-auto flex-col bg-[#0b1220] border-x border-slate-900">
      <TopBar onExit={handleExit} />
      <main className="flex-1 overflow-y-auto">
        {tab === 'desk' && <CasesTab onInvestigate={handleInvestigate} />}
        {tab === 'records' && (
          <>
            <SurfaceTabBar active={surface} onChange={setSurface} />
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
