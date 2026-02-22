import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { TeamMarquee } from "@/components/teams/team-marquee";
import { ClipboardList, MessageSquare, Users } from "lucide-react";
import type { Team } from "@/types/database";

export default async function Home() {
  const supabase = await createClient();
  const { data: teams } = await supabase
    .from("teams")
    .select()
    .order("name");

  const allTeams = (teams ?? []) as Team[];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <Image
            src="/CDE_Logo_Stacked.png"
            alt="Cornell Duffield Engineering"
            width={280}
            height={96}
            className="mx-auto mb-8 h-16 w-auto dark:hidden sm:h-20"
            priority
          />
          <Image
            src="/CornellDuffieldEngineering_Stacked_Logo_No_Seal_White.png"
            alt="Cornell Duffield Engineering"
            width={280}
            height={96}
            className="mx-auto mb-8 hidden h-16 w-auto dark:block sm:h-20"
            priority
          />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Project Team Common App
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            One application, every project team. Browse Cornell&apos;s project
            teams and apply to the ones that interest you — all in one place.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/50 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">
            How It Works
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
                <ClipboardList className="size-6 text-primary" />
              </div>
              <h3 className="font-semibold">One Profile</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your profile once with your resume, GPA, and major.
                Reuse it across every application.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
                <Users className="size-6 text-primary" />
              </div>
              <h3 className="font-semibold">Browse Teams</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Explore all of Cornell&apos;s project teams in one place.
                Browse all of Cornell&apos;s project teams and find your fit.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h3 className="font-semibold">Stay Connected</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Track your application status and message teams directly — no
                more checking separate emails and forms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Showcase */}
      {allTeams.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="mb-2 text-center text-2xl font-bold sm:text-3xl">
              Teams on the Platform
            </h2>
            <p className="mb-8 text-center text-muted-foreground">
              Join {allTeams.length} project teams already accepting
              applications.
            </p>
          </div>
          <TeamMarquee teams={allTeams} />
          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link href="/teams">View All Teams</Link>
            </Button>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="border-t bg-primary px-4 py-16 text-primary-foreground">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Ready to apply?
          </h2>
          <p className="mt-3 text-primary-foreground/80">
            Create your profile in minutes and start applying to project teams
            today.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="mt-6"
          >
            <Link href="/signup">Create Your Account</Link>
          </Button>
        </div>
      </section>

    </div>
  );
}
