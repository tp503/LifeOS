"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const CATEGORIES = ["general", "medical", "birthday", "kids_club", "finance", "travel"] as const;

function err(message: string) {
  redirect(`/calendar?error=${encodeURIComponent(message)}`);
}

export async function createManualEvent(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) err("Title is required");

  const startsRaw = String(formData.get("startsAt") ?? "").trim();
  if (!startsRaw) err("Start time is required");

  const startsAt = new Date(startsRaw);
  if (Number.isNaN(startsAt.getTime())) err("Invalid start time");

  const category = String(formData.get("category") ?? "general").trim();
  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    err("Invalid category");
  }

  await prisma.event.create({
    data: {
      title,
      startsAt,
      category,
      source: "manual",
    },
  });
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  redirect("/calendar");
}
