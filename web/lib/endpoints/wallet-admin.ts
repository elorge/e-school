// web/lib/endpoints/wallet-admin.ts
import { apiFetch } from '../api';

export interface PendingTransfer {
  id: string;
  amountKobo: number;
  reference: string;
  createdAt: string;
  school: { name: string; slug: string };
}

export function listPendingTransfers(): Promise<PendingTransfer[]> {
  return apiFetch('/platform/wallet/manual-transfers/pending');
}

export function resolveTransfer(id: string, approve: boolean) {
  return apiFetch(`/platform/wallet/manual-transfers/${id}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ approve }),
  });
}