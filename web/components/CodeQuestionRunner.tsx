// web/components/CodeQuestionRunner.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Check, X } from 'lucide-react';

interface CodeQuestion {
  id: string;
  questionText: string;
  starterHtml: string | null;
  starterCss: string | null;
  starterJs: string | null;
  testAssertions: { description: string; assertion: string }[] | null;
}

interface AssertionResult {
  description: string;
  passed: boolean;
}

interface SavedCodeResult {
  html?: string;
  css?: string;
  js?: string;
  passedCount?: number;
  totalCount?: number;
  results?: AssertionResult[];
}

export default function CodeQuestionRunner({
  question,
  savedResult,
  onResult,
}: {
  question: CodeQuestion;
  savedResult?: unknown;
  onResult: (result: {
  passedCount: number;
  totalCount: number;
  html: string;
  css: string;
  js: string;
  results: { description: string; passed: boolean }[];
}) => void;
}) {
  const saved = savedResult as SavedCodeResult | undefined;

  const [html, setHtml] = useState(saved?.html ?? question.starterHtml ?? '');
  const [css, setCss] = useState(saved?.css ?? question.starterCss ?? '');
  const [js, setJs] = useState(saved?.js ?? question.starterJs ?? '');
  // Restore the actual per-assertion breakdown, not just the aggregate
  // counts — this is what makes a reload/offline-retry show exactly
  // what the student left behind instead of a vague summary line.
  const [results, setResults] = useState<AssertionResult[] | null>(saved?.results ?? null);
  const previewRef = useRef<HTMLIFrameElement>(null);

  const buildDoc = (includeRunner: boolean) => {
    const assertions = question.testAssertions ?? [];
    const runnerScript = includeRunner
      ? `<script>(function(){
          var outcomes = [];
          var assertions = ${JSON.stringify(assertions)};
          for (var i = 0; i < assertions.length; i++) {
            var passed = false;
            try { passed = !!eval(assertions[i].assertion); } catch (e) { passed = false; }
            outcomes.push({ description: assertions[i].description, passed: passed });
          }
          window.parent.postMessage({ __cbtTestResults: outcomes }, '*');
        })();<\/script>`
      : '';
    return `<style>${css}</style>${html}<script>${js}<\/script>${runnerScript}`;
  };

  const [previewDoc, setPreviewDoc] = useState(() => buildDoc(false));

  function refreshPreview() {
    setPreviewDoc(buildDoc(false));
  }

  function runTests() {
    setPreviewDoc(buildDoc(true));
  }

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.source !== previewRef.current?.contentWindow) return;
      if (!e.data || !Array.isArray(e.data.__cbtTestResults)) return;
      const outcomes = e.data.__cbtTestResults as AssertionResult[];
      setResults(outcomes);
      const passedCount = outcomes.filter((o) => o.passed).length;
      onResult({ passedCount, totalCount: outcomes.length, html, css, js, results: outcomes });
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html, css, js]);

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <p className="font-medium">{question.questionText}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-xs">
          HTML
          <textarea className="min-h-[120px] rounded border p-2 font-mono text-xs" value={html} onChange={(e) => setHtml(e.target.value)} onBlur={refreshPreview} />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          CSS
          <textarea className="min-h-[120px] rounded border p-2 font-mono text-xs" value={css} onChange={(e) => setCss(e.target.value)} onBlur={refreshPreview} />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          JavaScript
          <textarea className="min-h-[120px] rounded border p-2 font-mono text-xs" value={js} onChange={(e) => setJs(e.target.value)} onBlur={refreshPreview} />
        </label>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-ink/50">Live preview</p>
        <iframe
          ref={previewRef}
          sandbox="allow-scripts"
          srcDoc={previewDoc}
          className="h-40 w-full rounded border bg-white"
          title="Preview"
        />
      </div>

      <button onClick={runTests} className="btn-primary flex w-fit items-center gap-1.5 text-sm">
        <Play size={14} /> Run tests
      </button>

      {results && (
        <div className="flex flex-col gap-1">
          {results.map((r, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              {r.passed ? <Check size={13} className="text-brand-green" /> : <X size={13} className="text-red-500" />}
              {r.description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}