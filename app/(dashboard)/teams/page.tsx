import { createClient } from "@/lib/supabase/server";
import { TeamCard } from "@/components/teams/team-card";
import type { Team } from "@/types/database";

export const metadata = {
  title: "Browse Teams | Cornell Common",
};

export default async function TeamsPage() {
  const supabase = await createClient();

  const { data: teams } = await supabase
    .from("teams")
    .select()
    .order("name");

  const allTeams = (teams ?? []) as Team[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Browse Teams</h1>
        <p className="mt-2 text-muted-foreground">
          Explore Cornell project teams and submit your applications.
        </p>
      </div>

      {allTeams.length === 0 ? (
        <p className="text-muted-foreground">No teams found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allTeams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}
