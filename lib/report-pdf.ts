import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { ConsultingAuditReport, ReportDimensionScore } from '@/types/consulting-report';

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

interface PdfContext {
  doc: PDFDocument;
  page: PDFPage;
  fontRegular: PDFFont;
  fontBold: PDFFont;
  y: number;
}

const COLORS = {
  ink: rgb(0.09, 0.11, 0.15),
  muted: rgb(0.32, 0.36, 0.41),
  soft: rgb(0.91, 0.94, 0.97),
  softGreen: rgb(0.92, 0.98, 0.94),
  accent: rgb(0.09, 0.64, 0.28),
  accentDark: rgb(0.06, 0.18, 0.13),
  blue: rgb(0.14, 0.36, 0.72),
};

function addPage(ctx: PdfContext) {
  ctx.page = ctx.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  ctx.y = PAGE_HEIGHT - MARGIN;
}

function ensureSpace(ctx: PdfContext, requiredHeight: number) {
  if (ctx.y - requiredHeight < MARGIN) {
    addPage(ctx);
  }
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return [''];
  }

  const words = normalized.split(' ');
  const lines: string[] = [];
  let current = words[0] || '';

  for (const word of words.slice(1)) {
    const candidate = `${current} ${word}`;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }

  lines.push(current);
  return lines;
}

function drawLines(
  ctx: PdfContext,
  lines: string[],
  options: {
    font: PDFFont;
    size: number;
    color?: ReturnType<typeof rgb>;
    lineHeight?: number;
    indent?: number;
  }
) {
  const lineHeight = options.lineHeight || options.size * 1.35;
  ensureSpace(ctx, lines.length * lineHeight + 4);

  for (const line of lines) {
    ctx.page.drawText(line, {
      x: MARGIN + (options.indent || 0),
      y: ctx.y,
      size: options.size,
      font: options.font,
      color: options.color || rgb(0.2, 0.23, 0.28),
      maxWidth: CONTENT_WIDTH - (options.indent || 0),
    });
    ctx.y -= lineHeight;
  }
}

function drawParagraph(
  ctx: PdfContext,
  text: string,
  options: {
    font?: PDFFont;
    size?: number;
    color?: ReturnType<typeof rgb>;
    spacingAfter?: number;
  } = {}
) {
  const font = options.font || ctx.fontRegular;
  const size = options.size || 10.5;
  const lines = wrapText(text, font, size, CONTENT_WIDTH);
  drawLines(ctx, lines, {
    font,
    size,
    color: options.color,
  });
  ctx.y -= options.spacingAfter ?? 6;
}

function drawSectionTitle(ctx: PdfContext, title: string) {
  drawParagraph(ctx, title, {
    font: ctx.fontBold,
    size: 15,
    color: COLORS.ink,
    spacingAfter: 8,
  });
}

function scoreVerdict(score: number) {
  if (score >= 80) return 'Strong momentum';
  if (score >= 65) return 'High-upside opportunity';
  if (score >= 45) return 'Recoverable, but exposed';
  return 'Foundational rebuild needed';
}

function drawCard(ctx: PdfContext, title: string, body: string, options?: { tone?: 'default' | 'accent' | 'soft'; minHeight?: number }) {
  const tone = options?.tone || 'default';
  const fill =
    tone === 'accent' ? COLORS.softGreen : tone === 'soft' ? rgb(0.96, 0.97, 0.99) : COLORS.soft;
  const titleColor = tone === 'accent' ? COLORS.accentDark : COLORS.ink;
  const bodyColor = COLORS.muted;
  const titleLines = wrapText(title, ctx.fontBold, 11, CONTENT_WIDTH - 28);
  const bodyLines = wrapText(body, ctx.fontRegular, 10, CONTENT_WIDTH - 28);
  const lineHeight = 14;
  const height = Math.max(options?.minHeight || 72, 20 + titleLines.length * lineHeight + bodyLines.length * 13);

  ensureSpace(ctx, height + 12);
  ctx.page.drawRectangle({
    x: MARGIN,
    y: ctx.y - height + 6,
    width: CONTENT_WIDTH,
    height,
    color: fill,
    borderColor: rgb(0.83, 0.87, 0.91),
    borderWidth: 1,
  });

  let y = ctx.y - 18;
  for (const line of titleLines) {
    ctx.page.drawText(line, {
      x: MARGIN + 14,
      y,
      size: 11,
      font: ctx.fontBold,
      color: titleColor,
    });
    y -= lineHeight;
  }
  for (const line of bodyLines) {
    ctx.page.drawText(line, {
      x: MARGIN + 14,
      y,
      size: 10,
      font: ctx.fontRegular,
      color: bodyColor,
    });
    y -= 13;
  }
  ctx.y -= height + 10;
}

