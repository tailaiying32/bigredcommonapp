"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/applications/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import type { ApplicationStatus } from "@/types/database";

interface AppRow {
  id: string;
  team_id: string;
  status: string;
  updated_at: string;
  profile: {
    full_name: string;
    netid: string;
    email: string;
  } | null;
  message_count: number;
}

const STATUS_OPTIONS = [
  "all",
  "submitted",
  "interviewing",
  "accepted",
  "rejected",
] as const;

export function ApplicationsTable({
  apps,
  teamId,
}: {
  apps: AppRow[];
  teamId: string;
}) {
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all" ? apps : apps.filter((a) => a.status === filter);

  const counts: Record<string, number> = {
    all: apps.length,
    submitted: apps.filter((a) => a.status === "submitted").length,
    interviewing: apps.filter((a) => a.status === "interviewing").length,
    accepted: apps.filter((a) => a.status === "accepted").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
  };

  function label(value: string) {
    const name = value === "all" ? "All" : value.charAt(0).toUpperCase() + value.slice(1);
    return `${name} (${counts[value]})`;
  }

  return (
    <div className="space-y-4">
      {/* Dropdown on small screens */}
      <div className="md:hidden">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {label(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs on md+ screens */}
      <div className="hidden md:block">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            {STATUS_OPTIONS.map((s) => (
              <TabsTrigger key={s} value={s}>
                {label(s)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {filtered.length === 0 ? (
        <p className="py-4 text-center text-muted-foreground">
          No applications found.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead className="hidden sm:table-cell">NetID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Submitted</TableHead>
              <TableHead className="hidden sm:table-cell">Messages</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((app) => (
              <TableRow key={app.id}>
                <TableCell className="font-medium">
                  {app.profile?.full_name ?? "Unknown"}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {app.profile?.netid ?? "—"}
                </TableCell>
                <TableCell>
                  <StatusBadge status={app.status as ApplicationStatus} />
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {new Date(app.updated_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {app.message_count > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      <MessageSquare className="size-3" />
                      {app.message_count}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/${teamId}/applications/${app.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Review
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
