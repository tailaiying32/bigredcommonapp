"use client";

import { useState } from "react";
import { addReviewer, removeReviewer } from "@/lib/actions/reviewers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Reviewer {
  id: string;
  netid: string | null;
  full_name: string | null;
}

export function ReviewerManager({
  teamId,
  initialReviewers,
}: {
  teamId: string;
  initialReviewers: Reviewer[];
}) {
  const [reviewers, setReviewers] = useState<Reviewer[]>(initialReviewers);
  const [identifier, setIdentifier] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const value = identifier.trim();
    if (!value) return;

    setIsAdding(true);
    setError(null);
    setSuccess(null);

    const result = await addReviewer(teamId, value);
    if (result.error) {
      setError(result.error);
    } else if (result.reviewer) {
      setReviewers((prev) => [...prev, result.reviewer]);
      setIdentifier("");
      setSuccess(
        `Added ${result.reviewer.full_name ?? result.reviewer.netid ?? "reviewer"}`
      );
    }
    setIsAdding(false);
  }

  async function handleRemove(userId: string) {
    setRemovingId(userId);
    setError(null);
    setSuccess(null);

    const result = await removeReviewer(teamId, userId);
    if (result.error) {
      setError(result.error);
    } else {
      setReviewers((prev) => prev.filter((r) => r.id !== userId));
    }
    setRemovingId(null);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          placeholder="NetID or email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          disabled={isAdding}
          className="max-w-xs"
        />
        <Button type="submit" disabled={isAdding || !identifier.trim()}>
          {isAdding ? "Adding..." : "Add"}
        </Button>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      {reviewers.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No reviewers added yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {reviewers.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between rounded-md border px-3 py-2"
            >
              <span className="text-sm">
                {r.full_name ?? "Unknown"}{" "}
                {r.netid && (
                  <span className="text-muted-foreground">({r.netid})</span>
                )}
              </span>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={removingId === r.id}
                  >
                    {removingId === r.id ? "Removing..." : "Remove"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove reviewer?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Remove {r.full_name ?? r.netid ?? "this reviewer"}? They
                      will lose access to this team&apos;s admin page.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={() => handleRemove(r.id)}
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
