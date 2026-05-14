# LifeOS

Private, local-first life organizer (see [PROPOSAL.md](./PROPOSAL.md)).

## Prerequisites

- Node.js **20+** and npm on your PATH (install from [nodejs.org](https://nodejs.org/) if `npm` is missing in the terminal Cursor uses).

## Setup

```bash
cd path/to/PA   # this repository root
copy .env.example .env   # Windows: copy; macOS/Linux: cp
npm install
npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you will be redirected to `/dashboard`.

After pulling updates, run **`npm run db:push`** whenever `prisma/schema.prisma` changes (new columns, etc.).

## Phase 1 (current)

- **Notes:** create, edit, delete, comma-separated tags, pin to dashboard, cross-links to events / inbox / transactions by id.
- **Inbox:** manual items, keyword rules (medical, kids club, finance, appointments), archive and filters.
- **Calendar:** manual events with categories.
- **Search:** SQLite FTS5 over note and inbox title/body (first search creates the FTS table).
- **Tests:** `npm run test` (Vitest) for tags, inbox rules, and FTS query builder.

## Windows PowerShell: `npm.ps1 cannot be loaded` (execution policy)

PowerShell may run `npm.ps1`, which is blocked when script execution is restricted.

**Option A — no policy change (quickest):** call the `.cmd` shim so PowerShell does not run the script:

```powershell
npm.cmd -v
npm.cmd install
npm.cmd run dev
```

**Option B — fix for your user account:** allow signed/local scripts for `CurrentUser` (common on dev machines):

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Close and reopen the terminal, then `npm -v` should work. If a **company Group Policy** overrides this, keep using **Option A** or use **Command Prompt** (`cmd.exe`) instead of PowerShell.

## Scripts

| Script        | Purpose                          |
|---------------|----------------------------------|
| `npm run dev` | Next.js dev server (Turbopack)   |
| `npm run build` | Production build               |
| `npm run lint`  | ESLint                         |
| `npm run db:push` | Apply `prisma/schema.prisma` to SQLite |
| `npm run test` | Vitest (tags, inbox rules, FTS helper) |

## Data

SQLite file path is controlled by `DATABASE_URL` in `.env` (default `file:./lifeos.db` next to `prisma/schema.prisma`). The database file is gitignored.

If **`prisma generate` fails with `EPERM ... rename ... query_engine-windows.dll.node`** (common with **OneDrive** syncing `node_modules`), try: pause OneDrive for this folder, delete `node_modules` and `.prisma`, then run `npm install` again from a terminal **outside** Cursor, or clone the repo outside OneDrive.

## Cursor rules

Agent expectations live in [`.cursor/rules/`](./.cursor/rules/).
