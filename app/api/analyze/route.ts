import { NextResponse } from "next/server";
import { performFastScan } from "@/lib/fast-scan";
import { performDeepScan } from "@/lib/deep-scan";
import { crawlWebsite } from "@/lib/crawler";
import { applyRateLimit, isUserUrlValidationError, validatePublicAuditUrl } from "@/lib/security";
import { createAuditHistory, hasUsedFreeAudit } from "@/backend/services/audit-history.service";
import { getCurrentAuditUser } from "@/backend/services/auth.service";
import { getActivePlanForUser } from "@/backend/services/payment-record.service";
import { normalizeAuditDomain } from "@/backend/utils/domain";
import { debugLog } from "@/lib/logger";
import { AUDIT_REGENERATION_PRICE_INR } from "@/lib/audit-pricing";

export const maxDuration = 300;

/**
 * Orchestrator route that coordinates fast → deep scan pipeline
 * Supports streaming with ?stream=true for progressive UI updates
 */
export async function POST(req: Request) {
  const startTime = Date.now();
  const url = new URL(req.url);
  const streamMode = url.searchParams.get('stream') === 'true';

  try {
    const rateLimit = applyRateLimit(req, {
      key: streamMode ? 'analyze-stream' : 'analyze',
      limit: streamMode ? 8 : 10,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait and try again.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
        }
      );
    }

    const body = await req.json();
    const inputUrl = body?.url;

    if (!inputUrl) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const normalizedUrl = await validatePublicAuditUrl(inputUrl);
    const domain = normalizeAuditDomain(normalizedUrl);
    const user = await getCurrentAuditUser();
    const activePlan = user ? await getActivePlanForUser(user.id) : null;
    const auditPaymentStatus = activePlan ? 'paid' : 'free';

    if (!activePlan && await hasUsedFreeAudit(domain)) {
      return NextResponse.json({
        requiresPayment: true,
        price: AUDIT_REGENERATION_PRICE_INR,
        currency: 'INR',
        domain,
      });
    }

    debugLog('[Analyze] Starting orchestration.', { url: normalizedUrl, streamMode });

    if (streamMode) {
      // STREAMING MODE: Send results progressively as newline-delimited JSON
      debugLog('[Analyze] Streaming mode enabled.');

      const encoder = new TextEncoder();

      // Use ReadableStream with manual controller
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            // Stage 1: Crawl first and stream crawl stage immediately
            const crawlResult = await crawlWebsite(normalizedUrl);
            controller.enqueue(encoder.encode(JSON.stringify({ stage: 'crawl', data: crawlResult }) + '\n'));
            debugLog('[Analyze] Streamed crawl stage.');

            // Stage 2: Run fast scan from prepared crawl data
            const fastResult = await performFastScan(normalizedUrl, { crawlPayload: crawlResult });
            controller.enqueue(encoder.encode(JSON.stringify({ stage: 'fast', data: fastResult.fast }) + '\n'));
            debugLog('[Analyze] Streamed fast stage.');

            if (fastResult.fast.readiness.recommendedPath === 'foundation') {
              await createAuditHistory({
                domain,
                freeAuditUsed: true,
                paymentStatus: auditPaymentStatus,
                crawl: fastResult.crawl,
                fast: fastResult.fast,
                deep: null,
              });
              const totalMs = Date.now() - startTime;
              controller.enqueue(encoder.encode(JSON.stringify({ stage: 'complete', timing: { totalMs } }) + '\n'));
              debugLog('[Analyze] Foundation path selected.', { totalMs });
              controller.close();
              return;
            }

            // Stage 3: Run deep scan and send results
            let deepReport = null;
            try {
              debugLog('[Analyze] Starting deep scan.');
              const deepResult = await performDeepScan(fastResult.crawl, fastResult.fast);
              
              if (deepResult.success && deepResult.report) {
                deepReport = deepResult.report;
                controller.enqueue(encoder.encode(JSON.stringify({ stage: 'deep', data: deepResult.report }) + '\n'));
                debugLog('[Analyze] Streamed deep stage.', { totalMs: deepResult.timing.totalMs });
              } else {
                throw new Error(deepResult.error || 'Unknown deep scan error');
              }
            } catch (err: any) {
              console.error(`[Analyze] Deep scan error:`, err);
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    stage: 'deep',
                    error: err?.message || String(err),
                  }) + '\n'
                )
              );
            }

            await createAuditHistory({
              domain,
              freeAuditUsed: true,
              paymentStatus: auditPaymentStatus,
              crawl: fastResult.crawl,
              fast: fastResult.fast,
              deep: deepReport,
            });

            // Stage 4: Signal completion
            const totalMs = Date.now() - startTime;
            controller.enqueue(encoder.encode(JSON.stringify({ stage: 'complete', timing: { totalMs } }) + '\n'));
            debugLog('[Analyze] Stream complete.', { totalMs });

            controller.close();
          } catch (err: any) {
            console.error(`[Analyze] Stream start error:`, err);
            controller.error(err);
          }
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // NON-STREAMING MODE: Run full flow and return combined result once complete
    debugLog('[Analyze] Non-streaming mode, running fast scan.');
    const fastResult = await performFastScan(normalizedUrl);
    debugLog('[Analyze] Fast scan completed.', { totalMs: fastResult.timing.totalMs });

    if (fastResult.fast.readiness.recommendedPath === 'foundation') {
      const totalMs = Date.now() - startTime;
      await createAuditHistory({
        domain,
        freeAuditUsed: true,
        paymentStatus: auditPaymentStatus,
        crawl: fastResult.crawl,
        fast: fastResult.fast,
        deep: null,
      });
      return NextResponse.json({
        success: true,
        crawl: fastResult.crawl,
        fast: fastResult.fast,
        deep: null,
        timing: { totalMs },
      });
    }

    debugLog('[Analyze] Non-streaming mode, waiting for deep scan.');
    const deepResult = await performDeepScan(fastResult.crawl, fastResult.fast);
    const totalMs = Date.now() - startTime;

    if (!deepResult.success || !deepResult.report) {
      throw new Error(deepResult.error || 'Deep scan failed');
    }

    await createAuditHistory({
      domain,
      freeAuditUsed: true,
      paymentStatus: auditPaymentStatus,
      crawl: fastResult.crawl,
      fast: fastResult.fast,
      deep: deepResult.report,
    });

    debugLog('[Analyze] Orchestration complete.', { totalMs });
    return NextResponse.json({
      success: true,
      crawl: fastResult.crawl,
      fast: fastResult.fast,
      deep: deepResult.report,
      timing: { totalMs },
    });
  } catch (error: any) {
    const totalMs = Date.now() - startTime;
    console.error('[Analyze] Orchestrator Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unknown error',
        timing: { totalMs },
      },
      { status: isUserUrlValidationError(error?.message || '') ? 400 : 500 }
    );
  }
}
