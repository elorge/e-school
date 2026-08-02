// web/components/CodeQuestionRunner.tsx
'use client';

import { useRef, useState } from 'react';
import { Play, Check, X, Code2, Eye } from 'lucide-react';
import type { SavedCodeAnswer, CodeAssertionResult } from '@/lib/endpoints/cbt';

interface CodeQuestion {
  id: string;
  questionText: string;
  starterHtml: string | null;
  starterCss: string | null;
  starterJs: string | null;
  testAssertions: { description: string; assertion: string }[] | null;
}

/**
 * Live HTML/CSS/JS editor with a real-time preview and a "Run tests"
 * button. Everything executes inside a sandboxed iframe — `allow-scripts`
 * only, no `allow-same-origin` — student code can never reach the parent
 * page or any sensitive data.
 */
export default function CodeQuestionRunner({
  question,
  savedResult,
  onResult,
}: {
  question: CodeQuestion;
  savedResult?: number | SavedCodeAnswer;
  onResult: (result: SavedCodeAnswer) => void;
}) {
  const saved = savedResult && typeof savedResult === 'object' ? savedResult : null;
  const [html, setHtml] = useState(saved?.html ?? question.starterHtml ?? '');
  const [css, setCss] = useState(saved?.css ?? question.starterCss ?? '');
  const [js, setJs] = useState(saved?.js ?? question.starterJs ?? '');
  const [results, setResults] = useState<CodeAssertionResult[] | null>(saved?.results ?? null);
  const previewRef = useRef<HTMLIFrameElement>(null);

  function refreshPreview() {
    const doc = previewRef.current?.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(`<style>${css}</style>${html}<script>${js}<\/script>`);
    doc.close();
  }

  function runTests() {
    refreshPreview();
    const iframe = previewRef.current;
    if (!iframe?.contentWindow) return;
    const assertions = question.testAssertions ?? [];
    const outcomes: CodeAssertionResult[] = assertions.map((a) => {
      try {
        // eslint-disable-next-line no-eval
        return { description: a.description, passed: !!(iframe.contentWindow as any).eval(a.assertion) };
      } catch {
        return { description: a.description, passed: false };
      }
    });
    setResults(outcomes);
    const passedCount = outcomes.filter((o) => o.passed).length;
    onResult({ passedCount, totalCount: assertions.length, html, css, js, results: outcomes });
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="bg-ink px-4 py-3 text-white">
        <p className="flex items-center gap-2 font-medium"><Code2 size={16} /> Coding Challenge</p>
        <p className="mt-1 text-sm text-white/70">{question.questionText}</p>
      </div>
      <p className="bg-amber/10 px-4 py-2 text-xs text-amber">
        Write your HTML, CSS, and JavaScript below. Click <strong>Run tests</strong> to check your work — you can
        run it as many times as you like before submitting the whole test.
      </p>

      <div className="grid divide-x sm:grid-cols-3">
        {[
          { label: 'HTML', value: html, set: setHtml, color: 'text-orange-600' },
          { label: 'CSS', value: css, set: setCss, color: 'text-blue-600' },
          { label: 'JavaScript', value: js, set: setJs, color: 'text-amber' },
        ].map((panel) => (
          <div key={panel.label} className="flex flex-col">
            <p className={`border-b bg-black/5 px-3 py-1.5 text-xs font-semibold ${panel.color}`}>{panel.label}</p>
            <textarea
              className="min-h-[140px] flex-1 resize-none p-3 font-mono text-xs focus:outline-none"
              value={panel.value}
              onChange={(e) => panel.set(e.target.value)}
              onBlur={refreshPreview}
              spellCheck={false}
            />
          </div>
        ))}
      </div>

      <div className="border-t p-4">
        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-ink/50"><Eye size={13} /> LIVE PREVIEW</p>
        <iframe ref={previewRef} sandbox="allow-scripts" className="h-40 w-full rounded border bg-white" title="Preview" />
      </div>

      <div className="flex items-center gap-3 border-t bg-black/5 px-4 py-3">
        <button onClick={runTests} className="btn-primary flex items-center gap-1.5 text-sm">
          <Play size={14} /> Run tests
        </button>
        {results && (
          <span className={`text-sm font-medium ${results.every((r) => r.passed) ? 'text-brand-green' : 'text-ink/60'}`}>
            {results.filter((r) => r.passed).length} / {results.length} passing
          </span>
        )}
      </div>

      {results && (
        <div className="flex flex-col gap-1.5 border-t px-4 py-3">
          {results.map((r, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {r.passed ? <Check size={14} className="text-brand-green" /> : <X size={14} className="text-red-500" />}
              <span className={r.passed ? 'text-ink/70' : 'text-ink/50'}>{r.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}