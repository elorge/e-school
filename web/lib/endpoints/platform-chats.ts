// web/lib/endpoints/platform-chats.ts
import { apiFetch } from '../api';

export interface ChatSummary {
  id: string;
  tag: string;
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  locale: string;
  pageUrl: string | null;
  waitingSince: string | null;
  lastAgentAt: string | null;
  createdAt: string;
  messageCount: number;
  lastMessage: { sender: 'VISITOR' | 'AGENT' | 'BOT'; text: string; createdAt: string } | null;
}

export interface ChatDetail extends Omit<ChatSummary, 'messageCount' | 'lastMessage'> {
  messages: { id: string; seq: number; sender: 'VISITOR' | 'AGENT' | 'BOT'; text: string; agentName: string | null; createdAt: string }[];
}

export function listPlatformChats(params: { filter?: 'all' | 'waiting'; q?: string } = {}): Promise<ChatSummary[]> {
  const qs = new URLSearchParams();
  if (params.filter === 'waiting') qs.set('filter', 'waiting');
  if (params.q?.trim()) qs.set('q', params.q.trim());
  const s = qs.toString();
  return apiFetch(`/platform/chats${s ? `?${s}` : ''}`);
}

export function getPlatformChat(id: string): Promise<ChatDetail> {
  return apiFetch(`/platform/chats/${id}`);
}

export function deletePlatformChat(id: string): Promise<void> {
  return apiFetch(`/platform/chats/${id}`, { method: 'DELETE' });
}

export function replyPlatformChat(id: string, text: string): Promise<{ ok: boolean; outcome: string }> {
  return apiFetch(`/platform/chats/${id}/reply`, { method: 'POST', body: JSON.stringify({ text }) });
}
