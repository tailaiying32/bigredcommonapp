"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { messageSchema } from "@/lib/validations/message";
import { sendEmail } from "@/lib/email/ses";
import { teamMessageEmail, applicantMessageEmail } from "@/lib/email/templates";
import type { Message } from "@/types/database";

export async function sendMessage(applicationId: string, body: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Validate input
  const parsed = messageSchema.safeParse({ applicationId, body });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Fetch application to determine sender_type
  const { data: app, error: fetchError } = await supabase
    .from("applications")
    .select("id, student_id, team_id")
    .eq("id", applicationId)
    .single();

  if (fetchError || !app) {
    return { error: "Application not found" };
  }

  let senderType: "team" | "applicant";

  if (app.student_id === user.id) {
    senderType = "applicant";
  } else {
    // Check if user is team owner
    const { data: teamAuth } = await supabase
      .from("teams")
      .select("owner_id")
      .eq("id", app.team_id)
      .single();

    if (!teamAuth || teamAuth.owner_id !== user.id) {
      return { error: "Not authorized to send messages on this application" };
    }
    senderType = "team";
  }

  const { error } = await supabase.from("messages").insert({
    application_id: applicationId,
    sender_id: user.id,
    sender_type: senderType,
    body: parsed.data.body,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/teams/${app.team_id}`);
  revalidatePath(`/admin/${app.team_id}/applications/${applicationId}`);

  // Fire-and-forget email notifications
  if (senderType === "team") {
    // Team → applicant: notify the applicant
    const { data: applicant } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", app.student_id)
      .single();

    const { data: team } = await supabase
      .from("teams")
      .select("name")
      .eq("id", app.team_id)
      .single();

    if (applicant?.email && team) {
      const { subject, html } = teamMessageEmail({
        applicantName: applicant.full_name ?? "Applicant",
        teamName: team.name,
        messagePreview: parsed.data.body,
      });
      void sendEmail(applicant.email, subject, html);
    }
  } else {
    // Applicant → team: notify team owner + reviewers
    const { data: sender } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const { data: team } = await supabase
      .from("teams")
      .select("name, owner_id")
      .eq("id", app.team_id)
      .single();

    if (team && team.owner_id) {
      const recipients: string[] = [];

      // Get team owner email from auth.users (team accounts have no profile)
      const { data: ownerData } = await getSupabaseAdmin().auth.admin.getUserById(
        team.owner_id
      );
      if (ownerData?.user?.email) {
        recipients.push(ownerData.user.email);
      }

      // Get reviewer emails from team_members → profiles
      const { data: members } = await supabase
        .from("team_members")
        .select("user_id")
        .eq("team_id", app.team_id);

      if (members && members.length > 0) {
        const memberIds = members.map((m) => m.user_id);
        const { data: reviewerProfiles } = await supabase
          .from("profiles")
          .select("email")
          .in("id", memberIds);

        if (reviewerProfiles) {
          for (const rp of reviewerProfiles) {
            if (rp.email) recipients.push(rp.email);
          }
        }
      }

      // Deduplicate and send
      const uniqueRecipients = [...new Set(recipients)];
      if (uniqueRecipients.length > 0) {
        const { subject, html } = applicantMessageEmail({
          applicantName: sender?.full_name ?? "An applicant",
          teamName: team.name,
          messagePreview: parsed.data.body,
          teamId: app.team_id,
          applicationId,
        });
        void sendEmail(uniqueRecipients, subject, html);
      }
    }
  }

  return { success: true };
}

export async function getMessages(applicationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", messages: [] as Message[] };
  }

  const { data, error } = await supabase
    .from("messages")
    .select()
    .eq("application_id", applicationId)
    .order("created_at", { ascending: true });

  if (error) {
    return { error: error.message, messages: [] as Message[] };
  }

  return { messages: (data ?? []) as Message[] };
}

export async function getMessageCounts(applicationIds: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || applicationIds.length === 0) {
    return {} as Record<string, number>;
  }

  const { data, error } = await supabase
    .from("messages")
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
