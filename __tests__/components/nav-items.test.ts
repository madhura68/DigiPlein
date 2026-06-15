import { describe, expect, it } from 'vitest'

import { isActive, navItemsForRole } from '@/components/nav-items'

describe('nav-items', () => {
  it('filtert admin-only items voor STAFF', () => {
    const items = navItemsForRole('STAFF')
    expect(items.map((item) => item.label)).toEqual([
      'Start',
      'Cliënten',
      'Vrijwilligers',
      'Cursusaanbod',
      'Account',
    ])
    expect(JSON.stringify(items)).not.toContain('Beheer')
    expect(JSON.stringify(items)).not.toContain('Audit-log')
  })

  it('houdt admin-only Beheer met kinderen zichtbaar voor ADMIN', () => {
    const beheer = navItemsForRole('ADMIN').find((item) => item.label === 'Beheer')
    expect(beheer?.href).toBe('/beheer')
    expect(beheer?.children?.map((item) => item.label)).toEqual([
      'Gebruikersbeheer',
      'Audit-log',
    ])
  })

  it('markeert subroutes actief behalve voor Start', () => {
    expect(isActive('/account/wachtwoord', '/account')).toBe(true)
    expect(isActive('/clienten/123', '/clienten')).toBe(true)
    expect(isActive('/clienten', '/')).toBe(false)
  })

  it('markeert Beheer actief voor gebruikersbeheer en audit-log', () => {
    const beheer = navItemsForRole('ADMIN').find((item) => item.label === 'Beheer')
    expect(beheer).toBeDefined()
    expect(isActive('/beheer', beheer!)).toBe(true)
    expect(isActive('/medewerkers', beheer!)).toBe(true)
    expect(isActive('/audit', beheer!)).toBe(true)
  })
})
