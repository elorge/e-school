// web/app/super-admin/leads/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import PlatformNav from '@/components/PlatformNav';
import LoadingScreen from '@/components/LoadingScreen';
import { getSessionUser } from '@/lib/session';
import {
  LEAD_STATUSES, addLeadNote, downloadLeadsCsv, getLead, listLeads, setLeadStatus,
  type ActivityKind, type LeadDetail, type LeadList, type LeadStatus,
} from '@/lib/endpoints/platform-leads';
import { Download, Mail, MessageCircle, Phone, Search, Send, Target } from 'lucide-react';

const STATUS_LABEL: Record<LeadStatus, string> = {
  NEW: 'New', CONTACTED: 'Contacted', DEMO_BOOKED: 'Demo booked', SIGNED_UP: 'Signed up', LOST: 'Lost',
};
const STATUS_STYLE: Record<LeadStatus, string> = {
  NEW: 'bg-amber/20 text-ink', CONTACTED: 'bg-brand-blue/10 text-brand-blue', DEMO_BOOKED: 'bg-brand-blue/20 text-brand-blue',
  SIGNED_UP: 'bg-brand-green/10 text-brand-green', LOST: 'bg-black/5 text-ink/50',
};
const KIND_LABEL: Record<ActivityKind, string> = {
  CHAT_STARTED: 'Chat', DEMO_REQUESTED: 'Demo request', SIGNUP_REQUESTED: 'Signup request', NOTE: 'Note', STATUS_CHANGED: 'Status',
};
const countryName = (code: string | null) => {
  if (!code) return '';
  if (code === 'ZZ') return 'Other';
  try { return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code; } catch { return code; }
};
const when = (iso: string) => new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

