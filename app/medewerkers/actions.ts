'use server'

import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

export type MedewerkerActionState = {
  error?: string
  status?: number
  ok?: boolean
}

const roleSchema = z.enum(['ADMIN', 'STAFF'])

const createSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    role: roleSchema,
    password: z.string().min(8),
  })
  .strict()

const updateSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    email: z.string().email(),
    role: roleSchema,
  })
  .strict()

const idSchema = z.object({ id: z.string().min(1) }).strict()
const resetSchema = z
  .object({ id: z.string().min(1), password: z.string().min(8) })
  .strict()

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'P2002'
  )
}

export async function createStaff(
  _prev: MedewerkerActionState,
  formData: FormData
): Promise<MedewerkerActionState> {
  await requireAdmin()
  const parsed = createSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    role: formData.get('role'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return {
      error: 'Controleer naam, e-mailadres, rol en wachtwoord (minimaal 8 tekens).',
      status: 422,
    }
  }
  const passwordHash = await bcrypt.hash(parsed.data.password, 10)
  try {
    await prisma.staffMember.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        role: parsed.data.role,
        passwordHash,
      },
    })
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: 'Er bestaat al een medewerker met dit e-mailadres.', status: 422 }
    }
    throw error
  }
  revalidatePath('/medewerkers')
  return { ok: true }
}

export async function updateStaff(
  _prev: MedewerkerActionState,
  formData: FormData
): Promise<MedewerkerActionState> {
  await requireAdmin()
  const parsed = updateSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    email: formData.get('email'),
    role: formData.get('role'),
  })
  if (!parsed.success) {
    return { error: 'Controleer naam, e-mailadres en rol.', status: 422 }
  }

  const result = await prisma.$transaction(
    async (tx): Promise<MedewerkerActionState> => {
      const target = await tx.staffMember.findUnique({
        where: { id: parsed.data.id },
      })
      if (!target) return { error: 'Medewerker niet gevonden.', status: 404 }

      // Laatste-admin-bescherming bij degraderen.
      if (
        target.role === 'ADMIN' &&
        target.isActive &&
        parsed.data.role !== 'ADMIN'
      ) {
        const activeAdmins = await tx.staffMember.count({
          where: { role: 'ADMIN', isActive: true },
        })
        if (activeAdmins <= 1) {
          return {
            error:
              'Dit is de laatste actieve beheerder; je kunt deze niet degraderen.',
            status: 422,
          }
        }
      }

      try {
        await tx.staffMember.update({
          where: { id: parsed.data.id },
          data: {
            name: parsed.data.name,
            email: parsed.data.email,
            role: parsed.data.role,
          },
        })
      } catch (error) {
        if (isUniqueViolation(error)) {
          return { error: 'Dit e-mailadres is al in gebruik.', status: 422 }
        }
        throw error
      }
      return { ok: true }
    }
  )

  if (result.ok) revalidatePath('/medewerkers')
  return result
}

export async function deactivateStaff(
  _prev: MedewerkerActionState,
  formData: FormData
): Promise<MedewerkerActionState> {
  await requireAdmin()
  const parsed = idSchema.safeParse({ id: formData.get('id') })
  if (!parsed.success) return { error: 'Ongeldig verzoek.', status: 422 }

  const result = await prisma.$transaction(
    async (tx): Promise<MedewerkerActionState> => {
      const target = await tx.staffMember.findUnique({
        where: { id: parsed.data.id },
      })
      if (!target) return { error: 'Medewerker niet gevonden.', status: 404 }

      // Laatste-admin-bescherming bij deactiveren.
      if (target.role === 'ADMIN' && target.isActive) {
        const activeAdmins = await tx.staffMember.count({
          where: { role: 'ADMIN', isActive: true },
        })
        if (activeAdmins <= 1) {
          return {
            error:
              'Dit is de laatste actieve beheerder; je kunt deze niet deactiveren.',
            status: 422,
          }
        }
      }

      await tx.staffMember.update({
        where: { id: parsed.data.id },
        data: { isActive: false },
      })
      return { ok: true }
    }
  )

  if (result.ok) revalidatePath('/medewerkers')
  return result
}

export async function resetStaffPassword(
  _prev: MedewerkerActionState,
  formData: FormData
): Promise<MedewerkerActionState> {
  await requireAdmin()
  const parsed = resetSchema.safeParse({
    id: formData.get('id'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return { error: 'Het nieuwe wachtwoord moet minimaal 8 tekens zijn.', status: 422 }
  }
  const passwordHash = await bcrypt.hash(parsed.data.password, 10)
  await prisma.staffMember.update({
    where: { id: parsed.data.id },
    data: { passwordHash },
  })
  revalidatePath('/medewerkers')
  return { ok: true }
}
