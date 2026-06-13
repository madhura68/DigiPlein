import { isIP } from 'node:net'

const UNKNOWN_IP = 'unknown'
const MAX_IP_LENGTH = 45

function normalizeIp(value: string | null): string {
  const candidate = value?.trim()
  if (!candidate || candidate.length > MAX_IP_LENGTH) return UNKNOWN_IP
  return isIP(candidate) ? candidate : UNKNOWN_IP
}

export function getTrustedClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const closestProxyValue = forwardedFor
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .at(-1)
    return normalizeIp(closestProxyValue ?? null)
  }

  return normalizeIp(request.headers.get('x-real-ip'))
}
