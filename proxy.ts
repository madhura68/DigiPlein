import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { sessionOptions } from '@/lib/session'

// Alles achter login (hardstop 5). proxy.ts is de Next 16-conventie (géén
// middleware.ts). Hier wordt alleen de cookie-aanwezigheid gecheckt; de echte
// sessie-validatie en rolcheck gebeuren server-side via lib/auth.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = Boolean(
    request.cookies.get(sessionOptions.cookieName)?.value
  )
  const isLoginRoute = pathname === '/login'

  if (!hasSession && !isLoginRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (hasSession && isLoginRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
