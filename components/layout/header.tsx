import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { UserNav } from "./user-nav";
import { MobileNav } from "./mobile-nav";

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

  // Build nav links based on account type
  const navLinks: { href: string; label: string }[] = [];
  if (!isTeamOwner) {
    navLinks.push({ href: "/teams", label: "Teams" });
    if (profile) {
      navLinks.push({ href: "/applications", label: "My Applications" });
      navLinks.push({ href: "/profile/edit", label: "Edit Profile" });
    }
    for (const t of reviewerTeams) {
      navLinks.push({ href: `/admin/${t.id}`, label: `${t.name} (Reviewer)` });
    }
  }

  const navName = isTeamOwner
    ? ownedTeam!.name
    : profile?.full_name ?? "User";
  const navEmail = user?.email ?? "";
  const homeHref = isTeamOwner ? `/admin/${ownedTeam!.id}` : "/dashboard";

  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {navLinks.length > 0 && <MobileNav links={navLinks} />}
          <Link href={homeHref} className="text-xl font-bold">
            Cornell Common
          </Link>
          <nav className="hidden items-center gap-4 text-sm md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        {user && (
          <UserNav
            name={navName}
            email={navEmail}
            netid={profile?.netid}
            hasProfile={!!profile}
          />
        )}
      </div>
    </header>
  );
}
