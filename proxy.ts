import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Auth.js database-strategy session cookie names.
// __Secure- prefix is used in production (https), plain name in dev.
const SESSION_COOKIES = ['authjs.session-token', '__Secure-authjs.session-token']

const PROTECTED_PREFIXES = ['/my-pack', '/admin', '/super']

const hasSessionCookie = (req: NextRequest) =>
  SESSION_COOKIES.some((name) => !!req.cookies.get(name)?.value)

const isProtectedPath = (pathname: string) =>
  PROTECTED_PREFIXES.some((base) => pathname === base || pathname.startsWith(`${base}/`))

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLoggedIn = hasSessionCookie(request)

  // Bounce logged-in users away from the login page
  if (pathname === '/auth/login' && isLoggedIn) {
    const redirect = request.cookies.get('lpdr_redirect')?.value
    const response = NextResponse.redirect(new URL(redirect || '/my-pack', request.url))
    response.cookies.delete('lpdr_redirect')
    return response
  }

  // Fast path only. No session cookie means definitely logged out, so skip the
  // render and the session lookup. Real validation and role checks live in
  // (authenticated)/layout.tsx, admin/layout.tsx and super/layout.tsx.
  if (isProtectedPath(pathname) && !isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/my-pack/:path*', '/admin/:path*', '/super/:path*', '/auth/login']
}
