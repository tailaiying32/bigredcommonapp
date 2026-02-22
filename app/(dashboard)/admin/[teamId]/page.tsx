import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/applications/status-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ApplicationStatus } from "@/types/database";

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

  const apps = appRows.map((a) => ({
    ...a,
    profile: profileMap.get(a.student_id) ?? null,
  }));

  const statusFilters: { value: string; label: string }[] = [
    { value: "all", label: `All (${apps.length})` },
    {
      value: "submitted",
      label: `Submitted (${apps.filter((a) => a.status === "submitted").length})`,
    },
    {
      value: "interviewing",
      label: `Interviewing (${apps.filter((a) => a.status === "interviewing").length})`,
    },
    {
      value: "accepted",
      label: `Accepted (${apps.filter((a) => a.status === "accepted").length})`,
    },
    {
      value: "rejected",
      label: `Rejected (${apps.filter((a) => a.status === "rejected").length})`,
    },
  ];

  function renderTable(
    filteredApps: typeof apps
  ) {
    if (filteredApps.length === 0) {
      return (
        <p className="py-4 text-center text-muted-foreground">
          No applications found.
        </p>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Applicant</TableHead>
            <TableHead>NetID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredApps.map((app) => {
            return (
              <TableRow key={app.id}>
                <TableCell className="font-medium">
                  {app.profile?.full_name ?? "Unknown"}
                </TableCell>
                <TableCell>{app.profile?.netid ?? "—"}</TableCell>
                <TableCell>
                  <StatusBadge status={app.status as ApplicationStatus} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(app.updated_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/${teamId}/applications/${app.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Review
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  }

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
          <Tabs defaultValue="all">
            <TabsList>
              {statusFilters.map((f) => (
                <TabsTrigger key={f.value} value={f.value}>
                  {f.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="all" className="mt-4">
              {renderTable(apps)}
            </TabsContent>
            <TabsContent value="submitted" className="mt-4">
              {renderTable(apps.filter((a) => a.status === "submitted"))}
            </TabsContent>
            <TabsContent value="interviewing" className="mt-4">
              {renderTable(apps.filter((a) => a.status === "interviewing"))}
            </TabsContent>
            <TabsContent value="accepted" className="mt-4">
              {renderTable(apps.filter((a) => a.status === "accepted"))}
            </TabsContent>
            <TabsContent value="rejected" className="mt-4">
              {renderTable(apps.filter((a) => a.status === "rejected"))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
