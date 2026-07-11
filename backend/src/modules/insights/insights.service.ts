// backend/src/modules/insights/insights.service.ts
import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../../prisma/prisma.service';
import { SchoolsService } from '../schools/schools.service';
import { classifyPerformance } from '../../common/utils/performance-classification';
import { SUBJECT_CAREER_FIELDS } from '../../common/constants';

interface SessionWrapSubject {
  subject: string;
  termScores: { termNumber: number; termName: string; score: number }[];
  average: number;
}

export interface SessionWrap {
  studentName: string;
  admissionId: string | null;
  academicSession: string;
  termsCovered: number;
  subjects: SessionWrapSubject[];
  topStrengths: string[]; // subjects, ranked by average score, that clear the strength threshold across the session
  suggestedFields: { field: string; supportingSubjects: string[] }[];
  narrative: string;
}

@Injectable()
export class InsightsService {
  private readonly logger = new Logger(InsightsService.name);

constructor(
    private readonly prisma: PrismaService,
    private readonly http: HttpService,
    private readonly schoolsService: SchoolsService,
  ) {}

  private async assertEnabled(schoolId: string) {
    const school = await this.schoolsService.findByIdOrThrow(schoolId);
    if (!school.sessionWrapEnabled) {
      throw new ForbiddenException('Session Wrap is not enabled for this school yet');
    }
  }

  async buildSessionWrapForPin(schoolId: string, studentId: string, termId: string): Promise<SessionWrap> {
    const term = await this.prisma.term.findUniqueOrThrow({ where: { id: termId } });
    return this.buildSessionWrap(schoolId, studentId, term.academicSession);
  }

  async buildSessionWrap(schoolId: string, studentId: string, academicSession: string): Promise<SessionWrap> {
    await this.assertEnabled(schoolId);
    const [student, terms] = await Promise.all([
      this.prisma.student.findFirstOrThrow({ where: { id: studentId, schoolId } }),
      this.prisma.term.findMany({
        where: { schoolId, academicSession },
        orderBy: { termNumber: 'asc' },
      }),
    ]);
    if (terms.length === 0) throw new NotFoundException('No terms found for that academic session');

    const results = await this.prisma.resultEntry.findMany({
      where: { schoolId, studentId, termId: { in: terms.map((t) => t.id) } },
    });
    if (results.length === 0) {
      throw new NotFoundException('No results on file for this student in this academic session yet');
    }

    // Build per-subject score history across whichever terms have a result on file.
    const subjectMap = new Map<string, { termNumber: number; termName: string; score: number }[]>();
    for (const result of results) {
      const term = terms.find((t) => t.id === result.termId)!;
      const scores = result.subjectScores as Record<string, number>;
      for (const [subject, score] of Object.entries(scores)) {
        if (!subjectMap.has(subject)) subjectMap.set(subject, []);
        subjectMap.get(subject)!.push({ termNumber: term.termNumber, termName: term.name, score });
      }
    }

    const subjects: SessionWrapSubject[] = Array.from(subjectMap.entries()).map(([subject, termScores]) => {
      const sorted = termScores.sort((a, b) => a.termNumber - b.termNumber);
      const average = Math.round(sorted.reduce((sum, t) => sum + t.score, 0) / sorted.length);
      return { subject, termScores: sorted, average };
    });

    // Classify on the SESSION AVERAGE per subject, not any single term — a
    // student who dipped one term but held strong overall should still
    // show as a strength; a single bad term shouldn't erase the pattern.
    const averagesBySubject = Object.fromEntries(subjects.map((s) => [s.subject, s.average]));
    const classification = classifyPerformance(averagesBySubject);

    const topStrengths = subjects
      .filter((s) => classification.strengths.includes(s.subject))
      .sort((a, b) => b.average - a.average)
      .slice(0, 5)
      .map((s) => s.subject);

    // Map top strengths to fields, deduped, each field shows WHICH subjects support it — never a bare label.
    const fieldToSubjects = new Map<string, Set<string>>();
    for (const subject of topStrengths) {
      const fields = SUBJECT_CAREER_FIELDS[subject] ?? [];
      for (const field of fields) {
        if (!fieldToSubjects.has(field)) fieldToSubjects.set(field, new Set());
        fieldToSubjects.get(field)!.add(subject);
      }
    }
    const suggestedFields = Array.from(fieldToSubjects.entries())
      .map(([field, subjectSet]) => ({ field, supportingSubjects: Array.from(subjectSet) }))
      .sort((a, b) => b.supportingSubjects.length - a.supportingSubjects.length)
      .slice(0, 6);

    const narrative =
      topStrengths.length > 0
        ? `${results.length === 1 ? 'This term' : `Across ${results.length} terms this session`}, ${student.firstName} showed the strongest, most consistent performance in ${topStrengths.join(', ')}. ${results.length < 3 ? 'This picture will get sharper as more terms are added. ' : ''}${
            suggestedFields.length > 0
              ? `Fields that typically draw on these subjects include ${suggestedFields.map((f) => f.field).join(', ')}.`
              : ''
          } This is a starting point for conversation, not a decision — a school counselor or career advisor is the right next step for anything more specific.`
        : `No subject cleared the strength threshold consistently across this session yet — that's normal at this stage and worth revisiting next session.`;

    return {
      studentName: `${student.firstName} ${student.lastName}`,
      admissionId: student.studentId,
      academicSession,
      termsCovered: results.length,
      subjects,
      topStrengths,
      suggestedFields,
      narrative,
    };
  }

