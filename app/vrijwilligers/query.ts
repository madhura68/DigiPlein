import type { Prisma } from '@prisma/client'

// Pure helpers (los van de server-actions, zodat ze direct testbaar zijn).

export function buildVolunteerWhere(params: {
  q?: string
  filter?: string
}): Prisma.VolunteerWhereInput {
  const where: Prisma.VolunteerWhereInput = {}
  if (params.q) {
    where.name = { contains: params.q, mode: 'insensitive' }
  }
  // Standaardfilter toont alleen actieve vrijwilligers; 'all' toont iedereen.
  if (params.filter !== 'all') {
    where.isActive = true
  }
  return where
}

export function formatVoorkeursdagen(v: {
  prefersTuesday: boolean
  prefersThursday: boolean
}): string {
  if (v.prefersTuesday && v.prefersThursday) return 'di + do'
  if (v.prefersTuesday) return 'di'
  if (v.prefersThursday) return 'do'
  return '—'
}

export function ndaOntbreekt(v: { ndaSignedAt: Date | null }): boolean {
  return v.ndaSignedAt === null
}
