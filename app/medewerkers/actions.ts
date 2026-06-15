'use server'

import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requireAdmin } from '@/lib/auth'
import { normalizeStaffEmail } from '@/lib/auth/staff-email'
import {
  createStaffInviteToken,
  createUnusablePasswordPlaceholder,
  hashStaffInviteToken,
  staffInviteExpiresAt,
} from '@/lib/auth/staff-invites'
import {
  staffCopilotRegistrationAuditSummary,
  staffInviteAuditSummary,
  writeAuditLog,
} from '@/lib/audit'
import { preRegisterCopilotAppUser } from '@/lib/copilot-provision'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'
import { formatMailAddress, sendStaffInviteMail } from '@/lib/mail/staff-invite'

export type MedewerkerActionState = {
  error?: string
  status?: number
  ok?: boolean
}

const roleSchema = z.enum(['ADMIN', 'STAFF'])

const createSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().trim().email(),
    role: roleSchema,
  })
  .strict()

const updateSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    email: z.string().trim().email(),
    role: roleSchema,
  })
  .strict()

const idSchema = z.object({ id: z.string().min(1) }).strict()

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'P2002'
  )
}

function staffInviteMailFrom(): string | undefined {
  if (!env.MAIL_FROM) return undefined
  return formatMailAddress(env.MAIL_FROM_NAME, env.MAIL_FROM)
}

// Meld een medewerker als copilot-gebruiker aan bij de centrale service en leg lokaal
// vast dat de push is gelukt. Schrijft (timestamp + audit) alleen bij een geslaagde
// registratie. Retourneert of de registratie is doorgezet. De netwerk-call zelf gooit
// nooit (zie copilot-provision); een DB-fout op de update propageert wél naar de caller.
async function markCopilotRegistration(
  staffId: string,
  actorId: string
): Promise<boolean> {
  const { registered } = await preRegisterCopilotAppUser(staffId)
  if (!registered) return false
  await prisma.staffMember.update({
    where: { id: staffId },
    data: { copilotRegisteredAt: new Date() },
  })
  await writeAuditLog({
    actorType: 'STAFF',
    actorId,
    action: 'COPILOT_REGISTERED',
    entity: 'staff_member',
    entityId: staffId,
    summary: staffCopilotRegistrationAuditSummary(),
  })
  return registered
}

