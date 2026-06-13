'use client'

import type { StaffRole } from '@prisma/client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { logout } from '@/app/logout/actions'
import { isActive, navItemsForRole } from '@/components/nav-items'
import { Button } from '@/components/ui/button'
import { APP_NAME } from '@/lib/app-name'
import { STAFF_ROLE_LABELS } from '@/lib/enums'

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
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              {name} · {STAFF_ROLE_LABELS[role]}
            </span>
            <form action={logout}>
              <Button type="submit" variant="secondary">
                Uitloggen
              </Button>
            </form>
          </div>
        </div>
      </div>

      <nav aria-label="Hoofdnavigatie" className="bg-brand">
        <ul className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4">
          {items.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <li key={item.href}>
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
          })}
        </ul>
      </nav>
    </header>
  )
}
