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
  // M2 chat-window (F-07/§10): integratiepunt achter een feature-flag. Default uit
  // → "binnenkort"; aan ("true") + een geldige URL → het externe component wordt
  // ingebed (A3). Env-vars zijn strings, vandaar de transform/preprocess.
  CHAT_WINDOW_ENABLED: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
  CHAT_WINDOW_URL: z.preprocess(
    (value) =>
      typeof value === 'string' && value.length === 0 ? undefined : value,
    z.string().url('CHAT_WINDOW_URL moet een geldige URL zijn').optional()
  ),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Ongeldige omgevingsvariabelen:')
  console.error(parsed.error.flatten().fieldErrors)
  throw new Error('Ongeldige omgevingsvariabelen. Controleer .env / .env.local.')
}

export const env = parsed.data
