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
import { CLIENT_STATUS_LABELS, COURSE_ASSESSMENT_LABELS } from '@/lib/enums'

import { createClient } from './actions'
import { ClientForm } from './clienten-form'
import { buildClientWhere, formatClientName } from './query'

export default async function ClientenPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>
}) {
  await requireStaff()
  const sp = await searchParams
  const clients = await prisma.client.findMany({
    where: buildClientWhere({ q: sp.q, filter: sp.filter }),
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
  })

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl">Cliënten</h1>
        <p className="text-muted-foreground">
          Registreer alleen wat nodig is voor de begeleiding. Het overzicht toont
          de voornaam en de eerste letter van de achternaam.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl">Nieuwe cliënt</h2>
        <ClientForm action={createClient} submitLabel="Toevoegen" />
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
            Ook afgeronde en gestopte tonen
          </label>
          <Button type="submit" variant="secondary">
            Filter
          </Button>
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Naam</TableHead>
              <TableHead>Lesvorm</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/clienten/${client.id}`}
                    className="underline underline-offset-2 hover:text-primary-text"
                  >
                    {formatClientName(client)}
                  </Link>
                </TableCell>
                <TableCell>{COURSE_ASSESSMENT_LABELS[client.assessment]}</TableCell>
                <TableCell>{CLIENT_STATUS_LABELS[client.status]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {clients.length === 0 ? (
          <p className="text-muted-foreground">Geen cliënten gevonden.</p>
        ) : null}
      </section>
    </main>
  )
}
