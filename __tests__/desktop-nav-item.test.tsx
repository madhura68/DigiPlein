import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}))
vi.mock('@/app/logout/actions', () => ({ logout: vi.fn() }))
vi.mock('@s4m-kit/index', () => ({ S4MCopilotDrawer: () => null }))

import { AppShell } from '@/components/app-shell'

describe('desktop nav dropdown', () => {
  it('aria-expanded is false bij mount', () => {
    render(<AppShell name="Sandra" role="ADMIN" />)
    expect(screen.getByRole('link', { name: /^Beheer$/i })).toHaveAttribute('aria-expanded', 'false')
  })

  it('aria-expanded=true bij mouseEnter op het li-element', () => {
    render(<AppShell name="Sandra" role="ADMIN" />)
    const li = screen.getByRole('link', { name: /^Beheer$/i }).closest('li')!
    fireEvent.mouseEnter(li)
    expect(screen.getByRole('link', { name: /^Beheer$/i })).toHaveAttribute('aria-expanded', 'true')
  })

  it('aria-expanded=false bij mouseLeave op het li-element', () => {
    render(<AppShell name="Sandra" role="ADMIN" />)
    const li = screen.getByRole('link', { name: /^Beheer$/i }).closest('li')!
    fireEvent.mouseEnter(li)
    fireEvent.mouseLeave(li)
    expect(screen.getByRole('link', { name: /^Beheer$/i })).toHaveAttribute('aria-expanded', 'false')
  })

  it('aria-expanded=true wanneer de trigger focus krijgt', () => {
    render(<AppShell name="Sandra" role="ADMIN" />)
    fireEvent.focus(screen.getByRole('link', { name: /^Beheer$/i }))
    expect(screen.getByRole('link', { name: /^Beheer$/i })).toHaveAttribute('aria-expanded', 'true')
  })

  it('Escape sluit het submenu en zet aria-expanded terug op false', () => {
    render(<AppShell name="Sandra" role="ADMIN" />)
    const li = screen.getByRole('link', { name: /^Beheer$/i }).closest('li')!
    fireEvent.mouseEnter(li)
    fireEvent.keyDown(li, { key: 'Escape' })
    expect(screen.getByRole('link', { name: /^Beheer$/i })).toHaveAttribute('aria-expanded', 'false')
  })

  it('Escape vanuit een gefocuste child-link sluit het menu en herplaatst focus op trigger', () => {
    render(<AppShell name="Sandra" role="ADMIN" />)
    const trigger = screen.getByRole('link', { name: /^Beheer$/i })
    const li = trigger.closest('li')!

    // Open via mouseEnter
    fireEvent.mouseEnter(li)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    // Get child link — it's in the DOM regardless of open state in jsdom
    const childLink = screen.getByRole('link', { name: /gebruikersbeheer/i })

    // Give the child link focus so the test reflects real browser state
    childLink.focus()
    expect(document.activeElement).toBe(childLink)

    // Escape bubbles from child to the li's onKeyDown
    fireEvent.keyDown(childLink, { key: 'Escape' })

    // Menu must be closed and trigger must have focus (suppressFocusOpen prevents re-open)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(document.activeElement).toBe(trigger)
  })

  it('Escape op de gefocuste trigger laat suppressFocusOpen niet hangen (volgende focus opent normaal)', () => {
    render(<AppShell name="Sandra" role="ADMIN" />)
    const trigger = screen.getByRole('link', { name: /^Beheer$/i })
    const li = trigger.closest('li')!

    // Open menu and give the trigger focus
    fireEvent.mouseEnter(li)
    trigger.focus()
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    // Escape while trigger itself has focus — suppress flag must NOT be set
    fireEvent.keyDown(li, { key: 'Escape' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    // Blur, then refocus — menu must open normally (flag was not stuck)
    fireEvent.blur(trigger)
    fireEvent.focus(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })
})