export async function createStaff(
  _prev: MedewerkerActionState,
  formData: FormData
): Promise<MedewerkerActionState> {
  const session = await requireAdmin()
  if (formData.has('password')) {
    return {
      error: 'Nieuwe medewerkers krijgen een uitnodiging in plaats van een wachtwoord.',
      status: 422,
    }
  }
  const parsed = createSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    role: formData.get('role'),
  })
  if (!parsed.success) {
    return {
      error: 'Controleer naam, e-mailadres en rol.',
      status: 422,
    }
  }

  const token = createStaffInviteToken()
  const placeholder = createUnusablePasswordPlaceholder()
  const passwordHash = await bcrypt.hash(placeholder, 10)
  const email = normalizeStaffEmail(parsed.data.email)

  try {
    const staff = await prisma.$transaction(async (tx) => {
      const created = await tx.staffMember.create({
        data: {
          name: parsed.data.name,
          email,
          role: parsed.data.role,
          passwordHash,
        },
      })
      await tx.staffInvite.create({
        data: {
          tokenHash: hashStaffInviteToken(token),
          staffId: created.id,
          createdById: session.staffId,
          expiresAt: staffInviteExpiresAt(),
        },
      })
      return created
    })

    await writeAuditLog({
      actorType: 'STAFF',
      actorId: session.staffId,
      action: 'INVITE_CREATED',
      entity: 'staff_member',
      entityId: staff.id,
      summary: staffInviteAuditSummary('created'),
    })

    // Best-effort: meld de nieuwe medewerker meteen aan als copilot-gebruiker. Mag de
    // aanmaak nooit blokkeren of laten falen — bij een storing registreert het lazy-pad
    // (medewerker opent zelf de copilot) alsnog.
    try {
      await markCopilotRegistration(staff.id, session.staffId)
    } catch {
      // genegeerd
    }

    try {
      await sendStaffInviteMail({
        appBaseUrl: env.APP_BASE_URL,
        mailTransport: env.MAIL_TRANSPORT,
        to: staff.email,
        staffName: staff.name,
        token,
        from: staffInviteMailFrom(),
        sendmailPath: env.MAIL_SENDMAIL_PATH,
      })
    } catch {
      revalidatePath('/medewerkers')
      return {
        error:
          'Medewerker aangemaakt, maar de uitnodigingsmail kon niet worden verstuurd. Probeer opnieuw versturen.',
        status: 502,
      }
    }
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
            email: normalizeStaffEmail(parsed.data.email),
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

export async function resendStaffInvite(
  _prev: MedewerkerActionState,
  formData: FormData
): Promise<MedewerkerActionState> {
  const session = await requireAdmin()
  const parsed = idSchema.safeParse({ id: formData.get('id') })
  if (!parsed.success) return { error: 'Ongeldig verzoek.', status: 422 }

  const token = createStaffInviteToken()
  const now = new Date()

  const result = await prisma.$transaction(
    async (tx): Promise<
      | { ok: false; state: MedewerkerActionState }
      | {
          ok: true
          revokedCount: number
          staff: { id: string; name: string; email: string }
        }
    > => {
      const staff = await tx.staffMember.findUnique({
        where: { id: parsed.data.id },
      })
      if (!staff) {
        return { ok: false, state: { error: 'Medewerker niet gevonden.', status: 404 } }
      }
      if (!staff.isActive) {
        return {
          ok: false,
          state: { error: 'Deze medewerker is gedeactiveerd.', status: 422 },
        }
      }

      const revoked = await tx.staffInvite.updateMany({
        where: {
          staffId: staff.id,
          usedAt: null,
          revokedAt: null,
        },
        data: { revokedAt: now },
      })
      await tx.staffInvite.create({
        data: {
          tokenHash: hashStaffInviteToken(token),
          staffId: staff.id,
          createdById: session.staffId,
          expiresAt: staffInviteExpiresAt(),
        },
      })

      return { ok: true, revokedCount: revoked.count, staff }
    }
  )

  if (!result.ok) return result.state

  if (result.revokedCount > 0) {
    await writeAuditLog({
      actorType: 'STAFF',
      actorId: session.staffId,
      action: 'INVITE_REVOKED',
      entity: 'staff_member',
      entityId: result.staff.id,
      summary: staffInviteAuditSummary('revoked'),
    })
  }

  try {
    await sendStaffInviteMail({
      appBaseUrl: env.APP_BASE_URL,
      mailTransport: env.MAIL_TRANSPORT,
      to: result.staff.email,
      staffName: result.staff.name,
      token,
      from: staffInviteMailFrom(),
      sendmailPath: env.MAIL_SENDMAIL_PATH,
    })
  } catch {
    return {
      error: 'De uitnodiging is aangemaakt, maar de e-mail kon niet worden verstuurd.',
      status: 502,
    }
  }

  await writeAuditLog({
    actorType: 'STAFF',
    actorId: session.staffId,
    action: 'INVITE_RESENT',
    entity: 'staff_member',
    entityId: result.staff.id,
    summary: staffInviteAuditSummary('resent'),
  })

  revalidatePath('/medewerkers')
  return { ok: true }
}

// Handmatig de copilot-registratie (opnieuw) versturen voor een bestaande medewerker —
// dekt medewerkers van vóór deze functie en stille mislukkingen bij het aanmaken.
export async function sendCopilotRegistration(
  _prev: MedewerkerActionState,
  formData: FormData
): Promise<MedewerkerActionState> {
  const session = await requireAdmin()
  const parsed = idSchema.safeParse({ id: formData.get('id') })
  if (!parsed.success) return { error: 'Ongeldig verzoek.', status: 422 }

  const staff = await prisma.staffMember.findUnique({
    where: { id: parsed.data.id },
    select: { id: true, isActive: true },
  })
  if (!staff) return { error: 'Medewerker niet gevonden.', status: 404 }
  if (!staff.isActive) {
    return { error: 'Deze medewerker is gedeactiveerd.', status: 422 }
  }

  let registered = false
  try {
    registered = await markCopilotRegistration(staff.id, session.staffId)
  } catch {
    registered = false
  }
  if (!registered) {
    return {
      error: 'Kon niet aanmelden bij de copilot. Probeer het later opnieuw.',
      status: 502,
    }
  }

  revalidatePath('/medewerkers')
  return { ok: true }
}
