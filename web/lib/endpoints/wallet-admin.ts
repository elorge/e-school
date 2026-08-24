// web/lib/endpoints/wallet-admin.ts
import { apiFetch } from '../api';

export interface PendingTransfer {
  id: string;
  amountKobo: number;
  currency: string; // stamped on the ledger entry at creation — see WalletLedgerEntry.currency
  reference: string;
  createdAt: string;
  school: { name: string; slug: string };
}

export function listPendingTransfers(): Promise<PendingTransfer[]> {
  return apiFetch('/platform/wallet/manual-transfers/pending');
}

/** amountKobo is minor units of the TARGET SCHOOL's currency — the backend stamps that currency onto the ledger entry itself, no need to pass it here. */
export function manualCredit(schoolId: string, amountKobo: number, reason: string) {
  return apiFetch('/platform/wallet/manual-credit', {
    method: 'POST',
    body: JSON.stringify({ schoolId, amountKobo, reason }),
  });
}

export function resolveTransfer(id: string, approve: boolean) {
  return apiFetch(`/platform/wallet/manual-transfers/${id}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ approve }),
  });
}