export default function PlatformLeadsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<LeadList | null>(null);
  const [filter, setFilter] = useState<LeadStatus | 'ALL'>('ALL');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<LeadDetail | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try { setData(await listLeads({ status: filter, q: query })); setError(null); }
    catch { setError('Failed to load leads'); }
    finally { setIsLoading(false); }
  }, [filter, query]);

  useEffect(() => {
    const user = getSessionUser();
    if (user && user.role !== 'SUPER_ADMIN') window.location.href = '/login';
  }, []);

  useEffect(() => {
    const t = setTimeout(() => void load(), 250);
    const iv = setInterval(() => void load(), 30000);
    return () => { clearTimeout(t); clearInterval(iv); };
  }, [load]);

  async function open(id: string) {
    try { setSelected(await getLead(id)); } catch { setError('Failed to open lead'); }
  }

  async function changeStatus(status: LeadStatus) {
    if (!selected || busy || status === selected.status) return;
    setBusy(true);
    try { setSelected(await setLeadStatus(selected.id, status)); void load(); }
    catch { setError('Failed to update status'); } finally { setBusy(false); }
  }

  async function saveNote() {
    const text = note.trim();
    if (!text || !selected || busy) return;
    setBusy(true);
    try { setSelected(await addLeadNote(selected.id, text)); setNote(''); void load(); }
    catch { setError('Failed to save note'); } finally { setBusy(false); }
  }

  async function exportCsv() {
    try { await downloadLeadsCsv(filter); } catch { setError('Export failed'); }
  }

  if (isLoading) return <LoadingScreen />;

  const total = data ? Object.values(data.counts).reduce((a, b) => a + b, 0) : 0;

  return (
    <>
      <PlatformNav title="Elorge — Leads" />
      <div className="mx-auto max-w-6xl px-6 pt-4">
        <Link href="/super-admin" className="text-sm text-brand-blue underline">← Back to super admin</Link>
      </div>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 text-xl font-semibold"><Target size={20} /> Leads</h1>
          <button onClick={() => void exportCsv()} className="btn-secondary flex items-center gap-1.5 !px-4 !py-2 text-sm">
            <Download size={14} /> Export CSV{filter !== 'ALL' ? ` (${STATUS_LABEL[filter]})` : ''}
          </button>
        </div>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1 rounded-2xl border border-black/10 bg-white p-1 text-sm">
            {(['ALL', ...LEAD_STATUSES] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-full px-3.5 py-1.5 transition ${filter === s ? 'bg-brand-blue text-white' : 'text-ink/60 hover:text-ink'}`}
              >
                {s === 'ALL' ? 'All' : STATUS_LABEL[s]}{' '}
                <span className={filter === s ? 'text-white/70' : 'text-ink/40'}>{s === 'ALL' ? total : data?.counts[s] ?? 0}</span>
              </button>
            ))}
          </div>
          <label className="flex flex-1 items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 sm:max-w-xs">
            <Search size={14} className="text-ink/40" />
            <input
              value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, email, phone or school"
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink/40"
            />
          </label>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          {/* List */}
          <div className="flex flex-col gap-2">
            {!data?.leads.length ? (
              <p className="card text-sm text-ink/40">No leads here yet. Chats, demo requests and signups appear automatically.</p>
            ) : data.leads.map((l) => (
              <button
                key={l.id} onClick={() => void open(l.id)}
                className={`card w-full text-left transition ${selected?.id === l.id ? 'ring-2 ring-brand-blue/40' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{l.name}{l.schoolName && <span className="font-normal text-ink/50"> · {l.schoolName}</span>}</p>
                    <p className="truncate text-xs text-ink/50">
                      {[countryName(l.countryCode), l.email].filter(Boolean).join(' · ') || 'No contact details'}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[l.status]}`}>{STATUS_LABEL[l.status]}</span>
                </div>
                {l.lastActivity && (
                  <p className="mt-2 line-clamp-2 text-sm text-ink/60">
                    <span className="text-ink/40">{KIND_LABEL[l.lastActivity.kind]}: </span>{l.lastActivity.text}
                  </p>
                )}
                <p className="mt-2 text-xs text-ink/40">Last activity {when(l.lastActivityAt)}</p>
              </button>
            ))}
          </div>

          {/* Detail */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            {!selected ? (
              <p className="card text-sm text-ink/40">Select a lead to see their history, change status or add a note.</p>
            ) : (
              <div className="card flex flex-col gap-4">
                <div>
                  <p className="font-display text-lg font-semibold">{selected.name}</p>
                  <p className="text-xs text-ink/50">
                    {[selected.schoolName, countryName(selected.countryCode)].filter(Boolean).join(' · ')}
                    {(selected.schoolName || selected.countryCode) && ' · '}first seen {when(selected.createdAt)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selected.email && (
                    <a href={`mailto:${selected.email}`} className="btn-secondary flex items-center gap-1.5 !px-3 !py-1.5 text-sm"><Mail size={14} /> {selected.email}</a>
                  )}
                  {selected.phone && (
                    <a href={`tel:${selected.phone.replace(/[^\d+]/g, '')}`} className="btn-secondary flex items-center gap-1.5 !px-3 !py-1.5 text-sm"><Phone size={14} /> {selected.phone}</a>
                  )}
                  {selected.chatId && (
                    <Link href={`/super-admin/chats?open=${selected.chatId}`} className="btn-secondary flex items-center gap-1.5 !px-3 !py-1.5 text-sm"><MessageCircle size={14} /> Open chat</Link>
                  )}
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-medium text-ink/50">Status</p>
                  <div className="flex flex-wrap gap-1.5">
                    {LEAD_STATUSES.map((s) => (
                      <button
                        key={s} onClick={() => void changeStatus(s)} disabled={busy}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                          selected.status === s ? `${STATUS_STYLE[s]} ring-2 ring-black/10` : 'border border-black/10 text-ink/50 hover:text-ink'
                        }`}
                      >
                        {STATUS_LABEL[s]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} placeholder="Add a note (call outcome, next step…)"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void saveNote(); } }}
                    className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-ink/40 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                  />
                  <button
                    onClick={() => void saveNote()} disabled={!note.trim() || busy} aria-label="Save note"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white transition hover:bg-brand-blue-dark disabled:opacity-40"
                  >
                    <Send size={16} />
                  </button>
                </div>

                <ol className="flex max-h-[45vh] flex-col gap-3 overflow-y-auto border-l-2 border-black/10 pl-4">
                  {selected.activities.map((a) => (
                    <li key={a.id} className="relative">
                      <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-brand-blue" />
                      <p className="text-xs text-ink/40">
                        {KIND_LABEL[a.kind]}{a.author ? ` · ${a.author}` : ''} · {when(a.createdAt)}
                      </p>
                      <p className="whitespace-pre-wrap break-words text-sm text-ink/80">{a.text}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
