import { describe, expect, it } from "vitest";
import { mergeTags, parseTags, stringifyTags } from "./tags";

describe("tags", () => {
  it("parses valid json array", () => {
    expect(parseTags('["a","B"]')).toEqual(["a", "b"]);
  });

  it("returns empty on invalid json", () => {
    expect(parseTags("not-json")).toEqual([]);
  });

  it("stringify dedupes and lowercases", () => {
    expect(stringifyTags(["Foo", "foo", "Bar"])).toBe('["foo","bar"]');
  });

  it("mergeTags unions", () => {
    expect(parseTags(mergeTags(["a"], ["b", "a"]))).toEqual(["a", "b"]);
  });
});
