'use server'

import bcrypt from 'bcryptjs'

import { requireStaff } from '@/lib/auth'
import { prisma } from '@/lib/db'

export type ChangePasswordState = {
  error?: string
  status?: number
  ok?: boolean
}

const neutralError: ChangePasswordState = {
  error: 'Wachtwoord wijzigen is niet gelukt.',
  status: 401,
}

function value(formData: FormData, key: string): string {
  const field = formData.get(key)
  return typeof field === 'string' ? field : ''
}

export async function changeOwnPassword(
  _prev: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const session = await requireStaff()
  const currentPassword = value(formData, 'currentPassword')
  const newPassword = value(formData, 'newPassword')
  const confirmPassword = value(formData, 'confirmPassword')

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'Vul alle wachtwoordvelden in.', status: 422 }
  }
  if (newPassword.length < 8) {
    return {
      error: 'Het nieuwe wachtwoord moet minimaal 8 tekens zijn.',
      status: 422,
    }
  }
  if (newPassword !== confirmPassword) {
    return {
      error: 'De nieuwe wachtwoorden komen niet overeen.',
      status: 422,
    }
  }

  const staff = await prisma.staffMember.findUnique({
    where: { id: session.staffId },
    select: { isActive: true, passwordHash: true },
  })
  if (!staff || !staff.isActive) return neutralError

  const valid = await bcrypt.compare(currentPassword, staff.passwordHash)
  if (!valid) return neutralError

  const passwordHash = await bcrypt.hash(newPassword, 10)
  await prisma.staffMember.update({
    where: { id: session.staffId },
    data: { passwordHash },
  })

  return { ok: true }
}
