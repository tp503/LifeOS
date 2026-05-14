import { prisma } from "@/lib/prisma";

const FTS_TABLE = "LifeOSFts";

/** Build FTS5 MATCH string: all words must appear (AND). Words sanitized. */
export function buildFtsMatchQuery(userQuery: string): string | null {
  const words = userQuery
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9_-]/g, ""))
    .filter((w) => w.length > 0)
    .slice(0, 12);

  if (words.length === 0) return null;

  return words.map((w) => `"${w.replace(/"/g, "")}"`).join(" AND ");
}

export async function ensureFtsTable(): Promise<void> {
  await prisma.$executeRawUnsafe(`
    CREATE VIRTUAL TABLE IF NOT EXISTS ${FTS_TABLE} USING fts5(
      entity_type UNINDEXED,
      entity_id UNINDEXED,
      title,
      body,
      tokenize = 'porter unicode61'
    );
  `);
}

export async function ftsReplaceRow(
  entityType: "note" | "inbox",
  entityId: string,
  title: string,
  body: string,
): Promise<void> {
  await ensureFtsTable();
  await prisma.$executeRawUnsafe(
    `DELETE FROM ${FTS_TABLE} WHERE entity_type = ? AND entity_id = ?`,
    entityType,
    entityId,
  );
  await prisma.$executeRawUnsafe(
    `INSERT INTO ${FTS_TABLE} (entity_type, entity_id, title, body) VALUES (?, ?, ?, ?)`,
    entityType,
    entityId,
    title,
    body,
  );
}

export async function ftsDeleteRow(entityType: "note" | "inbox", entityId: string): Promise<void> {
  await ensureFtsTable();
  await prisma.$executeRawUnsafe(
    `DELETE FROM ${FTS_TABLE} WHERE entity_type = ? AND entity_id = ?`,
    entityType,
    entityId,
  );
}

export type FtsHit = { entityType: "note" | "inbox"; entityId: string };

export async function ftsSearch(matchQuery: string): Promise<FtsHit[]> {
  const q = buildFtsMatchQuery(matchQuery);
  if (!q) return [];

  await ensureFtsTable();

  const rows = await prisma.$queryRawUnsafe<Array<{ entity_type: string; entity_id: string }>>(
    `SELECT entity_type, entity_id FROM ${FTS_TABLE} WHERE ${FTS_TABLE} MATCH ? LIMIT 50`,
    q,
  );

  return rows
    .filter((r) => r.entity_type === "note" || r.entity_type === "inbox")
    .map((r) => ({
      entityType: r.entity_type as "note" | "inbox",
      entityId: r.entity_id,
    }));
}
