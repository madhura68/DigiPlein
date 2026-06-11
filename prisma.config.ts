import * as dotenv from 'dotenv'
import { defineConfig } from 'prisma/config'

// Prisma 7: datasource-url staat niet meer in schema.prisma maar hier.
// Laad .env.local (Next-conventie) en daarna .env.
dotenv.config({ path: '.env.local' })
dotenv.config()

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
})
