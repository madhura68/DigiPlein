'use client'

import { useActionState } from 'react'

import { Button } from '@/components/ui/button'

import {
  deactivateCourse,
  deleteCourse,
  type CourseActionState,
} from './actions'

const initialState: CourseActionState = {}

export function CursusGevarenzone({
  id,
  isActive,
}: {
  id: string
  isActive: boolean
}) {
  const [deactivateState, deactivateAction, deactivating] = useActionState(
    deactivateCourse,
    initialState
  )
  const [deleteState, deleteAction, deleting] = useActionState(
    deleteCourse,
    initialState
  )
  const error = deactivateState.error ?? deleteState.error

  return (
    <section className="flex flex-col gap-3 rounded-card border border-outline-variant p-6">
      <h2 className="text-xl">Beheer</h2>
      <p className="text-sm text-muted-foreground">
        Deactiveren is de standaard. Verwijderen kan alleen als er geen trajecten
        aan deze cursus gekoppeld zijn.
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
