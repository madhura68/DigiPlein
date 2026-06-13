import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  session: { destroy: vi.fn() },
}))

vi.mock('@/lib/auth', () => ({ getSession: mocks.getSession }))

import { GET } from '@/app/api/auth/logout/route'

beforeEach(() => {
  mocks.session.destroy.mockReset()
  mocks.getSession.mockReset()
  mocks.getSession.mockResolvedValue(mocks.session)
})

describe('GET /api/auth/logout', () => {
  it('vernietigt de iron-session in een route handler en redirect naar /login', async () => {
    const response = await GET(
      new Request('http://localhost/api/auth/logout?reason=paired-expired')
    )

    expect(mocks.session.destroy).toHaveBeenCalledOnce()
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/login')
  })
})
