// web/lib/endpoints/demos.ts
import { apiFetch } from '../api';

export interface DemoRequestPayload {
  name: string;
  schoolName: string;
  email: string;
  phone?: string;
  countryCode: string;
  preferredDate?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  timezone?: string;
  studentCount?: string;
  message?: string;
  locale?: string;
  website?: string;
}

export function requestDemo(payload: DemoRequestPayload): Promise<{ ok: boolean }> {
  return apiFetch('/demos', { method: 'POST', body: JSON.stringify(payload) });
}
