"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function addReviewer(teamId: string, identifier: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Verify ownership
  const { data: team } = await supabase
    .from("teams")
    .select("owner_id")
    .eq("id", teamId)
    .single();

  if (!team || team.owner_id !== user.id) {
    return { error: "Only the team owner can manage reviewers" };
  }

  // Look up the profile by NetID or email (admin client bypasses RLS)
  const isEmail = identifier.includes("@");
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, netid, full_name")
    .eq(isEmail ? "email" : "netid", identifier)
    .single();

  if (!profile) {
    return { error: `No account found for "${identifier}"` };
  }

  // Can't add self
  if (profile.id === user.id) {
    return { error: "You can't add yourself as a reviewer" };
  }

  // Insert via regular client (uses new RLS policy)
  const { error } = await supabase
    .from("team_members")
    .insert({ team_id: teamId, user_id: profile.id, role: "reviewer" });

  if (error) {
    if (error.code === "23505") {
      return { error: "This person is already a reviewer" };
    }
    return { error: error.message };
  }

  revalidatePath(`/admin/${teamId}`);
  return { success: true, reviewer: { id: profile.id, netid: profile.netid, full_name: profile.full_name } };
}

export async function removeReviewer(teamId: string, userId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Verify ownership
  const { data: team } = await supabase
    .from("teams")
    .select("owner_id")
    .eq("id", teamId)
    .single();

  if (!team || team.owner_id !== user.id) {
    return { error: "Only the team owner can manage reviewers" };
  }

  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/${teamId}`);
  return { success: true };
}
