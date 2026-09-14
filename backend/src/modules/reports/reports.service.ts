// backend/src/modules/reports/reports.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { PrismaService } from '../../prisma/prisma.service';
import { classifyPerformance, PerformanceClassification } from '../../common/utils/performance-classification';
import { reportLabelsFor, ReportLabels } from '../../common/i18n/report-labels';

interface SubjectScores {
  [subject: string]: number;
}

type TrendMap = Record<string, { termId: string; score: number }[]>;

const TREND_LINE_COLORS = ['#0B3D91', '#2f9e44', '#e8590c', '#9c36b5', '#0c8599'];

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly http: HttpService,
  ) {}

  getTemplate(schoolId: string) {
    return this.prisma.reportTemplate.findUnique({ where: { schoolId } });
  }

  upsertTemplate(schoolId: string, schoolLogoUrl: string, headerFooterInfo: object) {
    return this.prisma.reportTemplate.upsert({
      where: { schoolId },
      create: { schoolId, schoolLogoUrl, headerFooterInfo },
      update: { schoolLogoUrl, headerFooterInfo },
    });
  }

  /**
   * Deterministic, template-based — no AI/ML, so the wording is always
   * predictable and explainable. `labels` carries the school's locale
   * (see ReportLabels) — subject names themselves are never translated,
   * only the sentence template they're dropped into.
   */
  private buildRecommendationText(classification: PerformanceClassification, labels: ReportLabels): string {
    const parts: string[] = [];
    if (classification.strengths.length > 0) {
      parts.push(labels.strongPerformanceIn(classification.strengths.join(', ')));
    }
    if (classification.needsImprovement.length > 0) {
      parts.push(labels.couldImproveIn(classification.needsImprovement.join(', ')));
    }
    if (classification.atRisk.length > 0) {
      parts.push(labels.needsSupportIn(classification.atRisk.join(', ')));
    }
    if (parts.length === 0) {
      parts.push(labels.noScoresRecorded);
    }
    return parts.join(' ');
  }

  private computeTrend(priorResults: { termId: string; subjectScores: unknown; createdAt: Date }[]): TrendMap {
    const trend: TrendMap = {};
    for (const result of priorResults) {
      const scores = result.subjectScores as SubjectScores;
      for (const [subject, score] of Object.entries(scores)) {
        if (!trend[subject]) trend[subject] = [];
        trend[subject].push({ termId: result.termId, score });
      }
    }
    return trend;
  }

  /**
   * Shortens `text` with a trailing ellipsis until it fits within
   * `maxHeight` at the font/size already set on `doc`. Used as a last
   * resort for the (rare) case where a long teacher's comment, combined
   * with a high subject count, would otherwise exceed the page's fixed
   * budget. Binary search over character count — cheap, since report
   * text is always short (well under a few hundred characters).
   */
  private truncateToFit(doc: PDFKit.PDFDocument, text: string, width: number, maxHeight: number): string {
    if (maxHeight <= 0) return '';
    if (doc.heightOfString(text, { width }) <= maxHeight) return text;

    let lo = 0;
    let hi = text.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      const candidate = `${text.slice(0, mid).trimEnd()}…`;
      if (doc.heightOfString(candidate, { width }) <= maxHeight) lo = mid;
      else hi = mid - 1;
    }
    return lo === 0 ? '' : `${text.slice(0, lo).trimEnd()}…`;
  }

  /**
   * Fills the gap between the comment block and the pinned footer with
   * a performance-trend line chart, built from `trend` (already
   * computed earlier — previously never rendered). Deliberately
   * conservative: draws nothing without real multi-term history AND
   * enough vertical room to show it clearly — no placeholder text, no
   * "not enough data" message. A first-term student's report, or a
   * report with a very full subject table, simply keeps its current,
   * correct one-page layout with the space left blank.
   */
  private drawTrendChart(
    doc: PDFKit.PDFDocument,
    trend: TrendMap,
    termNameById: Map<string, string>,
    currentScores: SubjectScores,
    chartTop: number,
    availableHeight: number,
    contentWidth: number,
    marginLeft: number,
  ): boolean {
    const orderedTermIds: string[] = [];
    for (const points of Object.values(trend)) {
      for (const p of points) {
        if (!orderedTermIds.includes(p.termId)) orderedTermIds.push(p.termId);
      }
    }
    if (orderedTermIds.length < 2) return false;

    const xTermIds = orderedTermIds.slice(-4);

    const currentSubjects = Object.keys(currentScores);
    const otherSubjects = Object.keys(trend).filter((s) => !currentSubjects.includes(s));
    const subjects = [...currentSubjects, ...otherSubjects]
      .filter((s) => trend[s]?.some((p) => xTermIds.includes(p.termId)))
      .filter((s) => trend[s].filter((p) => xTermIds.includes(p.termId)).length >= 2)
      .slice(0, 5);
    if (subjects.length === 0) return false;

    const MIN_HEIGHT = 100;
    const MAX_HEIGHT = 150;
    const LEGEND_HEIGHT = 14;
    const AXIS_LABEL_HEIGHT = 12;
    const chartHeight = Math.max(0, Math.min(MAX_HEIGHT, availableHeight) - LEGEND_HEIGHT - AXIS_LABEL_HEIGHT - 10);
    if (chartHeight < MIN_HEIGHT - LEGEND_HEIGHT - AXIS_LABEL_HEIGHT - 10) return false;

    const blockHeight = chartHeight + LEGEND_HEIGHT + AXIS_LABEL_HEIGHT + 10;
    const topOffset = Math.max(0, (availableHeight - blockHeight) / 2);
    const blockTop = chartTop + topOffset;

    const yAxisLabelWidth = 22;
    const chartX = marginLeft + yAxisLabelWidth;
    const chartWidth = contentWidth - yAxisLabelWidth;

    doc.fontSize(9).font('Helvetica-Bold').fillColor('#0B3D91').text('Performance Trend', marginLeft, blockTop, { width: contentWidth });
    doc.fillColor('#000');
    const chartY = blockTop + 14;

    doc.fontSize(6).font('Helvetica').fillColor('#999');
    for (const mark of [0, 50, 100]) {
      const gy = chartY + chartHeight - (mark / 100) * chartHeight;
      doc.moveTo(chartX, gy).lineTo(chartX + chartWidth, gy).strokeColor('#eee').lineWidth(0.5).stroke();
      doc.text(String(mark), marginLeft, gy - 3, { width: yAxisLabelWidth - 4, align: 'right' });
    }
    doc.fillColor('#000');

    const plotX = (i: number) => chartX + (xTermIds.length === 1 ? 0 : (i / (xTermIds.length - 1)) * chartWidth);
    const plotY = (score: number) => chartY + chartHeight - (score / 100) * chartHeight;

    subjects.forEach((subject, si) => {
      const color = TREND_LINE_COLORS[si % TREND_LINE_COLORS.length];
      const points = xTermIds
        .map((termId, i) => {
          const match = trend[subject].find((p) => p.termId === termId);
          return match ? { x: plotX(i), y: plotY(match.score) } : null;
        })
        .filter((p): p is { x: number; y: number } => p !== null);

      doc.strokeColor(color).lineWidth(1.3);
      points.forEach((pt, i) => {
        if (i === 0) doc.moveTo(pt.x, pt.y);
        else doc.lineTo(pt.x, pt.y);
      });
      doc.stroke();
      points.forEach((pt) => {
        doc.circle(pt.x, pt.y, 1.8).fillColor(color).fill();
      });
    });
    doc.fillColor('#000');

    doc.fontSize(6.5).font('Helvetica').fillColor('#666');
    xTermIds.forEach((termId, i) => {
      const label = termNameById.get(termId) ?? '—';
      const x = plotX(i);
      doc.text(label, x - 30, chartY + chartHeight + 4, { width: 60, align: 'center' });
    });
    doc.fillColor('#000');

    let legendY = chartY + chartHeight + AXIS_LABEL_HEIGHT + 4;
    let legendX = marginLeft;
    doc.fontSize(6.5).font('Helvetica');
    subjects.forEach((subject, si) => {
      const color = TREND_LINE_COLORS[si % TREND_LINE_COLORS.length];
      doc.rect(legendX, legendY + 1, 6, 6).fillColor(color).fill();
      doc.fillColor('#333').text(subject, legendX + 9, legendY, { width: 80 });
      legendX += 90;
    });
    doc.fillColor('#000');

    return true;
  }

  /**
   * Fetches a remote logo URL into a Buffer for pdfkit's .image(), which
   * only accepts a local path or Buffer. A failed fetch (dead URL,
   * timeout, non-image response) must never fail the whole report — the
   * report renders without a logo rather than not rendering at all.
   */
  private async fetchLogoBuffer(url: string): Promise<Buffer | null> {
    try {
      const response = await firstValueFrom(
        this.http.get(url, { responseType: 'arraybuffer', timeout: 5000 }),
      );
      return Buffer.from(response.data);
    } catch (err) {
      this.logger.warn(`Failed to fetch school logo at ${url} — rendering report without it: ${err}`);
      return null;
    }
  }

  async renderReportPdf(schoolId: string, studentId: string, termId: string): Promise<Buffer> {
    const [result, student, term, school, template] = await Promise.all([
      this.prisma.resultEntry.findFirst({ where: { schoolId, studentId, termId } }),
      this.prisma.student.findUniqueOrThrow({ where: { id: studentId } }),
      this.prisma.term.findUniqueOrThrow({ where: { id: termId } }),
      this.prisma.school.findUniqueOrThrow({ where: { id: schoolId } }),
      this.prisma.reportTemplate.findUnique({ where: { schoolId } }),
    ]);
    if (!result) throw new NotFoundException('No result on file for this term');

    const priorResults = await this.prisma.resultEntry.findMany({
      where: { schoolId, studentId },
      orderBy: { createdAt: 'asc' },
    });
    const trend = this.computeTrend(priorResults);

    const uniqueTermIds = Array.from(new Set(priorResults.map((r) => r.termId)));
    const trendTerms = uniqueTermIds.length > 0 ? await this.prisma.term.findMany({ where: { id: { in: uniqueTermIds } } }) : [];
    const termNameById = new Map(trendTerms.map((t) => [t.id, t.name]));

    const verificationPrefix = template?.verificationQrPrefix ?? 'https://elorgeschools.org/verify';
    const [logoBuffer, signatureBuffer, photoBuffer, qrDataUrl] = await Promise.all([
      school.logoUrl ? this.fetchLogoBuffer(school.logoUrl) : Promise.resolve(null),
      school.signatureUrl ? this.fetchLogoBuffer(school.signatureUrl) : Promise.resolve(null),
      student.photoUrl ? this.fetchLogoBuffer(student.photoUrl) : Promise.resolve(null),
      QRCode.toDataURL(`${verificationPrefix}/${result.id}`, { margin: 1, width: 100 }),
    ]);
    const qrImageBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

    return new Promise((resolve, reject) => {
      const PAGE_WIDTH = 595.28; // A4 at 72dpi
      const PAGE_HEIGHT = 841.89;
      const MARGIN = 36;
      const doc = new PDFDocument({ size: 'A4', layout: 'portrait', margin: MARGIN, autoFirstPage: true });

      // Disable PDFKit's own auto-pagination entirely. Every block below
      // is placed against a budget we compute ourselves — if PDFKit were
      // still free to insert a page break on its own bottom-margin
      // boundary, a long comment or a high subject count could silently
      // spill onto page 2 exactly like the original QR-code bug, just
      // triggered from a different block. With this at 0, an overflow
      // becomes visually tight/cramped in the worst case, never a
      // silent second page.
      doc.page.margins.bottom = 0;

      const chunks: Buffer[] = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const contentWidth = PAGE_WIDTH - MARGIN * 2;
      const scores = result.subjectScores as SubjectScores;
      const subjectEntries = Object.entries(scores);
      const n = subjectEntries.length;
      const classification = classifyPerformance(scores);
      const labels = reportLabelsFor(school.locale);

      // ── Header band ──────────────────────────────────────────────────
      const HEADER_HEIGHT = 76;
      doc.rect(0, 0, PAGE_WIDTH, HEADER_HEIGHT).fill('#0B3D91');
      doc.fillColor('#ffffff');
      if (logoBuffer) {
        try {
          doc.roundedRect(MARGIN - 3, 11, 54, 54, 8).fill('#ffffff');
          doc.image(logoBuffer, MARGIN, 14, { width: 48, height: 48, fit: [48, 48] });
        } catch (err) {
          this.logger.warn(`Logo buffer for school ${schoolId} was not a valid image: ${err}`);
        }
      }
      doc.fontSize(16).font('Helvetica-Bold').text(school.name, MARGIN + 58, 18, { width: contentWidth - 58 - 90 });
      doc.fontSize(9).font('Helvetica').text(labels.reportCardTitle(term.name), MARGIN + 58, 40, { width: contentWidth - 58 - 90 });
      doc.fillColor('#000');

      if (photoBuffer) {
        try {
          doc.rect(PAGE_WIDTH - MARGIN - 54, 11, 54, 54).fill('#ffffff');
          doc.image(photoBuffer, PAGE_WIDTH - MARGIN - 52, 13, { width: 50, height: 50, fit: [50, 50] });
        } catch (err) {
          this.logger.warn(`Report photo for student ${studentId} was not a valid image: ${err}`);
        }
      }

      let y = HEADER_HEIGHT + 16;

      // ── Student info row ─────────────────────────────────────────────
      doc.fontSize(13).font('Helvetica-Bold').fillColor('#000').text(`${student.firstName} ${student.lastName}`, MARGIN, y, { width: contentWidth - 100 });
      doc.fontSize(9).font('Helvetica').fillColor('#555').text(labels.admissionId(student.studentId ?? '—'), MARGIN, y + 17, { width: contentWidth - 100 });
      doc.fillColor('#000');
      y += 40;

      // ── Footer geometry, fixed regardless of content ────────────────
      const FOOTER_BLOCK_HEIGHT = 76;
      const FOOTER_TOP = PAGE_HEIGHT - MARGIN - FOOTER_BLOCK_HEIGHT;
      const BODY_BOTTOM_LIMIT = FOOTER_TOP - 14; // hard ceiling everything above the footer must respect

      // ── Pre-measure the variable-length text blocks BEFORE drawing
      // anything subject-count-dependent, so table/bar row heights can
      // be sized against what's actually left — rather than guessing
      // with fixed thresholds that don't account for comment length or
      // how many subject names land in the recommendation sentence. ────
      const recommendationText = this.buildRecommendationText(classification, labels);
      doc.fontSize(8.5).font('Helvetica');
      const recommendationTextHeight = doc.heightOfString(recommendationText, { width: contentWidth });

      const hasComment = !!result.teacherComment;
      doc.fontSize(8.5).font('Helvetica-Oblique');
      const rawCommentHeight = hasComment ? doc.heightOfString(result.teacherComment!, { width: contentWidth }) : 0;

      const RECOMMENDATION_TITLE_H = 14;
      const RECOMMENDATION_GAP = 10;
      const COMMENT_TITLE_H = 14;
      const COMMENT_GAP = 10;
      const TABLE_TITLE_H = 18;
      const TABLE_GAP = 8;
      const BARS_TITLE_H = 16;
      const BARS_NOTE_H = 16;

      const fixedBlocksHeight =
        TABLE_TITLE_H +
        TABLE_GAP +
        BARS_TITLE_H +
        BARS_NOTE_H +
        RECOMMENDATION_TITLE_H +
        RECOMMENDATION_GAP +
        recommendationTextHeight +
        (hasComment ? COMMENT_TITLE_H + COMMENT_GAP : 0);

      // Budget left for the n table rows + n bar rows combined.
      const rowsBudget = Math.max(0, BODY_BOTTOM_LIMIT - y - fixedBlocksHeight - (hasComment ? rawCommentHeight : 0));

      // Split the per-subject budget between table row and bar row,
      // keeping the original 18:13 ratio (table rows read slightly
      // taller than bars) while clamping to a sensible min/max so a
      // 2-subject report doesn't get comically tall rows and a 20+
      // subject report doesn't get illegibly thin ones.
      const perSubjectBudget = n > 0 ? rowsBudget / n : 0;
      const ROW_HEIGHT = Math.min(18, Math.max(9, perSubjectBudget * (18 / 31)));
      const barRowHeight = Math.min(13, Math.max(6, perSubjectBudget * (13 / 31)));

      if (n > 0 && (ROW_HEIGHT <= 9.01 || barRowHeight <= 6.01)) {
        this.logger.warn(
          `Report for student ${studentId}, term ${termId} hit the minimum row-height floor with ${n} subjects — layout is at its tightest supported density.`,
        );
      }

      // Comment gets truncated only as a last resort, and only by
      // however much is left after the table/bars/recommendation have
      // taken their (already-fitted) share — so it degrades gracefully
      // instead of silently overflowing onto a second page.
      const commentBudget = Math.max(
        0,
        BODY_BOTTOM_LIMIT - y - fixedBlocksHeight - n * ROW_HEIGHT - n * barRowHeight,
      );
      let commentTextToRender = result.teacherComment ?? '';
      if (hasComment && rawCommentHeight > commentBudget) {
        doc.fontSize(8.5).font('Helvetica-Oblique');
        commentTextToRender = this.truncateToFit(doc, result.teacherComment!, contentWidth, commentBudget);
      }

      // ── Subject score table ──────────────────────────────────────────
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#0B3D91').text(labels.subjectScores, MARGIN, y, { width: contentWidth });
      doc.fillColor('#000');
      y += TABLE_TITLE_H;

      const colScoreX = MARGIN + contentWidth - 40;
      for (let i = 0; i < subjectEntries.length; i++) {
        const [subject, score] = subjectEntries[i];
        if (i % 2 === 1) {
          doc.rect(MARGIN, y - 2, contentWidth, ROW_HEIGHT).fill('#F5F7FA');
          doc.fillColor('#000');
        }
        doc.fontSize(9).font('Helvetica').text(subject, MARGIN + 4, y, { width: contentWidth - 60, height: ROW_HEIGHT, ellipsis: true });
        doc.font('Helvetica-Bold').text(String(score), colScoreX, y, { width: 36, align: 'right' });
        doc.font('Helvetica');
        y += ROW_HEIGHT;
      }
      y += TABLE_GAP;

      // ── Compact strength/weakness bar chart ──────────────────────────
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#0B3D91').text(labels.strengthWeakness, MARGIN, y, { width: contentWidth });
      doc.fillColor('#000');
      y += BARS_TITLE_H;

      const barLabelWidth = 90;
      const barMaxWidth = contentWidth - barLabelWidth - 32;
      const colorFor = (subject: string) => {
        if (classification.strengths.includes(subject)) return '#1F9D55';
        if (classification.needsImprovement.includes(subject)) return '#F08C00';
        return '#e03131';
      };
      const barFontSize = barRowHeight >= 11 ? 7.5 : 6.5;
      for (const [subject, score] of subjectEntries) {
        doc.fontSize(barFontSize).font('Helvetica').text(subject, MARGIN, y + 1, { width: barLabelWidth, height: barRowHeight, ellipsis: true });
        const barHeight = Math.max(4, barRowHeight - 3);
        const barWidth = Math.max(2, (score / 100) * barMaxWidth);
        doc.rect(MARGIN + barLabelWidth, y, barMaxWidth, barHeight).fillColor('#eee').fill();
        doc.rect(MARGIN + barLabelWidth, y, barWidth, barHeight).fillColor(colorFor(subject)).fill();
        doc.fillColor('#000').fontSize(barFontSize).text(String(score), MARGIN + barLabelWidth + barMaxWidth + 6, y, { width: 24 });
        y += barRowHeight;
      }
      doc.fontSize(7).font('Helvetica-Oblique').fillColor('#666').text(labels.strengthWeaknessLegend, MARGIN, y, { width: contentWidth });
      doc.fillColor('#000');
      y += BARS_NOTE_H;

      // ── Recommendation ────────────────────────────────────────────────
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#0B3D91').text(labels.teacherRecommendation, MARGIN, y, { width: contentWidth });
      doc.fillColor('#000');
      y += RECOMMENDATION_TITLE_H;
      doc.fontSize(8.5).font('Helvetica').text(recommendationText, MARGIN, y, { width: contentWidth });
      y += recommendationTextHeight + RECOMMENDATION_GAP;

      // ── Teacher's comment (possibly truncated above) ──────────────────
      if (hasComment && commentTextToRender) {
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#0B3D91').text(labels.teachersComment, MARGIN, y, { width: contentWidth });
        doc.fillColor('#000');
        y += COMMENT_TITLE_H;
        doc.fontSize(8.5).font('Helvetica-Oblique');
        const renderedHeight = doc.heightOfString(commentTextToRender, { width: contentWidth });
        doc.text(commentTextToRender, MARGIN, y, { width: contentWidth });
        y += renderedHeight + COMMENT_GAP;
      }

      // ── Performance trend chart — fills whatever's left of the gap
      // between content and footer, using data already computed above.
      // Never forces or fakes a chart if there isn't room or history. ──
      const gapTop = y + 6;
      const gapAvailable = FOOTER_TOP - 14 - gapTop;
      if (gapAvailable > 0) {
        this.drawTrendChart(doc, trend, termNameById, scores, gapTop, gapAvailable, contentWidth, MARGIN);
      }

      // ── Footer — pinned, never flowed ─────────────────────────────────
      if (signatureBuffer) {
        try {
          doc.image(signatureBuffer, MARGIN, FOOTER_TOP, { width: 90, height: 32, fit: [90, 32] });
        } catch (err) {
          this.logger.warn(`Signature image for school ${schoolId} was not a valid image: ${err}`);
        }
      }
      doc.moveTo(MARGIN, FOOTER_TOP + 36).lineTo(MARGIN + 130, FOOTER_TOP + 36).strokeColor('#ccc').stroke();
      doc.fontSize(7).fillColor('#666').text('Head of School — Authorized Signature', MARGIN, FOOTER_TOP + 39, { width: 130 });
      doc.fillColor('#000');

      doc.image(qrImageBuffer, PAGE_WIDTH - MARGIN - 60, FOOTER_TOP, { width: 60 });
      doc.fontSize(6).fillColor('#999').text('Scan to verify', PAGE_WIDTH - MARGIN - 60, FOOTER_TOP + 62, { width: 60, align: 'center' });
      doc.fillColor('#000');

      doc.end();
    });
  }
}