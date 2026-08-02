// backend/src/common/utils/render-math-text.ts
import SVGtoPDF from 'svg-to-pdfkit';
import { MathRendererService } from '../services/math-renderer.service';

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
  // Standard approximation of a Helvetica's ascent (distance from the top
  // of the line box down to the text baseline) as a fraction of font size.
  const ascentPt = fontSizePt * 0.8;

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

      // svg-to-pdfkit draws top-left anchored. We want the equation's own
      // baseline — which sits (heightPt - depthPt) down from its top edge —
      // to land at the same y as the surrounding plain text's baseline
      // (ascentPt down from the top of the line box). Solving for the nudge:
      const verticalNudge = ascentPt - (rendered.heightPt - rendered.depthPt);
      SVGtoPDF(doc, rendered.svg, cursorX, cursorY + verticalNudge, {
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