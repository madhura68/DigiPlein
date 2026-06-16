import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))
vi.mock('@/app/logout/actions', () => ({ logout: vi.fn() }))

import { MobileNavDrawer } from '@/components/mobile-nav-drawer'
import type { NavItem } from '@/components/nav-items'

const PARENT_ONLY_ITEMS: NavItem[] = [
  {
    label: 'Sectie',
    children: [{ href: '/sectie/a', label: 'Item A' }],
  },
]

function openDrawer() {
  fireEvent.click(screen.getByRole('button', { name: /menu/i }))
}

describe('mobile nav parent-only item', () => {
  it('rendert een button, niet een span', () => {
    render(<MobileNavDrawer items={PARENT_ONLY_ITEMS} name="Sandra" pathname="/" role="STAFF" />)
    openDrawer()
    expect(screen.getByRole('button', { name: /sectie/i })).toBeInTheDocument()
  })

  it('heeft aria-expanded en aria-controls op de button', () => {
    render(<MobileNavDrawer items={PARENT_ONLY_ITEMS} name="Sandra" pathname="/" role="STAFF" />)
    openDrawer()
    const btn = screen.getByRole('button', { name: /sectie/i })
    expect(btn).toHaveAttribute('aria-expanded')
    expect(btn).toHaveAttribute('aria-controls')
  })

  it('start GESLOTEN wanneer geen child actief is', () => {
    render(<MobileNavDrawer items={PARENT_ONLY_ITEMS} name="Sandra" pathname="/" role="STAFF" />)
    openDrawer()
    expect(screen.getByRole('button', { name: /sectie/i })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link', { name: /item a/i })).not.toBeInTheDocument()
  })

  it('start OPEN wanneer een child actief is', () => {
    render(<MobileNavDrawer items={PARENT_ONLY_ITEMS} name="Sandra" pathname="/sectie/a" role="STAFF" />)
    openDrawer()
    expect(screen.getByRole('button', { name: /sectie/i })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: /item a/i })).toBeInTheDocument()
  })

  it('toggle: klik opent; tweede klik sluit', () => {
    render(<MobileNavDrawer items={PARENT_ONLY_ITEMS} name="Sandra" pathname="/" role="STAFF" />)
    openDrawer()
    const btn = screen.getByRole('button', { name: /sectie/i })
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: /item a/i })).toBeInTheDocument()
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link', { name: /item a/i })).not.toBeInTheDocument()
  })

  it('aria-controls verwijst naar het id van de child-list', () => {
    render(<MobileNavDrawer items={PARENT_ONLY_ITEMS} name="Sandra" pathname="/sectie/a" role="STAFF" />)
    openDrawer()
    const btn = screen.getByRole('button', { name: /sectie/i })
    const controlsId = btn.getAttribute('aria-controls')!
    expect(controlsId).toBeTruthy()
    expect(document.getElementById(controlsId)).toBeInTheDocument()
  })
})
