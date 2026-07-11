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

    // Both remote fetches (logo + QR encoding) run in parallel — neither
    // depends on the other.
    const verificationPrefix = template?.verificationQrPrefix ?? 'https://elorgeschools.com/verify';
    const [logoBuffer, qrDataUrl] = await Promise.all([
      template?.schoolLogoUrl ? this.fetchLogoBuffer(template.schoolLogoUrl) : Promise.resolve(null),
      QRCode.toDataURL(`${verificationPrefix}/${result.id}`, { margin: 1, width: 120 }),
    ]);
    const qrImageBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header — school's own branding, never an Elorge asset (spec doc §10.1).
      if (logoBuffer) {
        try {
          doc.image(logoBuffer, doc.page.margins.left, doc.page.margins.top, { width: 60, height: 60, fit: [60, 60] });
        } catch (err) {
          // pdfkit throws synchronously if the buffer isn't a valid
          // image format it recognizes (jpg/png) — don't let a corrupt
          // logo file crash report generation.
          this.logger.warn(`Logo buffer for school ${schoolId} was not a valid image — skipping: ${err}`);
        }
      }

      doc.fontSize(18).font('Helvetica-Bold').text(school.name, { align: 'center' });
      doc.moveDown(0.2);
      doc.fontSize(11).font('Helvetica').text(term.name, { align: 'center' });
      doc.moveDown(1);

      doc.fontSize(13).font('Helvetica-Bold').text(`${student.firstName} ${student.lastName}`);
      doc.fontSize(10).font('Helvetica').text(`Admission ID: ${student.studentId ?? '—'}`);
      doc.moveDown(1);

    doc.fontSize(12).font('Helvetica-Bold').text('Subject Scores');
      doc.moveDown(0.3);
      const scores = result.subjectScores as SubjectScores;
      for (const [subject, score] of Object.entries(scores)) {
        doc.fontSize(10).font('Helvetica').text(`${subject}: ${score}`);
      }
      doc.moveDown(1);

      const classification = classifyPerformance(scores);

      doc.fontSize(12).font('Helvetica-Bold').text('Areas of Strength & Weakness');
      doc.moveDown(0.4);
      this.drawPerformanceChart(doc, scores, classification);
      doc.moveDown(0.8);

      doc.fontSize(9).font('Helvetica-Oblique').fillColor('#555');
      doc.text('Green = strength (70+)   Amber = needs improvement (50-69)   Red = at risk (below 50)');
      doc.fillColor('#000');
      doc.moveDown(1);

      doc.fontSize(12).font('Helvetica-Bold').text('Teacher Recommendation');
      doc.moveDown(0.3);
      doc.fontSize(10).font('Helvetica').text(this.buildRecommendationText(classification));
      doc.moveDown(1);

      doc.fontSize(12).font('Helvetica-Bold').text('Performance Trend');
      doc.moveDown(0.3);
      for (const [subject, history] of Object.entries(trend)) {
        const line = history.map((h) => h.score).join(' → ');
        doc.fontSize(10).font('Helvetica').text(`${subject}: ${line}`);
      }
      doc.moveDown(1);

      if (result.teacherComment) {
        doc.fontSize(12).font('Helvetica-Bold').text("Teacher's Comment");
        doc.fontSize(10).font('Helvetica').text(result.teacherComment);
        doc.moveDown(1);
      }

      // Verification QR — small, bottom corner, alongside the school's own branding.
      doc.image(qrImageBuffer, doc.page.width - 130, doc.page.height - 150, { width: 80 });
      doc.fontSize(7).text('Scan to verify', doc.page.width - 130, doc.page.height - 65, { width: 80, align: 'center' });

      doc.end();
    });
  }
}