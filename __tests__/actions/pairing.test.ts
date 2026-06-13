import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const loginPairing = {
    findUnique: vi.fn(),
    update: vi.fn(),
  }
  const staffMember = { findUnique: vi.fn() }
  return {
    getSession: vi.fn(),
    verifyToken: vi.fn(),
    loginPairing,
    staffMember,
    prisma: { loginPairing, staffMember },
  }
})

vi.mock('@/lib/auth', () => ({ getSession: mocks.getSession }))
vi.mock('@/lib/db', () => ({ prisma: mocks.prisma }))
vi.mock('@/lib/auth/pairing', () => ({ verifyToken: mocks.verifyToken }))

import {
  approvePairing,
  cancelPairing,
  getPairingForApproval,
} from '@/actions/pairing'

const NOW = new Date('2026-06-13T10:00:00.000Z')
const MOBILE_SECRET = 'm'.repeat(43)
const INPUT = { pairingId: 'pair-1', mobileSecret: MOBILE_SECRET }

function pendingPairing(overrides: Record<string, unknown> = {}) {
  return {
    id: 'pair-1',
    secretHash: 'hashed-mobile-secret',
    status: 'pending',
    desktopUa: 'Chrome op macOS',
    desktopIp: '198.51.100.25',
    expiresAt: new Date('2026-06-13T10:05:00.000Z'),
    ...overrides,
  }
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
  mocks.getSession.mockReset()
  mocks.getSession.mockResolvedValue({
    staffId: 'staff-1',
    name: 'Bea van Dijk',
    role: 'STAFF',
  })
  mocks.verifyToken.mockReset()
  mocks.verifyToken.mockReturnValue(true)
  mocks.loginPairing.findUnique.mockReset()
  mocks.loginPairing.findUnique.mockResolvedValue(pendingPairing())
  mocks.loginPairing.update.mockReset()
  mocks.loginPairing.update.mockResolvedValue({})
  mocks.staffMember.findUnique.mockReset()
  mocks.staffMember.findUnique.mockResolvedValue({ isActive: true })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('getPairingForApproval', () => {
  it('weigert zonder bestaande mobiele sessie en leest geen pairing', async () => {
    mocks.getSession.mockResolvedValue({})

    const res = await getPairingForApproval(INPUT)

    expect(res).toMatchObject({ ok: false, status: 401 })
    expect(mocks.loginPairing.findUnique).not.toHaveBeenCalled()
  })

  it('toont desktop-context na geldige pending pairing en mobile secret', async () => {
    const res = await getPairingForApproval(INPUT)

    expect(mocks.verifyToken).toHaveBeenCalledWith(
      MOBILE_SECRET,
      'hashed-mobile-secret'
    )
    expect(res).toEqual({
      ok: true,
      pairing: {
        id: 'pair-1',
        desktopUa: 'Chrome op macOS',
        desktopIp: '198.51.100.25',
        staffName: 'Bea van Dijk',
      },
    })
  })

  it('weigert verlopen pairings zonder secret te accepteren', async () => {
    mocks.loginPairing.findUnique.mockResolvedValue(
      pendingPairing({ expiresAt: new Date('2026-06-13T09:59:59.000Z') })
    )

    const res = await getPairingForApproval(INPUT)

    expect(res).toMatchObject({ ok: false, status: 410 })
    expect(mocks.loginPairing.update).not.toHaveBeenCalled()
  })

  it('weigert een verkeerde mobile secret', async () => {
    mocks.verifyToken.mockReturnValue(false)

    const res = await getPairingForApproval(INPUT)

    expect(res).toMatchObject({ ok: false, status: 401 })
  })
})

describe('approvePairing', () => {
  it('koppelt een actieve medewerker en geeft de desktop vijf minuten claimtijd', async () => {
    const res = await approvePairing(INPUT)

    expect(res).toEqual({ ok: true })
    expect(mocks.staffMember.findUnique).toHaveBeenCalledWith({
      where: { id: 'staff-1' },
      select: { isActive: true },
    })
    expect(mocks.loginPairing.update).toHaveBeenCalledWith({
      where: { id: 'pair-1' },
      data: {
        status: 'approved',
        staffId: 'staff-1',
        approvedAt: NOW,
        expiresAt: new Date('2026-06-13T10:05:00.000Z'),
      },
    })
  })

  it('weigert een inactief medewerkeraccount', async () => {
    mocks.staffMember.findUnique.mockResolvedValue({ isActive: false })

    const res = await approvePairing(INPUT)

    expect(res).toMatchObject({ ok: false, status: 403 })
    expect(mocks.loginPairing.update).not.toHaveBeenCalled()
  })
})

describe('cancelPairing', () => {
  it('annuleert de pending pairing na geldige mobiele sessie en secret', async () => {
    const res = await cancelPairing(INPUT)

    expect(res).toEqual({ ok: true })
    expect(mocks.loginPairing.update).toHaveBeenCalledWith({
      where: { id: 'pair-1' },
      data: { status: 'cancelled' },
    })
  })
})
