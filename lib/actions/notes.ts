"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Note } from "@/types/database";

export async function addNote(applicationId: string, body: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const trimmed = body.trim();
  if (!trimmed) {
    return { error: "Note cannot be empty" };
  }
  if (trimmed.length > 5000) {
    return { error: "Note cannot exceed 5000 characters" };
  }

  // Fetch application to get team_id
  const { data: app, error: fetchError } = await supabase
    .from("applications")
    .select("id, team_id")
    .eq("id", applicationId)
    .single();

  if (fetchError || !app) {
    return { error: "Application not found" };
  }

  // Verify user is team owner or reviewer
  const { data: team } = await supabase
    .from("teams")
    .select("owner_id")
    .eq("id", app.team_id)
    .single();

  const isOwner = team?.owner_id === user.id;

  if (!isOwner) {
    const { data: membership } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", app.team_id)
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return { error: "Not authorized" };
    }
  }

  const { data: note, error } = await supabase
    .from("notes")
    .insert({
      application_id: applicationId,
      author_id: user.id,
      body: trimmed,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/${app.team_id}`);
  revalidatePath(`/admin/${app.team_id}/applications/${applicationId}`);

  return { success: true, note: note as Note };
}

export async function updateNote(noteId: string, body: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const trimmed = body.trim();
  if (!trimmed) {
    return { error: "Note cannot be empty" };
  }
  if (trimmed.length > 5000) {
    return { error: "Note cannot exceed 5000 characters" };
  }

  // Fetch note and verify ownership
  const { data: note, error: fetchError } = await supabase
    .from("notes")
    .select("id, author_id, application_id")
    .eq("id", noteId)
    .single();

  if (fetchError || !note) {
    return { error: "Note not found" };
  }

  if (note.author_id !== user.id) {
    return { error: "Not authorized to edit this note" };
  }

  const { error } = await supabase
    .from("notes")
    .update({ body: trimmed })
    .eq("id", noteId);

  if (error) {
    return { error: error.message };
  }

  // Get team_id for revalidation
  const { data: app } = await supabase
    .from("applications")
    .select("team_id")
    .eq("id", note.application_id)
    .single();

  if (app) {
    revalidatePath(`/admin/${app.team_id}`);
    revalidatePath(
      `/admin/${app.team_id}/applications/${note.application_id}`
    );
  }

  return { success: true };
}

export async function deleteNote(noteId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Fetch note and verify ownership
  const { data: note, error: fetchError } = await supabase
    .from("notes")
    .select("id, author_id, application_id")
    .eq("id", noteId)
    .single();

  if (fetchError || !note) {
    return { error: "Note not found" };
  }

  if (note.author_id !== user.id) {
    return { error: "Not authorized to delete this note" };
  }

  const { error } = await supabase.from("notes").delete().eq("id", noteId);

  if (error) {
    return { error: error.message };
  }

  // Get team_id for revalidation
  const { data: app } = await supabase
    .from("applications")
    .select("team_id")
    .eq("id", note.application_id)
    .single();

  if (app) {
    revalidatePath(`/admin/${app.team_id}`);
    revalidatePath(
      `/admin/${app.team_id}/applications/${note.application_id}`
    );
  }

  return { success: true };
}

export async function getNotes(applicationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", notes: [] as Note[] };
  }

  const { data, error } = await supabase
    .from("notes")
    .select()
    .eq("application_id", applicationId)
    .order("created_at", { ascending: true });

  if (error) {
    return { error: error.message, notes: [] as Note[] };
  }

  return { notes: (data ?? []) as Note[] };
}

export async function getNoteCounts(applicationIds: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || applicationIds.length === 0) {
    return {} as Record<string, number>;
  }

  const { data, error } = await supabase
    .from("notes")
    .select("application_id")
    .in("application_id", applicationIds);

  if (error || !data) {
    return {} as Record<string, number>;
  }

  const counts: Record<string, number> = {};
  for (const row of data) {
    counts[row.application_id] = (counts[row.application_id] ?? 0) + 1;
  }
  return counts;
}
