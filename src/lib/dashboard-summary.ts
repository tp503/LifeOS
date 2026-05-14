import { prisma } from "@/lib/prisma";

export type DashboardSummary = {
  inboxNew: number;
  eventsUpcoming: number;
  notes: number;
  accounts: number;
  connectors: { id: string; connectorId: string; lastSyncAt: Date | null; lastError: string | null }[];
  dbError: string | null;
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const now = new Date();
  try {
    const [inboxNew, eventsUpcoming, notes, accounts, connectors] = await Promise.all([
      prisma.inboxItem.count({ where: { state: "NEW" } }),
      prisma.event.count({ where: { startsAt: { gte: now } } }),
      prisma.note.count(),
      prisma.account.count(),
      prisma.connectorState.findMany({ orderBy: { connectorId: "asc" } }),
    ]);

    return {
      inboxNew,
      eventsUpcoming,
      notes,
      accounts,
      connectors: connectors.map((c) => ({
        id: c.id,
        connectorId: c.connectorId,
        lastSyncAt: c.lastSyncAt,
        lastError: c.lastError,
      })),
      dbError: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Database unavailable";
    return {
      inboxNew: 0,
      eventsUpcoming: 0,
      notes: 0,
      accounts: 0,
      connectors: [],
      dbError: message,
    };
  }
}
