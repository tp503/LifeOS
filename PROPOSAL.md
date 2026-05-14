# LifeOS — build proposal

This document describes what we will build, how it relates to your requirements (see `Requirements chat.txt`), and how similar open tools inform the design. The canonical remote is [github.com/tp503/LifeOS](https://github.com/tp503/LifeOS).

## Vision

**LifeOS** is a **private, local-first** web application you run on your own machine (or home server). It pulls together **calendar and mail signals** (Microsoft 365), **SMS** (Twilio), **notes and pasted context**, and **money** (CSV first, optional bank APIs later) into one **mobile-friendly dashboard** that answers: *what needs attention now*, *what is coming up*, and *whether cash flow looks risky*.

Design principle: **breadth first, then depth** — each pillar ships as a thin working slice, then improves. Quality is enforced with **tests for money logic**, **lint/build checks**, and **visible connector health** (no silent sync failures).

## What we will build (phased)

### Phase 0 — Foundation

- **Stack:** Next.js (App Router), TypeScript, Tailwind CSS, SQLite (via Prisma or Drizzle).
- **Single-user** app with environment-based secrets (`.env.example` only in repo).
- **Core schema:** entities for `InboxItem`, `Note`, `Event` (appointments / birthdays / medical tags), `SmsThread`, `Transaction`, `RecurringRule`, `ConnectorState` (last sync, errors).
- **Shell UI:** responsive layout with navigation: **Dashboard**, **Inbox**, **Calendar**, **Finance**, **Settings** (connectors).

### Phase 1 — Inbox, notes, and cross-links

- Manual **notes** (markdown), **tags**, and **links** between notes and other records.
- **Inbox** for pasted text and manual captures; simple **rules** (keywords, sender domains) before any heavy AI.
- **Full-text search** (SQLite FTS) across notes and inbox bodies.
- **Dashboard v1:** “Today / this week” from manual events + pinned notes + inbox needing review.

*Inspiration:* structured “hub” idea from family planners like [Oikos](https://github.com/ulsklyc/oikos) (household surfaces) and modular “personal OS” feel from [NeumanOS](https://github.com/travisjneuman/neumanos) — without copying their full scope.

### Phase 2 — Microsoft 365 (Outlook mail + calendar)

- **OAuth** and token lifecycle against **Microsoft Graph** (incremental sync where practical).
- Map mail and calendar into `InboxItem` / `Event` with stable external IDs.
- **Dashboard:** upcoming events, recent high-signal mail (configurable rules for school/club senders, medical keywords).

*Inspiration:* [workgraph.ai](https://github.com/nitin27may/workgraph.ai) — Next.js + Graph + briefing-style presentation (adapted for **personal / family** categories, not corporate-only).

### Phase 3 — SMS via Twilio

- **Inbound webhook** with **Twilio signature validation**.
- Store messages, participants, and thread groupings; surface on Inbox and Dashboard (e.g. kids club coach SMS).

*Inspiration:* operational patterns from Twilio-based bridges and MCP tooling; keep SMS as **first-class rows** in your DB, not only notifications.

### Phase 4 — Finance and forecasting

- **CSV import** first (fast, no vendor lock-in), then optional **Plaid** (or region-appropriate open banking) when you add keys.
- **Recurring payments** and **category rules**; deterministic **30-day (or configurable) cash projection** with explicit assumptions shown in the UI.
- Unit tests for aggregation, recurring application, and forecast edge cases.

*Inspiration:* [Actual Budget](https://github.com/actualbudget/actual) for ledger/envelope discipline; [Finlight](https://github.com/dsaltares/finlight) for Next.js + SQLite + budgets; [OpenFinance](https://github.com/yagudaev/openfinance) for ideas on **statement/PDF ingestion** later (behind a feature flag).

### Phase 5 — Deepening (optional flags)

- **LLM-assisted classification** only when you opt in; always show **why** something was classified.
- **Plaid** or other bank link; **OCR** or PDF parsing for statements.
- **WhatsApp:** no automated Meta integration in v1; **paste/import** path only, as agreed.

*Inspiration:* email triage products (e.g. open “inbox zero” style assistants) for **UX patterns** — always grounded in Graph + your schema, not a generic mail client.

## What it might look like (UX)

### Information architecture

- **Dashboard (home):** three zones — **Immediate actions** (reply needed, form due, appointment tomorrow), **This week** (scrollable agenda strip), **Money snapshot** (projected low balance warning with “assumptions” link).
- **Inbox:** unified list with filters (Source: Mail / SMS / Manual), state (New / Reviewed / Archived), and quick tags (Medical, Kids club, Finance, Birthday).
- **Calendar:** month + agenda; color by category; birthdays and medical visually distinct.
- **Finance:** accounts, transactions table, recurring rules editor, **Forecast** panel with chart (simple line: balance vs day).
- **Settings:** connector cards (Microsoft, Twilio, Finance) with **last sync**, **error message**, **Reconnect** button.

### Visual style

- **Mobile-first:** large tap targets, bottom nav on small screens; desktop uses sidebar.
- **Calm density:** one primary call-to-action per screen; avoid “enterprise dashboard” clutter.
- **Trust UI:** every automated label shows **source + rule** (“Tagged Medical: keyword ‘physio’ + sender allowlist”).

### Conceptual layout (wire-level)

```text
┌─────────────────────────────────────────────┐
│  LifeOS                    [sync ●]  ⚙     │
├─────────────────────────────────────────────┤
│  Immediate        │  This week              │
│  • Kids club 4pm   │  Tue Dentist 10:30      │
│  • Review SMS     │  Thu School trip form   │
├───────────────────┴─────────────────────────┤
│  Money: OK for ~18 days (tap assumptions)   │
└─────────────────────────────────────────────┘
```

## Comparison to similar tools (why LifeOS is different)

| Tool | Overlap | LifeOS difference |
|------|---------|---------------------|
| [workgraph.ai](https://github.com/nitin27may/workgraph.ai) | Graph, Next.js, insights | Family life + SMS + personal finance in **one** local schema |
| [Oikos](https://github.com/ulsklyc/oikos) | Family planner, calendar sync | You standardize on **Microsoft 365** + **Twilio** + **your** forecast model |
| [Actual Budget](https://github.com/actualbudget/actual) | Money excellence | LifeOS adds **non-money signals** (mail/SMS/notes) to the same timeline |
| [Finlight](https://github.com/dsaltares/finlight) | Next + SQLite money | LifeOS is a **superset** product; Finlight informs the finance module only |

## Non-functional commitments

- **Local-first data** in SQLite under your control; backups/export path in a later milestone.
- **Least-privilege** Graph scopes; Twilio webhook verification; no secrets in git.
- **No silent failure:** connector errors surface on Dashboard and Settings.
- **Tests** on financial math and parsers; **build/lint** after meaningful changes.

## How Cursor should work on this repo

Persistent agent guidance lives in [`.cursor/rules/`](.cursor/rules/): stack defaults (`project-context.mdc`), verification and TDD culture (`quality.mdc`), architect-style plans and optional approval gates (`product-workflow.mdc`), safety around config and secrets (`agent-safety.mdc`), no stubbed code (`no-placeholders.mdc`), and audit/session habits (`repo-health.mdc`). This matches the “hands-off you, hands-on proof” workflow from `Requirements chat.txt`.

## Success criteria (MVP)

1. You can open LifeOS on your phone on the same LAN (and optionally via private VPN later).
2. At least one **real** connector works end-to-end (Graph **or** Twilio **or** CSV finance — all three by end of Phase 4 per plan).
3. Dashboard shows a **merged** view of events + inbox highlights + finance warning when data exists.
4. Repository stays merge-ready: green build, documented env vars, no placeholder “TODO” core paths.

---

*Repository:* [https://github.com/tp503/LifeOS](https://github.com/tp503/LifeOS)
