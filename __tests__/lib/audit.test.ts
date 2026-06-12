import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => {
  const auditLog = { create: vi.fn() }
  return { auditLog, prisma: { auditLog } }
})

vi.mock('@/lib/db', () => ({ prisma: mocks.prisma }))

import {
  writeAuditLog,
  clientCreatedSummary,
  clientUpdatedSummary,
  logChatChange,
} from '@/lib/audit'

beforeEach(() => {
  mocks.auditLog.create.mockReset()
  mocks.auditLog.create.mockResolvedValue({ id: 'a1' })
})

describe('writeAuditLog', () => {
  it('schrijft één audit_logs-regel met de meegegeven velden', async () => {
    await writeAuditLog({
      actorType: 'STAFF',
      actorId: 's1',
      action: 'CREATE',
      entity: 'client',
      entityId: 'c1',
      summary: 'Cliënt aangemaakt',
    })
    expect(mocks.auditLog.create).toHaveBeenCalledOnce()
    expect(mocks.auditLog.create.mock.calls[0][0].data).toEqual({
      actorType: 'STAFF',
      actorId: 's1',
      action: 'CREATE',
      entity: 'client',
      entityId: 'c1',
      summary: 'Cliënt aangemaakt',
    })
  })

  it('optionele actorId/entityId vallen terug op null', async () => {
    await writeAuditLog({
      actorType: 'SYSTEM',
      action: 'X',
      entity: 'client',
      summary: 's',
    })
    const data = mocks.auditLog.create.mock.calls[0][0].data
    expect(data.actorId).toBeNull()
    expect(data.entityId).toBeNull()
  })
})

describe('clientUpdatedSummary — persoonsgegevens-arm', () => {
  it('statuswissel → enum-waarde, geen inhoud', () => {
    expect(
      clientUpdatedSummary({ changedFields: ['status'], newStatus: 'ACTIEF' })
    ).toBe('Status gewijzigd naar ACTIEF')
  })

  it('notitiewijziging → alleen de veldnaam', () => {
    expect(clientUpdatedSummary({ changedFields: ['notes'] })).toBe(
      'Notities bijgewerkt'
    )
  })

  it('meerdere velden → veldnamen, gecombineerd met de statuswissel', () => {
    expect(
      clientUpdatedSummary({
        changedFields: ['firstName', 'phone', 'status'],
        newStatus: 'INTAKE',
      })
    ).toBe('Status gewijzigd naar INTAKE; voornaam, telefoon bijgewerkt')
  })

  it('lekt nooit veldinhoud: alleen veldnamen, geen namen/diagnoses/nummers', () => {
    const summary = clientUpdatedSummary({ changedFields: ['firstName', 'notes'] })
    expect(summary).toBe('Voornaam, notities bijgewerkt')
    expect(summary).not.toMatch(/Sandra|Parkinson|slechtziend|0612/)
  })

  it('dubbele toestemmingsvelden → één label (geen herhaling)', () => {
    expect(
      clientUpdatedSummary({ changedFields: ['consentExtrasAt', 'consentExtrasNote'] })
    ).toBe('Toestemming extra’s bijgewerkt')
  })

  it('geen wijzigingen → neutrale tekst', () => {
    expect(clientUpdatedSummary({ changedFields: [] })).toBe(
      'Cliënt opgeslagen zonder wijzigingen'
    )
  })
})

describe('clientCreatedSummary', () => {
  it('is een vaste, persoonsgegevens-vrije tekst', () => {
    expect(clientCreatedSummary()).toBe('Cliënt aangemaakt')
  })
})

describe('logChatChange (ST-203 audit-koppeling)', () => {
  it('schrijft een CHAT_AGENT-regel met verzoek-referentie + bevestiger', async () => {
    await logChatChange({
      requestRef: 'req-42',
      summary: 'Sessiemaximum verhoogd naar 6',
      entity: 'course',
      confirmedByStaffId: 'admin-1',
    })
    const data = mocks.auditLog.create.mock.calls[0][0].data
    expect(data.actorType).toBe('CHAT_AGENT')
    expect(data.actorId).toBe('admin-1')
    expect(data.entity).toBe('course')
    expect(data.summary).toContain('Sessiemaximum verhoogd naar 6')
    expect(data.summary).toContain('req-42')
  })

  it('markeert "FG-toets vereist" bij een nieuw persoonsgegevens-veld', async () => {
    await logChatChange({
      requestRef: 'req-7',
      summary: 'Veld "rijdtZelf" toegevoegd',
      fgReviewRequired: true,
    })
    expect(mocks.auditLog.create.mock.calls[0][0].data.summary).toMatch(
      /FG-toets vereist/i
    )
  })

  it('defaults: actorId null, action CHAT_CHANGE, entity schema', async () => {
    await logChatChange({ requestRef: 'r', summary: 's' })
    const data = mocks.auditLog.create.mock.calls[0][0].data
    expect(data.actorId).toBeNull()
    expect(data.action).toBe('CHAT_CHANGE')
    expect(data.entity).toBe('schema')
  })
})
