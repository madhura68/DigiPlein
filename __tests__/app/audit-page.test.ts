import { describe, it, expect, vi, beforeEach } from 'vitest'

import { buildAuditWhere, isActorType } from '@/app/audit/query'

const mocks = vi.hoisted(() => {
  const client = {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
  }
  const auditLog = { create: vi.fn() }
  return {
    requireStaff: vi.fn(),
    requireAdmin: vi.fn(),
    revalidatePath: vi.fn(),
    redirect: vi.fn(() => {
      throw new Error('NEXT_REDIRECT')
    }),
    client,
    auditLog,
    prisma: { client, auditLog },
  }
})

vi.mock('@/lib/auth', () => ({
  requireStaff: mocks.requireStaff,
  requireAdmin: mocks.requireAdmin,
}))
vi.mock('@/lib/db', () => ({ prisma: mocks.prisma }))
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }))

import { createClient, updateClient, deleteClient } from '@/app/clienten/actions'

const { requireStaff, requireAdmin, client, auditLog } = mocks

function fd(fields: Record<string, string>): FormData {
  const form = new FormData()
  for (const [key, value] of Object.entries(fields)) form.set(key, value)
  return form
}

const EXISTING = {
  id: 'c1',
  firstName: 'Sandra',
  lastName: 'de Vries',
  phone: null,
  email: null,
  learningWish: null,
  assessment: 'NOG_BEPALEN',
  status: 'AANGEMELD',
  oefenenUsername: null,
  consentExtrasAt: null,
  consentExtrasNote: null,
  lastAttendedOn: null,
  notes: null,
}

describe('audit query — buildAuditWhere', () => {
  it('geen params → leeg filter', () => {
    expect(buildAuditWhere({})).toEqual({})
  })

  it('geldig actor-type → filter', () => {
    expect(buildAuditWhere({ actorType: 'STAFF' })).toEqual({ actorType: 'STAFF' })
  })

  it('ongeldig actor-type → genegeerd', () => {
    expect(buildAuditWhere({ actorType: 'ROBOT' })).toEqual({})
  })

  it('entiteit → exact filter; beide samen', () => {
    expect(buildAuditWhere({ entity: 'client' })).toEqual({ entity: 'client' })
    expect(buildAuditWhere({ actorType: 'CHAT_AGENT', entity: 'client' })).toEqual({
      actorType: 'CHAT_AGENT',
      entity: 'client',
    })
  })

  it('isActorType herkent alleen de enum-waarden', () => {
    expect(isActorType('SYSTEM')).toBe(true)
    expect(isActorType('nope')).toBe(false)
    expect(isActorType(undefined)).toBe(false)
  })
})

describe('audit-dekking — elke cliëntmutatie schrijft een logregel (F-06)', () => {
  beforeEach(() => {
    requireStaff.mockReset()
    requireStaff.mockResolvedValue({ staffId: 's1', name: 'Bea', role: 'STAFF' })
    requireAdmin.mockReset()
    requireAdmin.mockResolvedValue({ staffId: 'a1', name: 'Adam', role: 'ADMIN' })
    client.create.mockReset()
    client.create.mockResolvedValue({ id: 'c1' })
    client.update.mockReset()
    client.update.mockResolvedValue({ id: 'c1' })
    client.delete.mockReset()
    client.delete.mockResolvedValue({ id: 'c1' })
    client.findUnique.mockReset()
    client.count.mockReset()
    client.count.mockResolvedValue(0)
    auditLog.create.mockReset()
    auditLog.create.mockResolvedValue({ id: 'al' })
  })

  it('create / veldwijziging / statuswissel / delete → 4 regels met juiste actie', async () => {
    await createClient(
      {},
      fd({ firstName: 'Sandra', assessment: 'NOG_BEPALEN', status: 'AANGEMELD' })
    )

    client.findUnique.mockResolvedValue({ ...EXISTING })
    await updateClient(
      {},
      fd({
        id: 'c1',
        firstName: 'Sandra',
        lastName: 'de Vries',
        assessment: 'NOG_BEPALEN',
        status: 'AANGEMELD',
        phone: '0610000000',
      })
    )

    client.findUnique.mockResolvedValue({ ...EXISTING })
    await updateClient(
      {},
      fd({
        id: 'c1',
        firstName: 'Sandra',
        lastName: 'de Vries',
        assessment: 'NOG_BEPALEN',
        status: 'ACTIEF',
      })
    )

    client.findUnique.mockResolvedValue({ ...EXISTING })
    await expect(
      deleteClient({}, fd({ id: 'c1', confirmName: 'Sandra de Vries' }))
    ).rejects.toThrow('NEXT_REDIRECT')

    const calls = auditLog.create.mock.calls.map((call) => call[0].data)
    expect(calls.map((c) => c.action)).toEqual([
      'CREATE',
      'UPDATE',
      'UPDATE',
      'DELETE',
    ])
    // F-06: logregels bevatten geen gevoelige inhoud (naam, telefoon).
    for (const c of calls) {
      expect(c.summary).not.toContain('Sandra')
      expect(c.summary).not.toContain('Vries')
      expect(c.summary).not.toContain('0610000000')
    }
    // statuswissel-regel benoemt de enum-waarde
    expect(calls[2].summary).toMatch(/ACTIEF/)
  })
})