  private async fetchLogoBuffer(url: string): Promise<Buffer | null> {
    try {
      const response = await firstValueFrom(this.http.get(url, { responseType: 'arraybuffer', timeout: 5000 }));
      return Buffer.from(response.data);
    } catch (err) {
      this.logger.warn(`Failed to fetch logo at ${url}: ${err}`);
      return null;
    }
  }

  async renderSessionWrapPdf(schoolId: string, studentId: string, academicSession: string): Promise<Buffer> {
    const [wrap, school, template] = await Promise.all([
      this.buildSessionWrap(schoolId, studentId, academicSession),
      this.prisma.school.findUniqueOrThrow({ where: { id: schoolId } }),
      this.prisma.reportTemplate.findUnique({ where: { schoolId } }),
    ]);
    const logoBuffer = template?.schoolLogoUrl ? await this.fetchLogoBuffer(template.schoolLogoUrl) : null;

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      if (logoBuffer) {
        try {
          doc.image(logoBuffer, doc.page.margins.left, doc.page.margins.top, { width: 50, height: 50, fit: [50, 50] });
        } catch {
          /* skip a corrupt logo, never fail the document */
        }
      }
      doc.fontSize(18).font('Helvetica-Bold').text(school.name, { align: 'center' });
      doc.moveDown(0.2);
      doc.fontSize(13).font('Helvetica').text(`Session Wrap — ${wrap.academicSession}`, { align: 'center' });
      doc.moveDown(1.5);

      doc.fontSize(12).font('Helvetica-Bold').text(wrap.studentName);
      doc.fontSize(9).font('Helvetica').fillColor('#555').text(`Admission ID: ${wrap.admissionId ?? '—'}`);
      doc.fillColor('#000');
      doc.moveDown(1);

      doc.fontSize(12).font('Helvetica-Bold').text('Subject averages this session');
      doc.moveDown(0.3);
      for (const s of wrap.subjects) {
        const trend = s.termScores.map((t) => t.score).join(' → ');
        doc.fontSize(9).font('Helvetica').text(`${s.subject}: average ${s.average}  (${trend})`);
      }
      doc.moveDown(1);

      doc.fontSize(12).font('Helvetica-Bold').text('Strongest subjects');
      doc.fontSize(9).font('Helvetica').text(wrap.topStrengths.join(', ') || 'None cleared the threshold this session yet');
      doc.moveDown(1);

      if (wrap.suggestedFields.length > 0) {
        doc.fontSize(12).font('Helvetica-Bold').text('Fields worth exploring');
        doc.moveDown(0.2);
        for (const f of wrap.suggestedFields) {
          doc.fontSize(9).font('Helvetica').text(`${f.field} — supported by ${f.supportingSubjects.join(', ')}`);
        }
        doc.moveDown(1);
      }

      doc.fontSize(9).font('Helvetica-Oblique').fillColor('#555').text(wrap.narrative, { align: 'left' });
      doc.moveDown(1.5);
      doc
        .fontSize(7)
        .fillColor('#888')
        .text(
          'This summary is generated from term scores using fixed thresholds, not a psychometric assessment. It is a starting point for conversation — a school counselor is the right next step for career guidance.',
        );

      doc.end();
    });
  }
}