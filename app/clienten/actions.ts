'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import {
  clientCreatedSummary,
  clientUpdatedSummary,
  writeAuditLog,
} from '@/lib/audit'
import { requireAdmin, requireStaff } from '@/lib/auth'
import { prisma } from '@/lib/db'

import { clientFullName } from './query'

export type ClientActionState = {
  error?: string
  status?: number
  ok?: boolean
  warning?: string
}

const assessmentSchema = z.enum(['KLIK_EN_TIK', 'LES_OP_MAAT', 'NOG_BEPALEN'])
const statusSchema = z.enum([
  'AANGEMELD',
  'INTAKE',
  'ACTIEF',
  'AFGEROND',
  'GESTOPT',
])
const dateField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ongeldige datum')
  .optional()

// AVG-borging: .strict() weigert ELK onbekend veld. Het cliëntformulier kent
// uitsluitend de F-03-velden; de verboden velden uit lib/avg.ts (VERBODEN_VELDEN)
// kunnen hierdoor niet binnenkomen — expliciet getest in clienten-actions.test.ts.
const clientSchema = z
  .object({
    firstName: z.string().min(1),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    learningWish: z.string().optional(),
    assessment: assessmentSchema,
    status: statusSchema,
    oefenenUsername: z.string().optional(),
    consentExtrasAt: dateField,
    consentExtrasNote: z.string().optional(),
    lastAttendedOn: dateField,
    notes: z.string().optional(),
  })
  .strict()

const updateSchema = clientSchema.extend({ id: z.string().min(1) }).strict()

type ClientInput = z.infer<typeof clientSchema>

// Alle niet-lege string-velden uit het formulier — zodat .strict() de runtime-poort
// is: een verboden veld in de payload leidt tot 422 i.p.v. stil te worden genegeerd.
function rawClientForm(formData: FormData): Record<string, string> {
  const obj: Record<string, string> = {}
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string' && value.length > 0) obj[key] = value
  }
  return obj
}

function toData(input: ClientInput) {
  return {
    firstName: input.firstName,
    lastName: input.lastName ?? null,
    phone: input.phone ?? null,
    email: input.email ?? null,
    learningWish: input.learningWish ?? null,
    assessment: input.assessment,
    status: input.status,
    oefenenUsername: input.oefenenUsername ?? null,
    consentExtrasAt: input.consentExtrasAt ? new Date(input.consentExtrasAt) : null,
    consentExtrasNote: input.consentExtrasNote ?? null,
    lastAttendedOn: input.lastAttendedOn ? new Date(input.lastAttendedOn) : null,
    notes: input.notes ?? null,
  }
}

type ClientData = ReturnType<typeof toData>

const COMPARE_FIELDS = [
  'firstName',
  'lastName',
  'phone',
  'email',
  'learningWish',
  'assessment',
  'oefenenUsername',
  'consentExtrasNote',
  'notes',
] as const
const DATE_COMPARE_FIELDS = ['consentExtrasAt', 'lastAttendedOn'] as const

// Welke veldnamen wijzigden — alleen namen, voor een persoonsgegevens-arme summary.
function changedClientFields(before: ClientData, after: ClientData): string[] {
  const changed: string[] = []
  for (const field of COMPARE_FIELDS) {
    if ((before[field] ?? null) !== (after[field] ?? null)) changed.push(field)
  }
  for (const field of DATE_COMPARE_FIELDS) {
    const b = before[field] ? before[field]!.getTime() : null
    const a = after[field] ? after[field]!.getTime() : null
    if (b !== a) changed.push(field)
  }
  return changed
}

const VALIDATION_ERROR = 'Controleer de voornaam (verplicht) en de ingevulde velden.'

export async function createClient(
  _prev: ClientActionState,
  formData: FormData
): Promise<ClientActionState> {
  const session = await requireStaff()
  const parsed = clientSchema.safeParse(rawClientForm(formData))
  if (!parsed.success) return { error: VALIDATION_ERROR, status: 422 }

  const data = toData(parsed.data)
  // Dubbele naam → waarschuwing, géén blokkade (plan ST-103).
  const duplicates = await prisma.client.count({
    where: {
      firstName: { equals: data.firstName, mode: 'insensitive' },
      lastName: data.lastName,
    },
  })
  const created = await prisma.client.create({ data })
  await writeAuditLog({
    actorType: 'STAFF',
    actorId: session.staffId,
    action: 'CREATE',
    entity: 'client',
    entityId: created.id,
    summary: clientCreatedSummary(),
  })
  revalidatePath('/clienten')
  return duplicates > 0
    ? { ok: true, warning: 'Let op: er bestaat al een cliënt met deze naam.' }
    : { ok: true }
}

export async function updateClient(
  _prev: ClientActionState,
  formData: FormData
): Promise<ClientActionState> {
  const session = await requireStaff()
  const parsed = updateSchema.safeParse(rawClientForm(formData))
  if (!parsed.success) return { error: VALIDATION_ERROR, status: 422 }

  const { id, ...input } = parsed.data
  const existing = await prisma.client.findUnique({ where: { id } })
  if (!existing) return { error: 'Cliënt niet gevonden.', status: 404 }

  const data = toData(input)
  const changed = changedClientFields(existing, data)
  const statusChanged = existing.status !== data.status

  await prisma.client.update({ where: { id }, data })
  await writeAuditLog({
    actorType: 'STAFF',
    actorId: session.staffId,
    action: 'UPDATE',
    entity: 'client',
    entityId: id,
    summary: clientUpdatedSummary({
      changedFields: changed,
      newStatus: statusChanged ? data.status : undefined,
    }),
  })
  revalidatePath('/clienten')
  revalidatePath(`/clienten/${id}`)
  return { ok: true }
}

const deleteSchema = z
  .object({ id: z.string().min(1), confirmName: z.string().min(1) })
  .strict()

// F-05 definitieve verwijdering: ADMIN-only, naam-overtypen-bevestiging, DB-cascade
// (client → tracks → attendances, ST-003) en een persoonsgegevens-vríje auditregel
// (alleen intern id + tijdstip + uitvoerder; geen naam in de summary).
export async function deleteClient(
  _prev: ClientActionState,
  formData: FormData
): Promise<ClientActionState> {
  const session = await requireAdmin()
  const parsed = deleteSchema.safeParse({
    id: formData.get('id'),
    confirmName: formData.get('confirmName'),
  })
  if (!parsed.success) return { error: 'Ongeldig verzoek.', status: 422 }

  const existing = await prisma.client.findUnique({ where: { id: parsed.data.id } })
  if (!existing) return { error: 'Cliënt niet gevonden.', status: 404 }
  if (parsed.data.confirmName.trim() !== clientFullName(existing)) {
    return {
      error: 'De ingetypte naam komt niet overeen met de cliënt.',
      status: 422,
    }
  }

  await prisma.client.delete({ where: { id: parsed.data.id } })
  await writeAuditLog({
    actorType: 'STAFF',
    actorId: session.staffId,
    action: 'DELETE',
    entity: 'client',
    entityId: parsed.data.id,
    summary: 'Cliënt definitief verwijderd',
  })
  revalidatePath('/clienten')
  redirect('/clienten')
}
