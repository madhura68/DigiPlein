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
import { CLIENT_STATUS_LABELS, COURSE_ASSESSMENT_LABELS } from '@/lib/enums'

import { buildClientWhere, clientStatusTone, formatClientName } from './query'

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
    <main id="main-content" className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
      <PageHeader
        title="Cliënten"
        description="Registreer alleen wat nodig is voor de begeleiding. Het overzicht toont de voornaam en de eerste letter van de achternaam."
        action={
          <Link href="/clienten/nieuw" className={buttonVariants()}>
            Nieuwe cliënt
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
          Ook afgeronde en gestopte tonen
        </label>
        <Button type="submit" variant="secondary">
          Filter
        </Button>
      </FilterPanel>

      {clients.length > 0 ? (
        <AdminList headers={['Naam', 'Lesvorm', 'Status', 'Actie']}>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>
                <Link
                  href={`/clienten/${client.id}`}
                  className="font-bold text-primary-text underline-offset-2 hover:underline"
                >
                  {formatClientName(client)}
                </Link>
                {client.learningWish ? (
                  <p className="text-xs text-muted-foreground">
                    {client.learningWish}
                  </p>
                ) : null}
              </TableCell>
              <TableCell>{COURSE_ASSESSMENT_LABELS[client.assessment]}</TableCell>
              <TableCell>
                <StatusChip
                  label={CLIENT_STATUS_LABELS[client.status]}
                  tone={clientStatusTone(client.status)}
                />
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/clienten/${client.id}`}
                  className="text-sm font-bold text-primary-text hover:underline"
                >
                  Openen
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </AdminList>
      ) : (
        <p className="text-muted-foreground">Geen cliënten gevonden.</p>
      )}
    </main>
  )
}
