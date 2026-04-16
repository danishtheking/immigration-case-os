'use client';

import { useState, type ReactElement } from 'react';
import { Topbar } from '@/components/layout/topbar';
import {
  Search,
  Send,
  Paperclip,
  Phone,
  Video,
  MoreHorizontal,
  CheckCheck,
  Clock,
  MessageSquare,
  Mail,
  Smartphone,
  Image,
} from 'lucide-react';

interface Conversation {
  id: string;
  name: string;
  caseType: string;
  lastMessage: string;
  time: string;
  unread: number;
  channel: 'whatsapp' | 'email' | 'sms' | 'in_app';
  avatar: string;
  online?: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'client' | 'firm';
  senderName: string;
  content: string;
  time: string;
  channel: 'whatsapp' | 'email' | 'sms' | 'in_app';
  read: boolean;
}

const CONVERSATIONS: Conversation[] = [
  { id: '1', name: 'Priya Sharma', caseType: 'EB-2 NIW', lastMessage: 'Thank you! I will send the recommendation letters by Friday.', time: '2 min', unread: 2, channel: 'whatsapp', avatar: 'PS', online: true },
  { id: '2', name: 'Ramesh Iyer', caseType: 'H-1B', lastMessage: 'Can you check if the LCA has been posted?', time: '15 min', unread: 1, channel: 'email', avatar: 'RI' },
  { id: '3', name: 'Dr. Ama Osei', caseType: 'EB-1A', lastMessage: 'I just got accepted as a reviewer for Nature!', time: '1 hr', unread: 0, channel: 'whatsapp', avatar: 'AO', online: true },
  { id: '4', name: 'Lucia Moreno', caseType: 'I-130+I-485', lastMessage: 'When is the biometrics appointment?', time: '3 hr', unread: 0, channel: 'sms', avatar: 'LM' },
  { id: '5', name: 'Ayaan Hussein', caseType: 'I-589 Asylum', lastMessage: 'I have finished writing my personal declaration.', time: '5 hr', unread: 1, channel: 'email', avatar: 'AH' },
  { id: '6', name: 'Chen Wei', caseType: 'O-1A', lastMessage: 'The consultation letter from IEEE arrived today.', time: '1 day', unread: 0, channel: 'whatsapp', avatar: 'CW' },
  { id: '7', name: 'Dmitri Volkov', caseType: 'N-400', lastMessage: 'Do I need to bring anything to the interview?', time: '2 days', unread: 0, channel: 'in_app', avatar: 'DV' },
];

const CHAT_MESSAGES: ChatMessage[] = [
  { id: '1', sender: 'client', senderName: 'Priya Sharma', content: 'Hi, I received the recommendation letter template you sent. It looks great!', time: '10:30 AM', channel: 'whatsapp', read: true },
  { id: '2', sender: 'firm', senderName: 'Jess', content: 'Wonderful! Please forward it to Dr. Ortiz and Prof. Chen with the instructions I attached. Let me know if they have any questions.', time: '10:45 AM', channel: 'whatsapp', read: true },
  { id: '3', sender: 'client', senderName: 'Priya Sharma', content: "I sent it to Dr. Ortiz just now. She said she'll review it this week.", time: '11:02 AM', channel: 'whatsapp', read: true },
  { id: '4', sender: 'firm', senderName: 'Danish', content: "That's great progress. Also, I wanted to let you know that we've started drafting the cover brief for your I-140 petition. I'll have a draft ready for your review by next Monday.", time: '11:15 AM', channel: 'whatsapp', read: true },
  { id: '5', sender: 'client', senderName: 'Priya Sharma', content: 'Thank you so much! One question — do I need to get the salary verification letter from my HR department, or is the LCA data sufficient?', time: '2:20 PM', channel: 'whatsapp', read: true },
  { id: '6', sender: 'firm', senderName: 'Danish', content: 'The LCA data is sufficient for the filing, but having an employer verification letter strengthens the high-salary criterion significantly. I recommend requesting one — I can draft a template for your HR if that helps.', time: '2:35 PM', channel: 'whatsapp', read: true },
  { id: '7', sender: 'client', senderName: 'Priya Sharma', content: "That would be very helpful! Yes, please send me the template.", time: '2:38 PM', channel: 'whatsapp', read: false },
  { id: '8', sender: 'client', senderName: 'Priya Sharma', content: 'Thank you! I will send the recommendation letters by Friday.', time: '2:40 PM', channel: 'whatsapp', read: false },
];

