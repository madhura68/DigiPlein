import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'

import { clearPairCookie, readPairCookie } from '@/lib/auth/pair-cookie'
import { hashToken, PAIRED_SESSION_TTL_MS } from '@/lib/auth/pairing'
import { prisma } from '@/lib/db'
import { sessionOptions, type SessionData } from '@/lib/session'

export const runtime = 'nodejs'

interface ClaimBody {
  pairingId?: unknown
}

export async function POST(request: Request) {
  const desktopToken = await readPairCookie()
  if (!desktopToken) {
    return Response.json({ error: 'Geen pairing-cookie' }, { status: 401 })
  }

  let body: ClaimBody
  try {
    body = (await request.json()) as ClaimBody
  } catch {
    return Response.json({ error: 'Ongeldige JSON' }, { status: 400 })
  }

  const pairingId =
    typeof body.pairingId === 'string' && body.pairingId.length > 0
      ? body.pairingId
      : null
  if (!pairingId) {
    return Response.json({ error: 'pairingId vereist' }, { status: 400 })
  }

  const desktopTokenHash = hashToken(desktopToken)
  const consumedAt = new Date()

  const updated = await prisma.loginPairing.updateMany({
    where: {
      id: pairingId,
      status: 'approved',
      desktopTokenHash,
      expiresAt: { gt: new Date() },
    },
    data: { status: 'consumed', consumedAt },
  })

  if (updated.count !== 1) {
    const exists = await prisma.loginPairing.findFirst({
      where: { id: pairingId, desktopTokenHash },
      select: { status: true },
    })
    await clearPairCookie()
    if (!exists) return Response.json({ error: 'Ongeldig' }, { status: 401 })
    return Response.json(
      { error: `Pairing al ${exists.status}` },
      { status: 410 }
    )
  }

  const pairing = await prisma.loginPairing.findUnique({
    where: { id: pairingId },
    select: {
      staffId: true,
      staff: { select: { name: true, role: true, isActive: true } },
    },
  })

  if (!pairing?.staffId || !pairing.staff?.isActive) {
    await clearPairCookie()
    return Response.json(
      { error: 'Pairing zonder actieve medewerker' },
      { status: 500 }
    )
  }

  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  )
  session.staffId = pairing.staffId
  session.name = pairing.staff.name
  session.role = pairing.staff.role
  session.paired = true
  session.pairedExpiresAt = Date.now() + PAIRED_SESSION_TTL_MS
  await session.save()

  await clearPairCookie()
  return Response.json({ ok: true })
}
