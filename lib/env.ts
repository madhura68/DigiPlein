import { z } from 'zod'

const emptyStringToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value

// Eén Zod-gevalideerde bron voor de omgevingsvariabelen (mvp-spec §9).
// envSchema wordt apart geëxporteerd zodat de unit-test de validatie kan toetsen.
export const envSchema = z
  .object({
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is verplicht'),
    SESSION_SECRET: z
      .string()
      .min(32, 'SESSION_SECRET moet minimaal 32 tekens zijn'),
    APP_BASE_URL: z
      .string()
      .url('APP_BASE_URL moet een geldige URL zijn')
      .default('http://localhost:3000'),
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    MAIL_TRANSPORT: z.enum(['noop', 'smtp']).default('noop'),
    MAIL_FROM: z.preprocess(
      emptyStringToUndefined,
      z.email('MAIL_FROM moet een geldig e-mailadres zijn').optional()
    ),
    MAIL_FROM_NAME: z.preprocess(
      emptyStringToUndefined,
      z.string().min(1).default('DigiPlein')
    ),
    MAIL_SENDMAIL_PATH: z.preprocess(
      emptyStringToUndefined,
      z.string().min(1).default('/usr/sbin/sendmail')
    ),
  })
  .superRefine((value, ctx) => {
    if (value.MAIL_TRANSPORT === 'smtp' && !value.MAIL_FROM) {
      ctx.addIssue({
        code: 'custom',
        path: ['MAIL_FROM'],
        message: 'MAIL_FROM is verplicht bij MAIL_TRANSPORT=smtp',
      })
    }
  })

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Ongeldige omgevingsvariabelen:')
  console.error(parsed.error.flatten().fieldErrors)
  throw new Error('Ongeldige omgevingsvariabelen. Controleer .env / .env.local.')
}

export const env = parsed.data
