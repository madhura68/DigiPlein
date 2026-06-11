import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import {
  buildVolunteerWhere,
  formatVoorkeursdagen,
  ndaOntbreekt,
} from '@/app/vrijwilligers/query'
import { AvgNotice } from '@/components/avg-notice'
import { AVG_NOTE_INSTRUCTION } from '@/lib/avg'

describe('vrijwilligers query-helpers', () => {
  it('standaardfilter toont alleen actieve vrijwilligers', () => {
    expect(buildVolunteerWhere({})).toEqual({ isActive: true })
  })

  it('q → case-insensitive contains; filter=all → geen isActive-filter', () => {
    expect(buildVolunteerWhere({ q: 'jo', filter: 'all' })).toEqual({
      name: { contains: 'jo', mode: 'insensitive' },
    })
  })

  it('formatVoorkeursdagen geeft di/do/beide/—', () => {
    expect(formatVoorkeursdagen({ prefersTuesday: true, prefersThursday: true })).toBe('di + do')
    expect(formatVoorkeursdagen({ prefersTuesday: true, prefersThursday: false })).toBe('di')
    expect(formatVoorkeursdagen({ prefersTuesday: false, prefersThursday: true })).toBe('do')
    expect(formatVoorkeursdagen({ prefersTuesday: false, prefersThursday: false })).toBe('—')
  })

  it('ndaOntbreekt: true bij ontbrekende datum', () => {
    expect(ndaOntbreekt({ ndaSignedAt: null })).toBe(true)
    expect(ndaOntbreekt({ ndaSignedAt: new Date('2026-06-11') })).toBe(false)
  })
})

describe('AvgNotice', () => {
  it('toont de vaste notitie-instructie', () => {
    render(<AvgNotice />)
    expect(screen.getByText(AVG_NOTE_INSTRUCTION)).toBeInTheDocument()
  })
})
