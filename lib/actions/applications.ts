"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { buildApplicationSchema } from "@/lib/validations/application";
import { sendEmail } from "@/lib/email/ses";
import { statusChangeEmail } from "@/lib/email/templates";
import type { TeamQuestion, ClassStanding } from "@/types/database";

async function checkDeadline(
  supabase: Awaited<ReturnType<typeof createClient>>,
  teamId: string,
  userId: string
): Promise<string | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("class_standing")
    .eq("id", userId)
    .single();

  const standing: ClassStanding | null = profile?.class_standing ?? null;

  const { data: team } = await supabase
    .from("teams")
    .select("upperclassman_deadline, lowerclassman_deadline")
    .eq("id", teamId)
    .single();

  if (!team) return null;

  // Use the relevant deadline based on standing; default to upperclassman if unknown
  const deadline =
    standing === "lowerclassman"
      ? team.lowerclassman_deadline
      : team.upperclassman_deadline;

  if (deadline && new Date() > new Date(deadline)) {
    return "The application deadline has passed";
  }

  return null;
}

export async function createApplication(
  teamId: string,
  answers: Record<string, string>
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const deadlineError = await checkDeadline(supabase, teamId, user.id);
  if (deadlineError) {
    return { error: deadlineError };
  }

  const { data, error } = await supabase
    .from("applications")
    .insert({
      student_id: user.id,
      team_id: teamId,
      status: "draft",
      answers,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/teams/${teamId}`);
  revalidatePath("/applications");
  return { success: true, applicationId: data.id };
}

export async function updateApplication(
  applicationId: string,
  answers: Record<string, string>
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("applications")
    .update({ answers })
    .eq("id", applicationId)
    .eq("student_id", user.id)
    .eq("status", "draft");

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/applications");
  return { success: true };
}

export async function submitApplication(
  applicationId: string,
  questions: TeamQuestion[]
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Fetch current application
  const { data: app, error: fetchError } = await supabase
    .from("applications")
    .select()
    .eq("id", applicationId)
    .eq("student_id", user.id)
    .eq("status", "draft")
    .single();

  if (fetchError || !app) {
    return { error: "Application not found or already submitted" };
  }

  const deadlineError = await checkDeadline(supabase, app.team_id, user.id);
  if (deadlineError) {
    return { error: deadlineError };
  }

  // Validate answers against required questions
  const schema = buildApplicationSchema(questions);
  const answers = app.answers as Record<string, string>;
  const parsed = schema.safeParse(answers);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase
    .from("applications")
    .update({ status: "submitted" })
    .eq("id", applicationId)
    .eq("student_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/applications");
  return { success: true };
}

export async function updateApplicationStatus(
  applicationId: string,
  newStatus: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Fetch the application to get the team_id
  const { data: app, error: fetchError } = await supabase
    .from("applications")
    .select()
    .eq("id", applicationId)
    .single();

  if (fetchError || !app) {
    return { error: "Application not found" };
  }

  // Verify user is the team owner
  const { data: team } = await supabase
    .from("teams")
    .select("owner_id, name")
    .eq("id", app.team_id)
    .single();

  if (!team || team.owner_id !== user.id) {
    return { error: "Only the team account can update application status" };
  }

  const { error } = await supabase
    .from("applications")
    .update({ status: newStatus as "submitted" | "interviewing" | "accepted" | "rejected" })
    .eq("id", applicationId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/${app.team_id}`);

  // Fire-and-forget email notification
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", app.student_id)
    .single();

  if (profile?.email) {
    const { subject, html } = statusChangeEmail({
      applicantName: profile.full_name ?? "Applicant",
      teamName: team.name,
      newStatus,
    });
    void sendEmail(profile.email, subject, html);
  }

  return { success: true };
}
