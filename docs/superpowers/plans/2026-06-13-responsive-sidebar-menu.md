# Responsive Sidebar Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a responsive overlay sidebar menu for phone/tablet while preserving the current desktop navigation.

**Status:** implemented and verified on 2026-06-13. Branch `codex/responsive-sidebar-menu` was pushed and PR #10 was opened on Forgejo. The checklist below is retained as the execution plan; the implemented code lives in `components/nav-items.ts`, `components/mobile-nav-drawer.tsx`, and `components/app-shell.tsx`.

**Architecture:** Extract the navigation model into a small shared module, keep `AppShell` as the shell orchestrator, and add a focused `MobileNavDrawer` component built with `@base-ui/react/dialog`. Desktop keeps the current orange nav; below `lg` the orange nav is hidden and the header shows a `Menu` button that opens the drawer.

**Tech Stack:** Next.js App Router, React 19, TypeScript strict, Tailwind CSS v4, `@base-ui/react/dialog`, Vitest + Testing Library.

---

## Files

- Create: `components/nav-items.ts`
  - Shared `NavItem` type, `NAV`, `isActive()`, and `navItemsForRole()`.
- Create: `components/mobile-nav-drawer.tsx`
  - Client component for the phone/tablet overlay drawer.
- Modify: `components/app-shell.tsx`
  - Use shared nav helpers, hide desktop utility actions below `lg`, show the drawer trigger below `lg`, hide the orange nav below `lg`.
- Modify: `__tests__/app/app-shell.test.tsx`
  - Add drawer render/interaction tests while preserving existing desktop nav tests.

## Task 1: Extract Shared Navigation Model

**Files:**
- Create: `components/nav-items.ts`
- Modify: `components/app-shell.tsx`
- Test: `__tests__/app/app-shell.test.tsx`

- [ ] **Step 1: Create shared nav helper module**

Create `components/nav-items.ts`:

```ts
import type { StaffRole } from '@prisma/client'

export type NavItem = { href: string; label: string; adminOnly?: boolean }

export const NAV: NavItem[] = [
  { href: '/', label: 'Start' },
  { href: '/clienten', label: 'Cliënten' },
  { href: '/vrijwilligers', label: 'Vrijwilligers' },
  { href: '/cursusaanbod', label: 'Cursusaanbod' },
  { href: '/account', label: 'Account' },
  { href: '/audit', label: 'Audit-log', adminOnly: true },
]

export function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function navItemsForRole(role: StaffRole): NavItem[] {
  return NAV.filter((item) => !item.adminOnly || role === 'ADMIN')
}
```

- [ ] **Step 2: Update `AppShell` to use shared helpers**

In `components/app-shell.tsx`, remove the local `NavItem`, `NAV`, and
`isActive()` definitions. Add:

```ts
import { isActive, navItemsForRole } from '@/components/nav-items'
```

Change:

```ts
const items = NAV.filter((item) => !item.adminOnly || role === 'ADMIN')
```

to:

```ts
const items = navItemsForRole(role)
```

- [ ] **Step 3: Run existing shell tests**

Run:

```bash
npm test -- __tests__/app/app-shell.test.tsx
```

Expected: existing tests still pass. There should be no visible behavior change.

- [ ] **Step 4: Commit extraction**

```bash
git add components/nav-items.ts components/app-shell.tsx __tests__/app/app-shell.test.tsx
git commit -m "refactor(nav): deel navigatiemodel"
```

## Task 2: Add Mobile Drawer Tests And Implementation

**Files:**
- Create: `components/mobile-nav-drawer.tsx`
- Modify: `components/app-shell.tsx`
- Modify: `__tests__/app/app-shell.test.tsx`

- [ ] **Step 1: Write failing drawer tests**

Update `__tests__/app/app-shell.test.tsx` imports:

```ts
import { fireEvent, render, screen, within } from '@testing-library/react'
```

Add tests:

```tsx
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
```

- [ ] **Step 2: Verify the new tests fail**

Run:

```bash
npm test -- __tests__/app/app-shell.test.tsx
```

Expected: FAIL because the `Menu` button and mobile drawer do not exist yet.

- [ ] **Step 3: Create the drawer component**

Create `components/mobile-nav-drawer.tsx`:

