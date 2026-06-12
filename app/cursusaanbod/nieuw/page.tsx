import Link from 'next/link'

import { PageHeader } from '@/components/page-header'
import { requireAdmin } from '@/lib/auth'

import { createCourse } from '../actions'
import { CursusForm } from '../cursus-form'

export default async function NieuweCursusPage() {
  await requireAdmin()

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-2">
        <Link
          href="/cursusaanbod"
          className="text-sm underline underline-offset-2 hover:text-primary-text"
        >
          ← Terug naar overzicht
        </Link>
        <PageHeader
          title="Nieuwe cursus"
          description="Sessiemaximum en duur zijn instellingen, geen code."
        />
      </div>
      <CursusForm action={createCourse} submitLabel="Toevoegen" />
    </main>
  )
}
