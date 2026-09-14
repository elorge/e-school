// backend/src/modules/id-cards/id-cards.service.ts
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { PrismaService } from '../../prisma/prisma.service';
import { ATTENDANCE_MAX_BACKDATE_HOURS, ATTENDANCE_MAX_FUTURE_MINUTES } from '../../common/constants';
import { reportLabelsFor } from '../../common/i18n/report-labels';

@Injectable()
export class IdCardsService {
  private readonly logger = new Logger(IdCardsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly http: HttpService,
  ) {}

  /**
   * Digital card generation is free — no wallet interaction here at all.
   * PDF rendering: see IdCardsService.renderIdCardPdf below.
   */
  async issueCard(schoolId: string, studentId: string) {
    const qrCode = `eschools:${schoolId}:${studentId}`; // encode enough to identify uniquely on scan
    return this.prisma.idCard.create({ data: { schoolId, studentId, qrCode } });
  }

  /**
   * Called when a staff device syncs a queued gate scan. `occurredAt` is
   * the on-device timestamp of the actual scan — clamped to a sane
   * window so a wrong device clock (or a deliberately backdated scan)
   * can't produce nonsense attendance history. `clientReferenceId` makes
   * a retried sync a no-op instead of a duplicate record.
   */
  async logAttendance(
    schoolId: string,
    studentId: string,
    scannedByStaffId: string,
    occurredAtIso: string,
    clientReferenceId: string,
  ) {
    const existing = await this.prisma.attendanceRecord.findUnique({ where: { clientReferenceId } });
    if (existing) return existing;

    const occurredAt = new Date(occurredAtIso);
    const now = new Date();
    const earliestAllowed = new Date(now.getTime() - ATTENDANCE_MAX_BACKDATE_HOURS * 60 * 60 * 1000);
    const latestAllowed = new Date(now.getTime() + ATTENDANCE_MAX_FUTURE_MINUTES * 60 * 1000);

    if (occurredAt < earliestAllowed || occurredAt > latestAllowed) {
      throw new BadRequestException(
        `Scan timestamp is outside the accepted window (max ${ATTENDANCE_MAX_BACKDATE_HOURS}h in the past, ${ATTENDANCE_MAX_FUTURE_MINUTES}m in the future)`,
      );
    }

    return this.prisma.attendanceRecord.create({
      data: { schoolId, studentId, scannedByStaffId, source: 'qr', occurredAt, clientReferenceId },
    });
  }

  findByStudent(schoolId: string, studentId: string) {
    return this.prisma.attendanceRecord.findMany({
      where: { schoolId, studentId },
      orderBy: { occurredAt: 'desc' },
    });
  }
  private async fetchImageBuffer(url: string): Promise<Buffer | null> {
    try {
      const response = await firstValueFrom(this.http.get(url, { responseType: 'arraybuffer', timeout: 5000 }));
      return Buffer.from(response.data);
    } catch (err) {
      this.logger.warn(`Failed to fetch image at ${url}: ${err}`);
      return null;
    }
  }

  /**
   * Renders a standard CR80 credit-card-sized ID card (86mm x 54mm) as a
   * PDF — school's own branding only, per the report-card branding rule
   * (spec doc §10.1). The QR encodes the same string used at gate-scan
   * time, so a printed card and a phone-shown card scan identically.
   */
  async renderIdCardPdf(schoolId: string, studentId: string): Promise<Buffer> {
    const [student, school, idCard] = await Promise.all([
      this.prisma.student.findFirstOrThrow({ where: { id: studentId, schoolId } }),
      this.prisma.school.findUniqueOrThrow({ where: { id: schoolId } }),
      this.prisma.idCard.findFirst({ where: { schoolId, studentId }, orderBy: { issuedAt: 'desc' } }),
    ]);
    if (!idCard) throw new NotFoundException('No ID card has been issued for this student yet');

    const [logoBuffer, photoBuffer, qrDataUrl] = await Promise.all([
      school.logoUrl ? this.fetchImageBuffer(school.logoUrl) : Promise.resolve(null),
      student.photoUrl ? this.fetchImageBuffer(student.photoUrl) : Promise.resolve(null),
      QRCode.toDataURL(idCard.qrCode, { margin: 0, width: 100 }),
    ]);
    const qrImageBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

    // CR80 card size in points: 86mm x 54mm ≈ 243.8 x 153.4pt
    const CARD_WIDTH = 243.8;
    const CARD_HEIGHT = 153.4;
    const labels = reportLabelsFor(school.locale);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: [CARD_WIDTH, CARD_HEIGHT], margin: 10 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Base card
      doc.rect(0, 0, CARD_WIDTH, CARD_HEIGHT).fill('#ffffff');

      // Colored header strip — same brand blue as the report card, so the
      // two documents read as one consistent identity system.
      doc.rect(0, 0, CARD_WIDTH, 34).fill('#0B3D91');

      if (logoBuffer) {
        try {
          doc.image(logoBuffer, 8, 5, { width: 24, height: 24, fit: [24, 24] });
        } catch (err) {
          this.logger.warn(`Card logo for school ${schoolId} was not a valid image: ${err}`);
        }
      }
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#ffffff').text(school.name, 36, 12, { width: CARD_WIDTH - 46 });
      doc.fillColor('#000');

      // Photo — a thin brand-colored frame instead of a bare gray box.
      if (photoBuffer) {
        try {
          doc.rect(9, 43, 62, 72).fill('#0B3D91');
          doc.image(photoBuffer, 10, 44, { width: 60, height: 70, fit: [60, 70] });
        } catch (err) {
          this.logger.warn(`Card photo for student ${studentId} was not a valid image: ${err}`);
        }
      } else {
        doc.rect(10, 44, 60, 70).fillColor('#F5F7FA').fill();
        doc.rect(10, 44, 60, 70).strokeColor('#0B3D91').lineWidth(1).stroke();
        doc.fontSize(6).fillColor('#999').text(labels.noPhoto, 10, 75, { width: 60, align: 'center' });
      }

      doc.fontSize(10).font('Helvetica-Bold').fillColor('#000').text(`${student.firstName} ${student.lastName}`, 80, 48, {
        width: CARD_WIDTH - 90,
      });
      doc.fontSize(7).font('Helvetica').fillColor('#1F9D55').text(labels.idCardIdPrefix(student.studentId ?? '—'), 80, 62, {
        width: CARD_WIDTH - 90,
      });
      // A thin rule under the name/ID block, echoing the report card's
      // subject-table row separators — same visual language across
      // both documents.
      doc.moveTo(80, 76).lineTo(CARD_WIDTH - 10, 76).strokeColor('#e5e5e5').stroke();
      doc.fillColor('#000');

      doc.image(qrImageBuffer, CARD_WIDTH - 55, CARD_HEIGHT - 55, { width: 45 });
      doc.fontSize(5).fillColor('#999').text(labels.scanForAttendance, CARD_WIDTH - 65, CARD_HEIGHT - 12, { width: 65, align: 'center' });

      // Thin colored footer strip — bookends the header strip, gives the card a finished, deliberate edge.
      doc.rect(0, CARD_HEIGHT - 4, CARD_WIDTH, 4).fill('#1F9D55');
      
      doc.end();
    });
  }
}
