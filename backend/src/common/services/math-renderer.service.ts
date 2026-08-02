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
  depthPt: number; // how far the equation's bottom edge sits below its own text baseline
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
      // MathJax adds standard typographic spacing around binary/relational
      // operators (=, +, -) by default — correct for textbook display math,
      // but wider than the compact "3x=6" style wanted for short inline
      // worksheet expressions. \! is TeX's negative thin space; wrapping
      // these operators with it pulls them tight against their neighbors
      // without changing how the operator itself renders.
      const compactLatex = latex.replace(/\s*([=+\-])\s*/g, '\\!$1\\!');

      const node = this.html.convert(compactLatex, { display: false });
      const svg = this.adaptor.innerHTML(node);

      // MathJax reports size as e.g. width="2.104ex" height="1.676ex" on
      // the outer <svg> tag. It also emits a style attribute like
      // style="vertical-align: -0.089ex;" — a negative offset telling us
      // how far the SVG's bottom edge sits BELOW the text baseline. That's
      // the "depth" of the glyph, and without reading it we have no way to
      // know where the baseline sits inside the box, which is what caused
      // equations to render visibly off the text line.
      const widthMatch = svg.match(/width="([\d.]+)ex"/);
      const heightMatch = svg.match(/height="([\d.]+)ex"/);
      const valignMatch = svg.match(/vertical-align:\s*(-?[\d.]+)ex/);

      const widthEx = widthMatch ? parseFloat(widthMatch[1]) : 1;
      const heightEx = heightMatch ? parseFloat(heightMatch[1]) : 1;
      const depthEx = valignMatch ? Math.abs(parseFloat(valignMatch[1])) : 0;

      const widthPt = widthEx * 0.5 * fontSizePt;
      const heightPt = heightEx * 0.5 * fontSizePt;
      const depthPt = depthEx * 0.5 * fontSizePt;

      // svg-to-pdfkit doesn't understand "ex" units on the <svg> tag itself —
      // it mis-parses them, then stretches non-uniformly to fit the width/height
      // passed into SVGtoPDF(), which produced the distorted glyphs seen on
      // printed papers. Rewrite width/height to the same pt values we already
      // computed, so source and target dimensions agree and no distorting
      // rescale happens.
      const fixedSvg = svg
        .replace(/width="[\d.]+ex"/, `width="${widthPt}pt"`)
        .replace(/height="[\d.]+ex"/, `height="${heightPt}pt"`);

      return {
        svg: fixedSvg,
        widthPt,
        heightPt,
        depthPt,
      };
    } catch (err) {
      this.logger.warn(`Failed to render LaTeX "${latex}": ${err}`);
      return null;
    }
  }
}