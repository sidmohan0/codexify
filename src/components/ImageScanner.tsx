import React, { useState } from 'react';
import { createWorker } from 'tesseract.js';
// For Nextron, we'll need to adjust the button import path
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function ImageScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [text, setText] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const scanImage = async (file: File) => {
    setIsScanning(true);
    setLogs([]); // Clear previous logs
    
    try {
      addLog(`Starting scan of ${file.name}`);
      addLog('Initializing Tesseract worker...');
      const worker = await createWorker('eng');
      
      addLog('Beginning OCR process...');
      const { data: { text } } = await worker.recognize(file);
      
      addLog('OCR completed successfully');
      setText(text);
      
      addLog('Cleaning up...');
      await worker.terminate();
      addLog('Scan completed!');
    } catch (error) {
      console.error('OCR error:', error);
      addLog(`Error: ${error.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && scanImage(e.target.files[0])}
        className="hidden"
        id="image-input"
      />
      <Button
        onClick={() => document.getElementById('image-input')?.click()}
        disabled={isScanning}
      >
        {isScanning ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Scanning...
          </>
        ) : (
          'Scan Image'
        )}
      </Button>

      {/* Status Log Section */}
      {logs.length > 0 && (
        <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-3">
          <div className="text-sm font-medium mb-2">Status Log:</div>
          <div className="max-h-32 overflow-y-auto text-sm font-mono">
            {logs.map((log, index) => (
              <div key={index} className="text-gray-600">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OCR Results Section */}
      {text && (
        <div className="rounded-md border bg-muted p-4">
          <div className="text-sm font-medium mb-2">OCR Results:</div>
          <pre className="whitespace-pre-wrap text-sm">{text}</pre>
        </div>
      )}
    </div>
  );
} 