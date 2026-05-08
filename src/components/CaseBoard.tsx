import { useState } from 'react';
import { selectActiveCase, selectLastResolution, useStore } from '../store';
import type { ActionType, Case, EmailThread, LogEntry, OutcomeTier, Resolution } from '../types';

const ACTIONS: { id: ActionType; label: string; tone: string }[] = [
  { id: 'ignore', label: 'Ignore', tone: 'border-slate-700 text-slate-300' },
  { id: 'warn', label: 'Warn', tone: 'border-slate-600 text-slate-200' },
  { id: 'escalate', label: 'Escalate', tone: 'border-amber-700/50 text-amber-300' },
  { id: 'terminate', label: 'Terminate', tone: 'border-red-700/50 text-red-300' },
];

export function CaseBoard({ onContinue }: { onContinue: () => void }) {
  const status = useStore((s) => s.status);
  const lastResolution = useStore(selectLastResolution);
  const activeCase = useStore(selectActiveCase);
  const cases = useStore((s) => s.cases);

  if (status === 'day-end' && lastResolution) {
    const caseDef = cases.find((c) => c.id === lastResolution.caseId);
    if (caseDef) {
      return <ResolutionView resolution={lastResolution} caseDef={caseDef} onContinue={onContinue} />;
    }
  }

  if (!activeCase) {
    return (
      <div className="p-6 text-center">
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 mb-3 font-mono">
          case board
        </div>
        <p className="text-sm text-slate-500">No active investigation.</p>
      </div>
    );
  }

  return <ActiveCaseView caseDef={activeCase} />;
}

function ActiveCaseView({ caseDef }: { caseDef: Case }) {
  const logs = useStore((s) => s.logs);
  const emails = useStore((s) => s.emails);
  const pinnedClueIds = useStore((s) => s.pinnedClueIds);
  const togglePin = useStore((s) => s.togglePin);
  const decide = useStore((s) => s.decide);

  const pinnedLogs = logs.filter((l) => pinnedClueIds.includes(l.id));
  const pinnedEmails = emails.filter((e) => pinnedClueIds.includes(e.id));
  const pinnedTotal = pinnedLogs.length + pinnedEmails.length;

  return (
    <div className="p-3 space-y-4">
      <CaseHeader caseDef={caseDef} pinnedCount={pinnedTotal} />
      <PinnedClues
        pinnedLogs={pinnedLogs}
        pinnedEmails={pinnedEmails}
        onUnpin={togglePin}
      />
      <DecisionPanel
        caseDef={caseDef}
        onDecide={(action) => decide(caseDef.id, action)}
      />
    </div>
  );
}

function CaseHeader({ caseDef, pinnedCount }: { caseDef: Case; pinnedCount: number }) {
  return (
    <div className="border border-slate-800 rounded-lg p-3 bg-slate-900/30">
      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-mono mb-1">
        active investigation · {pinnedCount} clue{pinnedCount === 1 ? '' : 's'} pinned
      </div>
      <h2 className="text-sm font-medium text-slate-100 mb-2">{caseDef.title}</h2>
      <p className="text-xs text-slate-400 leading-relaxed">{caseDef.briefing}</p>
    </div>
  );
}

