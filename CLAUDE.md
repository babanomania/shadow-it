# CLAUDE.md

Operating notes for Claude Code working in this repo. The full game design is in [`SPEC.md`](SPEC.md) — read it once per fresh session before suggesting changes.

## What this is

A mobile-browser detective/strategy game. Player is head of governance & security; investigates shadow IT across logs, emails, expenses, traffic. Detective-first, strategy-second. Three-minute commute sessions.

## Locked-in decisions

- **Delivery**: static PWA. No native app, no backend in v1.
- **Stack**: React + Vite + Tailwind, Zustand for state, IndexedDB (`idb-keyval`) for persistence.
- **Hosting**: Cloudflare Pages or Vercel.
- **Cases**: hand-curated JSON in the repo. LLM (Gemma 4 E4B, locally) is used at *authoring time* to draft candidates, not at runtime.
- **UX**: portrait only, one-thumb operation, dark mode default. No twitch timers.
- **Aesthetic**: terminal-meets-corporate. Mono for data, sans for chrome. Restrained palette (slate, amber, red, green).

## Rejected paths — don't relitigate

- **Android-only with on-device LLM.** Loses zero-install / link-shareable / instant-load. ~5x scope for marginal gain.
- **Runtime LLM for game logic.** Latency kills swipe UX; non-determinism makes case correctness unprovable.
- **Procedural case generation at runtime for v1.** Patterns leak fast and kill mystique. Revisit only after authored cases prove the mechanic.
- **Tycoon-style "build your security team" framing.** This is a detective game; the cross-referencing puzzle is the fun.

## MVP must-haves vs. defer

**Must-have (or the game has no game):** triage inbox, logs surface, emails surface (stripped), case board with pin/link, 4-action decision UI, 5 hand-authored cases, IndexedDB persistence.

**Deferred:** expenses & traffic surfaces, procedural generation, meta-progression / quarters, policies system, audio, monetization, multiplayer.

## Conventions

- **Commits**: imperative subject under ~70 chars; body explains *why*. Always include `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>` trailer. Use HEREDOC for the message.
- **Docs**: terse. No fluff intros, no closing summaries. Bullets > paragraphs when listing.
- **Code comments**: default to none. Only when *why* is non-obvious.
- **No emojis** unless explicitly requested.
- **Tone**: dry, slightly weary. Never jokey.

## Current focus

Pre-prototype. Spec + README + hero are in. Next steps (in order):
1. Paper prototype: 5 index-card cases playtested on 2–3 friends. Does the cross-referencing click without explanation?
2. If yes, scaffold Vite + Tailwind, build logs surface and triage inbox first.
3. Author 5 cases as JSON; wire end-to-end.
4. Mobile gesture polish *last* — puzzle has to be fun on desktop first.

Update this section when the focus shifts.
