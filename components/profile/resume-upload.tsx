"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Eye, Replace, Trash2, Loader2 } from "lucide-react";

interface ResumeUploadProps {
  userId: string;
  currentUrl: string | null | undefined;
  onUpload: (url: string) => void;
  onRemove: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export function ResumeUpload({
  userId,
  currentUrl,
  onUpload,
  onRemove,
}: ResumeUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validateFile(file: File): string | null {
    if (file.type !== "application/pdf") {
      return "Only PDF files are allowed.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size must be under 5 MB.";
    }
    return null;
  }

  async function handleUpload(file: File) {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const supabase = createClient();
      const path = `${userId}/resume.pdf`;

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(path, file, { upsert: true, contentType: "application/pdf" });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("resumes").getPublicUrl(path);

      onUpload(publicUrl);
    } catch {
      setError("An unexpected error occurred during upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  }

  async function handleRemove() {
    setError(null);
    setUploading(true);

    try {
      const supabase = createClient();
      const path = `${userId}/resume.pdf`;

      const { error: removeError } = await supabase.storage
        .from("resumes")
        .remove([path]);

      if (removeError) {
        setError(removeError.message);
        return;
      }

      onRemove();
    } catch {
      setError("An unexpected error occurred while removing the file.");
    } finally {
      setUploading(false);
    }
  }

  if (uploading) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-dashed p-4">
        <Loader2 className="size-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Uploading...</span>
      </div>
    );
  }

  if (currentUrl) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 rounded-md border p-3">
          <FileText className="size-4 text-muted-foreground" />
          <span className="flex-1 truncate text-sm">resume.pdf</span>
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <Eye className="size-3.5" />
            View
          </a>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto px-2 py-1 text-sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Replace className="mr-1 size-3.5" />
            Replace
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto px-2 py-1 text-sm text-destructive hover:text-destructive"
            onClick={handleRemove}
          >
            <Trash2 className="mr-1 size-3.5" />
            Remove
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed p-4 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Upload className="size-4" />
        Click to upload your resume (PDF, max 5 MB)
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
