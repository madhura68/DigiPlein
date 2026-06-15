import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

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

describe('Prisma staff invite schema', () => {
  it('defines StaffInvite with hashed token and named StaffMember relations', () => {
    expect(schema).toMatch(/model StaffInvite\s*{/)
    expect(schema).toMatch(/tokenHash\s+String\s+@unique\s+@map\("token_hash"\)/)
    expect(schema).toMatch(/staffId\s+String\s+@map\("staff_id"\)\s+@db\.Uuid/)
    expect(schema).toMatch(/createdById\s+String\s+@map\("created_by_id"\)\s+@db\.Uuid/)
    expect(schema).toMatch(/usedAt\s+DateTime\?\s+@map\("used_at"\)/)
    expect(schema).toMatch(/revokedAt\s+DateTime\?\s+@map\("revoked_at"\)/)
    expect(schema).toMatch(/@relation\("StaffInviteTarget"/)
    expect(schema).toMatch(/@relation\("StaffInviteCreator"/)
    expect(schema).toMatch(/@@map\("staff_invites"\)/)
  })

  it('creates staff_invites in a migration', () => {
    const migrations = allMigrationSql()
    expect(migrations).toContain('CREATE TABLE "staff_invites"')
    expect(migrations).toContain('"token_hash" TEXT NOT NULL')
    expect(migrations).toContain('UNIQUE ("token_hash")')
    expect(migrations).toContain('staff_invites_staff_id_expires_at_idx')
  })
})
