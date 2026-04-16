'use client';

import { useEffect, useState, type ReactElement } from 'react';

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface AgentHighlightProps {
  selector: string | null;
  label?: string;
}

export function AgentHighlight({ selector, label }: AgentHighlightProps): ReactElement | null {
  const [rect, setRect] = useState<HighlightRect | null>(null);

  useEffect(() => {
    if (!selector) {
      setRect(null);
      return;
    }

    function update(): void {
      const el = document.querySelector(selector!);
      if (!el) { setRect(null); return; }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    update();
    const interval = setInterval(update, 300);
    return () => clearInterval(interval);
  }, [selector]);

  if (!rect) return null;

  return (
    <>
      {/* Dim overlay with cutout */}
      <div className="pointer-events-none fixed inset-0 z-[60]">
        {/* Pulsing border */}
        <div
          className="absolute rounded-lg border-2 border-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.15)] transition-all duration-300"
          style={{
            top: rect.top - 4,
            left: rect.left - 4,
            width: rect.width + 8,
            height: rect.height + 8,
            animation: 'agent-pulse 1.5s ease-in-out infinite',
          }}
        />

        {/* Agent cursor */}
        <div
          className="absolute transition-all duration-500"
          style={{ top: rect.top + rect.height / 2 - 12, left: rect.left + rect.width + 12 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5 3L19 12L12 13L9 20L5 3Z" fill="#7C3AED" stroke="#7C3AED" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Label tooltip */}
        {label && (
          <div
            className="absolute flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-[12px] font-semibold text-white shadow-lg transition-all duration-300"
            style={{ top: rect.top - 36, left: rect.left }}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            {label}
          </div>
        )}
      </div>

      <style>{`
        @keyframes agent-pulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(59,130,246,0.15); }
          50% { box-shadow: 0 0 0 8px rgba(59,130,246,0.25), 0 0 20px rgba(59,130,246,0.1); }
        }
      `}</style>
    </>
  );
}
