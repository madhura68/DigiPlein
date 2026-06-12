import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { ClientForm } from '@/app/clienten/clienten-form'
import {
  buildClientWhere,
  clientStatusTone,
  formatClientName,
} from '@/app/clienten/query'
import { AVG_NOTE_INSTRUCTION } from '@/lib/avg'

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

describe('clienten query — clientStatusTone', () => {
  it('mapt elke status naar een toegankelijke chip-tone', () => {
    expect(clientStatusTone('ACTIEF')).toBe('active')
    expect(clientStatusTone('AFGEROND')).toBe('done')
    expect(clientStatusTone('GESTOPT')).toBe('stopped')
    expect(clientStatusTone('INTAKE')).toBe('info')
    expect(clientStatusTone('AANGEMELD')).toBe('neutral')
  })
})

describe('ClientForm — AVG-notitie-instructie', () => {
  it('toont de permanente notitie-instructie bij het notitieveld', () => {
    render(<ClientForm action={async () => ({})} submitLabel="Toevoegen" />)
    expect(screen.getByText(AVG_NOTE_INSTRUCTION)).toBeInTheDocument()
  })
})
