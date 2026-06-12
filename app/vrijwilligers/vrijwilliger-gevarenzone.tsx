'use client'

import { useActionState } from 'react'

import { Button } from '@/components/ui/button'
import {
  deactivateVolunteer,
  deleteVolunteer,
  type VrijwilligerActionState,
} from './actions'

const initialState: VrijwilligerActionState = {}

export function VrijwilligerGevarenzone({
  id,
  isActive,
}: {
  id: string
  isActive: boolean
}) {
  const [deactivateState, deactivateAction, deactivating] = useActionState(
    deactivateVolunteer,
    initialState
  )
  const [deleteState, deleteAction, deleting] = useActionState(
    deleteVolunteer,
    initialState
  )
  const error = deactivateState.error ?? deleteState.error

  return (
    <section className="flex flex-col gap-3 rounded-card border border-outline-variant bg-card p-6">
      <h2 className="text-xl">Beheer</h2>
      <p className="text-sm text-muted-foreground">
        Deactiveren is de standaard. Verwijderen kan alleen als er geen rooster-
        of afwezigheidsdata aan deze vrijwilliger hangt.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        {isActive ? (
          <form action={deactivateAction}>
            <input type="hidden" name="id" value={id} />
            <Button type="submit" variant="secondary" disabled={deactivating}>
              Deactiveren
            </Button>
          </form>
        ) : null}
        <form action={deleteAction}>
          <input type="hidden" name="id" value={id} />
          <Button type="submit" variant="secondary" disabled={deleting}>
            Definitief verwijderen
          </Button>
        </form>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      ) : null}
    </section>
  )
}