function drawPlatformCard(ctx: PdfContext, title: string, status: string, body: string) {
  const fill = rgb(0.97, 0.98, 0.99);
  const accent = statusColor(status === 'COMPETITIVE' ? 'STRONG' : status === 'PROMISING' ? 'GOOD' : status === 'WEAK' ? 'FAIR' : 'CRITICAL');
  const titleLines = wrapText(title, ctx.fontBold, 11, CONTENT_WIDTH - 44);
  const bodyLines = wrapText(body, ctx.fontRegular, 9.5, CONTENT_WIDTH - 44).slice(0, 4);
  const height = Math.max(78, 26 + titleLines.length * 13 + bodyLines.length * 12);

  ensureSpace(ctx, height + 12);
  ctx.page.drawRectangle({
    x: MARGIN,
    y: ctx.y - height + 4,
    width: CONTENT_WIDTH,
    height,
    color: fill,
    borderColor: rgb(0.86, 0.89, 0.93),
    borderWidth: 1,
  });
  ctx.page.drawRectangle({
    x: MARGIN,
    y: ctx.y - height + 4,
    width: 7,
    height,
    color: accent,
  });

  let y = ctx.y - 18;
  for (const line of titleLines) {
    ctx.page.drawText(line, {
      x: MARGIN + 18,
      y,
      size: 11,
      font: ctx.fontBold,
      color: COLORS.ink,
    });
    y -= 13;
  }
  ctx.page.drawText(status, {
    x: PAGE_WIDTH - MARGIN - 110,
    y: ctx.y - 18,
    size: 9,
    font: ctx.fontBold,
    color: accent,
  });
  for (const line of bodyLines) {
    ctx.page.drawText(line, {
      x: MARGIN + 18,
      y,
      size: 9.5,
      font: ctx.fontRegular,
      color: COLORS.muted,
    });
    y -= 12;
  }
  ctx.y -= height + 10;
}

function drawRoadmapCard(ctx: PdfContext) {
  const phases = [
    ['Days 1-30', 'Fix the trust leaks, tighten technical gaps, and sharpen the homepage promise.'],
    ['Days 31-60', 'Expand proof-led content, schema coverage, and comparison assets across the core funnel.'],
    ['Days 61-90', 'Scale authority, outreach, and defensible citation coverage across high-intent topics.'],
  ] as const;
  const height = 108;

  ensureSpace(ctx, height + 12);
  ctx.page.drawRectangle({
    x: MARGIN,
    y: ctx.y - height + 4,
    width: CONTENT_WIDTH,
    height,
    color: rgb(0.97, 0.98, 0.99),
    borderColor: rgb(0.86, 0.89, 0.93),
    borderWidth: 1,
  });

  let y = ctx.y - 18;
  ctx.page.drawText('90-Day Rollout Shape', {
    x: MARGIN + 14,
    y,
    size: 11,
    font: ctx.fontBold,
    color: COLORS.ink,
  });
  y -= 18;

  for (const [phase, body] of phases) {
    ctx.page.drawText(phase, {
      x: MARGIN + 14,
      y,
      size: 9.5,
      font: ctx.fontBold,
      color: COLORS.accentDark,
    });
    const lines = wrapText(body, ctx.fontRegular, 9.5, CONTENT_WIDTH - 120);
    let bodyY = y;
    for (const line of lines.slice(0, 2)) {
      ctx.page.drawText(line, {
        x: MARGIN + 96,
        y: bodyY,
        size: 9.5,
        font: ctx.fontRegular,
        color: COLORS.muted,
      });
      bodyY -= 12;
    }
    y -= 24;
  }

  ctx.y -= height + 10;
}

function drawBulletList(ctx: PdfContext, items: string[], spacingAfter = 8) {
  for (const item of items) {
    const bulletLines = wrapText(item, ctx.fontRegular, 10, CONTENT_WIDTH - 16);
    drawLines(
      ctx,
      bulletLines.map((line, index) => (index === 0 ? `• ${line}` : `  ${line}`)),
      {
        font: ctx.fontRegular,
        size: 10,
        color: rgb(0.29, 0.33, 0.38),
        indent: 0,
      }
    );
  }
  ctx.y -= spacingAfter;
}

function drawSection(ctx: PdfContext, title: string, summary: string, findings: string[]) {
  drawSectionTitle(ctx, title);
  drawParagraph(ctx, summary, { color: rgb(0.22, 0.26, 0.31) });
  if (findings.length > 0) {
    drawBulletList(ctx, findings);
  }
}

