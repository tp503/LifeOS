import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseTags } from "@/lib/tags";
import { updateNote, deleteNote, addNoteLink, removeNoteLink } from "@/actions/notes";
import { FlashError } from "@/components/flash-error";

const inputClass =
  "mt-1 w-full rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

export default async function NoteDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const note = await prisma.note.findUnique({
    where: { id },
    include: { links: { orderBy: { id: "asc" } } },
  });

  if (!note) notFound();

  const tagField = parseTags(note.tags).join(", ");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/notes" className="text-sm text-accent hover:underline">
          ← All notes
        </Link>
      </div>

      <FlashError message={error} />

      <form action={updateNote} className="space-y-4 rounded-xl border border-surface-border bg-surface-muted p-5">
        <input type="hidden" name="id" value={note.id} />
        <label className="block text-sm text-zinc-300">
          Title
          <input name="title" required defaultValue={note.title} className={inputClass} />
        </label>
        <label className="block text-sm text-zinc-300">
          Body
          <textarea name="body" rows={10} defaultValue={note.body} className={`${inputClass} font-mono text-xs`} />
        </label>
        <label className="block text-sm text-zinc-300">
          Tags (comma-separated)
          <input name="tags" defaultValue={tagField} className={inputClass} />
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="hidden" name="pinned" value="off" />
          <input type="checkbox" name="pinned" value="on" defaultChecked={note.pinned} className="size-4 rounded border-surface-border" />
          Pin to dashboard
        </label>
        <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-muted">
          Save changes
        </button>
      </form>

      <section className="rounded-xl border border-surface-border bg-surface-muted p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Cross-references</h3>
        <p className="mt-2 text-xs text-zinc-500">Link to an event, inbox item, or transaction by id (from URLs or lists).</p>
        {note.links.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm">
            {note.links.map((link) => (
              <li key={link.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface px-3 py-2">
                <span className="text-zinc-200">
                  {link.targetType} → <code className="text-xs text-accent">{link.targetId}</code>
                </span>
                <form action={removeNoteLink}>
                  <input type="hidden" name="linkId" value={link.id} />
                  <input type="hidden" name="noteId" value={note.id} />
                  <button type="submit" className="text-xs text-rose-400 hover:underline">
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-zinc-500">No links yet.</p>
        )}

        <form action={addNoteLink} className="mt-4 grid gap-3 border-t border-surface-border pt-4 sm:grid-cols-3">
          <input type="hidden" name="noteId" value={note.id} />
          <label className="text-sm text-zinc-300 sm:col-span-1">
            Type
            <select name="targetType" className={inputClass}>
              <option value="EVENT">EVENT</option>
              <option value="INBOX_ITEM">INBOX_ITEM</option>
              <option value="TRANSACTION">TRANSACTION</option>
            </select>
          </label>
          <label className="text-sm text-zinc-300 sm:col-span-2">
            Target id
            <input name="targetId" required className={inputClass} placeholder="cuid from LifeOS" />
          </label>
          <div className="sm:col-span-3">
            <button type="submit" className="rounded-lg border border-surface-border px-4 py-2 text-sm text-zinc-200 hover:border-accent">
              Add link
            </button>
          </div>
        </form>
      </section>

      <form action={deleteNote} className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
        <input type="hidden" name="id" value={note.id} />
        <p className="text-sm text-rose-200/90">Delete this note permanently.</p>
        <button type="submit" className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500">
          Delete note
        </button>
      </form>
    </div>
  );
}
