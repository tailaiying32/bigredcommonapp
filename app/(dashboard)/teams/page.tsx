import { createClient } from "@/lib/supabase/server";
import { TeamCard } from "@/components/teams/team-card";
import { TeamFilter } from "@/components/teams/team-filter";
import type { Team } from "@/types/database";

export const metadata = {
  title: "Browse Teams | Cornell Common",
};

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const supabase = await createClient();

  const { data: teams } = await supabase
    .from("teams")
    .select()
    .order("name");

  const allTeams = (teams ?? []) as Team[];

  // Get unique categories
  const categories = [
    ...new Set(allTeams.map((t) => t.category).filter(Boolean)),
  ] as string[];

  // Filter by category if selected
  const filtered = category
    ? allTeams.filter((t) => t.category === category)
    : allTeams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Browse Teams</h1>
        <p className="mt-2 text-muted-foreground">
          Explore Cornell project teams and submit your applications.
        </p>
      </div>

      <TeamFilter categories={categories} />

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">No teams found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}
