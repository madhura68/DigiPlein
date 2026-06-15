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

  it('ADMIN ziet Beheer met Gebruikersbeheer en Audit-log + uitloggen', () => {
    render(<AppShell name="Sandra" role="ADMIN" />)
    for (const label of [
      'Start',
      'Cliënten',
      'Vrijwilligers',
      'Cursusaanbod',
      'Account',
      'Gebruikersbeheer',
      'Audit-log',
    ]) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    }
    expect(screen.getByText('Beheer')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Uitloggen' })).toBeInTheDocument()
    expect(
      screen.getByRole('navigation', { name: 'Hoofdnavigatie' })
    ).toBeInTheDocument()
  })

  it('rendert Beheer in de desktopnavigatie als dropdown met beheerlinks', () => {
    render(<AppShell name="Sandra" role="ADMIN" />)

    const desktopNav = screen.getByRole('navigation', { name: 'Hoofdnavigatie' })
    const beheerTrigger = within(desktopNav).getByRole('link', {
      name: 'Beheer',
    })
    expect(beheerTrigger).toHaveAttribute('href', '/beheer')
    expect(beheerTrigger).toHaveAttribute('aria-haspopup', 'true')
    expect(beheerTrigger).not.toHaveAttribute('aria-current')

    const beheerMenu = within(desktopNav).getByRole('list', {
      name: 'Beheer menu',
    })
    expect(
      within(beheerMenu).getByRole('link', { name: 'Gebruikersbeheer' })
    ).toHaveAttribute('href', '/medewerkers')
    expect(
      within(beheerMenu).getByRole('link', { name: 'Audit-log' })
    ).toHaveAttribute('href', '/audit')
  })

  it('houdt de uitlogknop op minimaal 44px klikhoogte', () => {
    render(<AppShell name="Sandra" role="ADMIN" />)
    expect(screen.getByRole('button', { name: 'Uitloggen' })).toHaveClass('h-11')
  })

  it('STAFF ziet geen Beheer-groep', () => {
    render(<AppShell name="Bea" role="STAFF" />)
    expect(screen.queryByText('Beheer')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Audit-log' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Gebruikersbeheer' })
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

  it('markeert Beheer actief op gebruikersbeheer-subroutes', () => {
    mocks.pathname = '/medewerkers'
    render(<AppShell name="Sandra" role="ADMIN" />)
    expect(screen.getByRole('link', { name: 'Beheer' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(screen.getByRole('link', { name: 'Gebruikersbeheer' })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  it('markeert Beheer actief op de beheer-overzichtspagina', () => {
    mocks.pathname = '/beheer'
    render(<AppShell name="Sandra" role="ADMIN" />)
    expect(screen.getByRole('link', { name: 'Beheer' })).toHaveAttribute(
      'aria-current',
      'page'
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
      'Beheer',
      'Gebruikersbeheer',
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

  it('verbergt Beheer voor STAFF in het mobiele menu', () => {
    render(<AppShell name="Bea" role="STAFF" />)

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    const drawerNav = screen.getByRole('navigation', { name: 'Mobiel menu' })

    expect(within(drawerNav).queryByText('Beheer')).not.toBeInTheDocument()
    expect(
      within(drawerNav).queryByRole('link', { name: 'Audit-log' })
    ).not.toBeInTheDocument()
    expect(
      within(drawerNav).queryByRole('link', { name: 'Gebruikersbeheer' })
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

  it('markeert Beheer actief in het mobiele menu op audit-log', () => {
    mocks.pathname = '/audit'
    render(<AppShell name="Sandra" role="ADMIN" />)

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    const drawerNav = screen.getByRole('navigation', { name: 'Mobiel menu' })

    expect(within(drawerNav).getByRole('link', { name: 'Beheer' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(within(drawerNav).getByRole('link', { name: 'Audit-log' })).toHaveAttribute(
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
