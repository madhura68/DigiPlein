import Link from 'next/link'

import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ACTOR_TYPE_LABELS } from '@/lib/enums'

import { buildAuditWhere } from './query'

const PAGE_SIZE = 50

const selectClass =
  'h-11 rounded-field border border-input bg-background px-4 text-base outline-none focus-visible:border-brand'

function formatDateTime(value: Date): string {
  // Audit: ondubbelzinnige UTC-tijdstempel (geen lokale-tijd-verrassingen).
  return `${value.toISOString().slice(0, 16).replace('T', ' ')} UTC`
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ actorType?: string; entity?: string; page?: string }>
}) {
  await requireAdmin()
  const sp = await searchParams
  const page = Math.max(0, Number.parseInt(sp.page ?? '0', 10) || 0)
  const where = buildAuditWhere({ actorType: sp.actorType, entity: sp.entity })
  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: page * PAGE_SIZE,
    take: PAGE_SIZE,
  })

  function pageHref(target: number): string {
    const params = new URLSearchParams()
    if (sp.actorType) params.set('actorType', sp.actorType)
    if (sp.entity) params.set('entity', sp.entity)
    if (target > 0) params.set('page', String(target))
    const qs = params.toString()
    return qs ? `/audit?${qs}` : '/audit'
  }

  const hasPrev = page > 0
  const hasNext = logs.length === PAGE_SIZE

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl">Audit-log</h1>
        <p className="text-muted-foreground">
          Wijzigingsgeschiedenis voor verantwoording (AVG). Regels zijn niet
          bewerkbaar of verwijderbaar.
        </p>
      </header>

      <form className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="actorType" className="font-medium">
            Actor
          </label>
          <select
            id="actorType"
            name="actorType"
            defaultValue={sp.actorType ?? ''}
            className={selectClass}
          >
            <option value="">Alle</option>
            {Object.entries(ACTOR_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="entity" className="font-medium">
            Entiteit
          </label>
          <Input
            id="entity"
            name="entity"
            defaultValue={sp.entity ?? ''}
            placeholder="bv. client"
            className="max-w-xs"
          />
        </div>
        <Button type="submit" variant="secondary">
          Filter
        </Button>
      </form>

      <section className="flex flex-col gap-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tijdstip</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Actie</TableHead>
              <TableHead>Entiteit</TableHead>
              <TableHead>Samenvatting</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatDateTime(log.createdAt)}
                </TableCell>
                <TableCell>{ACTOR_TYPE_LABELS[log.actorType]}</TableCell>
                <TableCell className="font-medium">{log.action}</TableCell>
                <TableCell>{log.entity}</TableCell>
                <TableCell>{log.summary}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {logs.length === 0 ? (
          <p className="text-muted-foreground">Geen logregels gevonden.</p>
        ) : null}

        {hasPrev || hasNext ? (
          <div className="flex justify-between">
            {hasPrev ? (
              <Link
                href={pageHref(page - 1)}
                className={buttonVariants({ variant: 'secondary', size: 'sm' })}
              >
                ← Vorige
              </Link>
            ) : (
              <span />
            )}
            {hasNext ? (
              <Link
                href={pageHref(page + 1)}
                className={buttonVariants({ variant: 'secondary', size: 'sm' })}
              >
                Volgende →
              </Link>
            ) : (
              <span />
            )}
          </div>
        ) : null}
      </section>
    </main>
  )
}
