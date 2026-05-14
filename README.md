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

## Scripts

| Script        | Purpose                          |
|---------------|----------------------------------|
| `npm run dev` | Next.js dev server (Turbopack)   |
| `npm run build` | Production build               |
| `npm run lint`  | ESLint                         |
| `npm run db:push` | Apply `prisma/schema.prisma` to SQLite |
| `npm run db:studio` | Prisma Studio GUI          |

## Data

SQLite file path is controlled by `DATABASE_URL` in `.env` (default `file:./lifeos.db` next to `prisma/schema.prisma`). The database file is gitignored.

## Cursor rules

Agent expectations live in [`.cursor/rules/`](./.cursor/rules/).
