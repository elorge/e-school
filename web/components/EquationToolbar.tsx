// web/components/EquationToolbar.tsx
'use client';

import { useState } from 'react';

interface Template {
  label: string;
  insert: string;
  /** Literal placeholder characters inside `insert`, in the order a person should fill them in. Omit for fixed formulas with nothing to fill in. */
  placeholders?: string[];
}

const BASIC: Template[] = [
  { label: 'x', insert: '$x$' },
  { label: 'y', insert: '$y$' },
  { label: 'n', insert: '$n$' },
  { label: '=', insert: '$=$' },
  { label: '+', insert: '$+$' },
  { label: '−', insert: '$-$' },
  { label: '×', insert: '$\\times$' },
  { label: '÷', insert: '$\\div$' },
  { label: '(', insert: '$($' },
  { label: ')', insert: '$)$' },
  { label: '±', insert: '$\\pm$' },
  { label: '≠', insert: '$\\neq$' },
];

const ALGEBRA: Template[] = [
  { label: 'a/b', insert: '$\\frac{a}{b}$', placeholders: ['a', 'b'] },
  { label: 'x²', insert: '$x^{2}$' },
  { label: 'x³', insert: '$x^{3}$' },
  { label: 'xʸ', insert: '$x^{y}$' },
  { label: 'xₙ', insert: '$x_{n}$', placeholders: ['n'] },
  { label: '√x', insert: '$\\sqrt{x}$', placeholders: ['x'] },
  { label: 'ⁿ√x', insert: '$\\sqrt[n]{x}$', placeholders: ['n', 'x'] },
  { label: '|x|', insert: '$|x|$', placeholders: ['x'] },
  { label: 'log', insert: '$\\log$' },
  { label: 'log_b', insert: '$\\log_{b}$', placeholders: ['b'] },
  { label: 'ln', insert: '$\\ln$' },
  { label: '%', insert: '$\\%$' },
  { label: '≤ ≥', insert: '$\\leq \\geq$' },
];

const CALCULUS: Template[] = [
  { label: 'd/dx', insert: '$\\frac{d}{dx}$' },
  { label: '∂/∂x', insert: '$\\frac{\\partial}{\\partial x}$' },
  { label: 'd²y/dx²', insert: '$\\frac{d^{2}y}{dx^{2}}$' },
  { label: '∫', insert: '$\\int$' },
  { label: '∫ab', insert: '$\\int_{a}^{b}$', placeholders: ['a', 'b'] },
  { label: '∬', insert: '$\\iint$' },
  { label: '∮', insert: '$\\oint$' },
  { label: 'lim', insert: '$\\lim_{x \\to a}$', placeholders: ['x', 'a'] },
  { label: 'Σ', insert: '$\\sum_{i=1}^{n}$', placeholders: ['i', 'n'] },
  { label: 'Π', insert: '$\\prod_{i=1}^{n}$', placeholders: ['i', 'n'] },
  { label: '∇', insert: '$\\nabla$' },
  { label: '∞', insert: '$\\infty$' },
];

const TRIGONOMETRY: Template[] = [
  { label: 'sin', insert: '$\\sin$' },
  { label: 'cos', insert: '$\\cos$' },
  { label: 'tan', insert: '$\\tan$' },
  { label: 'csc', insert: '$\\csc$' },
  { label: 'sec', insert: '$\\sec$' },
  { label: 'cot', insert: '$\\cot$' },
  { label: 'sin⁻¹', insert: '$\\sin^{-1}$' },
  { label: 'cos⁻¹', insert: '$\\cos^{-1}$' },
  { label: 'tan⁻¹', insert: '$\\tan^{-1}$' },
  { label: 'sinh', insert: '$\\sinh$' },
  { label: 'cosh', insert: '$\\cosh$' },
  { label: 'tanh', insert: '$\\tanh$' },
  { label: '∠', insert: '$\\angle$' },
];

const GEOMETRY: Template[] = [
  { label: '∠', insert: '$\\angle$' },
  { label: '∥', insert: '$\\parallel$' },
  { label: '⊥', insert: '$\\perp$' },
  { label: '△', insert: '$\\triangle$' },
  { label: '≅', insert: '$\\cong$' },
  { label: '∼', insert: '$\\sim$' },
  { label: '°', insert: '$^{\\circ}$' },
  { label: 'πr²', insert: '$\\pi r^{2}$' },
  { label: '2πr', insert: '$2\\pi r$' },
  { label: '⊙', insert: '$\\odot$' },
];

