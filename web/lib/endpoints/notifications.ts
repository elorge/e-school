// web/lib/endpoints/notifications.ts
import { apiFetch } from '../api';

export interface Notification {
  id: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export function listNotifications(): Promise<Notification[]> {
  return apiFetch('/notifications');
}

export function unreadCount(): Promise<number> {
  return apiFetch('/notifications/unread-count');
}

export function markRead(id: string) {
  return apiFetch(`/notifications/${id}/read`, { method: 'POST' });
}

export function markAllRead() {
  return apiFetch('/notifications/read-all', { method: 'POST' });
}