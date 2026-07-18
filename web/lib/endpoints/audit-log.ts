// web/lib/endpoints/audit-log.ts
import { apiFetch } from '../api';

export interface AuditLogEntry {
  id: string;
  schoolId: string | null;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export function listSchoolAuditLog(school: string): Promise<AuditLogEntry[]> {
  return apiFetch(`/${school}/audit-log`);
}