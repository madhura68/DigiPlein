import Link from 'next/link'
import { notFound } from 'next/navigation'

import { requireStaff } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  CLIENT_STATUS_LABELS,
  COURSE_ASSESSMENT_LABELS,
  TRACK_STATUS_LABELS,
} from '@/lib/enums'

import { clientFullName } from '../../query'
import { PrintButton } from './print-button'

function formatDate(value: Date | null): string {
  return value ? value.toISOString().slice(0, 10) : '—'
}

function orDash(value: string | null): string {
  return value && value.length > 0 ? value : '—'
}

export default async function ClientExportPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireStaff()
  const { id } = await params
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      learningTracks: { include: { course: true }, orderBy: { startedOn: 'desc' } },
    },
  })
  if (!client) notFound()

  const rows: Array<[string, string]> = [
    ['Voornaam', client.firstName],
    ['Achternaam', orDash(client.lastName)],
    ['Telefoon', orDash(client.phone)],
    ['E-mailadres', orDash(client.email)],
    ['Leerwens', orDash(client.learningWish)],
    ['Lesvorm-inschatting', COURSE_ASSESSMENT_LABELS[client.assessment]],
    ['Status', CLIENT_STATUS_LABELS[client.status]],
    ['Oefenen.nl-gebruikersnaam', orDash(client.oefenenUsername)],
    ['Toestemming extra’s — datum', formatDate(client.consentExtrasAt)],
    ['Toestemming extra’s — wijze', orDash(client.consentExtrasNote)],
    ['Laatst aanwezig op', formatDate(client.lastAttendedOn)],
    ['Notities', orDash(client.notes)],
    ['Aangemaakt op', formatDate(client.createdAt)],
  ]

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <Link
          href={`/clienten/${client.id}`}
          className="text-sm underline underline-offset-2 hover:text-primary-text"
        >
          ← Terug naar cliënt
        </Link>
        <PrintButton />
      </div>

      <header className="flex flex-col gap-1">
        <h1 className="text-3xl">Gegevensexport</h1>
        <p className="text-muted-foreground">{clientFullName(client)}</p>
      </header>

      <dl className="flex flex-col divide-y divide-outline-variant">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 py-3 sm:grid-cols-[16rem_1fr]">
            <dt className="font-medium">{label}</dt>
            <dd className="whitespace-pre-wrap">{value}</dd>
          </div>
        ))}
      </dl>

      {client.learningTracks.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-xl">Leertrajecten</h2>
          <ul className="flex flex-col gap-2">
            {client.learningTracks.map((track) => (
              <li
                key={track.id}
                className="rounded-card border border-outline-variant p-4"
              >
                <p className="font-medium">{track.course.name}</p>
                <p className="text-sm text-muted-foreground">
                  {TRACK_STATUS_LABELS[track.status]} · gestart{' '}
                  {formatDate(track.startedOn)}
                  {track.endedOn ? ` · afgerond ${formatDate(track.endedOn)}` : ''}
                </p>
                {track.goal ? <p className="text-sm">Doel: {track.goal}</p> : null}
                {track.nextStep ? (
                  <p className="text-sm">Vervolgstap: {track.nextStep}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="text-sm text-muted-foreground print:hidden">
        Gebruik “Printen / opslaan als PDF” om dit overzicht aan de cliënt te
        verstrekken (inzageverzoek).
      </p>
    </main>
  )
}
