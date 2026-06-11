import Link from 'next/link'

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

import { createCourse } from './actions'
import { CursusForm } from './cursus-form'
import { formatLesdagen, formatMaxSessions } from './query'

export default async function CursusaanbodPage() {
  const session = await requireStaff()
  const isAdmin = session.role === 'ADMIN'
  const courses = await prisma.course.findMany({
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
  })

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl">Cursusaanbod</h1>
        <p className="text-muted-foreground">
          {isAdmin
            ? 'Beheer de lesvormen. Sessiemaximum en duur zijn instellingen, geen code.'
            : 'Het beschikbare cursusaanbod. Alleen een beheerder kan dit wijzigen.'}
        </p>
      </header>

      {isAdmin ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl">Nieuwe cursus</h2>
          <CursusForm action={createCourse} submitLabel="Toevoegen" />
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-xl">Overzicht</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Naam</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Max. sessies</TableHead>
              <TableHead>Duur</TableHead>
              <TableHead>Lesdagen</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow
                key={course.id}
                className={course.isActive ? undefined : 'opacity-60'}
              >
                <TableCell className="font-medium">
                  {isAdmin ? (
                    <Link
                      href={`/cursusaanbod/${course.id}`}
                      className="underline underline-offset-2 hover:text-primary-text"
                    >
                      {course.name}
                    </Link>
                  ) : (
                    course.name
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{course.code}</TableCell>
                <TableCell>{formatMaxSessions(course.maxSessions)}</TableCell>
                <TableCell>{course.sessionMinutes} min</TableCell>
                <TableCell>{formatLesdagen(course)}</TableCell>
                <TableCell>{course.isActive ? 'Actief' : 'Inactief'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {courses.length === 0 ? (
          <p className="text-muted-foreground">Nog geen cursussen.</p>
        ) : null}
      </section>
    </main>
  )
}
