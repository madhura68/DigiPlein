import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }))
vi.mock('@/lib/auth/pairing', () => ({ isPairedSessionExpired: vi.fn() }))

import { getSession } from '@/lib/auth'
import { isPairedSessionExpired } from '@/lib/auth/pairing'
import { copilotRequireSession } from '@/lib/copilot-session'

beforeEach(() => vi.clearAllMocks())

describe('copilotRequireSession (kit-session-adapter)', () => {
  it('null zonder ingelogde staf (geen staffId)', async () => {
    ;(getSession as ReturnType<typeof vi.fn>).mockResolvedValue({})
    ;(isPairedSessionExpired as ReturnType<typeof vi.fn>).mockReturnValue(false)
    expect(await copilotRequireSession()).toBeNull()
  })

  it('null bij een verlopen paired-sessie (ook al is er een staffId)', async () => {
    ;(getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ staffId: 's1', name: 'A', role: 'STAFF' })
    ;(isPairedSessionExpired as ReturnType<typeof vi.fn>).mockReturnValue(true)
    expect(await copilotRequireSession()).toBeNull()
  })

  it('{ id: staffId, name, role } bij een geldige sessie', async () => {
    ;(getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ staffId: 's1', name: 'Sandra', role: 'ADMIN' })
    ;(isPairedSessionExpired as ReturnType<typeof vi.fn>).mockReturnValue(false)
    expect(await copilotRequireSession()).toEqual({ id: 's1', name: 'Sandra', role: 'ADMIN' })
  })
})
