'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'

import { getSession, verifyStaff } from '@/lib/auth'

export type LoginState = { error?: string; status?: number }

const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1),
  })
  .strict()

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return { error: 'Vul een geldig e-mailadres en wachtwoord in.', status: 422 }
  }

  const staff = await verifyStaff(parsed.data.email, parsed.data.password)
  if (!staff) {
    // Neutrale melding — geen onderscheid tussen onbekend account, fout
    // wachtwoord of gedeactiveerd account.
    return { error: 'E-mailadres of wachtwoord onjuist.', status: 401 }
  }

  const session = await getSession()
  session.staffId = staff.id
  session.name = staff.name
  session.role = staff.role
  delete session.paired
  delete session.pairedExpiresAt
  delete session.mustChangePassword
  await session.save()

  redirect('/')
}
