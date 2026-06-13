'use server'

import { z } from 'zod'

import { getSession } from '@/lib/auth'
import { verifyToken } from '@/lib/auth/pairing'
import { prisma } from '@/lib/db'

const APPROVED_PAIRING_TTL_MS = 5 * 60 * 1000

const pairingInputSchema = z
  .object({
    pairingId: z.string().min(1),
    mobileSecret: z.string().min(32),
  })
  .strict()

type PairingInput = z.infer<typeof pairingInputSchema>

export type PairingActionResult =
  | { ok: true }
  | { ok: false; error: string; status: 401 | 403 | 404 | 410 | 422 }

export type PairingApprovalInfo = {
  id: string
  desktopUa: string | null
  desktopIp: string | null
  staffName: string
}

export type PairingApprovalResult =
  | { ok: true; pairing: PairingApprovalInfo }
  | { ok: false; error: string; status: 401 | 404 | 410 | 422 }

type PendingPairing = {
  id: string
  secretHash: string
  status: string
  desktopUa: string | null
  desktopIp: string | null
  expiresAt: Date
}

function parseInput(input: unknown) {
  const parsed = pairingInputSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false as const,
      error: 'Ongeldige QR-code. Scan de code opnieuw.',
      status: 422 as const,
    }
  }
  return { ok: true as const, input: parsed.data }
}

async function requirePairingSession() {
  const session = await getSession()
  if (!session.staffId) {
    return {
      ok: false as const,
      error: 'Log eerst in op je mobiele apparaat.',
      status: 401 as const,
    }
  }
  return { ok: true as const, session }
}

async function loadPendingPairing(input: PairingInput, now = new Date()) {
  const pairing = (await prisma.loginPairing.findUnique({
    where: { id: input.pairingId },
    select: {
      id: true,
      secretHash: true,
      status: true,
      desktopUa: true,
      desktopIp: true,
      expiresAt: true,
    },
  })) as PendingPairing | null

  if (!pairing) {
    return {
      ok: false as const,
      error: 'Deze QR-code is niet gevonden. Scan een nieuwe code.',
      status: 404 as const,
    }
  }
  if (pairing.status !== 'pending' || pairing.expiresAt <= now) {
    return {
      ok: false as const,
      error: 'Deze QR-code is verlopen. Start de mobiele login opnieuw.',
      status: 410 as const,
    }
  }
  if (!verifyToken(input.mobileSecret, pairing.secretHash)) {
    return {
      ok: false as const,
      error: 'Deze QR-code is ongeldig. Scan de code opnieuw.',
      status: 401 as const,
    }
  }

  return { ok: true as const, pairing }
}

export async function getPairingForApproval(
  input: unknown
): Promise<PairingApprovalResult> {
  const sessionResult = await requirePairingSession()
  if (!sessionResult.ok) return sessionResult

  const parsed = parseInput(input)
  if (!parsed.ok) return parsed

  const pairingResult = await loadPendingPairing(parsed.input)
  if (!pairingResult.ok) return pairingResult

  return {
    ok: true,
    pairing: {
      id: pairingResult.pairing.id,
      desktopUa: pairingResult.pairing.desktopUa,
      desktopIp: pairingResult.pairing.desktopIp,
      staffName: sessionResult.session.name ?? 'Medewerker',
    },
  }
}

export async function approvePairing(
  input: unknown
): Promise<PairingActionResult> {
  const sessionResult = await requirePairingSession()
  if (!sessionResult.ok) return sessionResult

  const parsed = parseInput(input)
  if (!parsed.ok) return parsed

  const staff = await prisma.staffMember.findUnique({
    where: { id: sessionResult.session.staffId },
    select: { isActive: true },
  })
  if (!staff?.isActive) {
    return {
      ok: false,
      error: 'Je medewerkeraccount is niet actief.',
      status: 403,
    }
  }

  const now = new Date()
  const pairingResult = await loadPendingPairing(parsed.input, now)
  if (!pairingResult.ok) return pairingResult

  await prisma.loginPairing.update({
    where: { id: pairingResult.pairing.id },
    data: {
      status: 'approved',
      staffId: sessionResult.session.staffId,
      approvedAt: now,
      expiresAt: new Date(now.getTime() + APPROVED_PAIRING_TTL_MS),
    },
  })

  return { ok: true }
}

export async function cancelPairing(
  input: unknown
): Promise<PairingActionResult> {
  const sessionResult = await requirePairingSession()
  if (!sessionResult.ok) return sessionResult

  const parsed = parseInput(input)
  if (!parsed.ok) return parsed

  const pairingResult = await loadPendingPairing(parsed.input)
  if (!pairingResult.ok) return pairingResult

  await prisma.loginPairing.update({
    where: { id: pairingResult.pairing.id },
    data: { status: 'cancelled' },
  })

  return { ok: true }
}
