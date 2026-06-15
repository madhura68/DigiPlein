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
  // API-routes regelen hun eigen auth (JSON 401) i.p.v. een HTML-redirect naar
  // /login — nodig o.a. voor het chat-identiteitsendpoint (contract §10.1).
  const isApiRoute = pathname.startsWith('/api/')
  const isInviteRoute = pathname.startsWith('/uitnodiging/')

  if (!hasSession && !isLoginRoute && !isApiRoute && !isInviteRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (hasSession && isLoginRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  return NextResponse.next()
}

export const config = {
  // Publieke PWA-assets (manifest + icons) MOETEN buiten de login-redirect blijven:
  // de browser haalt /manifest.webmanifest doorgaans zonder cookie op → anders 307→/login
  // → ongeldige manifest → niet installeerbaar. Idem /icon.svg en /icons/* (door de manifest gerefereerd).
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icon.svg|icons/).*)',
  ],
}
