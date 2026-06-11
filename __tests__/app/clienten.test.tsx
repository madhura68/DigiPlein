import { describe, it, expect } from 'vitest'

import { buildClientWhere, formatClientName } from '@/app/clienten/query'

describe('clienten query — buildClientWhere', () => {
  it('standaard verbergt afgeronde/gestopte cliënten', () => {
    expect(buildClientWhere({})).toEqual({
      status: { notIn: ['AFGEROND', 'GESTOPT'] },
    })
  })

  it('filter=all toont iedereen (geen statusfilter)', () => {
    expect(buildClientWhere({ filter: 'all' })).toEqual({})
  })

  it('zoekterm → case-insensitive op voor- én achternaam', () => {
    expect(buildClientWhere({ q: 'san', filter: 'all' })).toEqual({
      OR: [
        { firstName: { contains: 'san', mode: 'insensitive' } },
        { lastName: { contains: 'san', mode: 'insensitive' } },
      ],
    })
  })
})

describe('clienten query — formatClientName (AVG: alleen initiaal achternaam)', () => {
  it('voornaam + initiaal achternaam met punt', () => {
    expect(formatClientName({ firstName: 'Sandra', lastName: 'de Vries' })).toBe(
      'Sandra D.'
    )
  })

  it('zonder achternaam → alleen voornaam', () => {
    expect(formatClientName({ firstName: 'Sandra', lastName: null })).toBe('Sandra')
  })
})
