import { NextResponse } from 'next/server'

import { getSession } from '@/lib/auth'

// Identiteits-endpoint (integratiecontract §10.1): het externe chat-component erft
// de app-sessie hierlangs. Dataminimalisatie — exact { name, role }, nooit meer.
export async function GET() {
  const session = await getSession()
  if (!session.staffId) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
  }
  return NextResponse.json({ name: session.name, role: session.role })
}
