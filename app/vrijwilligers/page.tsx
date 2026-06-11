import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { requireStaff } from '@/lib/auth'
import { prisma } from '@/lib/db'

import { createVolunteer } from './actions'
import {
  buildVolunteerWhere,
  formatVoorkeursdagen,
  ndaOntbreekt,
} from './query'
import { VrijwilligerForm } from './vrijwilliger-form'

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
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl">Vrijwilligers</h1>
        <p className="text-muted-foreground">
          Beheer wie er op dinsdag en donderdag helpt.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl">Nieuwe vrijwilliger</h2>
        <VrijwilligerForm action={createVolunteer} submitLabel="Toevoegen" />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl">Overzicht</h2>
        <form className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="q" className="font-medium">
              Zoeken op naam
            </label>
            <Input id="q" name="q" defaultValue={sp.q ?? ''} className="max-w-xs" />
          </div>
          <label className="flex items-center gap-2 pb-2.5">
            <input
              type="checkbox"
              name="filter"
              value="all"
              defaultChecked={sp.filter === 'all'}
            />
            Ook inactieve tonen
          </label>
          <Button type="submit" variant="secondary">
            Filter
          </Button>
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Naam</TableHead>
              <TableHead>Voorkeursdagen</TableHead>
              <TableHead>Geheimhouding</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {volunteers.map((v) => (
              <TableRow
                key={v.id}
                className={v.isActive ? undefined : 'opacity-60'}
              >
                <TableCell className="font-medium">
                  <Link
                    href={`/vrijwilligers/${v.id}`}
                    className="underline underline-offset-2 hover:text-primary-text"
                  >
                    {v.name}
                  </Link>
                </TableCell>
                <TableCell>{formatVoorkeursdagen(v)}</TableCell>
                <TableCell>
                  {ndaOntbreekt(v) ? (
                    <span className="inline-flex items-center rounded-pill bg-primary-container px-2.5 py-0.5 text-xs font-medium text-primary-container-foreground">
                      Ontbreekt
                    </span>
                  ) : (
                    'Getekend'
                  )}
                </TableCell>
                <TableCell>{v.isActive ? 'Actief' : 'Inactief'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {volunteers.length === 0 ? (
          <p className="text-muted-foreground">Geen vrijwilligers gevonden.</p>
        ) : null}
      </section>
    </main>
  )
}
