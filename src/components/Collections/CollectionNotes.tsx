'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { UserNotesCreate, UserNotesRead } from '@/app/types/documents';

/* eslint-disable react/no-unescaped-entities */

interface NotesProps {
  collectionId: string;
}

export function CollectionNotes({ collectionId }: NotesProps) {
  const [notes, setNotes] = useState<UserNotesRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newNote, setNewNote] = useState<UserNotesCreate>({
    document_id: collectionId,
    str_content: ''
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, [collectionId]);

  const fetchNotes = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/user_notes/${collectionId}`
      );
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      setNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async () => {
    if (!newNote.str_content.trim()) return;

    setSaving(true);
    try {
      const response = await fetch(`http://localhost:8000/save_user_notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote)
      });
      if (!response.ok) throw new Error('Failed to save note');
      const savedNote = await response.json();
      setNotes((prev) => [...prev, savedNote]);
      setIsCreating(false);
      setNewNote({ document_id: collectionId, str_content: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    setDeleting(noteId);
    try {
      const response = await fetch(
        `http://localhost:8000/collections/${collectionId}/notes/${noteId}`,
        {
          method: 'DELETE'
        }
      );
      if (!response.ok) throw new Error('Failed to delete note');
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => setIsCreating(true)}
          disabled={isCreating}
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>

      {error && (
        <Card className="p-4">
          <p className="text-destructive">{error}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            There was a problem loading your notes. Please try refreshing the
            page or check your connection.
          </p>
        </Card>
      )}

      {isCreating && (
        <Card className="p-4">
          <div className="space-y-4">
            <Textarea
              placeholder="Note content..."
              value={newNote.str_content}
              onChange={(e) =>
                setNewNote((prev) => ({ ...prev, str_content: e.target.value }))
              }
              className="min-h-[200px]"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setNewNote({ document_id: collectionId, str_content: '' });
                }}
              >
                Cancel
              </Button>
              <Button onClick={saveNote} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Note
              </Button>
            </div>
          </div>
        </Card>
      )}

      {notes.length === 0 && !error ? (
        <Card className="p-8 text-center">
          <p className="text-lg font-medium">No notes yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Click the "New Note" button above to create your first note for this
            collection.
          </p>
        </Card>
      ) : (
        notes.map((note) => (
          <Card key={note.id} className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Last updated {formatDate(note.updated_at)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteNote(note.id)}
                disabled={deleting === note.id}
              >
                {deleting === note.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="whitespace-pre-wrap text-sm">{note.str_content}</p>
          </Card>
        ))
      )}
    </div>
  );
}
