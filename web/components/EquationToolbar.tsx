// web/components/EquationToolbar.tsx
'use client';

import { useState } from 'react';

interface Template {
  label: string;
  insert: string;
}

const MATH: Template[] = [
  { label: 'a/b', insert: '$\\frac{a}{b}$' },
  { label: 'x²', insert: '$x^{2}$' },
  { label: 'xₙ', insert: '$x_{n}$' },
  { label: '√x', insert: '$\\sqrt{x}$' },
  { label: 'ⁿ√x', insert: '$\\sqrt[n]{x}$' },
  { label: 'Σ', insert: '$\\sum_{i=1}^{n}$' },
  { label: '∫', insert: '$\\int_{a}^{b}$' },
  { label: 'π', insert: '$\\pi$' },
  { label: '≤ ≥', insert: '$\\leq \\geq$' },
];

const PHYSICS: Template[] = [
  { label: 'v⃗', insert: '$\\vec{v}$' },
  { label: 'Δ', insert: '$\\Delta$' },
  { label: 'm/s²', insert: '$\\frac{m}{s^{2}}$' },
  { label: '°', insert: '$^{\\circ}$' },
  { label: 'θ', insert: '$\\theta$' },
  { label: 'ω', insert: '$\\omega$' },
  { label: 'F=ma', insert: '$F = ma$' },
  { label: '×10ⁿ', insert: '$\\times 10^{n}$' },
];

const CHEMISTRY: Template[] = [
  { label: '→', insert: '$\\rightarrow$' },
  { label: '⇌', insert: '$\\rightleftharpoons$' },
  { label: 'H₂O', insert: '$H_{2}O$' },
  { label: 'x²⁺', insert: '$^{2+}$' },
  { label: 'x²⁻', insert: '$^{2-}$' },
  { label: '↑ ↓', insert: '$\\uparrow \\downarrow$' },
  { label: 'Δ (heat)', insert: '$\\Delta$' },
  { label: 'mol/L', insert: '$\\frac{mol}{L}$' },
];

const GROUPS: Record<string, Template[]> = { Math: MATH, Physics: PHYSICS, Chemistry: CHEMISTRY };

/**
 * Inserts LaTeX snippets (wrapped in $...$) at the cursor position of a
 * given textarea/input by id. Templates insert a full pattern (e.g.
 * \frac{a}{b}) rather than positioning the cursor inside the braces —
 * teachers edit the placeholder letters directly, which is simpler to
 * build and still fast to use for the common cases.
 */
export default function EquationToolbar({ targetId }: { targetId: string }) {
  const [activeGroup, setActiveGroup] = useState<'Math' | 'Physics' | 'Chemistry'>('Math');

  function insert(snippet: string) {
    const el = document.getElementById(targetId) as HTMLInputElement | HTMLTextAreaElement | null;
    if (!el) return;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const newValue = el.value.slice(0, start) + ` ${snippet} ` + el.value.slice(end);

    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
    nativeSetter?.call(el, newValue);
    el.dispatchEvent(new Event('input', { bubbles: true }));

    requestAnimationFrame(() => {
      el.focus();
      const pos = start + snippet.length + 2;
      el.setSelectionRange(pos, pos);
    });
  }

  return (
    <div className="rounded bg-black/5 p-1.5">
      <div className="mb-1 flex gap-1">
        {(Object.keys(GROUPS) as (keyof typeof GROUPS)[]).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setActiveGroup(g as any)}
            className={`rounded px-2 py-0.5 text-xs ${activeGroup === g ? 'bg-brand-blue text-white' : 'bg-white text-ink/60'}`}
          >
            {g}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        {GROUPS[activeGroup].map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => insert(t.insert)}
            title={t.insert}
            className="rounded bg-white px-2 py-1 text-xs shadow-sm hover:bg-brand-blue hover:text-white"
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}