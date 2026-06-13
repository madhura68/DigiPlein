import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  jar: {
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => mocks.jar),
}))

import {
  clearPairCookie,
  PAIR_COOKIE_NAME,
  readPairCookie,
  setPairCookie,
} from '@/lib/auth/pair-cookie'

beforeEach(() => {
  mocks.jar.set.mockReset()
  mocks.jar.get.mockReset()
  mocks.jar.delete.mockReset()
})

describe('pair-cookie helpers', () => {
  it('zet een DigiPlein-specifieke HttpOnly cookie onder /api/auth/pair', async () => {
    await setPairCookie('desktop-token')

    expect(PAIR_COOKIE_NAME).toBe('digiplein_pair')
    expect(mocks.jar.set).toHaveBeenCalledWith('digiplein_pair', 'desktop-token', {
      httpOnly: true,
      maxAge: 300,
      path: '/api/auth/pair',
      sameSite: 'lax',
      secure: false,
    })
  })

  it('leest en wist dezelfde path-scoped cookie', async () => {
    mocks.jar.get.mockReturnValue({ value: 'desktop-token' })

    await expect(readPairCookie()).resolves.toBe('desktop-token')
    await clearPairCookie()

    expect(mocks.jar.get).toHaveBeenCalledWith('digiplein_pair')
    expect(mocks.jar.delete).toHaveBeenCalledWith({
      name: 'digiplein_pair',
      path: '/api/auth/pair',
    })
  })
})
