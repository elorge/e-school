// web/components/ShapeToolbar.tsx
'use client';

import { useState } from 'react';

interface ShapeParam {
  key: string;
  default: string;
}

interface ShapeTemplate {
  label: string;
  type: string;
  params: ShapeParam[];
}

const TRIANGLES: ShapeTemplate[] = [
  {
    label: 'Triangle',
    type: 'triangle',
    params: [
      { key: 'a', default: '5' },
      { key: 'b', default: '6' },
      { key: 'c', default: '7' },
    ],
  },
  {
    label: 'Right triangle',
    type: 'right-triangle',
    params: [
      { key: 'base', default: '8' },
      { key: 'height', default: '6' },
      { key: 'hyp', default: '10' },
    ],
  },
];

const QUADRILATERALS: ShapeTemplate[] = [
  { label: 'Square', type: 'square', params: [{ key: 's', default: '6' }] },
  {
    label: 'Rectangle',
    type: 'rectangle',
    params: [
      { key: 'w', default: '8' },
      { key: 'h', default: '5' },
    ],
  },
  {
    label: 'Parallelogram',
    type: 'parallelogram',
    params: [
      { key: 'a', default: '8' },
      { key: 'b', default: '5' },
    ],
  },
  {
    label: 'Trapezium',
    type: 'trapezium',
    params: [
      { key: 'a', default: '6' },
      { key: 'b', default: '10' },
      { key: 'h', default: '4' },
    ],
  },
];

const CIRCLES: ShapeTemplate[] = [
  { label: 'Circle', type: 'circle', params: [{ key: 'r', default: '7' }] },
  {
    label: 'Sector',
    type: 'sector',
    params: [
      { key: 'r', default: '7' },
      { key: 'deg', default: '60' },
    ],
  },
];

const ANGLES: ShapeTemplate[] = [{ label: 'Angle', type: 'angle', params: [{ key: 'deg', default: '40' }] }];

const SOLIDS: ShapeTemplate[] = [
  { label: 'Cube', type: 'cube', params: [{ key: 's', default: '6' }] },
  {
    label: 'Cuboid',
    type: 'cuboid',
    params: [
      { key: 'l', default: '8' },
      { key: 'w', default: '5' },
      { key: 'h', default: '4' },
    ],
  },
];

const GROUPS: Record<string, ShapeTemplate[]> = {
  Triangles: TRIANGLES,
  Quadrilaterals: QUADRILATERALS,
  Circles: CIRCLES,
  Angles: ANGLES,
  Solids: SOLIDS,
};

function buildCode(t: ShapeTemplate) {
  const paramsStr = t.params.map((p) => `${p.key}=${p.default}`).join('|');
  return `[[shape:${t.type}${paramsStr ? '|' + paramsStr : ''}]]`;
}

interface ActiveEdit {
  snippetStart: number;
  template: ShapeTemplate;
  currentIndex: number;
}

/**
 * Inserts a preset geometry shape as a compact text code — e.g.
 * `[[shape:triangle|a=5|b=6|c=7]]` — rather than an uploaded image.
 * That keeps a shape question exactly as offline-safe and printable as
 * every other question: no file to sync to a student's device before
 * a test, no asset to bundle into the PDF paper.
 *
 * Right after insertion the first number (e.g. the "5" in a=5) is
 * auto-selected so a teacher can immediately type over it with the
 * real side length; "Next param ▸" steps through the rest.
 */
export default function ShapeToolbar({ targetId }: { targetId: string }) {
  const [activeGroup, setActiveGroup] = useState<keyof typeof GROUPS>('Triangles');
  const [activeEdit, setActiveEdit] = useState<ActiveEdit | null>(null);

  function getEl() {
    return document.getElementById(targetId) as HTMLInputElement | HTMLTextAreaElement | null;
  }

  function getNativeValueSetter(el: HTMLInputElement | HTMLTextAreaElement) {
    const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    return Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  }

  // Each param is located by its whole "key=value" token (e.g. "a=5"),
  // not the bare value alone — since the key prefix makes every param
  // unique regardless of whether two params happen to share the same
  // default number, there's no risk of selecting the wrong one.
  function selectParam(el: HTMLInputElement | HTMLTextAreaElement, param: ShapeParam, fromIndex: number) {
    const token = `${param.key}=${param.default}`;
    const idx = el.value.indexOf(token, fromIndex);
    if (idx === -1) return null;
    const valueStart = idx + param.key.length + 1; // +1 skips the '='
    el.focus();
    el.setSelectionRange(valueStart, valueStart + param.default.length);
    return valueStart;
  }

  function insert(template: ShapeTemplate) {
    const el = getEl();
    if (!el) return;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const code = buildCode(template);
    const snippet = ` ${code} `;
    const newValue = el.value.slice(0, start) + snippet + el.value.slice(end);

    const nativeSetter = getNativeValueSetter(el);
    nativeSetter?.call(el, newValue);
    el.dispatchEvent(new Event('input', { bubbles: true }));

    const snippetStart = start + 1; // +1 skips the leading padding space

    requestAnimationFrame(() => {
      if (template.params.length > 0) {
        const found = selectParam(el, template.params[0], snippetStart);
        setActiveEdit({ snippetStart, template, currentIndex: 0 });
        if (found === null) setActiveEdit(null);
      } else {
        const pos = snippetStart + code.length + 1;
        el.focus();
        el.setSelectionRange(pos, pos);
        setActiveEdit(null);
      }
    });
  }

  function goToNextParam() {
    const el = getEl();
    if (!el || !activeEdit) return;
    const nextIndex = activeEdit.currentIndex + 1;
    if (nextIndex >= activeEdit.template.params.length) {
      setActiveEdit(null);
      return;
    }
    const found = selectParam(el, activeEdit.template.params[nextIndex], activeEdit.snippetStart);
    if (found === null) {
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
            className={`shrink-0 rounded px-2 py-0.5 text-xs ${activeGroup === g ? 'bg-brand-green text-white' : 'bg-white text-ink/60'}`}
          >
            {g}
          </button>
        ))}
        {activeEdit && activeEdit.currentIndex < activeEdit.template.params.length - 1 && (
          <button
            type="button"
            onClick={goToNextParam}
            className="ml-auto shrink-0 rounded bg-amber px-2 py-0.5 text-xs font-medium text-white"
          >
            Next param ▸
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {GROUPS[activeGroup].map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => insert(t)}
            title={buildCode(t)}
            className="rounded bg-white px-2 py-1 text-xs shadow-sm hover:bg-brand-green hover:text-white"
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}