const SETS_LOGIC: Template[] = [
  { label: '∈', insert: '$\\in$' },
  { label: '∉', insert: '$\\notin$' },
  { label: '⊂', insert: '$\\subset$' },
  { label: '⊆', insert: '$\\subseteq$' },
  { label: '∪', insert: '$\\cup$' },
  { label: '∩', insert: '$\\cap$' },
  { label: '∅', insert: '$\\emptyset$' },
  { label: '∀', insert: '$\\forall$' },
  { label: '∃', insert: '$\\exists$' },
  { label: '¬', insert: '$\\neg$' },
  { label: '∧', insert: '$\\land$' },
  { label: '∨', insert: '$\\lor$' },
  { label: '⇒', insert: '$\\Rightarrow$' },
  { label: '⇔', insert: '$\\Leftrightarrow$' },
  { label: '∴', insert: '$\\therefore$' },
  { label: '∵', insert: '$\\because$' },
];

const LINEAR_ALGEBRA: Template[] = [
  {
    label: '[a b; c d]',
    insert: '$\\begin{pmatrix} {a} & {b} \\\\ {c} & {d} \\end{pmatrix}$',
    placeholders: ['a', 'b', 'c', 'd'],
  },
  { label: 'det(A)', insert: '$\\det(A)$' },
  { label: 'Aᵀ', insert: '$A^{T}$' },
  { label: 'A⁻¹', insert: '$A^{-1}$' },
  { label: 'a·b', insert: '$\\vec{a} \\cdot \\vec{b}$' },
  { label: 'a×b', insert: '$\\vec{a} \\times \\vec{b}$' },
  { label: '|A|', insert: '$|A|$' },
];

const STATISTICS: Template[] = [
  { label: 'x̄', insert: '$\\bar{x}$' },
  { label: 'σ²', insert: '$\\sigma^{2}$' },
  { label: 'nCr', insert: '$\\binom{n}{r}$', placeholders: ['n', 'r'] },
  { label: 'nPr', insert: '$^{n}P_{r}$', placeholders: ['n', 'r'] },
  { label: 'n!', insert: '$n!$' },
  { label: 'P(A)', insert: '$P(A)$' },
  { label: 'P(A|B)', insert: '$P(A \\mid B)$' },
];

const GREEK: Template[] = [
  { label: 'α', insert: '$\\alpha$' },
  { label: 'β', insert: '$\\beta$' },
  { label: 'γ', insert: '$\\gamma$' },
  { label: 'δ', insert: '$\\delta$' },
  { label: 'ε', insert: '$\\epsilon$' },
  { label: 'ζ', insert: '$\\zeta$' },
  { label: 'η', insert: '$\\eta$' },
  { label: 'θ', insert: '$\\theta$' },
  { label: 'ι', insert: '$\\iota$' },
  { label: 'κ', insert: '$\\kappa$' },
  { label: 'λ', insert: '$\\lambda$' },
  { label: 'μ', insert: '$\\mu$' },
  { label: 'ν', insert: '$\\nu$' },
  { label: 'ξ', insert: '$\\xi$' },
  { label: 'π', insert: '$\\pi$' },
  { label: 'ρ', insert: '$\\rho$' },
  { label: 'σ', insert: '$\\sigma$' },
  { label: 'τ', insert: '$\\tau$' },
  { label: 'υ', insert: '$\\upsilon$' },
  { label: 'φ', insert: '$\\phi$' },
  { label: 'χ', insert: '$\\chi$' },
  { label: 'ψ', insert: '$\\psi$' },
  { label: 'ω', insert: '$\\omega$' },
  { label: 'Γ', insert: '$\\Gamma$' },
  { label: 'Δ', insert: '$\\Delta$' },
  { label: 'Θ', insert: '$\\Theta$' },
  { label: 'Λ', insert: '$\\Lambda$' },
  { label: 'Ξ', insert: '$\\Xi$' },
  { label: 'Π', insert: '$\\Pi$' },
  { label: 'Σ', insert: '$\\Sigma$' },
  { label: 'Φ', insert: '$\\Phi$' },
  { label: 'Ψ', insert: '$\\Psi$' },
  { label: 'Ω', insert: '$\\Omega$' },
];

const ARROWS: Template[] = [
  { label: '→', insert: '$\\rightarrow$' },
  { label: '←', insert: '$\\leftarrow$' },
  { label: '↔', insert: '$\\leftrightarrow$' },
  { label: '⇒', insert: '$\\Rightarrow$' },
  { label: '⇐', insert: '$\\Leftarrow$' },
  { label: '⇔', insert: '$\\Leftrightarrow$' },
  { label: '≤', insert: '$\\leq$' },
  { label: '≥', insert: '$\\geq$' },
  { label: '≠', insert: '$\\neq$' },
  { label: '≈', insert: '$\\approx$' },
  { label: '≡', insert: '$\\equiv$' },
  { label: '∝', insert: '$\\propto$' },
  { label: '↑', insert: '$\\uparrow$' },
  { label: '↓', insert: '$\\downarrow$' },
];

