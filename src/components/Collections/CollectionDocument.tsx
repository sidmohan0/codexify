'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface DocumentProps {
  document: {
    id: string;
    content: string;
    metadata: {
      filename: string;
      created_at: string;
      updated_at: string;
    };
  };
  collectionId: string;
  collectionName: string;
  onSelect: () => void;
}

export function CollectionDocument({
  document,
  collectionId,
  collectionName,
  onSelect
}: DocumentProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    // If there's only 1 document, expand it and select it by default
    if (document.id === collectionId) {
      setIsExpanded(true);
      onSelect();
    }
  }, [document.id, collectionId, onSelect]);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <div
          className="flex flex-grow cursor-pointer items-center gap-3"
          onClick={() => {
            setIsExpanded(!isExpanded);
            onSelect();
          }}
        >
          <FileText className="h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="font-medium">{document.metadata.filename}</h3>
            <p className="text-sm text-muted-foreground">
              Updated {formatDate(document.metadata.updated_at)}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className="border-t p-4">
          <pre className="whitespace-pre-wrap text-sm">{document.content}</pre>
        </div>
      )}
    </Card>
  );
}
