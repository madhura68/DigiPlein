import { createHash, randomBytes } from 'node:crypto'

const TOKEN_BYTES = 32

export const STAFF_INVITE_TTL_MS = 72 * 60 * 60 * 1000
export const STAFF_INVITE_RETENTION_MS = 7 * 24 * 60 * 60 * 1000

export function createStaffInviteToken(): string {
  return randomBytes(TOKEN_BYTES).toString('base64url')
}

export function hashStaffInviteToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function staffInviteExpiresAt(now = new Date()): Date {
  return new Date(now.getTime() + STAFF_INVITE_TTL_MS)
}

export function createUnusablePasswordPlaceholder(): string {
  return `invite-disabled:${randomBytes(TOKEN_BYTES).toString('base64url')}:${randomBytes(
    TOKEN_BYTES
  ).toString('base64url')}`
}

type StaffInviteCleanupClient = {
  staffInvite: {
    deleteMany(args: {
      where: {
        OR: Array<Record<string, unknown>>
      }
    }): Promise<{ count: number }>
  }
}

export async function cleanupExpiredStaffInvites(
  prisma: StaffInviteCleanupClient,
  now = new Date()
): Promise<{ count: number }> {
  const retentionCutoff = new Date(now.getTime() - STAFF_INVITE_RETENTION_MS)

  return prisma.staffInvite.deleteMany({
    where: {
      OR: [
        {
          usedAt: null,
          revokedAt: null,
          expiresAt: { lt: now },
        },
        {
          usedAt: { not: null },
          expiresAt: { lt: retentionCutoff },
        },
        {
          revokedAt: { not: null },
          expiresAt: { lt: retentionCutoff },
        },
      ],
    },
  })
}
