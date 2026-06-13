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
