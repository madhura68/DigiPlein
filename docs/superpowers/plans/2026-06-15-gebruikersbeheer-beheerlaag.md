# Gebruikersbeheer Beheerlaag Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bouw een ADMIN-only gebruikersbeheerlaag waarin beheerders medewerkers registreren via een e-mailuitnodiging, medewerkers na acceptatie verplicht hun wachtwoord instellen, en `Beheer` als nieuw navigatiegebied `Gebruikersbeheer` en `Audit-log` groepeert.

**Architecture:** De feature blijft binnen de bestaande Next.js App Router + iron-session + Prisma patronen. Uitnodigingen krijgen een server-side gehashte token in `staff_invites`, acceptatie loopt via een read-only page plus server action, en `requireStaff({ allowPasswordChange })` dwingt de verplichte wachtwoordwissel server-side af zonder redirect-loop.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Prisma 7/PostgreSQL, iron-session, bcryptjs, Zod, Vitest, Tailwind/Base UI.

---

## Source Material

- Spec: `docs/superpowers/specs/2026-06-15-gebruikersbeheer-beheerlaag-design.md`
- Initial review: `docs/reviews/2026-06-15-gebruikersbeheer-spec-review-claude.md`
- GO herreview: `docs/reviews/2026-06-15-gebruikersbeheer-spec-herreview-claude.md`
- Existing auth decisions: `docs/adr/0005-iron-session-over-nextauth.md`
- Existing UI decision: `docs/adr/0001-base-ui-over-radix.md`

## File Structure

- Modify: `prisma/schema.prisma` — add `StaffInvite` and named relations on `StaffMember`.
- Create: `prisma/migrations/20260615110000_add_staff_invites/migration.sql` — SQL migration for `staff_invites`.
- Create: `__tests__/prisma/staff-invite-schema.test.ts` — schema and migration coverage.
- Modify: `lib/env.ts`, `__tests__/lib/env.test.ts` — add `MAIL_TRANSPORT` with `noop` default.
- Create: `lib/auth/staff-email.ts`, `__tests__/lib/staff-email.test.ts` — shared staff-email normalization.
- Create: `lib/auth/staff-invites.ts`, `__tests__/lib/staff-invites.test.ts` — token creation, token hash reuse, invite cleanup, active invite rules.
- Create: `lib/mail/staff-invite.ts`, `__tests__/lib/staff-invite-mail.test.ts` — mail adapter boundary and `noop` behavior.
- Modify: `lib/audit.ts`, `__tests__/lib/audit.test.ts` — fixed staff invite audit summaries.
- Modify: `lib/auth.ts`, `app/login/actions.ts`, `__tests__/lib/auth.test.ts`, `__tests__/app/login-action.test.ts` — normalization, forced password gate, session field resets.
- Modify: `lib/session.ts` — add `mustChangePassword`.
- Modify: `proxy.ts`, create `__tests__/proxy.test.ts` — public invite page bypass.
- Create: `app/uitnodiging/[token]/page.tsx`, `app/uitnodiging/[token]/actions.ts`, `__tests__/app/staff-invite-accept.test.tsx`, `__tests__/app/staff-invite-accept-actions.test.ts` — read-only invitation page and accept server action.
- Modify: `app/account/wachtwoord/page.tsx`, `app/account/wachtwoord/password-form.tsx`, `app/account/wachtwoord/actions.ts`, existing account-password tests — forced-password UI/action.
- Modify: `app/medewerkers/actions.ts`, `app/medewerkers/nieuwe-medewerker-form.tsx`, `app/medewerkers/medewerker-rij-acties.tsx`, `app/medewerkers/page.tsx`, `app/medewerkers/nieuw/page.tsx`, `__tests__/app/medewerkers-actions.test.ts` — create/resend invite flow, remove initial password UI.
- Modify: `components/nav-items.ts`, `components/app-shell.tsx`, `components/mobile-nav-drawer.tsx`, `__tests__/components/nav-items.test.ts`, `__tests__/app/app-shell.test.tsx` — nested `Beheer` nav.
- Modify: `app/stijlgids/page.tsx`, `prisma/seed.ts` — P3 enforcement and seed consistency.

---

### Task 1: Data Model, Env, And Email Normalization Foundation

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260615110000_add_staff_invites/migration.sql`
- Create: `__tests__/prisma/staff-invite-schema.test.ts`
- Modify: `lib/env.ts`
- Modify: `__tests__/lib/env.test.ts`
- Create: `lib/auth/staff-email.ts`
- Create: `__tests__/lib/staff-email.test.ts`

- [ ] **Step 1: Write failing schema test**

Create `__tests__/prisma/staff-invite-schema.test.ts`:

```ts
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
```

- [ ] **Step 2: Run schema test and verify RED**

Run: `npm test -- __tests__/prisma/staff-invite-schema.test.ts`

Expected: FAIL because `StaffInvite` and the migration do not exist.

- [ ] **Step 3: Add Prisma model and migration**

Update `prisma/schema.prisma`:

```prisma
model StaffMember {
  id                  String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name                String
  email               String         @unique
  passwordHash        String         @map("password_hash")
  role                StaffRole      @default(STAFF)
  isActive            Boolean        @default(true) @map("is_active")
  createdAt           DateTime       @default(now()) @map("created_at") @db.Timestamptz
  updatedAt           DateTime       @updatedAt @map("updated_at") @db.Timestamptz
  loginPairings       LoginPairing[]
  invites             StaffInvite[]  @relation("StaffInviteTarget")
  createdStaffInvites StaffInvite[]  @relation("StaffInviteCreator")

  @@map("staff_members")
}

