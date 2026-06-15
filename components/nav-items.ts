import type { StaffRole } from '@prisma/client'

export type NavItem = {
  href?: string
  label: string
  adminOnly?: boolean
  children?: NavItem[]
}

export const NAV: NavItem[] = [
  { href: '/', label: 'Start' },
  { href: '/clienten', label: 'Cliënten' },
  { href: '/vrijwilligers', label: 'Vrijwilligers' },
  { href: '/cursusaanbod', label: 'Cursusaanbod' },
  { href: '/account', label: 'Account' },
  {
    href: '/beheer',
    label: 'Beheer',
    adminOnly: true,
    children: [
      { href: '/medewerkers', label: 'Gebruikersbeheer' },
      { href: '/audit', label: 'Audit-log' },
    ],
  },
]

function hrefIsActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function isActive(pathname: string, itemOrHref: NavItem | string): boolean {
  if (typeof itemOrHref === 'string') return hrefIsActive(pathname, itemOrHref)
  if (itemOrHref.href && hrefIsActive(pathname, itemOrHref.href)) return true
  return itemOrHref.children?.some((child) => isActive(pathname, child)) ?? false
}

function navItemForRole(item: NavItem, role: StaffRole): NavItem | null {
  if (item.adminOnly && role !== 'ADMIN') return null
  const children = item.children
    ?.map((child) => navItemForRole(child, role))
    .filter((child): child is NavItem => child !== null)

  if (item.children && (!children || children.length === 0) && !item.href) {
    return null
  }

  return children ? { ...item, children } : { ...item }
}

export function navItemsForRole(role: StaffRole): NavItem[] {
  return NAV.map((item) => navItemForRole(item, role)).filter(
    (item): item is NavItem => item !== null
  )
}
