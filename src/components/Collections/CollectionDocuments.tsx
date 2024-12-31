'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { CollectionDocument } from '@/components/Collections/CollectionDocument';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

interface Document {
  id: string;
  content: string;
  metadata: {
    filename: string;
    created_at: string;
    updated_at: string;
  };
  selected?: boolean;
}

interface HighlightedText {
  text: string;
  isEntity: boolean;
  entityLabel?: string;
  color?: string;
}

interface Entity {
  text: string;
  label: string;
  score: number;
  char_start: number;
  char_end: number;
}

interface DocumentsProps {
  collectionId: string;
  collectionName: string;
  onDocumentSelect: (doc: { id: string; content: string }) => void;
  entities: Entity[];
  getHighlightedText: (text: string, entities: Entity[]) => HighlightedText[];
  selectedDocuments?: string[];
  onDocumentSelectionChange: (documentIds: string[]) => void;
}

export function CollectionDocuments({
  collectionId,
  collectionName,
  onDocumentSelect,
  entities,
  getHighlightedText,
  selectedDocuments = [], // Add default value here
  onDocumentSelectionChange
}: DocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/collections?collection_id=${collectionId}`
        );
        if (!response.ok) throw new Error('Failed to fetch documents');
        const data = await response.json();
        const transformedDocs = data.files.map((file: any) => ({
          id: file.id,
          content: file.str_content,
          metadata: {
            filename: file.filename,
            created_at: file.created_at || new Date().toISOString(),
            updated_at: file.updated_at || new Date().toISOString()
          }
        }));
        setDocuments(transformedDocs);
        
        if (selectedDocuments.length === 0) {
          onDocumentSelectionChange(transformedDocs.map(doc => doc.id));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch documents'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [collectionId, onDocumentSelectionChange, selectedDocuments.length]);

  const handleToggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newSelection = e.target.checked ? documents.map(doc => doc.id) : [];
    onDocumentSelectionChange(newSelection);
  };

  const handleToggleDocument = (e: React.ChangeEvent<HTMLInputElement>, docId: string) => {
    e.stopPropagation();
    const newSelection = selectedDocuments.includes(docId)
      ? selectedDocuments.filter(id => id !== docId)
      : [...selectedDocuments, docId];
    onDocumentSelectionChange(newSelection);
  };

  const handleDocumentSelect = (doc: Document) => {
    setSelectedDocument(doc);
    onDocumentSelect({ id: doc.id, content: doc.content });
    setIsBlurred(false);
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

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="tableBlurToggle"
            checked={isBlurred}
            onChange={(e) => setIsBlurred(e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="tableBlurToggle" className="text-sm">
            Blur
          </label>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selectedDocuments.length} of {documents.length} selected
          </span>
        </div>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-primary/50">
            <th className="w-10 border p-2 text-left">
              <input
                type="checkbox"
                checked={selectedDocuments.length === documents.length}
                onChange={handleToggleAll}
                className="h-4 w-4"
              />
            </th>
            <th className="border p-2 text-left">Filename</th>
            <th className="border p-2 text-left">Content</th>
            <th className="border p-2 text-left">Created</th>
            <th className="border p-2 text-left">Updated</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr
              key={doc.id}
              className={`cursor-pointer hover:bg-primary/15/50 ${
                selectedDocument?.id === doc.id ? 'bg-primary/15/10' : ''
              } ${selectedDocuments.includes(doc.id) ? 'bg-primary/10' : ''}`}
              onClick={() => handleDocumentSelect(doc)}
            >
              <td className="w-10 border p-2" onClick={e => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedDocuments.includes(doc.id)}
                  onChange={(e) => handleToggleDocument(e, doc.id)}
                  className="h-4 w-4"
                />
              </td>
              <td className="border p-2">{doc.metadata.filename}</td>
              <td
                className={`max-w-md truncate border p-2 transition-all duration-200 ${
                  isBlurred ? 'blur-md' : 'blur-0'
                }`}
              >
                {doc.content}
              </td>
              <td className="border p-2">
                {new Date(doc.metadata.created_at).toLocaleDateString()}
              </td>
              <td className="border p-2">
                {new Date(doc.metadata.updated_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
