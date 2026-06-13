'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'

import { Button } from '@/components/ui/button'

type PairingStartResponse = {
  pairingId: string
  expiresAt: string
  qrUrl: string
}

type ViewState = 'idle' | 'starting' | 'showing' | 'expired' | 'claiming'

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

function readStatus(event: MessageEvent<string>) {
  try {
    const data = JSON.parse(event.data) as { status?: string }
    return data.status
  } catch {
    return undefined
  }
}

export function QrLoginButton() {
  const router = useRouter()
  const sourceRef = useRef<EventSource | null>(null)
  const claimInFlightRef = useRef(false)
  const [state, setState] = useState<ViewState>('idle')
  const [pairing, setPairing] = useState<PairingStartResponse | null>(null)
  const [remainingMs, setRemainingMs] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const closeStream = useCallback(() => {
    sourceRef.current?.close()
    sourceRef.current = null
  }, [])

  const expirePairing = useCallback(() => {
    closeStream()
    setState('expired')
  }, [closeStream])

  const claimDesktop = useCallback(async () => {
    if (claimInFlightRef.current) return
    claimInFlightRef.current = true
    closeStream()
    setState('claiming')

    const response = await fetch('/api/auth/pair/claim', { method: 'POST' })
    if (!response.ok) {
      claimInFlightRef.current = false
      setPairing(null)
      setState('idle')
      setError('Kon de desktop niet aanmelden. Start opnieuw.')
      return
    }

    router.push('/')
    router.refresh()
  }, [closeStream, router])

  const handlePairingEvent = useCallback(
    (event: MessageEvent<string>) => {
      const status = readStatus(event)
      if (status === 'approved') {
        void claimDesktop()
        return
      }
      if (status === 'cancelled' || status === 'consumed') {
        closeStream()
        setPairing(null)
        setState('idle')
        setError('Deze QR-login is niet meer beschikbaar. Start opnieuw.')
      }
    },
    [claimDesktop, closeStream]
  )

  const openStream = useCallback(
    (pairingId: string) => {
      closeStream()
      const source = new EventSource(
        `/api/auth/pair/stream/${encodeURIComponent(pairingId)}`
      )
      source.addEventListener('state', handlePairingEvent)
      source.addEventListener('message', handlePairingEvent)
      source.onerror = () => {
        if (pairing && Date.now() >= new Date(pairing.expiresAt).getTime()) {
          expirePairing()
        }
      }
      sourceRef.current = source
    },
    [closeStream, expirePairing, handlePairingEvent, pairing]
  )

  useEffect(() => {
    if (!pairing || state !== 'showing') return
    const timer = window.setInterval(() => {
      const nextRemaining = new Date(pairing.expiresAt).getTime() - Date.now()
      setRemainingMs(Math.max(0, nextRemaining))
      if (nextRemaining <= 0) expirePairing()
    }, 1000)
    return () => window.clearInterval(timer)
  }, [expirePairing, pairing, state])

  useEffect(() => closeStream, [closeStream])

  async function startPairing() {
    closeStream()
    claimInFlightRef.current = false
    setError(null)
    setPairing(null)
    setState('starting')

    try {
      const response = await fetch('/api/auth/pair/start', { method: 'POST' })
      if (!response.ok) throw new Error('pair_start_failed')

      const data = (await response.json()) as PairingStartResponse
      setPairing(data)
      setRemainingMs(
        Math.max(0, new Date(data.expiresAt).getTime() - Date.now())
      )
      setState('showing')
      openStream(data.pairingId)
    } catch {
      setPairing(null)
      setState('idle')
      setError('Kon geen QR-code maken. Probeer opnieuw.')
    }
  }

  const actionLabel =
    state === 'expired' ? 'Nieuwe QR-code' : 'Inloggen via mobiel'

  return (
    <section className="flex flex-col gap-4" aria-labelledby="qr-login-heading">
      <div className="flex flex-col gap-1">
        <h2 id="qr-login-heading" className="text-lg">
          Inloggen via mobiel
        </h2>
        <p className="text-sm text-muted-foreground">
          Scan de QR-code met een mobiel apparaat waarop je al bent ingelogd.
        </p>
      </div>

      {error ? (
        <p className="text-sm font-bold text-error" role="alert">
          {error}
        </p>
      ) : null}

      {state === 'showing' || state === 'claiming' ? (
        <div className="flex flex-col items-center gap-3">
          {pairing ? (
            <div className="rounded-card border border-outline-variant bg-background p-3">
              <QRCodeSVG
                aria-label="QR-code"
                size={180}
                value={pairing.qrUrl}
              />
            </div>
          ) : null}
          <p className="text-sm font-bold">
            {state === 'claiming'
              ? 'Desktop wordt aangemeld...'
              : `Nog ${formatRemaining(remainingMs)}`}
          </p>
        </div>
      ) : null}

      {state === 'expired' ? (
        <p className="text-sm font-bold text-error">QR-code verlopen.</p>
      ) : null}

      {state === 'idle' || state === 'starting' || state === 'expired' ? (
        <Button
          type="button"
          variant={state === 'expired' ? 'secondary' : 'primary'}
          onClick={startPairing}
          disabled={state === 'starting'}
        >
          {state === 'starting' ? 'QR-code maken...' : actionLabel}
        </Button>
      ) : null}
    </section>
  )
}
