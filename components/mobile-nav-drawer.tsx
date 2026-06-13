'use client'

import { Dialog } from '@base-ui/react/dialog'
import type { StaffRole } from '@prisma/client'
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
