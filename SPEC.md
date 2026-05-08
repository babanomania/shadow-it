# shadow-it — Game Spec

A mobile-browser strategy/detective game where you play head of governance & security at a growing tech company. Departments break the rules behind your back. You catch them — or you don't.

> Papers Please × Splunk × office politics, in 3-minute sessions on the bus.

---

## 1. Pitch

You are the new VP of Governance & Security at *Helix Corp*. The company is scaling fast. Engineering, marketing, sales, finance, HR, and the exec team are all moving faster than your policies allow.

Behind your back, departments are:
- spinning up unsanctioned cloud infrastructure,
- piping confidential data into unauthorized AI tools,
- exposing internal APIs to "trusted" partners,
- leaking secrets — sometimes by accident, sometimes not.

Your job: investigate anomalies across logs, emails, expenses, and network traffic. Build cases. Make calls. Survive the quarter without a breach — or a mutiny.

---

## 2. Core gameplay loop

A single "day" is one short session (~3 min):

1. **Triage inbox** — A stream of alerts/anomalies arrives. Swipe right to investigate, left to dismiss. Most are noise; a few are real.
2. **Investigate** — Tap an alert to open the case board. Pull evidence from four surfaces: logs, emails, expenses, traffic. Each pull costs a small amount of time/budget.
3. **Connect dots** — Pin clues to the case board. Link two clues to form a hypothesis. The board lights up when a chain coheres.
4. **Make the call** — Ignore, Warn, Escalate, or Terminate. Each action shifts trust with the board, morale with the involved department, and the company-wide risk meter.
5. **End-of-day debrief** — Consequences play out. Missed threats may detonate later as breaches. False alarms breed resentment.

The day ends after N triage actions or when your "attention" budget runs out.

### Why this works on mobile

- One-thumb swipe triage = native phone gesture.
- Cases are bite-sized: pause and resume any time.
- Persistent state across sessions (IndexedDB), so the commute can be one day.

---

## 3. The four investigation surfaces

Each surface is its own mini-UI. Players cross-reference between them — that's the core puzzle.

### 3.1 Logs (the SIEM lens)
- Tabular, infinite-scroll, with filter chips at top: `service`, `user`, `severity`, `timeframe`.
- Tap a row to expand JSON-style details.
- Pin rows as evidence to the active case board.
- Saved searches unlock as you progress (e.g., "after-hours admin actions").

### 3.2 Emails (the social lens)
- Threaded, like a stripped-down mail client.
- Sender, subject, snippet — tap to open thread.
- Some emails contain attachments (CSV, screenshots, links to external tools).
- Forwarded chains and BCCs are usually where the smoking gun is.

### 3.3 Expenses (the paper trail)
- Card-style list of recent charges: vendor, amount, department, date, justification.
- Anomalies highlighted softly (orange dot) — don't auto-solve, just hint.
- Recurring small charges = shadow SaaS subscriptions. Big one-offs = consultants or sketchy vendors.

### 3.4 Traffic (the network lens)
- Simple visual: a sparkline per service + a small sankey-lite of egress destinations.
- Spikes are the obvious tell. The interesting ones are slow, patient exfils — small bytes/hour to an unknown destination.
- Tap a destination IP/domain to see WHOIS-style metadata.

### Cross-referencing
The puzzle is matching across surfaces:
> "An expense for `claude-pro-team` (expenses) + a marketing manager forwarding the customer database (emails) + a 4 GB POST to `api.unknown-llm.io` (traffic) + 12 records exported from `customers` table (logs) = Marketing pasted the customer list into an unauthorized AI tool."

Two of those four alone are noise. Three is suspicious. Four is a case.

---

## 4. Threat catalog (v1)

Six threat archetypes, each with multiple variants. Each variant has a "tell" on 2–4 of the surfaces.

