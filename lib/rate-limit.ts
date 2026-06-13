interface RateLimitConfig {
  windowMs: number
  max: number
}

const CONFIGS: Record<string, RateLimitConfig> = {
  'pair-start': { windowMs: 60_000, max: 10 },
}

const DEFAULT_CONFIG: RateLimitConfig = { windowMs: 60_000, max: 10 }
const store = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(key: string): boolean {
  const prefix = key.split(':')[0]
  const config = CONFIGS[prefix] ?? DEFAULT_CONFIG
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs })
    return true
  }

  if (entry.count >= config.max) return false
  entry.count += 1
  return true
}

export function _resetRateLimit() {
  store.clear()
}
