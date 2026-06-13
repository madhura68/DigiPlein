import { cookies } from 'next/headers'

export const PAIR_COOKIE_NAME = 'digiplein_pair'

const MAX_AGE_SECONDS = 5 * 60
const COOKIE_PATH = '/api/auth/pair'

export async function setPairCookie(desktopToken: string): Promise<void> {
  const jar = await cookies()
  jar.set(PAIR_COOKIE_NAME, desktopToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: COOKIE_PATH,
    maxAge: MAX_AGE_SECONDS,
  })
}

export async function readPairCookie(): Promise<string | null> {
  const jar = await cookies()
  return jar.get(PAIR_COOKIE_NAME)?.value ?? null
}

export async function clearPairCookie(): Promise<void> {
  const jar = await cookies()
  jar.delete({ name: PAIR_COOKIE_NAME, path: COOKIE_PATH })
}
