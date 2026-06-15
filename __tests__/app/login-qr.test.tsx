import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}))

vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ value }: { value: string }) => (
    <svg aria-label="QR-code" data-value={value} role="img" />
  ),
}))

import LoginPage from '@/app/login/page'
import { QrLoginButton } from '@/app/login/qr-login-button'

const FIXED_NOW = new Date('2026-06-13T10:00:00.000Z')

function startBody(expiresAt = new Date(Date.now() + 300_000).toISOString()) {
  return {
    pairingId: 'pair-1',
    expiresAt,
    qrUrl: `http://localhost:3000/m/pair#id=pair-1&s=${'m'.repeat(43)}`,
  }
}

type Listener = (event: MessageEvent<string>) => void

class FakeEventSource {
  static instances: FakeEventSource[] = []
  listeners = new Map<string, Listener[]>()
  close = vi.fn()

  constructor(readonly url: string) {
    FakeEventSource.instances.push(this)
  }

  addEventListener(type: string, listener: Listener) {
    const listeners = this.listeners.get(type) ?? []
    listeners.push(listener)
    this.listeners.set(type, listeners)
  }

  emit(type: string, data: unknown) {
    const event = new MessageEvent(type, { data: JSON.stringify(data) })
    for (const listener of this.listeners.get(type) ?? []) listener(event)
  }
}

function response(ok: boolean, body: unknown = {}): Response {
  return { ok, json: vi.fn().mockResolvedValue(body) } as unknown as Response
}

beforeEach(() => {
  FakeEventSource.instances = []
  vi.stubGlobal('EventSource', FakeEventSource)
  vi.stubGlobal('fetch', vi.fn())
  mocks.push.mockReset()
  mocks.refresh.mockReset()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('/login met QR-login', () => {
  it('behoudt e-mail/wachtwoord-login en toont een optionele mobiele login', () => {
    render(<LoginPage />)

    expect(screen.getByLabelText('E-mailadres')).toBeInTheDocument()
    expect(screen.getByLabelText('Wachtwoord')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Inloggen' })).toBeInTheDocument()
    expect(screen.getByText('of')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /inloggen via mobiel/i })
    ).toBeInTheDocument()
  })
})

describe('QrLoginButton', () => {
  it('start een pairing, toont de QR-code en opent de statusstream', async () => {
    const body = startBody()
    vi.mocked(fetch).mockResolvedValueOnce(response(true, body))

    render(<QrLoginButton />)

    fireEvent.click(screen.getByRole('button', { name: /inloggen via mobiel/i }))

    expect(await screen.findByRole('img', { name: 'QR-code' })).toHaveAttribute(
      'data-value',
      body.qrUrl
    )
    expect(screen.getByText(/Nog \d:\d{2}/)).toBeInTheDocument()
    expect(FakeEventSource.instances[0]?.url).toBe(
      '/api/auth/pair/stream/pair-1'
    )
  })

  it('claimt de desktop na approved state-event en navigeert naar de app', async () => {
    const body = startBody()
    vi.mocked(fetch)
      .mockResolvedValueOnce(response(true, body))
      .mockResolvedValueOnce(response(true))

    render(<QrLoginButton />)
    fireEvent.click(screen.getByRole('button', { name: /inloggen via mobiel/i }))
    await screen.findByRole('img', { name: 'QR-code' })

    FakeEventSource.instances[0].emit('state', { status: 'approved' })

    await waitFor(() => {
      expect(fetch).toHaveBeenLastCalledWith('/api/auth/pair/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pairingId: 'pair-1' }),
      })
    })
    expect(FakeEventSource.instances[0].close).toHaveBeenCalledOnce()
    expect(mocks.push).toHaveBeenCalledWith('/')
    expect(mocks.refresh).toHaveBeenCalledOnce()
  })

  it('valt terug naar idle met foutmelding als claimen mislukt', async () => {
    const body = startBody()
    vi.mocked(fetch)
      .mockResolvedValueOnce(response(true, body))
      .mockResolvedValueOnce(response(false))

    render(<QrLoginButton />)
    fireEvent.click(screen.getByRole('button', { name: /inloggen via mobiel/i }))
    await screen.findByRole('img', { name: 'QR-code' })

    FakeEventSource.instances[0].emit('message', { status: 'approved' })

    expect(
      await screen.findByText(/kon de desktop niet aanmelden/i)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /inloggen via mobiel/i })
    ).toBeInTheDocument()
  })

  it('toont verlopen state en laat een nieuwe QR-code starten', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_NOW)
    const body = startBody(
      new Date('2026-06-13T10:05:00.000Z').toISOString()
    )
    vi.mocked(fetch).mockResolvedValueOnce(response(true, body))

    render(<QrLoginButton />)
    fireEvent.click(screen.getByRole('button', { name: /inloggen via mobiel/i }))
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })
    expect(screen.getByRole('img', { name: 'QR-code' })).toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(301_000)
    })

    expect(screen.getByText(/QR-code verlopen/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /nieuwe QR-code/i })
    ).toBeInTheDocument()
    expect(FakeEventSource.instances[0].close).toHaveBeenCalledOnce()
  })
})
