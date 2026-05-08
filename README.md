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

Pre-prototype. Full design in [`SPEC.md`](SPEC.md). MVP scope: ~1–2 weeks of solo work.

## Stack (planned)

- **Frontend**: React + Vite + Tailwind, ships as a static PWA
- **State**: Zustand + IndexedDB
- **Hosting**: Cloudflare Pages / Vercel
- **No backend** for v1 — cases are authored as JSON in the repo

## Authoring with Gemma

Hand-authoring detective cases is expensive. Procedural generation at *runtime* makes patterns feel cheap. Middle path: use **Gemma 3n** locally to draft hundreds of candidate cases — emails, log lines, expense justifications, department dialog — then hand-curate the best into the static dataset that ships with the game. LLM creative leverage at authoring time, deterministic gameplay at runtime.

## Roadmap

- [x] Game design spec
- [ ] Paper prototype — index-card playtests of the cross-referencing puzzle
- [ ] Vite + Tailwind scaffold
- [ ] Logs surface + triage inbox
- [ ] First 5 hand-authored cases
- [ ] Gemma case-authoring pipeline
- [ ] Emails surface
- [ ] Case board with pin/link
- [ ] End-of-day debrief
- [ ] PWA polish + deploy

## License

TBD.
