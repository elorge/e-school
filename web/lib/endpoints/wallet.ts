// web/lib/endpoints/wallet.ts
import { apiFetch } from '../api';

export function getBalance(school: string): Promise<{ balanceKobo: number }> {
  return apiFetch(`/${school}/wallet/balance`);
}

export function getBalanceInStudentUnits(
  school: string,
  pricePerStudentKobo?: number,
): Promise<{ balanceKobo: number; studentPinsAvailable: number }> {
  const qs = pricePerStudentKobo ? `?pricePerStudentKobo=${pricePerStudentKobo}` : '';
  return apiFetch(`/${school}/wallet/balance/student-units${qs}`);
}

/** Flutterwave only — `provider` removed. Charges in the school's own currency (School.currency) server-side. */
export function initializePayment(
  school: string,
  body: { amountKobo: number; payerEmail: string },
): Promise<{ redirectUrl: string; reference: string }> {
  return apiFetch(`/${school}/payments/initialize`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}