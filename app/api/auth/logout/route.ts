import { NextResponse } from 'next/server'

import { getSession } from '@/lib/auth'

export async function GET(request: Request) {
  const session = await getSession()
  session.destroy()

  return NextResponse.redirect(new URL('/login', request.url))
}
