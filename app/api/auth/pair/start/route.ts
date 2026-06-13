import { prisma } from '@/lib/db'
import {
  generateDesktopToken,
  generateMobileSecret,
  hashToken,
} from '@/lib/auth/pairing'
import { setPairCookie } from '@/lib/auth/pair-cookie'
import { checkRateLimit } from '@/lib/rate-limit'
import { getTrustedClientIp } from '@/lib/request-ip'

export const runtime = 'nodejs'

const PENDING_TTL_MS = 5 * 60 * 1000
const UA_MAX = 255

export async function POST(request: Request) {
  const ip = getTrustedClientIp(request)
  if (!checkRateLimit(`pair-start:${ip}`)) {
    return Response.json(
      { error: 'Te veel pogingen. Probeer het over een minuut opnieuw.' },
      { status: 429 }
    )
  }

  const mobileSecret = generateMobileSecret()
  const desktopToken = generateDesktopToken()
  const ua = request.headers.get('user-agent')?.slice(0, UA_MAX) ?? null
  const desktopIp = ip === 'unknown' ? null : ip

  const pairing = await prisma.loginPairing.create({
    data: {
      secretHash: hashToken(mobileSecret),
      desktopTokenHash: hashToken(desktopToken),
      status: 'pending',
      desktopUa: ua,
      desktopIp,
      expiresAt: new Date(Date.now() + PENDING_TTL_MS),
    },
    select: { id: true, expiresAt: true },
  })

  await setPairCookie(desktopToken)

  const origin = new URL(request.url).origin
  const qrUrl = `${origin}/m/pair#id=${pairing.id}&s=${mobileSecret}`

  return Response.json({
    pairingId: pairing.id,
    expiresAt: pairing.expiresAt.toISOString(),
    qrUrl,
  })
}
