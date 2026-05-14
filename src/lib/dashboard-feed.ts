import type { Event, InboxItem, Note } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type DashboardFeed = {
  inboxItems: InboxItem[];
  events: Event[];
  pinnedNotes: Note[];
};

export async function getDashboardFeed(): Promise<DashboardFeed | null> {
  try {
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const [inboxItems, events, pinnedNotes] = await Promise.all([
      prisma.inboxItem.findMany({
        where: { state: { in: ["NEW", "NEEDS_REVIEW"] } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.event.findMany({
        where: { startsAt: { gte: now, lte: weekEnd } },
        orderBy: { startsAt: "asc" },
        take: 10,
      }),
      prisma.note.findMany({
        where: { pinned: true },
        orderBy: { updatedAt: "desc" },
        take: 8,
      }),
    ]);

    return { inboxItems, events, pinnedNotes };
  } catch {
    return null;
  }
}
