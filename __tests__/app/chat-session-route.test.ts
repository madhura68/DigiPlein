// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({ getSession: vi.fn() }))

vi.mock('@/lib/auth', () => ({ getSession: mocks.getSession }))

import { GET } from '@/app/api/chat/session/route'

beforeEach(() => {
  mocks.getSession.mockReset()
})

describe('/api/chat/session (identiteitscontract §10.1)', () => {
  it('zonder geldige sessie → 401', async () => {
    mocks.getSession.mockResolvedValue({})
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('met sessie → 200 met exact { name, role } (dataminimalisatie)', async () => {
    mocks.getSession.mockResolvedValue({
      staffId: 's1',
      name: 'Sandra',
      role: 'STAFF',
    })
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ name: 'Sandra', role: 'STAFF' })
    // Geen extra velden (geen staffId-lek naar het externe component).
    expect(Object.keys(body).sort()).toEqual(['name', 'role'])
  })
})