model StaffInvite {
  id          String      @id @default(cuid())
  tokenHash   String      @unique @map("token_hash")
  staffId     String      @map("staff_id") @db.Uuid
  createdById String      @map("created_by_id") @db.Uuid
  createdAt   DateTime    @default(now()) @map("created_at") @db.Timestamptz
  expiresAt   DateTime    @map("expires_at") @db.Timestamptz
  usedAt      DateTime?   @map("used_at") @db.Timestamptz
  revokedAt   DateTime?   @map("revoked_at") @db.Timestamptz
  staff       StaffMember @relation("StaffInviteTarget", fields: [staffId], references: [id], onDelete: Cascade)
  createdBy   StaffMember @relation("StaffInviteCreator", fields: [createdById], references: [id], onDelete: Restrict)

  @@index([staffId, expiresAt])
  @@index([expiresAt])
  @@map("staff_invites")
}
```

Create `prisma/migrations/20260615110000_add_staff_invites/migration.sql`:

```sql
CREATE TABLE "staff_invites" (
  "id" TEXT NOT NULL,
  "token_hash" TEXT NOT NULL,
  "staff_id" UUID NOT NULL,
  "created_by_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "used_at" TIMESTAMPTZ,
  "revoked_at" TIMESTAMPTZ,

  CONSTRAINT "staff_invites_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "staff_invites_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff_members"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "staff_invites_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "staff_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "staff_invites_token_hash_key" ON "staff_invites"("token_hash");
CREATE INDEX "staff_invites_staff_id_expires_at_idx" ON "staff_invites"("staff_id", "expires_at");
CREATE INDEX "staff_invites_expires_at_idx" ON "staff_invites"("expires_at");
```

- [ ] **Step 4: Run schema test and verify GREEN**

Run: `npm test -- __tests__/prisma/staff-invite-schema.test.ts`

Expected: PASS.

- [ ] **Step 5: Write failing env and email tests**

Extend `__tests__/lib/env.test.ts`:

```ts
expect(result.data.MAIL_TRANSPORT).toBe('noop')
```

Create `__tests__/lib/staff-email.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { normalizeStaffEmail } from '@/lib/auth/staff-email'

describe('normalizeStaffEmail', () => {
  it('trims and lowercases staff email addresses consistently', () => {
    expect(normalizeStaffEmail('  Sandra.VanDijk@Bibliotheek.Rotterdam.NL  ')).toBe(
      'sandra.vandijk@bibliotheek.rotterdam.nl'
    )
  })
})
```

- [ ] **Step 6: Run foundation tests and verify RED**

Run: `npm test -- __tests__/lib/env.test.ts __tests__/lib/staff-email.test.ts`

Expected: FAIL because `MAIL_TRANSPORT` and `normalizeStaffEmail` do not exist.

- [ ] **Step 7: Implement env and normalization helper**

Create `lib/auth/staff-email.ts`:

```ts
export function normalizeStaffEmail(value: string): string {
  return value.trim().toLowerCase()
}
```

Update `lib/env.ts`:

```ts
MAIL_TRANSPORT: z.enum(['noop', 'smtp']).default('noop'),
```

- [ ] **Step 8: Run foundation tests and verify GREEN**

Run: `npm test -- __tests__/lib/env.test.ts __tests__/lib/staff-email.test.ts __tests__/prisma/staff-invite-schema.test.ts`

Expected: PASS.

---

### Task 2: Invite Core, Cleanup, Mail Boundary, And Audit Builders

**Files:**
- Create: `lib/auth/staff-invites.ts`
- Create: `__tests__/lib/staff-invites.test.ts`
- Create: `lib/mail/staff-invite.ts`
- Create: `__tests__/lib/staff-invite-mail.test.ts`
- Modify: `lib/audit.ts`
- Modify: `__tests__/lib/audit.test.ts`

- [ ] **Step 1: Write failing invite core tests**

Create `__tests__/lib/staff-invites.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'
import {
  createStaffInviteToken,
  createUnusablePasswordPlaceholder,
  hashStaffInviteToken,
  cleanupExpiredStaffInvites,
  STAFF_INVITE_TTL_MS,
} from '@/lib/auth/staff-invites'

describe('staff invite tokens', () => {
  it('generates url-safe random tokens and hashes them with sha256 hex', () => {
    const token = createStaffInviteToken()
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(Buffer.from(token, 'base64url').byteLength).toBe(32)
    expect(hashStaffInviteToken(token)).toMatch(/^[a-f0-9]{64}$/)
  })

  it('uses a 72 hour ttl', () => {
    expect(STAFF_INVITE_TTL_MS).toBe(72 * 60 * 60 * 1000)
  })

  it('creates an independent unusable password placeholder', () => {
    const inviteToken = createStaffInviteToken()
    const placeholder = createUnusablePasswordPlaceholder()
    expect(placeholder).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(Buffer.from(placeholder, 'base64url').byteLength).toBe(32)
    expect(placeholder).not.toBe(inviteToken)
  })
})

describe('cleanupExpiredStaffInvites', () => {
  it('deletes expired pending invites and used/revoked invites after retention', async () => {
    const staffInvite = { deleteMany: vi.fn().mockResolvedValue({ count: 3 }) }
    const now = new Date('2026-06-15T10:00:00.000Z')
    const result = await cleanupExpiredStaffInvites({ staffInvite }, now)

    expect(result.count).toBe(3)
    expect(staffInvite.deleteMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { usedAt: null, revokedAt: null, expiresAt: { lt: now } },
          {
            OR: [{ usedAt: { not: null } }, { revokedAt: { not: null } }],
            expiresAt: { lt: new Date('2026-06-08T10:00:00.000Z') },
          },
        ],
      },
    })
  })
})
```

- [ ] **Step 2: Run invite core test and verify RED**

Run: `npm test -- __tests__/lib/staff-invites.test.ts`

Expected: FAIL because `lib/auth/staff-invites.ts` does not exist.

- [ ] **Step 3: Implement invite core helpers**

Create `lib/auth/staff-invites.ts`:

```ts
import { randomBytes } from 'node:crypto'
import { hashToken } from '@/lib/auth/pairing'

export const STAFF_INVITE_TTL_MS = 72 * 60 * 60 * 1000
export const STAFF_INVITE_RETENTION_MS = 7 * 24 * 60 * 60 * 1000

type StaffInviteCleanupClient = {
  staffInvite: {
    deleteMany(args: {
      where: {
        OR: Array<Record<string, unknown>>
      }
    }): Promise<{ count: number }>
  }
}

export function createStaffInviteToken(): string {
  return randomBytes(32).toString('base64url')
}

export function createUnusablePasswordPlaceholder(): string {
  return randomBytes(32).toString('base64url')
}

export function hashStaffInviteToken(token: string): string {
  return hashToken(token)
}

export function staffInviteExpiresAt(now = new Date()): Date {
  return new Date(now.getTime() + STAFF_INVITE_TTL_MS)
}

export async function cleanupExpiredStaffInvites(
  prisma: StaffInviteCleanupClient,
  now = new Date()
): Promise<{ count: number }> {
  const retentionCutoff = new Date(now.getTime() - STAFF_INVITE_RETENTION_MS)
  return prisma.staffInvite.deleteMany({
    where: {
      OR: [
        { usedAt: null, revokedAt: null, expiresAt: { lt: now } },
        {
          OR: [{ usedAt: { not: null } }, { revokedAt: { not: null } }],
          expiresAt: { lt: retentionCutoff },
        },
      ],
    },
  })
}
```

- [ ] **Step 4: Run invite core test and verify GREEN**

Run: `npm test -- __tests__/lib/staff-invites.test.ts`

Expected: PASS.

- [ ] **Step 5: Write failing mail boundary tests**

Create `__tests__/lib/staff-invite-mail.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/env', () => ({
  env: { MAIL_TRANSPORT: 'noop' },
}))

