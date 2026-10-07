// web/lib/endpoints/platform-leads.ts
import { apiFetch, getToken } from '../api';

export const LEAD_STATUSES = ['NEW', 'CONTACTED', 'DEMO_BOOKED', 'SIGNED_UP', 'LOST'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type ActivityKind = 'CHAT_STARTED' | 'DEMO_REQUESTED' | 'SIGNUP_REQUESTED' | 'NOTE' | 'STATUS_CHANGED';

export interface LeadActivity { id: string; kind: ActivityKind; text: string; author: string | null; createdAt: string }
export interface Lead {
  id: string; name: string; email: string | null; phone: string | null; countryCode: string | null; schoolName: string | null;
  status: LeadStatus; chatId: string | null; lastActivityAt: string; createdAt: string;
}
export interface LeadListItem extends Lead { lastActivity: LeadActivity | null }
export interface LeadDetail extends Lead { activities: LeadActivity[] }
export interface LeadList { counts: Record<LeadStatus, number>; leads: LeadListItem[] }

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function listLeads(params: { status?: LeadStatus | 'ALL'; q?: string } = {}): Promise<LeadList> {
  const qs = new URLSearchParams();
  if (params.status && params.status !== 'ALL') qs.set('status', params.status);
  if (params.q?.trim()) qs.set('q', params.q.trim());
  const s = qs.toString();
  return apiFetch(`/platform/leads${s ? `?${s}` : ''}`);
}

export const getLead = (id: string): Promise<LeadDetail> => apiFetch(`/platform/leads/${id}`);

export const setLeadStatus = (id: string, status: LeadStatus): Promise<LeadDetail> =>
  apiFetch(`/platform/leads/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });

export const addLeadNote = (id: string, text: string): Promise<LeadDetail> =>
  apiFetch(`/platform/leads/${id}/notes`, { method: 'POST', body: JSON.stringify({ text }) });

/** Downloads the CSV through an authenticated request (a plain link could not send the login token). */
export async function downloadLeadsCsv(status?: LeadStatus | 'ALL'): Promise<void> {
  const qs = status && status !== 'ALL' ? `?status=${status}` : '';
  const res = await fetch(`${API_URL}/platform/leads/export${qs}`, { headers: { Authorization: `Bearer ${getToken() ?? ''}` } });
  if (!res.ok) throw new Error('Export failed');
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement('a');
  a.href = url;
  a.download = `elorge-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