function PinnedClues({
  pinnedLogs,
  pinnedEmails,
  onUnpin,
}: {
  pinnedLogs: LogEntry[];
  pinnedEmails: EmailThread[];
  onUnpin: (id: string) => void;
}) {
  if (pinnedLogs.length === 0 && pinnedEmails.length === 0) {
    return (
      <div className="border border-dashed border-slate-800 rounded p-4 text-center">
        <p className="text-xs text-slate-500">
          No clues pinned. Open Logs or Emails and pin items you find suspicious.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pinnedLogs.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-mono px-1">
            logs · {pinnedLogs.length}
          </div>
          {pinnedLogs.map((l) => (
            <div
              key={l.id}
              className="border border-amber-700/30 bg-amber-900/10 rounded p-2 font-mono text-[12px]"
            >
              <div className="flex gap-2 flex-wrap">
                <span className="text-slate-500">{l.ts}</span>
                <span className="text-amber-300">
                  {l.service}.{l.event}
                </span>
                <span className="text-slate-500 truncate">{l.user}</span>
              </div>
              <div className="text-slate-400 mt-1 break-all">{l.detail}</div>
              <button
                onClick={() => onUnpin(l.id)}
                className="mt-2 text-[10px] uppercase tracking-wider text-slate-500 active:text-slate-200"
              >
                unpin
              </button>
            </div>
          ))}
        </div>
      )}
      {pinnedEmails.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-mono px-1">
            emails · {pinnedEmails.length}
          </div>
          {pinnedEmails.map((e) => (
            <div
              key={e.id}
              className="border border-amber-700/30 bg-amber-900/10 rounded p-2 text-[12px]"
            >
              <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                {e.ts} · {e.fromName}
              </div>
              <div className="text-amber-300 text-sm leading-snug">{e.subject}</div>
              <div className="text-slate-500 mt-1 text-[11px] font-mono">→ {e.to}</div>
              <button
                onClick={() => onUnpin(e.id)}
                className="mt-2 text-[10px] uppercase tracking-wider font-mono text-slate-500 active:text-slate-200"
              >
                unpin
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DecisionPanel({
  caseDef,
  onDecide,
}: {
  caseDef: Case;
  onDecide: (action: ActionType) => void;
}) {
  const [pending, setPending] = useState<ActionType | null>(null);

  if (pending) {
    const meta = ACTIONS.find((a) => a.id === pending)!;
    return (
      <div className="border border-slate-800 rounded p-3 bg-slate-900/40">
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-mono mb-2">
          confirm decision
        </div>
        <p className="text-sm text-slate-300 mb-1">
          <span className={`font-mono uppercase ${meta.tone.split(' ')[1]}`}>{meta.label}</span>{' '}
          on <span className="text-slate-100">{caseDef.title}</span>?
        </p>
        <p className="text-xs text-slate-500 mb-3">
          You can&apos;t take this back. Pinned clues become your evidence of record.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setPending(null)}
            className="py-2 text-[11px] uppercase tracking-wider text-slate-400 border border-slate-800 rounded active:bg-slate-800/50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onDecide(pending);
              setPending(null);
            }}
            className={`py-2 text-[11px] uppercase tracking-wider border rounded active:bg-slate-800/50 ${meta.tone}`}
          >
            Confirm {meta.label.toLowerCase()}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-slate-800 rounded p-3 bg-slate-900/40">
      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-mono mb-3">
        decision
      </div>
      <div className="grid grid-cols-2 gap-2">
        {ACTIONS.map((a) => (
          <button
            key={a.id}
            onClick={() => setPending(a.id)}
            className={`py-2 text-[11px] uppercase tracking-wider border rounded active:bg-slate-800/50 ${a.tone}`}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const OUTCOME_LABEL: Record<OutcomeTier, string> = {
  vindicated: 'vindicated',
  'right-partial': 'right call · thin paperwork',
  lucky: 'right answer · no proof',
  'missed-soft': 'missed it',
  overreacted: 'overreached',
};

const OUTCOME_TONE: Record<OutcomeTier, string> = {
  vindicated: 'text-emerald-400 border-emerald-700/40',
  'right-partial': 'text-amber-300 border-amber-700/40',
  lucky: 'text-amber-300 border-amber-700/40',
  'missed-soft': 'text-red-400 border-red-700/40',
  overreacted: 'text-red-400 border-red-700/40',
};

function ResolutionView({
  resolution,
  caseDef,
  onContinue,
}: {
  resolution: Resolution;
  caseDef: Case;
  onContinue: () => void;
}) {
  const day = useStore((s) => s.day);
  const totalDays = 5;
  const nextDay = useStore((s) => s.nextDay);
  const isLastDay = day >= totalDays;

  return (
    <div className="p-4 space-y-4">
      <div
        className={`border rounded-lg p-3 ${OUTCOME_TONE[resolution.outcomeTier]} bg-slate-900/40`}
      >
        <div className="text-[10px] uppercase tracking-[0.2em] font-mono mb-1 opacity-70">
          verdict · day {resolution.day}
        </div>
        <div className="text-sm font-mono uppercase tracking-wider">
          {OUTCOME_LABEL[resolution.outcomeTier]}
        </div>
        <div className="text-[11px] text-slate-500 mt-1 font-mono uppercase tracking-wider">
          you chose: {resolution.action}
        </div>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-mono mb-1">
          {caseDef.title}
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{resolution.narrative}</p>
      </div>

      <div className="border border-slate-800 rounded p-3 bg-slate-900/30">
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-mono mb-2">
          aftermath
        </div>
        <div className="space-y-1.5 text-xs font-mono">
          <DeltaRow label="trust" delta={resolution.trustDelta} good />
          <DeltaRow label="risk" delta={resolution.riskDelta} good={false} />
          {Object.entries(resolution.moraleDeltas).map(([dept, d]) => (
            <DeltaRow key={dept} label={`${dept} morale`} delta={d} good />
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          nextDay();
          onContinue();
        }}
        className="w-full py-3 text-[11px] uppercase tracking-[0.2em] text-amber-300 border border-amber-700/40 rounded font-mono active:bg-amber-900/30"
      >
        {isLastDay ? 'wrap the quarter' : `advance to day ${day + 1}`}
      </button>
    </div>
  );
}

function DeltaRow({ label, delta, good }: { label: string; delta: number; good: boolean }) {
  if (delta === 0) {
    return (
      <div className="flex justify-between">
        <span className="text-slate-500 uppercase tracking-wider">{label}</span>
        <span className="text-slate-600">no change</span>
      </div>
    );
  }
  const positive = good ? delta > 0 : delta < 0;
  const color = positive ? 'text-emerald-400' : 'text-red-400';
  const sign = delta > 0 ? '+' : '';
  return (
    <div className="flex justify-between">
      <span className="text-slate-500 uppercase tracking-wider">{label}</span>
      <span className={color}>
        {sign}
        {delta}
      </span>
    </div>
  );
}
