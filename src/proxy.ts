import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const godmode = request.cookies.get('paimana_godmode')?.value === 'true'
  const session = request.cookies.get('paimana_session')?.value === 'true'

  // ============================================
  // 1. /register pe koi bhi aaye → seedha /login
  // ============================================
  if (pathname.startsWith('/register')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ============================================
  // 2. Super Admin (God Mode) protection
  // ============================================
  if (pathname.startsWith('/super-admin')) {
    if (!godmode) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  // ============================================
  // 3. Admin panel protection
  // ============================================
  if (pathname.startsWith('/admin')) {
    // Super Admin bhi ja sakta hai, ya normal admin session
    if (!godmode && !session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  // ============================================
  // 4. Dashboard + saare sub-routes protection
  // ============================================
  if (pathname.startsWith('/dashboard')) {
    if (!session && !godmode) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  // ============================================
  // 5. Already logged-in user /login pe aaye toh redirect
  // ============================================
  if (pathname === '/login') {
    if (godmode) {
      return NextResponse.redirect(new URL('/super-admin', request.url))
    }
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // ============================================
  // 6. Baaki public pages (home, etc.) free
  // ============================================
  return NextResponse.next()
}

// Sirf in routes pe middleware chale
export const config = {
  matcher: [
    '/register/:path*',
    '/super-admin/:path*',
    '/admin/:path*',
    '/dashboard/:path*',
    '/login',
  ],
}