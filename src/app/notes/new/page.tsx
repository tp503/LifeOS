import Link from "next/link";
import { createNote } from "@/actions/notes";
import { FlashError } from "@/components/flash-error";

const inputClass =
  "mt-1 w-full rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

export default async function NewNotePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-white">New note</h2>
        <Link href="/notes" className="text-sm text-accent hover:underline">
          Back to list
        </Link>
      </div>

      <FlashError message={error} />

      <form action={createNote} className="space-y-4 rounded-xl border border-surface-border bg-surface-muted p-5">
        <label className="block text-sm text-zinc-300">
          Title
          <input name="title" required className={inputClass} placeholder="e.g. Holiday ideas" />
        </label>
        <label className="block text-sm text-zinc-300">
          Body <span className="text-zinc-500">(markdown-friendly plain text)</span>
          <textarea name="body" rows={8} className={`${inputClass} font-mono text-xs`} placeholder="Write freely…" />
        </label>
        <label className="block text-sm text-zinc-300">
          Tags <span className="text-zinc-500">(comma-separated)</span>
          <input name="tags" className={inputClass} placeholder="ideas, travel" />
        </label>
        <button type="submit" className="w-full rounded-lg bg-accent py-2 text-sm font-semibold text-white hover:bg-accent-muted">
          Save note
        </button>
      </form>
    </div>
  );
}
