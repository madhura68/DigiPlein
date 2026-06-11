'use client'

import { useActionState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import type { CourseActionState } from './actions'

type Initial = {
  id?: string
  code?: string
  name?: string
  description?: string | null
  maxSessions?: number | null
  sessionMinutes?: number
  onTuesday?: boolean
  onThursday?: boolean
}

const initialState: CourseActionState = {}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="font-medium">
        {label}
      </label>
      {children}
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

export function CursusForm({
  action,
  initial,
  submitLabel,
}: {
  action: (
    prev: CourseActionState,
    formData: FormData
  ) => Promise<CourseActionState>
  initial?: Initial
  submitLabel: string
}) {
  const [state, formAction, pending] = useActionState(action, initialState)
  const isEdit = Boolean(initial?.id)

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-card border border-outline-variant p-6"
    >
      {isEdit ? <input type="hidden" name="id" value={initial?.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {isEdit ? (
          <Field label="Code" htmlFor="code-readonly" hint="Onveranderlijk na aanmaak.">
            <p
              id="code-readonly"
              className="flex h-11 items-center text-base text-muted-foreground"
            >
              {initial?.code}
            </p>
          </Field>
        ) : (
          <Field
            label="Code"
            htmlFor="code"
            hint="Uniek en onveranderlijk na aanmaak (bijv. KLIK_EN_TIK)."
          >
            <Input id="code" name="code" defaultValue={initial?.code ?? ''} required />
          </Field>
        )}
        <Field label="Naam" htmlFor="name">
          <Input id="name" name="name" defaultValue={initial?.name ?? ''} required />
        </Field>
        <Field label="Max. sessies" htmlFor="maxSessions" hint="Leeg = onbeperkt.">
          <Input
            id="maxSessions"
            name="maxSessions"
            type="number"
            min={1}
            defaultValue={initial?.maxSessions ?? ''}
          />
        </Field>
        <Field label="Sessieduur (minuten)" htmlFor="sessionMinutes">
          <Input
            id="sessionMinutes"
            name="sessionMinutes"
            type="number"
            min={1}
            defaultValue={initial?.sessionMinutes ?? 120}
          />
        </Field>
      </div>

      <Field label="Beschrijving" htmlFor="description">
        <textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={initial?.description ?? ''}
          className="rounded-field border border-input bg-background px-4 py-2 text-base outline-none focus-visible:border-brand"
        />
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="font-medium">Lesdagen</legend>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="onTuesday"
              defaultChecked={initial?.onTuesday ?? true}
            />
            Dinsdag
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="onThursday"
              defaultChecked={initial?.onThursday ?? true}
            />
            Donderdag
          </label>
        </div>
      </fieldset>

      {state.error ? (
        <p role="alert" className="text-error">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="font-medium text-success-text">
          Opgeslagen.
        </p>
      ) : null}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? 'Bezig…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
