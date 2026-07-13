// backend/src/common/utils/render-math-text.ts
import * as SVGtoPDF from 'svg-to-pdfkit';
import { MathRendererService } from '../services/math-renderer.service';

/**
 * Splits text on $...$ (same convention as the frontend's MathText
 * component) and draws it onto a pdfkit document as a single flowed
 * line: plain text via doc.text(), equations via SVG embed.
 *
 * Deliberately simplified vs. real word-processor text flow: if a line
 * would overflow the page width, the WHOLE remaining segment wraps to
 * the next line rather than breaking mid-word/mid-equation. Good enough
 * for exam questions (which are short), not a general-purpose typesetter.
 */
export function renderTextWithMath(
  doc: PDFKit.PDFDocument,
  mathRenderer: MathRendererService,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSizePt = 10,
): number {
  const segments = text.split(/(\$[^$]+\$)/g).filter((s) => s.length > 0);
  let cursorX = x;
  let cursorY = y;
  const lineHeight = fontSizePt * 1.4;

  doc.fontSize(fontSizePt).font('Helvetica');

  for (const segment of segments) {
    if (segment.startsWith('$') && segment.endsWith('$') && segment.length > 2) {
      const latex = segment.slice(1, -1);
      const rendered = mathRenderer.render(latex, fontSizePt);

      if (!rendered) {
        // Malformed equation — fall back to showing the raw LaTeX as text rather than dropping it silently.
        const plain = segment;
        if (cursorX + doc.widthOfString(plain) > x + maxWidth) {
          cursorX = x;
          cursorY += lineHeight;
        }
        doc.text(plain, cursorX, cursorY, { continued: false, lineBreak: false });
        cursorX += doc.widthOfString(plain);
        continue;
      }

      if (cursorX + rendered.widthPt > x + maxWidth) {
        cursorX = x;
        cursorY += lineHeight;
      }

      // svg-to-pdfkit draws top-left anchored; nudge down slightly so the
      // equation's baseline roughly matches surrounding text's baseline.
      const verticalNudge = (lineHeight - rendered.heightPt) / 2;
      (SVGtoPDF as any)(doc, rendered.svg, cursorX, cursorY + verticalNudge, {
        width: rendered.widthPt,
        height: rendered.heightPt,
      });
      cursorX += rendered.widthPt + 2;
    } else {
      // Plain text — wrap word by word so long questions still flow naturally.
      const words = segment.split(' ');
      for (const word of words) {
        if (word === '') continue;
        const wordWidth = doc.widthOfString(word + ' ');
        if (cursorX + wordWidth > x + maxWidth) {
          cursorX = x;
          cursorY += lineHeight;
        }
        doc.text(word + ' ', cursorX, cursorY, { continued: false, lineBreak: false });
        cursorX += wordWidth;
      }
    }
  }

  return cursorY + lineHeight; // caller uses this as the next available y
}