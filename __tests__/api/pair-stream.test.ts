// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const pgClient = {
    connect: vi.fn(),
    query: vi.fn(),
    on: vi.fn(),
    end: vi.fn(),
  }
  return {
    readPairCookie: vi.fn(),
    verifyToken: vi.fn(),
    loginPairing: { findUnique: vi.fn() },
    pgClient,
    Client: vi.fn(function Client() {
      return pgClient
    }),
  }
})

vi.mock('@/lib/auth/pair-cookie', () => ({
  readPairCookie: mocks.readPairCookie,
}))
vi.mock('@/lib/auth/pairing', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth/pairing')>(
    '@/lib/auth/pairing'
  )
  return { ...actual, verifyToken: mocks.verifyToken }
})
vi.mock('@/lib/db', () => ({
  prisma: { loginPairing: mocks.loginPairing },
}))
vi.mock('pg', () => ({ Client: mocks.Client }))

import { GET } from '@/app/api/auth/pair/stream/[pairingId]/route'

const future = new Date(Date.now() + 60_000)

function request() {
  return new Request('https://digiplein.example.test/api/auth/pair/stream/pair-1')
}

beforeEach(() => {
  mocks.readPairCookie.mockReset()
  mocks.readPairCookie.mockResolvedValue('desktop-token')
  mocks.verifyToken.mockReset()
  mocks.verifyToken.mockReturnValue(true)
  mocks.loginPairing.findUnique.mockReset()
  mocks.loginPairing.findUnique.mockResolvedValue({
    desktopTokenHash: 'desktop-hash',
    status: 'pending',
    expiresAt: future,
  })
  mocks.pgClient.connect.mockReset()
  mocks.pgClient.connect.mockResolvedValue(undefined)
  mocks.pgClient.query.mockReset()
  mocks.pgClient.query.mockResolvedValue(undefined)
  mocks.pgClient.on.mockReset()
  mocks.pgClient.end.mockReset()
  mocks.pgClient.end.mockResolvedValue(undefined)
  mocks.Client.mockClear()
  process.env.DATABASE_URL = 'postgresql://digiplein:test@localhost:5432/digiplein'
})

describe('GET /api/auth/pair/stream/[pairingId]', () => {
  it('weigert zonder desktop-cookie', async () => {
    mocks.readPairCookie.mockResolvedValue(null)

    const res = await GET(request(), { params: Promise.resolve({ pairingId: 'pair-1' }) })

    expect(res.status).toBe(401)
    expect(mocks.loginPairing.findUnique).not.toHaveBeenCalled()
  })

  it('weigert onbekende, verlopen of mismatch pairings', async () => {
    mocks.loginPairing.findUnique.mockResolvedValueOnce(null)
    expect(
      await GET(request(), { params: Promise.resolve({ pairingId: 'pair-1' }) })
    ).toHaveProperty('status', 404)

    mocks.loginPairing.findUnique.mockResolvedValueOnce({
      desktopTokenHash: 'desktop-hash',
      status: 'pending',
      expiresAt: new Date(Date.now() - 1_000),
    })
    expect(
      await GET(request(), { params: Promise.resolve({ pairingId: 'pair-1' }) })
    ).toHaveProperty('status', 410)

    mocks.verifyToken.mockReturnValue(false)
    mocks.loginPairing.findUnique.mockResolvedValueOnce({
      desktopTokenHash: 'desktop-hash',
      status: 'pending',
      expiresAt: future,
    })
    expect(
      await GET(request(), { params: Promise.resolve({ pairingId: 'pair-1' }) })
    ).toHaveProperty('status', 401)
  })

  it('zet LISTEN aan vóór de definitieve status-read en sluit bij terminale initial state', async () => {
    mocks.loginPairing.findUnique
      .mockResolvedValueOnce({
        desktopTokenHash: 'desktop-hash',
        status: 'pending',
        expiresAt: future,
      })
      .mockResolvedValueOnce({ status: 'consumed' })

    const res = await GET(request(), { params: Promise.resolve({ pairingId: 'pair-1' }) })

    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('text/event-stream')
    expect(res.headers.get('Cache-Control')).toBe('no-cache, no-transform')
    expect(res.headers.get('X-Accel-Buffering')).toBe('no')
    await expect(res.text()).resolves.toContain('"status":"consumed"')

    expect(mocks.pgClient.query).toHaveBeenCalledWith('LISTEN digiplein_pairing')
    expect(mocks.pgClient.query.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.loginPairing.findUnique.mock.invocationCallOrder[1]
    )
    expect(mocks.pgClient.end).toHaveBeenCalledOnce()
  })
})
