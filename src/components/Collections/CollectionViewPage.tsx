'use client';

import React from 'react';
import { Clock, Eye, EyeOff } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CollectionQA } from './CollectionQA';
import { CollectionNotes } from './CollectionNotes';
import { CollectionSavedSummary } from './CollectionSavedSummary';
import { CollectionOverview } from './CollectionOverview';
import { CollectionSavedSearch } from './CollectionSavedSearch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TimelineOperation } from '@/components/TimelineOperation';


interface CollectionViewPageProps {
  collectionId: string;
  collectionName: string;
}

export function CollectionViewPage({
  collectionId,
  collectionName
}: CollectionViewPageProps) {
  const [isBlurred, setIsBlurred] = React.useState(false);
  const [selectedDocuments, setSelectedDocuments] = React.useState<string[]>([]);

  return (
    <div className="min-h-screen bg-gray-50/40 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{collectionName}</h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                ID: {collectionId}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Clock className="mr-1 h-3 w-3" />
                Created {new Date().toLocaleDateString()}
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsBlurred(!isBlurred)}
            className="flex items-center gap-2"
          >
            {isBlurred ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {isBlurred ? 'Show Content' : 'Hide Content'}
          </Button>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-primary/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {/* <TabsTrigger value="chat">Chat</TabsTrigger> */}
            <TabsTrigger value="summaries">Summaries</TabsTrigger>
            <TabsTrigger value="searches">Searches</TabsTrigger>
            <TabsTrigger value="timelines">Timelines</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <CollectionOverview
              collectionId={collectionId}
              collectionName={collectionName}
              selectedDocuments={selectedDocuments}
              onDocumentSelectionChange={setSelectedDocuments}
              fileCount={selectedDocuments.length}
            />
          </TabsContent>

          <TabsContent value="chat">
            <CollectionQA collectionId={collectionId} />
          </TabsContent>

          <TabsContent value="summaries">
            <CollectionSavedSummary collectionId={collectionId} />
          </TabsContent>

          <TabsContent value="searches">
            <CollectionSavedSearch
              collectionId={collectionId}
              collectionName={collectionName}
            />
          </TabsContent>

          <TabsContent value="timelines" className="space-y-4">
            {/* Timeline generation card */}
            <TimelineOperation 
              collectionId={collectionId} 
              collectionName={collectionName} 
            />
            
            {/* List of saved timelines will go here */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