function statusColor(status: string) {
  switch (status) {
    case 'CRITICAL':
      return rgb(0.86, 0.15, 0.15);
    case 'POOR':
      return rgb(0.92, 0.35, 0.02);
    case 'FAIR':
      return rgb(0.79, 0.54, 0.02);
    case 'GOOD':
      return rgb(0.09, 0.64, 0.28);
    default:
      return rgb(0.15, 0.39, 0.92);
  }
}

function drawScorecard(ctx: PdfContext, scorecard: ReportDimensionScore[]) {
  drawSectionTitle(ctx, 'Composite GEO Scorecard');

  for (const dimension of scorecard) {
    ensureSpace(ctx, 48);
    drawParagraph(ctx, `${dimension.label} (${dimension.weight}%): ${dimension.score}/100`, {
      font: ctx.fontBold,
      size: 11,
      color: COLORS.ink,
      spacingAfter: 2,
    });
    drawParagraph(ctx, dimension.status, {
      font: ctx.fontBold,
      size: 10,
      color: statusColor(dimension.status),
      spacingAfter: 2,
    });
    ctx.page.drawRectangle({
      x: MARGIN,
      y: ctx.y - 4,
      width: CONTENT_WIDTH,
      height: 6,
      color: rgb(0.9, 0.92, 0.95),
    });
    ctx.page.drawRectangle({
      x: MARGIN,
      y: ctx.y - 4,
      width: (CONTENT_WIDTH * dimension.score) / 100,
      height: 6,
      color: statusColor(dimension.status),
    });
    ctx.y -= 12;
    drawParagraph(ctx, dimension.summary, {
      size: 10,
      color: COLORS.muted,
      spacingAfter: 8,
    });
  }
}

