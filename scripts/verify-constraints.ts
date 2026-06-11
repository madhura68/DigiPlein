import * as dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

dotenv.config({ path: '.env.local' })
dotenv.config()

// Herhaalbaar bewijs (ST-003, hergebruikt door ST-105) dat de DB-constraints en
// de cascade-delete echt afdwingen wat de spec vereist. Vereist een draaiende
// dev-DB met toegepaste migratie + seed.
const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL is niet gezet')
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

let failures = 0
const pass = (label: string) => console.log(`✓ ${label}`)
const fail = (label: string, detail?: string) => {
  failures++
  console.error(`✗ ${label}${detail ? ` — ${detail}` : ''}`)
}

async function expectReject(label: string, fn: () => Promise<unknown>) {
  try {
    await fn()
    fail(label, 'verwacht een databasefout, maar de operatie slaagde')
  } catch {
    pass(label)
  }
}

async function main() {
  // Resten van een vorige run opruimen (sentinelwaarden).
  await prisma.client.deleteMany({ where: { firstName: '__constraint_test__' } })
  await prisma.course.deleteMany({ where: { code: 'CONSTRAINT_TEST_NEG' } })

  // 1. unique courses.code — KLIK_EN_TIK bestaat uit de seed.
  await expectReject('unique courses.code (duplicaat geweigerd)', () =>
    prisma.course.create({ data: { code: 'KLIK_EN_TIK', name: 'duplicaat' } })
  )

  // 2. CHECK courses.max_sessions > 0.
  await expectReject('CHECK courses.max_sessions > 0', () =>
    prisma.course.create({
      data: { code: 'CONSTRAINT_TEST_NEG', name: 'negatief', maxSessions: 0 },
    })
  )

  // 3. Partial unique index: max. één ACTIEF traject per (client, course).
  const course = await prisma.course.findUniqueOrThrow({
    where: { code: 'LES_OP_MAAT' },
  })
  const client = await prisma.client.create({
    data: { firstName: '__constraint_test__' },
  })
  await prisma.learningTrack.create({
    data: {
      clientId: client.id,
      courseId: course.id,
      status: 'ACTIEF',
      startedOn: new Date(),
    },
  })
  await expectReject('partial unique: tweede ACTIEF traject geweigerd', () =>
    prisma.learningTrack.create({
      data: {
        clientId: client.id,
        courseId: course.id,
        status: 'ACTIEF',
        startedOn: new Date(),
      },
    })
  )
  // Een AFGEROND traject naast het ACTIEF traject mag wél (index is partial).
  await prisma.learningTrack.create({
    data: {
      clientId: client.id,
      courseId: course.id,
      status: 'AFGEROND',
      startedOn: new Date(),
    },
  })
  pass('partial unique: AFGEROND traject naast ACTIEF toegestaan')

  // 4. Cascade delete: client → learning_tracks.
  const before = await prisma.learningTrack.count({
    where: { clientId: client.id },
  })
  await prisma.client.delete({ where: { id: client.id } })
  const after = await prisma.learningTrack.count({
    where: { clientId: client.id },
  })
  if (before >= 2 && after === 0) {
    pass(`cascade delete client → trajecten (${before} → 0)`)
  } else {
    fail('cascade delete client → trajecten', `before=${before}, after=${after}`)
  }

  // Opruimen.
  await prisma.course.deleteMany({ where: { code: 'CONSTRAINT_TEST_NEG' } })

  if (failures > 0) {
    console.error(`\n${failures} constraint-controle(s) faalden.`)
    process.exitCode = 1
  } else {
    console.log('\nAlle constraint-/cascade-controles geslaagd.')
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
