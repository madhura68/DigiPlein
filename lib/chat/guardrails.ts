import { VERBODEN_FEATURE_TERMEN, VERBODEN_VELDEN } from '@/lib/avg'

// Code-side AVG-guardrail (mvp-spec §10): bindend en niet overschrijfbaar via chat,
// óók voor een nieuwe agent-versie. De agent classificeert het verzoek (`kind`); de
// app beslist hier of het mag, bevestiging nodig heeft, of geweigerd wordt. ST-203
// koppelt de uitkomst aan het audit-log; de uitvoering zelf loopt via het externe
// component (A3).

export type ChatProposal = {
  // Capability-trap (contract §10.2): vraag → elke STAFF; ui-wijziging → bevestiging
  // aanvrager; schema-/gedragwijziging → ADMIN-bevestiging.
  kind: 'question' | 'ui_change' | 'schema_change'
  description?: string
  // Bij een voorgesteld nieuw veld: doel + bewaartermijn zijn verplicht (§10).
  newField?: { name: string; purpose?: string; retention?: string }
}

export type GuardrailDecision =
  | { outcome: 'allowed' }
  | { outcome: 'needs_requester_confirmation' }
  | { outcome: 'needs_admin_confirmation'; fgReviewRequired: boolean }
  | { outcome: 'refused'; reason: string }

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

// Prefix-match op woordgrens: vangt verbuigingen ('medisch' → 'medische',
// 'gezondheid' → 'gezondheidsgegevens') zonder vals-positief op toegestane velden
// ('adres' zit niet op een woordgrens in 'e-mailadres').
function forbiddenFieldHit(text: string): string | null {
  const haystack = normalize(text)
  for (const veld of VERBODEN_VELDEN) {
    if (new RegExp(`\\b${normalize(veld)}`).test(haystack)) return veld
  }
  return null
}

function forbiddenFeatureHit(text: string): string | null {
  const haystack = normalize(text)
  for (const term of VERBODEN_FEATURE_TERMEN) {
    if (haystack.includes(normalize(term))) return term
  }
  return null
}

export function checkProposal(proposal: ChatProposal): GuardrailDecision {
  const haystack = [proposal.description ?? '', proposal.newField?.name ?? '']
    .join(' ')
    .trim()

  // 1. Harde AVG-weigering — gaat vóór alles, ook vóór de capability-trap.
  const veld = forbiddenFieldHit(haystack)
  if (veld) {
    return {
      outcome: 'refused',
      reason: `Verzoek strijdig met het veldenmodel (AVG): "${veld}" mag niet worden vastgelegd. Zie product-spec §6.1.`,
    }
  }
  const feature = forbiddenFeatureHit(haystack)
  if (feature) {
    return {
      outcome: 'refused',
      reason: `Verzoek strijdig met de AVG-guardrails: "${feature}" is niet toegestaan.`,
    }
  }

  // 2. Capability-trappen.
  if (proposal.kind === 'question') return { outcome: 'allowed' }
  if (proposal.kind === 'ui_change') {
    return { outcome: 'needs_requester_confirmation' }
  }

  // schema_change: altijd ADMIN-bevestiging vóór uitvoering.
  if (proposal.newField) {
    // Nieuw veld → doel + bewaartermijn verplicht; gemarkeerd als FG-toets vereist.
    const hasPurpose = Boolean(proposal.newField.purpose?.trim())
    const hasRetention = Boolean(proposal.newField.retention?.trim())
    if (!hasPurpose || !hasRetention) {
      return {
        outcome: 'refused',
        reason:
          'Een nieuw veld vereist een doelomschrijving én een bewaartermijn in het verzoek (AVG).',
      }
    }
    return { outcome: 'needs_admin_confirmation', fgReviewRequired: true }
  }
  return { outcome: 'needs_admin_confirmation', fgReviewRequired: false }
}
