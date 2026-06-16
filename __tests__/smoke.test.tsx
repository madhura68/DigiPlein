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
import { requireStaff } from '@/lib/auth'

describe('startscherm smoke', () => {
  it('rendert de begroeting met de naam uit de sessie (vitest + jsdom + TSX-keten)', async () => {
    render(await Home())
    expect(
      screen.getByRole('heading', { level: 1, name: /welkom terug, sandra/i })
    ).toBeInTheDocument()
  })

  it('toont navigatietegels voor staff (Cliënten, Vrijwilligers, Cursusaanbod)', async () => {
    render(await Home())
    expect(screen.getByRole('heading', { level: 2, name: /cliënten/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /vrijwilligers/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /cursusaanbod/i })).toBeInTheDocument()
    // Admin-only tiles must be absent for role STAFF
    expect(screen.queryByRole('heading', { name: /medewerkers/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /beheer/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /audit/i })).not.toBeInTheDocument()
  })

  it('toont admin-only tegels voor ADMIN-rol', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(requireStaff).mockResolvedValueOnce({ staffId: 'a1', name: 'Anna', role: 'ADMIN' } as any)
    render(await Home())
    expect(screen.getByRole('heading', { level: 2, name: /medewerkers/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /beheer/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /audit/i })).toBeInTheDocument()
  })
})
