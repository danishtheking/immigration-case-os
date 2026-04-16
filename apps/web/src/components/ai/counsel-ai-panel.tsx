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

// ── Instant responses (no navigation, just a chat reply) ────────
function getInstantResponse(q: string): string | null {
  // Greetings
  if (/^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(q)) return "Hi Danish! I'm ready. What would you like me to do? I can search cases, draft documents, check deadlines, send messages, or navigate anywhere in the app.";
  if (/^(thanks|thank you|thx|ty|great|nice|awesome|perfect|cool)\b/.test(q)) return "You're welcome! Anything else you need?";

  // Knowledge: case counts
  if (q.includes('how many cases') || q.includes('total cases') || q.includes('case count')) return "You have **412 active cases** across all types.\n\nBreakdown: 87 EB-2 NIW · 72 H-1B · 58 EB-1A · 54 family-based · 41 O-1A · 34 asylum · 28 naturalization · 38 other.\n\nWant me to open the cases list?";
  if (q.includes('how many lead') || q.includes('total lead')) return "You have **9 leads** in the pipeline: 3 new · 2 contacted · 1 consultation scheduled · 2 engaged · 1 lost.\n\nWant me to open the leads board?";

  // Knowledge: specific people
  if (q.includes('who is priya') || q.includes('about priya') || q.includes("priya's case") || q.includes('priya sharma')) return "**Priya Sharma** — EB-2 NIW (Matter of Dhanasar)\n\nScore: **84** (Strong) · Stage: Preparation · Attorney: Danish · 38 documents · 72 days in system · Retainer: $8,500 paid\n\nKey issue: Prong 3 (balance favors waiver) is at 68% — needs comparable-worker scarcity evidence.\n\nWant me to open her case?";
  if (q.includes('who is ramesh') || q.includes('about ramesh') || q.includes("ramesh's case")) return "**Ramesh Iyer** — H-1B Extension\n\nStage: Attorney Review · Attorney: Danish · 12 documents · Deadline: May 06 (filing)\n\nActive RFE on specialty occupation. I drafted a response — it's in the Agent console awaiting your review.";
  if (q.includes('who is osei') || q.includes('about osei') || q.includes('dr. osei') || q.includes('ama osei')) return "**Dr. Ama Osei** — EB-1A (Extraordinary Ability)\n\nScore: **61** (Marginal) · Stage: Profile building · Attorney: Jess · 24 documents\n\nMeets 5 of 8 criteria but Judging is weak (35%). I matched 6 new opportunities to strengthen her profile.";

  // Knowledge: revenue / billing
  if (q.includes('revenue') || q.includes('how much money') || q.includes('billing summary') || q.includes('how much have we')) return "**Revenue (MTD): $184,220** — up 12% vs last month.\n\nTrust balance: $146,200 · Open invoices: $38,450 · Overdue >30d: $4,100 (2 clients)\n\nYTD total: $1.47M across 412 cases. Want me to open the billing page?";

  // Knowledge: team
  if (q.includes('who is on my team') || q.includes('how many attorney') || q.includes('team members')) return "Your team at StitchBoat Immigration:\n\n• **Danish** — Firm admin / Attorney · 156 active cases\n• **Jess** — Attorney · 134 active cases\n• **Rahul** — Attorney · 122 active cases\n\nApproval rate: 94.2% firm-wide. RFE rate: 12% (below national avg of 22%).";

  // Knowledge: visa types
  if (q.includes('what visa') || q.includes('visa types') || q.includes('case types')) return "You handle **25 active case types**:\n\nEmployment: EB-1A, EB-1B, EB-2 NIW, EB-2 PERM, EB-3, EB-5, H-1B, L-1A, L-1B, O-1A, TN, E-2, E-3\nFamily: I-130, I-485, K-1, I-751\nHumanitarian: I-589 Asylum, U-Visa, DACA, TPS\nOther: N-400, Removal defense, BIA appeal";

  // Knowledge: what can you do
  if (q.includes('what can you do') || q.includes('help me') || q.includes('capabilities') || q.includes('what are you')) return "I'm **CounselAI** — your AI copilot with full access to this platform. I can:\n\n**Navigate & search**: Open any case, find clients, check deadlines\n**Take actions**: Change case stages, create cases, assign attorneys\n**Draft documents**: RFE responses, cover letters, support letters\n**Communicate**: Draft emails/SMS/WhatsApp, send with your approval\n**Analyze**: Run eligibility assessments, show approval rates\n**Research**: Search legal precedent, check Visa Bulletin\n\nTry asking me anything!";

  // Knowledge: specific questions
  if (q.includes('visa bulletin') || q.includes('priority date')) return "**Visa Bulletin — April 2026:**\n\nEB-2 India: 01 Nov 2012 (advanced 2 weeks)\nEB-2 China: 01 Jun 2020 (unchanged)\nEB-3 India: 15 May 2013 (current for 2 of your cases)\nEB-1 All: Current\nF-2A Mexico: Current\n\nWant me to open the Deadlines page for details?";
  if (q.includes('rfe rate') || q.includes('denial rate')) return "**Your firm's RFE data (last 12 months):**\n\nEB-1A: 17.4% RFE rate (national avg ~22%) · 1 denial\nEB-2 NIW: 11% RFE rate · 0 denials\nH-1B: 14% RFE rate · 0 denials\nO-1A: 8% RFE rate · 0 denials\n\nOverall approval rate: **94.2%**. You're outperforming the national average.";
  if (q.includes('next step') || q.includes('what should i do') || q.includes('priority') || q.includes('urgent')) return "**Your top priorities right now:**\n\n🔴 **Kapoor NOID response** — 6 days left (critical)\n🟡 **Sharma RFE response** — 15 days left\n🟡 **Silva I-751 filing** — 90-day window ends Apr 26\n🟡 **Osei I-907** — response due in 9 days\n\nShould I open the Kapoor case?";

  // Navigation shortcuts
  if (q.includes('go to dashboard') || q.includes('open dashboard') || q.includes('show dashboard')) return null; // fall through to navigation
  if (q.includes('go to') || q.includes('open') || q.includes('show') || q.includes('navigate to')) return null; // fall through to navigation

  return null; // no instant response, fall through to step-based
}

