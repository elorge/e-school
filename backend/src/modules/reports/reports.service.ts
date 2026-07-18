// backend/src/modules/reports/reports.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { PrismaService } from '../../prisma/prisma.service';
import { classifyPerformance, PerformanceClassification } from '../../common/utils/performance-classification';

interface SubjectScores {
  [subject: string]: number;
}

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

  /** Deterministic, template-based — no AI/ML, so the wording is always predictable and explainable. */
  private buildRecommendationText(classification: PerformanceClassification): string {
    const parts: string[] = [];
    if (classification.strengths.length > 0) {
      parts.push(`Strong performance in ${classification.strengths.join(', ')}.`);
    }
    if (classification.needsImprovement.length > 0) {
      parts.push(`Could improve with more practice in ${classification.needsImprovement.join(', ')}.`);
    }
    if (classification.atRisk.length > 0) {
      parts.push(`Needs focused support and possibly extra lessons in ${classification.atRisk.join(', ')}.`);
    }
    if (parts.length === 0) {
      parts.push('No subject scores recorded for this term.');
    }
    return parts.join(' ');
  }

  /**
   * Draws a horizontal bar per subject, colored by classification.
   * Pure pdfkit primitives — no charting library needed since the shape
   * is simple (one bar per subject, 0-100 scale).
   */
  private drawPerformanceChart(
    doc: PDFKit.PDFDocument,
    scores: SubjectScores,
    classification: PerformanceClassification,
  ) {
    const chartX = doc.page.margins.left;
    const chartWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const labelWidth = 110;
    const barMaxWidth = chartWidth - labelWidth - 40; // leave room for the score number
    const barHeight = 12;
    const rowGap = 8;

    const colorFor = (subject: string) => {
      if (classification.strengths.includes(subject)) return '#2f9e44'; // green
      if (classification.needsImprovement.includes(subject)) return '#f08c00'; // amber
      return '#e03131'; // red
    };

    for (const [subject, score] of Object.entries(scores)) {
      const y = doc.y;
      doc.fontSize(9).font('Helvetica').fillColor('#000').text(subject, chartX, y + 1, { width: labelWidth });

      const barWidth = Math.max(2, (score / 100) * barMaxWidth);
      doc
        .rect(chartX + labelWidth, y, barMaxWidth, barHeight)
        .fillColor('#eee')
        .fill(); // track/background
      doc
        .rect(chartX + labelWidth, y, barWidth, barHeight)
        .fillColor(colorFor(subject))
        .fill(); // filled portion

      doc
        .fontSize(9)
        .fillColor('#000')
        .text(String(score), chartX + labelWidth + barMaxWidth + 6, y + 1, { width: 30 });

      doc.y = y + barHeight + rowGap;
    }
    doc.fillColor('#000'); // reset for whatever renders next
  }

  private computeTrend(priorResults: { termId: string; subjectScores: unknown; createdAt: Date }[]) {
    const trend: Record<string, { termId: string; score: number }[]> = {};
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

    const verificationPrefix = template?.verificationQrPrefix ?? 'https://elorgeschools.com/verify';
    const [logoBuffer, signatureBuffer, photoBuffer, qrDataUrl] = await Promise.all([
      school.logoUrl ? this.fetchLogoBuffer(school.logoUrl) : Promise.resolve(null),
      school.signatureUrl ? this.fetchLogoBuffer(school.signatureUrl) : Promise.resolve(null),
      student.photoUrl ? this.fetchLogoBuffer(student.photoUrl) : Promise.resolve(null),
      QRCode.toDataURL(`${verificationPrefix}/${result.id}`, { margin: 1, width: 100 }),
    ]);
    const qrImageBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

    return new Promise((resolve, reject) => {
      // Explicit portrait A4, single fixed size — no auto page addition
      // anywhere below. Every block's height is computed and budgeted
      // against this fixed canvas so the document is guaranteed to be
      // exactly one page, never two, never landscape.
      const PAGE_WIDTH = 595.28; // A4 at 72dpi
      const PAGE_HEIGHT = 841.89;
      const MARGIN = 36;
      const doc = new PDFDocument({ size: 'A4', layout: 'portrait', margin: MARGIN, autoFirstPage: true });
      const chunks: Buffer[] = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const contentWidth = PAGE_WIDTH - MARGIN * 2;
      const scores = result.subjectScores as SubjectScores;
      const subjectEntries = Object.entries(scores);
      const classification = classifyPerformance(scores);

      // ── Header band ──────────────────────────────────────────────────
      const HEADER_HEIGHT = 76;
      doc.rect(0, 0, PAGE_WIDTH, HEADER_HEIGHT).fill('#0B3D91');
      doc.fillColor('#ffffff');
      if (logoBuffer) {
        try {
          doc.image(logoBuffer, MARGIN, 14, { width: 48, height: 48, fit: [48, 48] });
        } catch (err) {
          this.logger.warn(`Logo buffer for school ${schoolId} was not a valid image: ${err}`);
        }
      }
      doc.fontSize(16).font('Helvetica-Bold').text(school.name, MARGIN + 58, 18, { width: contentWidth - 58 - 90 });
      doc.fontSize(9).font('Helvetica').text(`Report Card — ${term.name}`, MARGIN + 58, 40, { width: contentWidth - 58 - 90 });
      doc.fillColor('#000');

      // Passport photo — sits inside the header band, top-right, so it
      // never competes for vertical space with anything below.
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
      doc.fontSize(9).font('Helvetica').fillColor('#555').text(`Admission ID: ${student.studentId ?? '—'}`, MARGIN, y + 17, { width: contentWidth - 100 });
      doc.fillColor('#000');
      y += 40;

      // ── Subject score table — height budgeted per row so N subjects
      // never overflow. Row height shrinks slightly if there are many
      // subjects, rather than letting the table run off the page. ──────
      const ROW_HEIGHT = subjectEntries.length > 12 ? 15 : 18;
      const tableTop = y;
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#0B3D91').text('Subject Scores', MARGIN, y, { width: contentWidth });
      doc.fillColor('#000');
      y += 18;

      const colScoreX = MARGIN + contentWidth - 40;
      for (let i = 0; i < subjectEntries.length; i++) {
        const [subject, score] = subjectEntries[i];
        if (i % 2 === 1) {
          doc.rect(MARGIN, y - 2, contentWidth, ROW_HEIGHT).fill('#F5F7FA');
          doc.fillColor('#000');
        }
        doc.fontSize(9).font('Helvetica').text(subject, MARGIN + 4, y, { width: contentWidth - 60 });
        doc.font('Helvetica-Bold').text(String(score), colScoreX, y, { width: 36, align: 'right' });
        doc.font('Helvetica');
        y += ROW_HEIGHT;
      }
      y += 8;

      // ── Compact strength/weakness bar chart — fixed height regardless
      // of subject count, since it reuses the same row positions above
      // rather than a separate full-size chart block. ───────────────────
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#0B3D91').text('Areas of Strength & Weakness', MARGIN, y, { width: contentWidth });
      doc.fillColor('#000');
      y += 16;

      const barLabelWidth = 90;
      const barMaxWidth = contentWidth - barLabelWidth - 32;
      const barRowHeight = subjectEntries.length > 10 ? 11 : 13;
      const colorFor = (subject: string) => {
        if (classification.strengths.includes(subject)) return '#1F9D55';
        if (classification.needsImprovement.includes(subject)) return '#F08C00';
        return '#e03131';
      };
      for (const [subject, score] of subjectEntries) {
        doc.fontSize(7.5).font('Helvetica').text(subject, MARGIN, y + 1, { width: barLabelWidth });
        const barWidth = Math.max(2, (score / 100) * barMaxWidth);
        doc.rect(MARGIN + barLabelWidth, y, barMaxWidth, barRowHeight - 3).fillColor('#eee').fill();
        doc.rect(MARGIN + barLabelWidth, y, barWidth, barRowHeight - 3).fillColor(colorFor(subject)).fill();
        doc.fillColor('#000').fontSize(7.5).text(String(score), MARGIN + barLabelWidth + barMaxWidth + 6, y, { width: 24 });
        y += barRowHeight;
      }
      y += 6;
      doc.fontSize(7).font('Helvetica-Oblique').fillColor('#666').text('Green = strength (70+)  Amber = needs improvement (50-69)  Red = at risk (below 50)', MARGIN, y, { width: contentWidth });
      doc.fillColor('#000');
      y += 16;

      // ── Recommendation — clamped to a max height via a fixed font
      // size and width; long text wraps but never grows unbounded. ─────
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#0B3D91').text('Teacher Recommendation', MARGIN, y, { width: contentWidth });
      doc.fillColor('#000');
      y += 14;
      doc.fontSize(8.5).font('Helvetica').text(this.buildRecommendationText(classification), MARGIN, y, { width: contentWidth });
      y = doc.y + 10;

      // ── Teacher's comment ────────────────────────────────────────────
      if (result.teacherComment) {
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#0B3D91').text("Teacher's Comment", MARGIN, y, { width: contentWidth });
        doc.fillColor('#000');
        y += 14;
        doc.fontSize(8.5).font('Helvetica-Oblique').text(result.teacherComment, MARGIN, y, { width: contentWidth });
        y = doc.y + 10;
      }

      // ── Everything below this point is PINNED to the bottom of the
      // page (not flowed), so it can never push onto a second page no
      // matter how long the content above ran. ──────────────────────────
      const FOOTER_TOP = PAGE_HEIGHT - 90;

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