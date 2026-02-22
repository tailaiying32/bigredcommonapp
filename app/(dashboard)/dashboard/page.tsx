import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText } from "lucide-react";

export const metadata = {
  title: "Dashboard | Cornell Common",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if this is a team owner account
  const { data: ownedTeam } = await supabase
    .from("teams")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (ownedTeam) {
    // Team account — redirect to their admin page
    redirect(`/admin/${ownedTeam.id}`);
  }

  // Student account — require profile
  const { data: profile } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/profile/create");
  }

  // Fetch application count
  const { count: appCount } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("student_id", user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {profile.full_name.split(" ")[0]}</h1>
        <p className="mt-2 text-muted-foreground">
          Browse project teams and submit applications from your dashboard.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Browse Teams</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <CardDescription className="mb-3">
              Explore Cornell project teams and find the right fit.
            </CardDescription>
            <div className="mt-auto">
              <Button asChild size="sm">
                <Link href="/teams">View Teams</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              My Applications
            </CardTitle>
            <FileText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <CardDescription className="mb-3">
              <span className="font-bold text-foreground">{appCount ?? 0}</span>{" "}
              application{(appCount ?? 0) !== 1 ? "s" : ""} submitted
            </CardDescription>
            <div className="mt-auto">
              <Button asChild size="sm" variant="outline">
                <Link href="/applications">View Applications</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
