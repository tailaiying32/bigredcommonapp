"use client";

import { useState } from "react";
import { updateApplicationStatus } from "@/lib/actions/applications";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApplicationStatus } from "@/types/database";

const statuses: { value: ApplicationStatus; label: string }[] = [
  { value: "submitted", label: "Submitted" },
  { value: "interviewing", label: "Interviewing" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

export function StatusChanger({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: ApplicationStatus;
}) {
  const [status, setStatus] = useState<ApplicationStatus>(currentStatus);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleUpdate() {
    setIsPending(true);
    setError(null);
    setSuccess(false);

    const result = await updateApplicationStatus(applicationId, status);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setIsPending(false);
  }

  return (
    <div className="flex items-center gap-3">
      <Select
        value={status}
        onValueChange={(val) => setStatus(val as ApplicationStatus)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        onClick={handleUpdate}
        disabled={isPending || status === currentStatus}
        size="sm"
      >
        {isPending ? "Updating..." : "Update"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-green-600">Updated!</p>}
    </div>
  );
}
