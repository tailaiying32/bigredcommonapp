"use client";

import { useState } from "react";
import { updateDeadlines } from "@/lib/actions/deadlines";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

function toLocalDatetime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  // Format as YYYY-MM-DDTHH:MM for datetime-local input
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function DeadlineManager({
  teamId,
  initialUpperclassman,
  initialLowerclassman,
}: {
  teamId: string;
  initialUpperclassman: string | null;
  initialLowerclassman: string | null;
}) {
  const [upper, setUpper] = useState(toLocalDatetime(initialUpperclassman));
  const [lower, setLower] = useState(toLocalDatetime(initialLowerclassman));
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    setIsPending(true);
    setError(null);
    setSuccess(false);

    const result = await updateDeadlines(
      teamId,
      upper ? new Date(upper).toISOString() : null,
      lower ? new Date(lower).toISOString() : null
    );

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setIsPending(false);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Upperclassman Deadline</Label>
        <div className="flex items-center gap-2">
          <Input
            type="datetime-local"
            value={upper}
            onChange={(e) => setUpper(e.target.value)}
            className="max-w-xs"
          />
          {upper && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setUpper("")}
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Lowerclassman Deadline</Label>
        <div className="flex items-center gap-2">
          <Input
            type="datetime-local"
            value={lower}
            onChange={(e) => setLower(e.target.value)}
            className="max-w-xs"
          />
          {lower && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setLower("")}
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save Deadlines"}
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-green-600">Saved!</p>}
      </div>
    </div>
  );
}
