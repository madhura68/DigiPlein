import { z } from 'zod'

// Eén Zod-gevalideerde bron voor de omgevingsvariabelen (mvp-spec §9).
// envSchema wordt apart geëxporteerd zodat de unit-test de validatie kan toetsen.
export const envSchema = z.object({
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
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Ongeldige omgevingsvariabelen:')
  console.error(parsed.error.flatten().fieldErrors)
  throw new Error('Ongeldige omgevingsvariabelen. Controleer .env / .env.local.')
}

export const env = parsed.data
