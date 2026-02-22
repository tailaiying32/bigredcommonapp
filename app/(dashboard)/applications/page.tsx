import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/applications/status-badge";
import { getMessageCounts } from "@/lib/actions/messages";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
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
import type { ApplicationStatus } from "@/types/database";

export const metadata = {
  title: "My Applications | Cornell Common",
};

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: applications } = await supabase
    .from("applications")
    .select()
    .eq("student_id", user.id)
    .order("updated_at", { ascending: false });

  const appRows = applications ?? [];

  // Fetch team names for all applications
  const teamIds = [...new Set(appRows.map((a) => a.team_id))];
  const { data: teams } = teamIds.length > 0
    ? await supabase.from("teams").select("id, name").in("id", teamIds)
    : { data: [] };
  const teamMap = new Map((teams ?? []).map((t) => [t.id, t.name]));

  const messageCounts = await getMessageCounts(appRows.map((a) => a.id));

  const apps = appRows.map((a) => ({
    ...a,
    team_name: teamMap.get(a.team_id) ?? "Unknown Team",
    message_count: messageCounts[a.id] ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Applications</h1>
        <p className="mt-2 text-muted-foreground">
          Track your applications to project teams.
        </p>
      </div>

      {apps.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No applications yet</CardTitle>
            <CardDescription>
              <Link href="/teams" className="text-primary hover:underline">
                Browse teams
              </Link>{" "}
              to start applying.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apps.map((app) => {
                  return (
                    <TableRow key={app.id}>
                      <TableCell>
                        <Link
                          href={`/teams/${app.team_id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {app.team_name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={app.status as ApplicationStatus}
                        />
                      </TableCell>
                      <TableCell>
                        {app.message_count > 0 && (
                          <Badge variant="secondary" className="gap-1">
                            <MessageSquare className="size-3" />
                            {app.message_count}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(app.updated_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
