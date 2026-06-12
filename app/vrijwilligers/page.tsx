import Link from 'next/link'

import { AdminList } from '@/components/admin-list'
import { FilterPanel } from '@/components/filter-panel'
import { PageHeader } from '@/components/page-header'
import { Button, buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { StatusChip } from '@/components/ui/status-chip'
import { TableCell, TableRow } from '@/components/ui/table'
import { requireStaff } from '@/lib/auth'
import { prisma } from '@/lib/db'

import { buildVolunteerWhere, formatVoorkeursdagen, ndaOntbreekt } from './query'

export default async function VrijwilligersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>
}) {
  await requireStaff()
  const sp = await searchParams
  const volunteers = await prisma.volunteer.findMany({
    where: buildVolunteerWhere({ q: sp.q, filter: sp.filter }),
    orderBy: { name: 'asc' },
  })

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
      <PageHeader
        title="Vrijwilligers"
        description="Beheer wie er op dinsdag en donderdag helpt."
        action={
          <Link href="/vrijwilligers/nieuw" className={buttonVariants()}>
            Nieuwe vrijwilliger
          </Link>
        }
      />

      <FilterPanel>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="q" className="font-medium">
            Zoeken op naam
          </label>
          <Input id="q" name="q" defaultValue={sp.q ?? ''} className="max-w-xs" />
        </div>
        <label className="flex items-center gap-2 pb-2.5">
          <Checkbox name="filter" value="all" defaultChecked={sp.filter === 'all'} />
          Ook inactieve tonen
        </label>
        <Button type="submit" variant="secondary">
          Filter
        </Button>
      </FilterPanel>

      {volunteers.length > 0 ? (
        <AdminList
          headers={['Naam', 'Voorkeursdagen', 'Geheimhouding', 'Status', 'Actie']}
        >
          {volunteers.map((volunteer) => (
            <TableRow
              key={volunteer.id}
              className={volunteer.isActive ? undefined : 'opacity-60'}
            >
              <TableCell>
                <Link
                  href={`/vrijwilligers/${volunteer.id}`}
                  className="font-bold text-primary-text underline-offset-2 hover:underline"
                >
                  {volunteer.name}
                </Link>
                {volunteer.email || volunteer.phone ? (
                  <p className="text-xs text-muted-foreground">
                    {volunteer.email ?? volunteer.phone}
                  </p>
                ) : null}
              </TableCell>
              <TableCell>{formatVoorkeursdagen(volunteer)}</TableCell>
              <TableCell>
                {ndaOntbreekt(volunteer) ? (
                  <StatusChip label="Ontbreekt" tone="neutral" />
                ) : (
                  <span className="text-muted-foreground">Getekend</span>
                )}
              </TableCell>
              <TableCell>
                <StatusChip
                  label={volunteer.isActive ? 'Actief' : 'Inactief'}
                  tone={volunteer.isActive ? 'active' : 'neutral'}
                />
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/vrijwilligers/${volunteer.id}`}
                  className="text-sm font-bold text-primary-text hover:underline"
                >
                  Openen
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </AdminList>
      ) : (
        <p className="text-muted-foreground">Geen vrijwilligers gevonden.</p>
      )}
    </main>
  )
}
