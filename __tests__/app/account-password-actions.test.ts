import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const staffMember = {
    findUnique: vi.fn(),
    update: vi.fn(),
  }
  return {
    compare: vi.fn(),
    hash: vi.fn(),
    requireStaff: vi.fn(),
    redirect: vi.fn(() => {
      throw new Error('NEXT_REDIRECT')
    }),
    staffMember,
    writeAuditLog: vi.fn(),
    prisma: { staffMember },
  }
})

vi.mock('bcryptjs', () => ({
  default: { compare: mocks.compare, hash: mocks.hash },
}))
vi.mock('@/lib/auth', () => ({ requireStaff: mocks.requireStaff }))
vi.mock('@/lib/audit', () => ({
  staffPasswordSetAuditSummary: () => 'Medewerker heeft wachtwoord ingesteld',
  writeAuditLog: mocks.writeAuditLog,
}))
vi.mock('@/lib/db', () => ({ prisma: mocks.prisma }))
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }))

import { changeOwnPassword } from '@/app/account/wachtwoord/actions'

const { compare, hash, requireStaff, staffMember } = mocks

function fd(fields: Record<string, string>): FormData {
  const form = new FormData()
  for (const [key, value] of Object.entries(fields)) form.set(key, value)
  return form
}

function validForm(overrides: Partial<Record<string, string>> = {}) {
  return fd({
    currentPassword: 'huidig-wachtwoord',
    newPassword: 'nieuw-wachtwoord',
    confirmPassword: 'nieuw-wachtwoord',
    ...overrides,
  })
}

beforeEach(() => {
  compare.mockReset()
  compare.mockResolvedValue(true)
  hash.mockReset()
  hash.mockResolvedValue('hashed-new')
  mocks.writeAuditLog.mockReset()
  mocks.writeAuditLog.mockResolvedValue(undefined)
  mocks.redirect.mockClear()
  requireStaff.mockReset()
  requireStaff.mockResolvedValue({
    staffId: 'staff-1',
    role: 'STAFF',
    save: vi.fn(),
  })
  staffMember.findUnique.mockReset()
  staffMember.findUnique.mockResolvedValue({
    id: 'staff-1',
    isActive: true,
    passwordHash: 'hashed-current',
  })
  staffMember.update.mockReset()
  staffMember.update.mockResolvedValue({ id: 'staff-1' })
})

describe('account wachtwoord action', () => {
  it('vereist een medewerker-sessie', async () => {
    requireStaff.mockRejectedValue(Object.assign(new Error('login'), { digest: 'NEXT_REDIRECT' }))

    await expect(changeOwnPassword({}, validForm())).rejects.toMatchObject({
      digest: 'NEXT_REDIRECT',
    })
    expect(staffMember.findUnique).not.toHaveBeenCalled()
  })

  it('weigert te kort nieuw wachtwoord zonder database-update', async () => {
    const res = await changeOwnPassword(
      {},
      validForm({ newPassword: 'kort', confirmPassword: 'kort' })
    )

    expect(res.status).toBe(422)
    expect(res.error).toMatch(/minimaal 8/i)
    expect(staffMember.update).not.toHaveBeenCalled()
  })

  it('weigert mismatch tussen nieuw wachtwoord en bevestiging', async () => {
    const res = await changeOwnPassword(
      {},
      validForm({ confirmPassword: 'ander-wachtwoord' })
    )

    expect(res.status).toBe(422)
    expect(res.error).toMatch(/overeen/i)
    expect(staffMember.update).not.toHaveBeenCalled()
  })

  it('weigert fout huidig wachtwoord neutraal', async () => {
    compare.mockResolvedValue(false)

    const res = await changeOwnPassword({}, validForm())

    expect(res.status).toBe(401)
    expect(res.error).toBe('Wachtwoord wijzigen is niet gelukt.')
    expect(staffMember.update).not.toHaveBeenCalled()
  })

  it('weigert ontbrekend of gedeactiveerd account neutraal', async () => {
    staffMember.findUnique.mockResolvedValue({ id: 'staff-1', isActive: false })

    const res = await changeOwnPassword({}, validForm())

    expect(res.status).toBe(401)
    expect(res.error).toBe('Wachtwoord wijzigen is niet gelukt.')
    expect(compare).not.toHaveBeenCalled()
    expect(staffMember.update).not.toHaveBeenCalled()
  })

  it('hasht en bewaart het nieuwe wachtwoord bij succes', async () => {
    const res = await changeOwnPassword({}, validForm())

    expect(res.ok).toBe(true)
    expect(requireStaff).toHaveBeenCalledWith({ allowPasswordChange: true })
    expect(compare).toHaveBeenCalledWith('huidig-wachtwoord', 'hashed-current')
    expect(hash).toHaveBeenCalledWith('nieuw-wachtwoord', 10)
    expect(staffMember.update).toHaveBeenCalledWith({
      where: { id: 'staff-1' },
      data: { passwordHash: 'hashed-new' },
    })
  })

  it('forced-password flow wist de sessieflag en stuurt door naar de app', async () => {
    const save = vi.fn()
    const session = {
      staffId: 'staff-1',
      role: 'STAFF',
      mustChangePassword: true,
      save,
    }
    requireStaff.mockResolvedValue(session)

    await expect(
      changeOwnPassword({}, validForm({ currentPassword: '' }))
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(compare).not.toHaveBeenCalled()
    expect(hash).toHaveBeenCalledWith('nieuw-wachtwoord', 10)
    expect(staffMember.update).toHaveBeenCalledWith({
      where: { id: 'staff-1' },
      data: { passwordHash: 'hashed-new' },
    })
    expect(session.mustChangePassword).toBeUndefined()
    expect(save).toHaveBeenCalledOnce()
    expect(mocks.writeAuditLog).toHaveBeenCalledWith({
      actorType: 'STAFF',
      actorId: 'staff-1',
      action: 'PASSWORD_SET',
      entity: 'staff_member',
      entityId: 'staff-1',
      summary: 'Medewerker heeft wachtwoord ingesteld',
    })
    // Audit + sessie-save gebeuren vóór de navigatie naar de app.
    expect(mocks.redirect).toHaveBeenCalledWith('/')
  })

  it('gewone flow stuurt niet door en bevestigt met ok', async () => {
    const res = await changeOwnPassword({}, validForm())

    expect(res.ok).toBe(true)
    expect(mocks.redirect).not.toHaveBeenCalled()
  })

  it('gewone flow blijft een huidig wachtwoord eisen', async () => {
    const res = await changeOwnPassword(
      {},
      validForm({ currentPassword: '' })
    )

    expect(res.status).toBe(422)
    expect(res.error).toMatch(/huidig wachtwoord/i)
    expect(compare).not.toHaveBeenCalled()
    expect(staffMember.update).not.toHaveBeenCalled()
  })
})
