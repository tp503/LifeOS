"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { InboxState } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { applyInboxRules } from "@/lib/inbox-rules";
import { ftsDeleteRow, ftsReplaceRow } from "@/lib/fts";
import { mergeTags } from "@/lib/tags";

function err(message: string) {
  redirect(`/inbox?error=${encodeURIComponent(message)}`);
}

export async function createInboxManual(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) err("Title is required");

  const body = String(formData.get("body") ?? "");
  const tagInput = String(formData.get("tags") ?? "");
  const manualTags = tagInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const { tags: ruleTags, state } = applyInboxRules({ title, body });
  const tags = mergeTags(ruleTags, manualTags);

  const item = await prisma.inboxItem.create({
    data: {
      title,
      body,
      source: "MANUAL",
      state,
      tags,
    },
  });
  await ftsReplaceRow("inbox", item.id, item.title, item.body);
  revalidatePath("/inbox");
  revalidatePath("/dashboard");
  revalidatePath("/search");
  redirect("/inbox");
}

export async function updateInboxState(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim() as InboxState;
  const allowed: InboxState[] = ["NEW", "NEEDS_REVIEW", "ARCHIVED"];
  if (!id || !allowed.includes(state)) err("Invalid update");

  await prisma.inboxItem.update({ where: { id }, data: { state } });
  revalidatePath("/inbox");
  revalidatePath("/dashboard");
  redirect("/inbox");
}

export async function deleteInboxItem(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) err("Missing item");

  await prisma.inboxItem.delete({ where: { id } }).catch(() => null);
  await ftsDeleteRow("inbox", id);
  revalidatePath("/inbox");
  revalidatePath("/dashboard");
  revalidatePath("/search");
  redirect("/inbox");
}
