// web/components/MathText.tsx
'use client';

import { InlineMath } from 'react-katex';

/**
 * Renders plain text with inline LaTeX segments wrapped in $...$ — the
 * same convention teachers already know from WhatsApp/Markdown math
 * shorthand. A malformed equation (unbalanced braces, typo'd command)
 * falls back to showing the raw LaTeX as plain text instead of crashing
 * the whole question — a bad equation should never break the test for
 * every other student on the same page.
 */
export default function MathText({ text }: { text: string }) {
  if (!text) return null;
  const segments = text.split(/(\$[^$]+\$)/g);

  return (
    <span className="whitespace-pre-wrap">
      {segments.map((segment, i) => {
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