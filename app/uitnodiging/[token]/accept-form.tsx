'use client'

import { useActionState } from 'react'

import { Button } from '@/components/ui/button'

import type { AcceptStaffInviteState } from './actions'

type AcceptAction = (
  prevState: AcceptStaffInviteState,
  formData: FormData
) => Promise<AcceptStaffInviteState>

const initialState: AcceptStaffInviteState = {}

export function StaffInviteAcceptForm({ action }: { action: AcceptAction }) {
  const [state, formAction, pending] = useActionState(action, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? (
        <p role="alert" className="text-error">
          {state.error}
        </p>
      ) : null}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? 'Bezig…' : 'Doorgaan'}
        </Button>
      </div>
    </form>
  )
}