| Archetype | Example | Logs | Emails | Expenses | Traffic |
|---|---|---|---|---|---|
| Shadow cloud | Eng team spins up a personal AWS account for "experiments" | new IAM role | Slack/email mentioning "my-account" | personal card reimbursement | egress to non-corp AWS region |
| Shadow AI | Marketing pipes customer data into unauthorized LLM | bulk export from `customers` | "this draft was AI-rewritten" | `openai/anthropic/...` charge | large POST to LLM endpoint |
| Exposed API | Sales gives partner direct DB access | new long-lived token | "here's a temporary key 😉" | — | sustained traffic from partner IP |
| Secret leak (accidental) | Eng pastes API key into public Github gist | token used from new IP | "see my gist" | — | inbound from random IPs |
| Secret leak (deliberate) | Exec forwards roadmap to a competitor | doc download | forward to personal email | — | upload to consumer cloud drive |
| Insider exfil | HR exports PII before quitting | mass DB export at night | resignation draft | — | upload to USB-mount or personal drive |

Each in-game "case" is a **specific instance** with a specific perpetrator, motive, and evidence trail.

### Difficulty scaling
- Early game: 1 real case per day, hidden in 5 noise alerts.
- Mid game: 2 cases per day, 12 alerts, multi-step chains.
- Late game: orchestrated multi-department incidents (e.g., a phishing campaign that leads to credential reuse across three teams).

---

## 5. Player decisions & consequences

Four actions on any case:

