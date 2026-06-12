'use client'

import { Dialog } from '@base-ui/react/dialog'
import { useActionState, useState } from 'react'

import { deleteClient, type ClientActionState } from '@/app/clienten/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const initialState: ClientActionState = {}

// F-05: definitieve verwijdering achter een naam-overtypen-bevestiging. De knop
// is pas actief als de ingetypte naam exact klopt (client-side UX); de server
// (deleteClient) controleert het nogmaals (de echte poort).
export function ConfirmDeleteDialog({
  id,
  fullName,
}: {
  id: string
  fullName: string
}) {
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState('')
  const [state, formAction, pending] = useActionState(deleteClient, initialState)
  const matches = typed.trim() === fullName.trim()

  return (
    <section className="flex flex-col gap-3 rounded-card border border-outline-variant bg-card p-6">
      <h2 className="text-xl">Definitief verwijderen</h2>
      <p className="text-sm text-muted-foreground">
        Voor een AVG-wisverzoek. Dit verwijdert de cliënt en alle gekoppelde
        gegevens onomkeerbaar.
      </p>
      <div>
        <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
          Cliënt verwijderen…
        </Button>
      </div>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-foreground/40" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 flex w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-card border border-outline-variant bg-card p-6 shadow-lg">
            <Dialog.Title className="text-xl">
              Cliënt definitief verwijderen
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground">
              Typ de volledige naam{' '}
              <span className="font-medium text-foreground">{fullName}</span> om te
              bevestigen. Dit kan niet ongedaan worden gemaakt.
            </Dialog.Description>
            <form action={formAction} className="flex flex-col gap-4">
              <input type="hidden" name="id" value={id} />
              <Input
                name="confirmName"
                aria-label="Naam ter bevestiging"
                value={typed}
                onChange={(event) => setTyped(event.target.value)}
                placeholder={fullName}
                autoComplete="off"
              />
              {state.error ? (
                <p role="alert" className="text-sm text-error">
                  {state.error}
                </p>
              ) : null}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpen(false)}
                >
                  Annuleren
                </Button>
                <Button type="submit" disabled={!matches || pending}>
                  {pending ? 'Bezig…' : 'Definitief verwijderen'}
                </Button>
              </div>
            </form>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  )
}
