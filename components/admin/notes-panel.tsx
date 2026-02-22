"use client";

import { useState } from "react";
import { addNote, updateNote, deleteNote } from "@/lib/actions/notes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { Pencil, Trash2 } from "lucide-react";

export interface NoteWithAuthor {
  id: string;
  body: string;
  author_id: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

interface NotesPanelProps {
  applicationId: string;
  currentUserId: string;
  initialNotes: NoteWithAuthor[];
}

export function NotesPanel({
  applicationId,
  currentUserId,
  initialNotes,
}: NotesPanelProps) {
  const [notes, setNotes] = useState<NoteWithAuthor[]>(initialNotes);
  const [body, setBody] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    const trimmed = body.trim();
    if (!trimmed || adding) return;

    setAdding(true);
    const result = await addNote(applicationId, trimmed);

    if (result.success && result.note) {
      setNotes((prev) => [
        ...prev,
        {
          id: result.note!.id,
          body: result.note!.body,
          author_id: result.note!.author_id,
          author_name: "You",
          created_at: result.note!.created_at,
          updated_at: result.note!.updated_at,
        },
      ]);
      setBody("");
    }
    setAdding(false);
  }

  async function handleUpdate(noteId: string) {
    const trimmed = editBody.trim();
    if (!trimmed || saving) return;

    setSaving(true);
    const result = await updateNote(noteId, trimmed);

    if (result.success) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId ? { ...n, body: trimmed, updated_at: new Date().toISOString() } : n
        )
      );
      setEditingId(null);
      setEditBody("");
    }
    setSaving(false);
  }

  async function handleDelete(noteId: string) {
    const result = await deleteNote(noteId);

    if (result.success) {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    }
  }

  function startEdit(note: NoteWithAuthor) {
    setEditingId(note.id);
    setEditBody(note.body);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditBody("");
  }

  return (
    <div className="space-y-4">
      <div className="max-h-96 overflow-y-auto space-y-3 p-1">
        {notes.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No notes yet.
          </p>
        ) : (
          notes.map((note) => {
            const isOwn = note.author_id === currentUserId;
            const isEditing = editingId === note.id;

            return (
              <div
                key={note.id}
                className="rounded-lg border p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">
                      {isOwn ? "You" : note.author_name}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(note.created_at).toLocaleString()}
                      {note.updated_at !== note.created_at && " (edited)"}
                    </span>
                  </div>
                  {isOwn && !isEditing && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => startEdit(note)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this note?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(note.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdate(note.id)}
                        disabled={saving || !editBody.trim()}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEdit}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{note.body}</p>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="flex gap-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a note..."
          rows={2}
          className="resize-none"
        />
        <Button
          onClick={handleAdd}
          disabled={adding || !body.trim()}
          className="shrink-0"
        >
          Add Note
        </Button>
      </div>
    </div>
  );
}
