import { describe, expect, it } from 'vitest'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const schema = readFileSync('prisma/schema.prisma', 'utf8')

function allMigrationSql(): string {
  const dir = 'prisma/migrations'
  if (!existsSync(dir)) return ''
  return readdirSync(dir)
    .map((entry) => join(dir, entry, 'migration.sql'))
    .filter((path) => existsSync(path))
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n')
}

describe('Prisma QR-pairing schema', () => {
  it('definieert PairingStatus en LoginPairing met uuid staff_id', () => {
    expect(schema).toMatch(/enum PairingStatus\s*{[^}]*pending[^}]*approved[^}]*consumed[^}]*cancelled[^}]*}/s)
    expect(schema).toMatch(/model LoginPairing\s*{/)
    expect(schema).toMatch(/staffId\s+String\?\s+@map\("staff_id"\)\s+@db\.Uuid/)
    expect(schema).toMatch(/staff\s+StaffMember\?\s+@relation\(fields: \[staffId\], references: \[id\], onDelete: SetNull\)/)
    expect(schema).toMatch(/@@index\(\[expiresAt\]\)/)
    expect(schema).toMatch(/@@index\(\[status, expiresAt\]\)/)
    expect(schema).toMatch(/@@map\("login_pairings"\)/)
  })

  it('legt de login_pairings-tabel en Postgres notify-trigger vast in een migratie', () => {
    const migrations = allMigrationSql()

    expect(migrations).toContain('CREATE TABLE "login_pairings"')
    expect(migrations).toContain("pg_notify('digiplein_pairing'")
    expect(migrations).toContain('CREATE TRIGGER login_pairings_notify')
    expect(migrations).toContain('"staff_id" UUID')
  })
})
