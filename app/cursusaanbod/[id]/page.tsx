import Link from 'next/link'
import { notFound } from 'next/navigation'

import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

import { updateCourse } from '../actions'
import { CursusForm } from '../cursus-form'
import { CursusGevarenzone } from '../cursus-gevarenzone'

export default async function CursusDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const course = await prisma.course.findUnique({ where: { id } })
  if (!course) notFound()

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-1">
        <Link
          href="/cursusaanbod"
          className="text-sm underline underline-offset-2 hover:text-primary-text"
        >
          ← Terug naar overzicht
        </Link>
        <h1 className="text-3xl">{course.name}</h1>
      </div>

      <CursusForm
        action={updateCourse}
        submitLabel="Opslaan"
        initial={{
          id: course.id,
          code: course.code,
          name: course.name,
          description: course.description,
          maxSessions: course.maxSessions,
          sessionMinutes: course.sessionMinutes,
          onTuesday: course.onTuesday,
          onThursday: course.onThursday,
        }}
      />

      <CursusGevarenzone id={course.id} isActive={course.isActive} />
    </main>
  )
}
