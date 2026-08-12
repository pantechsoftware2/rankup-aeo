'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { CrawlPayload } from '@/types/crawl';
import type { DeepAuditReport } from '@/types/deep-audit';
import type { FastScanResult } from '@/types/fast-scan';
import { AUDIT_REGENERATION_PRICE } from '@/lib/audit-pricing';

export type ScanStage = 'idle' | 'crawling' | 'fast-scanning' | 'deep-scanning' | 'complete' | 'error';
export type PaymentRequirement = {
  requiresPayment: true;
  price: number;
  domain: string;
};
export type ScanStartResult = { started: true } | PaymentRequirement;

export interface ScanContextType {
  url: string;
  stage: ScanStage;
  crawl: CrawlPayload | null;
  fast: FastScanResult | null;
  deep: DeepAuditReport | null;
  error: string | null;
  paymentRequirement: PaymentRequirement | null;
  clearPaymentRequirement: () => void;
  startScan: (url: string) => Promise<ScanStartResult>;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const [url, setUrl] = useState('');
  const [stage, setStage] = useState<ScanStage>('idle');
  const [crawl, setCrawl] = useState<CrawlPayload | null>(null);
  const [fast, setFast] = useState<FastScanResult | null>(null);
  const [deep, setDeep] = useState<DeepAuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentRequirement, setPaymentRequirement] = useState<PaymentRequirement | null>(null);

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
    setPaymentRequirement(null);

    try {
      // Initiate streaming fetch to /api/analyze?stream=true
      const response = await fetch('/api/analyze?stream=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const result = await response.json();
        if (result?.requiresPayment) {
          const requirement = {
            requiresPayment: true,
            price: Number(result.price || AUDIT_REGENERATION_PRICE),
            domain: String(result.domain || normalizedUrl),
          } as const;
          setPaymentRequirement(requirement);
          setStage('idle');
          return requirement;
        }

        if (!response.ok) {
          throw new Error(result?.error || `HTTP ${response.status}: ${response.statusText}`);
        }
      }

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Set up stream reader and process it in the background so navigation can happen immediately.
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      const processStream = async () => {
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines[lines.length - 1];

            for (let i = 0; i < lines.length - 1; i++) {
              const line = lines[i].trim();
              if (!line) continue;

              try {
                const chunk = JSON.parse(line);

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
        } catch (streamError: any) {
          console.error('Scan stream error:', streamError);
          setError(streamError?.message || 'Unknown error occurred');
          setStage('error');
        }
      };

      void processStream();

      return { started: true as const };
    } catch (err: any) {
      console.error('Scan error:', err);
      setError(err?.message || 'Unknown error occurred');
      setStage('error');
      return { started: true as const };
    }
  }, []);

  const clearPaymentRequirement = useCallback(() => {
    setPaymentRequirement(null);
  }, []);

  const value: ScanContextType = {
    url,
    stage,
    crawl,
    fast,
    deep,
    error,
    paymentRequirement,
    clearPaymentRequirement,
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
