// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  loginPairing: { create: vi.fn() },
  setPairCookie: vi.fn(),
  checkRateLimit: vi.fn(),
  getTrustedClientIp: vi.fn(),
  generateMobileSecret: vi.fn(),
  generateDesktopToken: vi.fn(),
  hashToken: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: { loginPairing: mocks.loginPairing },
}))
vi.mock('@/lib/auth/pair-cookie', () => ({
  setPairCookie: mocks.setPairCookie,
}))
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: mocks.checkRateLimit,
}))
vi.mock('@/lib/request-ip', () => ({
  getTrustedClientIp: mocks.getTrustedClientIp,
}))
vi.mock('@/lib/auth/pairing', () => ({
  generateMobileSecret: mocks.generateMobileSecret,
  generateDesktopToken: mocks.generateDesktopToken,
  hashToken: mocks.hashToken,
}))
vi.mock('@/lib/env', () => ({
  env: { APP_BASE_URL: 'https://digiplein.example.test' },
}))

import { POST } from '@/app/api/auth/pair/start/route'

// Het desktopverzoek komt binnen op de interne bind-host achter de reverse proxy
// (0.0.0.0:3000) — onbereikbaar voor de telefoon. De QR moet daarom de publieke
// APP_BASE_URL gebruiken, nooit de request-origin.
function request(headers: Record<string, string> = {}) {
  return new Request('https://0.0.0.0:3000/api/auth/pair/start', {
    method: 'POST',
    headers,
  })
}

beforeEach(() => {
  mocks.loginPairing.create.mockReset()
  mocks.loginPairing.create.mockResolvedValue({
    id: 'pair-1',
    expiresAt: new Date('2026-06-13T10:05:00.000Z'),
  })
  mocks.setPairCookie.mockReset()
  mocks.setPairCookie.mockResolvedValue(undefined)
  mocks.checkRateLimit.mockReset()
  mocks.checkRateLimit.mockReturnValue(true)
  mocks.getTrustedClientIp.mockReset()
  mocks.getTrustedClientIp.mockReturnValue('198.51.100.24')
  mocks.generateMobileSecret.mockReset()
  mocks.generateMobileSecret.mockReturnValue('mobile-secret')
  mocks.generateDesktopToken.mockReset()
  mocks.generateDesktopToken.mockReturnValue('desktop-token')
  mocks.hashToken.mockReset()
  mocks.hashToken.mockImplementation((value: string) => `hash-${value}`)
})

describe('POST /api/auth/pair/start', () => {
  it('maakt een pending pairing, zet desktop-cookie en bouwt de QR-url uit APP_BASE_URL (niet de request-host)', async () => {
    const res = await POST(request({ 'user-agent': 'Safari'.repeat(80) }))

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({
      pairingId: 'pair-1',
      expiresAt: '2026-06-13T10:05:00.000Z',
      qrUrl:
        'https://digiplein.example.test/m/pair#id=pair-1&s=mobile-secret',
    })
    expect(mocks.checkRateLimit).toHaveBeenCalledWith('pair-start:198.51.100.24')
    expect(mocks.loginPairing.create).toHaveBeenCalledWith({
      data: {
        secretHash: 'hash-mobile-secret',
        desktopTokenHash: 'hash-desktop-token',
        status: 'pending',
        desktopUa: expect.stringMatching(/^Safari/),
        desktopIp: '198.51.100.24',
        expiresAt: expect.any(Date),
      },
      select: { id: true, expiresAt: true },
    })
    expect(mocks.loginPairing.create.mock.calls[0][0].data.desktopUa).toHaveLength(255)
    expect(mocks.setPairCookie).toHaveBeenCalledWith('desktop-token')
  })

  it('weigert bij rate-limit zonder pairing aan te maken', async () => {
    mocks.checkRateLimit.mockReturnValue(false)

    const res = await POST(request())

    expect(res.status).toBe(429)
    expect(mocks.loginPairing.create).not.toHaveBeenCalled()
    expect(mocks.setPairCookie).not.toHaveBeenCalled()
  })
})
