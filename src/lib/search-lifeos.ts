import { prisma } from "@/lib/prisma";
import { ftsSearch } from "@/lib/fts";

export type SearchResultRow = {
  entityType: "note" | "inbox";
  entityId: string;
  title: string;
  snippet: string;
};

export async function searchLifeos(query: string): Promise<SearchResultRow[]> {
  try {
    const hits = await ftsSearch(query);
    if (hits.length === 0) return [];

    const noteIds = hits.filter((h) => h.entityType === "note").map((h) => h.entityId);
    const inboxIds = hits.filter((h) => h.entityType === "inbox").map((h) => h.entityId);

    const [notes, inboxItems] = await Promise.all([
      prisma.note.findMany({ where: { id: { in: noteIds } } }),
      prisma.inboxItem.findMany({ where: { id: { in: inboxIds } } }),
    ]);

    const noteMap = new Map(notes.map((n) => [n.id, n]));
    const inboxMap = new Map(inboxItems.map((i) => [i.id, i]));

    const rows: SearchResultRow[] = [];
    for (const hit of hits) {
      if (hit.entityType === "note") {
        const n = noteMap.get(hit.entityId);
        if (n) rows.push({ entityType: "note", entityId: n.id, title: n.title, snippet: n.body.slice(0, 160) });
      } else {
        const i = inboxMap.get(hit.entityId);
        if (i) rows.push({ entityType: "inbox", entityId: i.id, title: i.title, snippet: i.body.slice(0, 160) });
      }
    }
    return rows;
  } catch {
    return [];
  }
}
