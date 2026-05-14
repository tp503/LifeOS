import { describe, expect, it } from "vitest";
import { applyInboxRules } from "./inbox-rules";

describe("applyInboxRules", () => {
  it("tags medical and needs review", () => {
    const r = applyInboxRules({ title: "Checkup", body: "See NHS portal for appointment" });
    expect(r.tags).toContain("medical");
    expect(r.state).toBe("NEEDS_REVIEW");
  });

  it("tags kids club without review", () => {
    const r = applyInboxRules({ title: "School trip", body: "Please return permission slip" });
    expect(r.tags).toContain("kids_club");
    expect(r.state).toBe("NEW");
  });

  it("combines tags when multiple rules hit", () => {
    const r = applyInboxRules({ title: "Bank", body: "School fees invoice attached" });
    expect(r.tags).toEqual(expect.arrayContaining(["kids_club", "finance"]));
    expect(r.state).toBe("NEEDS_REVIEW");
  });
});
