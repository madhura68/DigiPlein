import type * as React from 'react'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'

const mocks = vi.hoisted(() => ({ pathname: '/clienten' }))

vi.mock('next/navigation', () => ({ usePathname: () => mocks.pathname }))
vi.mock('@/app/logout/actions', () => ({ logout: vi.fn() }))
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    onClick,
    ...props
  }: React.ComponentProps<'a'> & { href: string }) => (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault()
        onClick?.(event)
      }}
      {...props}
    >
      {children}
    </a>
  ),
}))

import { AppShell } from '@/components/app-shell'

describe('AppShell (HS-2 shell + navigatie)', () => {
  beforeEach(() => {
    mocks.pathname = '/clienten'
  })

  it('ADMIN ziet alle nav-items incl. Audit-log + uitloggen', () => {
    render(<AppShell name="Sandra" role="ADMIN" />)
    for (const label of [
      'Start',
      'Cliënten',
      'Vrijwilligers',
      'Cursusaanbod',
      'Audit-log',
      'Account',
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
    expect(screen.getByRole('link', { name: 'Account' })).toBeInTheDocument()
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

  it('markeert Account actief op account-subroutes', () => {
    mocks.pathname = '/account/wachtwoord'
    render(<AppShell name="Sandra" role="ADMIN" />)
    expect(screen.getByRole('link', { name: 'Account' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(screen.getByRole('link', { name: 'Cliënten' })).not.toHaveAttribute(
      'aria-current'
    )
  })

  it('opent een mobiel menu met alle ADMIN-nav-items en uitloggen', () => {
    render(<AppShell name="Sandra" role="ADMIN" />)

    const trigger = screen.getByRole('button', { name: 'Menu' })
    expect(trigger).toHaveClass('h-11')

    fireEvent.click(trigger)
    const dialog = screen.getByRole('dialog', { name: 'Menu' })
    const drawerNav = screen.getByRole('navigation', { name: 'Mobiel menu' })

    for (const label of [
      'Start',
      'Cliënten',
      'Vrijwilligers',
      'Cursusaanbod',
      'Account',
      'Audit-log',
    ]) {
      expect(
        within(drawerNav).getByRole('link', { name: label })
      ).toBeInTheDocument()
    }
    expect(
      within(dialog).getByRole('button', { name: 'Sluit menu' })
    ).toHaveClass('h-11')
    expect(
      within(dialog).getByRole('button', { name: 'Uitloggen' })
    ).toBeInTheDocument()
  })

  it('verbergt Audit-log voor STAFF in het mobiele menu', () => {
    render(<AppShell name="Bea" role="STAFF" />)

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    const drawerNav = screen.getByRole('navigation', { name: 'Mobiel menu' })

    expect(
      within(drawerNav).queryByRole('link', { name: 'Audit-log' })
    ).not.toBeInTheDocument()
    expect(
      within(drawerNav).getByRole('link', { name: 'Account' })
    ).toBeInTheDocument()
  })

  it('markeert Account actief in het mobiele menu op account-subroutes', () => {
    mocks.pathname = '/account/wachtwoord'
    render(<AppShell name="Sandra" role="ADMIN" />)

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    const drawerNav = screen.getByRole('navigation', { name: 'Mobiel menu' })

    expect(within(drawerNav).getByRole('link', { name: 'Account' })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  it('sluit het mobiele menu via sluitknop en na navigatieklik', () => {
    render(<AppShell name="Sandra" role="ADMIN" />)

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    fireEvent.click(screen.getByRole('button', { name: 'Sluit menu' }))
    expect(
      screen.queryByRole('navigation', { name: 'Mobiel menu' })
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    const drawerNav = screen.getByRole('navigation', { name: 'Mobiel menu' })
    fireEvent.click(within(drawerNav).getByRole('link', { name: 'Account' }))
    expect(
      screen.queryByRole('navigation', { name: 'Mobiel menu' })
    ).not.toBeInTheDocument()
  })
})
