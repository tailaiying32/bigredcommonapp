"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { buildApplicationSchema } from "@/lib/validations/application";
import {
  createApplication,
  updateApplication,
  submitApplication,
} from "@/lib/actions/applications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TeamQuestion, Application } from "@/types/database";

interface ApplicationFormProps {
  teamId: string;
  questions: TeamQuestion[];
  existingApplication?: Application | null;
}

export function ApplicationForm({
  teamId,
  questions,
  existingApplication,
}: ApplicationFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);

  const isReadOnly =
    !!existingApplication && existingApplication.status !== "draft";
  const isDraft = existingApplication?.status === "draft";

  const schema = buildApplicationSchema(questions);
  const existingAnswers = (existingApplication?.answers ?? {}) as Record<
    string,
    string
  >;

  const defaultValues: Record<string, string> = {};
  for (const q of questions) {
    defaultValues[q.id] = existingAnswers[q.id] ?? "";
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  async function onSaveDraft(values: Record<string, string>) {
    setServerError(null);
    setServerSuccess(null);

    if (existingApplication) {
      const result = await updateApplication(existingApplication.id, values);
      if (result.error) {
        setServerError(result.error);
      } else {
        setServerSuccess("Draft saved!");
      }
    } else {
      const result = await createApplication(teamId, values);
      if (result.error) {
        setServerError(result.error);
      } else {
        setServerSuccess("Draft created! Reload to continue editing.");
      }
    }
  }

  async function onSubmit(values: Record<string, string>) {
    setServerError(null);
    setServerSuccess(null);

    if (!existingApplication) {
      // Create first, then submit
      const createResult = await createApplication(teamId, values);
      if (createResult.error) {
        setServerError(createResult.error);
        return;
      }
      setServerSuccess(
        "Application created! Reload the page and submit again."
      );
      return;
    }

    // Save latest answers first
    const updateResult = await updateApplication(
      existingApplication.id,
      values
    );
    if (updateResult.error) {
      setServerError(updateResult.error);
      return;
    }

    // Then submit
    const submitResult = await submitApplication(
      existingApplication.id,
      questions
    );
    if (submitResult.error) {
      setServerError(submitResult.error);
    } else {
      setServerSuccess("Application submitted!");
    }
  }

  return (
    <form className="space-y-6">
      {questions.map((q) => (
        <div key={q.id} className="space-y-2">
          <Label htmlFor={q.id}>
            {q.label}
            {q.required && <span className="text-destructive ml-1">*</span>}
          </Label>

          {q.type === "text" && (
            <Input
              id={q.id}
              {...register(q.id)}
              disabled={isReadOnly}
              placeholder="Your answer..."
            />
          )}

          {q.type === "textarea" && (
            <Textarea
              id={q.id}
              {...register(q.id)}
              disabled={isReadOnly}
              placeholder="Your answer..."
              rows={4}
            />
          )}

          {q.type === "select" && (
            <Select
              value={(watch(q.id) as string) ?? ""}
              onValueChange={(val) => setValue(q.id, val)}
              disabled={isReadOnly}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an option..." />
              </SelectTrigger>
              <SelectContent>
                {q.options?.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {errors[q.id] && (
            <p className="text-sm text-destructive">
              {errors[q.id]?.message as string}
            </p>
          )}
        </div>
      ))}

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
      {serverSuccess && (
        <p className="text-sm text-green-600">{serverSuccess}</p>
      )}

      {!isReadOnly && (
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={handleSubmit(
              (values) => onSaveDraft(values as Record<string, string>),
              // Allow saving draft even with validation errors
              () => {
                const formValues: Record<string, string> = {};
                for (const q of questions) {
                  formValues[q.id] = (watch(q.id) as string) ?? "";
                }
                onSaveDraft(formValues);
              }
            )}
          >
            {isSubmitting ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit((values) =>
              onSubmit(values as Record<string, string>)
            )}
          >
            {isSubmitting
              ? "Submitting..."
              : isDraft
                ? "Submit Application"
                : "Apply"}
          </Button>
        </div>
      )}

      {isReadOnly && (
        <p className="text-sm text-muted-foreground">
          This application has been {existingApplication?.status} and can no
          longer be edited.
        </p>
      )}
    </form>
  );
}
