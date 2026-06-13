import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const mocks = vi.hoisted(() => ({
  requireStaff: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ requireStaff: mocks.requireStaff }))

import AccountPage from '@/app/account/page'

beforeEach(() => {
  mocks.requireStaff.mockReset()
  mocks.requireStaff.mockResolvedValue({
    staffId: 'staff-1',
    name: 'Bea',
    role: 'STAFF',
  })
})

describe('/account', () => {
  it('vereist een medewerker-sessie', async () => {
    render(await AccountPage())
    expect(mocks.requireStaff).toHaveBeenCalledOnce()
  })

  it('toont acties voor wachtwoord wijzigen en QR-login starten', async () => {
    render(await AccountPage())

    expect(
      screen.getByRole('heading', { level: 1, name: 'Account' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /wachtwoord wijzigen/i })).toHaveAttribute(
      'href',
      '/account/wachtwoord'
    )
    expect(screen.getByRole('link', { name: /qr-login starten/i })).toHaveAttribute(
      'href',
      '/account/qr-pairing'
    )
  })
})
