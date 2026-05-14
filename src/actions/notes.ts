"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ftsDeleteRow, ftsReplaceRow } from "@/lib/fts";
import { stringifyTags } from "@/lib/tags";

const LINK_TYPES = ["EVENT", "INBOX_ITEM", "TRANSACTION"] as const;

function err(path: string, message: string) {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function createNote(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) err("/notes/new", "Title is required");

  const body = String(formData.get("body") ?? "");
  const tagInput = String(formData.get("tags") ?? "");
  const manualTags = tagInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const note = await prisma.note.create({
    data: { title, body, tags: stringifyTags(manualTags) },
  });
  await ftsReplaceRow("note", note.id, note.title, note.body);
  revalidatePath("/notes");
  revalidatePath("/dashboard");
  revalidatePath("/search");
  redirect(`/notes/${note.id}`);
}

export async function updateNote(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) err("/notes", "Missing note id");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) err(`/notes/${id}`, "Title is required");

  const body = String(formData.get("body") ?? "");
  const tagInput = String(formData.get("tags") ?? "");
  const manualTags = tagInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const pinned = String(formData.get("pinned") ?? "off") === "on";

  const existing = await prisma.note.findUnique({ where: { id } });
  if (!existing) err("/notes", "Note not found");

  const tags = stringifyTags(manualTags);

  const note = await prisma.note.update({
    where: { id },
    data: { title, body, tags, pinned },
  });
  await ftsReplaceRow("note", note.id, note.title, note.body);
  revalidatePath("/notes");
  revalidatePath(`/notes/${id}`);
  revalidatePath("/dashboard");
  revalidatePath("/search");
  redirect(`/notes/${id}`);
}

export async function deleteNote(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) err("/notes", "Missing note id");

  await prisma.note.delete({ where: { id } }).catch(() => null);
  await ftsDeleteRow("note", id);
  revalidatePath("/notes");
  revalidatePath("/dashboard");
  revalidatePath("/search");
  redirect("/notes");
}

export async function addNoteLink(formData: FormData) {
  const noteId = String(formData.get("noteId") ?? "").trim();
  const targetType = String(formData.get("targetType") ?? "").trim().toUpperCase();
  const targetId = String(formData.get("targetId") ?? "").trim();

  if (!noteId || !targetId) err("/notes", "Link target is required");
  if (!LINK_TYPES.includes(targetType as (typeof LINK_TYPES)[number])) {
    err(`/notes/${noteId}`, "Invalid link type");
  }

  await prisma.noteLink.create({
    data: { noteId, targetType, targetId },
  });
  revalidatePath(`/notes/${noteId}`);
  revalidatePath("/dashboard");
  redirect(`/notes/${noteId}`);
}

export async function removeNoteLink(formData: FormData) {
  const linkId = String(formData.get("linkId") ?? "").trim();
  const noteId = String(formData.get("noteId") ?? "").trim();
  if (!linkId || !noteId) err("/notes", "Missing link");

  await prisma.noteLink.delete({ where: { id: linkId } });
  revalidatePath(`/notes/${noteId}`);
  redirect(`/notes/${noteId}`);
}
