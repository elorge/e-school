// web/lib/analytics.ts
// Cookie-free, first-party analytics. Sends anonymous events (page, referrer host,
// UTM tags, language, device type) to our own API. No cookies, no IP address, no
// third-party scripts — and it stays silent when the browser says Do Not Track.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const STORE_KEY = 'elorge-analytics-v1';

export type AnalyticsEvent = 'page_view' | 'chat_started' | 'signup_submitted' | 'demo_requested';

interface Session {
  sid: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

let memorySession: Session | null = null; // used when sessionStorage is blocked

function randomId(): string {
  const c: Crypto | undefined = typeof crypto !== 'undefined' ? crypto : undefined;
  if (c?.randomUUID) return c.randomUUID(); // only exists in secure contexts (https / localhost)
  const bytes = c ? c.getRandomValues(new Uint8Array(16)) : Uint8Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  return Array.from(bytes, (x) => x.toString(16).padStart(2, '0')).join('');
}

/** One session per browser tab. The landing source is captured once and reused, so later events (chat, signup) are credited to where the visit began. */
function getSession(): Session {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw) as Session;
  } catch { /* storage blocked */ }
  if (memorySession) return memorySession;

  const params = new URLSearchParams(window.location.search);
  let referrer: string | undefined;
  try {
    const host = document.referrer ? new URL(document.referrer).host : '';
    if (host && host !== window.location.host) referrer = host.replace(/^www\./, '');
  } catch { /* bad referrer */ }

  const session: Session = {
    sid: randomId(),
    referrer,
    utmSource: params.get('utm_source') ?? undefined,
    utmMedium: params.get('utm_medium') ?? undefined,
    utmCampaign: params.get('utm_campaign') ?? undefined,
  };
  memorySession = session;
  try { sessionStorage.setItem(STORE_KEY, JSON.stringify(session)); } catch { /* storage blocked */ }
  return session;
}

function privacyOptOut(): boolean {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.doNotTrack === '1' || nav.globalPrivacyControl === true;
}

export function track(name: AnalyticsEvent, opts: { locale?: string } = {}) {
  if (typeof window === 'undefined' || privacyOptOut()) return;
  try {
    const s = getSession();
    void fetch(`${API_URL}/analytics/event`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        name,
        path: window.location.pathname,
        sessionId: s.sid,
        referrer: s.referrer,
        utmSource: s.utmSource,
        utmMedium: s.utmMedium,
        utmCampaign: s.utmCampaign,
        locale: opts.locale,
        device: window.innerWidth < 768 ? 'mobile' : 'desktop',
      }),
    }).catch(() => undefined);
  } catch { /* analytics must never break a page */ }
}
