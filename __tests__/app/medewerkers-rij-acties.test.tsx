import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// Mock de server-actions: useActionState heeft alleen een functie nodig, en zo
// blijft deze render-test los van de server-deps van actions.ts.
vi.mock('@/app/medewerkers/actions', () => ({
  deactivateStaff: vi.fn(),
  resendStaffInvite: vi.fn(),
  updateStaff: vi.fn(),
  sendCopilotRegistration: vi.fn(),
}))

import { MedewerkerRijActies } from '@/app/medewerkers/medewerker-rij-acties'

const base = {
  id: 'staff-1',
  name: 'A',
  email: 'a@b.nl',
  role: 'STAFF' as const,
  isActive: true,
  copilotRegistered: false,
}

const knop = { name: 'Copilot-registratie sturen' }

describe('MedewerkerRijActies — copilot-registratieknop', () => {
  it('toont de knop voor een actieve, nog niet aangemelde medewerker', () => {
    render(<MedewerkerRijActies staff={base} />)
    expect(screen.getByRole('button', knop)).toBeInTheDocument()
  })

  it('verbergt de knop als de medewerker al is aangemeld', () => {
    render(<MedewerkerRijActies staff={{ ...base, copilotRegistered: true }} />)
    expect(screen.queryByRole('button', knop)).not.toBeInTheDocument()
  })

  it('verbergt de knop voor een gedeactiveerde medewerker', () => {
    render(<MedewerkerRijActies staff={{ ...base, isActive: false }} />)
    expect(screen.queryByRole('button', knop)).not.toBeInTheDocument()
  })
})
