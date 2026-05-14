import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { InboxState } from "@prisma/client";
import { parseTags } from "@/lib/tags";
import { createInboxManual, updateInboxState, deleteInboxItem } from "@/actions/inbox";
import { FlashError } from "@/components/flash-error";

const inputClass =
  "mt-1 w-full rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

function formatState(state: InboxState): string {
  return state.replaceAll("_", " ").toLowerCase();
}

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; error?: string }>;
}) {
  const { view = "active", error } = await searchParams;

  let items: Awaited<ReturnType<typeof prisma.inboxItem.findMany>> = [];
  try {
    const where =
      view === "archived"
        ? { state: "ARCHIVED" as const }
        : view === "all"
          ? {}
          : { state: { in: ["NEW", "NEEDS_REVIEW"] satisfies InboxState[] } };

    items = await prisma.inboxItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  } catch {
    items = [];
  }

  const tabs = [
    { href: "/inbox?view=active", label: "Active", active: view === "active" },
    { href: "/inbox?view=archived", label: "Archived", active: view === "archived" },
    { href: "/inbox?view=all", label: "All", active: view === "all" },
  ] as const;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white">Inbox</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Manual capture with lightweight keyword rules (medical, kids club, finance, appointments).
        </p>
      </div>

      <FlashError message={error} />

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
              t.active ? "border-accent bg-accent/20 text-white" : "border-surface-border text-zinc-400 hover:border-accent"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <form action={createInboxManual} className="space-y-4 rounded-xl border border-surface-border bg-surface-muted p-5">
        <h3 className="text-sm font-semibold text-white">Add item</h3>
        <label className="block text-sm text-zinc-300">
          Title
          <input name="title" required className={inputClass} placeholder="Short headline" />
        </label>
        <label className="block text-sm text-zinc-300">
          Body
          <textarea name="body" rows={5} className={inputClass} placeholder="Paste email text, SMS export, or notes…" />
        </label>
        <label className="block text-sm text-zinc-300">
          Extra tags (comma-separated, optional)
          <input name="tags" className={inputClass} placeholder="coach, football" />
        </label>
        <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-muted">
          Save to inbox
        </button>
      </form>

      <ul className="space-y-3">
        {items.length === 0 ? (
          <li className="rounded-xl border border-dashed border-surface-border p-8 text-center text-sm text-zinc-500">No items in this view.</li>
        ) : (
          items.map((item) => (
            <li key={item.id} id={`item-${item.id}`} className="rounded-xl border border-surface-border bg-surface-muted p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-400">{item.body || "—"}</p>
                  <p className="mt-2 text-xs text-zinc-500">
                    Tags: {parseTags(item.tags).join(", ") || "—"} · {formatState(item.state)}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <form action={updateInboxState} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={item.id} />
                    <label className="sr-only" htmlFor={`state-${item.id}`}>
                      State
                    </label>
                    <select id={`state-${item.id}`} name="state" defaultValue={item.state} className={inputClass}>
                      <option value="NEW">New</option>
                      <option value="NEEDS_REVIEW">Needs review</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                    <button type="submit" className="rounded-lg border border-surface-border px-2 py-1 text-xs text-zinc-200 hover:border-accent">
                      Update
                    </button>
                  </form>
                  <form action={deleteInboxItem}>
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit" className="text-xs text-rose-400 hover:underline">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
