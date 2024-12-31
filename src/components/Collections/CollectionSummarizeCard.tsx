

import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const templateOptions = {
  concise: "Concise Summary",
  detailed: "Detailed Summary",
  bullets: "Bullet Points",
  executive: "Executive Summary"
};

const SummarizeCard = ({ 
  collectionId, 
  selectedDocuments, 
  onSummarizeComplete 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [template, setTemplate] = useState("concise");
  const [summaries, setSummaries] = useState([]);

  const handleSummarize = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/summaries/text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          collectionId,
          documentIds: selectedDocuments.map(doc => doc.id),
          template,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate summaries");
      }

      setSummaries(data.summaries);
      if (onSummarizeComplete) {
        onSummarizeComplete(data.summaries);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Document Summarization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(templateOptions).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleSummarize}
              disabled={isLoading || selectedDocuments.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Summarizing...
                </>
              ) : (
                "Generate Summaries"
              )}
            </Button>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Selected Documents:</h3>
            <ScrollArea className="h-24 rounded-md border p-2">
              {selectedDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center gap-2 py-1">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{doc.filename}</span>
                </div>
              ))}
            </ScrollArea>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {summaries.length > 0 && (
            <div className="mt-4 space-y-4">
              <h3 className="text-sm font-medium">Generated Summaries:</h3>
              {summaries.map((summary, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">{summary.filename}</span>
                    <Badge variant="secondary" className="ml-auto">
                      {templateOptions[template]}
                    </Badge>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{summary.summary}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SummarizeCard;