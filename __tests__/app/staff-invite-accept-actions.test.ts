import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const staffInvite = {
    findUnique: vi.fn(),
    updateMany: vi.fn(),
  }
  const tx = { staffInvite }
  return {
    cleanupExpiredPairings: vi.fn(),
    cleanupExpiredStaffInvites: vi.fn(),
    getSession: vi.fn(),
    redirect: vi.fn(() => {
      throw new Error('NEXT_REDIRECT')
    }),
    save: vi.fn(),
    staffInvite,
    tx,
    prisma: {
      $transaction: vi.fn((callback: (txArg: typeof tx) => unknown) => callback(tx)),
    },
  }
})

vi.mock('@/lib/auth', () => ({ getSession: mocks.getSession }))
vi.mock('@/lib/db', () => ({ prisma: mocks.prisma }))
vi.mock('@/lib/auth/pairing-cleanup', () => ({
  cleanupExpiredPairings: mocks.cleanupExpiredPairings,
}))
vi.mock('@/lib/auth/staff-invites', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/auth/staff-invites')>()
  return {
    ...actual,
    cleanupExpiredStaffInvites: mocks.cleanupExpiredStaffInvites,
  }
})
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }))

import { acceptStaffInvite } from '@/app/uitnodiging/[token]/actions'
import { hashStaffInviteToken } from '@/lib/auth/staff-invites'

const future = new Date('2026-06-18T10:00:00.000Z')
const now = new Date('2026-06-15T10:00:00.000Z')

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(now)
  mocks.cleanupExpiredPairings.mockReset()
  mocks.cleanupExpiredPairings.mockResolvedValue({ count: 0 })
  mocks.cleanupExpiredStaffInvites.mockReset()
  mocks.cleanupExpiredStaffInvites.mockResolvedValue({ count: 0 })
  mocks.getSession.mockReset()
  mocks.getSession.mockResolvedValue({
    save: mocks.save,
    paired: true,
    pairedExpiresAt: 1_717_999_999_999,
  })
  mocks.redirect.mockClear()
  mocks.save.mockReset()
  mocks.staffInvite.findUnique.mockReset()
  mocks.staffInvite.updateMany.mockReset()
  mocks.prisma.$transaction.mockClear()
})

describe('acceptStaffInvite', () => {
  it('consumeert een geldige invite atomisch en zet een forced-password sessie', async () => {
    mocks.staffInvite.findUnique.mockResolvedValue({
      id: 'invite-1',
      expiresAt: future,
      usedAt: null,
      revokedAt: null,
      staff: {
        id: 'staff-1',
        name: 'Sandra',
        role: 'STAFF',
        isActive: true,
      },
    })
    mocks.staffInvite.updateMany.mockResolvedValue({ count: 1 })

    await expect(acceptStaffInvite('raw-token')).rejects.toThrow('NEXT_REDIRECT')

    expect(mocks.cleanupExpiredStaffInvites).toHaveBeenCalledBefore(
      mocks.prisma.$transaction
    )
    expect(mocks.cleanupExpiredPairings).toHaveBeenCalledBefore(
      mocks.prisma.$transaction
    )
    expect(mocks.staffInvite.findUnique).toHaveBeenCalledWith({
      where: { tokenHash: hashStaffInviteToken('raw-token') },
      include: { staff: true },
    })
    expect(mocks.staffInvite.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'invite-1',
        usedAt: null,
        revokedAt: null,
        expiresAt: { gt: now },
      },
      data: { usedAt: now },
    })
    const session = await mocks.getSession.mock.results[0].value
    expect(session).toMatchObject({
      staffId: 'staff-1',
      name: 'Sandra',
      role: 'STAFF',
      mustChangePassword: true,
    })
    expect(session.paired).toBeUndefined()
    expect(session.pairedExpiresAt).toBeUndefined()
    expect(mocks.save).toHaveBeenCalledOnce()
    expect(mocks.redirect).toHaveBeenCalledWith('/account/wachtwoord')
  })

  it('consumeert een invite voor een gedeactiveerde medewerker neutraal zonder login', async () => {
    mocks.staffInvite.findUnique.mockResolvedValue({
      id: 'invite-1',
      expiresAt: future,
      usedAt: null,
      revokedAt: null,
      staff: {
        id: 'staff-1',
        name: 'Sandra',
        role: 'STAFF',
        isActive: false,
      },
    })
    mocks.staffInvite.updateMany.mockResolvedValue({ count: 1 })

    const result = await acceptStaffInvite('raw-token')

    expect(result.status).toBe(410)
    expect(result.error).toMatch(/ongeldig|verlopen/i)
    expect(mocks.staffInvite.updateMany).toHaveBeenCalledOnce()
    expect(mocks.getSession).not.toHaveBeenCalled()
  })

  it('blijft neutraal als een concurrente accept de invite al consumeerde', async () => {
    mocks.staffInvite.findUnique.mockResolvedValue({
      id: 'invite-1',
      expiresAt: future,
      usedAt: null,
      revokedAt: null,
      staff: {
        id: 'staff-1',
        name: 'Sandra',
        role: 'STAFF',
        isActive: true,
      },
    })
    mocks.staffInvite.updateMany.mockResolvedValue({ count: 0 })

    const result = await acceptStaffInvite('raw-token')

    expect(result.status).toBe(410)
    expect(result.error).toMatch(/ongeldig|verlopen/i)
    expect(mocks.staffInvite.updateMany).toHaveBeenCalledOnce()
    expect(mocks.getSession).not.toHaveBeenCalled()
    expect(mocks.redirect).not.toHaveBeenCalled()
  })

  it('weigert ontbrekende, gebruikte of verlopen invites neutraal', async () => {
    mocks.staffInvite.findUnique.mockResolvedValue(null)

    const result = await acceptStaffInvite('raw-token')

    expect(result.status).toBe(410)
    expect(result.error).toMatch(/ongeldig|verlopen/i)
    expect(mocks.staffInvite.updateMany).not.toHaveBeenCalled()
    expect(mocks.getSession).not.toHaveBeenCalled()
  })
})
