import bcrypt from 'bcryptjs'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { isPairedSessionExpired } from '@/lib/auth/pairing'
import { normalizeStaffEmail } from '@/lib/auth/staff-email'
import { prisma } from '@/lib/db'
import { sessionOptions, type SessionData } from '@/lib/session'

export class AuthError extends Error {
  constructor(
    message: string,
    readonly status: 401 | 403
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions)
}

// Voor pages én server actions. Geen sessie → redirect naar /login (de proxy
// dekt dit al af; dit is verdediging in de diepte).
export async function requireStaff(options?: { allowPasswordChange?: boolean }) {
  const session = await getSession()
  if (!session.staffId) redirect('/login')
  if (isPairedSessionExpired(session)) {
    redirect('/api/auth/logout?reason=paired-expired')
  }
  if (session.mustChangePassword && !options?.allowPasswordChange) {
    redirect('/account/wachtwoord')
  }
  return session
}

// Rolcheck altijd server-side, ook waar de UI de actie al verbergt.
export async function requireAdmin() {
  const session = await requireStaff()
  if (session.role !== 'ADMIN') {
    throw new AuthError('Geen beheerderrechten', 403)
  }
  return session
}

// Neutrale verificatie: dezelfde uitkomst (null) of het account nu niet bestaat,
// het wachtwoord fout is, of het account gedeactiveerd is — geen informatielek.
export async function verifyStaff(email: string, password: string) {
  const staff = await prisma.staffMember.findUnique({
    where: { email: normalizeStaffEmail(email) },
  })
  if (!staff || !staff.isActive) return null
  const valid = await bcrypt.compare(password, staff.passwordHash)
  if (!valid) return null
  return staff
}
