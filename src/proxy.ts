import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ============================================
  // 1. Pehle next-intl locale handling
  // ============================================
  const response = intlMiddleware(request)

  // Locale hata ke clean path nikaalo (auth ke liye)
  // Example: /hi/dashboard → /dashboard
  const pathWithoutLocale = pathname.replace(
    /^\/(en|hi|bn|te|mr|ta|gu|ur|kn|or|ml|pa|as)(?=\/|$)/,
    ''
  ) || '/'

  const godmode = request.cookies.get('paimana_godmode')?.value === 'true'
  const session = request.cookies.get('paimana_session')?.value === 'true'

  // ============================================
  // 2. /register → /login (locale ke saath)
  // ============================================
  if (pathWithoutLocale.startsWith('/register')) {
    const locale = pathname.split('/')[1] || 'en'
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
  }

  // ============================================
  // 3. Super Admin protection
  // ============================================
  if (pathWithoutLocale.startsWith('/super-admin')) {
    if (!godmode) {
      const locale = pathname.split('/')[1] || 'en'
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
    }
    return response
  }

  // ============================================
  // 4. Admin panel protection
  // ============================================
  if (pathWithoutLocale.startsWith('/admin')) {
    if (!godmode && !session) {
      const locale = pathname.split('/')[1] || 'en'
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
    }
    return response
  }

  // ============================================
  // 5. Dashboard protection
  // ============================================
  if (pathWithoutLocale.startsWith('/dashboard')) {
    if (!session && !godmode) {
      const locale = pathname.split('/')[1] || 'en'
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
    }
    return response
  }

  // ============================================
  // 6. Already logged-in → sahi jagah bhejo
  // ============================================
  if (pathWithoutLocale === '/login') {
    const locale = pathname.split('/')[1] || 'en'

    if (godmode) {
      return NextResponse.redirect(new URL(`/${locale}/super-admin`, request.url))
    }
    if (session) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    // Saari routes except static files + api
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
}