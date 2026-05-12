<p align="center">
  <img src="assets/hero.svg" alt="shadow-it" width="100%"/>
</p>

# Shadow IT

> A mobile-browser detective/strategy game where you play head of governance & security at a fast-growing tech company. Departments break the rules behind your back. You catch them — or you don't.

<p align="center">
  <a href="https://babanomania.github.io/shadow-it/">
    <img src="https://img.shields.io/badge/%E2%96%B6%20Play%20Now-shadow--it-F59E0B?style=for-the-badge&labelColor=0b1220" alt="Play Now" />
  </a>
</p>

> Best on mobile (portrait). Works in any modern browser — no install, no account, no approval required from your IT department (the irony is not lost on us).

**Papers Please × Splunk × office politics, in 3-minute commute sessions.**

## What is it?

You are the new VP of Governance & Security at *Helix Corp*. Congratulations on the promotion. You have no budget, no staff, and a SIEM that's been throwing 7 unresolved anomalies since Q2. Morale is "fine."

Behind your back: Engineering is running a personal AWS account on the corporate card. Design forwarded the product roadmap to their Notion. Finance accessed the director-band comp table and is now "just asking questions" on LinkedIn. Someone's Slack is billing $200/month for an AI assistant that Legal has never heard of. And a zombie API token from a vendor you offboarded eleven months ago is slowly exfiltrating your customer database at 2 AM.

Your job: cross-reference **logs, emails, expenses, and network traffic** to build cases, then decide — ignore, warn, escalate, or terminate. Every call moves board trust and breach risk. Sometimes in the direction you wanted.

Survive 100 days — four quarters — without a breach, a mutiny, or a strongly-worded letter from the board. We believe in you. The board is less certain (Trust: 60/100).

## Core loop

1. **Triage** — swipe through alerts; most are noise, a few are civilization-ending
2. **Investigate** — pull evidence from the four surfaces; discover that your "data exfil" alert was just Bob in Finance downloading his own performance review
3. **Connect dots** — pin clues to a case board, link them to form hypotheses, question all of your life choices
4. **Decide** — ignore, warn, escalate, terminate; every choice has consequences; "ignore" has consequences too, you'll find out
5. **Debrief** — missed threats detonate later as breaches; false alarms breed the kind of resentment that gets you disinvited from All-Hands

## Status

Early prototype. The full run is 100 days across four quarters, because apparently *five* was too easy and *infinite* seemed ambitious.

Eight hand-authored anchor days (days 1–5, 10, 25, 50) carry the high-stakes cases — shadow AI piping PII into an unnamed LLM, shadow cloud billed silently for 11 months, accidental leaks, deliberate leaks (those are different, legally, which you will explain to HR again), an exposed API that's been open since Q1, and two multi-day insider-exfil arcs that unfold across consecutive days because drama needs an arc.

The other ~92 days are procedurally generated minor cases at fractional weight, because you can't have a *crisis* every single day. Some days you're just approving $200 SaaS subscriptions and wondering how `claude-pro-team` made it past procurement. This is also the job.

Trust at zero or risk at one hundred ends the run. The board does not send a card.

State persists to IndexedDB, because your browser is the only infrastructure you're allowed.

Full design in [`SPEC.md`](SPEC.md). Operating notes for Claude Code in [`CLAUDE.md`](CLAUDE.md).

## Run it locally

```bash
npm install
npm run dev
```

Open the dev URL on your phone or in a narrow browser window. The app caps at 28rem wide. Portrait only. Like your career trajectory at Helix Corp.

## Stack

- **Frontend**: React + Vite + Tailwind, ships as a static PWA
- **State**: Zustand + IndexedDB — the only database you'll ever get approved
- **Hosting**: Cloudflare Pages / Vercel — no backend, no ops tickets, no oncall rotation at 3am
- **Cases**: hand-curated JSON in the repo — because the only thing worse than a mystery is a broken mystery

## A note on "No Backend"

There is no server. No database. No API. No microservices. No Kubernetes cluster slowly incurring $4,200/month in egress charges you only discover on Day 25. The entire game ships as static files. This is intentional. It is also, frankly, aspirational compared to the infrastructure decisions you'll be investigating in-game.

## Authoring with Gemma (our one use of AI that we'll admit to)

Hand-authoring detective cases is expensive. Runtime LLM generation makes patterns feel cheap and introduces the kind of non-determinism that's very funny in a chatbot and catastrophic in a court exhibit. So: middle path. **Gemma 4 E4B** running locally drafts candidate cases — emails, log lines, expense justifications, the kind of passive-aggressive HR communication that only happens when someone knows they're being watched — and a human curates the best into the static dataset. LLM at authoring time. Deterministic suspicion at runtime. Just like the SIEM.

## Roadmap

- [x] Game design spec
- [x] Vite + Tailwind scaffold
- [x] Triage inbox — swipe through alerts, pretend most are noise
- [x] Logs surface (filter + pin-to-case)
- [x] Case board (pinned clues view — your evidence wall, minus the red string)
- [x] Decision UI + verdict logic (trust / risk / morale meters, 5 outcome tiers including "you were technically right but everyone hates you now")
- [x] IndexedDB persistence (rehydrate on load; reset action gated behind a confirm dialog you will click too fast someday)
- [x] Eight hand-authored anchor cases (days 1–5, 10, 25, 50 — six archetypes, zero sympathy)
- [x] Procedural filler-day generator (days 6–100 minus anchors; deterministic, weighted at 0.25 so the filler can't end your run but will waste your time, which is accurate)
- [x] Day-end flow + game-over (trust 0 = board loses confidence; risk 100 = breach; both feel bad)
- [x] Win condition: survive 100 days; receive no commendation, only the knowledge that you survived
- [x] Emails surface (second investigation lens — because one log is evidence, two is a pattern, three is a disciplinary hearing)
- [x] Expenses + Traffic surfaces (forensic accounting and network flow analysis — now with 40% more disappointment)
- [x] Multi-day arcs — some investigations span days; evidence pins carry across the arc so you don't have to remember anything yourself
- [x] Per-quarter meter regression — trust and risk drift back toward baseline every 25 days, because institutional memory is short and your wins don't compound
- [x] Persistence schema — partialize so content updates don't wipe returning players' saves (learned this the hard way; you don't need to know more)
- [x] Deploy to GitHub Pages (`babanomania.github.io/shadow-it`)
- [ ] Gemma authoring pipeline — so we can generate 500 cases and feel appropriately bad about all of them
- [ ] Swipe gestures for triage (mobile polish — tap buttons for now, swipe when we've earned it)
- [ ] Remaining 92 anchor cases (days 6–9, 11–24, 26–49, 51–100 — yes, this is a lot; no, we don't regret the 100-day decision)
- [ ] Audio — optional, off by default, because open-plan offices are already a hostile environment

## License

TBD. Like most of your security policies.
