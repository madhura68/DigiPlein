import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const staffInvite = { findUnique: vi.fn() }
  return { prisma: { staffInvite }, staffInvite }
})

vi.mock('@/lib/db', () => ({ prisma: mocks.prisma }))

import StaffInvitePage from '@/app/uitnodiging/[token]/page'

beforeEach(() => {
  mocks.staffInvite.findUnique.mockReset()
  mocks.staffInvite.findUnique.mockResolvedValue({
    expiresAt: new Date('2026-06-18T10:00:00.000Z'),
    usedAt: null,
    revokedAt: null,
    staff: { isActive: true },
  })
})

describe('/uitnodiging/[token]', () => {
  it('toont een read-only uitnodigingspagina met acceptatieknop', async () => {
    render(
      await StaffInvitePage({
        params: Promise.resolve({ token: 'abc_DEF-123' }),
      })
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Uitnodiging accepteren' })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Je stelt je wachtwoord in na het accepteren/i)
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Doorgaan' })).toBeInTheDocument()
  })

  it('toont een neutrale fout zonder knop voor ongeldige uitnodigingen', async () => {
    mocks.staffInvite.findUnique.mockResolvedValue(null)

    render(
      await StaffInvitePage({
        params: Promise.resolve({ token: 'ongeldig-token' }),
      })
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Uitnodiging niet beschikbaar' })
    ).toBeInTheDocument()
    expect(screen.getByText(/ongeldig of verlopen/i)).toBeInTheDocument()
    expect(screen.getByText(/beheerder om een nieuwe uitnodiging/i)).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Doorgaan' })
    ).not.toBeInTheDocument()
  })
})
