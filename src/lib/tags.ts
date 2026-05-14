/** Tags stored as JSON string array in SQLite (Prisma String field). */

export function parseTags(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((t): t is string => typeof t === "string")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function stringifyTags(tags: string[]): string {
  const unique = [...new Set(tags.map((t) => t.trim().toLowerCase()).filter(Boolean))];
  return JSON.stringify(unique);
}

export function mergeTags(existing: string[], add: string[]): string {
  return stringifyTags([...existing, ...add]);
}