```tsx
'use client'

import type { StaffRole } from '@prisma/client'
import { Dialog } from '@base-ui/react/dialog'
import Link from 'next/link'
import { useState } from 'react'

import { logout } from '@/app/logout/actions'
import { isActive, type NavItem } from '@/components/nav-items'
import { Button } from '@/components/ui/button'
import { STAFF_ROLE_LABELS } from '@/lib/enums'

export function MobileNavDrawer({
  items,
  name,
  pathname,
  role,
}: {
  items: NavItem[]
  name: string
  pathname: string
  role: StaffRole
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="secondary"
        className="lg:hidden"
        onClick={() => setOpen(true)}
      >
        Menu
      </Button>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-foreground/40 lg:hidden" />
        <Dialog.Popup className="fixed inset-y-0 left-0 z-50 flex w-[min(20rem,calc(100vw-2rem))] flex-col gap-5 border-r border-outline-variant bg-card p-5 shadow-lg lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <Dialog.Title className="text-xl">Menu</Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground">
                {name} · {STAFF_ROLE_LABELS[role]}
              </Dialog.Description>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Sluit menu
            </Button>
          </div>

          <nav aria-label="Mobiel menu">
            <ul className="flex flex-col gap-2">
              {items.map((item) => {
                const active = isActive(pathname, item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => setOpen(false)}
                      className={`flex min-h-11 items-center rounded-card px-4 py-2 font-bold text-foreground outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                        active ? 'bg-brand-hover' : 'hover:bg-surface-hover'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <form action={logout} className="mt-auto">
            <Button type="submit" variant="secondary" className="w-full">
              Uitloggen
            </Button>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

- [ ] **Step 4: Wire drawer into `AppShell`**

In `components/app-shell.tsx`, add:

```ts
import { MobileNavDrawer } from '@/components/mobile-nav-drawer'
```

Inside the utility header, change the right-side block to keep account/logout on
desktop and show the drawer trigger on phone/tablet:

```tsx
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
  <MobileNavDrawer
    items={items}
    name={name}
    pathname={pathname}
    role={role}
  />
</div>
```

Change the desktop nav element from:

```tsx
<nav aria-label="Hoofdnavigatie" className="bg-brand">
```

to:

```tsx
<nav aria-label="Hoofdnavigatie" className="hidden bg-brand lg:block">
```

- [ ] **Step 5: Run drawer tests**

Run:

```bash
npm test -- __tests__/app/app-shell.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit drawer implementation**

```bash
git add components/mobile-nav-drawer.tsx components/app-shell.tsx __tests__/app/app-shell.test.tsx
git commit -m "feat(nav): voeg responsive sidebar-menu toe"
```

## Task 3: Verify And Browser-Check Responsive Behavior

**Files:**
- Modify only if verification reveals an issue:
  - `components/mobile-nav-drawer.tsx`
  - `components/app-shell.tsx`
  - `__tests__/app/app-shell.test.tsx`

- [ ] **Step 1: Run full verification**

Run:

```bash
npm run verify
```

Expected: eslint, typecheck, and the full Vitest suite pass.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: Next.js production build passes.

- [ ] **Step 3: Start local dev server**

Run:

```bash
npm run dev -- --port 3007
```

Expected: app available at `http://localhost:3007`.

- [ ] **Step 4: Browser-check desktop**

Open `http://localhost:3007/` with a logged-in dummy staff/admin session.

Expected desktop checks:

- Header shows DigiPlein brand.
- Desktop utility area shows name/role and `Uitloggen`.
- Desktop orange `Hoofdnavigatie` is visible.
- `Menu` drawer trigger is hidden at desktop width.
- No horizontal overflow.

- [ ] **Step 5: Browser-check mobile width**

Set browser viewport to `390x844` and check `/`, `/clienten`,
`/account/wachtwoord`, and `/account/qr-pairing`.

Expected mobile checks:

- Header shows DigiPlein brand and `Menu`.
- Orange desktop `Hoofdnavigatie` is hidden.
- Opening `Menu` shows the left overlay drawer.
- Drawer nav has `Mobiel menu` landmark.
- Links are at least 44px high.
- `Audit-log` appears for `ADMIN` and not for `STAFF` where testable.
- Active route is visible in drawer.
- Drawer closes with `Sluit menu` and after link click.
- No horizontal overflow.

- [ ] **Step 6: Log verification and commit fixes if needed**

If any fixes were required:

```bash
git add components/mobile-nav-drawer.tsx components/app-shell.tsx __tests__/app/app-shell.test.tsx
git commit -m "fix(nav): verbeter responsive menu gedrag"
```

If no fixes were required, do not create an empty commit.

## Acceptance Checklist

- [ ] Phone/tablet always use an overlay drawer menu.
- [ ] Desktop still uses the current horizontal orange nav.
- [ ] Drawer uses the same nav source and role filtering as desktop.
- [ ] Active route works for normal routes and `/account/*`.
- [ ] Drawer can close via close button, Escape/backdrop, and navigation click.
- [ ] No Radix imports or `asChild`.
- [ ] No orange normal text on white.
- [ ] `npm run verify` passes.
- [ ] `npm run build` passes.
- [ ] Browsercheck passes on desktop and 390px mobile viewport.