// ── Step-based actions (with navigation + highlights) ───────
function makeSteps(action: string): Step[] {
  const q = action.toLowerCase();

  // ── Case stage changes ──
  if (q.includes('stage') || q.includes('change') || q.includes('move') || q.includes('attorney review')) {
    return [
      { id: '1', type: 'navigate', label: 'Opening Cases list', route: '/dashboard/cases', status: 'pending' },
      { id: '2', type: 'highlight', label: 'Finding Priya Sharma', selector: 'table tbody tr:first-child', status: 'pending' },
      { id: '3', type: 'navigate', label: 'Opening case detail', route: '/dashboard/cases/1', status: 'pending' },
      { id: '4', type: 'highlight', label: 'Current stage: Preparation', selector: '[class*="ring-"]', status: 'pending' },
      { id: '5', type: 'permission', label: 'Change stage from Preparation → Attorney Review?', detail: 'This will notify the attorney and update the case timeline.', status: 'pending' },
      { id: '6', type: 'action', label: 'Updating stage to Attorney Review', status: 'pending' },
      { id: '7', type: 'done', label: 'Stage updated', detail: 'Case NIW-2026-0317 is now in Attorney Review. Danish has been notified.', status: 'pending' },
    ];
  }

  // ── Draft documents ──
  if (q.includes('draft') || q.includes('rfe') || q.includes('write') || q.includes('cover letter') || q.includes('support letter')) {
    const isRfe = q.includes('rfe');
    const isCover = q.includes('cover');
    const docType = isRfe ? 'RFE response' : isCover ? 'cover letter' : 'support letter';
    return [
      { id: '1', type: 'navigate', label: 'Opening Cases', route: '/dashboard/cases', status: 'pending' },
      { id: '2', type: 'highlight', label: isRfe ? 'Finding Ramesh Iyer' : 'Finding Priya Sharma', selector: isRfe ? 'table tbody tr:nth-child(2)' : 'table tbody tr:first-child', status: 'pending' },
      { id: '3', type: 'navigate', label: 'Opening documents', route: '/dashboard/cases/1/documents', status: 'pending' },
      { id: '4', type: 'highlight', label: 'Analyzing case evidence', selector: '[class*="card-elevated"], [class*="rounded-xl"]:nth-child(2)', status: 'pending' },
      { id: '5', type: 'action', label: `Generating ${docType} with Claude Opus 4.6`, detail: 'Searching AAO precedent decisions and USCIS Policy Manual...', status: 'pending' },
      { id: '6', type: 'permission', label: `Save ${docType} draft?`, detail: `4 pages · 3 citations · Marked DRAFT — REQUIRES ATTORNEY REVIEW.`, status: 'pending' },
      { id: '7', type: 'navigate', label: 'Opening Agent console', route: '/dashboard/agent', status: 'pending' },
      { id: '8', type: 'done', label: `${docType} draft saved`, detail: 'Awaiting your review in the Agent console.', status: 'pending' },
    ];
  }

  // ── Deadlines ──
  if (q.includes('deadline') || q.includes('this week') || q.includes('upcoming') || q.includes('due') || q.includes('overdue')) {
    return [
      { id: '1', type: 'navigate', label: 'Opening Deadlines', route: '/dashboard/deadlines', status: 'pending' },
      { id: '2', type: 'highlight', label: 'Scanning agency clocks', selector: 'table tbody', status: 'pending' },
      { id: '3', type: 'highlight', label: 'CRITICAL: Kapoor NOID — 6 days left', selector: 'table tbody tr:nth-child(2)', status: 'pending' },
      { id: '4', type: 'done', label: '3 urgent deadlines found', detail: 'Kapoor NOID (6d CRITICAL) · Osei I-907 (9d) · Sharma RFE (15d)', status: 'pending' },
    ];
  }

  // ── Assessment ──
  if (q.includes('assess') || q.includes('score') || q.includes('evaluat') || q.includes('eligib') || q.includes('criteria')) {
    return [
      { id: '1', type: 'navigate', label: 'Opening Cases', route: '/dashboard/cases', status: 'pending' },
      { id: '2', type: 'highlight', label: 'Finding Dr. Ama Osei', selector: 'table tbody tr:nth-child(3)', status: 'pending' },
      { id: '3', type: 'navigate', label: 'Opening assessment', route: '/dashboard/cases/1/assessment', status: 'pending' },
      { id: '4', type: 'highlight', label: 'Current score: 84', selector: '[class*="text-6xl"], [class*="font-black"]', status: 'pending' },
      { id: '5', type: 'action', label: 'Re-running EB-1A assessment with Claude Sonnet 4.6', detail: 'Scoring 8 criteria against 38 documents...', status: 'pending' },
      { id: '6', type: 'done', label: 'Assessment complete — score: 86 (+2)', detail: 'Original Contributions improved with new publication. Judging still weak at 35%.', status: 'pending' },
    ];
  }

  // ── Messaging ──
  if (q.includes('message') || q.includes('send') || q.includes('whatsapp') || q.includes('email') || q.includes('notify') || q.includes('remind') || q.includes('follow up') || q.includes('text')) {
    return [
      { id: '1', type: 'navigate', label: 'Opening Messages', route: '/dashboard/messages', status: 'pending' },
      { id: '2', type: 'highlight', label: 'Finding conversation', selector: 'button:first-child', status: 'pending' },
      { id: '3', type: 'action', label: 'Composing message based on case context', status: 'pending' },
      { id: '4', type: 'permission', label: 'Send WhatsApp message?', detail: '"Hi Priya, reminder: please send the recommendation letters by Friday. Let me know if you need the templates again."', status: 'pending' },
      { id: '5', type: 'done', label: 'Message sent via WhatsApp', detail: 'Delivered. Auto-attached to case NIW-2026-0317.', status: 'pending' },
    ];
  }

  // ── Create case ──
  if (q.includes('create') || q.includes('new case') || q.includes('add case') || q.includes('onboard') || q.includes('intake')) {
    return [
      { id: '1', type: 'navigate', label: 'Opening Leads', route: '/dashboard/leads', status: 'pending' },
      { id: '2', type: 'highlight', label: 'Selecting Anika Patel', selector: '[class*="shadow-sm"]:first-child', status: 'pending' },
      { id: '3', type: 'permission', label: 'Create EB-2 NIW case for Anika Patel?', detail: 'Will create candidate, assign Danish, generate questionnaire, queue portal invite to anika@gmail.com.', status: 'pending' },
      { id: '4', type: 'navigate', label: 'Creating case', route: '/dashboard/cases', status: 'pending' },
      { id: '5', type: 'action', label: 'Generating intake questionnaire', status: 'pending' },
      { id: '6', type: 'done', label: 'Case NIW-2026-0425 created', detail: 'Anika Patel · EB-2 NIW · Attorney: Danish. Portal invite queued.', status: 'pending' },
    ];
  }

  // ── Reports / analytics ──
  if (q.includes('report') || q.includes('analytics') || q.includes('stats') || q.includes('approval rate') || q.includes('performance')) {
    return [
      { id: '1', type: 'navigate', label: 'Opening Reports', route: '/dashboard/reports', status: 'pending' },
      { id: '2', type: 'highlight', label: 'Loading firm performance data', selector: '[class*="grid-cols-4"]', status: 'pending' },
      { id: '3', type: 'done', label: 'Report loaded', detail: '412 cases · 94.2% approval rate · $1.47M YTD · 4.3mo avg cycle time', status: 'pending' },
    ];
  }

  // ── Navigation: go to specific pages ──
  if (q.includes('go to') || q.includes('open') || q.includes('show') || q.includes('navigate')) {
    if (q.includes('case') && !q.includes('create')) return [{ id: '1', type: 'navigate', label: 'Opening Cases', route: '/dashboard/cases', status: 'pending' }, { id: '2', type: 'done', label: 'Cases page loaded', status: 'pending' }];
    if (q.includes('lead')) return [{ id: '1', type: 'navigate', label: 'Opening Leads', route: '/dashboard/leads', status: 'pending' }, { id: '2', type: 'done', label: 'Leads board loaded', status: 'pending' }];
    if (q.includes('message') || q.includes('inbox')) return [{ id: '1', type: 'navigate', label: 'Opening Messages', route: '/dashboard/messages', status: 'pending' }, { id: '2', type: 'done', label: 'Messages inbox loaded', status: 'pending' }];
    if (q.includes('form')) return [{ id: '1', type: 'navigate', label: 'Opening Forms', route: '/dashboard/forms', status: 'pending' }, { id: '2', type: 'done', label: 'Forms engine loaded', status: 'pending' }];
    if (q.includes('deadline')) return [{ id: '1', type: 'navigate', label: 'Opening Deadlines', route: '/dashboard/deadlines', status: 'pending' }, { id: '2', type: 'done', label: 'Deadlines page loaded', status: 'pending' }];
    if (q.includes('agent')) return [{ id: '1', type: 'navigate', label: 'Opening Agent console', route: '/dashboard/agent', status: 'pending' }, { id: '2', type: 'done', label: 'Agent console loaded', status: 'pending' }];
    if (q.includes('bill') || q.includes('trust') || q.includes('payment')) return [{ id: '1', type: 'navigate', label: 'Opening Billing', route: '/dashboard/billing', status: 'pending' }, { id: '2', type: 'done', label: 'Trust & Billing loaded', status: 'pending' }];
    if (q.includes('report') || q.includes('analytic')) return [{ id: '1', type: 'navigate', label: 'Opening Reports', route: '/dashboard/reports', status: 'pending' }, { id: '2', type: 'done', label: 'Reports loaded', status: 'pending' }];
    if (q.includes('admin') || q.includes('setting')) return [{ id: '1', type: 'navigate', label: 'Opening Admin', route: '/dashboard/admin', status: 'pending' }, { id: '2', type: 'done', label: 'Admin settings loaded', status: 'pending' }];
    if (q.includes('portal')) return [{ id: '1', type: 'navigate', label: 'Opening Client Portal', route: '/portal', status: 'pending' }, { id: '2', type: 'done', label: 'Client portal loaded', status: 'pending' }];
    if (q.includes('dashboard') || q.includes('home')) return [{ id: '1', type: 'navigate', label: 'Opening Dashboard', route: '/dashboard', status: 'pending' }, { id: '2', type: 'done', label: 'Dashboard loaded', status: 'pending' }];
  }

  // ── Approve / reject agent actions ──
  if (q.includes('approve') || q.includes('reject') || q.includes('pending')) {
    return [
      { id: '1', type: 'navigate', label: 'Opening Agent console', route: '/dashboard/agent', status: 'pending' },
      { id: '2', type: 'highlight', label: 'Found 5 pending approvals', selector: '[class*="space-y-2"]', status: 'pending' },
      { id: '3', type: 'done', label: '5 actions pending your review', detail: 'Click "Approve & send" or "Reject" on each action in the console.', status: 'pending' },
    ];
  }

  // ── Search for a client ──
  if (q.includes('find') || q.includes('search') || q.includes('look up') || q.includes('where is')) {
    return [
      { id: '1', type: 'navigate', label: 'Opening Cases', route: '/dashboard/cases', status: 'pending' },
      { id: '2', type: 'highlight', label: 'Searching...', selector: 'input[placeholder*="Search"]', status: 'pending' },
      { id: '3', type: 'done', label: 'Search results loaded', detail: 'Type in the search bar to filter by name, case type, or receipt number.', status: 'pending' },
    ];
  }

  // ── Upload document ──
  if (q.includes('upload') || q.includes('document') || q.includes('file')) {
    return [
      { id: '1', type: 'navigate', label: 'Opening Documents', route: '/dashboard/cases/1/documents', status: 'pending' },
      { id: '2', type: 'highlight', label: 'Upload zone ready', selector: '[class*="border-dashed"]', status: 'pending' },
      { id: '3', type: 'done', label: 'Ready for upload', detail: 'Drag and drop files into the upload zone, or click to browse. Supports PDF, DOCX, JPG, PNG up to 25MB.', status: 'pending' },
    ];
  }

  // ── Schedule meeting ──
  if (q.includes('schedule') || q.includes('meeting') || q.includes('call') || q.includes('appointment')) {
    return [
      { id: '1', type: 'action', label: 'Checking calendar availability', status: 'pending' },
      { id: '2', type: 'done', label: 'Meeting scheduling coming in Sprint 7', detail: 'For now, use your calendar app directly. Cal.com integration is planned.', status: 'pending' },
    ];
  }

  // ── File a case ──
  if (q.includes('file') || q.includes('submit') || q.includes('petition') || q.includes('i-140') || q.includes('i-130') || q.includes('packet')) {
    return [
      { id: '1', type: 'navigate', label: 'Opening Forms', route: '/dashboard/forms', status: 'pending' },
      { id: '2', type: 'highlight', label: 'Checking form completion status', selector: '[class*="card-elevated"]:first-child, [class*="rounded-xl"]:nth-child(2)', status: 'pending' },
      { id: '3', type: 'action', label: 'Verifying all forms are attorney-approved', status: 'pending' },
      { id: '4', type: 'done', label: 'Filing checklist ready', detail: 'I-140 (67/74 fields) · I-907 (complete) · G-28 (complete). 3 warnings need resolution before filing.', status: 'pending' },
    ];
  }

  // ── Default fallback ──
  return [
    { id: '1', type: 'action', label: 'Processing your request', status: 'pending' },
    { id: '2', type: 'done', label: "I didn't catch that specifically. Try asking me to:\n\n• Change a case stage\n• Draft an RFE response or cover letter\n• Check deadlines\n• Run an assessment\n• Send a message\n• Create a new case\n• Show reports\n• Open any page\n\nOr ask me a question like 'how many cases do we have?' or 'who is Priya Sharma?'", status: 'pending' },
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
    const q = text.toLowerCase();
    setInput('');

    // Check for instant response first (no navigation needed)
    const instant = getInstantResponse(q);
    if (instant) {
      setMessages((p) => [
        ...p,
        { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() },
      ]);
      // Simulate brief thinking delay
      setTimeout(() => {
        setMessages((p) => [
          ...p,
          { id: (Date.now() + 1).toString(), role: 'assistant', content: instant, timestamp: new Date() },
        ]);
      }, 600 + Math.random() * 400);
      return;
    }

    // Navigation-based action
    const steps = makeSteps(text);
    setMessages((p) => [
      ...p,
      { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() },
      { id: (Date.now() + 1).toString(), role: 'assistant', content: 'On it — watch your screen.', steps, timestamp: new Date() },
    ]);
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
      <div className={`fixed right-0 top-0 z-40 flex h-full w-[420px] flex-col border-l border-surface-border bg-surface-raised shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-blue-500"><Sparkles className="h-4 w-4 text-white" /></div>
            <div>
              <p className="text-[13px] font-semibold text-content">CounselAI</p>
              <p className="text-[12px] text-content-muted">
                {executing ? <span className="flex items-center gap-1 text-violet-600"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-500" />Working...</span> : 'Full access · Claude Sonnet 4.6'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-content-muted hover:bg-surface-sunken"><X className="h-4 w-4" /></button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {messages.map((msg) => (
            <div key={msg.id} className="mb-4">
              <div className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role !== 'system' && (
                  <div className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${msg.role === 'user' ? 'bg-content' : 'bg-gradient-to-br from-violet-500 to-blue-500'}`}>
                    {msg.role === 'user' ? <User className="h-3.5 w-3.5 text-white" /> : <Bot className="h-3.5 w-3.5 text-white" />}
                  </div>
                )}
                <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                  msg.role === 'user' ? 'bg-content text-white' : msg.role === 'system' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-surface-sunken text-content'
                }`}>{msg.content}</div>
              </div>

              {/* Steps timeline */}
              {msg.steps && (
                <div className="ml-9 mt-3 space-y-1">
                  {msg.steps.map((step) => (
                    <div key={step.id} className={`flex items-start gap-2 rounded-lg border px-3 py-2 transition-all duration-300 ${
                      step.status === 'running' ? 'border-violet-300 bg-violet-50' :
                      step.status === 'waiting_permission' ? 'border-amber-300 bg-amber-50' :
                      step.status === 'done' ? 'border-surface-border/50 bg-surface-raised' : 'border-surface-border/50 bg-surface/50 opacity-40'
                    }`}>
                      <div className="mt-0.5 shrink-0">
                        {step.status === 'done' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> :
                         step.status === 'running' ? <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-600" /> :
                         step.status === 'waiting_permission' ? <ShieldAlert className="h-3.5 w-3.5 text-amber-600" /> :
                         <div className="h-3.5 w-3.5 rounded-full border-2 border-surface-border-hover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {step.type === 'navigate' && <Navigation className="h-3 w-3 text-blue-500" />}
                          {step.type === 'highlight' && <Eye className="h-3 w-3 text-violet-500" />}
                          {step.type === 'action' && <Zap className="h-3 w-3 text-amber-500" />}
                          {step.type === 'permission' && <ShieldAlert className="h-3 w-3 text-amber-600" />}
                          {step.type === 'done' && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                          <p className="text-[12px] font-medium text-content">{step.label}</p>
                        </div>
                        {step.detail && <p className="mt-0.5 text-[12px] text-content-tertiary">{step.detail}</p>}
                        {step.status === 'waiting_permission' && (
                          <div className="mt-2 flex gap-2">
                            <button onClick={grantPermission} className="flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-emerald-500">
                              <CheckCircle2 className="h-3 w-3" /> Yes, proceed
                            </button>
                            <button onClick={denyPermission} className="rounded-md border border-surface-border-hover px-3 py-1.5 text-[12px] font-medium text-content-secondary hover:bg-surface">Cancel</button>
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
          <div className="border-t border-surface-border/50 px-4 py-2">
            <p className="mb-2 text-[12px] font-medium uppercase tracking-wider text-content-muted">Try saying</p>
            <div className="space-y-1">
              {SUGGESTIONS.map((s) => {
                const Icon = s.icon;
                return (
                  <button key={s.text} onClick={() => setInput(s.text)} className="flex w-full items-center gap-2 rounded-lg border border-surface-border bg-surface-raised px-3 py-2 text-left text-[12px] text-content-secondary transition-colors hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700">
                    <Icon className="h-3.5 w-3.5 shrink-0" />{s.text}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-surface-border p-3">
          <div className="flex items-center gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} disabled={executing}
              placeholder={executing ? 'Working...' : 'Tell me what to do...'}
              className="flex-1 rounded-lg border border-surface-border bg-surface px-3 py-2.5 text-[13px] placeholder:text-content-muted focus:border-violet-500 focus:bg-surface-raised focus:outline-none disabled:opacity-50" />
            <button onClick={handleSend} disabled={!input.trim() || executing}
              className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 text-white hover:from-violet-500 hover:to-blue-500 disabled:opacity-40">
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1.5 text-center text-[12px] text-content-muted">Full access · Asks permission before changes · All actions logged</p>
        </div>
      </div>
    </>
  );
}