export async function renderConsultingReportPdf(report: ConsultingAuditReport) {
  const doc = await PDFDocument.create();
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const ctx: PdfContext = {
    doc,
    page: doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]),
    fontRegular,
    fontBold,
    y: PAGE_HEIGHT - MARGIN,
  };

  ctx.page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 116,
    width: PAGE_WIDTH,
    height: 116,
    color: COLORS.accentDark,
  });
  ctx.page.drawRectangle({
    x: PAGE_WIDTH - 210,
    y: PAGE_HEIGHT - 116,
    width: 210,
    height: 116,
    color: COLORS.blue,
    opacity: 0.12,
  });

  ctx.page.drawText('SEO + GEO AUDIT REPORT', {
    x: MARGIN,
    y: PAGE_HEIGHT - 60,
    size: 24,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  ctx.page.drawText(report.website, {
    x: MARGIN,
    y: PAGE_HEIGHT - 84,
    size: 11,
    font: fontRegular,
    color: rgb(0.86, 0.89, 0.94),
  });

  ctx.y = PAGE_HEIGHT - 148;

  drawCard(
    ctx,
    `${report.brandName} consulting snapshot`,
    'This report is designed to show where visibility is leaking, what can be improved quickly, and why the full rollout plan still belongs in the strategy call.',
    { tone: 'accent', minHeight: 88 }
  );

  drawParagraph(ctx, report.brandName, {
    font: fontBold,
    size: 18,
    color: COLORS.ink,
    spacingAfter: 4,
  });
  drawParagraph(ctx, `Generated ${new Date(report.generatedAt).toLocaleString()}`, {
    size: 10,
    color: COLORS.muted,
    spacingAfter: 8,
  });
  drawParagraph(ctx, `${report.compositeScore}/100`, {
    font: fontBold,
    size: 28,
    color: COLORS.ink,
    spacingAfter: 2,
  });
  drawParagraph(ctx, 'Composite GEO Score', {
    size: 10,
    color: COLORS.muted,
    spacingAfter: 4,
  });
  drawParagraph(ctx, scoreVerdict(report.compositeScore), {
    font: fontBold,
    size: 10,
    color: report.compositeScore >= 65 ? COLORS.accent : COLORS.blue,
    spacingAfter: 10,
  });
  drawParagraph(ctx, report.executiveSummary, {
    size: 11,
    color: COLORS.muted,
    spacingAfter: 12,
  });

  drawScorecard(ctx, report.scorecard);
  drawSection(ctx, 'AI Visibility & Citability', report.aiVisibility.summary, report.aiVisibility.findings);
  drawSection(ctx, 'Brand Authority', report.brandAuthority.summary, report.brandAuthority.findings);
  drawSection(ctx, 'Content Quality & E-E-A-T', report.contentAndEEAT.summary, report.contentAndEEAT.findings);
  drawSection(ctx, 'Technical Foundations', report.technicalFoundations.summary, report.technicalFoundations.findings);
  drawSection(ctx, 'Schema Analysis', report.schemaAnalysis.summary, report.schemaAnalysis.findings);

  addPage(ctx);
  drawSectionTitle(ctx, 'Platform Readiness');
  for (const assessment of report.platformAssessments) {
    drawPlatformCard(ctx, assessment.platform, assessment.status, assessment.summary);
  }

  drawSectionTitle(ctx, 'Keyword Opportunities');
  for (const opportunity of report.keywordGapAnalysis.opportunities) {
    drawParagraph(ctx, `${opportunity.keyword} (${opportunity.intent})`, {
      font: fontBold,
      size: 10,
      color: COLORS.ink,
      spacingAfter: 2,
    });
    drawParagraph(ctx, opportunity.rationale, {
      size: 10,
      color: COLORS.muted,
      spacingAfter: 6,
    });
  }

  drawSectionTitle(ctx, 'Competitor Landscape');
  drawParagraph(ctx, report.competitorLandscape.summary, {
    size: 10,
    color: COLORS.muted,
    spacingAfter: 8,
  });
  for (const competitor of report.competitorLandscape.competitors) {
    drawParagraph(ctx, `${competitor.name} (${competitor.estimatedStrength}/100)`, {
      font: fontBold,
      size: 10,
      color: COLORS.ink,
      spacingAfter: 2,
    });
    drawParagraph(ctx, competitor.reason, {
      size: 10,
      color: COLORS.muted,
      spacingAfter: 6,
    });
  }

  addPage(ctx);
  drawSectionTitle(ctx, 'Prioritized Action Plan');
  drawRoadmapCard(ctx);
  const actionGroups = [
    ['Quick Wins', report.actionPlan.quickWins],
    ['Foundation Building', report.actionPlan.foundation],
    ['Acceleration', report.actionPlan.acceleration],
  ] as const;

  for (const [title, items] of actionGroups) {
    drawCard(
      ctx,
      title,
      title === 'Quick Wins'
        ? 'These are the fastest credibility and visibility lifts available without a full rebuild.'
        : title === 'Foundation Building'
          ? 'These moves create the durable structure needed for stronger AI and search performance.'
          : 'These initiatives expand authority once the core foundation has been tightened.',
      { tone: title === 'Quick Wins' ? 'accent' : 'soft', minHeight: 72 }
    );
    for (const item of items) {
      drawParagraph(ctx, item.action, {
        font: fontBold,
        size: 10,
        color: COLORS.ink,
        spacingAfter: 2,
      });
      drawParagraph(ctx, `Expected impact: ${item.expectedImpact}`, {
        size: 10,
        color: COLORS.muted,
        spacingAfter: 2,
      });
      drawParagraph(ctx, `Effort: ${item.effort}`, {
        size: 10,
        color: COLORS.muted,
        spacingAfter: 8,
      });
    }
  }

  drawCard(
    ctx,
    'Reserved For The Strategy Call',
    'We intentionally hold back the implementation sequence, full keyword map, detailed competitor playbook, and page-level execution plan so the rollout can be prioritized properly with your team.',
    { tone: 'soft', minHeight: 84 }
  );
  drawBulletList(ctx, report.withheldFromReport, 12);

  ensureSpace(ctx, 110);
  ctx.page.drawRectangle({
    x: MARGIN,
    y: ctx.y - 80,
    width: CONTENT_WIDTH,
    height: 80,
    color: COLORS.accentDark,
  });
  ctx.page.drawText(report.nextStepCTA.label, {
    x: MARGIN + 16,
    y: ctx.y - 24,
    size: 15,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  const ctaDescriptionLines = wrapText(report.nextStepCTA.description, fontRegular, 10, CONTENT_WIDTH - 32);
  let ctaY = ctx.y - 42;
  for (const line of ctaDescriptionLines.slice(0, 3)) {
    ctx.page.drawText(line, {
      x: MARGIN + 16,
      y: ctaY,
      size: 10,
      font: fontRegular,
      color: rgb(0.9, 0.94, 0.97),
    });
    ctaY -= 14;
  }
  ctx.page.drawText(report.nextStepCTA.href, {
    x: MARGIN + 16,
    y: ctx.y - 68,
    size: 10,
    font: fontBold,
    color: rgb(0.7, 0.88, 0.98),
  });

  const pages = doc.getPages();
  pages.forEach((page, index) => {
    page.drawLine({
      start: { x: MARGIN, y: 28 },
      end: { x: PAGE_WIDTH - MARGIN, y: 28 },
      thickness: 1,
      color: rgb(0.88, 0.9, 0.93),
    });
    page.drawText(`RankUp AEO  ·  Confidential consulting preview  ·  ${index + 1}/${pages.length}`, {
      x: MARGIN,
      y: 14,
      size: 9,
      font: fontRegular,
      color: COLORS.muted,
    });
  });

  const bytes = await doc.save();
  return Buffer.from(bytes);
}
