import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  requireStaff: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ requireStaff: mocks.requireStaff }))
vi.mock('@/app/login/qr-login-button', () => ({
  QrLoginButton: () => <button type="button">Inloggen via mobiel</button>,
}))

import QrPairingPage from '@/app/account/qr-pairing/page'

beforeEach(() => {
  mocks.requireStaff.mockReset()
  mocks.requireStaff.mockResolvedValue({
    staffId: 'staff-1',
    name: 'Bea',
    role: 'STAFF',
  })
})

describe('/account/qr-pairing', () => {
  it('vereist een medewerker-sessie', async () => {
    render(await QrPairingPage())
    expect(mocks.requireStaff).toHaveBeenCalledOnce()
  })

  it('toont accountcontext en de bestaande QR-login startknop', async () => {
    render(await QrPairingPage())

    expect(
      screen.getByRole('heading', { level: 1, name: 'QR-login starten' })
    ).toBeInTheDocument()
    expect(screen.getByText(/desktop waarop je wilt inloggen/i)).toBeInTheDocument()
    expect(screen.getByText(/al bent ingelogd/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /inloggen via mobiel/i })
    ).toBeInTheDocument()
  })
})
