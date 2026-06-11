'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

export type CourseActionState = {
  error?: string
  status?: number
  ok?: boolean
}

const baseCourseSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  // Leeg = onbeperkt (optional → null); ingevuld moet > 0 zijn — sluit aan op de
  // DB-CHECK courses_max_sessions_positive.
  maxSessions: z.coerce.number().int().positive().optional(),
  sessionMinutes: z.coerce.number().int().positive(),
  onTuesday: z.boolean(),
  onThursday: z.boolean(),
})

// `code` zit alleen in het create-schema: onveranderlijk na aanmaak. .strict()
// op het update-schema weigert een meegestuurde `code` met 422.
const createSchema = baseCourseSchema.extend({ code: z.string().min(1) }).strict()
const updateSchema = baseCourseSchema.extend({ id: z.string().min(1) }).strict()
const idSchema = z.object({ id: z.string().min(1) }).strict()

// Checkbox-booleans expliciet zetten (afwezig = false); overige niet-lege strings
// ongefilterd doorgeven zodat .strict() onbekende velden (zoals een poging om
// `code` te wijzigen) met 422 weigert i.p.v. stil te negeren.
function parseCourseForm(formData: FormData): Record<string, unknown> {
  const raw: Record<string, unknown> = {}
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string' && value.length > 0) raw[key] = value
  }
  raw.onTuesday = formData.get('onTuesday') === 'on'
  raw.onThursday = formData.get('onThursday') === 'on'
  return raw
}

function toCourseData(input: z.infer<typeof baseCourseSchema>) {
  return {
    name: input.name,
    description: input.description ?? null,
    maxSessions: input.maxSessions ?? null,
    sessionMinutes: input.sessionMinutes,
    onTuesday: input.onTuesday,
    onThursday: input.onThursday,
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

const VALIDATION_ERROR =
  'Controleer de naam, sessieduur en max. sessies (leeg = onbeperkt, anders groter dan 0).'

export async function createCourse(
  _prev: CourseActionState,
  formData: FormData
): Promise<CourseActionState> {
  await requireAdmin()
  const parsed = createSchema.safeParse(parseCourseForm(formData))
  if (!parsed.success) return { error: VALIDATION_ERROR, status: 422 }
  const { code, ...rest } = parsed.data
  try {
    await prisma.course.create({ data: { code, ...toCourseData(rest) } })
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: 'Er bestaat al een cursus met deze code.', status: 422 }
    }
    throw error
  }
  revalidatePath('/cursusaanbod')
  return { ok: true }
}

export async function updateCourse(
  _prev: CourseActionState,
  formData: FormData
): Promise<CourseActionState> {
  await requireAdmin()
  const parsed = updateSchema.safeParse(parseCourseForm(formData))
  if (!parsed.success) return { error: VALIDATION_ERROR, status: 422 }
  const { id, ...rest } = parsed.data
  await prisma.course.update({ where: { id }, data: toCourseData(rest) })
  revalidatePath('/cursusaanbod')
  revalidatePath(`/cursusaanbod/${id}`)
  return { ok: true }
}

export async function deactivateCourse(
  _prev: CourseActionState,
  formData: FormData
): Promise<CourseActionState> {
  await requireAdmin()
  const parsed = idSchema.safeParse({ id: formData.get('id') })
  if (!parsed.success) return { error: 'Ongeldig verzoek.', status: 422 }
  await prisma.course.update({
    where: { id: parsed.data.id },
    data: { isActive: false },
  })
  revalidatePath('/cursusaanbod')
  revalidatePath(`/cursusaanbod/${parsed.data.id}`)
  return { ok: true }
}

export async function deleteCourse(
  _prev: CourseActionState,
  formData: FormData
): Promise<CourseActionState> {
  await requireAdmin()
  const parsed = idSchema.safeParse({ id: formData.get('id') })
  if (!parsed.success) return { error: 'Ongeldig verzoek.', status: 422 }

  // Delete-guard: alleen verwijderen zonder gekoppelde trajecten.
  const trackCount = await prisma.learningTrack.count({
    where: { courseId: parsed.data.id },
  })
  if (trackCount > 0) {
    return {
      error:
        'Deze cursus heeft gekoppelde trajecten; deactiveer in plaats van verwijderen.',
      status: 422,
    }
  }

  await prisma.course.delete({ where: { id: parsed.data.id } })
  revalidatePath('/cursusaanbod')
  redirect('/cursusaanbod')
}
