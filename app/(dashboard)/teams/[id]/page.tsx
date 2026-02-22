import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ApplicationForm } from "@/components/applications/application-form";
import { StatusBadge } from "@/components/applications/status-badge";
import { Badge } from "@/components/ui/badge";
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
import type { TeamQuestion, Application, Message } from "@/types/database";
import { ExternalLink } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{team.name}</h1>
          {team.category && <Badge variant="secondary">{team.category}</Badge>}
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
          {user ? (
            <ApplicationForm
              teamId={id}
              questions={questions}
              existingApplication={existingApp}
            />
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                Sign in to apply to this team.
              </p>
              <Button asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
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
