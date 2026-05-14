import Link from "next/link";
import { searchLifeos } from "@/lib/search-lifeos";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const results = q.trim() ? await searchLifeos(q) : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Search</h2>
        <p className="mt-1 text-sm text-zinc-400">Full-text search across notes and inbox (SQLite FTS5).</p>
      </div>

      <form method="get" className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block flex-1 text-sm text-zinc-300">
          Query
          <input
            name="q"
            defaultValue={q}
            className="mt-1 w-full rounded-lg border border-surface-border bg-surface-muted px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="e.g. dentist school"
          />
        </label>
        <button type="submit" className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent-muted sm:mb-0">
          Search
        </button>
      </form>

      {q.trim() ? (
        <ul className="space-y-3">
          {results.length === 0 ? (
            <li className="text-sm text-zinc-500">No matches. Try different words (all words must match).</li>
          ) : (
            results.map((row) => (
              <li key={`${row.entityType}-${row.entityId}`} className="rounded-xl border border-surface-border bg-surface-muted p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">{row.entityType}</p>
                <p className="font-medium text-white">{row.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{row.snippet}</p>
                <Link
                  href={row.entityType === "note" ? `/notes/${row.entityId}` : `/inbox#item-${row.entityId}`}
                  className="mt-2 inline-block text-sm text-accent hover:underline"
                >
                  Open
                </Link>
              </li>
            ))
          )}
        </ul>
      ) : (
        <p className="text-sm text-zinc-500">Enter a query to search notes and inbox bodies.</p>
      )}
    </div>
  );
}
