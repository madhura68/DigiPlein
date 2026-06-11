import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.mock-factories worden naar de top gehoist; verwijs daarom naar mocks die
// via vi.hoisted zijn aangemaakt i.p.v. naar gewone top-level consts.
const mocks = vi.hoisted(() => {
  const staffMember = {
    create: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  }
  return {
    requireAdmin: vi.fn(),
    revalidatePath: vi.fn(),
    staffMember,
    prisma: { staffMember, $transaction: vi.fn() },
  }
})

vi.mock('@/lib/auth', () => ({ requireAdmin: mocks.requireAdmin }))
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))
vi.mock('@/lib/db', () => ({ prisma: mocks.prisma }))

import { createStaff, deactivateStaff, updateStaff } from '@/app/medewerkers/actions'

const { requireAdmin, staffMember, prisma } = mocks

function formData(fields: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [key, value] of Object.entries(fields)) fd.set(key, value)
  return fd
}

beforeEach(() => {
  requireAdmin.mockReset()
  requireAdmin.mockResolvedValue({ role: 'ADMIN' })
  staffMember.create.mockReset()
  staffMember.findUnique.mockReset()
  staffMember.count.mockReset()
  staffMember.update.mockReset()
  prisma.$transaction.mockReset()
  prisma.$transaction.mockImplementation((cb: (tx: typeof prisma) => unknown) =>
    cb(prisma)
  )
})

describe('medewerkers-actions — rolcheck', () => {
  it('STAFF die createStaff aanroept → 403 (requireAdmin gooit)', async () => {
    requireAdmin.mockRejectedValue(
      Object.assign(new Error('forbidden'), { status: 403 })
    )
    await expect(
      createStaff(
        {},
        formData({ name: 'A', email: 'a@b.nl', role: 'STAFF', password: 'wachtwoord' })
      )
    ).rejects.toMatchObject({ status: 403 })
    expect(staffMember.create).not.toHaveBeenCalled()
  })
})

describe('medewerkers-actions — createStaff', () => {
  it('dubbel e-mailadres → 422', async () => {
    staffMember.create.mockRejectedValue(
      Object.assign(new Error('dup'), { code: 'P2002' })
    )
    const res = await createStaff(
      {},
      formData({ name: 'A', email: 'a@b.nl', role: 'STAFF', password: 'wachtwoord' })
    )
    expect(res.status).toBe(422)
    expect(res.error).toMatch(/e-mailadres/i)
  })

  it('te kort wachtwoord → 422 zonder create', async () => {
    const res = await createStaff(
      {},
      formData({ name: 'A', email: 'a@b.nl', role: 'STAFF', password: 'kort' })
    )
    expect(res.status).toBe(422)
    expect(staffMember.create).not.toHaveBeenCalled()
  })

  it('geldige invoer → ok', async () => {
    staffMember.create.mockResolvedValue({ id: '1' })
    const res = await createStaff(
      {},
      formData({ name: 'A', email: 'a@b.nl', role: 'STAFF', password: 'wachtwoord' })
    )
    expect(res.ok).toBe(true)
    expect(staffMember.create).toHaveBeenCalledOnce()
  })
})

describe('medewerkers-actions — laatste-admin-bescherming', () => {
  it('laatste actieve beheerder deactiveren → geweigerd (422)', async () => {
    staffMember.findUnique.mockResolvedValue({ id: '1', role: 'ADMIN', isActive: true })
    staffMember.count.mockResolvedValue(1)
    const res = await deactivateStaff({}, formData({ id: '1' }))
    expect(res.status).toBe(422)
    expect(staffMember.update).not.toHaveBeenCalled()
  })

  it('niet-laatste beheerder deactiveren → ok', async () => {
    staffMember.findUnique.mockResolvedValue({ id: '1', role: 'ADMIN', isActive: true })
    staffMember.count.mockResolvedValue(2)
    staffMember.update.mockResolvedValue({ id: '1' })
    const res = await deactivateStaff({}, formData({ id: '1' }))
    expect(res.ok).toBe(true)
    expect(staffMember.update).toHaveBeenCalledOnce()
  })

  it('laatste actieve beheerder degraderen → geweigerd (422)', async () => {
    staffMember.findUnique.mockResolvedValue({ id: '1', role: 'ADMIN', isActive: true })
    staffMember.count.mockResolvedValue(1)
    const res = await updateStaff(
      {},
      formData({ id: '1', name: 'A', email: 'a@b.nl', role: 'STAFF' })
    )
    expect(res.status).toBe(422)
    expect(staffMember.update).not.toHaveBeenCalled()
  })

  it('medewerker promoveren tot beheerder → ok', async () => {
    staffMember.findUnique.mockResolvedValue({ id: '2', role: 'STAFF', isActive: true })
    staffMember.update.mockResolvedValue({ id: '2' })
    const res = await updateStaff(
      {},
      formData({ id: '2', name: 'B', email: 'b@b.nl', role: 'ADMIN' })
    )
    expect(res.ok).toBe(true)
    expect(staffMember.update).toHaveBeenCalledOnce()
  })
})