const consoleInfo = vi.spyOn(console, 'info').mockImplementation(() => {})

import { sendStaffInviteEmail } from '@/lib/mail/staff-invite'

beforeEach(() => {
  consoleInfo.mockClear()
})

describe('sendStaffInviteEmail', () => {
  it('noop transport does not expose invite links or tokens in logs', async () => {
    await sendStaffInviteEmail({
      to: 'sandra@example.test',
      name: 'Sandra',
      inviteUrl: 'https://digiplein.test/uitnodiging/super-secret-token',
      expiresAt: new Date('2026-06-18T10:00:00.000Z'),
    })

    const logged = consoleInfo.mock.calls.flat().join(' ')
    expect(logged).not.toContain('super-secret-token')
    expect(logged).not.toContain('https://digiplein.test/uitnodiging')
  })
})
```

- [ ] **Step 6: Run mail test and verify RED**

Run: `npm test -- __tests__/lib/staff-invite-mail.test.ts`

Expected: FAIL because `lib/mail/staff-invite.ts` does not exist.

- [ ] **Step 7: Implement noop mail boundary**

Create `lib/mail/staff-invite.ts`:

```ts
import { env } from '@/lib/env'

export type StaffInviteEmail = {
  to: string
  name: string
  inviteUrl: string
  expiresAt: Date
}

export async function sendStaffInviteEmail(input: StaffInviteEmail): Promise<void> {
  if (env.MAIL_TRANSPORT === 'noop') {
    void input
    console.info('Medewerkeruitnodiging niet extern verzonden: noop mailtransport.')
    return
  }

  throw new Error('SMTP-mailtransport is nog niet geconfigureerd.')
}
```

The noop log intentionally excludes `to`, `name`, `inviteUrl` and token content.

- [ ] **Step 8: Run mail test and verify GREEN**

Run: `npm test -- __tests__/lib/staff-invite-mail.test.ts`

Expected: PASS.

- [ ] **Step 9: Write failing audit-builder tests**

Extend `__tests__/lib/audit.test.ts`:

```ts
import { staffInviteAuditSummary } from '@/lib/audit'

describe('staffInviteAuditSummary', () => {
  it('returns fixed persoonsgegevens-arme invite summaries', () => {
    expect(staffInviteAuditSummary('INVITE_CREATED')).toBe(
      'Medewerkeruitnodiging verzonden'
    )
    expect(staffInviteAuditSummary('INVITE_REVOKED')).toBe(
      'Oude medewerkeruitnodiging ingetrokken'
    )
    expect(staffInviteAuditSummary('PASSWORD_SET')).toBe(
      'Medewerker heeft wachtwoord ingesteld'
    )
  })

  it('contains no email address, link or token-shaped content', () => {
    for (const action of ['INVITE_CREATED', 'INVITE_REVOKED', 'PASSWORD_SET'] as const) {
      const summary = staffInviteAuditSummary(action)
      expect(summary).not.toMatch(/[^\s@]+@[^\s@]+/)
      expect(summary).not.toContain('http')
      expect(summary).not.toMatch(/[A-Za-z0-9_-]{32,}/)
    }
  })
})
```

- [ ] **Step 10: Run audit tests and verify RED**

Run: `npm test -- __tests__/lib/audit.test.ts`

Expected: FAIL because `staffInviteAuditSummary` does not exist.

- [ ] **Step 11: Implement audit builder**

Update `lib/audit.ts`:

```ts
export type StaffInviteAuditAction =
  | 'INVITE_CREATED'
  | 'INVITE_REVOKED'
  | 'PASSWORD_SET'

export function staffInviteAuditSummary(action: StaffInviteAuditAction): string {
  switch (action) {
    case 'INVITE_CREATED':
      return 'Medewerkeruitnodiging verzonden'
    case 'INVITE_REVOKED':
      return 'Oude medewerkeruitnodiging ingetrokken'
    case 'PASSWORD_SET':
      return 'Medewerker heeft wachtwoord ingesteld'
  }
}
```

- [ ] **Step 12: Run Task 2 tests and verify GREEN**

Run: `npm test -- __tests__/lib/staff-invites.test.ts __tests__/lib/staff-invite-mail.test.ts __tests__/lib/audit.test.ts`

Expected: PASS.

---

### Task 3: Auth Gate, Login Normalization, And Session Shape

**Files:**
- Modify: `lib/session.ts`
- Modify: `lib/auth.ts`
- Modify: `app/login/actions.ts`
- Modify: `prisma/seed.ts`
- Modify: `__tests__/lib/auth.test.ts`
- Modify: `__tests__/app/login-action.test.ts`

- [ ] **Step 1: Write failing auth tests**

Extend `__tests__/lib/auth.test.ts`:

```ts
it('requireStaff met mustChangePassword → redirect naar /account/wachtwoord', async () => {
  getIronSession.mockResolvedValue({
    staffId: 'x',
    name: 'A',
    role: 'STAFF',
    mustChangePassword: true,
  })

  await expect(requireStaff()).rejects.toThrow('NEXT_REDIRECT')
  expect(redirect).toHaveBeenCalledWith('/account/wachtwoord')
})

it('requireStaff met allowPasswordChange staat wachtwoordpagina toe', async () => {
  getIronSession.mockResolvedValue({
    staffId: 'x',
    name: 'A',
    role: 'STAFF',
    mustChangePassword: true,
  })

  await expect(
    requireStaff({ allowPasswordChange: true })
  ).resolves.toMatchObject({ staffId: 'x', mustChangePassword: true })
})

it('verifyStaff normaliseert e-mail vóór lookup', async () => {
  staffMember.findUnique.mockResolvedValue({
    id: 'staff-1',
    name: 'Sandra',
    email: 'sandra@example.test',
    passwordHash: 'hash',
    role: 'STAFF',
    isActive: true,
  })
  compare.mockResolvedValue(true)

  await verifyStaff(' Sandra@Example.Test ', 'wachtwoord')

  expect(staffMember.findUnique).toHaveBeenCalledWith({
    where: { email: 'sandra@example.test' },
  })
})

