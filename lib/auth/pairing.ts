import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

const SECRET_BYTES = 32

export const PAIRED_SESSION_TTL_MS = 8 * 60 * 60 * 1000

export function generateMobileSecret(): string {
  return randomBytes(SECRET_BYTES).toString('base64url')
}

export function generateDesktopToken(): string {
  return randomBytes(SECRET_BYTES).toString('base64url')
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function verifyToken(token: string, hash: string): boolean {
  const actual = Buffer.from(hashToken(token), 'hex')
  const expected = Buffer.from(hash, 'hex')
  if (actual.length !== expected.length) return false
  return timingSafeEqual(actual, expected)
}

export function isPairedSessionExpired(session: {
  paired?: boolean
  pairedExpiresAt?: number
}): boolean {
  if (!session.paired || !session.pairedExpiresAt) return false
  return session.pairedExpiresAt < Date.now()
}
