import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/navigation', () => ({ usePathname: () => '/clienten' }))
vi.mock('@/app/logout/actions', () => ({ logout: vi.fn() }))

import { AppShell } from '@/components/app-shell'

describe('AppShell (HS-2 shell + navigatie)', () => {
  it('ADMIN ziet alle nav-items incl. Audit-log + uitloggen', () => {
    render(<AppShell name="Sandra" role="ADMIN" />)
    for (const label of [
      'Start',
      'Cliënten',
      'Vrijwilligers',
      'Cursusaanbod',
      'Audit-log',
    ]) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    }
    expect(screen.getByRole('button', { name: 'Uitloggen' })).toBeInTheDocument()
    expect(
      screen.getByRole('navigation', { name: 'Hoofdnavigatie' })
    ).toBeInTheDocument()
  })

  it('houdt de uitlogknop op minimaal 44px klikhoogte', () => {
    render(<AppShell name="Sandra" role="ADMIN" />)
    expect(screen.getByRole('button', { name: 'Uitloggen' })).toHaveClass('h-11')
  })

  it('STAFF ziet geen Audit-log', () => {
    render(<AppShell name="Bea" role="STAFF" />)
    expect(
      screen.queryByRole('link', { name: 'Audit-log' })
    ).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cliënten' })).toBeInTheDocument()
  })

  it('markeert de actieve route (pathname=/clienten → Cliënten)', () => {
    render(<AppShell name="Sandra" role="ADMIN" />)
    expect(screen.getByRole('link', { name: 'Cliënten' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(screen.getByRole('link', { name: 'Start' })).not.toHaveAttribute(
      'aria-current'
    )
  })
})
