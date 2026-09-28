// web/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { SUPPORTED_LOCALES, SupportedLocale, isSupportedLocale } from './lib/locale';
import { marketingLocaleForCountry } from './lib/geo-locale';

/**
 * Marketing/auth pages (homepage, about, signup, login, etc.) have no
 * school to read a locale off of — unlike everything under [school]/,
 * which gets its language from School.locale via SchoolProvider. This
 * sets a NEXT_LOCALE cookie ONCE per visitor, on their very first
 * request with no cookie yet, so someone opening the site from France,
 * Brazil, or Equatorial Guinea lands on French/Portuguese/Spanish
 * marketing copy without needing to click the language switcher first.
 * The MarketingLocaleProvider (lib/marketing-locale.tsx) reads this
 * cookie client-side; the language switcher in SiteHeader overwrites it.
 *
 * After that first request, this middleware never touches the cookie
 * again — whether it was set by this auto-detection or later overwritten
 * by the visitor picking a different language themselves, it's the
 * visitor's own choice from then on for the full year the cookie lives.
 *
 * Detection order:
 *   1. The visitor's IP country, from Vercel's edge geolocation — this is
 *      the actual "which country is this request coming from" signal the
 *      person asked for. Checked two ways for robustness across Next.js
 *      versions/adapters: the `request.geo` convenience prop Next
 *      populates when deployed on Vercel, and the raw `x-vercel-ip-country`
 *      header Vercel's edge network always attaches regardless of that.
 *      Neither is present when running locally (`next dev`) or on a host
 *      other than Vercel — falls through to step 2 there.
 *   2. The browser's Accept-Language header, as a fallback signal when
 *      no geo data is available at all.
 *   3. English, if neither signal points anywhere else.
 *
 * [school]/ routes are explicitly excluded via the matcher below — they
 * must never be influenced by this cookie.
 */
export function middleware(request: NextRequest) {
  const existing = request.cookies.get('NEXT_LOCALE')?.value;
  if (existing && isSupportedLocale(existing)) return NextResponse.next();

  const geoCountry = (request as NextRequest & { geo?: { country?: string } }).geo?.country ?? request.headers.get('x-vercel-ip-country');
  const fromGeo = marketingLocaleForCountry(geoCountry);

  const acceptLanguage = request.headers.get('accept-language')?.toLowerCase() ?? '';
  const fromAcceptLanguage: SupportedLocale | undefined = SUPPORTED_LOCALES.find((l) => l !== 'en' && acceptLanguage.startsWith(l));

  const preferred: SupportedLocale = fromGeo ?? fromAcceptLanguage ?? 'en';

  const response = NextResponse.next();
  response.cookies.set('NEXT_LOCALE', preferred, { maxAge: 60 * 60 * 24 * 365, path: '/' });
  return response;
}

export const config = {
  // Everything EXCEPT: [school] tenant routes, API routes, Next internals, and static files.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico|json|xml|txt)$).*)'],
};
