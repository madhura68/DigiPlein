import Link from 'next/link'
import { notFound } from 'next/navigation'

import { requireStaff } from '@/lib/auth'
import { prisma } from '@/lib/db'

import { updateClient } from '../actions'
import { ClientForm } from '../clienten-form'

function toDateInput(value: Date | null): string | undefined {
  return value ? value.toISOString().slice(0, 10) : undefined
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireStaff()
  const { id } = await params
  const client = await prisma.client.findUnique({ where: { id } })
  if (!client) notFound()

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-1">
        <Link
          href="/clienten"
          className="text-sm underline underline-offset-2 hover:text-primary-text"
        >
          ← Terug naar overzicht
        </Link>
        <h1 className="text-3xl">
          {client.firstName}
          {client.lastName ? ` ${client.lastName}` : ''}
        </h1>
      </div>

      <ClientForm
        action={updateClient}
        submitLabel="Opslaan"
        initial={{
          id: client.id,
          firstName: client.firstName,
          lastName: client.lastName,
          phone: client.phone,
          email: client.email,
          learningWish: client.learningWish,
          assessment: client.assessment,
          status: client.status,
          oefenenUsername: client.oefenenUsername,
          consentExtrasAt: toDateInput(client.consentExtrasAt),
          consentExtrasNote: client.consentExtrasNote,
          lastAttendedOn: toDateInput(client.lastAttendedOn),
          notes: client.notes,
        }}
      />
    </main>
  )
}
