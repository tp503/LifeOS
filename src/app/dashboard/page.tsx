import { getDashboardSummary } from "@/lib/dashboard-summary";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white">Dashboard</h2>
        <p className="mt-1 text-sm text-zinc-400">Immediate snapshot of your LifeOS data.</p>
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
        <StatCard label="New inbox items" value={summary.inboxNew} hint="Across all sources" />
        <StatCard label="Upcoming events" value={summary.eventsUpcoming} hint="From now onward" />
        <StatCard label="Notes" value={summary.notes} hint="Linked notes ready in Phase 1" />
        <StatCard label="Accounts" value={summary.accounts} hint="Finance module" />
      </section>

      <section className="rounded-xl border border-surface-border bg-surface-muted p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Connectors</h3>
        {summary.connectors.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-400">
            No connector state yet. Settings will show Microsoft Graph, Twilio, and finance sync health in later
            phases.
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
