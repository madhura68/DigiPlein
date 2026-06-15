import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const staffMember = { findMany: vi.fn() }
  return { prisma: { staffMember }, staffMember, requireAdmin: vi.fn() }
})

vi.mock('@/lib/db', () => ({ prisma: mocks.prisma }))
vi.mock('@/lib/auth', () => ({ requireAdmin: mocks.requireAdmin }))

import MedewerkersPage from '@/app/medewerkers/page'

function staffRow(overrides: Record<string, unknown>) {
  return {
    id: '1',
    name: 'A',
    email: 'a@b.nl',
    role: 'STAFF',
    isActive: true,
    copilotRegisteredAt: null,
    ...overrides,
  }
}

beforeEach(() => {
  mocks.requireAdmin.mockReset()
  mocks.requireAdmin.mockResolvedValue({ staffId: 'admin-1', role: 'ADMIN' })
  mocks.staffMember.findMany.mockReset()
})

describe('/medewerkers — copilot-statusbadge', () => {
  it('toont "Aangemeld" voor een medewerker die is doorgegeven', async () => {
    mocks.staffMember.findMany.mockResolvedValue([
      staffRow({ copilotRegisteredAt: new Date('2026-06-15T10:00:00.000Z') }),
    ])

    render(await MedewerkersPage())

    expect(screen.getByText('Aangemeld')).toBeInTheDocument()
    expect(screen.queryByText('Niet aangemeld')).not.toBeInTheDocument()
  })

  it('toont "Niet aangemeld" zonder copilotRegisteredAt', async () => {
    mocks.staffMember.findMany.mockResolvedValue([
      staffRow({ copilotRegisteredAt: null }),
    ])

    render(await MedewerkersPage())

    expect(screen.getByText('Niet aangemeld')).toBeInTheDocument()
  })
})
