import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => {
  const client = {
    findUnique: vi.fn(),
    delete: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  }
  const auditLog = { create: vi.fn() }
  return {
    requireAdmin: vi.fn(),
    requireStaff: vi.fn(),
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
  requireAdmin: mocks.requireAdmin,
  requireStaff: mocks.requireStaff,
}))
vi.mock('@/lib/db', () => ({ prisma: mocks.prisma }))
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }))

import { deleteClient } from '@/app/clienten/actions'

const { requireAdmin, client, auditLog } = mocks

function fd(fields: Record<string, string>): FormData {
  const form = new FormData()
  for (const [key, value] of Object.entries(fields)) form.set(key, value)
  return form
}

const EXISTING = { id: 'c1', firstName: 'Sandra', lastName: 'de Vries' }

beforeEach(() => {
  requireAdmin.mockReset()
  requireAdmin.mockResolvedValue({ staffId: 'admin-1', name: 'Adam', role: 'ADMIN' })
  client.findUnique.mockReset()
  client.findUnique.mockResolvedValue({ ...EXISTING })
  client.delete.mockReset()
  client.delete.mockResolvedValue({ id: 'c1' })
  auditLog.create.mockReset()
  auditLog.create.mockResolvedValue({ id: 'a1' })
})

describe('deleteClient (F-05 hard delete)', () => {
  it('niet-ADMIN → geblokkeerd, geen delete', async () => {
    requireAdmin.mockRejectedValue(new Error('403'))
    await expect(
      deleteClient({}, fd({ id: 'c1', confirmName: 'Sandra de Vries' }))
    ).rejects.toThrow()
    expect(client.delete).not.toHaveBeenCalled()
  })

  it('verkeerde naam-bevestiging → 422, geen delete/audit', async () => {
    const res = await deleteClient({}, fd({ id: 'c1', confirmName: 'Sandra' }))
    expect(res.status).toBe(422)
    expect(client.delete).not.toHaveBeenCalled()
    expect(auditLog.create).not.toHaveBeenCalled()
  })

  it('lege naam-bevestiging → 422', async () => {
    const res = await deleteClient({}, fd({ id: 'c1' }))
    expect(res.status).toBe(422)
    expect(client.delete).not.toHaveBeenCalled()
  })

  it('onbekende cliënt → 404', async () => {
    client.findUnique.mockResolvedValue(null)
    const res = await deleteClient(
      {},
      fd({ id: 'x', confirmName: 'Sandra de Vries' })
    )
    expect(res.status).toBe(404)
    expect(client.delete).not.toHaveBeenCalled()
  })

  it('exacte naam → delete + persoonsgegevens-vrije auditregel + redirect', async () => {
    await expect(
      deleteClient({}, fd({ id: 'c1', confirmName: 'Sandra de Vries' }))
    ).rejects.toThrow('NEXT_REDIRECT')
    expect(client.delete).toHaveBeenCalledWith({ where: { id: 'c1' } })

    expect(auditLog.create).toHaveBeenCalledOnce()
    const audit = auditLog.create.mock.calls[0][0].data
    expect(audit).toMatchObject({
      action: 'DELETE',
      entity: 'client',
      entityId: 'c1',
      actorType: 'STAFF',
      actorId: 'admin-1',
    })
    expect(audit.summary).toBe('Cliënt definitief verwijderd')
    // AVG: geen naam in de auditregel
    expect(audit.summary).not.toContain('Sandra')
    expect(audit.summary).not.toContain('Vries')
  })
})
