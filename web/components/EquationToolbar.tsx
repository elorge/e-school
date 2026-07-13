// web/components/EquationToolbar.tsx
'use client';

import { useState } from 'react';

interface Template {
  label: string;
  insert: string;
  /** Literal placeholder characters inside `insert`, in the order a person should fill them in. Omit for fixed formulas with nothing to fill in. */
  placeholders?: string[];
}

const MATH: Template[] = [
  { label: 'a/b', insert: '$\\frac{a}{b}$', placeholders: ['a', 'b'] },
  { label: 'x²', insert: '$x^{2}$' },
  { label: 'xₙ', insert: '$x_{n}$', placeholders: ['n'] },
  { label: '√x', insert: '$\\sqrt{x}$', placeholders: ['x'] },
  { label: 'ⁿ√x', insert: '$\\sqrt[n]{x}$', placeholders: ['n', 'x'] },
  { label: 'Σ', insert: '$\\sum_{i=1}^{n}$', placeholders: ['i', 'n'] },
  { label: '∫', insert: '$\\int_{a}^{b}$', placeholders: ['a', 'b'] },
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
  { label: '×10ⁿ', insert: '$\\times 10^{n}$', placeholders: ['n'] },
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

interface ActiveEdit {
  snippetStart: number;
  snippetEnd: number;
  placeholderChars: string[];
  currentIndex: number;
}

/**
 * Inserts LaTeX snippets at the cursor. For templates with variables
 * (a/b, √x, Σ), the first placeholder is auto-selected the instant it's
 * inserted, so typing immediately overwrites it — no manual clicking
 * into \frac{...}{...} to find the right spot. "Next blank ▸" jumps to
 * the next one for templates with more than one variable.
 */
export default function EquationToolbar({ targetId }: { targetId: string }) {
  const [activeGroup, setActiveGroup] = useState<'Math' | 'Physics' | 'Chemistry'>('Math');
  const [activeEdit, setActiveEdit] = useState<ActiveEdit | null>(null);

  function getEl() {
    return document.getElementById(targetId) as HTMLInputElement | HTMLTextAreaElement | null;
  }

  function selectPlaceholder(el: HTMLInputElement | HTMLTextAreaElement, snippetStart: number, char: string, fromIndex: number) {
    const idx = el.value.indexOf(char, fromIndex);
    if (idx === -1) return null;
    el.focus();
    el.setSelectionRange(idx, idx + 1);
    return idx;
  }

  function insert(template: Template) {
    const el = getEl();
    if (!el) return;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const snippet = ` ${template.insert} `;
    const newValue = el.value.slice(0, start) + snippet + el.value.slice(end);

    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
    nativeSetter?.call(el, newValue);
    el.dispatchEvent(new Event('input', { bubbles: true }));

    const snippetStart = start + 1; // +1 skips the leading padding space
    const snippetEnd = snippetStart + template.insert.length;

    requestAnimationFrame(() => {
      if (template.placeholders && template.placeholders.length > 0) {
        const firstChar = template.placeholders[0];
        const foundAt = selectPlaceholder(el, snippetStart, firstChar, snippetStart);
        setActiveEdit({
          snippetStart,
          snippetEnd,
          placeholderChars: template.placeholders,
          currentIndex: 0,
        });
        if (foundAt === null) setActiveEdit(null);
      } else {
        const pos = snippetEnd + 1;
        el.focus();
        el.setSelectionRange(pos, pos);
        setActiveEdit(null);
      }
    });
  }

  function goToNextBlank() {
    const el = getEl();
    if (!el || !activeEdit) return;
    const nextIndex = activeEdit.currentIndex + 1;
    if (nextIndex >= activeEdit.placeholderChars.length) {
      setActiveEdit(null);
      return;
    }
    const nextChar = activeEdit.placeholderChars[nextIndex];
    const foundAt = selectPlaceholder(el, activeEdit.snippetStart, nextChar, activeEdit.snippetStart);
    if (foundAt === null) {
      setActiveEdit(null);
      return;
    }
    setActiveEdit({ ...activeEdit, currentIndex: nextIndex });
  }

  return (
    <div className="rounded bg-black/5 p-1.5">
      <div className="mb-1 flex items-center gap-1">
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
        {activeEdit && activeEdit.currentIndex < activeEdit.placeholderChars.length - 1 && (
          <button
            type="button"
            onClick={goToNextBlank}
            className="ml-auto rounded bg-amber px-2 py-0.5 text-xs font-medium text-white"
          >
            Next blank ▸
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {GROUPS[activeGroup].map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => insert(t)}
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