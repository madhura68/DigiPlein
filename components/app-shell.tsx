'use client'

import type { StaffRole } from '@prisma/client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef } from 'react'

import { logout } from '@/app/logout/actions'
import { MobileNavDrawer } from '@/components/mobile-nav-drawer'
import { S4MCopilotDrawer } from '@s4m-kit/index'
import { isActive, navItemsForRole, type NavItem } from '@/components/nav-items'
import { Button } from '@/components/ui/button'
import { APP_NAME } from '@/lib/app-name'
import { STAFF_ROLE_LABELS } from '@/lib/enums'

function DesktopNavItem({
  item,
  pathname,
}: {
  item: NavItem
  pathname: string
}) {
  const [open, setOpen] = useState(false)
  // Prevents the trigger's onFocus from reopening the menu immediately after
  // an Escape-triggered refocus (see onKeyDown below).
  const suppressFocusOpen = useRef(false)
  const active = isActive(pathname, item)

  if (item.children?.length) {
    const triggerClassName = `cursor-pointer inline-flex items-center whitespace-nowrap border-b-4 px-4 py-3 font-bold text-foreground ${
      active
        ? 'border-card bg-brand-hover'
        : 'border-transparent hover:bg-brand-hover'
    }`

    function handleTriggerFocus() {
      if (suppressFocusOpen.current) {
        suppressFocusOpen.current = false
        return
      }
      setOpen(true)
    }

    return (
      <li
        className="relative flex items-stretch"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            const trigger = e.currentTarget.querySelector<HTMLElement>('[aria-haspopup="true"]')
            // Only suppress+redirect focus when coming from a child — if trigger
            // already has focus, calling .focus() again fires no event, leaving
            // suppressFocusOpen stuck true for the next natural focus cycle.
            if (trigger && document.activeElement !== trigger) {
              suppressFocusOpen.current = true
              trigger.focus()
            }
            setOpen(false)
          }
        }}
      >
        {item.href ? (
          <Link
            href={item.href}
            aria-haspopup="true"
            aria-expanded={open}
            aria-current={active ? 'page' : undefined}
            className={triggerClassName}
            onFocus={handleTriggerFocus}
          >
            {item.label}
          </Link>
        ) : (
          <button
            type="button"
            aria-haspopup="true"
            aria-expanded={open}
            aria-current={active ? 'page' : undefined}
            className={triggerClassName}
            onFocus={handleTriggerFocus}
          >
            {item.label}
          </button>
        )}
        {/* Visibility is JS-driven via `open` so aria-expanded always matches what's visible.
            CSS group-hover/group-focus-within are intentionally removed to prevent state drift. */}
        <ul
          aria-label={`${item.label} menu`}
          className={`absolute left-0 top-full z-50 min-w-56 border border-outline-variant bg-card py-2 shadow-lg transition ${
            open ? 'visible opacity-100' : 'invisible opacity-0'
          }`}
        >
          {item.children.map((child) => {
            if (!child.href) return null
            const childActive = isActive(pathname, child)
            return (
              <li key={child.href}>
                <Link
                  href={child.href}
                  aria-current={childActive ? 'page' : undefined}
                  className={`block whitespace-nowrap px-4 py-2 font-bold text-foreground transition-colors ${
                    childActive ? 'bg-brand-hover' : 'hover:bg-brand-hover'
                  }`}
                >
                  {child.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </li>
    )
  }

  if (!item.href) return null

  return (
    <li>
      <Link
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={`inline-flex whitespace-nowrap border-b-4 px-4 py-3 font-bold text-foreground transition-colors ${
          active
            ? 'border-card bg-brand-hover'
            : 'border-transparent hover:bg-brand-hover'
        }`}
      >
        {item.label}
      </Link>
    </li>
  )
}

// Compacte werk-shell (HS-2): witte utility-header met woordmerk + account/uitloggen,
// daaronder een volle oranje navigatiebalk. Hele shell print:hidden, zodat export-/
// printpagina's schoon blijven. Nav-labels zijn ZWART (wit op #ee7203 = 2,98:1, faalt
// AA; zwart = 7,0:1 — en zwart-op-kleurvlak is het Bibliotheek Rotterdam-patroon).
export function AppShell({ name, role }: { name: string; role: StaffRole }) {
  const pathname = usePathname()
  const items = navItemsForRole(role)

  return (
    <header className="print:hidden">
      <div className="border-b border-outline-variant bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <span
              aria-hidden="true"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md rounded-br-[1rem] bg-brand text-foreground"
            >
              D
            </span>
            {APP_NAME}
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <div className="hidden items-center gap-4 lg:flex">
              <span className="text-muted-foreground">
                {name} · {STAFF_ROLE_LABELS[role]}
              </span>
              <form action={logout}>
                <Button type="submit" variant="secondary">
                  Uitloggen
                </Button>
              </form>
            </div>
            {/* Scrum4Me-copilot: app-breed, achter login. Toegang volgt uit Scrum4Me-membership
                (ongekoppelde staf ziet de not_linked-melding); jobs staan hard-off via de binding. */}
            <S4MCopilotDrawer basePath="/api/s4m" />
            <MobileNavDrawer
              items={items}
              name={name}
              pathname={pathname}
              role={role}
            />
          </div>
        </div>
      </div>

      <nav aria-label="Hoofdnavigatie" className="hidden bg-brand lg:block">
        <ul className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4">
          {items.map((item) => (
            <DesktopNavItem
              key={item.href ?? item.label}
              item={item}
              pathname={pathname}
            />
          ))}
        </ul>
      </nav>
    </header>
  )
}