const NUMBER_SETS: Template[] = [
  { label: 'ℕ', insert: '$\\mathbb{N}$' },
  { label: 'ℤ', insert: '$\\mathbb{Z}$' },
  { label: 'ℚ', insert: '$\\mathbb{Q}$' },
  { label: 'ℝ', insert: '$\\mathbb{R}$' },
  { label: 'ℂ', insert: '$\\mathbb{C}$' },
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
  { label: 'ħ', insert: '$\\hbar$' },
  { label: 'E=mc²', insert: '$E = mc^{2}$' },
  { label: 'p=mv', insert: '$p = mv$' },
  { label: 'E⃗', insert: '$\\vec{E}$' },
  { label: 'B⃗', insert: '$\\vec{B}$' },
  { label: 'Ω', insert: '$\\Omega$' },
  { label: 's⁻¹', insert: '$s^{-1}$' },
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
  { label: '[A]', insert: '$[A]$' },
  { label: 'Kc', insert: '$K_{c}$' },
  { label: 'Ka', insert: '$K_{a}$' },
  { label: 'Kw', insert: '$K_{w}$' },
  { label: 'ΔH', insert: '$\\Delta H$' },
  { label: 'ΔG', insert: '$\\Delta G$' },
  { label: 'ΔS', insert: '$\\Delta S$' },
  { label: 'pH', insert: '$pH$' },
  { label: 'pOH', insert: '$pOH$' },
  { label: 'ⁿ⁺', insert: '$^{n+}$', placeholders: ['n'] },
  { label: 'ⁿ⁻', insert: '$^{n-}$', placeholders: ['n'] },
];

const GROUPS: Record<string, Template[]> = {
  Basic: BASIC,
  Algebra: ALGEBRA,
  Calculus: CALCULUS,
  Trigonometry: TRIGONOMETRY,
  Geometry: GEOMETRY,
  'Sets & Logic': SETS_LOGIC,
  'Linear Algebra': LINEAR_ALGEBRA,
  Statistics: STATISTICS,
  Greek: GREEK,
  'Arrows & Relations': ARROWS,
  'Number Sets': NUMBER_SETS,
  Physics: PHYSICS,
  Chemistry: CHEMISTRY,
};

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
 *
 * Covers Basic, Algebra, Calculus, Trigonometry, Geometry, Sets &
 * Logic, Linear Algebra, Statistics, Greek letters, Arrows &
 * Relations, Number Sets, Physics, and Chemistry — the practical
 * curriculum-wide set, not a claim to every symbol that has ever
 * existed (that set is genuinely unbounded).
 */
export default function EquationToolbar({ targetId }: { targetId: string }) {
  const [activeGroup, setActiveGroup] = useState<keyof typeof GROUPS>('Basic');
  const [activeEdit, setActiveEdit] = useState<ActiveEdit | null>(null);

  function getEl() {
    return document.getElementById(targetId) as HTMLInputElement | HTMLTextAreaElement | null;
  }

  // The native value-setter lives on a different prototype for <input>
  // vs <textarea> — grabbing the wrong one and calling it on the other
  // element type throws "Illegal invocation", since React's tracked
  // setter needs to be invoked against the exact element type it was
  // read from.
  function getNativeValueSetter(el: HTMLInputElement | HTMLTextAreaElement) {
    const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    return Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  }

  // Prefers a brace- or bracket-wrapped match ({a}, [n]) over a bare
  // character search. A bare search for a lone letter like 'a' can
  // accidentally land inside the LaTeX command name itself (the 'a' in
  // \frac, the 'n' in \binom) rather than the actual blank — wrapping
  // the intended blank in its own group sidesteps that collision
  // entirely, while the bare-character fallback keeps older templates
  // that don't wrap their placeholder working exactly as before.
  function selectPlaceholder(el: HTMLInputElement | HTMLTextAreaElement, snippetStart: number, char: string, fromIndex: number) {
    const braced = el.value.indexOf(`{${char}}`, fromIndex);
    const bracketed = el.value.indexOf(`[${char}]`, fromIndex);
    let idx: number;
    if (braced !== -1) idx = braced + 1;
    else if (bracketed !== -1) idx = bracketed + 1;
    else {
      const bare = el.value.indexOf(char, fromIndex);
      if (bare === -1) return null;
      idx = bare;
    }
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

    const nativeSetter = getNativeValueSetter(el);
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
      <div className="mb-1 flex items-center gap-1 overflow-x-auto">
        {(Object.keys(GROUPS) as (keyof typeof GROUPS)[]).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setActiveGroup(g)}
            className={`shrink-0 rounded px-2 py-0.5 text-xs ${activeGroup === g ? 'bg-brand-blue text-white' : 'bg-white text-ink/60'}`}
          >
            {g}
          </button>
        ))}
        {activeEdit && activeEdit.currentIndex < activeEdit.placeholderChars.length - 1 && (
          <button
            type="button"
            onClick={goToNextBlank}
            className="ml-auto shrink-0 rounded bg-amber px-2 py-0.5 text-xs font-medium text-white"
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