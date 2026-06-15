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
  const staffInvite = {
    create: vi.fn(),
    updateMany: vi.fn(),
  }
  return {
    createStaffInviteToken: vi.fn(),
    createUnusablePasswordPlaceholder: vi.fn(),
    hash: vi.fn(),
    hashStaffInviteToken: vi.fn(),
    requireAdmin: vi.fn(),
    revalidatePath: vi.fn(),
    sendStaffInviteMail: vi.fn(),
    staffInvite,
    staffMember,
    staffInviteExpiresAt: vi.fn(),
    writeAuditLog: vi.fn(),
    prisma: { staffInvite, staffMember, $transaction: vi.fn() },
  }
})

vi.mock('bcryptjs', () => ({
  default: { hash: (...args: unknown[]) => mocks.hash(...args) },
}))
vi.mock('@/lib/auth', () => ({ requireAdmin: mocks.requireAdmin }))
vi.mock('@/lib/auth/staff-invites', () => ({
  createStaffInviteToken: mocks.createStaffInviteToken,
  createUnusablePasswordPlaceholder: mocks.createUnusablePasswordPlaceholder,
  hashStaffInviteToken: mocks.hashStaffInviteToken,
  staffInviteExpiresAt: mocks.staffInviteExpiresAt,
}))
vi.mock('@/lib/audit', () => ({
  staffInviteAuditSummary: (event: string) => `summary:${event}`,
  writeAuditLog: mocks.writeAuditLog,
}))
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))
vi.mock('@/lib/db', () => ({ prisma: mocks.prisma }))
vi.mock('@/lib/mail/staff-invite', () => ({
  sendStaffInviteMail: mocks.sendStaffInviteMail,
}))

import {
  createStaff,
  deactivateStaff,
  resendStaffInvite,
  updateStaff,
} from '@/app/medewerkers/actions'

const { requireAdmin, staffInvite, staffMember, prisma } = mocks

function formData(fields: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [key, value] of Object.entries(fields)) fd.set(key, value)
  return fd
}

beforeEach(() => {
  mocks.createStaffInviteToken.mockReset()
  mocks.createStaffInviteToken.mockReturnValue('raw-invite-token')
  mocks.createUnusablePasswordPlaceholder.mockReset()
  mocks.createUnusablePasswordPlaceholder.mockReturnValue('placeholder-password')
  mocks.hash.mockReset()
  mocks.hash.mockImplementation(async (value: string) => `bcrypt:${value}`)
  mocks.hashStaffInviteToken.mockReset()
  mocks.hashStaffInviteToken.mockImplementation((token: string) => `hash:${token}`)
  mocks.sendStaffInviteMail.mockReset()
  mocks.sendStaffInviteMail.mockResolvedValue({ transport: 'noop', skipped: true })
  mocks.staffInviteExpiresAt.mockReset()
  mocks.staffInviteExpiresAt.mockReturnValue(new Date('2026-06-18T10:00:00.000Z'))
  mocks.writeAuditLog.mockReset()
  mocks.writeAuditLog.mockResolvedValue(undefined)
  requireAdmin.mockReset()
  requireAdmin.mockResolvedValue({ staffId: 'admin-1', role: 'ADMIN' })
  staffInvite.create.mockReset()
  staffInvite.updateMany.mockReset()
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
        formData({ name: 'A', email: 'a@b.nl', role: 'STAFF' })
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
      formData({ name: 'A', email: 'a@b.nl', role: 'STAFF' })
    )
    expect(res.status).toBe(422)
    expect(res.error).toMatch(/e-mailadres/i)
  })

  it('weigert een meegestuurd wachtwoordveld zonder create', async () => {
    const res = await createStaff(
      {},
      formData({ name: 'A', email: 'a@b.nl', role: 'STAFF', password: 'mag-niet' })
    )
    expect(res.status).toBe(422)
    expect(res.error).toMatch(/uitnodiging/i)
    expect(staffMember.create).not.toHaveBeenCalled()
  })

  it('geldige invoer → account met placeholder en invite-mail', async () => {
    staffMember.create.mockResolvedValue({
      id: 'staff-1',
      name: 'A',
      email: 'a@b.nl',
      role: 'STAFF',
    })
    staffInvite.create.mockResolvedValue({ id: 'invite-1' })
    const res = await createStaff(
      {},
      formData({ name: 'A', email: '  A@B.NL  ', role: 'STAFF' })
    )
    expect(res.ok).toBe(true)
    expect(mocks.hash).toHaveBeenCalledWith('placeholder-password', 10)
    expect(mocks.hash).not.toHaveBeenCalledWith('raw-invite-token', 10)
    expect(staffMember.create).toHaveBeenCalledWith({
      data: {
        name: 'A',
        email: 'a@b.nl',
        role: 'STAFF',
        passwordHash: 'bcrypt:placeholder-password',
      },
    })
    expect(staffInvite.create).toHaveBeenCalledWith({
      data: {
        tokenHash: 'hash:raw-invite-token',
        staffId: 'staff-1',
        createdById: 'admin-1',
        expiresAt: new Date('2026-06-18T10:00:00.000Z'),
      },
    })
    expect(mocks.sendStaffInviteMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'a@b.nl',
        staffName: 'A',
        token: 'raw-invite-token',
      })
    )
    expect(mocks.writeAuditLog).toHaveBeenCalledWith({
      actorType: 'STAFF',
      actorId: 'admin-1',
      action: 'INVITE_CREATED',
      entity: 'staff_member',
      entityId: 'staff-1',
      summary: 'summary:created',
    })
  })

  it('resend trekt open invites in en mailt een nieuwe uitnodiging', async () => {
    staffMember.findUnique.mockResolvedValue({
      id: 'staff-1',
      name: 'A',
      email: 'a@b.nl',
      role: 'STAFF',
      isActive: true,
    })
    staffInvite.updateMany.mockResolvedValue({ count: 1 })
    staffInvite.create.mockResolvedValue({ id: 'invite-2' })

    const res = await resendStaffInvite({}, formData({ id: 'staff-1' }))

    expect(res.ok).toBe(true)
    expect(staffInvite.updateMany).toHaveBeenCalledWith({
      where: {
        staffId: 'staff-1',
        usedAt: null,
        revokedAt: null,
      },
      data: { revokedAt: expect.any(Date) },
    })
    expect(staffInvite.create).toHaveBeenCalledWith({
      data: {
        tokenHash: 'hash:raw-invite-token',
        staffId: 'staff-1',
        createdById: 'admin-1',
        expiresAt: new Date('2026-06-18T10:00:00.000Z'),
      },
    })
    expect(mocks.sendStaffInviteMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'a@b.nl',
        staffName: 'A',
        token: 'raw-invite-token',
      })
    )
    expect(mocks.writeAuditLog).toHaveBeenNthCalledWith(1, {
      actorType: 'STAFF',
      actorId: 'admin-1',
      action: 'INVITE_REVOKED',
      entity: 'staff_member',
      entityId: 'staff-1',
      summary: 'summary:revoked',
    })
    expect(mocks.writeAuditLog).toHaveBeenNthCalledWith(2, {
      actorType: 'STAFF',
      actorId: 'admin-1',
      action: 'INVITE_RESENT',
      entity: 'staff_member',
      entityId: 'staff-1',
      summary: 'summary:resent',
    })
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
