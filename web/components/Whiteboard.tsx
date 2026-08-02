// web/components/Whiteboard.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Pencil, Eraser, Trash2, X } from 'lucide-react';

const COLORS = ['#ffffff', '#f08c00', '#1f9d55', '#e03131'];

/**
 * A drawing overlay for Presenter Mode. Two modes:
 * - overlay=true: sits absolutely positioned over the current slide's
 *   content container (not the whole viewport), transparent background,
 *   for annotating directly on top of a diagram, photo, or slide text.
 * - overlay=false (default): the original full-screen blank canvas,
 *   for freeform explanation unrelated to any specific slide.
 * Strokes are kept in memory only — transient by design, same as before.
 */
export default function Whiteboard({ onClose, overlay = false }: { onClose: () => void; overlay?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState(COLORS[0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const resize = () => {
      const ctx = canvas.getContext('2d');
      const prev = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      const rect = overlay ? container.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
      canvas.width = rect.width;
      canvas.height = rect.height;
      if (prev) ctx?.putImageData(prev, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [overlay]);

  function getCtx() {
    return canvasRef.current?.getContext('2d') ?? null;
  }

  function pointerPos(e: React.PointerEvent) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e: React.PointerEvent) {
    isDrawing.current = true;
    const ctx = getCtx();
    if (!ctx) return;
    const { x, y } = pointerPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDrawing.current) return;
    const ctx = getCtx();
    if (!ctx) return;
    const { x, y } = pointerPos(e);
    ctx.lineWidth = tool === 'eraser' ? 24 : 3;
    ctx.lineCap = 'round';
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = color;
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function handlePointerUp() {
    isDrawing.current = false;
  }

  function handleClear() {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  return (
    <div ref={containerRef} className={overlay ? 'absolute inset-0 z-40' : 'fixed inset-0 z-50 bg-black/95'}>
      <canvas
        ref={canvasRef}
        className="h-full w-full touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/10 px-3 py-2 backdrop-blur">
        <button
          onClick={() => setTool('pen')}
          className={`rounded-full p-2 ${tool === 'pen' ? 'bg-brand-blue text-white' : 'text-white/60'}`}
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => setTool('eraser')}
          className={`rounded-full p-2 ${tool === 'eraser' ? 'bg-brand-blue text-white' : 'text-white/60'}`}
        >
          <Eraser size={16} />
        </button>
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => {
              setColor(c);
              setTool('pen');
            }}
            className={`h-6 w-6 rounded-full border-2 ${color === c && tool === 'pen' ? 'border-white' : 'border-transparent'}`}
            style={{ backgroundColor: c }}
          />
        ))}
        <button onClick={handleClear} className="rounded-full p-2 text-white/60">
          <Trash2 size={16} />
        </button>
        <button onClick={onClose} className="rounded-full p-2 text-white/60">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}