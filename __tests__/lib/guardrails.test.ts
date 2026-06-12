import { describe, it, expect } from 'vitest'

import { VERBODEN_VELDEN } from '@/lib/avg'
import { checkProposal } from '@/lib/chat/guardrails'

describe('chat-guardrails — harde AVG-weigering', () => {
  it('verboden veld in de omschrijving → geweigerd', () => {
    const decision = checkProposal({
      kind: 'schema_change',
      description: 'Kun je de geboortedatum van cliënten bijhouden?',
    })
    expect(decision.outcome).toBe('refused')
  })

  it('elk verboden veld als nieuw-veld-naam → geweigerd', () => {
    for (const veld of VERBODEN_VELDEN) {
      const decision = checkProposal({
        kind: 'schema_change',
        newField: { name: veld, purpose: 'x', retention: '12 mnd' },
      })
      expect(decision.outcome).toBe('refused')
    }
  })

  it('verbuiging wordt gevangen ("medische gegevens")', () => {
    const decision = checkProposal({
      kind: 'schema_change',
      description: 'Voeg een veld voor medische gegevens toe.',
    })
    expect(decision.outcome).toBe('refused')
  })

  it('toegestaan veld met "adres" erin (e-mailadres) → NIET geweigerd', () => {
    const decision = checkProposal({
      kind: 'ui_change',
      description: 'Toon het e-mailadres in de cliëntenlijst.',
    })
    expect(decision.outcome).toBe('needs_requester_confirmation')
  })

  it('verboden feature (cliënt-login) → geweigerd', () => {
    const decision = checkProposal({
      kind: 'schema_change',
      description: 'Maak een cliënt-login zodat deelnemers zelf kunnen inloggen.',
    })
    expect(decision.outcome).toBe('refused')
  })

  it('export naar externe dienst → geweigerd', () => {
    const decision = checkProposal({
      kind: 'ui_change',
      description: 'Exporteer cliëntdata naar een externe dienst.',
    })
    expect(decision.outcome).toBe('refused')
  })
})

describe('chat-guardrails — capability-trappen', () => {
  it('vraag → toegestaan (elke STAFF)', () => {
    expect(checkProposal({ kind: 'question', description: 'Hoeveel cliënten zijn actief?' })).toEqual({
      outcome: 'allowed',
    })
  })

  it('UI-wijziging → bevestiging aanvrager', () => {
    expect(
      checkProposal({ kind: 'ui_change', description: 'Hernoem de kolom "Status".' })
    ).toEqual({ outcome: 'needs_requester_confirmation' })
  })

  it('schema-wijziging zonder nieuw veld → wacht op ADMIN (geen FG-toets)', () => {
    expect(
      checkProposal({ kind: 'schema_change', description: 'Verhoog het sessiemaximum naar 6.' })
    ).toEqual({ outcome: 'needs_admin_confirmation', fgReviewRequired: false })
  })

  it('nieuw veld mét doel + bewaartermijn → wacht op ADMIN, FG-toets vereist', () => {
    expect(
      checkProposal({
        kind: 'schema_change',
        description: 'Houd bij of een vrijwilliger zelf rijdt.',
        newField: { name: 'rijdtZelf', purpose: 'roosterindeling', retention: '12 maanden' },
      })
    ).toEqual({ outcome: 'needs_admin_confirmation', fgReviewRequired: true })
  })

  it('nieuw veld zonder doel/bewaartermijn → geweigerd', () => {
    const decision = checkProposal({
      kind: 'schema_change',
      newField: { name: 'rijdtZelf' },
    })
    expect(decision.outcome).toBe('refused')
  })
})
