'use client'

import { useActionState } from 'react'

import { AvgNotice } from '@/components/avg-notice'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import type { VrijwilligerActionState } from './actions'

type Initial = {
  id?: string
  name?: string
  email?: string | null
  phone?: string | null
  prefersTuesday?: boolean
  prefersThursday?: boolean
  frequencyNote?: string | null
  ndaSignedAt?: string
  notes?: string | null
}

const initialState: VrijwilligerActionState = {}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="font-medium">
        {label}
      </label>
      {children}
    </div>
  )
}

export function VrijwilligerForm({
  action,
  initial,
  submitLabel,
}: {
  action: (
    prev: VrijwilligerActionState,
    formData: FormData
  ) => Promise<VrijwilligerActionState>
  initial?: Initial
  submitLabel: string
}) {
  const [state, formAction, pending] = useActionState(action, initialState)

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-card border border-outline-variant bg-card p-6"
    >
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Naam" htmlFor="name">
          <Input id="name" name="name" defaultValue={initial?.name ?? ''} required />
        </Field>
        <Field label="E-mailadres" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={initial?.email ?? ''}
          />
        </Field>
        <Field label="Telefoon" htmlFor="phone">
          <Input id="phone" name="phone" defaultValue={initial?.phone ?? ''} />
        </Field>
        <Field
          label="Geheimhoudingsverklaring getekend op"
          htmlFor="ndaSignedAt"
        >
          <Input
            id="ndaSignedAt"
            name="ndaSignedAt"
            type="date"
            defaultValue={initial?.ndaSignedAt ?? ''}
          />
        </Field>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="font-medium">Voorkeursdagen</legend>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2">
            <Checkbox
              name="prefersTuesday"
              defaultChecked={initial?.prefersTuesday}
            />
            Dinsdag
          </label>
          <label className="flex items-center gap-2">
            <Checkbox
              name="prefersThursday"
              defaultChecked={initial?.prefersThursday}
            />
            Donderdag
          </label>
        </div>
      </fieldset>

      <Field label="Frequentie-notitie" htmlFor="frequencyNote">
        <Input
          id="frequencyNote"
          name="frequencyNote"
          defaultValue={initial?.frequencyNote ?? ''}
          placeholder="bv. om de week"
        />
      </Field>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="font-medium">
          Notities
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={initial?.notes ?? ''}
          className="rounded-field border border-input bg-background px-4 py-2 text-base outline-none focus-visible:border-brand"
        />
        <AvgNotice />
      </div>

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
