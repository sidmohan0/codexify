'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';
import { QASource } from '@/app/types/documents';

interface QAProps {
  collectionId: string;
}

interface QAResponse {
  result: {
    content: string;
    role: string;
    sources: QASource[];
  };
}

export function CollectionQA({ collectionId }: QAProps) {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<QAResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: collectionId,
          question: question.trim()
        })
      });

      if (!res.ok) throw new Error('Failed to get answer');
      const data: QAResponse = await res.json();
      setResponse({
        result: {
          content: data.result.content,
          role: data.result.role,
          sources: data.result.sources || []
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get answer');
    } finally {
      setLoading(false);
    }
  };

  const saveQA = async () => {
    if (!response) return;

    setSaving(true);
    try {
      const res = await fetch(
        `http://localhost:8000/collections/${collectionId}/qa`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question,
            answer: response.result.content,
            sources: response.result.sources || []
          })
        }
      );

      if (!res.ok) throw new Error('Failed to save Q&A');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save Q&A');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="space-y-4">
          <Textarea
            placeholder="Ask a question about your collection..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end gap-2">
            <Button onClick={handleAsk} disabled={loading || !question.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ask Question
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <Card className="p-4">
          <p className="text-destructive">{error}</p>
        </Card>
      )}

      {response && (
        <Card className="p-4">
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-medium">Answer</h3>
              <p className="whitespace-pre-wrap text-sm">
                {response.result.content}
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium">Sources</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveQA}
                  disabled={saving}
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Q&A
                </Button>
              </div>
              <div className="space-y-2">
                {response.result.sources?.map((source, idx) => (
                  <div
                    key={idx}
                    className="rounded-md border bg-muted p-2 text-sm"
                  >
                    <p className="mb-1 font-medium">
                      {source.metadata.filename}
                    </p>
                    <p className="text-muted-foreground">{source.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
