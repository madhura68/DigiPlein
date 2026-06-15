'use server'

import { redirect } from 'next/navigation'

import { cleanupExpiredPairings } from '@/lib/auth/pairing-cleanup'
import {
  cleanupExpiredStaffInvites,
  hashStaffInviteToken,
} from '@/lib/auth/staff-invites'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export type AcceptStaffInviteState = {
  error?: string
  status?: number
}

const invalidInvite: AcceptStaffInviteState = {
  error: 'Deze uitnodiging is ongeldig of verlopen.',
  status: 410,
}

function isOpenInvite(invite: {
  expiresAt: Date
  usedAt: Date | null
  revokedAt: Date | null
}, now: Date): boolean {
  return !invite.usedAt && !invite.revokedAt && invite.expiresAt > now
}

export async function acceptStaffInvite(
  token: string
): Promise<AcceptStaffInviteState> {
  const now = new Date()

  await Promise.allSettled([
    cleanupExpiredStaffInvites(prisma, now),
    cleanupExpiredPairings(prisma, now),
  ])

  const result = await prisma.$transaction(async (tx) => {
    const invite = await tx.staffInvite.findUnique({
      where: { tokenHash: hashStaffInviteToken(token) },
      include: { staff: true },
    })

    if (!invite || !isOpenInvite(invite, now)) {
      return { ok: false as const, consumeOnly: false }
    }

    const consumed = await tx.staffInvite.updateMany({
      where: {
        id: invite.id,
        usedAt: null,
        revokedAt: null,
        expiresAt: { gt: now },
      },
      data: { usedAt: now },
    })

    if (consumed.count !== 1) {
      return { ok: false as const, consumeOnly: false }
    }

    if (!invite.staff.isActive) {
      return { ok: false as const, consumeOnly: true }
    }

    return {
      ok: true as const,
      staff: {
        id: invite.staff.id,
        name: invite.staff.name,
        role: invite.staff.role,
      },
    }
  })

  if (!result.ok) {
    return invalidInvite
  }

  const session = await getSession()
  session.staffId = result.staff.id
  session.name = result.staff.name
  session.role = result.staff.role
  session.mustChangePassword = true
  delete session.paired
  delete session.pairedExpiresAt
  await session.save()

  redirect('/account/wachtwoord')
}
