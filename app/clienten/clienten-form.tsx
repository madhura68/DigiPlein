'use client'

import { useActionState } from 'react'

import { AvgNotice } from '@/components/avg-notice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CLIENT_STATUS_LABELS, COURSE_ASSESSMENT_LABELS } from '@/lib/enums'

import type { ClientActionState } from './actions'

type Initial = {
  id?: string
  firstName?: string
  lastName?: string | null
  phone?: string | null
  email?: string | null
  learningWish?: string | null
  assessment?: string
  status?: string
  oefenenUsername?: string | null
  consentExtrasAt?: string
  consentExtrasNote?: string | null
  lastAttendedOn?: string
  notes?: string | null
}

const initialState: ClientActionState = {}
const selectClass =
  'h-11 rounded-field border border-input bg-background px-4 text-base outline-none focus-visible:border-brand'

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

export function ClientForm({
  action,
  initial,
  submitLabel,
}: {
  action: (
    prev: ClientActionState,
    formData: FormData
  ) => Promise<ClientActionState>
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
        <Field label="Voornaam" htmlFor="firstName">
          <Input
            id="firstName"
            name="firstName"
            defaultValue={initial?.firstName ?? ''}
            required
          />
        </Field>
        <Field label="Achternaam" htmlFor="lastName">
          <Input id="lastName" name="lastName" defaultValue={initial?.lastName ?? ''} />
        </Field>
        <Field
          label="Telefoon"
          htmlFor="phone"
          hint="Eén contactkanaal volstaat — vraag wat de cliënt zelf gebruikt."
        >
          <Input id="phone" name="phone" defaultValue={initial?.phone ?? ''} />
        </Field>
        <Field label="E-mailadres" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={initial?.email ?? ''}
          />
        </Field>
        <Field label="Lesvorm-inschatting" htmlFor="assessment">
          <select
            id="assessment"
            name="assessment"
            defaultValue={initial?.assessment ?? 'NOG_BEPALEN'}
            className={selectClass}
          >
            {Object.entries(COURSE_ASSESSMENT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status" htmlFor="status">
          <select
            id="status"
            name="status"
            defaultValue={initial?.status ?? 'AANGEMELD'}
            className={selectClass}
          >
            {Object.entries(CLIENT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Oefenen.nl-gebruikersnaam"
          htmlFor="oefenenUsername"
          hint="Pseudoniem — neem geen voortgang uit Oefenen.nl over."
        >
          <Input
            id="oefenenUsername"
            name="oefenenUsername"
            defaultValue={initial?.oefenenUsername ?? ''}
          />
        </Field>
        <Field label="Laatst aanwezig op" htmlFor="lastAttendedOn">
          <Input
            id="lastAttendedOn"
            name="lastAttendedOn"
            type="date"
            defaultValue={initial?.lastAttendedOn ?? ''}
          />
        </Field>
        <Field label="Toestemming extra’s — datum" htmlFor="consentExtrasAt">
          <Input
            id="consentExtrasAt"
            name="consentExtrasAt"
            type="date"
            defaultValue={initial?.consentExtrasAt ?? ''}
          />
        </Field>
        <Field
          label="Toestemming extra’s — wijze"
          htmlFor="consentExtrasNote"
          hint="Wat en hoe is toestemming gegeven (art. 7 AVG)."
        >
          <Input
            id="consentExtrasNote"
            name="consentExtrasNote"
            defaultValue={initial?.consentExtrasNote ?? ''}
            placeholder="bijv. mondeling tijdens intake"
          />
        </Field>
      </div>

      <Field
        label="Leerwens"
        htmlFor="learningWish"
        hint="Formuleer als doel (“wil leren videobellen”), nooit als diagnose of niveau-label."
      >
        <Input
          id="learningWish"
          name="learningWish"
          defaultValue={initial?.learningWish ?? ''}
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
      {state.warning ? (
        <p role="status" className="font-medium text-primary-text">
          {state.warning}
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
