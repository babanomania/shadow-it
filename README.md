<p align="center">
  <img src="assets/hero.svg" alt="shadow-it" width="100%"/>
</p>

# shadow-it

> A mobile-browser detective/strategy game where you play head of governance & security at a fast-growing tech company. Departments break the rules behind your back. You catch them — or you don't.

**Papers Please × Splunk × office politics, in 3-minute commute sessions.**

## What is it?

You are the new VP of Governance & Security at *Helix Corp*. Behind your back, departments are spinning up unsanctioned cloud, piping customer data into unauthorized AI tools, exposing internal APIs, and leaking secrets. Your job is to investigate anomalies across **logs, emails, expenses, and network traffic** — cross-reference the four lenses to build cases, then decide: ignore, warn, escalate, or terminate.

Each call shifts board trust, department morale, and the company-wide breach risk. Survive the quarter without a breach — or a mutiny.

## Core loop

1. **Triage** — swipe through alerts; most are noise, a few are real
2. **Investigate** — pull evidence from the four surfaces; each pull costs attention budget
3. **Connect dots** — pin clues to a case board, link them to form hypotheses
4. **Decide** — ignore, warn, escalate, terminate; every choice has consequences
5. **Debrief** — missed threats detonate later as breaches; false alarms breed resentment

## Status

Early prototype. Vite + React + Tailwind scaffold is up. The core loop runs end-to-end on one seeded case: triage alerts, pin clues from logs, decide (ignore / warn / escalate / terminate), receive a verdict tier and narrative aftermath. Trust, risk, and per-department morale meters move on every decision. Persistence and additional cases are next.

Full design in [`SPEC.md`](SPEC.md). Operating notes for Claude Code in [`CLAUDE.md`](CLAUDE.md).

## Run it

```bash
npm install
npm run dev
```

Open the dev URL on your phone or in a narrow browser window. The app caps at 28rem wide — it's portrait-only on purpose.

## Stack (planned)

- **Frontend**: React + Vite + Tailwind, ships as a static PWA
- **State**: Zustand + IndexedDB
- **Hosting**: Cloudflare Pages / Vercel
- **No backend** for v1 — cases are authored as JSON in the repo

## Authoring with Gemma

Hand-authoring detective cases is expensive. Procedural generation at *runtime* makes patterns feel cheap. Middle path: use **Gemma 4 E4B** locally to draft hundreds of candidate cases — emails, log lines, expense justifications, department dialog — then hand-curate the best into the static dataset that ships with the game. LLM creative leverage at authoring time, deterministic gameplay at runtime.

## Roadmap

- [x] Game design spec
- [x] Vite + Tailwind scaffold
- [x] Triage inbox
- [x] Logs surface (filter + pin-to-case)
- [x] Case board (pinned clues view)
- [x] Decision UI + verdict logic (trust / risk / morale meters, 5 outcome tiers)
- [ ] IndexedDB persistence
- [ ] End-of-day debrief
- [ ] First 5 hand-authored cases (currently 1 seeded)
- [ ] Gemma case-authoring pipeline
- [ ] Emails surface
- [ ] PWA polish + deploy

## License

TBD.
