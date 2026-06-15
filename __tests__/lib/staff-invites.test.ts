import { describe, expect, it, vi } from 'vitest'

import {
  STAFF_INVITE_TTL_MS,
  cleanupExpiredStaffInvites,
  createStaffInviteToken,
  createUnusablePasswordPlaceholder,
  hashStaffInviteToken,
  staffInviteExpiresAt,
} from '@/lib/auth/staff-invites'

describe('staff invite tokens', () => {
  it('generates url-safe random tokens and hashes them with sha256 hex', () => {
    const token = createStaffInviteToken()
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(Buffer.from(token, 'base64url').byteLength).toBe(32)
    expect(hashStaffInviteToken(token)).toMatch(/^[a-f0-9]{64}$/)
  })

  it('uses a 72 hour ttl', () => {
    expect(STAFF_INVITE_TTL_MS).toBe(72 * 60 * 60 * 1000)
  })

  it('calculates invite expiry from the supplied clock', () => {
    const now = new Date('2026-06-15T10:00:00.000Z')
    expect(staffInviteExpiresAt(now).toISOString()).toBe('2026-06-18T10:00:00.000Z')
  })

  it('creates an independent unusable password placeholder', () => {
    const inviteToken = createStaffInviteToken()
    const placeholder = createUnusablePasswordPlaceholder()

    expect(placeholder).not.toBe(inviteToken)
    expect(placeholder).toMatch(/^invite-disabled:/)
    expect(placeholder.length).toBeGreaterThan(80)
  })
})

describe('cleanupExpiredStaffInvites', () => {
  it('removes expired open invites and old consumed or revoked invites', async () => {
    const deleteMany = vi.fn().mockResolvedValue({ count: 3 })
    const prisma = { staffInvite: { deleteMany } }
    const now = new Date('2026-06-15T10:00:00.000Z')

    const result = await cleanupExpiredStaffInvites(prisma, now)

    expect(result).toEqual({ count: 3 })
    expect(deleteMany).toHaveBeenCalledWith({
      where: {
        OR: [
          {
            usedAt: null,
            revokedAt: null,
            expiresAt: { lt: now },
          },
          {
            usedAt: { not: null },
            expiresAt: { lt: new Date('2026-06-08T10:00:00.000Z') },
          },
          {
            revokedAt: { not: null },
            expiresAt: { lt: new Date('2026-06-08T10:00:00.000Z') },
          },
        ],
      },
    })
  })
})
