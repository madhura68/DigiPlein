import Link from 'next/link'

import { AdminList } from '@/components/admin-list'
import { PageHeader } from '@/components/page-header'
import { buttonVariants } from '@/components/ui/button'
import { StatusChip } from '@/components/ui/status-chip'
import { TableCell, TableRow } from '@/components/ui/table'
import { requireStaff } from '@/lib/auth'
import { prisma } from '@/lib/db'

import { formatLesdagen, formatMaxSessions } from './query'

export default async function CursusaanbodPage() {
  const session = await requireStaff()
  const isAdmin = session.role === 'ADMIN'
  const courses = await prisma.course.findMany({
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
  })

  const headers = isAdmin
    ? ['Cursus', 'Sessies', 'Lesdagen', 'Status', 'Actie']
    : ['Cursus', 'Sessies', 'Lesdagen', 'Status']

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
      <PageHeader
        title="Cursusaanbod"
        description={
          isAdmin
            ? 'Beheer de lesvormen. Sessiemaximum en duur zijn instellingen, geen code.'
            : 'Het beschikbare cursusaanbod. Alleen een beheerder kan dit wijzigen.'
        }
        action={
          isAdmin ? (
            <Link href="/cursusaanbod/nieuw" className={buttonVariants()}>
              Nieuwe cursus
            </Link>
          ) : undefined
        }
      />

      {courses.length > 0 ? (
        <AdminList headers={headers}>
          {courses.map((course) => (
            <TableRow
              key={course.id}
              className={course.isActive ? undefined : 'opacity-60'}
            >
              <TableCell>
                {isAdmin ? (
                  <Link
                    href={`/cursusaanbod/${course.id}`}
                    className="font-bold text-primary-text underline-offset-2 hover:underline"
                  >
                    {course.name}
                  </Link>
                ) : (
                  <span className="font-bold">{course.name}</span>
                )}
                <p className="text-xs text-muted-foreground">{course.code}</p>
              </TableCell>
              <TableCell>
                {formatMaxSessions(course.maxSessions)} · {course.sessionMinutes} min
              </TableCell>
              <TableCell>{formatLesdagen(course)}</TableCell>
              <TableCell>
                <StatusChip
                  label={course.isActive ? 'Actief' : 'Inactief'}
                  tone={course.isActive ? 'active' : 'neutral'}
                />
              </TableCell>
              {isAdmin ? (
                <TableCell className="text-right">
                  <Link
                    href={`/cursusaanbod/${course.id}`}
                    className="text-sm font-bold text-primary-text hover:underline"
                  >
                    Bewerken
                  </Link>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </AdminList>
      ) : (
        <p className="text-muted-foreground">Nog geen cursussen.</p>
      )}
    </main>
  )
}
