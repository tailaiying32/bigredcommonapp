"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingSubmitValues, setPendingSubmitValues] = useState<Record<
    string,
    string
  > | null>(null);

  const isReadOnly =
    !!existingApplication && existingApplication.status !== "draft";

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
        setServerSuccess("Draft created!");
        router.refresh();
      }
    }
  }

  async function onSubmit(values: Record<string, string>) {
    setServerError(null);
    setServerSuccess(null);

    let applicationId = existingApplication?.id;

    // If no existing application, create one first
    if (!applicationId) {
      const createResult = await createApplication(teamId, values);
      if (createResult.error) {
        setServerError(createResult.error);
        return;
      }
      applicationId = createResult.applicationId;
    } else {
      // Save latest answers
      const updateResult = await updateApplication(applicationId, values);
      if (updateResult.error) {
        setServerError(updateResult.error);
        return;
      }
    }

    // Submit
    const submitResult = await submitApplication(applicationId!, questions);
    if (submitResult.error) {
      setServerError(submitResult.error);
    } else {
      setServerSuccess("Application submitted!");
      router.refresh();
    }
  }

  function handleSubmitClick() {
    handleSubmit((values) => {
      setPendingSubmitValues(values as Record<string, string>);
      setShowConfirmDialog(true);
    })();
  }

  async function handleConfirmSubmit() {
    if (pendingSubmitValues) {
      await onSubmit(pendingSubmitValues);
      setPendingSubmitValues(null);
    }
  }

  return (
    <>
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
                () => {
                  const formValues: Record<string, string> = {};
                  for (const q of questions) {
                    formValues[q.id] = (watch(q.id) as string) ?? "";
                  }
                  onSaveDraft(formValues);
                }
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Draft"
              )}
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitClick}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
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

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit application?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? Once submitted, you won&apos;t be able to edit your
              answers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
