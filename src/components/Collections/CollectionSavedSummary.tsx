'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Link, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';


interface Summary {
  id: string;
  document_id: string;
  summary: string;
  template: string;
  created_at: string;
  document_metadata?: {
    filename: string;
  };
}

interface SavedSummaryProps {
  collectionId: string;
}

export function CollectionSavedSummary({ collectionId }: SavedSummaryProps) {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchSummaries();
  }, [collectionId]);

  const fetchSummaries = async () => {
    try {
      const response = await fetch(
        `${baseUrl}/api/summaries/text?collectionId=${collectionId}`
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch summaries');
      }
      const data = await response.json();
      setSummaries(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch summaries'
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteSummary = async (summaryId: string) => {
    setDeleting(summaryId);
    try {
      const response = await fetch(
        `/api/collections/${collectionId}/summaries/${summaryId}`,
        {
          method: 'DELETE'
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete summary');
      }
      setSummaries((prev) => prev.filter((s) => s.id !== summaryId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete summary');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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

  if (error) {
    return (
      <Card className="p-4">
        <p className="text-destructive">Error: {error}</p>
      </Card>
    );
  }

  if (summaries.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-center text-muted-foreground">
          No saved summaries found
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {summaries.map((summary) => (
        <Card key={summary.id} className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <Link
                href={`/dashboard/demo/${collectionId}/document/${summary.document_id}`}
                className="hover:underline"
              >
                <h3 className="font-medium">
                  {summary.document_metadata?.filename || 'Untitled'}
                </h3>
              </Link>
              <p className="text-sm text-muted-foreground">
                {formatDate(summary.created_at)} • {summary.template} summary
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteSummary(summary.id)}
              disabled={deleting === summary.id}
            >
              {deleting === summary.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="whitespace-pre-wrap text-sm">{summary.summary}</p>
        </Card>
      ))}
    </div>
  );
}
