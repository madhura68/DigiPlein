import { describe, expect, it } from 'vitest'

import { isActive, navItemsForRole } from '@/components/nav-items'

describe('nav-items', () => {
  it('filtert admin-only items voor STAFF', () => {
    expect(navItemsForRole('STAFF').map((item) => item.label)).toEqual([
      'Start',
      'Cliënten',
      'Vrijwilligers',
      'Cursusaanbod',
      'Account',
    ])
  })

  it('houdt admin-only items zichtbaar voor ADMIN', () => {
    expect(navItemsForRole('ADMIN').map((item) => item.label)).toContain(
      'Audit-log'
    )
  })

  it('markeert subroutes actief behalve voor Start', () => {
    expect(isActive('/account/wachtwoord', '/account')).toBe(true)
    expect(isActive('/clienten/123', '/clienten')).toBe(true)
    expect(isActive('/clienten', '/')).toBe(false)
  })
})
