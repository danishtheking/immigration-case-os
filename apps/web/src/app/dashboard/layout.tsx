'use client';

import { useState, useEffect, type ReactElement, type ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { CounselAiPanel } from '@/components/ai/counsel-ai-panel';
import { Sparkles } from 'lucide-react';

export default function DashboardLayout({ children }: { children: ReactNode }): ReactElement {
  const [aiOpen, setAiOpen] = useState(false);

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    function handleKey(e: KeyboardEvent): void {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setAiOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <Sidebar />
      <div className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${aiOpen ? 'mr-[420px]' : ''}`}>
        {children}
      </div>

      {/* CounselAI floating toggle */}
      <button
        onClick={() => setAiOpen(!aiOpen)}
        className={`fixed bottom-6 z-50 flex items-center gap-2 rounded-full px-4 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 ${
          aiOpen ? 'right-[440px] bg-zinc-800' : 'right-6 bg-gradient-to-r from-violet-600 to-blue-600'
        }`}
      >
        <Sparkles className="h-4 w-4" />
        <span className="text-[13px]">{aiOpen ? 'Close AI' : 'CounselAI'}</span>
        {!aiOpen && (
          <kbd className="ml-1 rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[10px]">⌘K</kbd>
        )}
      </button>

      <CounselAiPanel open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
