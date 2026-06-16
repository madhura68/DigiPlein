import Link from 'next/link'

import { PageHeader } from '@/components/page-header'
import { requireStaff } from '@/lib/auth'

import { createVolunteer } from '../actions'
import { VrijwilligerForm } from '../vrijwilliger-form'

export default async function NieuweVrijwilligerPage() {
  await requireStaff()

  return (
    <main id="main-content" className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-2">
        <Link
          href="/vrijwilligers"
          className="text-sm underline underline-offset-2 hover:text-primary-text"
        >
          ← Terug naar overzicht
        </Link>
        <PageHeader
          title="Nieuwe vrijwilliger"
          description="Beheer wie er op dinsdag en donderdag helpt."
        />
      </div>
      <VrijwilligerForm action={createVolunteer} submitLabel="Toevoegen" />
    </main>
  )
}