| Action | Effect on trust (board) | Effect on department | Risk meter |
|---|---|---|---|
| Ignore | 0 if benign, big drop if real | +small (they like being left alone) | +large if real |
| Warn | small + (you're attentive) | -small (annoying) | -small if real |
| Escalate | medium + if real, medium - if false | -medium | -medium if real |
| Terminate | large + if real, large - if false | -large; risk of mutiny | -large if real |

**Department morale** matters. If a department's morale drops below threshold, they actively start hiding things better — fewer tells across the four surfaces, harder to catch.

**Board trust** is the main meta-resource. Low trust = smaller investigation budget next quarter. Hits zero = game over.

**Risk meter** is the cliff. Hits 100% = breach event = headline failure.

---

## 6. Progression

### Within a quarter (a "run")
- 12 in-game days = 1 quarter.
- Each day: triage + investigate + decisions.
- Day 13: board review. You're scored on trust, risk, and breaches caught/missed.
- Survive the quarter, advance.

### Across quarters (meta)
- Company grows: more departments, more employees, more alerts, new threat archetypes unlock.
- Q1: 50-person startup, 4 departments, 3 archetypes.
- Q4+: 5000-person enterprise, 9 departments, all archetypes, plus *coordinated* incidents.

### Unlockables
- New saved searches and filters.
- Tools: a "diff" view comparing two days, a "graph" connecting people across cases.
- Policies you can enact: SSO mandate (-shadow AI rate, -morale), mandatory security training (-leak rate, -budget), DLP (-exfil, -all-morale).

Policies are double-edged. You don't unlock pure upgrades — you make tradeoffs.

---

## 7. Mobile-first UX principles

- **Portrait only.** No landscape. Designed for one-thumb operation.
- **Bottom nav** (4 surfaces + Cases). Thumb-zone friendly.
- **Swipe is primary.** Triage = swipe. Pin to case = swipe up. Dismiss = swipe down.
- **Short text, dense iconography.** Logs and emails are the most text-heavy surfaces; they get search and chips, not paragraphs.
- **No twitch.** No timers under 10 seconds. Pressure comes from the day's attention budget, not reflex.
- **Pause-friendly.** Every state autosaves; close the tab and come back.
- **Offline-capable PWA.** Cases are local; no server needed for v1.
- **Dark mode by default.** It's a security ops aesthetic, lean in.

---

## 8. Visual & tone

- **Aesthetic:** terminal-meets-corporate. Mono font for logs and code; sans-serif for emails and chrome.
- **Color:** mostly slate/charcoal; alerts in amber; threats in red; resolved cases in green. Restrained palette — the data is the visual.
- **Voice:** dry, slightly weary. The narrator is the player's burned-out predecessor, who left voicemails. Not jokey.
- **No anthropomorphic mascots.** This is a serious-feeling toy.

---

## 9. MVP scope (what to build first)

Aim: a playable demo that captures the core loop in 1–2 weeks of solo work.

**In:**
- 1 surface fully built (logs) + 1 stripped-down (emails as plain list).
- 3 threat archetypes (shadow AI, exposed API, accidental secret leak).
- 5 hand-authored cases.
- Triage inbox, case board with pin/link, 4-action decision UI.
- One day, end-of-day debrief, basic scoring.
- IndexedDB persistence.

**Out (defer):**
- Expenses and traffic surfaces (stub them as "coming soon").
- Procedural case generation.
- Meta-progression / quarters.
- Policies system.
- Audio.

**Cut criteria:** if you can't build the cross-referencing puzzle in the MVP, the game has no game. That's the must-have. Triage UX without cross-referencing is just a swipe sim.

---

## 10. Tech stack recommendation

Lightweight, no backend, ships as a static PWA.

- **Framework:** React + Vite, or Svelte if you prefer. Either is fine; pick what you'll iterate fastest in.
- **State:** Zustand (React) or built-in stores (Svelte). Keep it small.
- **Styling:** Tailwind. Fast, mobile-friendly, dark-mode trivial.
- **Routing:** none for v1 — single-page state machine.
- **Persistence:** IndexedDB via `idb-keyval`. Simple key-value for save state.
- **Cases:** authored as JSON/YAML files in the repo. Each case = clues + correct decision + branching consequences.
- **Build:** PWA via `vite-plugin-pwa`. Add manifest, service worker, install prompt.
- **Hosting:** Vercel/Netlify/Cloudflare Pages — static, free tier, instant deploys.

No analytics or auth in v1. Add later if you have users.

---

## 11. Open questions

These are decisions to make before/during prototyping, not blockers for the spec:

1. **Roguelike or campaign?** Each quarter starts fresh with random cases (high replayability) vs. authored story arcs (richer narrative, finite content). Recommendation: campaign for first 2 quarters, roguelike unlocks after.
2. **Who's the player?** Generic VP, or a named character with a backstory? A named protagonist makes the dry-narrator voice land harder.
3. **How forgiving?** A breach = run-ending, or just a big trust hit? Lean forgiving for mobile/casual; permadeath punishes interrupted commute sessions.
4. **Multiplayer / async?** None in v1. Long-term: leaderboards on weekly seeded cases, like NYT Connections.
5. **Monetization?** Free for v1. If it lands: cosmetic themes (terminal palettes), or premium "incident packs" — never pay-to-win, this isn't that genre.

---

## 12. Risks

- **Tutorial cliff.** The cross-referencing puzzle is the fun, but it's not obvious. The first 3 cases need to be hand-held tutorials that teach each surface and the linking mechanic.
- **Content cost.** Hand-authored cases are expensive. Procedural generation is the long-term play, but probably bad for v1 — patterns become visible and lose mystique.
- **Confused for a sim.** Players might expect a tycoon-style "build your security team" game. The marketing has to be clear: this is detective-first, strategy-second.
- **Boring middle.** Late-game noise can drown signal. Need to keep the case-to-noise ratio engaging — somewhere around 1:4.

---

## 13. Next steps

1. Build a paper prototype: 5 index cards = 1 case. Test the cross-referencing puzzle on 2–3 friends. Does it click without explanation?
2. If yes: scaffold the Vite + Tailwind project, build the logs surface and triage inbox first.
3. Author 5 cases as JSON. Wire them through the loop. Playtest end-to-end.
4. Polish mobile gestures last — the puzzle has to be fun on desktop first, mobile is a delivery format.
