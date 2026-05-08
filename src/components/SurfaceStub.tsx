export function SurfaceStub({ name, blurb }: { name: string; blurb: string }) {
  return (
    <div className="p-6 text-center">
      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 mb-2 font-mono">
        {name}
      </div>
      <p className="text-sm text-slate-500">{blurb}</p>
    </div>
  );
}
