import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  requireStaff: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ requireStaff: mocks.requireStaff }))

import PasswordPage from '@/app/account/wachtwoord/page'

beforeEach(() => {
  mocks.requireStaff.mockReset()
  mocks.requireStaff.mockResolvedValue({
    staffId: 'staff-1',
    name: 'Bea',
    role: 'STAFF',
  })
})

describe('/account/wachtwoord', () => {
  it('vereist een medewerker-sessie', async () => {
    render(await PasswordPage())
    expect(mocks.requireStaff).toHaveBeenCalledWith({
      allowPasswordChange: true,
    })
  })

  it('toont het wachtwoordformulier', async () => {
    render(await PasswordPage())

    expect(
      screen.getByRole('heading', { level: 1, name: 'Wachtwoord wijzigen' })
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Huidig wachtwoord')).toHaveAttribute(
      'type',
      'password'
    )
    expect(screen.getByLabelText('Nieuw wachtwoord')).toHaveAttribute(
      'type',
      'password'
    )
    expect(screen.getByLabelText('Nieuw wachtwoord herhalen')).toHaveAttribute(
      'type',
      'password'
    )
    expect(
      screen.getByRole('button', { name: 'Wachtwoord opslaan' })
    ).toBeInTheDocument()
  })

  it('verbergt het huidige wachtwoordveld voor forced-password sessies', async () => {
    mocks.requireStaff.mockResolvedValue({
      staffId: 'staff-1',
      name: 'Bea',
      role: 'STAFF',
      mustChangePassword: true,
    })

    render(await PasswordPage())

    expect(screen.queryByLabelText('Huidig wachtwoord')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Nieuw wachtwoord')).toBeInTheDocument()
    expect(screen.getByLabelText('Nieuw wachtwoord herhalen')).toBeInTheDocument()
  })
})
