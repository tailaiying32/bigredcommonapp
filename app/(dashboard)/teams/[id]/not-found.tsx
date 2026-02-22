import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TeamNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <h2 className="text-2xl font-bold">Team not found</h2>
      <p className="text-muted-foreground">
        The team you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Button asChild>
        <Link href="/teams">Back to Teams</Link>
      </Button>
    </div>
  );
}
