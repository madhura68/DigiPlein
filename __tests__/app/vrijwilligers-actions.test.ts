import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => {
  const volunteer = { create: vi.fn(), update: vi.fn(), delete: vi.fn() }
  const rosterEntry = { count: vi.fn() }
  const absence = { count: vi.fn() }
  return {
    requireStaff: vi.fn(),
    revalidatePath: vi.fn(),
    redirect: vi.fn(() => {
      throw new Error('NEXT_REDIRECT')
    }),
    prisma: { volunteer, rosterEntry, absence },
    volunteer,
    rosterEntry,
    absence,
  }
})

vi.mock('@/lib/auth', () => ({ requireStaff: mocks.requireStaff }))
vi.mock('@/lib/db', () => ({ prisma: mocks.prisma }))
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }))

import { createVolunteer, deleteVolunteer } from '@/app/vrijwilligers/actions'

const { requireStaff, volunteer, rosterEntry, absence } = mocks

function fd(fields: Record<string, string>): FormData {
  const form = new FormData()
  for (const [key, value] of Object.entries(fields)) form.set(key, value)
  return form
}

beforeEach(() => {
  requireStaff.mockReset()
  requireStaff.mockResolvedValue({ staffId: '1', role: 'STAFF' })
  volunteer.create.mockReset()
  volunteer.update.mockReset()
  volunteer.delete.mockReset()
  rosterEntry.count.mockReset()
  absence.count.mockReset()
})

describe('vrijwilligers-actions — createVolunteer', () => {
  it('ontbrekende naam → 422 zonder create', async () => {
    const res = await createVolunteer({}, fd({ name: '' }))
    expect(res.status).toBe(422)
    expect(volunteer.create).not.toHaveBeenCalled()
  })

  it('ongeldig NDA-datumformaat → 422', async () => {
    const res = await createVolunteer({}, fd({ name: 'Joke', ndaSignedAt: '11-06-2026' }))
    expect(res.status).toBe(422)
    expect(volunteer.create).not.toHaveBeenCalled()
  })

  it('geldige invoer → create met genormaliseerde data', async () => {
    volunteer.create.mockResolvedValue({ id: '1' })
    const res = await createVolunteer(
      {},
      fd({ name: 'Joke', prefersTuesday: 'on', ndaSignedAt: '2026-06-11' })
    )
    expect(res.ok).toBe(true)
    expect(volunteer.create).toHaveBeenCalledOnce()
    const data = volunteer.create.mock.calls[0][0].data
    expect(data.prefersTuesday).toBe(true)
    expect(data.prefersThursday).toBe(false)
    expect(data.ndaSignedAt).toBeInstanceOf(Date)
    expect(data.email).toBeNull()
  })
})

describe('vrijwilligers-actions — deleteVolunteer (delete-guard)', () => {
  it('met rooster-/historiedata → 422, geen delete', async () => {
    rosterEntry.count.mockResolvedValue(1)
    absence.count.mockResolvedValue(0)
    const res = await deleteVolunteer({}, fd({ id: '1' }))
    expect(res.status).toBe(422)
    expect(volunteer.delete).not.toHaveBeenCalled()
  })

  it('zonder gekoppelde data → delete + redirect', async () => {
    rosterEntry.count.mockResolvedValue(0)
    absence.count.mockResolvedValue(0)
    volunteer.delete.mockResolvedValue({ id: '1' })
    await expect(deleteVolunteer({}, fd({ id: '1' }))).rejects.toThrow('NEXT_REDIRECT')
    expect(volunteer.delete).toHaveBeenCalledOnce()
  })
})
