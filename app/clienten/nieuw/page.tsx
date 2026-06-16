import Link from 'next/link'

import { PageHeader } from '@/components/page-header'
import { requireStaff } from '@/lib/auth'

import { createClient } from '../actions'
import { ClientForm } from '../clienten-form'

export default async function NieuweClientPage() {
  await requireStaff()

  return (
    <main id="main-content" className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-2">
        <Link
          href="/clienten"
          className="text-sm underline underline-offset-2 hover:text-primary-text"
        >
          ← Terug naar overzicht
        </Link>
        <PageHeader
          title="Nieuwe cliënt"
          description="Registreer alleen wat nodig is voor de begeleiding."
        />
      </div>
      <ClientForm action={createClient} submitLabel="Toevoegen" />
    </main>
  )
}