it('verifyStaff accepteert de raw uitnodigingstoken niet als wachtwoord', async () => {
  staffMember.findUnique.mockResolvedValue({
    id: 'staff-1',
    name: 'Sandra',
    email: 'sandra@example.test',
    passwordHash: 'hash-of-independent-placeholder',
    role: 'STAFF',
    isActive: true,
  })
  compare.mockResolvedValue(false)

  await expect(
    verifyStaff('sandra@example.test', 'raw-invite-token')
  ).resolves.toBeNull()

  expect(compare).toHaveBeenCalledWith(
    'raw-invite-token',
    'hash-of-independent-placeholder'
  )
})
```

At the top of `__tests__/lib/auth.test.ts`, add hoisted mocks for `bcryptjs.compare` and `@/lib/db`:

```ts
const mocks = vi.hoisted(() => {
  const staffMember = { findUnique: vi.fn() }
  return { staffMember, prisma: { staffMember }, compare: vi.fn() }
})

vi.mock('bcryptjs', () => ({ default: { compare: mocks.compare }, compare: mocks.compare }))
vi.mock('@/lib/db', () => ({ prisma: mocks.prisma }))

const { staffMember, compare } = mocks
```

Extend `__tests__/app/login-action.test.ts`:

```ts
it('geldige login wist forced-password en pairingvelden uit een bestaande sessie', async () => {
  const session = {
    save,
    paired: true,
    pairedExpiresAt: 123,
    mustChangePassword: true,
  }
  getSession.mockResolvedValue(session)
  verifyStaff.mockResolvedValue({ id: '1', name: 'Beheerder', role: 'ADMIN' })

  await expect(
    login({}, formData({ email: ' Beheerder@Digiplein.Demo ', password: 'goed' }))
  ).rejects.toThrow('NEXT_REDIRECT')

  expect(verifyStaff).toHaveBeenCalledWith(' Beheerder@Digiplein.Demo ', 'goed')
  expect(session).toMatchObject({
    staffId: '1',
    name: 'Beheerder',
    role: 'ADMIN',
    paired: undefined,
    pairedExpiresAt: undefined,
    mustChangePassword: undefined,
  })
  expect(save).toHaveBeenCalledOnce()
})
```

- [ ] **Step 2: Run auth tests and verify RED**

Run: `npm test -- __tests__/lib/auth.test.ts __tests__/app/login-action.test.ts`

Expected: FAIL because `allowPasswordChange`, `mustChangePassword`, and session reset behavior are missing.

- [ ] **Step 3: Implement session shape and auth gate**

Update `lib/session.ts`:

```ts
mustChangePassword?: boolean
```

Update `lib/auth.ts`:

```ts
import { normalizeStaffEmail } from '@/lib/auth/staff-email'

export async function requireStaff(options: { allowPasswordChange?: boolean } = {}) {
  const session = await getSession()
  if (!session.staffId) redirect('/login')
  if (isPairedSessionExpired(session)) {
    redirect('/api/auth/logout?reason=paired-expired')
  }
  if (session.mustChangePassword && !options.allowPasswordChange) {
    redirect('/account/wachtwoord')
  }
  return session
}

export async function verifyStaff(email: string, password: string) {
  const staff = await prisma.staffMember.findUnique({
    where: { email: normalizeStaffEmail(email) },
  })
  if (!staff || !staff.isActive) return null
  const valid = await bcrypt.compare(password, staff.passwordHash)
  if (!valid) return null
  return staff
}
```

Update `app/login/actions.ts` after successful `verifyStaff`:

```ts
session.staffId = staff.id
session.name = staff.name
session.role = staff.role
session.paired = undefined
session.pairedExpiresAt = undefined
session.mustChangePassword = undefined
await session.save()
```

Update `prisma/seed.ts`:

```ts
import { normalizeStaffEmail } from '../lib/auth/staff-email'
const adminEmail = normalizeStaffEmail('beheerder@digiplein.demo')
```

- [ ] **Step 4: Run auth tests and verify GREEN**

Run: `npm test -- __tests__/lib/auth.test.ts __tests__/app/login-action.test.ts`

Expected: PASS.

---

### Task 4: Public Invite Route, Read-Only Page, And Atomic Accept Action

**Files:**
- Modify: `proxy.ts`
- Create: `__tests__/proxy.test.ts`
- Create: `app/uitnodiging/[token]/page.tsx`
- Create: `app/uitnodiging/[token]/actions.ts`
- Create: `__tests__/app/staff-invite-accept.test.tsx`
- Create: `__tests__/app/staff-invite-accept-actions.test.ts`

- [ ] **Step 1: Write failing proxy tests**

Create `__tests__/proxy.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { proxy } from '@/proxy'

function request(pathname: string, cookie?: string): NextRequest {
  const headers = new Headers()
  if (cookie) headers.set('cookie', cookie)
  return new NextRequest(`https://digiplein.test${pathname}`, { headers })
}

describe('proxy', () => {
  it('laat uitnodigingroute zonder sessie door', () => {
    const response = proxy(request('/uitnodiging/token-123'))
    expect(response?.status).not.toBe(307)
    expect(response?.headers.get('location')).toBeNull()
  })

  it('blijft andere beschermde routes zonder sessie naar login sturen', () => {
    const response = proxy(request('/clienten'))
    expect(response?.status).toBe(307)
    expect(response?.headers.get('location')).toBe('https://digiplein.test/login')
  })
})
```

- [ ] **Step 2: Run proxy test and verify RED**

Run: `npm test -- __tests__/proxy.test.ts`

Expected: FAIL because `/uitnodiging` redirects to `/login`.

- [ ] **Step 3: Implement proxy bypass**

Update `proxy.ts`:

```ts
const isInviteRoute = pathname.startsWith('/uitnodiging/')

if (!hasSession && !isLoginRoute && !isApiRoute && !isInviteRoute) {
  return NextResponse.redirect(new URL('/login', request.url))
}
```

- [ ] **Step 4: Run proxy test and verify GREEN**

Run: `npm test -- __tests__/proxy.test.ts`

Expected: PASS.

- [ ] **Step 5: Write failing accept action tests**

Create `__tests__/app/staff-invite-accept-actions.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const session = { save: vi.fn() }
  const staffInvite = {
    updateMany: vi.fn(),
    findFirst: vi.fn(),
    deleteMany: vi.fn(),
  }
  const loginPairing = { deleteMany: vi.fn() }
  return {
    session,
    redirect: vi.fn(() => {
      throw new Error('NEXT_REDIRECT')
    }),
    prisma: {
      staffInvite,
      loginPairing,
      $transaction: vi.fn(),
    },
  }
})

