"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormValues } from "@/lib/validations/profile";
import { createProfile, updateProfile } from "@/lib/actions/profile";
import type { Profile } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResumeUpload } from "@/components/profile/resume-upload";

interface ProfileFormProps {
  email: string;
  userId: string;
  profile?: Profile;
}

export function ProfileForm({ email, userId, profile }: ProfileFormProps) {
  const isEditing = !!profile;
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email,
      netid: profile?.netid ?? email.split("@")[0],
      full_name: profile?.full_name ?? "",
      major: profile?.major ?? "",
      grad_year: profile?.grad_year ?? undefined,
      gpa: profile?.gpa ?? undefined,
      resume_url: profile?.resume_url ?? "",
    },
  });

  async function onSubmit(values: ProfileFormValues) {
    setServerError(null);
    const result = isEditing
      ? await updateProfile(values)
      : await createProfile(values);
    if (result?.error) {
      setServerError(result.error);
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl">
          {isEditing ? "Edit Profile" : "Complete Your Profile"}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? "Update your profile information"
            : "Tell us about yourself to get started"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="netid">NetID</Label>
            <Input
              id="netid"
              {...register("netid")}
              placeholder="abc123"
              disabled={isEditing}
              className={isEditing ? "bg-muted" : ""}
            />
            {errors.netid && (
              <p className="text-sm text-destructive">{errors.netid.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              {...register("email")}
              disabled
              className="bg-muted"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              {...register("full_name")}
              placeholder="Jane Doe"
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">
                {errors.full_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="major">Major</Label>
            <Input
              id="major"
              {...register("major")}
              placeholder="Computer Science"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grad_year">Graduation Year</Label>
              <Input
                id="grad_year"
                type="number"
                {...register("grad_year", { valueAsNumber: true, setValueAs: (v: string) => v === "" ? undefined : Number(v) })}
                placeholder="2027"
              />
              {errors.grad_year && (
                <p className="text-sm text-destructive">
                  {errors.grad_year.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gpa">GPA (optional)</Label>
              <Input
                id="gpa"
                type="number"
                step="0.01"
                {...register("gpa", { valueAsNumber: true, setValueAs: (v: string) => v === "" ? undefined : Number(v) })}
                placeholder="3.50"
              />
              {errors.gpa && (
                <p className="text-sm text-destructive">{errors.gpa.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Resume (optional)</Label>
            <ResumeUpload
              userId={userId}
              currentUrl={watch("resume_url") || null}
              onUpload={(url) => setValue("resume_url", url)}
              onRemove={() => setValue("resume_url", "")}
            />
          </div>

          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
