import { describe, it, expect, vi, beforeEach } from 'vitest'

const verifyStaff = vi.fn()
const save = vi.fn()
const getSession = vi.fn(async () => ({ save }))
vi.mock('@/lib/auth', () => ({
  verifyStaff: (...args: unknown[]) => verifyStaff(...args),
  getSession: () => getSession(),
}))
vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT')
  }),
}))

import { login } from '@/app/login/actions'

function formData(fields: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [key, value] of Object.entries(fields)) fd.set(key, value)
  return fd
}

beforeEach(() => {
  verifyStaff.mockReset()
  save.mockReset()
})

describe('login action', () => {
  it('ongeldige invoer → 422 zonder verificatie', async () => {
    const res = await login({}, formData({ email: 'geen-email', password: '' }))
    expect(res?.status).toBe(422)
    expect(verifyStaff).not.toHaveBeenCalled()
  })

  it('onbekende/foute/inactieve combinatie → neutrale 401', async () => {
    verifyStaff.mockResolvedValue(null)
    const res = await login({}, formData({ email: 'a@b.nl', password: 'geheim' }))
    expect(res?.status).toBe(401)
    expect(res?.error).toMatch(/onjuist/i)
    // Geen informatielek over wélk deel fout was.
    expect(res?.error).not.toMatch(/bestaat|onbekend|gedeactiveerd/i)
  })

  it('geldige combinatie → sessie opgeslagen + redirect', async () => {
    verifyStaff.mockResolvedValue({ id: '1', name: 'Beheerder', role: 'ADMIN' })
    await expect(
      login({}, formData({ email: 'a@b.nl', password: 'goed' }))
    ).rejects.toThrow('NEXT_REDIRECT')
    expect(save).toHaveBeenCalledOnce()
  })
})
