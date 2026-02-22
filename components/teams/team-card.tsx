import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Team } from "@/types/database";

export function TeamCard({ team }: { team: Team }) {
  return (
    <Link href={`/teams/${team.id}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-start gap-3">
            {team.logo_url ? (
              <Image
                src={team.logo_url}
                alt={`${team.name} logo`}
                width={48}
                height={48}
                className="size-12 shrink-0 rounded-md object-contain"
              />
            ) : (
              <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-lg font-bold text-primary">
                {team.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg">{team.name}</CardTitle>
              <CardDescription className="line-clamp-2">
                {team.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {(team.custom_questions as unknown[]).length} question
            {(team.custom_questions as unknown[]).length !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
