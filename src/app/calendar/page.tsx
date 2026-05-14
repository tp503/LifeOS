import { prisma } from "@/lib/prisma";
import { createManualEvent } from "@/actions/events";
import { FlashError } from "@/components/flash-error";

const inputClass =
  "mt-1 w-full rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const now = new Date();

  let events: Awaited<ReturnType<typeof prisma.event.findMany>> = [];
  try {
    events = await prisma.event.findMany({
      where: { startsAt: { gte: now } },
      orderBy: { startsAt: "asc" },
      take: 25,
    });
  } catch {
    events = [];
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white">Calendar</h2>
        <p className="mt-1 text-sm text-zinc-400">Manual events now; Microsoft 365 sync in Phase 2.</p>
      </div>

      <FlashError message={error} />

      <form action={createManualEvent} className="grid max-w-xl gap-4 rounded-xl border border-surface-border bg-surface-muted p-5 sm:grid-cols-2">
        <h3 className="text-sm font-semibold text-white sm:col-span-2">Add event</h3>
        <label className="block text-sm text-zinc-300 sm:col-span-2">
          Title
          <input name="title" required className={inputClass} placeholder="Dentist" />
        </label>
        <label className="block text-sm text-zinc-300">
          Starts
          <input name="startsAt" type="datetime-local" required className={inputClass} />
        </label>
        <label className="block text-sm text-zinc-300">
          Category
          <select name="category" className={inputClass} defaultValue="general">
            <option value="general">General</option>
            <option value="medical">Medical</option>
            <option value="birthday">Birthday</option>
            <option value="kids_club">Kids club</option>
            <option value="finance">Finance</option>
            <option value="travel">Travel</option>
          </select>
        </label>
        <div className="sm:col-span-2">
          <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-muted">
            Save event
          </button>
        </div>
      </form>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Upcoming</h3>
        <ul className="mt-3 space-y-2">
          {events.length === 0 ? (
            <li className="text-sm text-zinc-500">No upcoming events.</li>
          ) : (
            events.map((ev) => (
              <li key={ev.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-surface-border bg-surface-muted px-4 py-3 text-sm">
                <span className="font-medium text-white">{ev.title}</span>
                <span className="text-xs text-zinc-500">
                  {ev.startsAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })} · {ev.category}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
