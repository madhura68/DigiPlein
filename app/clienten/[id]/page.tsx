import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { buttonVariants } from '@/components/ui/button'
import { requireStaff } from '@/lib/auth'
import { prisma } from '@/lib/db'

import { updateClient } from '../actions'
import { ClientForm } from '../clienten-form'
import { clientFullName } from '../query'

function toDateInput(value: Date | null): string | undefined {
  return value ? value.toISOString().slice(0, 10) : undefined
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireStaff()
  const { id } = await params
  const client = await prisma.client.findUnique({ where: { id } })
  if (!client) notFound()

  return (
    <main id="main-content" className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-1">
        <Link
          href="/clienten"
          className="text-sm underline underline-offset-2 hover:text-primary-text"
        >
          ← Terug naar overzicht
        </Link>
        <h1 className="text-3xl">{clientFullName(client)}</h1>
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

      <section className="flex flex-col gap-4 border-t border-outline-variant pt-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl">AVG-rechten</h2>
          <p className="text-sm text-muted-foreground">
            Inzage- en wisverzoeken zijn één klik.
          </p>
        </div>
        <div>
          <Link
            href={`/clienten/${client.id}/export`}
            className={buttonVariants({ variant: 'secondary' })}
          >
            Exporteer gegevens
          </Link>
        </div>
        {session.role === 'ADMIN' ? (
          <ConfirmDeleteDialog id={client.id} fullName={clientFullName(client)} />
        ) : null}
      </section>
    </main>
  )
}
