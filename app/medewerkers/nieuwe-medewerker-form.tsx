'use client'

import { useActionState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createStaff, type MedewerkerActionState } from './actions'

const initialState: MedewerkerActionState = {}

export function NieuweMedewerkerForm() {
  const [state, formAction, pending] = useActionState(createStaff, initialState)

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-card border border-outline-variant p-6"
    >
      <h2 className="text-xl">Nieuwe medewerker</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="font-medium">
            Naam
          </label>
          <Input id="name" name="name" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="font-medium">
            E-mailadres
          </label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="role" className="font-medium">
            Rol
          </label>
          <select
            id="role"
            name="role"
            defaultValue="STAFF"
            className="h-11 rounded-field border border-input bg-background px-4 text-base outline-none focus-visible:border-brand"
          >
            <option value="STAFF">Medewerker</option>
            <option value="ADMIN">Beheerder</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="font-medium">
            Initieel wachtwoord
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
        </div>
      </div>
      {state.error ? (
        <p role="alert" className="text-error">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="font-medium text-success-text">
          Medewerker toegevoegd.
        </p>
      ) : null}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? 'Bezig…' : 'Toevoegen'}
        </Button>
      </div>
    </form>
  )
}
