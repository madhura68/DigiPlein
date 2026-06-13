export const PAIRING_RETENTION_MS = 24 * 60 * 60 * 1000

type PairingCleanupClient = {
  loginPairing: {
    deleteMany(args: {
      where: {
        OR: Array<Record<string, unknown>>
      }
    }): Promise<{ count: number }>
  }
}

export async function cleanupExpiredPairings(
  prisma: PairingCleanupClient,
  now = new Date()
): Promise<{ count: number }> {
  const retentionCutoff = new Date(now.getTime() - PAIRING_RETENTION_MS)

  return prisma.loginPairing.deleteMany({
    where: {
      OR: [
        { status: 'pending', expiresAt: { lt: now } },
        {
          status: { in: ['consumed', 'cancelled'] },
          expiresAt: { lt: retentionCutoff },
        },
      ],
    },
  })
}
