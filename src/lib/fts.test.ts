import { describe, expect, it } from "vitest";
import { buildFtsMatchQuery } from "./fts";

describe("buildFtsMatchQuery", () => {
  it("returns null for empty", () => {
    expect(buildFtsMatchQuery("   ")).toBeNull();
  });

  it("joins words with AND and quotes", () => {
    expect(buildFtsMatchQuery("dentist tomorrow")).toBe('"dentist" AND "tomorrow"');
  });

  it("strips unsafe characters", () => {
    expect(buildFtsMatchQuery('hello "world')).toBe('"hello" AND "world"');
  });
});
