import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

const mocks = vi.hoisted(() => ({
  requireStaff: vi.fn(),
  getPairingForApproval: vi.fn(),
  approvePairing: vi.fn(),
  cancelPairing: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ requireStaff: mocks.requireStaff }))
vi.mock('@/actions/pairing', () => ({
  getPairingForApproval: mocks.getPairingForApproval,
  approvePairing: mocks.approvePairing,
  cancelPairing: mocks.cancelPairing,
}))

import PairPage from '@/app/m/pair/page'
import { PairConfirmation } from '@/app/m/pair/pair-confirmation'

const MOBILE_SECRET = 'm'.repeat(43)
const HASH = `#id=pair-1&s=${MOBILE_SECRET}`

function setUrl(hash = '') {
  window.history.replaceState(null, '', `/m/pair${hash}`)
}

beforeEach(() => {
  setUrl()
  mocks.requireStaff.mockReset()
  mocks.requireStaff.mockResolvedValue({
    staffId: 'staff-1',
    name: 'Bea van Dijk',
    role: 'STAFF',
  })
  mocks.getPairingForApproval.mockReset()
  mocks.getPairingForApproval.mockResolvedValue({
    ok: true,
    pairing: {
      id: 'pair-1',
      desktopUa: 'Chrome op macOS',
      desktopIp: '198.51.100.25',
      staffName: 'Bea van Dijk',
    },
  })
  mocks.approvePairing.mockReset()
  mocks.approvePairing.mockResolvedValue({ ok: true })
  mocks.cancelPairing.mockReset()
  mocks.cancelPairing.mockResolvedValue({ ok: true })
})

describe('/m/pair pagina', () => {
  it('vereist een bestaande staff-sessie voordat de mobiele bevestiging rendert', async () => {
    const page = await PairPage()

    expect(mocks.requireStaff).toHaveBeenCalledOnce()
    render(page)
    expect(
      screen.getByRole('heading', { name: 'Mobiele login bevestigen' })
    ).toBeInTheDocument()
  })
})

describe('PairConfirmation', () => {
  it('weigert een ontbrekend URL-fragment zonder secret naar de server te sturen', async () => {
    render(<PairConfirmation />)

    expect(
      await screen.findByText(/scan de qr-code opnieuw/i)
    ).toBeInTheDocument()
    expect(mocks.getPairingForApproval).not.toHaveBeenCalled()
  })

  it('toont browser, IP-adres en anti-phishingtekst voor bevestigen', async () => {
    setUrl(HASH)

    render(<PairConfirmation />)

    expect(
      await screen.findByRole('heading', { name: 'Desktop-login bevestigen' })
    ).toBeInTheDocument()
    expect(screen.getByText('Chrome op macOS')).toBeInTheDocument()
    expect(screen.getByText('198.51.100.25')).toBeInTheDocument()
    expect(
      screen.getByText(
        /bevestig alleen als je deze login zojuist zelf op dit desktopapparaat startte/i
      )
    ).toBeInTheDocument()
  })

  it('bevestigt met de fragment-secret, wist de hash en toont de klaarstaat', async () => {
    setUrl(HASH)
    render(<PairConfirmation />)

    fireEvent.click(await screen.findByRole('button', { name: /bevestigen/i }))

    await waitFor(() => {
      expect(mocks.approvePairing).toHaveBeenCalledWith({
        pairingId: 'pair-1',
        mobileSecret: MOBILE_SECRET,
      })
    })
    expect(await screen.findByText(/desktop kan nu inloggen/i)).toBeInTheDocument()
    expect(window.location.hash).toBe('')
  })

  it('annuleert met de fragment-secret, wist de hash en toont de geannuleerdstaat', async () => {
    setUrl(HASH)
    render(<PairConfirmation />)

    fireEvent.click(await screen.findByRole('button', { name: /annuleren/i }))

    await waitFor(() => {
      expect(mocks.cancelPairing).toHaveBeenCalledWith({
        pairingId: 'pair-1',
        mobileSecret: MOBILE_SECRET,
      })
    })
    expect(await screen.findByText(/aanvraag is geannuleerd/i)).toBeInTheDocument()
    expect(window.location.hash).toBe('')
  })
})
