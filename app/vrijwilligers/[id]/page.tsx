import Link from 'next/link'
import { notFound } from 'next/navigation'

import { requireStaff } from '@/lib/auth'
import { prisma } from '@/lib/db'

import { updateVolunteer } from '../actions'
import { VrijwilligerForm } from '../vrijwilliger-form'
import { VrijwilligerGevarenzone } from '../vrijwilliger-gevarenzone'

export default async function VrijwilligerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireStaff()
  const { id } = await params
  const volunteer = await prisma.volunteer.findUnique({ where: { id } })
  if (!volunteer) notFound()

  return (
    <main id="main-content" className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-1">
        <Link
          href="/vrijwilligers"
          className="text-sm underline underline-offset-2 hover:text-primary-text"
        >
          ← Terug naar overzicht
        </Link>
        <h1 className="text-3xl">{volunteer.name}</h1>
      </div>

      <VrijwilligerForm
        action={updateVolunteer}
        submitLabel="Opslaan"
        initial={{
          id: volunteer.id,
          name: volunteer.name,
          email: volunteer.email,
          phone: volunteer.phone,
          prefersTuesday: volunteer.prefersTuesday,
          prefersThursday: volunteer.prefersThursday,
          frequencyNote: volunteer.frequencyNote,
          ndaSignedAt: volunteer.ndaSignedAt
            ? volunteer.ndaSignedAt.toISOString().slice(0, 10)
            : undefined,
          notes: volunteer.notes,
        }}
      />

      <VrijwilligerGevarenzone id={volunteer.id} isActive={volunteer.isActive} />
    </main>
  )
}
