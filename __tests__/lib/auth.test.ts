import { afterEach, describe, it, expect, vi, beforeEach } from 'vitest'

const dbMocks = vi.hoisted(() => {
  const staffMember = { findUnique: vi.fn() }
  const compare = vi.fn()
  return { prisma: { staffMember }, staffMember, compare }
})

vi.mock('next/headers', () => ({ cookies: vi.fn(async () => ({})) }))
vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT')
  }),
}))
vi.mock('@/lib/db', () => ({ prisma: dbMocks.prisma }))
vi.mock('bcryptjs', () => ({
  default: { compare: (...args: unknown[]) => dbMocks.compare(...args) },
}))
const getIronSession = vi.fn()
vi.mock('iron-session', () => ({
  getIronSession: (...args: unknown[]) => getIronSession(...args),
}))

import { redirect } from 'next/navigation'
import { requireStaff, requireAdmin, AuthError, verifyStaff } from '@/lib/auth'

beforeEach(() => {
  getIronSession.mockReset()
  dbMocks.staffMember.findUnique.mockReset()
  dbMocks.compare.mockReset()
  vi.mocked(redirect).mockClear()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('lib/auth guards', () => {
  it('requireStaff zonder sessie → redirect naar /login', async () => {
    getIronSession.mockResolvedValue({})
    await expect(requireStaff()).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/login')
  })

  it('requireStaff met sessie → geeft de sessie terug', async () => {
    getIronSession.mockResolvedValue({ staffId: 'x', name: 'A', role: 'STAFF' })
    await expect(requireStaff()).resolves.toMatchObject({ staffId: 'x' })
  })

  it('requireStaff met verlopen paired sessie → redirect naar route-handler logout zonder destroy', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-13T10:00:00.000Z'))
    const destroy = vi.fn()
    getIronSession.mockResolvedValue({
      staffId: 'x',
      name: 'A',
      role: 'STAFF',
      paired: true,
      pairedExpiresAt: Date.now() - 1_000,
      destroy,
    })

    await expect(requireStaff()).rejects.toThrow('NEXT_REDIRECT')

    expect(redirect).toHaveBeenCalledWith(
      '/api/auth/logout?reason=paired-expired'
    )
    expect(destroy).not.toHaveBeenCalled()
  })

  it('requireStaff met niet-verlopen paired sessie → geeft de sessie terug', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-13T10:00:00.000Z'))
    getIronSession.mockResolvedValue({
      staffId: 'x',
      name: 'A',
      role: 'STAFF',
      paired: true,
      pairedExpiresAt: Date.now() + 1_000,
    })

    await expect(requireStaff()).resolves.toMatchObject({ staffId: 'x' })
  })

  it('requireStaff met verplichte wachtwoordwijziging → redirect naar wachtwoordpagina', async () => {
    getIronSession.mockResolvedValue({
      staffId: 'x',
      name: 'A',
      role: 'STAFF',
      mustChangePassword: true,
    })

    await expect(requireStaff()).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/account/wachtwoord')
  })

  it('requireStaff staat forced-password sessies toe op de wachtwoordpagina', async () => {
    getIronSession.mockResolvedValue({
      staffId: 'x',
      name: 'A',
      role: 'STAFF',
      mustChangePassword: true,
    })

    await expect(
      requireStaff({ allowPasswordChange: true })
    ).resolves.toMatchObject({ staffId: 'x' })
  })

  it('requireAdmin als STAFF → AuthError met status 403', async () => {
    getIronSession.mockResolvedValue({ staffId: 'x', name: 'A', role: 'STAFF' })
    await expect(requireAdmin()).rejects.toBeInstanceOf(AuthError)
    getIronSession.mockResolvedValue({ staffId: 'x', name: 'A', role: 'STAFF' })
    await expect(requireAdmin()).rejects.toMatchObject({ status: 403 })
  })

  it('requireAdmin als ADMIN → geeft de sessie terug', async () => {
    getIronSession.mockResolvedValue({ staffId: 'x', name: 'A', role: 'ADMIN' })
    await expect(requireAdmin()).resolves.toMatchObject({ role: 'ADMIN' })
  })
})

describe('verifyStaff', () => {
  it('normaliseert e-mail voordat de medewerker wordt opgezocht', async () => {
    const staff = {
      id: 'x',
      name: 'A',
      email: 'sandra@example.nl',
      role: 'STAFF',
      isActive: true,
      passwordHash: 'hash',
    }
    dbMocks.staffMember.findUnique.mockResolvedValue(staff)
    dbMocks.compare.mockResolvedValue(true)

    await expect(
      verifyStaff('  Sandra@Example.NL  ', 'geheim')
    ).resolves.toMatchObject({ id: 'x' })
    expect(dbMocks.staffMember.findUnique).toHaveBeenCalledWith({
      where: { email: 'sandra@example.nl' },
    })
  })

  it('laat een ruwe uitnodigingstoken niet als wachtwoord werken', async () => {
    dbMocks.staffMember.findUnique.mockResolvedValue({
      id: 'x',
      name: 'A',
      email: 'sandra@example.nl',
      role: 'STAFF',
      isActive: true,
      passwordHash: 'invite-placeholder-hash',
    })
    dbMocks.compare.mockResolvedValue(false)

    await expect(
      verifyStaff('sandra@example.nl', 'raw-invite-token')
    ).resolves.toBeNull()
    expect(dbMocks.compare).toHaveBeenCalledWith(
      'raw-invite-token',
      'invite-placeholder-hash'
    )
  })
})
