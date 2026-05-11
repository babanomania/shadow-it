import { useStore } from '../store';

const FEATURES: { title: string; body: string }[] = [
  {
    title: 'Cross-reference four lenses',
    body: 'Logs, email, expenses, traffic. The story only emerges when you read all of them.',
  },
  {
    title: 'Five hand-authored cases',
    body: 'Shadow AI, side-cloud, accidental leak, exposed API, insider exfil. One per day.',
  },
  {
    title: 'Three-minute commute sessions',
    body: 'Mobile-first, portrait-only, no twitch timers. Built for a single thumb.',
  },
];

function TerminalBlock() {
  return (
    <div className="rounded-lg border border-emerald-900/40 bg-black/40 p-3 font-mono text-[11px] leading-relaxed">
      <div className="text-emerald-500/80">
        <span className="text-slate-600">$</span> ssh vp@helix.corp
      </div>
      <div className="text-slate-500">
        <span className="text-slate-700">*</span> authenticated{' '}
        <span className="text-slate-700">·</span>{' '}
        <span className="text-amber-400">q3</span>{' '}
        <span className="text-slate-700">·</span>{' '}
        <span className="text-amber-400">week 2</span>
      </div>
      <div className="text-slate-500">
        <span className="text-slate-700">*</span> anomalies pending{' '}
        <span className="text-slate-700">·</span>{' '}
        <span className="text-red-400">7</span>
      </div>
      <div className="text-slate-500">
        <span className="text-slate-700">*</span> board trust{' '}
        <span className="text-slate-700">·</span>{' '}
        <span className="text-emerald-400">60</span> / 100
      </div>
      <div className="text-slate-600">
        <span className="text-slate-700">~$</span>{' '}
        <span className="text-amber-400 animate-pulse">_</span>
      </div>
    </div>
  );
}

function FaintLogLine({
  ts,
  service,
  text,
  className = '',
}: {
  ts: string;
  service: string;
  text: string;
  className?: string;
}) {
  return (
    <div className={`flex gap-2 font-mono text-[10px] whitespace-nowrap ${className}`}>
      <span className="text-slate-800">{ts}</span>
      <span className="text-slate-700">{service}</span>
      <span className="text-slate-700">{text}</span>
    </div>
  );
}

export function LandingPage({ onStart }: { onStart: () => void }) {
  const day = useStore((s) => s.day);
  const status = useStore((s) => s.status);
  const resolutions = useStore((s) => s.resolutions);
  const reset = useStore((s) => s.reset);

  const hasProgress =
    (status === 'playing' || status === 'day-end') &&
    (day > 1 || resolutions.length > 0);

  const isFinished = status === 'won' || status === 'game-over';

  const handleStartFresh = () => {
    reset();
    onStart();
  };

  return (
    <div className="relative flex h-full max-w-md mx-auto flex-col bg-[#0b1220] border-x border-slate-900 overflow-hidden">
      {/* Faint scrolling log lines background — purely decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-2 -left-4 right-0 space-y-2 transform -rotate-1">
          <FaintLogLine ts="14:03:01" service="api.export" text="table=customers rows=12481" />
          <FaintLogLine ts="14:03:29" service="traffic.egress" text="dest=api.unknown-llm.io 4.2GB" />
          <FaintLogLine ts="09:14:03" service="expense.charge" text='vendor="claude-pro-team" $200' />
          <FaintLogLine ts="11:42:50" service="iam.role.create" text="trust=external" />
          <FaintLogLine ts="23:14:02" service="hr.export" text="rows=482 size=2.1GB" />
          <FaintLogLine ts="23:18:39" service="traffic.egress" text="dest=consumer-drive.com" />
          <FaintLogLine ts="08:47:09" service="github.gist.publish" text="visibility=public" />
        </div>
        <div className="absolute bottom-10 -right-4 left-8 space-y-2 transform rotate-2">
          <FaintLogLine ts="10:28:50" service="secret-scanner.alert" text="pattern=api-token" />
          <FaintLogLine ts="14:08:51" service="email" text="→ personalmail.com" />
          <FaintLogLine ts="09:12:44" service="api.token.create" text="ttl=null partner=external" />
          <FaintLogLine ts="13:19:55" service="legal.dpa.lookup" text="NOT_FOUND" />
        </div>
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0b1220]/60 to-[#0b1220] pointer-events-none" />
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-red-500/5 blur-3xl pointer-events-none" />

      <div className="relative flex-1 flex flex-col overflow-y-auto p-5">
        {/* Top brand strip */}
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.25em] mb-8">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-500">helix·corp</span>
            <span className="text-slate-800">·</span>
            <span className="text-slate-600">governance terminal</span>
          </div>
          <span className="text-slate-700">v0.0.1</span>
        </div>

        {/* Anomaly stamp */}
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-red-400">
            anomaly detected
          </span>
        </div>

        {/* Hero title */}
        <h1 className="text-5xl font-bold tracking-tight leading-none mb-2 bg-gradient-to-b from-slate-50 to-slate-400 bg-clip-text text-transparent">
          shadow
          <span className="text-amber-400 bg-clip-text">_</span>
          <span className="bg-gradient-to-b from-slate-50 to-slate-400 bg-clip-text text-transparent">it</span>
        </h1>

        <p className="text-[12px] font-mono uppercase tracking-[0.2em] text-slate-500 mb-5">
          papers please × splunk × office politics
        </p>

        {/* Pitch */}
        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          You are the new VP of Governance &amp; Security at Helix Corp.
          Behind your back, departments are wiring customer data into
          unauthorized AI tools, leaking secrets, exposing internal APIs.
        </p>

        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          Investigate <span className="text-amber-300">anomalies</span> across logs,
          email, expenses, and traffic. Pin clues. Decide:{' '}
          <span className="text-slate-400">ignore</span>,{' '}
          <span className="text-slate-200">warn</span>,{' '}
          <span className="text-amber-400">escalate</span>,{' '}
          <span className="text-red-400">terminate</span>. Survive the quarter without a breach — or a mutiny.
        </p>

        {/* Terminal preview */}
        <div className="mb-6">
          <TerminalBlock />
        </div>

        {/* Feature pillars */}
        <div className="space-y-2 mb-8">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="rounded-lg border border-slate-800 bg-slate-900/40 p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-amber-400 tabular-nums">
                  0{i + 1}
                </span>
                <h3 className="text-[12px] font-mono uppercase tracking-wider text-slate-200">
                  {f.title}
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pl-5">
                {f.body}
              </p>
            </div>
          ))}
        </div>

        {/* CTA stack */}
        <div className="space-y-2 mb-4">
          {hasProgress && !isFinished ? (
            <>
              <button
                onClick={onStart}
                className="w-full py-4 text-[12px] uppercase tracking-[0.3em] font-mono font-medium text-slate-950 bg-amber-400 rounded-lg active:bg-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
              >
                ▸ resume run · day {day}
              </button>
              <button
                onClick={handleStartFresh}
                className="w-full py-3 text-[11px] uppercase tracking-[0.25em] font-mono text-slate-400 border border-slate-700 rounded-lg active:bg-slate-800/50"
              >
                start fresh
              </button>
            </>
          ) : (
            <button
              onClick={isFinished ? handleStartFresh : onStart}
              className="w-full py-4 text-[12px] uppercase tracking-[0.3em] font-mono font-medium text-slate-950 bg-amber-400 rounded-lg active:bg-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            >
              {isFinished ? '▸ start new run' : '▸ begin investigation'}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-700">
            <span>5 days · 5 cases</span>
            <span>·</span>
            <span>early prototype</span>
          </div>
        </div>
      </div>
    </div>
  );
}
