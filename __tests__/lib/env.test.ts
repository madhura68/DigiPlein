import { describe, it, expect } from 'vitest'
import { envSchema } from '@/lib/env'

describe('lib/env', () => {
  it('weigert ontbrekende verplichte variabelen met duidelijke veldfouten', () => {
    const result = envSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors
      expect(fields.DATABASE_URL).toBeDefined()
      expect(fields.SESSION_SECRET).toBeDefined()
    }
  })

  it('weigert een te korte SESSION_SECRET', () => {
    const result = envSchema.safeParse({
      DATABASE_URL: 'postgresql://x',
      SESSION_SECRET: 'te-kort',
    })
    expect(result.success).toBe(false)
  })

  it('accepteert geldige variabelen en vult defaults aan', () => {
    const result = envSchema.safeParse({
      DATABASE_URL: 'postgresql://x',
      SESSION_SECRET: 'x'.repeat(32),
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.APP_BASE_URL).toBe('http://localhost:3000')
      expect(result.data.NODE_ENV).toBe('development')
    }
  })
})
