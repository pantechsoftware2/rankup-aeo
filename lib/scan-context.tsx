'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { CrawlPayload } from '@/types/crawl';
import type { DeepAuditReport } from '@/types/deep-audit';
import type { FastScanResult } from '@/types/fast-scan';

export type ScanStage = 'idle' | 'crawling' | 'fast-scanning' | 'deep-scanning' | 'complete' | 'error';

export interface ScanContextType {
  url: string;
  stage: ScanStage;
  crawl: CrawlPayload | null;
  fast: FastScanResult | null;
  deep: DeepAuditReport | null;
  error: string | null;
  startScan: (url: string) => void;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const [url, setUrl] = useState('');
  const [stage, setStage] = useState<ScanStage>('idle');
  const [crawl, setCrawl] = useState<CrawlPayload | null>(null);
  const [fast, setFast] = useState<FastScanResult | null>(null);
  const [deep, setDeep] = useState<DeepAuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startScan = useCallback(async (inputUrl: string) => {
    // Normalize the URL first (add https:// if missing)
    let normalizedUrl = inputUrl.trim();
    if (!normalizedUrl.match(/^https?:\/\//i)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    setUrl(normalizedUrl);
    setStage('crawling');
    setCrawl(null);
    setFast(null);
    setDeep(null);
    setError(null);

    try {
      // Initiate streaming fetch to /api/analyze?stream=true
      const response = await fetch('/api/analyze?stream=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Set up stream reader
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Read stream chunks
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode chunk and append to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete lines (newline-delimited JSON)
        const lines = buffer.split('\n');
        buffer = lines[lines.length - 1]; // Keep incomplete line in buffer

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          try {
            const chunk = JSON.parse(line);

            // Update state based on stage
            if (chunk.stage === 'crawl') {
              setStage('crawling');
              setCrawl(chunk.data);
            } else if (chunk.stage === 'fast') {
              setStage('fast-scanning');
              setFast(chunk.data);
            } else if (chunk.stage === 'deep') {
              setStage('deep-scanning');
              if (chunk.error) {
                setError(chunk.error);
              } else {
                setDeep(chunk.data);
              }
            } else if (chunk.stage === 'complete') {
              setStage('complete');
            }
          } catch (parseError) {
            console.error('Failed to parse chunk:', line, parseError);
          }
        }
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      setError(err?.message || 'Unknown error occurred');
      setStage('error');
    }
  }, []);

  const value: ScanContextType = {
    url,
    stage,
    crawl,
    fast,
    deep,
    error,
    startScan,
  };

  return (
    <ScanContext.Provider value={value}>
      {children}
    </ScanContext.Provider>
  );
}

export function useScanContext() {
  const context = useContext(ScanContext);
  if (context === undefined) {
    throw new Error('useScanContext must be used within a ScanProvider');
  }
  return context;
}
