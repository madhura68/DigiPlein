import type { Prisma } from '@prisma/client'

// Pure helpers (los van de server-actions, zodat ze direct testbaar zijn).

// Standaardfilter verbergt afgeronde/gestopte cliënten; 'all' toont iedereen.
export function buildClientWhere(params: {
  q?: string
  filter?: string
}): Prisma.ClientWhereInput {
  const where: Prisma.ClientWhereInput = {}
  if (params.filter !== 'all') {
    where.status = { notIn: ['AFGEROND', 'GESTOPT'] }
  }
  if (params.q) {
    where.OR = [
      { firstName: { contains: params.q, mode: 'insensitive' } },
      { lastName: { contains: params.q, mode: 'insensitive' } },
    ]
  }
  return where
}

// Privacyvriendelijke weergavenaam voor lijsten: voornaam + initiaal achternaam.
// Het AVG-veldenadvies vraagt het overzicht te minimaliseren; de volledige naam
// staat alleen op het detailscherm waar de medewerker er feitelijk mee werkt.
export function formatClientName(client: {
  firstName: string
  lastName?: string | null
}): string {
  const initial = client.lastName?.trim().charAt(0)
  return initial ? `${client.firstName} ${initial.toUpperCase()}.` : client.firstName
}
