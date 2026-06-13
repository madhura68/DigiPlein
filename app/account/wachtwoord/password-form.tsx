'use client'

import { useActionState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { changeOwnPassword, type ChangePasswordState } from './actions'

const initialState: ChangePasswordState = {}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(
    changeOwnPassword,
    initialState
  )

  return (
    <form
      action={formAction}
      className="flex max-w-xl flex-col gap-4 rounded-card border border-outline-variant bg-card p-6"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="currentPassword" className="font-medium">
          Huidig wachtwoord
        </label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="newPassword" className="font-medium">
          Nieuw wachtwoord
        </label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPassword" className="font-medium">
          Nieuw wachtwoord herhalen
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      {state.error ? (
        <p role="alert" className="text-error">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="font-medium text-success-text">
          Wachtwoord opgeslagen.
        </p>
      ) : null}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? 'Bezig…' : 'Wachtwoord opslaan'}
        </Button>
      </div>
    </form>
  )
}
