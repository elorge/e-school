// web/app/super-admin/chats/page.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import PlatformNav from '@/components/PlatformNav';
import LoadingScreen from '@/components/LoadingScreen';
import { getSessionUser } from '@/lib/session';
import {
  deletePlatformChat, getPlatformChat, listPlatformChats, replyPlatformChat, type ChatDetail, type ChatSummary,
} from '@/lib/endpoints/platform-chats';
import { Bot, Headset, Mail, MessageCircle, Phone, Search, Send, Trash2 } from 'lucide-react';

const countryName = (code: string) => {
  if (!code) return '';
  if (code === 'ZZ') return 'Other';
  try { return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code; } catch { return code; }
};
const when = (iso: string) => new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
const minutesAgo = (iso: string) => Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));

export default function PlatformChatsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [filter, setFilter] = useState<'all' | 'waiting'>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ChatDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const transcript = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      setChats((await listPlatformChats({ filter, q: query })) ?? []);
      setError(null);
    } catch {
      setError('Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  }, [filter, query]);

  useEffect(() => {
    const user = getSessionUser();
    if (user && user.role !== 'SUPER_ADMIN') { window.location.href = '/login'; return; }
  }, []);

  // Reload when the filter/search changes (small debounce for typing), then keep fresh every 15 s.
  useEffect(() => {
    const t = setTimeout(() => void load(), 250);
    const iv = setInterval(() => void load(), 15000);
    return () => { clearTimeout(t); clearInterval(iv); };
  }, [load]);

  // Arriving from a lead ("Open chat") — load that conversation straight away.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('open');
    if (id) getPlatformChat(id).then(setSelected).catch(() => undefined);
  }, []);

  // Keep the open conversation live: pick up new visitor messages every 5 s.
  const openId = selected?.id;
  useEffect(() => {
    if (!openId) return;
    const iv = setInterval(async () => {
      if (document.hidden) return;
      try {
        const d = await getPlatformChat(openId);
        setSelected((cur) => (cur && cur.id === openId && cur.messages.length !== d.messages.length ? d : cur));
      } catch { /* next tick retries */ }
    }, 5000);
    return () => clearInterval(iv);
  }, [openId]);

  const messageCount = selected?.messages.length ?? 0;
  useEffect(() => { transcript.current?.scrollTo({ top: transcript.current.scrollHeight }); }, [openId, messageCount]);

  async function sendReply() {
    const text = reply.trim();
    if (!text || !selected || sending) return;
    setSending(true);
    try {
      await replyPlatformChat(selected.id, text);
      setReply('');
      setSelected(await getPlatformChat(selected.id));
      void load();
    } catch { setError('Failed to send reply'); } finally { setSending(false); }
  }

  async function open(id: string) {
    try { setSelected(await getPlatformChat(id)); } catch { setError('Failed to open chat'); }
  }

  async function remove(c: ChatDetail) {
    if (!window.confirm(`Permanently delete the chat with ${c.name}? This cannot be undone.`)) return;
    try {
      await deletePlatformChat(c.id);
      setSelected(null);
      await load();
    } catch { setError('Failed to delete chat'); }
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <PlatformNav title="Elorge — Website Chats" />
      <div className="mx-auto max-w-6xl px-6 pt-4">
        <Link href="/super-admin" className="text-sm text-brand-blue underline">← Back to super admin</Link>
      </div>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <MessageCircle size={20} /> Website chats
        </h1>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex rounded-full border border-black/10 bg-white p-0.5 text-sm">
            {(['all', 'waiting'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-1.5 transition ${filter === f ? 'bg-brand-blue text-white' : 'text-ink/60 hover:text-ink'}`}
              >
                {f === 'all' ? 'All chats' : 'Waiting for reply'}
              </button>
            ))}
          </div>
          <label className="flex flex-1 items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 sm:max-w-xs">
            <Search size={14} className="text-ink/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, email, phone or #tag"
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink/40"
            />
          </label>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          {/* List */}
          <div className="flex flex-col gap-2">
            {chats.length === 0 ? (
              <p className="card text-sm text-ink/40">{filter === 'waiting' ? 'Nobody is waiting. 🎉' : 'No chats yet.'}</p>
            ) : (
              chats.map((c) => (
                <button
                  key={c.id}
                  onClick={() => void open(c.id)}
                  className={`card w-full text-left transition ${selected?.id === c.id ? 'ring-2 ring-brand-blue/40' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {c.name} <span className="font-mono text-xs text-ink/40">#{c.tag}</span>
                      </p>
                      <p className="truncate text-xs text-ink/50">{[countryName(c.countryCode), c.email].filter(Boolean).join(' · ') || 'No contact details'}</p>
                    </div>
                    {c.waitingSince ? (
                      <span className="shrink-0 rounded-full bg-amber/20 px-2.5 py-0.5 text-xs font-medium text-ink">
                        Waiting {minutesAgo(c.waitingSince)} min
                      </span>
                    ) : c.lastAgentAt ? (
                      <span className="shrink-0 rounded-full bg-brand-green/10 px-2.5 py-0.5 text-xs font-medium text-brand-green">Answered</span>
                    ) : null}
                  </div>
                  {c.lastMessage && (
                    <p className="mt-2 line-clamp-2 text-sm text-ink/60">
                      <span className="text-ink/40">
                        {c.lastMessage.sender === 'VISITOR' ? 'Visitor: ' : c.lastMessage.sender === 'BOT' ? 'Bot: ' : 'Agent: '}
                      </span>
                      {c.lastMessage.text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-ink/40">{when(c.createdAt)} · {c.messageCount} messages</p>
                </button>
              ))
            )}
          </div>

          {/* Transcript */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            {!selected ? (
              <p className="card text-sm text-ink/40">Select a chat to read the full conversation.</p>
            ) : (
              <div className="card flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-lg font-semibold">{selected.name}</p>
                    <p className="text-xs text-ink/50">
                      {countryName(selected.countryCode) ? `${countryName(selected.countryCode)} · ` : ''}started {when(selected.createdAt)}
                      {selected.pageUrl ? ` · from ${selected.pageUrl}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => void remove(selected)}
                    className="flex shrink-0 items-center gap-1 text-xs text-red-600 hover:underline"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>

                {(selected.email || selected.phone) && (
                  <div className="flex flex-wrap gap-2">
                    {selected.email && (
                      <a
                        href={`mailto:${selected.email}?subject=${encodeURIComponent('Your chat with Elorge Schools')}`}
                        className="btn-secondary flex items-center gap-1.5 !px-3 !py-1.5 text-sm"
                      >
                        <Mail size={14} /> {selected.email}
                      </a>
                    )}
                    {selected.phone && (
                      <a href={`tel:${selected.phone.replace(/[^\d+]/g, '')}`} className="btn-secondary flex items-center gap-1.5 !px-3 !py-1.5 text-sm">
                        <Phone size={14} /> {selected.phone}
                      </a>
                    )}
                  </div>
                )}

                <div ref={transcript} className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto rounded-lg bg-black/[0.02] p-3">
                  {selected.messages.map((m) => (
                    <div key={m.id} className={`flex flex-col ${m.sender === 'VISITOR' ? 'items-start' : 'items-end'}`}>
                      <span className="mb-1 flex items-center gap-1 text-[11px] text-ink/50">
                        {m.sender === 'BOT' ? <Bot size={12} /> : m.sender === 'AGENT' ? <Headset size={12} /> : null}
                        {m.sender === 'VISITOR' ? selected.name : m.sender === 'BOT' ? 'Elorge Bot' : m.agentName ?? 'Agent'} · {when(m.createdAt)}
                      </span>
                      <div
                        className={`max-w-[88%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm ${
                          m.sender === 'VISITOR'
                            ? 'bg-white text-ink ring-1 ring-black/10'
                            : m.sender === 'BOT'
                              ? 'bg-brand-blue/10 text-ink'
                              : 'bg-brand-blue text-white'
                        }`}
                      >
                        {m.text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendReply(); } }}
                    maxLength={1000}
                    placeholder={`Reply to ${selected.name}…`}
                    className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-ink/40 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                  />
                  <button
                    onClick={() => void sendReply()}
                    disabled={!reply.trim() || sending}
                    aria-label="Send reply"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white transition hover:bg-brand-blue-dark disabled:opacity-40"
                  >
                    <Send size={16} />
                  </button>
                </div>
                <p className="text-xs text-ink/40">The visitor sees your reply in their chat (or by email if they have left). It is also posted to the Telegram group so nobody answers twice.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
