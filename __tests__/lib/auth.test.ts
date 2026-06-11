import { describe, it, expect, vi, beforeEach } from 'vitest'

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
