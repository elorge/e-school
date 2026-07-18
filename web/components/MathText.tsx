// web/components/MathText.tsx
'use client';

import { InlineMath } from 'react-katex';
import ShapeDiagram, { isShapeBlock } from './ShapeDiagram';

/**
 * Renders plain text with inline LaTeX segments wrapped in $...$ — the
 * same convention teachers already know from WhatsApp/Markdown math
 * shorthand — and inline geometry diagrams written as
 * `[[shape:type|key=value|...]]` (inserted via ShapeToolbar, never
 * typed by hand in practice). A malformed equation (unbalanced braces,
 * typo'd command) falls back to showing the raw LaTeX as plain text
 * instead of crashing the whole question — a bad equation or shape
 * code should never break the test for every other student on the
 * same page.
 */
export default function MathText({ text }: { text: string }) {
  if (!text) return null;
  const segments = text.split(/(\[\[shape:[a-z-]+(?:\|[a-zA-Z]+=[^|\]]*)*\]\]|\$[^$]+\$)/g);

  return (
    <span className="whitespace-pre-wrap">
      {segments.map((segment, i) => {
        if (isShapeBlock(segment)) {
          return <ShapeDiagram key={i} code={segment} />;
        }
        if (segment.startsWith('$') && segment.endsWith('$') && segment.length > 2) {
          const latex = segment.slice(1, -1);
          try {
            return <InlineMath key={i} math={latex} renderError={() => <span className="text-red-500">{segment}</span>} />;
          } catch {
            return <span key={i}>{segment}</span>;
          }
        }
        return <span key={i}>{segment}</span>;
      })}
    </span>
  );
}