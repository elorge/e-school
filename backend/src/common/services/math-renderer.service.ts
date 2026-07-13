// backend/src/common/services/math-renderer.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { SVG } from 'mathjax-full/js/output/svg.js';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js';

export interface RenderedMath {
  svg: string;
  widthPt: number;
  heightPt: number;
}

/**
 * Server-side LaTeX -> SVG, no browser required (unlike a Puppeteer-based
 * approach). Set up once at module load — MathJax's document object is
 * expensive to construct, so this is a singleton, not re-created per call.
 */
@Injectable()
export class MathRendererService {
  private readonly logger = new Logger(MathRendererService.name);
  private readonly adaptor = liteAdaptor();
  private readonly html: ReturnType<typeof mathjax.document>;

  constructor() {
    RegisterHTMLHandler(this.adaptor);
    const tex = new TeX({ packages: AllPackages });
    const svgOutput = new SVG({ fontCache: 'none' }); // 'none' = every glyph is self-contained, required since svg-to-pdfkit can't resolve <use> font-cache references
    this.html = mathjax.document('', { InputJax: tex, OutputJax: svgOutput });
  }

  /**
   * Renders one LaTeX expression to SVG + its size in points at the
   * given font size. Returns null on malformed LaTeX rather than
   * throwing — one bad equation in a 40-question test paper should
   * never fail the whole document; the caller falls back to showing
   * the raw LaTeX as plain text instead.
   */
  render(latex: string, fontSizePt: number): RenderedMath | null {
    try {
      const node = this.html.convert(latex, { display: false });
      const svg = this.adaptor.innerHTML(node);

      // MathJax reports size as e.g. width="2.104ex" height="1.676ex" on
      // the outer <svg> tag. 1ex ≈ 0.5em is the standard typographic
      // approximation — exact for MathJax's own font metrics would need
      // parsing its internal em-per-ex table, which isn't worth the
      // complexity for print layout purposes.
      const widthMatch = svg.match(/width="([\d.]+)ex"/);
      const heightMatch = svg.match(/height="([\d.]+)ex"/);
      const widthEx = widthMatch ? parseFloat(widthMatch[1]) : 1;
      const heightEx = heightMatch ? parseFloat(heightMatch[1]) : 1;

      return {
        svg,
        widthPt: widthEx * 0.5 * fontSizePt,
        heightPt: heightEx * 0.5 * fontSizePt,
      };
    } catch (err) {
      this.logger.warn(`Failed to render LaTeX "${latex}": ${err}`);
      return null;
    }
  }
}