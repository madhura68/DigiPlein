import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => {
  const course = { create: vi.fn(), update: vi.fn(), delete: vi.fn() }
  const learningTrack = { count: vi.fn() }
  return {
    requireAdmin: vi.fn(),
    revalidatePath: vi.fn(),
    redirect: vi.fn(() => {
      throw new Error('NEXT_REDIRECT')
    }),
    course,
    learningTrack,
    prisma: { course, learningTrack },
  }
})

vi.mock('@/lib/auth', () => ({ requireAdmin: mocks.requireAdmin }))
vi.mock('@/lib/db', () => ({ prisma: mocks.prisma }))
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }))

import {
  createCourse,
  updateCourse,
  deleteCourse,
  deactivateCourse,
} from '@/app/cursusaanbod/actions'
import { formatLesdagen, formatMaxSessions } from '@/app/cursusaanbod/query'

const { requireAdmin, course, learningTrack } = mocks

function fd(fields: Record<string, string>): FormData {
  const form = new FormData()
  for (const [key, value] of Object.entries(fields)) form.set(key, value)
  return form
}

beforeEach(() => {
  requireAdmin.mockReset()
  requireAdmin.mockResolvedValue({ staffId: 's1', name: 'Adam', role: 'ADMIN' })
  course.create.mockReset()
  course.create.mockResolvedValue({ id: 'c1' })
  course.update.mockReset()
  course.update.mockResolvedValue({ id: 'c1' })
  course.delete.mockReset()
  course.delete.mockResolvedValue({ id: 'c1' })
  learningTrack.count.mockReset()
  learningTrack.count.mockResolvedValue(0)
})

describe('cursusaanbod-actions — autorisatie (ADMIN-only)', () => {
  it('STAFF/niet-ADMIN → mutatie geblokkeerd, geen create', async () => {
    requireAdmin.mockRejectedValue(new Error('403'))
    await expect(createCourse({}, fd({ code: 'X', name: 'X', sessionMinutes: '120' }))).rejects.toThrow()
    expect(course.create).not.toHaveBeenCalled()
  })
})

describe('createCourse', () => {
  it('geldige invoer → create met code + data; lege max. sessies = onbeperkt', async () => {
    const res = await createCourse(
      {},
      fd({ code: 'NIEUW', name: 'Nieuwe cursus', sessionMinutes: '90', onTuesday: 'on' })
    )
    expect(res.ok).toBe(true)
    const data = course.create.mock.calls[0][0].data
    expect(data.code).toBe('NIEUW')
    expect(data.sessionMinutes).toBe(90)
    expect(data.onTuesday).toBe(true)
    expect(data.onThursday).toBe(false)
    expect(data.maxSessions).toBeNull()
  })

  it('dubbele code → 422', async () => {
    course.create.mockRejectedValue({ code: 'P2002' })
    const res = await createCourse(
      {},
      fd({ code: 'KLIK_EN_TIK', name: 'X', sessionMinutes: '120' })
    )
    expect(res.status).toBe(422)
  })

  it('max. sessies = 0 → 422, geen create', async () => {
    const res = await createCourse(
      {},
      fd({ code: 'X', name: 'X', sessionMinutes: '120', maxSessions: '0' })
    )
    expect(res.status).toBe(422)
    expect(course.create).not.toHaveBeenCalled()
  })

  it('max. sessies negatief → 422', async () => {
    const res = await createCourse(
      {},
      fd({ code: 'X', name: 'X', sessionMinutes: '120', maxSessions: '-2' })
    )
    expect(res.status).toBe(422)
  })

  it('max. sessies positief → meegenomen', async () => {
    const res = await createCourse(
      {},
      fd({ code: 'X', name: 'X', sessionMinutes: '120', maxSessions: '6' })
    )
    expect(res.ok).toBe(true)
    expect(course.create.mock.calls[0][0].data.maxSessions).toBe(6)
  })
})

describe('updateCourse — code is onveranderlijk', () => {
  it('payload met code → 422 (code zit niet in update-schema)', async () => {
    const res = await updateCourse(
      {},
      fd({ id: 'c1', name: 'X', sessionMinutes: '120', code: 'HACK' })
    )
    expect(res.status).toBe(422)
    expect(course.update).not.toHaveBeenCalled()
  })

  it('zonder code → update met de bewerkbare velden', async () => {
    const res = await updateCourse(
      {},
      fd({ id: 'c1', name: 'Aangepast', sessionMinutes: '150', onThursday: 'on' })
    )
    expect(res.ok).toBe(true)
    const data = course.update.mock.calls[0][0].data
    expect(data).not.toHaveProperty('code')
    expect(data.name).toBe('Aangepast')
    expect(data.sessionMinutes).toBe(150)
    expect(data.onTuesday).toBe(false)
    expect(data.onThursday).toBe(true)
  })
})

describe('deleteCourse — delete-guard', () => {
  it('met gekoppeld traject → 422, geen delete', async () => {
    learningTrack.count.mockResolvedValue(1)
    const res = await deleteCourse({}, fd({ id: 'c1' }))
    expect(res.status).toBe(422)
    expect(course.delete).not.toHaveBeenCalled()
  })

  it('zonder trajecten → delete + redirect', async () => {
    learningTrack.count.mockResolvedValue(0)
    await expect(deleteCourse({}, fd({ id: 'c1' }))).rejects.toThrow('NEXT_REDIRECT')
    expect(course.delete).toHaveBeenCalledOnce()
  })
})

describe('deactivateCourse', () => {
  it('zet isActive op false', async () => {
    const res = await deactivateCourse({}, fd({ id: 'c1' }))
    expect(res.ok).toBe(true)
    expect(course.update.mock.calls[0][0].data).toEqual({ isActive: false })
  })
})

describe('cursusaanbod query-helpers', () => {
  it('formatLesdagen geeft di/do/beide/—', () => {
    expect(formatLesdagen({ onTuesday: true, onThursday: true })).toBe('di + do')
    expect(formatLesdagen({ onTuesday: true, onThursday: false })).toBe('di')
    expect(formatLesdagen({ onTuesday: false, onThursday: true })).toBe('do')
    expect(formatLesdagen({ onTuesday: false, onThursday: false })).toBe('—')
  })

  it('formatMaxSessions: null = onbeperkt', () => {
    expect(formatMaxSessions(null)).toBe('Onbeperkt')
    expect(formatMaxSessions(4)).toBe('Max. 4')
  })
})
