"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateDeadlines(
  teamId: string,
  upperclassmanDeadline: string | null,
  lowerclassmanDeadline: string | null
) {
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
    return { error: "Only the team owner can set deadlines" };
  }

  const { error } = await supabase
    .from("teams")
    .update({
      upperclassman_deadline: upperclassmanDeadline || null,
      lowerclassman_deadline: lowerclassmanDeadline || null,
    })
    .eq("id", teamId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/${teamId}`);
  revalidatePath(`/teams/${teamId}`);
  revalidatePath("/teams");
  return { success: true };
}
