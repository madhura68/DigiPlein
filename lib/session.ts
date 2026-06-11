import type { SessionOptions } from 'iron-session'
import type { StaffRole } from '@prisma/client'

export interface SessionData {
  staffId: string
  name: string
  role: StaffRole
}

export const sessionOptions: SessionOptions = {
  // proxy.ts checkt alleen het bestaan van de cookie; het secret wordt pas bij
  // verzegelen/ontzegelen gebruikt (server-side, waar SESSION_SECRET gezet is).
  password: process.env.SESSION_SECRET ?? '',
  cookieName: 'digiplein-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
}
