// web/lib/site.ts
// Single source of truth for the public site address and contact email.
// Change NEXT_PUBLIC_CONTACT_EMAIL in Vercel to switch the address everywhere.
export const SITE_URL = 'https://elorgeschools.org';
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'hello@elorgeschools.org';
