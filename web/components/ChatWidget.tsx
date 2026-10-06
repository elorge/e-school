// web/components/ChatWidget.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X, Bot, Headset } from 'lucide-react';
import { useMarketingLocale } from '@/lib/marketing-locale';
import { chatLabelsFor } from '@/lib/i18n/chat-labels';
import { SUPPORTED_COUNTRIES } from '@/lib/currency';
import { CONTACT_EMAIL } from '@/lib/site';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const STORE_KEY = 'elorge-chat-v1';
const INPUT =
  'w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20';

/** Marketing pages only — never inside a school's own app, result lookup or CBT sessions. */
const SHOW_ON = ['/', '/about', '/contact', '/pricing', '/careers', '/signup', '/features'];

interface ChatMsg {
  id: string;
  seq: number;
  sender: 'VISITOR' | 'AGENT' | 'BOT';
  text: string;
  agentName: string | null;
}
interface Stored {
  token?: string;
  name?: string;
  email?: string;
  phone?: string;
  countryCode?: string;
}

function readStore(): Stored {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch { return {}; }
}
function writeStore(patch: Stored) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify({ ...readStore(), ...patch })); } catch { /* storage blocked */ }
}

/** Renders [label](/internal-path) as in-site links; everything else stays plain text (no HTML is ever injected). */
function RichText({ text, onNavigate }: { text: string; onNavigate: () => void }) {
  const parts: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\((\/(?!\/)[^)\s]*)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(<Fragment key={i++}>{text.slice(last, m.index)}</Fragment>);
    parts.push(
      <Link key={i++} href={m[2]} onClick={onNavigate} className="font-medium underline underline-offset-2">
        {m[1]}
      </Link>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(<Fragment key={i++}>{text.slice(last)}</Fragment>);
  return <>{parts}</>;
}

export default function ChatWidget() {
  const pathname = usePathname() ?? '/';
  const { locale } = useMarketingLocale();
  const t = chatLabelsFor(locale);

  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [unread, setUnread] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [offline, setOffline] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', countryCode: '', message: '', website: '' });

  const lastSeq = useRef(0);
  const openRef = useRef(false);
  const box = useRef<HTMLDivElement>(null);
  openRef.current = open;

  const visible = SHOW_ON.some((p) => (p === '/' ? pathname === '/' : pathname === p || pathname.startsWith(p + '/')));

  // Restore a previous conversation / prefill known details.
  useEffect(() => {
    const s = readStore();
    if (s.token) setToken(s.token);
    setForm((f) => ({ ...f, name: s.name ?? '', email: s.email ?? '', phone: s.phone ?? '', countryCode: s.countryCode ?? '' }));
  }, []);

  // Let other buttons (footer, contact page) open the chat.
  useEffect(() => {
    const openIt = () => { setOpen(true); setUnread(0); };
    window.addEventListener('elorge:open-chat', openIt);
    return () => window.removeEventListener('elorge:open-chat', openIt);
  }, []);

  // Slide the floating button away from the final CTA so it never covers it.
  useEffect(() => {
    const target = document.getElementById('whatsapp-avoid');
    if (!target) { setHidden(false); return; }
    const obs = new IntersectionObserver(([e]) => setHidden(e.isIntersecting), { rootMargin: '0px 0px -80px 0px' });
    obs.observe(target);
    return () => obs.disconnect();
  }, [pathname]);

  const merge = useCallback((incoming: ChatMsg[]) => {
    if (!incoming.length) return;
    setMsgs((cur) => {
      const seen = new Set(cur.map((m) => m.seq));
      const add = incoming.filter((m) => !seen.has(m.seq));
      if (!add.length) return cur;
      if (!openRef.current) setUnread((u) => u + add.filter((m) => m.sender !== 'VISITOR').length);
      return [...cur, ...add].sort((a, b) => a.seq - b.seq);
    });
  }, []);

  const poll = useCallback(async (tok: string) => {
    if (document.hidden) return;
    try {
      const res = await fetch(`${API_URL}/chat/messages?after=${lastSeq.current}`, { headers: { 'x-chat-token': tok } });
      if (res.status === 404) { // conversation no longer exists — start fresh
        writeStore({ token: undefined });
        setToken(null); setMsgs([]); lastSeq.current = 0;
        return;
      }
      if (!res.ok) return;
      const data = (await res.json()) as { messages: ChatMsg[] };
      if (data.messages.length) {
        lastSeq.current = Math.max(lastSeq.current, ...data.messages.map((m) => m.seq));
        merge(data.messages);
      }
    } catch { /* offline blip — next tick retries */ }
  }, [merge]);

  useEffect(() => {
    if (!token) return;
    void poll(token);
    const id = setInterval(() => void poll(token), open ? 3000 : 15000);
    return () => clearInterval(id);
  }, [token, open, poll]);

  useEffect(() => { box.current?.scrollTo({ top: box.current.scrollHeight, behavior: 'smooth' }); }, [msgs, open]);

  const validate = () => {
    // Only name and message are required; email / phone / country are checked only if filled in.
    if (form.name.trim().length < 2) return t.errName;
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) return t.errEmail;
    if (form.phone.trim() && form.phone.replace(/\D/g, '').length < 7) return t.errPhone;
    if (!form.message.trim()) return t.errMessage;
    return '';
  };

  async function start(e: React.FormEvent) {
    e.preventDefault();
    const problem = validate();
    if (problem) { setError(problem); return; }
    setError(''); setBusy(true);
    try {
      const res = await fetch(`${API_URL}/chat/start`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          message: form.message.trim(),
          website: form.website,
          ...(form.email.trim() && { email: form.email.trim() }),
          ...(form.phone.trim() && { phone: form.phone.trim() }),
          ...(form.countryCode && { countryCode: form.countryCode }),
          locale,
          pageUrl: pathname,
        }),
      });
      if (res.status === 503) { setOffline(true); return; }
      if (!res.ok) { setError(t.errSend); return; }
      const data = (await res.json()) as { token: string; messages: ChatMsg[] };
      writeStore({ token: data.token, name: form.name, email: form.email, phone: form.phone, countryCode: form.countryCode });
      lastSeq.current = Math.max(0, ...data.messages.map((m) => m.seq));
      setMsgs(data.messages);
      setToken(data.token);
      setForm((f) => ({ ...f, message: '' }));
    } catch { setError(t.errSend); } finally { setBusy(false); }
  }

  async function sendMessage() {
    const body = text.trim();
    if (!body || !token) return;
    setText(''); setError('');
    try {
      const res = await fetch(`${API_URL}/chat/messages`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-chat-token': token },
        body: JSON.stringify({ text: body }),
      });
      if (!res.ok) throw new Error();
      // Show it now, but don't advance the poll cursor — a bot reply may sit just before it.
      merge([(await res.json()) as ChatMsg]);
    } catch { setError(t.errSend); setText(body); }
  }

  function newChat() {
    writeStore({ token: undefined });
    setToken(null); setMsgs([]); lastSeq.current = 0; setOffline(false);
  }

  if (!visible) return null;

  return (
    <>
      {!open && (
        <button
          onClick={() => { setOpen(true); setUnread(0); }}
          aria-label={t.openAria}
          className={`fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-brand-blue px-4 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:bg-brand-blue-dark ${
            hidden ? 'pointer-events-none translate-y-4 opacity-0' : 'opacity-100'
          }`}
        >
          <MessageCircle size={20} />
          <span className="hidden sm:inline">{t.fab}</span>
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber px-1 text-xs font-semibold text-ink">
              {unread}
            </span>
          )}
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label={t.title}
          className="fixed inset-x-3 bottom-3 z-50 flex h-[min(600px,calc(100dvh-24px))] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl sm:inset-x-auto sm:right-4 sm:w-[380px]"
        >
          {/* Header */}
          <div className="flex items-center gap-3 bg-brand-blue px-4 py-3 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15"><Headset size={18} /></div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-base font-semibold leading-tight">{t.title}</p>
              <p className="flex items-center gap-1.5 truncate text-xs text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-green" /> {t.subtitle}
              </p>
            </div>
            <button onClick={() => setOpen(false)} aria-label={t.minimize} className="rounded-full p-1.5 transition hover:bg-white/15">
              <X size={18} />
            </button>
          </div>

          {offline ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="font-display text-lg font-semibold text-ink">{t.offlineTitle}</p>
              <p className="text-sm text-ink/60">{t.offlineBody}</p>
              <a href={`mailto:${CONTACT_EMAIL}`} className="btn-primary">{t.emailUs}</a>
            </div>
          ) : !token ? (
            /* Pre-chat form */
            <form onSubmit={start} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4" noValidate>
              <p className="text-sm text-ink/70">{t.formIntro}</p>
              <input className={`${INPUT}`} placeholder={t.name} autoComplete="name" value={form.name} maxLength={80}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className={`${INPUT}`} placeholder={`${t.email} (${t.optional})`} type="email" autoComplete="email" value={form.email} maxLength={160}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className={`${INPUT}`} placeholder={`${t.phone} (${t.optional})`} type="tel" autoComplete="tel" value={form.phone} maxLength={24}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <select className={`${INPUT}`} aria-label={t.country} value={form.countryCode}
                onChange={(e) => setForm({ ...form, countryCode: e.target.value })}>
                <option value="">{`${t.selectCountry} (${t.optional})`}</option>
                {SUPPORTED_COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                <option value="ZZ">{t.otherCountry}</option>
              </select>
              <textarea className={`${INPUT} min-h-[84px] resize-none`} placeholder={t.message} value={form.message} maxLength={1000}
                onChange={(e) => setForm({ ...form, message: e.target.value })} />
              <p className="-mt-1 text-xs text-ink/50">{t.contactHint}</p>
              {/* Honeypot: invisible to people, tempting to bots */}
              <input tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0"
                value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
              <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">{busy ? t.starting : t.startChat}</button>
              <p className="text-center text-xs text-ink/40">{t.privacyNote}</p>
            </form>
          ) : (
            /* Conversation */
            <>
              <div ref={box} className="flex flex-1 flex-col gap-3 overflow-y-auto bg-black/[0.02] p-4" aria-live="polite">
                {msgs.map((m) => (
                  <div key={m.seq} className={`flex flex-col ${m.sender === 'VISITOR' ? 'items-end' : 'items-start'}`}>
                    {m.sender !== 'VISITOR' && (
                      <span className="mb-1 flex items-center gap-1 text-[11px] font-medium text-ink/50">
                        {m.sender === 'BOT' ? <Bot size={12} /> : <Headset size={12} />}
                        {m.sender === 'BOT' ? t.bot : `${m.agentName ?? t.team} · ${t.team}`}
                      </span>
                    )}
                    <div
                      className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        m.sender === 'VISITOR'
                          ? 'rounded-br-md bg-brand-blue text-white'
                          : m.sender === 'BOT'
                            ? 'rounded-bl-md bg-brand-blue/10 text-ink [&_a]:text-brand-blue'
                            : 'rounded-bl-md border border-brand-green/30 bg-white text-ink'
                      }`}
                    >
                      <RichText text={m.text} onNavigate={() => setOpen(false)} />
                    </div>
                  </div>
                ))}
              </div>
              {error && <p className="px-4 pb-1 text-sm text-red-600" role="alert">{error}</p>}
              <div className="flex items-center gap-2 border-t border-black/5 p-3">
                <input
                  className={`${INPUT} flex-1`} placeholder={t.typeMessage} value={text} maxLength={1000}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendMessage(); } }}
                />
                <button onClick={() => void sendMessage()} aria-label={t.send} disabled={!text.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue text-white transition hover:bg-brand-blue-dark disabled:opacity-40">
                  <Send size={16} />
                </button>
              </div>
              <button onClick={newChat} className="border-t border-black/5 py-2 text-xs text-ink/40 transition hover:text-ink/70">{t.newChat}</button>
            </>
          )}
        </div>
      )}
    </>
  );
}
