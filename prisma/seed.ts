import * as dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

import { normalizeStaffEmail } from '../lib/auth/staff-email'

dotenv.config({ path: '.env.local' })
dotenv.config()

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL is niet gezet')
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

// Uitsluitend dummydata (hardstop): de twee lesvormen + één demo-beheerder.
// Idempotent via upsert, zodat herhaald seeden niets dupliceert.
async function main() {
  await prisma.course.upsert({
    where: { code: 'KLIK_EN_TIK' },
    update: {},
    create: {
      code: 'KLIK_EN_TIK',
      name: 'Computercursus Klik & Tik',
      description: 'Brede basiscursus digivaardigheden; geen sessiemaximum.',
      maxSessions: null,
      sessionMinutes: 120,
      onTuesday: true,
      onThursday: true,
    },
  })

  await prisma.course.upsert({
    where: { code: 'LES_OP_MAAT' },
    update: {},
    create: {
      code: 'LES_OP_MAAT',
      name: 'Computercursus Les op maat',
      description:
        'Doelgerichte cursus met een vooraf bepaald leerdoel; max. 4 sessies (A1, configureerbaar).',
      maxSessions: 4,
      sessionMinutes: 120,
      onTuesday: true,
      onThursday: true,
    },
  })

  const adminEmail = normalizeStaffEmail('beheerder@digiplein.demo')
  const adminPassword =
    process.env.SEED_ADMIN_PASSWORD ?? 'digiplein-demo-beheerder'
  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.warn(
      '⚠️  SEED_ADMIN_PASSWORD niet gezet — demo-wachtwoord gebruikt (alleen voor lokale dummydata).'
    )
  }
  const passwordHash = await bcrypt.hash(adminPassword, 10)

  await prisma.staffMember.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Demo Beheerder',
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
  })

  console.log('Seed klaar: 2 cursussen + 1 demo-beheerder (dummydata).')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
