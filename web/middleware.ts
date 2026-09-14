// web/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * Marketing/auth pages (homepage, about, signup, login, etc.) have no
 * school to read a locale off of — unlike everything under [school]/,
 * which gets its language from School.locale via SchoolProvider. This
 * sets a NEXT_LOCALE cookie from the visitor's browser language on
 * first visit, so a French-speaking visitor's browser lands on French
 * marketing copy without needing to click a switcher first. The
 * MarketingLocaleProvider (lib/marketing-locale.tsx) reads this cookie
 * client-side; the language switcher in SiteHeader overwrites it.
 *
 * [school]/ routes are explicitly excluded via the matcher below — they
 * must never be influenced by this cookie.
 */
const SUPPORTED = ['en', 'fr'];

export function middleware(request: NextRequest) {
  const existing = request.cookies.get('NEXT_LOCALE')?.value;
  if (existing && SUPPORTED.includes(existing)) return NextResponse.next();

  const acceptLanguage = request.headers.get('accept-language') ?? '';
  const preferred = acceptLanguage.toLowerCase().startsWith('fr') ? 'fr' : 'en';

  const response = NextResponse.next();
  response.cookies.set('NEXT_LOCALE', preferred, { maxAge: 60 * 60 * 24 * 365, path: '/' });
  return response;
}

export const config = {
  // Everything EXCEPT: [school] tenant routes, API routes, Next internals, and static files.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico|json|xml|txt)$).*)'],
};
