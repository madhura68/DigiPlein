import { describe, expect, it, vi } from 'vitest'

import {
  cleanupExpiredPairings,
  PAIRING_RETENTION_MS,
} from '@/lib/auth/pairing-cleanup'

describe('cleanupExpiredPairings', () => {
  it('verwijdert verlopen pending pairings en afgehandelde pairings ouder dan 24 uur', async () => {
    const deleteMany = vi.fn().mockResolvedValue({ count: 3 })
    const prisma = { loginPairing: { deleteMany } }
    const now = new Date('2026-06-13T10:00:00.000Z')

    const result = await cleanupExpiredPairings(prisma, now)

    expect(PAIRING_RETENTION_MS).toBe(24 * 60 * 60 * 1000)
    expect(result.count).toBe(3)
    expect(deleteMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { status: 'pending', expiresAt: { lt: now } },
          {
            status: { in: ['consumed', 'cancelled'] },
            expiresAt: { lt: new Date(now.getTime() - PAIRING_RETENTION_MS) },
          },
        ],
      },
    })
  })
})
