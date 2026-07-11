// web/lib/endpoints/calendar.ts
import { apiFetch } from '../api';
import type { CalendarEvent, CalendarEventType } from '../types';

export function listCalendarEvents(school: string, termId?: string): Promise<CalendarEvent[]> {
  const qs = termId ? `?termId=${termId}` : '';
  return apiFetch(`/${school}/calendar${qs}`);
}

export function createCalendarEvent(
  school: string,
  body: { termId?: string; type: CalendarEventType; title: string; startDate: string; endDate?: string; description?: string },
): Promise<CalendarEvent> {
  return apiFetch(`/${school}/calendar`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateCalendarEvent(
  school: string,
  id: string,
  body: Partial<{ termId: string; type: CalendarEventType; title: string; startDate: string; endDate: string; description: string }>,
): Promise<CalendarEvent> {
  return apiFetch(`/${school}/calendar/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteCalendarEvent(school: string, id: string): Promise<void> {
  return apiFetch(`/${school}/calendar/${id}`, { method: 'DELETE' });
}

/** Returns a PDF Blob — same pattern as report cards. */
export async function downloadCalendarPdf(school: string, termId: string): Promise<Blob> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const { getToken } = await import('../api');
  const token = getToken();
  const res = await fetch(`${API_URL}/${school}/calendar/pdf?termId=${termId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Failed to fetch calendar PDF: ${res.status}`);
  return res.blob();
}

/** Returns a draft — nothing is saved. Show these in an editable UI, then call createCalendarEvent for each one the admin confirms. */
export function generateTermSchedule(
  school: string,
  body: { termId: string; startDate: string; weeks: number; midtermBreakWeek?: number; examWeeks?: number },
): Promise<Omit<CalendarEvent, 'id' | 'schoolId'>[]> {
  return apiFetch(`/${school}/calendar/generate-term-schedule`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}