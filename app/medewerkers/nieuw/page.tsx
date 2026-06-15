import Link from 'next/link'

import { PageHeader } from '@/components/page-header'
import { requireAdmin } from '@/lib/auth'

import { NieuweMedewerkerForm } from '../nieuwe-medewerker-form'

export default async function NieuweMedewerkerPage() {
  await requireAdmin()

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-2">
        <Link
          href="/medewerkers"
          className="text-sm underline underline-offset-2 hover:text-primary-text"
        >
          ← Terug naar overzicht
        </Link>
        <PageHeader
          title="Nieuwe medewerker"
          description="Registreer de medewerker en verstuur een uitnodiging om in te loggen."
        />
      </div>
      <NieuweMedewerkerForm />
    </main>
  )
}
