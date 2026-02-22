import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { UserNav } from "./user-nav";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  let ownedTeam: { id: string; name: string } | null = null;
  let reviewerTeams: { id: string; name: string }[] = [];

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select()
      .eq("id", user.id)
      .single();
    profile = data;

    // Check if this user owns a team (team account)
    const { data: owned } = await supabase
      .from("teams")
      .select("id, name")
      .eq("owner_id", user.id)
      .single();
    ownedTeam = owned;

    // Check if this user is a reviewer for any teams (student account)
    if (!ownedTeam) {
      const { data: memberships } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", user.id);

      if (memberships && memberships.length > 0) {
        const teamIds = memberships.map((m) => m.team_id);
        const { data: teams } = await supabase
          .from("teams")
          .select("id, name")
          .in("id", teamIds);
        reviewerTeams = teams ?? [];
      }
    }
  }

  const isTeamOwner = !!ownedTeam;

  // Display name for the nav
  const navName = isTeamOwner
    ? ownedTeam!.name
    : profile?.full_name ?? "User";
  const navEmail = user?.email ?? "";

  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link
            href={isTeamOwner ? `/admin/${ownedTeam!.id}` : "/dashboard"}
            className="text-xl font-bold"
          >
            Cornell Common
          </Link>
          <nav className="hidden items-center gap-4 text-sm md:flex">
            {!isTeamOwner && (
              <>
                <Link
                  href="/teams"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Teams
                </Link>
                {profile && (
                  <Link
                    href="/applications"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    My Applications
                  </Link>
                )}
                {reviewerTeams.map((t) => (
                  <Link
                    key={t.id}
                    href={`/admin/${t.id}`}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t.name} (Reviewer)
                  </Link>
                ))}
              </>
            )}
          </nav>
        </div>
        {user && (
          <UserNav
            name={navName}
            email={navEmail}
            netid={profile?.netid}
          />
        )}
      </div>
    </header>
  );
}
