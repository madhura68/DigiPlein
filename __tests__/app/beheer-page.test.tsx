import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ requireAdmin: mocks.requireAdmin }))

import BeheerPage from '@/app/beheer/page'

beforeEach(() => {
  mocks.requireAdmin.mockReset()
  mocks.requireAdmin.mockResolvedValue({
    staffId: 'staff-1',
    name: 'Bea',
    role: 'ADMIN',
  })
})

describe('/beheer', () => {
  it('vereist beheerderrechten', async () => {
    render(await BeheerPage())
    expect(mocks.requireAdmin).toHaveBeenCalledOnce()
  })

  it('toont beheer-tegels voor gebruikersbeheer en audit-log', async () => {
    render(await BeheerPage())

    expect(
      screen.getByRole('heading', { level: 1, name: 'Beheer' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /gebruikersbeheer/i })
    ).toHaveAttribute('href', '/medewerkers')
    expect(screen.getByRole('link', { name: /audit-log/i })).toHaveAttribute(
      'href',
      '/audit'
    )
  })
})
