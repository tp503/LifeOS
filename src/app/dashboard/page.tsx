import Link from "next/link";
import { getDashboardSummary } from "@/lib/dashboard-summary";
import { getDashboardFeed } from "@/lib/dashboard-feed";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();
  const feed = summary.dbError ? null : await getDashboardFeed();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white">Dashboard</h2>
        <p className="mt-1 text-sm text-zinc-400">Immediate snapshot and what needs attention.</p>
      </div>

      {summary.dbError ? (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
          <p className="font-medium">Database not ready</p>
          <p className="mt-2 text-amber-100/90">{summary.dbError}</p>
          <p className="mt-3 text-xs text-amber-200/80">
            Copy <code className="rounded bg-black/30 px-1">.env.example</code> to{" "}
            <code className="rounded bg-black/30 px-1">.env</code>, run{" "}
            <code className="rounded bg-black/30 px-1">npm install</code> and{" "}
            <code className="rounded bg-black/30 px-1">npm run db:push</code>.
          </p>
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Inbox attention" value={summary.inboxAttention} hint="New + needs review" />
        <StatCard label="Upcoming events" value={summary.eventsUpcoming} hint="From now onward" />
        <StatCard label="Notes" value={summary.notes} hint="Markdown-capable notes" />
        <StatCard label="Accounts" value={summary.accounts} hint="Finance module (Phase 4)" />
      </section>

      {feed ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-xl border border-surface-border bg-surface-muted p-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Inbox attention</h3>
              <Link href="/inbox" className="text-xs font-medium text-accent hover:underline">
                Open inbox
              </Link>
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              {feed.inboxItems.length === 0 ? (
                <li className="text-zinc-500">Nothing in new or needs review.</li>
              ) : (
                feed.inboxItems.map((item) => (
                  <li key={item.id} className="rounded-lg border border-surface-border bg-surface px-3 py-2">
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="text-xs text-zinc-500">{item.state.replace("_", " ")}</p>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="rounded-xl border border-surface-border bg-surface-muted p-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">This week</h3>
              <Link href="/calendar" className="text-xs font-medium text-accent hover:underline">
                Calendar
              </Link>
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              {feed.events.length === 0 ? (
                <li className="text-zinc-500">No events in the next 7 days.</li>
              ) : (
                feed.events.map((ev) => (
                  <li key={ev.id} className="rounded-lg border border-surface-border bg-surface px-3 py-2">
                    <p className="font-medium text-white">{ev.title}</p>
                    <p className="text-xs text-zinc-500">
                      {ev.startsAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })} · {ev.category}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="rounded-xl border border-surface-border bg-surface-muted p-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Pinned notes</h3>
              <Link href="/notes" className="text-xs font-medium text-accent hover:underline">
                All notes
              </Link>
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              {feed.pinnedNotes.length === 0 ? (
                <li className="text-zinc-500">Pin notes from any note detail page.</li>
              ) : (
                feed.pinnedNotes.map((note) => (
                  <li key={note.id}>
                    <Link href={`/notes/${note.id}`} className="block rounded-lg border border-surface-border bg-surface px-3 py-2 transition hover:border-accent">
                      <p className="font-medium text-white">{note.title}</p>
                      <p className="text-xs text-zinc-500">Updated {note.updatedAt.toLocaleDateString("en-GB")}</p>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      ) : null}

      <section className="rounded-xl border border-surface-border bg-surface-muted p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Connectors</h3>
        {summary.connectors.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-400">
            No connector state yet. Settings will show Microsoft Graph, Twilio, and finance sync health in later phases.
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm text-zinc-200">
            {summary.connectors.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface px-3 py-2">
                <span className="font-medium">{c.connectorId}</span>
                <span className="text-xs text-zinc-500">
                  {c.lastError ? `Error: ${c.lastError}` : c.lastSyncAt ? `Last sync ${c.lastSyncAt.toISOString()}` : "Never synced"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <article className="rounded-xl border border-surface-border bg-surface-muted p-5 shadow-sm shadow-black/20">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-xs text-zinc-500">{hint}</p>
    </article>
  );
}
