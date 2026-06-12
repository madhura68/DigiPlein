'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { requireStaff } from '@/lib/auth'
import { prisma } from '@/lib/db'

export type VrijwilligerActionState = {
  error?: string
  status?: number
  ok?: boolean
}

const volunteerSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    prefersTuesday: z.boolean(),
    prefersThursday: z.boolean(),
    frequencyNote: z.string().optional(),
    ndaSignedAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ongeldige datum')
      .optional(),
    notes: z.string().optional(),
  })
  .strict()

// Lokale helper (geen export — dit is een 'use server'-bestand).
function parseVolunteerForm(formData: FormData) {
  const str = (key: string) => {
    const value = formData.get(key)
    return typeof value === 'string' && value.length > 0 ? value : undefined
  }
  return {
    name: str('name'),
    email: str('email'),
    phone: str('phone'),
    prefersTuesday: formData.get('prefersTuesday') === 'on',
    prefersThursday: formData.get('prefersThursday') === 'on',
    frequencyNote: str('frequencyNote'),
    ndaSignedAt: str('ndaSignedAt'),
    notes: str('notes'),
  }
}

type VolunteerInput = z.infer<typeof volunteerSchema>

function toData(input: VolunteerInput) {
  return {
    name: input.name,
    email: input.email ?? null,
    phone: input.phone ?? null,
    prefersTuesday: input.prefersTuesday,
    prefersThursday: input.prefersThursday,
    frequencyNote: input.frequencyNote ?? null,
    ndaSignedAt: input.ndaSignedAt ? new Date(input.ndaSignedAt) : null,
    notes: input.notes ?? null,
  }
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'P2002'
  )
}

export async function createVolunteer(
  _prev: VrijwilligerActionState,
  formData: FormData
): Promise<VrijwilligerActionState> {
  await requireStaff()
  const parsed = volunteerSchema.safeParse(parseVolunteerForm(formData))
  if (!parsed.success) {
    return { error: 'Controleer de naam (verplicht) en de ingevulde velden.', status: 422 }
  }
  try {
    await prisma.volunteer.create({ data: toData(parsed.data) })
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: 'Er bestaat al een vrijwilliger met dit e-mailadres.', status: 422 }
    }
    throw error
  }
  revalidatePath('/vrijwilligers')
  return { ok: true }
}

const updateSchema = volunteerSchema.extend({ id: z.string().min(1) })

export async function updateVolunteer(
  _prev: VrijwilligerActionState,
  formData: FormData
): Promise<VrijwilligerActionState> {
  await requireStaff()
  const parsed = updateSchema.safeParse({
    id: formData.get('id'),
    ...parseVolunteerForm(formData),
  })
  if (!parsed.success) {
    return { error: 'Controleer de naam (verplicht) en de ingevulde velden.', status: 422 }
  }
  const { id, ...rest } = parsed.data
  try {
    await prisma.volunteer.update({ where: { id }, data: toData(rest) })
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: 'Er bestaat al een vrijwilliger met dit e-mailadres.', status: 422 }
    }
    throw error
  }
  revalidatePath('/vrijwilligers')
  revalidatePath(`/vrijwilligers/${id}`)
  return { ok: true }
}

export async function deactivateVolunteer(
  _prev: VrijwilligerActionState,
  formData: FormData
): Promise<VrijwilligerActionState> {
  await requireStaff()
  const id = formData.get('id')
  if (typeof id !== 'string' || !id) return { error: 'Ongeldig verzoek.', status: 422 }
  await prisma.volunteer.update({ where: { id }, data: { isActive: false } })
  revalidatePath('/vrijwilligers')
  revalidatePath(`/vrijwilligers/${id}`)
  return { ok: true }
}

export async function deleteVolunteer(
  _prev: VrijwilligerActionState,
  formData: FormData
): Promise<VrijwilligerActionState> {
  await requireStaff()
  const id = formData.get('id')
  if (typeof id !== 'string' || !id) return { error: 'Ongeldig verzoek.', status: 422 }

  // Delete-guard: alleen verwijderen zonder gekoppelde rooster-/historiedata.
  const [rosterCount, absenceCount] = await Promise.all([
    prisma.rosterEntry.count({ where: { volunteerId: id } }),
    prisma.absence.count({ where: { volunteerId: id } }),
  ])
  if (rosterCount + absenceCount > 0) {
    return {
      error:
        'Deze vrijwilliger heeft rooster- of afwezigheidsdata; deactiveer in plaats van verwijderen.',
      status: 422,
    }
  }

  await prisma.volunteer.delete({ where: { id } })
  revalidatePath('/vrijwilligers')
  redirect('/vrijwilligers')
}
