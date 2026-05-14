import type { InboxState } from "@prisma/client";

export type RuleInput = {
  title: string;
  body: string;
};

export type RuleResult = {
  addTags: string[];
  state?: InboxState;
};

type InternalRule = {
  when: (text: string) => boolean;
  result: RuleResult;
};

function norm(text: string): string {
  return text.toLowerCase();
}

function includesAny(text: string, needles: string[]): boolean {
  const n = norm(text);
  return needles.some((k) => n.includes(norm(k)));
}

/** Tags from all matching rules; state is NEEDS_REVIEW if any matched rule requests it. */
const rules: InternalRule[] = [
  {
    when: (t) => includesAny(t, ["nhs", "gp", "doctor", "dentist", "physio", "hospital", "medical", "clinic"]),
    result: { addTags: ["medical"], state: "NEEDS_REVIEW" },
  },
  {
    when: (t) => includesAny(t, ["birthday", "party", "present", "gift"]),
    result: { addTags: ["birthday"] },
  },
  {
    when: (t) => includesAny(t, ["school", "club", "trip", "permission", "consent", "pe kit", "homework"]),
    result: { addTags: ["kids_club"] },
  },
  {
    when: (t) => includesAny(t, ["invoice", "payment due", "direct debit", "mortgage", "statement", "bank"]),
    result: { addTags: ["finance"], state: "NEEDS_REVIEW" },
  },
  {
    when: (t) => includesAny(t, ["appointment", "booking", "reservation", "meeting at"]),
    result: { addTags: ["appointment"], state: "NEEDS_REVIEW" },
  },
];

export function applyInboxRules(input: RuleInput): { tags: string[]; state: InboxState } {
  const text = `${input.title}\n${input.body}`;
  const tagSet = new Set<string>();
  let needsReview = false;

  for (const rule of rules) {
    if (!rule.when(text)) continue;
    for (const tag of rule.result.addTags) {
      tagSet.add(tag);
    }
    if (rule.result.state === "NEEDS_REVIEW") {
      needsReview = true;
    }
  }

  return { tags: [...tagSet], state: needsReview ? "NEEDS_REVIEW" : "NEW" };
}
