import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ApplicationsTable } from "@/components/admin/applications-table";
import { getMessageCounts } from "@/lib/actions/messages";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const supabase = await createClient();
  const { data: team } = await supabase
    .from("teams")
    .select("name")
    .eq("id", teamId)
    .single();

  return {
    title: team
      ? `Admin: ${team.name} | Cornell Common`
      : "Team Not Found",
  };
}

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
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
    .select("name, owner_id")
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

  // Fetch applications (exclude drafts)
  const { data: applications } = await supabase
    .from("applications")
    .select()
    .eq("team_id", teamId)
    .neq("status", "draft")
    .order("updated_at", { ascending: false });

  const appRows = applications ?? [];

  // Fetch applicant profiles
  const studentIds = [...new Set(appRows.map((a) => a.student_id))];
  const { data: profiles } = studentIds.length > 0
    ? await supabase
        .from("profiles")
        .select("id, full_name, netid, email")
        .in("id", studentIds)
    : { data: [] };
  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p])
  );

  const messageCounts = await getMessageCounts(appRows.map((a) => a.id));

  const apps = appRows.map((a) => ({
    id: a.id,
    team_id: a.team_id,
    status: a.status,
    updated_at: a.updated_at,
    profile: profileMap.get(a.student_id) ?? null,
    message_count: messageCounts[a.id] ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{team.name}</h1>
        <p className="mt-2 text-muted-foreground">
          {apps.length} application{apps.length !== 1 ? "s" : ""} received
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <ApplicationsTable apps={apps} teamId={teamId} />
        </CardContent>
      </Card>
    </div>
  );
}
