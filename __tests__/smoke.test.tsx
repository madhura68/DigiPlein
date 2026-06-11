import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Het startscherm vereist een sessie; mock alleen de auth-helpers.
vi.mock('@/lib/auth', () => ({
  requireStaff: vi
    .fn()
    .mockResolvedValue({ staffId: 's1', name: 'Sandra', role: 'STAFF' }),
  getSession: vi.fn(),
}))

import Home from '@/app/page'

describe('startscherm smoke', () => {
  it('rendert de begroeting met de naam uit de sessie (vitest + jsdom + TSX-keten)', async () => {
    render(await Home())
    expect(
      screen.getByRole('heading', { level: 1, name: /welkom terug, sandra/i })
    ).toBeInTheDocument()
  })
})
