'use client'

import { useEffect, useState, useTransition } from 'react'

import {
  approvePairing,
  cancelPairing,
  getPairingForApproval,
  type PairingApprovalInfo,
} from '@/actions/pairing'
import { Button } from '@/components/ui/button'

type PairingFragment = {
  pairingId: string
  mobileSecret: string
}

type ViewState =
  | { status: 'checking' }
  | { status: 'invalid'; error: string }
  | {
      status: 'ready'
      input: PairingFragment
      pairing: PairingApprovalInfo
      error?: string
    }
  | { status: 'approved' }
  | { status: 'cancelled' }

function parseFragment(): PairingFragment | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const pairingId = params.get('id')
  const mobileSecret = params.get('s')
  if (!pairingId || !mobileSecret) return null
  return { pairingId, mobileSecret }
}

function clearFragment() {
  window.history.replaceState(null, '', window.location.pathname + window.location.search)
}

function missingFragmentState(): ViewState {
  return {
    status: 'invalid',
    error: 'Scan de QR-code opnieuw. De beveiligde code ontbreekt op dit apparaat.',
  }
}

export function PairConfirmation() {
  const [state, setState] = useState<ViewState>({ status: 'checking' })
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    let active = true
    const input = parseFragment()
    if (!input) {
      queueMicrotask(() => {
        if (active) setState(missingFragmentState())
      })
      return () => {
        active = false
      }
    }

    void getPairingForApproval(input).then((result) => {
      if (!active) return
      if (result.ok) {
        setState({ status: 'ready', input, pairing: result.pairing })
      } else {
        setState({ status: 'invalid', error: result.error })
      }
    })

    return () => {
      active = false
    }
  }, [])

  function approve() {
    if (state.status !== 'ready') return
    const { input, pairing } = state
    startTransition(() => {
      void approvePairing(input).then((result) => {
        if (result.ok) {
          clearFragment()
          setState({ status: 'approved' })
        } else {
          setState({ status: 'ready', input, pairing, error: result.error })
        }
      })
    })
  }

  function cancel() {
    if (state.status !== 'ready') return
    const { input, pairing } = state
    startTransition(() => {
      void cancelPairing(input).then((result) => {
        if (result.ok) {
          clearFragment()
          setState({ status: 'cancelled' })
        } else {
          setState({ status: 'ready', input, pairing, error: result.error })
        }
      })
    })
  }

  if (state.status === 'checking') {
    return (
      <div className="rounded-card border border-outline-variant bg-surface-container p-4">
        <p className="font-bold">QR-code controleren...</p>
      </div>
    )
  }

  if (state.status === 'invalid') {
    return (
      <div className="rounded-card border border-outline-variant bg-surface-container p-4">
        <h2 className="text-lg">QR-code opnieuw scannen</h2>
        <p className="mt-2 text-muted-foreground">{state.error}</p>
      </div>
    )
  }

  if (state.status === 'approved') {
    return (
      <div className="rounded-card border border-outline-variant bg-surface-container p-4">
        <h2 className="text-lg">Klaar</h2>
        <p className="mt-2 text-muted-foreground">
          De desktop kan nu inloggen. Je kunt dit venster sluiten.
        </p>
      </div>
    )
  }

  if (state.status === 'cancelled') {
    return (
      <div className="rounded-card border border-outline-variant bg-surface-container p-4">
        <h2 className="text-lg">Geannuleerd</h2>
        <p className="mt-2 text-muted-foreground">
          De aanvraag is geannuleerd. Start opnieuw op de desktop als dit toch
          klopte.
        </p>
      </div>
    )
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="rounded-card border-2 border-brand bg-primary-container p-4 text-primary-container-foreground">
        <h2 className="text-xl">Desktop-login bevestigen</h2>
        <p className="mt-2 font-bold">
          Bevestig alleen als je deze login zojuist zelf op dit
          desktopapparaat startte.
        </p>
      </div>

      <dl className="grid gap-3 rounded-card border border-outline-variant bg-surface-container p-4">
        <div className="grid gap-1">
          <dt className="text-sm font-bold text-muted-foreground">Browser</dt>
          <dd className="break-words">{state.pairing.desktopUa ?? 'Onbekend'}</dd>
        </div>
        <div className="grid gap-1">
          <dt className="text-sm font-bold text-muted-foreground">IP-adres</dt>
          <dd>{state.pairing.desktopIp ?? 'Onbekend'}</dd>
        </div>
        <div className="grid gap-1">
          <dt className="text-sm font-bold text-muted-foreground">Medewerker</dt>
          <dd>{state.pairing.staffName}</dd>
        </div>
      </dl>

      {state.error ? (
        <p className="rounded-card border border-error bg-background p-3 text-sm font-bold text-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" className="w-full sm:w-auto" onClick={approve} disabled={isPending}>
          Bevestigen
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full sm:w-auto"
          onClick={cancel}
          disabled={isPending}
        >
          Annuleren
        </Button>
      </div>
    </section>
  )
}
