import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/applications/status-badge";
import { StatusChanger } from "@/components/admin/status-changer";
import { MessageThread } from "@/components/messages/message-thread";
import { NotesPanel } from "@/components/admin/notes-panel";
import type { NoteWithAuthor } from "@/components/admin/notes-panel";
import { getMessages } from "@/lib/actions/messages";
import { getNotes } from "@/lib/actions/notes";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { TeamQuestion, ApplicationStatus, Message } from "@/types/database";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ teamId: string; applicationId: string }>;
}) {
  const { applicationId } = await params;
  return {
    title: `Review Application | Cornell Common`,
  };
  void applicationId;
}

export default async function ReviewApplicationPage({
  params,
}: {
  params: Promise<{ teamId: string; applicationId: string }>;
}) {
  const { teamId, applicationId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch team and check access (owner or reviewer)
  const { data: team } = await supabase
    .from("teams")
    .select()
    .eq("id", teamId)
    .single();

  if (!team) {
    notFound();
  }

  const isOwner = team.owner_id === user.id;

  // If not owner, check if reviewer
  if (!isOwner) {
    const { data: membership } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      notFound();
    }
  }

  // Fetch application
  const { data: app } = await supabase
    .from("applications")
    .select()
    .eq("id", applicationId)
    .eq("team_id", teamId)
    .single();

  if (!app) {
    notFound();
  }

  // Fetch applicant profile
  const { data: profile } = await supabase
    .from("profiles")
    .select()
    .eq("id", app.student_id)
    .single();

  const questions = team.custom_questions as unknown as TeamQuestion[];
  const answers = app.answers as Record<string, string>;

  // Fetch messages and notes
  const { messages } = await getMessages(app.id);
  const { notes } = await getNotes(app.id);

  // Resolve author names for notes
  const authorIds = [...new Set(notes.map((n) => n.author_id))];
  const authorNameMap = new Map<string, string>();

  if (authorIds.length > 0) {
    // Fetch profiles for reviewers
    const { data: authorProfiles } = await getSupabaseAdmin()
      .from("profiles")
      .select("id, full_name")
      .in("id", authorIds);

    for (const p of authorProfiles ?? []) {
      authorNameMap.set(p.id, p.full_name ?? "Unknown");
    }

    // For authors without a profile (team owner accounts), fall back to "Team"
    for (const id of authorIds) {
      if (!authorNameMap.has(id)) {
        authorNameMap.set(id, "Team");
      }
    }
  }

  const notesWithAuthors: NoteWithAuthor[] = notes.map((n) => ({
    id: n.id,
    body: n.body,
    author_id: n.author_id,
    author_name: authorNameMap.get(n.author_id) ?? "Unknown",
    created_at: n.created_at,
    updated_at: n.updated_at,
  }));

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/${teamId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to applications
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {profile?.full_name ?? "Unknown Applicant"}
          </h1>
          <p className="text-muted-foreground">
            {profile?.netid} &middot; {profile?.email}
          </p>
        </div>
        <StatusBadge status={app.status as ApplicationStatus} />
      </div>

      {/* Applicant Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Applicant Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-medium text-muted-foreground">Major</dt>
              <dd>{profile?.major ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">
                Graduation Year
              </dt>
              <dd>{profile?.grad_year ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">GPA</dt>
              <dd>{profile?.gpa ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Resume</dt>
              <dd>
                {profile?.resume_url ? (
                  <span className="inline-flex items-center gap-3">
                    <a
                      href={profile.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View Resume
                    </a>
                    <a
                      href={profile.resume_url}
                      download="resume.pdf"
                      className="text-primary hover:underline"
                    >
                      Download
                    </a>
                  </span>
                ) : (
                  <span className="text-muted-foreground">No resume uploaded</span>
                )}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Application Answers */}
      <Card>
        <CardHeader>
          <CardTitle>Application Responses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((q) => (
            <div key={q.id}>
              <p className="text-sm font-medium text-muted-foreground">
                {q.label}
              </p>
              <p className="mt-1">{answers[q.id] || "—"}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <MessageThread
            applicationId={app.id}
            currentUserId={user.id}
            canSend={isOwner}
            initialMessages={messages}
          />
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
          <CardDescription>
            Internal notes visible to all team members.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotesPanel
            applicationId={app.id}
            currentUserId={user.id}
            initialNotes={notesWithAuthors}
          />
        </CardContent>
      </Card>

      {/* Status Changer (admin only) */}
      <Card>
        <CardHeader>
          <CardTitle>Update Status</CardTitle>
          <CardDescription>
            {isOwner
              ? "Change the application status below."
              : "Only the team account can change application status."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isOwner ? (
            <StatusChanger
              applicationId={app.id}
              currentStatus={app.status as ApplicationStatus}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Current status:{" "}
              <StatusBadge status={app.status as ApplicationStatus} />
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
