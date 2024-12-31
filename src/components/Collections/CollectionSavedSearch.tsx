/* eslint-disable react/no-unescaped-entities */

'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface SavedSearch {
  id: string;
  collection_id: string;
  query_text: string;
  created_at: string;
  results: Array<{
    id: string;
    score: number;
    search_metadata: {
      content: string;
      filename: string;
    };
  }>;
}

interface SavedSearchProps {
  collectionId: string;
  collectionName: string;
}

export function CollectionSavedSearch({
  collectionId,
  collectionName
}: SavedSearchProps) {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchSearches();
  }, [collectionId]);

  const fetchSearches = async () => {
    try {
      const response = await fetch(
        `${baseUrl}/api/search?collectionId=${collectionId}`
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch saved searches');
      }
      const data = await response.json();
      setSearches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch searches');
    } finally {
      setLoading(false);
    }
  };

  const deleteSearch = async (searchId: string) => {
    setDeleting(searchId);
    try {
      const response = await fetch(
        `${baseUrl}/api/collections/${collectionId}/searches/${searchId}`,
        {
          method: 'DELETE'
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete search');
      }
      setSearches((prev) => prev.filter((s) => s.id !== searchId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete search');
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

  if (searches.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-center text-muted-foreground">
          No saved searches found
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {searches.map((search) => (
        <Card key={search.id} className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-medium">&ldquo;{search.query_text}&rdquo;</h3>
              <p className="text-sm text-muted-foreground">
                Saved on {formatDate(search.created_at)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteSearch(search.id)}
              disabled={deleting === search.id}
            >
              {deleting === search.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="space-y-3">
            {search.results.map((result) => (
              <div
                key={result.id}
                className="rounded-md border bg-primary/50 p-3 text-sm"
              >
                <div className="mb-1 text-sm text-muted-foreground">
                  <div>File: {result.search_metadata.filename}</div>
                  <div>Similarity: {(result.score * 100).toFixed(1)}%</div>
                </div>
                <div className="line-clamp-3">
                  {result.search_metadata.content}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
