"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormValues } from "@/lib/validations/profile";
import { createProfile } from "@/lib/actions/profile";
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

interface ProfileFormProps {
  email: string;
}

export function ProfileForm({ email }: ProfileFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email,
      netid: email.split("@")[0],
    },
  });

  async function onSubmit(values: ProfileFormValues) {
    setServerError(null);
    const result = await createProfile(values);
    if (result?.error) {
      setServerError(result.error);
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
        <CardDescription>
          Tell us about yourself to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="netid">NetID</Label>
            <Input id="netid" {...register("netid")} placeholder="abc123" />
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
            <Label htmlFor="resume_url">Resume URL (optional)</Label>
            <Input
              id="resume_url"
              {...register("resume_url")}
              placeholder="https://drive.google.com/..."
            />
            {errors.resume_url && (
              <p className="text-sm text-destructive">
                {errors.resume_url.message}
              </p>
            )}
          </div>

          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Create Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
