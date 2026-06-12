import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { AdminList } from '@/components/admin-list'
import { FilterPanel } from '@/components/filter-panel'
import { PageHeader } from '@/components/page-header'
import { Checkbox } from '@/components/ui/checkbox'
import { StatusChip } from '@/components/ui/status-chip'
import { TableCell, TableRow } from '@/components/ui/table'

describe('PageHeader', () => {
  it('toont titel (h1), beschrijving en actie', () => {
    render(
      <PageHeader
        title="Cliënten"
        description="Beheer de cliënten."
        action={<button type="button">Nieuwe cliënt</button>}
      />
    )
    expect(
      screen.getByRole('heading', { level: 1, name: 'Cliënten' })
    ).toBeInTheDocument()
    expect(screen.getByText('Beheer de cliënten.')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Nieuwe cliënt' })
    ).toBeInTheDocument()
  })
})

describe('FilterPanel', () => {
  it('rendert een formulier met de filtervelden', () => {
    render(
      <FilterPanel>
        <label>
          Zoeken
          <input name="q" />
        </label>
      </FilterPanel>
    )
    expect(screen.getByLabelText('Zoeken')).toBeInTheDocument()
  })
})

describe('AdminList', () => {
  it('rendert kolomkoppen en rijen', () => {
    render(
      <AdminList headers={['Naam', 'Status']}>
        <TableRow>
          <TableCell>Sandra</TableCell>
          <TableCell>Actief</TableCell>
        </TableRow>
      </AdminList>
    )
    expect(
      screen.getByRole('columnheader', { name: 'Naam' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Status' })
    ).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Sandra' })).toBeInTheDocument()
  })
})

describe('StatusChip', () => {
  it('toont het label', () => {
    render(<StatusChip label="Actief" tone="active" />)
    expect(screen.getByText('Actief')).toBeInTheDocument()
  })
})

describe('Checkbox', () => {
  it('rendert een toegankelijke checkbox', () => {
    render(<Checkbox aria-label="Selecteer rij" />)
    expect(
      screen.getByRole('checkbox', { name: 'Selecteer rij' })
    ).toBeInTheDocument()
  })
})
