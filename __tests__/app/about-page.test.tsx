import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  requireStaff: vi.fn(),
  getBuildInfo: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ requireStaff: mocks.requireStaff }))
vi.mock('@/lib/build-info', () => ({ getBuildInfo: mocks.getBuildInfo }))

import AboutPage from '@/app/over/page'

beforeEach(() => {
  mocks.requireStaff.mockReset()
  mocks.requireStaff.mockResolvedValue({
    staffId: 'staff-1',
    name: 'Bea',
    role: 'STAFF',
  })
  mocks.getBuildInfo.mockReset()
  mocks.getBuildInfo.mockReturnValue({
    version: '0.1.0',
    builtAt: '2026-07-05T10:30:00.000Z',
    builtAtLabel: '5 juli 2026 om 10:30',
  })
})

describe('/over', () => {
  it('vereist een medewerker-sessie', async () => {
    render(await AboutPage())

    expect(mocks.requireStaff).toHaveBeenCalledOnce()
  })

  it('toont website, Scrum4Me-uitleg en build-informatie', async () => {
    render(await AboutPage())

    expect(screen.getByRole('heading', { level: 1, name: 'Over DigiPlein' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'jp-visser.nl' })).toHaveAttribute(
      'href',
      'https://jp-visser.nl'
    )
    expect(screen.getByText(/DigiPlein is gemaakt met Scrum4Me/i)).toBeInTheDocument()
    expect(screen.getByText('Versie')).toBeInTheDocument()
    expect(screen.getByText('0.1.0')).toBeInTheDocument()
    expect(screen.getByText('Gebouwd op')).toBeInTheDocument()
    expect(screen.getByText('5 juli 2026 om 10:30')).toBeInTheDocument()
  })
})
