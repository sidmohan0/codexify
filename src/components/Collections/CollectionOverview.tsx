'use client';

import React, { useState } from 'react';
import { Search, Brain } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { CollectionDocuments } from './CollectionDocuments';
import { SearchOperation } from '../SearchOperation';
import { SummarizeOperation } from '../SummarizeOperation';

interface OverviewProps {
  collectionId: string;
  collectionName: string;
  fileCount: number;
  selectedDocuments: string[];
  onDocumentSelectionChange: (documentIds: string[]) => void;
}

interface Operation {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  component: React.ReactNode;
}

export function CollectionOverview({
  collectionId,
  collectionName,
  selectedDocuments,
  onDocumentSelectionChange
}: OverviewProps) {
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);
  const [isBlurred, setIsBlurred] = useState(true);

  const operations: Operation[] = [
    {
      id: 'search',
      title: 'Search Documents',
      description: 'Search through documents using natural language',
      icon: Search,
      component: (
        <SearchOperation 
          collectionId={collectionId} 
          collectionName={collectionName} 
        />
      )
    },
    {
      id: 'summarize',
      title: 'AI Assistant',
      description: 'Get AI-powered insights and summaries from your documents',
      icon: Brain,
      component: (
        <SummarizeOperation 
          collectionId={collectionId}
          selectedDocuments={selectedDocuments}
        />
      )
    }
  ];

  const handleDocumentSelect = (doc: { id: string; content: string }) => {
    console.log('Selected document:', doc);
    setIsBlurred(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {operations.map((op) => {
          const IconComponent = op.icon;
          return (
            <Card
              key={op.id}
              className={`cursor-pointer p-6 ${
                selectedOperation === op.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() =>
                setSelectedOperation(op.id === selectedOperation ? null : op.id)
              }
            >
              <div className="mb-4">
                <IconComponent className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 font-medium">{op.title}</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {op.description}
              </p>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8">
          <CollectionDocuments
            collectionId={collectionId}
            collectionName={collectionName}
            onDocumentSelect={handleDocumentSelect}
            entities={[]}
            getHighlightedText={() => []}
            selectedDocuments={selectedDocuments}
            onDocumentSelectionChange={onDocumentSelectionChange}
          />
        </div>
        {selectedOperation && (
          <div className="col-span-4">
            {operations.find((op) => op.id === selectedOperation)?.component}
          </div>
        )}
      </div>
    </div>
  );
}
