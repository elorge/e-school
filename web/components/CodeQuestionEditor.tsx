// web/components/CodeQuestionEditor.tsx
'use client';

import { useState } from 'react';
import { Plus, Trash2, Play } from 'lucide-react';

interface Assertion {
  description: string;
  assertion: string;
}

export default function CodeQuestionEditor({
  onAdd,
}: {
  onAdd: (q: { starterHtml: string; starterCss: string; starterJs: string; testAssertions: Assertion[]; points: number; questionText: string }) => void;
}) {
  const [questionText, setQuestionText] = useState('');
  const [starterHtml, setStarterHtml] = useState('<h1>Hello</h1>');
  const [starterCss, setStarterCss] = useState('h1 { color: blue; }');
  const [starterJs, setStarterJs] = useState('');
  const [assertions, setAssertions] = useState<Assertion[]>([
    { description: 'h1 exists', assertion: "document.querySelector('h1') !== null" },
  ]);
  const [points, setPoints] = useState(5);
  const [previewResult, setPreviewResult] = useState<string | null>(null);

  function updateAssertion(i: number, field: keyof Assertion, value: string) {
    setAssertions((a) => a.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }

  /**
   * Runs the staff member's own assertions against their own starter
   * code — this is a self-test, not third-party/student content, so
   * `allow-same-origin` is added alongside `allow-scripts`. Without it,
   * the frame gets a unique opaque origin and `contentDocument`/
   * `contentWindow.eval` are blocked entirely (returns null / throws),
   * which is what was crashing this button. Using `srcdoc` + waiting
   * for the `load` event (instead of `document.write` right after
   * `appendChild`) avoids racing the frame's own initialization, which
   * is flaky across browsers even when origin isn't the issue.
   */
  function runPreview() {
    const iframe = document.createElement('iframe');
    iframe.sandbox.add('allow-scripts', 'allow-same-origin');
    iframe.style.display = 'none';

    iframe.addEventListener(
      'load',
      () => {
        let passed = 0;
        for (const a of assertions) {
          try {
            // eslint-disable-next-line no-eval
            if ((iframe.contentWindow as any)?.eval(a.assertion)) passed++;
          } catch {
            // treated as failed, not a crash
          }
        }
        setPreviewResult(
          `${passed} / ${assertions.length} assertions pass against the starter code (expected to be low/zero — this is the unsolved starting point).`,
        );
        document.body.removeChild(iframe);
      },
      { once: true },
    );

    document.body.appendChild(iframe);
    iframe.srcdoc = `<style>${starterCss}</style>${starterHtml}<script>${starterJs}<\/script>`;
  }

  function handleSubmit() {
    onAdd({ questionText, starterHtml, starterCss, starterJs, testAssertions: assertions, points });
    setQuestionText('');
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3">
      <input
        className="rounded border px-2 py-1.5 text-sm"
        placeholder="Instructions for the student (e.g. 'Make the heading red and add a button that shows an alert on click')"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
      />
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-xs">
          Starter HTML
          <textarea className="min-h-[80px] rounded border p-2 font-mono text-xs" value={starterHtml} onChange={(e) => setStarterHtml(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Starter CSS
          <textarea className="min-h-[80px] rounded border p-2 font-mono text-xs" value={starterCss} onChange={(e) => setStarterCss(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Starter JS
          <textarea className="min-h-[80px] rounded border p-2 font-mono text-xs" value={starterJs} onChange={(e) => setStarterJs(e.target.value)} />
        </label>
      </div>

      <p className="text-xs font-medium">Test assertions (JS — must return true/false)</p>
      {assertions.map((a, i) => (
        <div key={i} className="flex items-center gap-2">
          <input className="w-40 rounded border px-2 py-1 text-xs" placeholder="Description" value={a.description} onChange={(e) => updateAssertion(i, 'description', e.target.value)} />
          <input
            className="flex-1 rounded border px-2 py-1 font-mono text-xs"
            placeholder="document.querySelector('h1').style.color === 'red'"
            value={a.assertion}
            onChange={(e) => updateAssertion(i, 'assertion', e.target.value)}
          />
          <button onClick={() => setAssertions((a) => a.filter((_, idx) => idx !== i))} className="text-ink/30 hover:text-red-600">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button onClick={() => setAssertions((a) => [...a, { description: '', assertion: '' }])} className="btn-secondary flex w-fit items-center gap-1 text-xs">
        <Plus size={12} /> Add assertion
      </button>

      <div className="flex items-center gap-3">
        <button onClick={runPreview} className="btn-secondary flex items-center gap-1.5 text-xs">
          <Play size={13} /> Test assertions against starter code
        </button>
        {previewResult && <p className="text-xs text-ink/60">{previewResult}</p>}
      </div>

      <label className="flex w-24 flex-col gap-1 text-xs">
        Points
        <input className="rounded border px-2 py-1" type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} />
      </label>

      <button onClick={handleSubmit} className="btn-primary w-fit">Add code question</button>
    </div>
  );
}