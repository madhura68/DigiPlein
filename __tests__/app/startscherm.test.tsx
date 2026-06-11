import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { StartTiles } from '@/app/start-tiles'

describe('StartTiles (F-08 startscherm)', () => {
  it('ADMIN ziet de vier tegels (incl. medewerkers) + audit-link', () => {
    render(<StartTiles role="ADMIN" />)
    expect(screen.getByRole('heading', { name: 'Vrijwilligers' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Cliënten' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Cursusaanbod' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Medewerkers' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /audit-log/i })).toHaveAttribute(
      'href',
      '/audit'
    )
  })

  it('STAFF ziet drie tegels, geen medewerkers en geen audit-link', () => {
    render(<StartTiles role="STAFF" />)
    expect(screen.getByRole('heading', { name: 'Vrijwilligers' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Cliënten' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Cursusaanbod' })).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Medewerkers' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /audit-log/i })
    ).not.toBeInTheDocument()
  })

  it('toont B1-lege-staat-teksten per tegel, incl. de "binnenkort"-chat', () => {
    render(<StartTiles role="STAFF" />)
    expect(
      screen.getByText('Hier zet je wie er op dinsdag en donderdag helpt.')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Houd bij wie er leert en wat hun leerwens is.')
    ).toBeInTheDocument()
    expect(screen.getByText('Binnenkort')).toBeInTheDocument()
    expect(screen.getByText(/Straks stel je hier/)).toBeInTheDocument()
  })
})
