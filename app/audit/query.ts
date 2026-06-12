import type { ActorType, Prisma } from '@prisma/client'

// Pure helper (los van de page, direct testbaar).

export function isActorType(value: string | undefined): value is ActorType {
  return value === 'STAFF' || value === 'CHAT_AGENT' || value === 'SYSTEM'
}

// Filter op actor-type en entiteit (F-06). Onbekende actor-type-waarden worden
// genegeerd i.p.v. te crashen; lege entiteit = geen filter.
export function buildAuditWhere(params: {
  actorType?: string
  entity?: string
}): Prisma.AuditLogWhereInput {
  const where: Prisma.AuditLogWhereInput = {}
  if (isActorType(params.actorType)) where.actorType = params.actorType
  if (params.entity) where.entity = params.entity
  return where
}
