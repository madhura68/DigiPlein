import type { ActorType, ClientStatus } from '@prisma/client'

import { prisma } from '@/lib/db'

// Centraal audit-schrijfpad (plan ST-103). writeAuditLog is de enige plek die
// audit_logs vult; de summary-builders hieronder zijn de enige plek die summaries
// vormen. AVG-conventie: een summary bevat NOOIT veldinhoud (geen namen, notities,
// contactgegevens) — alleen veldnamen en enum-waarden. Zo kan er via de audit-log
// geen persoonsgegeven lekken. ST-106 hardt deze conventie verder uit en levert de
// inzage-UI.

export type AuditInput = {
  actorType: ActorType
  actorId?: string | null
  action: string
  entity: string
  entityId?: string | null
  summary: string
}

export async function writeAuditLog(input: AuditInput): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorType: input.actorType,
      actorId: input.actorId ?? null,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? null,
      summary: input.summary,
    },
  })
}

// Veld-keys → audit-labels. Bewust alleen Nederlandse veldnámen, nooit -inhoud.
const CLIENT_FIELD_AUDIT_LABELS: Record<string, string> = {
  firstName: 'voornaam',
  lastName: 'achternaam',
  phone: 'telefoon',
  email: 'e-mail',
  learningWish: 'leerwens',
  assessment: 'lesvorm-inschatting',
  oefenenUsername: 'oefenen.nl-gebruikersnaam',
  consentExtrasAt: 'toestemming extra’s',
  consentExtrasNote: 'toestemming extra’s',
  lastAttendedOn: 'laatst aanwezig',
  notes: 'notities',
}

export function clientCreatedSummary(): string {
  return 'Cliënt aangemaakt'
}

export type StaffInviteAuditEvent = 'created' | 'resent' | 'accepted' | 'revoked'

export function staffInviteAuditSummary(event: StaffInviteAuditEvent): string {
  const summaries: Record<StaffInviteAuditEvent, string> = {
    created: 'Medewerkeruitnodiging aangemaakt',
    resent: 'Medewerkeruitnodiging opnieuw verstuurd',
    accepted: 'Medewerkeruitnodiging geaccepteerd',
    revoked: 'Medewerkeruitnodiging ingetrokken',
  }

  return summaries[event]
}

export function staffPasswordSetAuditSummary(): string {
  return 'Medewerker heeft wachtwoord ingesteld'
}

export function staffCopilotRegistrationAuditSummary(): string {
  return 'Copilot-registratie verstuurd'
}

export function clientUpdatedSummary(change: {
  changedFields: readonly string[]
  newStatus?: ClientStatus
}): string {
  const parts: string[] = []
  // Status apart: de nieuwe enum-waarde is geen persoonsgegeven en mag mee.
  if (change.newStatus) parts.push(`status gewijzigd naar ${change.newStatus}`)
  const labels = Array.from(
    new Set(
      change.changedFields
        .filter((field) => field !== 'status')
        .map((field) => CLIENT_FIELD_AUDIT_LABELS[field] ?? field)
    )
  )
  if (labels.length > 0) parts.push(`${labels.join(', ')} bijgewerkt`)
  if (parts.length === 0) return 'Cliënt opgeslagen zonder wijzigingen'
  const text = parts.join('; ')
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// ST-203 — audit-koppeling voor chat-geïnitieerde wijzigingen (§10.4). Schrijft een
// CHAT_AGENT-regel met een verwijzing naar het chatverzoek en, bij een nieuw veld,
// de "FG-toets vereist"-markering (uit checkProposal().fgReviewRequired). De
// uitvoering zelf — migratie + code via het deploy-pad — loopt via het externe
// component (A3); dit is het schrijfpad dat het daarbij aanroept. De aangeleverde
// `summary` hoort persoonsgegevens-arm te zijn (een schema-/UI-wijziging, geen data).
export type ChatChangeAudit = {
  requestRef: string
  summary: string
  action?: string
  entity?: string
  entityId?: string | null
  fgReviewRequired?: boolean
  confirmedByStaffId?: string | null
}

export async function logChatChange(change: ChatChangeAudit): Promise<void> {
  const marked = change.fgReviewRequired
    ? `${change.summary} — FG-toets vereist`
    : change.summary
  await writeAuditLog({
    actorType: 'CHAT_AGENT',
    actorId: change.confirmedByStaffId ?? null,
    action: change.action ?? 'CHAT_CHANGE',
    entity: change.entity ?? 'schema',
    entityId: change.entityId ?? null,
    summary: `${marked} (verzoek: ${change.requestRef})`,
  })
}
