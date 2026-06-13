import { afterEach, describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/headers', () => ({ cookies: vi.fn(async () => ({})) }))
vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT')
  }),
}))
const getIronSession = vi.fn()
vi.mock('iron-session', () => ({
  getIronSession: (...args: unknown[]) => getIronSession(...args),
}))

import { redirect } from 'next/navigation'
import { requireStaff, requireAdmin, AuthError } from '@/lib/auth'

beforeEach(() => {
  getIronSession.mockReset()
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