const CHANNEL_ICONS = {
  whatsapp: { icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  email: { icon: Mail, color: 'text-blue-600', bg: 'bg-blue-100' },
  sms: { icon: Smartphone, color: 'text-violet-600', bg: 'bg-violet-100' },
  in_app: { icon: MessageSquare, color: 'text-zinc-600', bg: 'bg-zinc-100' },
};

export default function MessagesPage(): ReactElement {
  const [selectedId, setSelectedId] = useState('1');
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const selected = CONVERSATIONS.find((c) => c.id === selectedId)!;
  const filteredConversations = CONVERSATIONS.filter((c) =>
    !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.caseType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Topbar firstName="Danish" previewMode />
      <main className="flex flex-1 overflow-hidden">
        {/* Conversation list */}
        <div className="flex w-80 shrink-0 flex-col border-r border-zinc-200 bg-white">
          <div className="border-b border-zinc-100 p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[14px] font-semibold text-zinc-900">Messages</h2>
              <div className="flex items-center gap-1">
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">4</span>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-8 pr-3 text-[12px] placeholder:text-zinc-400 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
            {/* Channel filter */}
            <div className="mt-2 flex gap-1">
              {(['all', 'whatsapp', 'email', 'sms'] as const).map((ch) => (
                <button key={ch} className={`rounded-md px-2 py-1 text-[10px] font-medium ${ch === 'all' ? 'bg-zinc-900 text-white' : 'border border-zinc-200 text-zinc-500 hover:bg-zinc-50'}`}>
                  {ch === 'all' ? 'All' : ch.charAt(0).toUpperCase() + ch.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => {
              const ch = CHANNEL_ICONS[conv.channel];
              const Icon = ch.icon;
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`flex w-full items-start gap-3 border-b border-zinc-50 px-3 py-3 text-left transition-colors ${
                    selectedId === conv.id ? 'bg-blue-50/60' : 'hover:bg-zinc-50'
                  }`}
                >
                  <div className="relative">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-zinc-200 text-[12px] font-bold text-zinc-600">
                      {conv.avatar}
                    </div>
                    {conv.online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-[13px] font-semibold text-zinc-900">{conv.name}</p>
                      <span className="shrink-0 text-[10px] text-zinc-400">{conv.time}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400">{conv.caseType}</p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <Icon className={`h-3 w-3 shrink-0 ${ch.color}`} />
                      <p className="truncate text-[11px] text-zinc-500">{conv.lastMessage}</p>
                    </div>
                  </div>
                  {conv.unread > 0 && (
                    <span className="mt-1 grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                      {conv.unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex flex-1 flex-col">
          {/* Chat header */}
          <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-zinc-200 text-[12px] font-bold text-zinc-600">{selected.avatar}</div>
                {selected.online && <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />}
              </div>
              <div>
                <p className="text-[13px] font-semibold text-zinc-900">{selected.name}</p>
                <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                  <span>{selected.caseType}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    {(() => { const ch = CHANNEL_ICONS[selected.channel]; const Icon = ch.icon; return <><Icon className={`h-3 w-3 ${ch.color}`} />{selected.channel}</>; })()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="rounded-md p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"><Phone className="h-4 w-4" /></button>
              <button className="rounded-md p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"><Video className="h-4 w-4" /></button>
              <button className="rounded-md p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"><MoreHorizontal className="h-4 w-4" /></button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="mb-4 text-center">
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-[10px] text-zinc-500">Today</span>
            </div>
            {CHAT_MESSAGES.map((msg) => (
              <div key={msg.id} className={`mb-3 flex ${msg.sender === 'firm' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                  msg.sender === 'firm'
                    ? 'rounded-br-md bg-blue-600 text-white'
                    : 'rounded-bl-md bg-zinc-100 text-zinc-800'
                }`}>
                  {msg.sender === 'firm' && (
                    <p className={`mb-0.5 text-[10px] ${msg.sender === 'firm' ? 'text-blue-200' : 'text-zinc-400'}`}>{msg.senderName}</p>
                  )}
                  <p className="text-[13px] leading-relaxed">{msg.content}</p>
                  <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${msg.sender === 'firm' ? 'text-blue-200' : 'text-zinc-400'}`}>
                    <span>{msg.time}</span>
                    {msg.sender === 'firm' && <CheckCheck className={`h-3 w-3 ${msg.read ? 'text-blue-200' : 'text-blue-300/50'}`} />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-zinc-200 bg-white p-3">
            <div className="flex items-end gap-2">
              <button className="rounded-md p-2 text-zinc-400 hover:bg-zinc-100"><Paperclip className="h-4 w-4" /></button>
              <button className="rounded-md p-2 text-zinc-400 hover:bg-zinc-100"><Image className="h-4 w-4" /></button>
              <input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-[13px] placeholder:text-zinc-400 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
              <button className="grid h-10 w-10 place-items-center rounded-lg bg-blue-600 text-white hover:bg-blue-500">
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400">
              <span>Sending via WhatsApp · All messages auto-attached to case NIW-2026-0317</span>
              <button className="text-blue-600 hover:underline">Switch channel</button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
