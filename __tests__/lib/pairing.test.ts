import { describe, expect, it } from 'vitest'

import {
  generateDesktopToken,
  generateMobileSecret,
  hashToken,
  isPairedSessionExpired,
  PAIRED_SESSION_TTL_MS,
  verifyToken,
} from '@/lib/auth/pairing'

describe('QR-pairing crypto helpers', () => {
  it('genereert gescheiden 256-bit secrets als base64url strings', () => {
    const mobileSecret = generateMobileSecret()
    const desktopToken = generateDesktopToken()

    expect(mobileSecret).toMatch(/^[A-Za-z0-9_-]{40,}$/)
    expect(desktopToken).toMatch(/^[A-Za-z0-9_-]{40,}$/)
    expect(mobileSecret).not.toBe(desktopToken)
  })

  it('bewaart alleen hashes en verifieert tokens timing-safe', () => {
    const token = 'een-test-token'
    const hash = hashToken(token)

    expect(hash).toMatch(/^[a-f0-9]{64}$/)
    expect(hash).not.toBe(token)
    expect(verifyToken(token, hash)).toBe(true)
    expect(verifyToken('ander-token', hash)).toBe(false)
  })

  it('hanteert 8 uur als paired-session TTL', () => {
    expect(PAIRED_SESSION_TTL_MS).toBe(8 * 60 * 60 * 1000)
  })

  it('markeert alleen verlopen paired sessions als verlopen', () => {
    const now = Date.now()

    expect(isPairedSessionExpired({})).toBe(false)
    expect(isPairedSessionExpired({ paired: true })).toBe(false)
    expect(
      isPairedSessionExpired({
        paired: true,
        pairedExpiresAt: now + 1_000,
      })
    ).toBe(false)
    expect(
      isPairedSessionExpired({
        paired: true,
        pairedExpiresAt: now - 1_000,
      })
    ).toBe(true)
  })
})
