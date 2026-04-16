'use client';

import { useState, useRef, useEffect, useCallback, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import {
  X, Send, Sparkles, CheckCircle2, Loader2, Bot, User,
  FileText, FolderKanban, Clock, Zap, ShieldAlert,
  Eye, Navigation, MousePointer2,
} from 'lucide-react';
import { AgentHighlight } from './agent-highlight';

interface Step {
  id: string;
  type: 'navigate' | 'highlight' | 'action' | 'permission' | 'done';
  label: string;
  detail?: string;
  route?: string;
  selector?: string;
  status: 'pending' | 'running' | 'done' | 'waiting_permission';
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  steps?: Step[];
  timestamp: Date;
}

function makeSteps(action: string): Step[] {
  const q = action.toLowerCase();

  if (q.includes('stage') || q.includes('change') || q.includes('move') || q.includes('attorney review')) {
    return [
      { id: '1', type: 'navigate', label: 'Opening Cases list', route: '/dashboard/cases', status: 'pending' },
      { id: '2', type: 'highlight', label: 'Finding Priya Sharma', selector: 'table tbody tr:first-child', status: 'pending' },
      { id: '3', type: 'navigate', label: 'Opening case detail', route: '/dashboard/cases/1', status: 'pending' },
      { id: '4', type: 'highlight', label: 'Current stage: Preparation', selector: '[class*="ring-blue"]', status: 'pending' },
      { id: '5', type: 'permission', label: 'Change stage from Preparation → Attorney Review?', detail: 'This will notify the attorney and update the case timeline.', status: 'pending' },
      { id: '6', type: 'action', label: 'Updating stage to Attorney Review', status: 'pending' },
      { id: '7', type: 'done', label: 'Stage updated', detail: 'Case NIW-2026-0317 is now in Attorney Review. Danish has been notified.', status: 'pending' },
    ];
  }

  if (q.includes('draft') || q.includes('rfe') || q.includes('response')) {
    return [
      { id: '1', type: 'navigate', label: 'Opening Cases', route: '/dashboard/cases', status: 'pending' },
      { id: '2', type: 'highlight', label: 'Finding Ramesh Iyer', selector: 'table tbody tr:nth-child(2)', status: 'pending' },
      { id: '3', type: 'navigate', label: 'Opening documents', route: '/dashboard/cases/1/documents', status: 'pending' },
      { id: '4', type: 'highlight', label: 'Analyzing case evidence', selector: '.space-y-2 > div:nth-child(2)', status: 'pending' },
      { id: '5', type: 'action', label: 'Generating RFE response with Claude Opus 4.6', detail: 'Searching AAO precedent decisions...', status: 'pending' },
      { id: '6', type: 'permission', label: 'Save RFE response draft?', detail: '4 pages · 3 AAO citations · Addresses specialty occupation deficiency · Marked DRAFT — ATTORNEY REVIEW.', status: 'pending' },
      { id: '7', type: 'navigate', label: 'Opening Agent console', route: '/dashboard/agent', status: 'pending' },
      { id: '8', type: 'done', label: 'Draft saved to Agent console', detail: 'Awaiting your review. Click "Approve & send" when ready.', status: 'pending' },
    ];
  }

  if (q.includes('deadline') || q.includes('this week') || q.includes('upcoming')) {
    return [
      { id: '1', type: 'navigate', label: 'Opening Deadlines', route: '/dashboard/deadlines', status: 'pending' },
      { id: '2', type: 'highlight', label: 'Scanning agency clocks', selector: 'table tbody', status: 'pending' },
      { id: '3', type: 'highlight', label: 'Kapoor — NOID response: 6 days (CRITICAL)', selector: 'table tbody tr:nth-child(2)', status: 'pending' },
      { id: '4', type: 'done', label: '3 urgent deadlines found', detail: 'Sharma RFE (15d) · Kapoor NOID (6d critical) · Osei I-907 (9d)', status: 'pending' },
    ];
  }

  if (q.includes('assess') || q.includes('score') || q.includes('evaluate')) {
    return [
      { id: '1', type: 'navigate', label: 'Opening Cases', route: '/dashboard/cases', status: 'pending' },
      { id: '2', type: 'highlight', label: 'Finding Dr. Ama Osei', selector: 'table tbody tr:nth-child(3)', status: 'pending' },
      { id: '3', type: 'navigate', label: 'Opening assessment', route: '/dashboard/cases/1/assessment', status: 'pending' },
      { id: '4', type: 'highlight', label: 'Current score: 84', selector: '.text-6xl', status: 'pending' },
      { id: '5', type: 'action', label: 'Re-running EB-1A assessment with Claude Sonnet 4.6', detail: 'Scoring 8 criteria against 38 documents...', status: 'pending' },
      { id: '6', type: 'done', label: 'Assessment complete — score: 86 (+2)', detail: 'Original Contributions improved. Judging still weak at 35%.', status: 'pending' },
    ];
  }

  if (q.includes('message') || q.includes('send') || q.includes('whatsapp') || q.includes('email') || q.includes('notify')) {
    return [
      { id: '1', type: 'navigate', label: 'Opening Messages', route: '/dashboard/messages', status: 'pending' },
      { id: '2', type: 'highlight', label: 'Finding Priya Sharma conversation', selector: 'button:first-child', status: 'pending' },
      { id: '3', type: 'action', label: 'Composing message based on case context', status: 'pending' },
      { id: '4', type: 'permission', label: 'Send WhatsApp message to Priya?', detail: '"Hi Priya, reminder: please send the recommendation letters by Friday. Let me know if you need the templates again."', status: 'pending' },
      { id: '5', type: 'done', label: 'Message sent via WhatsApp', detail: 'Delivered. Auto-attached to case NIW-2026-0317.', status: 'pending' },
    ];
  }

  if (q.includes('create') || q.includes('new case') || q.includes('add')) {
    return [
      { id: '1', type: 'navigate', label: 'Opening Leads', route: '/dashboard/leads', status: 'pending' },
      { id: '2', type: 'highlight', label: 'Selecting Anika Patel', selector: '.rounded-xl.border.border-zinc-200.bg-white.p-4.shadow-sm', status: 'pending' },
      { id: '3', type: 'permission', label: 'Create EB-2 NIW case for Anika Patel?', detail: 'Will create candidate record, assign Danish, generate questionnaire, and queue portal invite to anika@gmail.com.', status: 'pending' },
      { id: '4', type: 'navigate', label: 'Creating case', route: '/dashboard/cases', status: 'pending' },
      { id: '5', type: 'action', label: 'Generating intake questionnaire', status: 'pending' },
      { id: '6', type: 'done', label: 'Case NIW-2026-0425 created', detail: 'Anika Patel · EB-2 NIW · Attorney: Danish. Portal invite queued.', status: 'pending' },
    ];
  }

  if (q.includes('report') || q.includes('analytics') || q.includes('stats') || q.includes('approval rate')) {
    return [
      { id: '1', type: 'navigate', label: 'Opening Reports', route: '/dashboard/reports', status: 'pending' },
      { id: '2', type: 'highlight', label: 'Loading approval rate data', selector: '.grid.grid-cols-4 > div:nth-child(3)', status: 'pending' },
      { id: '3', type: 'done', label: 'EB-1A approval rate: 94.2%', detail: '23 filed YTD · 18 approved · 4 RFEs (17.4%) · 1 denial. Your RFE rate is below the national average of ~22%.', status: 'pending' },
    ];
  }

  return [
    { id: '1', type: 'action', label: 'Processing your request', status: 'pending' },
    { id: '2', type: 'done', label: "Try: change stage, draft RFE response, show deadlines, run assessment, send message, create case, or show approval stats.", status: 'pending' },
  ];
}

interface CounselAiPanelProps { open: boolean; onClose: () => void; }

export function CounselAiPanel({ open, onClose }: CounselAiPanelProps): ReactElement {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([{
    id: '0', role: 'assistant',
    content: "Hi Danish. I have full access to your cases, documents, forms, and communications. Tell me what to do — you'll see me navigate your screen in real-time. I'll always ask before creating or deleting anything.",
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState('');
  const [executing, setExecuting] = useState(false);
  const [currentSteps, setCurrentSteps] = useState<Step[]>([]);
  const [activeStepIdx, setActiveStepIdx] = useState(-1);
  const [highlightSelector, setHighlightSelector] = useState<string | null>(null);
  const [highlightLabel, setHighlightLabel] = useState('');
  const [waitingPermission, setWaitingPermission] = useState(false);
  const resolveRef = useRef<(() => void) | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, activeStepIdx, waitingPermission]);

  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  const executeSteps = useCallback(async (steps: Step[]) => {
    setExecuting(true);
    setCurrentSteps([...steps]);

    for (let i = 0; i < steps.length; i++) {
      setActiveStepIdx(i);
      const step = steps[i]!;
      setCurrentSteps((p) => p.map((s, idx) => idx === i ? { ...s, status: 'running' } : s));

      if (step.type === 'navigate' && step.route) {
        router.push(step.route);
        await sleep(1200);
      } else if (step.type === 'highlight' && step.selector) {
        setHighlightSelector(step.selector);
        setHighlightLabel(step.label);
        await sleep(2000);
      } else if (step.type === 'action') {
        setHighlightSelector(null);
        setHighlightLabel('');
        await sleep(2200);
      } else if (step.type === 'permission') {
        setHighlightSelector(null);
        setHighlightLabel('');
        setWaitingPermission(true);
        setCurrentSteps((p) => p.map((s, idx) => idx === i ? { ...s, status: 'waiting_permission' } : s));
        const granted = await new Promise<boolean>((resolve) => {
          resolveRef.current = () => resolve(true);
          (window as unknown as Record<string, unknown>).__denyPermission = () => resolve(false);
        });
        setWaitingPermission(false);
        if (!granted) {
          setCurrentSteps((p) => p.map((s, idx) => idx === i ? { ...s, status: 'done', label: 'Cancelled by user' } : s));
          setMessages((p) => [...p, { id: Date.now().toString(), role: 'system', content: 'Action cancelled.', timestamp: new Date() }]);
          break;
        }
      } else if (step.type === 'done') {
        setHighlightSelector(null);
        setHighlightLabel('');
      }

      setCurrentSteps((p) => p.map((s, idx) => idx === i ? { ...s, status: 'done' } : s));
    }

    setActiveStepIdx(-1);
    setHighlightSelector(null);
    setHighlightLabel('');
    setExecuting(false);
  }, [router]);

  function handleSend(): void {
    if (!input.trim() || executing) return;
    const text = input.trim();
    const steps = makeSteps(text);
    setMessages((p) => [
      ...p,
      { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() },
      { id: (Date.now() + 1).toString(), role: 'assistant', content: 'On it — watch your screen.', steps, timestamp: new Date() },
    ]);
    setInput('');
    executeSteps(steps);
  }

  function grantPermission(): void { resolveRef.current?.(); }
  function denyPermission(): void { (window as unknown as Record<string, () => void>).__denyPermission?.(); }

  const activeStep = activeStepIdx >= 0 ? currentSteps[activeStepIdx] : null;
  const SUGGESTIONS = [
    { icon: Navigation, text: "Change Priya's stage to attorney review" },
    { icon: FileText, text: 'Draft RFE response for Ramesh' },
    { icon: Clock, text: 'Show deadlines this week' },
    { icon: Zap, text: 'Run assessment for Dr. Osei' },
  ];

  return (
    <>
      <AgentHighlight selector={highlightSelector} label={highlightLabel} />
      <div className={`fixed right-0 top-0 z-40 flex h-full w-[420px] flex-col border-l border-zinc-200 bg-white shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-blue-500"><Sparkles className="h-4 w-4 text-white" /></div>
            <div>
              <p className="text-[13px] font-semibold text-zinc-900">CounselAI</p>
              <p className="text-[10px] text-zinc-400">
                {executing ? <span className="flex items-center gap-1 text-violet-600"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-500" />Working...</span> : 'Full access · Claude Sonnet 4.6'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100"><X className="h-4 w-4" /></button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {messages.map((msg) => (
            <div key={msg.id} className="mb-4">
              <div className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role !== 'system' && (
                  <div className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${msg.role === 'user' ? 'bg-zinc-900' : 'bg-gradient-to-br from-violet-500 to-blue-500'}`}>
                    {msg.role === 'user' ? <User className="h-3.5 w-3.5 text-white" /> : <Bot className="h-3.5 w-3.5 text-white" />}
                  </div>
                )}
                <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                  msg.role === 'user' ? 'bg-zinc-900 text-white' : msg.role === 'system' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-zinc-100 text-zinc-800'
                }`}>{msg.content}</div>
              </div>

              {/* Steps timeline */}
              {msg.steps && (
                <div className="ml-9 mt-3 space-y-1">
                  {msg.steps.map((step) => (
                    <div key={step.id} className={`flex items-start gap-2 rounded-lg border px-3 py-2 transition-all duration-300 ${
                      step.status === 'running' ? 'border-violet-300 bg-violet-50' :
                      step.status === 'waiting_permission' ? 'border-amber-300 bg-amber-50' :
                      step.status === 'done' ? 'border-zinc-100 bg-white' : 'border-zinc-100 bg-zinc-50/50 opacity-40'
                    }`}>
                      <div className="mt-0.5 shrink-0">
                        {step.status === 'done' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> :
                         step.status === 'running' ? <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-600" /> :
                         step.status === 'waiting_permission' ? <ShieldAlert className="h-3.5 w-3.5 text-amber-600" /> :
                         <div className="h-3.5 w-3.5 rounded-full border-2 border-zinc-300" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {step.type === 'navigate' && <Navigation className="h-3 w-3 text-blue-500" />}
                          {step.type === 'highlight' && <Eye className="h-3 w-3 text-violet-500" />}
                          {step.type === 'action' && <Zap className="h-3 w-3 text-amber-500" />}
                          {step.type === 'permission' && <ShieldAlert className="h-3 w-3 text-amber-600" />}
                          {step.type === 'done' && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                          <p className="text-[11px] font-medium text-zinc-800">{step.label}</p>
                        </div>
                        {step.detail && <p className="mt-0.5 text-[10px] text-zinc-500">{step.detail}</p>}
                        {step.status === 'waiting_permission' && (
                          <div className="mt-2 flex gap-2">
                            <button onClick={grantPermission} className="flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-500">
                              <CheckCircle2 className="h-3 w-3" /> Yes, proceed
                            </button>
                            <button onClick={denyPermission} className="rounded-md border border-zinc-300 px-3 py-1.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50">Cancel</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {executing && activeStep && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-[12px] text-violet-800">
              <MousePointer2 className="h-4 w-4 animate-bounce text-violet-600" />
              <span className="font-medium">{activeStep.label}</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 2 && !executing && (
          <div className="border-t border-zinc-100 px-4 py-2">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-zinc-400">Try saying</p>
            <div className="space-y-1">
              {SUGGESTIONS.map((s) => {
                const Icon = s.icon;
                return (
                  <button key={s.text} onClick={() => setInput(s.text)} className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left text-[12px] text-zinc-600 transition-colors hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700">
                    <Icon className="h-3.5 w-3.5 shrink-0" />{s.text}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-zinc-200 p-3">
          <div className="flex items-center gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} disabled={executing}
              placeholder={executing ? 'Working...' : 'Tell me what to do...'}
              className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-[13px] placeholder:text-zinc-400 focus:border-violet-500 focus:bg-white focus:outline-none disabled:opacity-50" />
            <button onClick={handleSend} disabled={!input.trim() || executing}
              className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 text-white hover:from-violet-500 hover:to-blue-500 disabled:opacity-40">
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-zinc-400">Full access · Asks permission before changes · All actions logged</p>
        </div>
      </div>
    </>
  );
}
