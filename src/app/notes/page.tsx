import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseTags } from "@/lib/tags";

export default async function NotesPage() {
  let notes: Awaited<ReturnType<typeof prisma.note.findMany>> = [];
  try {
    notes = await prisma.note.findMany({ orderBy: { updatedAt: "desc" } });
  } catch {
    notes = [];
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Notes</h2>
          <p className="mt-1 text-sm text-zinc-400">Ideas and references; pin important notes for the dashboard.</p>
        </div>
        <Link
          href="/notes/new"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow hover:bg-accent-muted"
        >
          New note
        </Link>
      </div>

      <ul className="space-y-2">
        {notes.length === 0 ? (
          <li className="rounded-xl border border-dashed border-surface-border p-8 text-center text-sm text-zinc-500">
            No notes yet. Create one to get started.
          </li>
        ) : (
          notes.map((note) => (
            <li key={note.id}>
              <Link
                href={`/notes/${note.id}`}
                className="flex flex-col gap-1 rounded-xl border border-surface-border bg-surface-muted px-4 py-3 transition hover:border-accent sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-white">
                    {note.pinned ? <span className="mr-2 text-amber-400">Pinned</span> : null}
                    {note.title}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {parseTags(note.tags).length > 0 ? parseTags(note.tags).join(", ") : "No tags"}
                  </p>
                </div>
                <span className="text-xs text-zinc-500">{note.updatedAt.toLocaleString("en-GB")}</span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
