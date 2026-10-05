// backend/src/modules/staff/staff-id-cards.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { PrismaService } from '../../prisma/prisma.service';
import { reportLabelsFor } from '../../common/i18n/report-labels';

/**
 * Deliberately its own renderer, not a shared one with
 * IdCardsService.renderIdCardPdf — student cards are portrait CR80 with
 * a class/admission ID; staff cards below are landscape CR80 with
 * department/designation and read differently on sight, which is the
 * whole point of a staff card (a gate guard should tell them apart at a
 * glance, not just by color).
 */
@Injectable()
export class StaffIdCardsService {
  private readonly logger = new Logger(StaffIdCardsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly http: HttpService,
  ) {}

  private async fetchImageBuffer(url: string): Promise<Buffer | null> {
    try {
      const response = await firstValueFrom(this.http.get(url, { responseType: 'arraybuffer', timeout: 5000 }));
      return Buffer.from(response.data);
    } catch (err) {
      this.logger.warn(`Failed to fetch image at ${url}: ${err}`);
      return null;
    }
  }

  async renderIdCardPdf(schoolId: string, staffProfileId: string): Promise<Buffer> {
    const [profile, school, idCard] = await Promise.all([
      this.prisma.staffProfile.findFirstOrThrow({ where: { id: staffProfileId, schoolId }, include: { user: true } }),
      this.prisma.school.findUniqueOrThrow({ where: { id: schoolId } }),
      this.prisma.staffIdCard.findFirst({ where: { schoolId, staffProfileId }, orderBy: { issuedAt: 'desc' } }),
    ]);
    if (!idCard) throw new NotFoundException('No ID card has been issued for this staff member yet');

    const [logoBuffer, photoBuffer, signatureBuffer, qrDataUrl] = await Promise.all([
      school.logoUrl ? this.fetchImageBuffer(school.logoUrl) : Promise.resolve(null),
      profile.photoUrl ? this.fetchImageBuffer(profile.photoUrl) : Promise.resolve(null),
      school.signatureUrl ? this.fetchImageBuffer(school.signatureUrl) : Promise.resolve(null),
      QRCode.toDataURL(idCard.qrCode, { margin: 0, width: 100 }),
    ]);
    const qrImageBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

    // CR80 in landscape, points: 86mm x 54mm ≈ 243.8 x 153.4pt — same
    // physical card size as the student card, printer-compatible, but
    // rotated so the two are never visually confused when both are on
    // a lanyard at once.
    const CARD_WIDTH = 243.8;
    const CARD_HEIGHT = 153.4;
    const labels = reportLabelsFor(school.locale);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: [CARD_WIDTH, CARD_HEIGHT], margin: 0 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Base card — deep green identity color so it's never mistaken for
      // the blue-headed student card at a glance.
      doc.rect(0, 0, CARD_WIDTH, CARD_HEIGHT).fill('#ffffff');
      doc.rect(0, 0, 78, CARD_HEIGHT).fill('#1F5C3D');

      if (logoBuffer) {
        try {
          // White rounded badge so the logo stays readable on the green panel
          doc.roundedRect(21, 6, 36, 36, 6).fill('#ffffff');
          doc.image(logoBuffer, 25, 10, { fit: [28, 28], align: 'center', valign: 'center' });
        } catch (err) {
          this.logger.warn(`Card logo for school ${schoolId} was not a valid image: ${err}`);
        }
      }
      doc.fontSize(7).font('Helvetica-Bold').fillColor('#ffffff').text(school.name, 8, 46, { width: 62, align: 'center' });

      if (photoBuffer) {
        doc.save();
        try {
          // 'cover' fills the whole box (cropping any overflow) so a narrow photo leaves no blank strip
          doc.rect(14, 66, 50, 60).clip();
          doc.image(photoBuffer, 14, 66, { cover: [50, 60], align: 'center', valign: 'center' });
        } catch (err) {
          this.logger.warn(`Card photo for staff ${staffProfileId} was not a valid image: ${err}`);
        } finally {
          doc.restore();
        }
      } else {
        doc.rect(14, 66, 50, 60).fillColor('#ffffff').fill();
        doc.fontSize(6).fillColor('#1F5C3D').text(labels.noPhoto, 14, 92, { width: 50, align: 'center' });
      }

      doc.fillColor('#000');
      doc.fontSize(6).font('Helvetica-Bold').fillColor('#1F5C3D').text('STAFF ID', 88, 10, { width: CARD_WIDTH - 98 });
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#000').text(profile.user.fullName, 88, 20, { width: CARD_WIDTH - 98 });
      doc.fontSize(7).font('Helvetica').fillColor('#333').text(profile.designation ?? 'Staff', 88, 35, { width: CARD_WIDTH - 98 });
      if (profile.department) {
        doc.fontSize(7).fillColor('#333').text(profile.department, 88, 46, { width: CARD_WIDTH - 98 });
      }
      doc.fontSize(7).font('Helvetica-Bold').fillColor('#1F5C3D').text(`ID: ${profile.staffId}`, 88, 60, { width: CARD_WIDTH - 98 });

      doc.moveTo(88, 74).lineTo(CARD_WIDTH - 10, 74).strokeColor('#e5e5e5').stroke();

      // Head of school's signature (School.signatureUrl, set under Admin → Settings)
      if (signatureBuffer) {
        try {
          doc.image(signatureBuffer, 92, CARD_HEIGHT - 52, { fit: [70, 22] });
        } catch (err) {
          this.logger.warn(`Signature for school ${schoolId} was not a valid image: ${err}`);
        }
      }
      doc.moveTo(88, CARD_HEIGHT - 28).lineTo(165, CARD_HEIGHT - 28).strokeColor('#999').lineWidth(0.4).stroke();
      doc.fontSize(5).font('Helvetica').fillColor('#666').text('Head of School', 88, CARD_HEIGHT - 26, { width: 77, align: 'center' });

      doc.image(qrImageBuffer, CARD_WIDTH - 55, CARD_HEIGHT - 55, { width: 44 });
      doc.fontSize(5).fillColor('#999').text(labels.scanForAttendance, 88, CARD_HEIGHT - 16, { width: 90 });

      doc.rect(0, CARD_HEIGHT - 4, CARD_WIDTH, 4).fill('#F2A900');

      doc.end();
    });
  }
}