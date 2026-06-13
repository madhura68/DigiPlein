// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  readPairCookie: vi.fn(),
  clearPairCookie: vi.fn(),
  getIronSession: vi.fn(),
  session: { save: vi.fn(), staffId: '', name: '', role: '', paired: false, pairedExpiresAt: 0 },
  loginPairing: {
    updateMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
  },
  hashToken: vi.fn(),
}))

vi.mock('@/lib/auth/pair-cookie', () => ({
  readPairCookie: mocks.readPairCookie,
  clearPairCookie: mocks.clearPairCookie,
}))
vi.mock('@/lib/db', () => ({
  prisma: { loginPairing: mocks.loginPairing },
}))
vi.mock('@/lib/auth/pairing', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth/pairing')>(
    '@/lib/auth/pairing'
  )
  return { ...actual, hashToken: mocks.hashToken }
})
vi.mock('iron-session', () => ({
  getIronSession: mocks.getIronSession,
}))
vi.mock('next/headers', () => ({ cookies: vi.fn(async () => ({})) }))

import { POST } from '@/app/api/auth/pair/claim/route'

function request(body: unknown = { pairingId: 'pair-1' }) {
  return new Request('https://digiplein.example.test/api/auth/pair/claim', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  mocks.readPairCookie.mockReset()
  mocks.readPairCookie.mockResolvedValue('desktop-token')
  mocks.clearPairCookie.mockReset()
  mocks.clearPairCookie.mockResolvedValue(undefined)
  mocks.hashToken.mockReset()
  mocks.hashToken.mockReturnValue('desktop-hash')
  mocks.loginPairing.updateMany.mockReset()
  mocks.loginPairing.updateMany.mockResolvedValue({ count: 1 })
  mocks.loginPairing.findFirst.mockReset()
  mocks.loginPairing.findUnique.mockReset()
  mocks.loginPairing.findUnique.mockResolvedValue({
    staffId: '2b0ad982-a94b-4d8f-b036-58d567768ad2',
    staff: { name: 'Sandra', role: 'STAFF', isActive: true },
  })
  mocks.session.staffId = ''
  mocks.session.name = ''
  mocks.session.role = ''
  mocks.session.paired = false
  mocks.session.pairedExpiresAt = 0
  mocks.session.save.mockReset()
  mocks.session.save.mockResolvedValue(undefined)
  mocks.getIronSession.mockReset()
  mocks.getIronSession.mockResolvedValue(mocks.session)
})

describe('POST /api/auth/pair/claim', () => {
  it('claimt atomisch en zet een minimale DigiPlein-sessie', async () => {
    const before = Date.now()
    const res = await POST(request())
    const after = Date.now()

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ ok: true })
    expect(mocks.loginPairing.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'pair-1',
        status: 'approved',
        desktopTokenHash: 'desktop-hash',
        expiresAt: { gt: expect.any(Date) },
      },
      data: { status: 'consumed', consumedAt: expect.any(Date) },
    })
    expect(mocks.session.staffId).toBe('2b0ad982-a94b-4d8f-b036-58d567768ad2')
    expect(mocks.session.name).toBe('Sandra')
    expect(mocks.session.role).toBe('STAFF')
    expect(mocks.session.paired).toBe(true)
    expect(mocks.session.pairedExpiresAt).toBeGreaterThanOrEqual(
      before + 8 * 60 * 60 * 1000
    )
    expect(mocks.session.pairedExpiresAt).toBeLessThanOrEqual(
      after + 8 * 60 * 60 * 1000
    )
    expect(mocks.session.save).toHaveBeenCalledOnce()
    expect(mocks.clearPairCookie).toHaveBeenCalledOnce()
  })

  it('weigert zonder desktop-cookie', async () => {
    mocks.readPairCookie.mockResolvedValue(null)

    const res = await POST(request())

    expect(res.status).toBe(401)
    expect(mocks.loginPairing.updateMany).not.toHaveBeenCalled()
  })

  it('wist cookie en geeft 401 bij cookie/hash mismatch', async () => {
    mocks.loginPairing.updateMany.mockResolvedValue({ count: 0 })
    mocks.loginPairing.findFirst.mockResolvedValue(null)

    const res = await POST(request())

    expect(res.status).toBe(401)
    expect(mocks.clearPairCookie).toHaveBeenCalledOnce()
    expect(mocks.session.save).not.toHaveBeenCalled()
  })

  it('wist cookie en geeft 410 bij al afgehandelde pairing', async () => {
    mocks.loginPairing.updateMany.mockResolvedValue({ count: 0 })
    mocks.loginPairing.findFirst.mockResolvedValue({ status: 'consumed' })

    const res = await POST(request())

    expect(res.status).toBe(410)
    expect(mocks.clearPairCookie).toHaveBeenCalledOnce()
    expect(mocks.session.save).not.toHaveBeenCalled()
  })

  it('geeft 500 wanneer de approved pairing geen actieve medewerker oplevert', async () => {
    mocks.loginPairing.findUnique.mockResolvedValue({
      staffId: '2b0ad982-a94b-4d8f-b036-58d567768ad2',
      staff: { name: 'Sandra', role: 'STAFF', isActive: false },
    })

    const res = await POST(request())

    expect(res.status).toBe(500)
    expect(mocks.clearPairCookie).toHaveBeenCalledOnce()
    expect(mocks.session.save).not.toHaveBeenCalled()
  })
})
