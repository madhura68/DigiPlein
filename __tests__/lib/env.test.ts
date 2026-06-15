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
      expect(result.data.MAIL_TRANSPORT).toBe('noop')
    }
  })

  it('vereist MAIL_FROM wanneer smtp-mailtransport actief is', () => {
    const result = envSchema.safeParse({
      DATABASE_URL: 'postgresql://x',
      SESSION_SECRET: 'x'.repeat(32),
      MAIL_TRANSPORT: 'smtp',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.MAIL_FROM).toBeDefined()
    }
  })

  it('accepteert smtp-mailtransport met sendmail defaults', () => {
    const result = envSchema.safeParse({
      DATABASE_URL: 'postgresql://x',
      SESSION_SECRET: 'x'.repeat(32),
      MAIL_TRANSPORT: 'smtp',
      MAIL_FROM: 'digiplein@example.nl',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.MAIL_FROM).toBe('digiplein@example.nl')
      expect(result.data.MAIL_FROM_NAME).toBe('DigiPlein')
      expect(result.data.MAIL_SENDMAIL_PATH).toBe('/usr/sbin/sendmail')
    }
  })
})
