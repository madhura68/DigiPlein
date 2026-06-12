import { describe, it, expect, vi, beforeEach } from 'vitest'

import { VERBODEN_VELDEN } from '@/lib/avg'

const mocks = vi.hoisted(() => {
  const client = {
    create: vi.fn(),
    update: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
  }
  const auditLog = { create: vi.fn() }
  return {
    requireStaff: vi.fn(),
    revalidatePath: vi.fn(),
    client,
    auditLog,
    prisma: { client, auditLog },
  }
})

vi.mock('@/lib/auth', () => ({ requireStaff: mocks.requireStaff }))
vi.mock('@/lib/db', () => ({ prisma: mocks.prisma }))
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))

import { createClient, updateClient } from '@/app/clienten/actions'

const { requireStaff, client, auditLog } = mocks

function fd(fields: Record<string, string>): FormData {
  const form = new FormData()
  for (const [key, value] of Object.entries(fields)) form.set(key, value)
  return form
}

const VALID = { firstName: 'Sandra', assessment: 'NOG_BEPALEN', status: 'AANGEMELD' }

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

beforeEach(() => {
  requireStaff.mockReset()
  requireStaff.mockResolvedValue({ staffId: 'staff-1', name: 'Bea', role: 'STAFF' })
  client.create.mockReset()
  client.create.mockResolvedValue({ id: 'c1' })
  client.update.mockReset()
  client.update.mockResolvedValue({ id: 'c1' })
  client.findUnique.mockReset()
  client.count.mockReset()
  client.count.mockResolvedValue(0)
  auditLog.create.mockReset()
  auditLog.create.mockResolvedValue({ id: 'a1' })
})

describe('createClient — AVG: verboden velden bestaan niet', () => {
  it.each([...VERBODEN_VELDEN])(
    'weigert verboden veld "%s" met 422 en slaat niets op',
    async (veld) => {
      const res = await createClient({}, fd({ ...VALID, [veld]: 'iets' }))
      expect(res.status).toBe(422)
      expect(client.create).not.toHaveBeenCalled()
      expect(auditLog.create).not.toHaveBeenCalled()
    }
  )
})

describe('createClient', () => {
  it('ontbrekende voornaam → 422, geen create', async () => {
    const res = await createClient(
      {},
      fd({ assessment: 'NOG_BEPALEN', status: 'AANGEMELD' })
    )
    expect(res.status).toBe(422)
    expect(client.create).not.toHaveBeenCalled()
  })

  it('geldige invoer → create + audit-regel (CREATE/client), summary zonder inhoud', async () => {
    const res = await createClient(
      {},
      fd({ ...VALID, lastName: 'de Vries', notes: 'wil videobellen leren' })
    )
    expect(res.ok).toBe(true)
    expect(client.create).toHaveBeenCalledOnce()
    const data = client.create.mock.calls[0][0].data
    expect(data.firstName).toBe('Sandra')
    expect(data.lastName).toBe('de Vries')
    expect(data.notes).toBe('wil videobellen leren')

    expect(auditLog.create).toHaveBeenCalledOnce()
    const audit = auditLog.create.mock.calls[0][0].data
    expect(audit).toMatchObject({
      actorType: 'STAFF',
      actorId: 'staff-1',
      action: 'CREATE',
      entity: 'client',
      entityId: 'c1',
    })
    expect(audit.summary).toBe('Cliënt aangemaakt')
    expect(audit.summary).not.toContain('Sandra')
  })

  it('dubbele naam → ok mét waarschuwing, geen blokkade', async () => {
    client.count.mockResolvedValue(1)
    const res = await createClient({}, fd({ ...VALID }))
    expect(res.ok).toBe(true)
    expect(res.warning).toBeTruthy()
    expect(client.create).toHaveBeenCalledOnce()
  })
})

describe('updateClient — audit bij wijziging', () => {
  it('statuswissel → audit-summary met enum, zonder persoonsgegevens', async () => {
    client.findUnique.mockResolvedValue({ ...EXISTING })
    const res = await updateClient(
      {},
      fd({
        id: 'c1',
        firstName: 'Sandra',
        lastName: 'de Vries',
        assessment: 'NOG_BEPALEN',
        status: 'ACTIEF',
      })
    )
    expect(res.ok).toBe(true)
    expect(client.update).toHaveBeenCalledOnce()
    const summary = auditLog.create.mock.calls[0][0].data.summary
    expect(summary).toMatch(/gewijzigd naar ACTIEF/i)
    expect(summary).not.toContain('Sandra')
  })

  it('notitiewijziging → "notities" in summary, nooit de inhoud', async () => {
    client.findUnique.mockResolvedValue({ ...EXISTING })
    const res = await updateClient(
      {},
      fd({
        id: 'c1',
        firstName: 'Sandra',
        lastName: 'de Vries',
        assessment: 'NOG_BEPALEN',
        status: 'AANGEMELD',
        notes: 'slechtziend, groot lettertype',
      })
    )
    expect(res.ok).toBe(true)
    const summary = auditLog.create.mock.calls[0][0].data.summary
    expect(summary.toLowerCase()).toContain('notities')
    expect(summary).not.toContain('slechtziend')
  })

  it('onbekende cliënt → 404, geen update/audit', async () => {
    client.findUnique.mockResolvedValue(null)
    const res = await updateClient(
      {},
      fd({ id: 'x', firstName: 'A', assessment: 'NOG_BEPALEN', status: 'AANGEMELD' })
    )
    expect(res.status).toBe(404)
    expect(client.update).not.toHaveBeenCalled()
    expect(auditLog.create).not.toHaveBeenCalled()
  })

  it('verboden veld bij update → 422, geen update', async () => {
    const res = await updateClient(
      {},
      fd({
        id: 'c1',
        firstName: 'Sandra',
        assessment: 'NOG_BEPALEN',
        status: 'AANGEMELD',
        bsn: '123456789',
      })
    )
    expect(res.status).toBe(422)
    expect(client.update).not.toHaveBeenCalled()
  })
})
