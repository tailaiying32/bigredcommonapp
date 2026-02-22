import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock } from "lucide-react";
import type { Team, ClassStanding } from "@/types/database";

function getDeadlineLabel(
  team: Team,
  classStanding: ClassStanding | null
): { text: string; urgent: boolean; closed: boolean } | null {
  const deadline =
    classStanding === "lowerclassman"
      ? team.lowerclassman_deadline
      : team.upperclassman_deadline;

  if (!deadline) return null;

  const now = new Date();
  const deadlineDate = new Date(deadline);

  if (now > deadlineDate) {
    return { text: "Closed", urgent: false, closed: true };
  }

  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return { text: "Closes today", urgent: true, closed: false };
  } else if (diffDays === 1) {
    return { text: "Closes tomorrow", urgent: true, closed: false };
  } else if (diffDays <= 7) {
    return { text: `Closes in ${diffDays} days`, urgent: true, closed: false };
  } else {
    return {
      text: `Due ${deadlineDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      urgent: false,
      closed: false,
    };
  }
}

export function TeamCard({ team, classStanding }: { team: Team; classStanding: ClassStanding | null }) {
  const questionCount = (team.custom_questions as unknown[]).length;
  const deadlineLabel = getDeadlineLabel(team, classStanding);

  return (
    <Link href={`/teams/${team.id}`}>
      <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
        <CardHeader className="flex-1">
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
              <CardDescription className="mt-1 line-clamp-2">
                {team.description}
              </CardDescription>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{questionCount} question{questionCount !== 1 ? "s" : ""}</span>
            {deadlineLabel && (
              <span
                className={`inline-flex items-center gap-1 ${
                  deadlineLabel.closed
                    ? "text-destructive"
                    : deadlineLabel.urgent
                      ? "text-orange-600 dark:text-orange-400"
                      : ""
                }`}
              >
                <Clock className="size-3" />
                {deadlineLabel.text}
              </span>
            )}
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
