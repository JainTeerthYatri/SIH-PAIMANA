import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  if (path.startsWith('/api/')) return NextResponse.next()

  const hasNormalSession = request.cookies.has('paimana_session')
  const hasGodMode = request.cookies.has('paimana_godmode')
  
  // Notice: removed /register from here!
  const isPublicPage = path === '/' || path === '/login'

  // God Mode Guard
  if (path.startsWith('/super-admin')) {
    if (!hasGodMode) return NextResponse.redirect(new URL('/login', request.url))
    return NextResponse.next()
  }

  // Normal Auth Guard (Admin & Dashboard)
  if (path.startsWith('/admin') || path.startsWith('/dashboard')) {
    if (!hasNormalSession && !hasGodMode) return NextResponse.redirect(new URL('/login', request.url))
    return NextResponse.next()
  }

  // Kick out unauthenticated users
  if (!hasNormalSession && !hasGodMode && !isPublicPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from public pages
  if (isPublicPage && path !== '/') {
    if (hasGodMode) return NextResponse.redirect(new URL('/super-admin', request.url))
    if (hasNormalSession) return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}