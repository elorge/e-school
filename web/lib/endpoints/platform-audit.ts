// web/lib/endpoints/platform-audit.ts
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

export function listPlatformAuditLog(schoolId?: string): Promise<AuditLogEntry[]> {
  const qs = schoolId ? `?schoolId=${schoolId}` : '';
  return apiFetch(`/platform/audit-log${qs}`);
}