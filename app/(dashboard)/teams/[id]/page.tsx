import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ApplicationForm } from "@/components/applications/application-form";
import { StatusBadge } from "@/components/applications/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageThread } from "@/components/messages/message-thread";
import { getMessages } from "@/lib/actions/messages";
import type { TeamQuestion, Application, Message, ClassStanding } from "@/types/database";
import { ExternalLink, Clock } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: team } = await supabase
    .from("teams")
    .select("name")
    .eq("id", id)
    .single();

  return { title: team ? `${team.name} | Cornell Common` : "Team Not Found" };
}

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: team } = await supabase
    .from("teams")
    .select()
    .eq("id", id)
    .single();

  if (!team) {
    notFound();
  }

  const questions = team.custom_questions as unknown as TeamQuestion[];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let existingApp: Application | null = null;
  if (user) {
    const { data } = await supabase
      .from("applications")
      .select()
      .eq("team_id", id)
      .eq("student_id", user.id)
      .single();
    existingApp = data;
  }

  // Fetch messages for submitted applications
  let messages: Message[] = [];
  if (existingApp && existingApp.status !== "draft") {
    const result = await getMessages(existingApp.id);
    messages = result.messages;
  }

  // Determine deadline for this user
  let deadline: string | null = null;
  let deadlinePassed = false;
  let deadlineSoon = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("class_standing")
      .eq("id", user.id)
      .single();

    const standing: ClassStanding | null = profile?.class_standing ?? null;
    deadline =
      standing === "lowerclassman"
        ? team.lowerclassman_deadline
        : team.upperclassman_deadline;

    if (deadline) {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      deadlinePassed = now > deadlineDate;
      const threeDays = 3 * 24 * 60 * 60 * 1000;
      deadlineSoon = !deadlinePassed && deadlineDate.getTime() - now.getTime() < threeDays;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-4">
          {team.logo_url ? (
            <Image
              src={team.logo_url}
              alt={`${team.name} logo`}
              width={64}
              height={64}
              className="size-16 shrink-0 rounded-lg object-contain"
            />
          ) : (
            <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-2xl font-bold text-primary">
              {team.name.charAt(0)}
            </div>
          )}
          <h1 className="text-3xl font-bold">{team.name}</h1>
        </div>
        {team.description && (
          <p className="mt-2 text-muted-foreground">{team.description}</p>
        )}
        {team.website && (
          <a
            href={team.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Visit website <ExternalLink className="size-3" />
          </a>
        )}
        {deadline && (
          <p
            className={`mt-2 flex items-center gap-1.5 text-sm ${
              deadlinePassed
                ? "text-destructive"
                : deadlineSoon
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-muted-foreground"
            }`}
          >
            <Clock className="size-3.5" />
            {deadlinePassed
              ? "Applications closed"
              : `Applications due ${new Date(deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}`}
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {existingApp
              ? existingApp.status === "draft"
                ? "Continue Your Application"
                : "Your Application"
              : "Apply"}
          </CardTitle>
          {existingApp && (
            <CardDescription className="flex items-center gap-2">
              Status: <StatusBadge status={existingApp.status} />
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {!user ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                Sign in to apply to this team.
              </p>
              <Button asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          ) : deadlinePassed && (!existingApp || existingApp.status === "draft") ? (
            <p className="py-6 text-center text-muted-foreground">
              The application deadline has passed.
            </p>
          ) : (
            <ApplicationForm
              teamId={id}
              questions={questions}
              existingApplication={existingApp}
            />
          )}
        </CardContent>
      </Card>

      {user && existingApp && existingApp.status !== "draft" && (
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <MessageThread
              applicationId={existingApp.id}
              currentUserId={user.id}
              canSend={true}
              initialMessages={messages}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