vi.mock('@/lib/auth', () => ({ getSession: vi.fn(async () => mocks.session) }))
vi.mock('@/lib/db', () => ({ prisma: mocks.prisma }))
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }))

import { acceptStaffInvite } from '@/app/uitnodiging/[token]/actions'

beforeEach(() => {
  mocks.session.save.mockReset()
  mocks.redirect.mockClear()
  mocks.prisma.staffInvite.updateMany.mockReset()
  mocks.prisma.staffInvite.findFirst.mockReset()
  mocks.prisma.staffInvite.deleteMany.mockReset().mockResolvedValue({ count: 0 })
  mocks.prisma.loginPairing.deleteMany.mockReset().mockResolvedValue({ count: 0 })
  mocks.prisma.$transaction.mockReset()
  mocks.prisma.$transaction.mockImplementation((cb: (tx: typeof mocks.prisma) => unknown) =>
    cb(mocks.prisma)
  )
})

describe('acceptStaffInvite', () => {
  it('consumeert de token atomisch en zet een forced-password sessie', async () => {
    mocks.prisma.staffInvite.updateMany.mockResolvedValue({ count: 1 })
    mocks.prisma.staffInvite.findFirst.mockResolvedValue({
      staffId: 'staff-1',
      staff: { name: 'Sandra', role: 'STAFF', isActive: true },
    })

    await expect(acceptStaffInvite('secret-token')).rejects.toThrow('NEXT_REDIRECT')

    expect(mocks.prisma.staffInvite.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
          usedAt: null,
          revokedAt: null,
          expiresAt: expect.any(Object),
        }),
        data: { usedAt: expect.any(Date) },
      })
    )
    expect(mocks.session).toMatchObject({
      staffId: 'staff-1',
      name: 'Sandra',
      role: 'STAFF',
      mustChangePassword: true,
      paired: undefined,
      pairedExpiresAt: undefined,
    })
    expect(mocks.session.save).toHaveBeenCalledOnce()
    expect(mocks.redirect).toHaveBeenCalledWith('/account/wachtwoord')
  })

  it('weigert neutraal wanneer de guarded update niets consumeert', async () => {
    mocks.prisma.staffInvite.updateMany.mockResolvedValue({ count: 0 })
    const result = await acceptStaffInvite('secret-token')
    expect(result.status).toBe(410)
    expect(result.error).toMatch(/uitnodiging/i)
    expect(mocks.session.save).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 6: Run accept action tests and verify RED**

Run: `npm test -- __tests__/app/staff-invite-accept-actions.test.ts`

Expected: FAIL because invite actions do not exist.

- [ ] **Step 7: Implement accept action**

Create `app/uitnodiging/[token]/actions.ts` with:

- `acceptStaffInvite(token: string)`
- best-effort cleanup calls for invites and pairings before the consume transaction
- guarded `updateMany`
- active staff lookup inside the same `$transaction`
- session reset and redirect after the transaction succeeds

Use this shape:

```ts
'use server'

import { redirect } from 'next/navigation'
import { cleanupExpiredPairings } from '@/lib/auth/pairing-cleanup'
import { cleanupExpiredStaffInvites, hashStaffInviteToken } from '@/lib/auth/staff-invites'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export type AcceptInviteState = { error?: string; status?: number }

export async function acceptStaffInvite(token: string): Promise<AcceptInviteState> {
  if (!token) return { error: 'Deze uitnodiging is ongeldig of verlopen.', status: 410 }
  const now = new Date()
  const tokenHash = hashStaffInviteToken(token)

  await Promise.allSettled([
    cleanupExpiredStaffInvites(prisma, now),
    cleanupExpiredPairings(prisma, now),
  ])

  const staff = await prisma.$transaction(async (tx) => {
    const updated = await tx.staffInvite.updateMany({
      where: { tokenHash, usedAt: null, revokedAt: null, expiresAt: { gt: now } },
      data: { usedAt: now },
    })
    if (updated.count !== 1) return null

    const invite = await tx.staffInvite.findFirst({
      where: { tokenHash },
      select: {
        staffId: true,
        staff: { select: { name: true, role: true, isActive: true } },
      },
    })
    if (!invite?.staff?.isActive) return null
    return { id: invite.staffId, name: invite.staff.name, role: invite.staff.role }
  })

  if (!staff) return { error: 'Deze uitnodiging is ongeldig of verlopen.', status: 410 }

  const session = await getSession()
  session.staffId = staff.id
  session.name = staff.name
  session.role = staff.role
  session.mustChangePassword = true
  session.paired = undefined
  session.pairedExpiresAt = undefined
  await session.save()

  redirect('/account/wachtwoord')
}
```

The inactive-staff path intentionally consumes the token and then returns the neutral expired/invalid message. This avoids keeping a live invite for a deactivated account.

- [ ] **Step 8: Write and run page render test**

Create `__tests__/app/staff-invite-accept.test.tsx` to mock Prisma and render the page with:

- invalid token: neutral text and no account details
- valid token: button named `Uitnodiging accepteren`

Run: `npm test -- __tests__/app/staff-invite-accept.test.tsx`

Expected: FAIL before page exists, PASS after creating `app/uitnodiging/[token]/page.tsx`.

Create the page as read-only: query only, no session save, no DB update.

- [ ] **Step 9: Run Task 4 tests and verify GREEN**

Run: `npm test -- __tests__/proxy.test.ts __tests__/app/staff-invite-accept-actions.test.ts __tests__/app/staff-invite-accept.test.tsx`

Expected: PASS.

---

### Task 5: Medewerkersbeheer Invite Creation And Resend Flow

**Files:**
- Modify: `app/medewerkers/actions.ts`
- Modify: `app/medewerkers/nieuwe-medewerker-form.tsx`
- Modify: `app/medewerkers/medewerker-rij-acties.tsx`
- Modify: `app/medewerkers/page.tsx`
- Modify: `app/medewerkers/nieuw/page.tsx`
- Modify: `__tests__/app/medewerkers-actions.test.ts`

- [ ] **Step 1: Update failing action tests**

Modify `__tests__/app/medewerkers-actions.test.ts`:

- Add mocked `staffInvite`, `auditLog`, `sendStaffInviteEmail`, `bcrypt.hash`, `createStaffInviteToken` and `createUnusablePasswordPlaceholder`.
- Remove `password` from every existing `createStaff` test payload except the new "extra password field is rejected" test. This includes the STAFF rolecheck test and the duplicate-email test.
- Delete the old "te kort wachtwoord → 422" test; password length no longer belongs to registration.
- Add assertion that extra `password` field in `.strict()` payload is rejected.
- Add `resendStaffInvite` tests.

Key test cases:

```ts
it('STAFF die createStaff aanroept → 403 (requireAdmin gooit)', async () => {
  requireAdmin.mockRejectedValue(
    Object.assign(new Error('forbidden'), { status: 403 })
  )
  await expect(
    createStaff(
      {},
      formData({ name: 'A', email: 'a@b.nl', role: 'STAFF' })
    )
  ).rejects.toMatchObject({ status: 403 })
  expect(staffMember.create).not.toHaveBeenCalled()
})

it('dubbel e-mailadres → 422', async () => {
  staffMember.create.mockRejectedValue(
    Object.assign(new Error('dup'), { code: 'P2002' })
  )
  const res = await createStaff(
    {},
    formData({ name: 'A', email: 'a@b.nl', role: 'STAFF' })
  )
  expect(res.status).toBe(422)
  expect(res.error).toMatch(/e-mailadres/i)
})

it('geldige createStaff maakt medewerker, invite en mail zonder initieel wachtwoord', async () => {
  staffMember.create.mockResolvedValue({
    id: 'staff-1',
    name: 'Sandra',
    email: 'sandra@example.test',
    role: 'STAFF',
  })
  staffInvite.create.mockResolvedValue({ id: 'invite-1' })

  const res = await createStaff(
    {},
    formData({ name: 'Sandra', email: 'Sandra@Example.Test', role: 'STAFF' })
  )

  expect(res.ok).toBe(true)
  expect(staffMember.create).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({
        email: 'sandra@example.test',
        passwordHash: expect.any(String),
      }),
    })
  )
  expect(staffInvite.create).toHaveBeenCalledOnce()
  expect(sendStaffInviteEmail).toHaveBeenCalledOnce()
})

it('password veld in createStaff payload → 422 zonder create', async () => {
  const res = await createStaff(
    {},
    formData({
      name: 'Sandra',
      email: 'sandra@example.test',
      role: 'STAFF',
      password: 'mag-niet-meer',
    })
  )
  expect(res.status).toBe(422)
  expect(staffMember.create).not.toHaveBeenCalled()
})

it('gebruikt de raw uitnodigingstoken nooit als placeholder-wachtwoord', async () => {
  createStaffInviteToken.mockReturnValueOnce('raw-invite-token')
  createUnusablePasswordPlaceholder.mockReturnValueOnce(
    'independent-password-placeholder'
  )
  hash.mockResolvedValue('hashed-independent-placeholder')
  staffMember.create.mockResolvedValue({
    id: 'staff-1',
    name: 'Sandra',
    email: 'sandra@example.test',
    role: 'STAFF',
  })
  staffInvite.create.mockResolvedValue({ id: 'invite-1' })

  await createStaff(
    {},
    formData({ name: 'Sandra', email: 'sandra@example.test', role: 'STAFF' })
  )

  expect(hash).toHaveBeenCalledWith('independent-password-placeholder', 10)
  expect(hash).not.toHaveBeenCalledWith('raw-invite-token', 10)
  expect(sendStaffInviteEmail).toHaveBeenCalledWith(
    expect.objectContaining({
      inviteUrl: expect.stringContaining('raw-invite-token'),
    })
  )
})

it('resendStaffInvite trekt oudere open invites in en stuurt een nieuwe', async () => {
  staffMember.findUnique.mockResolvedValue({
    id: 'staff-1',
    name: 'Sandra',
    email: 'sandra@example.test',
    role: 'STAFF',
    isActive: true,
  })
  staffInvite.updateMany.mockResolvedValue({ count: 1 })
  staffInvite.create.mockResolvedValue({ id: 'invite-2' })

  const res = await resendStaffInvite({}, formData({ id: 'staff-1' }))

  expect(res.ok).toBe(true)
  expect(staffInvite.updateMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: { staffId: 'staff-1', usedAt: null, revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    })
  )
  expect(sendStaffInviteEmail).toHaveBeenCalledOnce()
})
```

- [ ] **Step 2: Run medewerkers action tests and verify RED**

Run: `npm test -- __tests__/app/medewerkers-actions.test.ts`

Expected: FAIL because actions still require password and resend does not exist.

- [ ] **Step 3: Implement create/resend invite service inside actions**

Update `app/medewerkers/actions.ts`:

- `createSchema` fields: `name`, `email`, `role` only.
- `normalizeStaffEmail` before create/update.
- `createStaff` requires `ADMIN`, cleanup, transaction:
  - call `createStaffInviteToken()` once for the emailed raw invite token
  - call `createUnusablePasswordPlaceholder()` once for the bcrypt placeholder
  - create staff with `bcrypt.hash(createUnusablePasswordPlaceholder(), 10)`
  - never hash the emailed raw invite token as `passwordHash`
  - revoke no invites needed on first create
  - create invite with hashed token and `createdById: session.staffId`
  - write audit `INVITE_CREATED`
- after transaction, call `sendStaffInviteEmail`.
- return `ok: true`; if mail throws, return `ok: false`, `status: 500`, neutral warning.
- `resendStaffInvite` requires `ADMIN`, cleanup, transaction:
  - fetch active staff
  - revoke open invites
  - create new invite
  - audit `INVITE_REVOKED` if any were revoked
  - audit `INVITE_CREATED`
  - send mail after commit

Keep last-admin protection unchanged in `updateStaff` and `deactivateStaff`.

- [ ] **Step 4: Run medewerkers action tests and verify GREEN**

Run: `npm test -- __tests__/app/medewerkers-actions.test.ts`

Expected: PASS.

- [ ] **Step 5: Update medewerker UI**

Modify `app/medewerkers/nieuwe-medewerker-form.tsx`:

- remove `Initieel wachtwoord`
- submit label stays `Toevoegen`
- success text `Uitnodiging verzonden.`

Modify `app/medewerkers/page.tsx` description:

```tsx
description="Beheer wie toegang heeft tot DigiPlein. Je kunt medewerkers uitnodigen, rollen wijzigen, deactiveren en opnieuw een uitnodiging sturen."
```

Modify `app/medewerkers/medewerker-rij-acties.tsx`:

- remove password reset input
- add form/button `Nieuwe uitnodiging sturen`
- keep role toggle and deactivate actions

- [ ] **Step 6: Update render tests**

Update existing UI tests that expect reset-password controls. Assert:

- new employee form has no `Initieel wachtwoord`
- row actions include `Nieuwe uitnodiging sturen`

Run: `npm test -- __tests__/app/medewerkers-actions.test.ts`

Expected: PASS.

---

### Task 6: Forced Password Change Page And Action

**Files:**
- Modify: `app/account/wachtwoord/page.tsx`
- Modify: `app/account/wachtwoord/password-form.tsx`
- Modify: `app/account/wachtwoord/actions.ts`
- Modify: `__tests__/app/account-password-actions.test.ts`
- Modify: `__tests__/app/account-password-page.test.tsx`

- [ ] **Step 1: Write failing forced-password tests**

Extend `__tests__/app/account-password-actions.test.ts`:

```ts
it('forced-password flow vereist geen huidig wachtwoord en ruimt sessievlag op', async () => {
  const session = {
    staffId: 'staff-1',
    role: 'STAFF',
    mustChangePassword: true,
    save: vi.fn(),
  }
  requireStaff.mockResolvedValue(session)
  staffMember.findUnique.mockResolvedValue({ isActive: true, passwordHash: 'old' })

  const res = await changeOwnPassword(
    {},
    validForm({
      currentPassword: '',
      newPassword: 'nieuw-wachtwoord',
      confirmPassword: 'nieuw-wachtwoord',
    })
  )

  expect(res.ok).toBe(true)
  expect(compare).not.toHaveBeenCalled()
  expect(staffMember.update).toHaveBeenCalledWith({
    where: { id: 'staff-1' },
    data: { passwordHash: 'hashed-new' },
  })
  expect(session.mustChangePassword).toBeUndefined()
  expect(session.save).toHaveBeenCalledOnce()
})
```

Extend page test to mock `requireStaff({ allowPasswordChange: true })` and render both modes:

- normal session: shows `Huidig wachtwoord`
- forced session: hides `Huidig wachtwoord`

- [ ] **Step 2: Run account password tests and verify RED**

Run: `npm test -- __tests__/app/account-password-actions.test.ts __tests__/app/account-password-page.test.tsx`

Expected: FAIL because forced mode is not implemented.

- [ ] **Step 3: Implement forced-password action**

Update `app/account/wachtwoord/actions.ts`:

- call `requireStaff({ allowPasswordChange: true })`
- determine `const forced = session.mustChangePassword === true`
- require `currentPassword` only when `!forced`
- skip `bcrypt.compare` when forced
- after successful update:

```ts
if (forced) {
  session.mustChangePassword = undefined
  await session.save?.()
}
```

If TypeScript complains because `SessionData` lacks `save`, type the returned session as `SessionData & { save?: () => Promise<void> }` locally or rely on iron-session return type.

- [ ] **Step 4: Implement forced-password page/form**

Update `app/account/wachtwoord/page.tsx`:

```tsx
const session = await requireStaff({ allowPasswordChange: true })
const forced = session.mustChangePassword === true
```

Pass `forced` to `PasswordForm`.

Update `PasswordForm` signature and wrap only the current-password field:

```tsx
export function PasswordForm({ forced = false }: { forced?: boolean }) {
```

Replace the current-password field block with this conditional block:

```tsx
{!forced ? (
  <div className="flex flex-col gap-1.5">
    <label htmlFor="currentPassword" className="font-medium">
      Huidig wachtwoord
    </label>
    <Input
      id="currentPassword"
      name="currentPassword"
      type="password"
      autoComplete="current-password"
      required
    />
  </div>
) : null}
```

Leave the new-password field, confirm-password field, status messages and submit button exactly as they are. Do not add or trust a hidden `forced` form field; the action must use `session.mustChangePassword`.

- [ ] **Step 5: Run account password tests and verify GREEN**

Run: `npm test -- __tests__/app/account-password-actions.test.ts __tests__/app/account-password-page.test.tsx`

Expected: PASS.

---

### Task 7: Beheer Navigation, Styleguide Gate, And App Shell

**Files:**
- Modify: `components/nav-items.ts`
- Modify: `components/app-shell.tsx`
- Modify: `components/mobile-nav-drawer.tsx`
- Modify: `__tests__/components/nav-items.test.ts`
- Modify: `__tests__/app/app-shell.test.tsx`
- Modify: `app/stijlgids/page.tsx`

- [ ] **Step 1: Write failing nav tests**

Update `__tests__/components/nav-items.test.ts`:

```ts
it('filtert Beheer en children voor STAFF', () => {
  expect(navItemsForRole('STAFF').map((item) => item.label)).toEqual([
    'Start',
    'Cliënten',
    'Vrijwilligers',
    'Cursusaanbod',
    'Account',
  ])
})

it('toont Beheer met Gebruikersbeheer en Audit-log voor ADMIN', () => {
  const beheer = navItemsForRole('ADMIN').find((item) => item.label === 'Beheer')
  expect(beheer?.children?.map((item) => item.label)).toEqual([
    'Gebruikersbeheer',
    'Audit-log',
  ])
})

it('markeert Beheer actief op childroutes', () => {
  const beheer = navItemsForRole('ADMIN').find((item) => item.label === 'Beheer')
  expect(beheer && isActive('/medewerkers/nieuw', beheer)).toBe(true)
  expect(beheer && isActive('/audit', beheer)).toBe(true)
})
```

Replace the old active-route test with:

```ts
it('markeert subroutes actief behalve voor Start', () => {
  expect(isActive('/account/wachtwoord', { href: '/account', label: 'Account' })).toBe(true)
  expect(isActive('/clienten/123', { href: '/clienten', label: 'Cliënten' })).toBe(true)
  expect(isActive('/clienten', { href: '/', label: 'Start' })).toBe(false)
})
```

Update `__tests__/app/app-shell.test.tsx` by replacing the old top-level `Audit-log` assertions with these parent/child assertions:

```tsx
it('ADMIN ziet Beheer als parent met Gebruikersbeheer en Audit-log als child-links', () => {
  render(<AppShell name="Sandra" role="ADMIN" />)

  const desktopNav = screen.getByRole('navigation', { name: 'Hoofdnavigatie' })
  expect(within(desktopNav).getByText('Beheer')).toBeInTheDocument()
  expect(
    within(desktopNav).getByRole('link', { name: 'Gebruikersbeheer' })
  ).toHaveAttribute('href', '/medewerkers')
  expect(
    within(desktopNav).getByRole('link', { name: 'Audit-log' })
  ).toHaveAttribute('href', '/audit')
})

it('STAFF ziet geen Beheer en geen beheer-child-links', () => {
  render(<AppShell name="Bea" role="STAFF" />)

  expect(screen.queryByText('Beheer')).not.toBeInTheDocument()
  expect(
    screen.queryByRole('link', { name: 'Gebruikersbeheer' })
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('link', { name: 'Audit-log' })
  ).not.toBeInTheDocument()
})

it('mobiel toont Beheer met child-links voor ADMIN', () => {
  render(<AppShell name="Sandra" role="ADMIN" />)

  fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
  const drawerNav = screen.getByRole('navigation', { name: 'Mobiel menu' })

  expect(within(drawerNav).getByText('Beheer')).toBeInTheDocument()
  expect(
    within(drawerNav).getByRole('link', { name: 'Gebruikersbeheer' })
  ).toHaveAttribute('href', '/medewerkers')
  expect(
    within(drawerNav).getByRole('link', { name: 'Audit-log' })
  ).toHaveAttribute('href', '/audit')
})
```

- [ ] **Step 2: Run nav tests and verify RED**

Run: `npm test -- __tests__/components/nav-items.test.ts __tests__/app/app-shell.test.tsx`

Expected: FAIL because nav is still flat.

- [ ] **Step 3: Implement nested nav model**

Update `components/nav-items.ts`:

```ts
export type NavItem = {
  href?: string
  label: string
  adminOnly?: boolean
  children?: NavItem[]
}

export const NAV: NavItem[] = [
  { href: '/', label: 'Start' },
  { href: '/clienten', label: 'Cliënten' },
  { href: '/vrijwilligers', label: 'Vrijwilligers' },
  { href: '/cursusaanbod', label: 'Cursusaanbod' },
  { href: '/account', label: 'Account' },
  {
    label: 'Beheer',
    adminOnly: true,
    children: [
      { href: '/medewerkers', label: 'Gebruikersbeheer' },
      { href: '/audit', label: 'Audit-log' },
    ],
  },
]

export function isActive(pathname: string, item: NavItem): boolean {
  if (item.href === '/') return pathname === '/'
  if (item.href && (pathname === item.href || pathname.startsWith(`${item.href}/`))) {
    return true
  }
  return item.children?.some((child) => isActive(pathname, child)) ?? false
}

export function navItemsForRole(role: StaffRole): NavItem[] {
  return NAV.flatMap((item) => filterItemForRole(item, role))
}
```

Add `filterItemForRole` directly below `NAV`:

```ts
function filterItemForRole(item: NavItem, role: StaffRole): NavItem[] {
  if (item.adminOnly && role !== 'ADMIN') return []
  const children = item.children?.flatMap((child) => filterItemForRole(child, role))
  if (children && children.length > 0) return [{ ...item, children }]
  if (!item.href) return []
  return [{ ...item, children: undefined }]
}
```

- [ ] **Step 4: Update app shell renderers**

Update `components/app-shell.tsx`:

- Guard `item.href` before rendering `<Link>`.
- Use `key={item.href ?? item.label}`.
- Render parent label as non-link button-like text when no `href`.
- Render children as second-level links below/next to parent in desktop nav.
- Call `isActive(pathname, item)` for parent and child items; do not call the old `isActive(pathname, item.href)` signature.

Update `components/mobile-nav-drawer.tsx` similarly:

- parent label as text when no href
- children indented as normal links
- close drawer on child click
- Call `isActive(pathname, item)` for parent and child items; do not call the old `isActive(pathname, item.href)` signature.

- [ ] **Step 5: Add `/stijlgids` guard**

Update `app/stijlgids/page.tsx` by adding this import:

```tsx
import { requireStaff } from '@/lib/auth'
```

Then insert this as the first statement inside the existing page component:

```tsx
export default async function StijlgidsPage() {
  await requireStaff()
}
```

- [ ] **Step 6: Run nav/app-shell tests and verify GREEN**

Run: `npm test -- __tests__/components/nav-items.test.ts __tests__/app/app-shell.test.tsx`

Expected: PASS.

---

### Task 8: Final Integration, Prisma Generate, And Full Verification

**Files:**
- Verify every file listed in Tasks 1-7.
- Update tests that currently assert `Audit-log` as a top-level nav link so they assert parent `Beheer` plus child link `Audit-log`.

- [ ] **Step 1: Run Prisma generate**

Run: `npx prisma generate`

Expected: exit 0.

- [ ] **Step 2: Apply migration locally or run migration diff**

Run: `npx prisma migrate dev --name add_staff_invites`

Expected: migration applies cleanly, or Prisma reports the checked-in migration is already applied.

If a local database is not configured, run:

```bash
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script
```

Expected: command exits 0 and emits valid SQL.

- [ ] **Step 3: Run focused test suite**

Run:

```bash
npm test -- \
  __tests__/prisma/staff-invite-schema.test.ts \
  __tests__/lib/env.test.ts \
  __tests__/lib/staff-email.test.ts \
  __tests__/lib/staff-invites.test.ts \
  __tests__/lib/staff-invite-mail.test.ts \
  __tests__/lib/audit.test.ts \
  __tests__/lib/auth.test.ts \
  __tests__/app/login-action.test.ts \
  __tests__/proxy.test.ts \
  __tests__/app/staff-invite-accept-actions.test.ts \
  __tests__/app/staff-invite-accept.test.tsx \
  __tests__/app/medewerkers-actions.test.ts \
  __tests__/app/account-password-actions.test.ts \
  __tests__/app/account-password-page.test.tsx \
  __tests__/components/nav-items.test.ts \
  __tests__/app/app-shell.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Run full verify**

Run: `npm run verify`

Expected: lint, typecheck and tests all PASS.

- [ ] **Step 5: Run production build**

Run: `npm run build`

Expected: build exits 0.

- [ ] **Step 6: Manual UI smoke**

Start the dev server if there is no existing DigiPlein dev server already running:

```bash
npm run dev
```

Manual checks:

- unauth `/uitnodiging/fake-token` shows neutral invalid/expired page, not `/login`
- unauth `/clienten` redirects to `/login`
- ADMIN sees `Beheer` with `Gebruikersbeheer` and `Audit-log` on desktop and mobile drawer
- STAFF does not see `Beheer`
- forced-password session cannot reach `/`, `/clienten`, `/vrijwilligers`, `/cursusaanbod`, `/audit`, `/medewerkers`, or `/stijlgids`; `/account/wachtwoord` and logout remain usable

- [ ] **Step 7: Request final PR review**

After verification passes, send an `s4m-queue` `review_request` to `mac:claude` with:

- summary of changed files
- spec path
- plan path
- verification output for `npm run verify` and `npm run build`
- explicit request for PR-review-style GO/NO-GO

Expected: Claude returns GO or actionable findings. Fix any blockers before final handoff.
