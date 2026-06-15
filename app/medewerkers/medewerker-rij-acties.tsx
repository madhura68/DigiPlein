'use client'

import { useActionState } from 'react'

import { Button } from '@/components/ui/button'
import {
  deactivateStaff,
  resendStaffInvite,
  sendCopilotRegistration,
  updateStaff,
  type MedewerkerActionState,
} from './actions'

const initialState: MedewerkerActionState = {}

type StaffRow = {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'STAFF'
  isActive: boolean
  copilotRegistered: boolean
}

export function MedewerkerRijActies({ staff }: { staff: StaffRow }) {
  const [deactivateState, deactivateAction, deactivating] = useActionState(
    deactivateStaff,
    initialState
  )
  const [inviteState, inviteAction, inviting] = useActionState(
    resendStaffInvite,
    initialState
  )
  const [roleState, roleAction, roleChanging] = useActionState(
    updateStaff,
    initialState
  )
  const [copilotState, copilotAction, copilotSending] = useActionState(
    sendCopilotRegistration,
    initialState
  )

  const error =
    deactivateState.error ??
    roleState.error ??
    inviteState.error ??
    copilotState.error
  const nextRole = staff.role === 'ADMIN' ? 'STAFF' : 'ADMIN'

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {staff.isActive ? (
          <form action={deactivateAction}>
            <input type="hidden" name="id" value={staff.id} />
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              disabled={deactivating}
            >
              Deactiveren
            </Button>
          </form>
        ) : null}
        <form action={roleAction}>
          <input type="hidden" name="id" value={staff.id} />
          <input type="hidden" name="name" value={staff.name} />
          <input type="hidden" name="email" value={staff.email} />
          <input type="hidden" name="role" value={nextRole} />
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            disabled={roleChanging}
          >
            {staff.role === 'ADMIN' ? 'Maak medewerker' : 'Maak beheerder'}
          </Button>
        </form>
      </div>
      <form action={inviteAction}>
        <input type="hidden" name="id" value={staff.id} />
        <Button type="submit" variant="secondary" size="sm" disabled={inviting}>
          Nieuwe uitnodiging sturen
        </Button>
      </form>
      {staff.isActive && !staff.copilotRegistered ? (
        <form action={copilotAction}>
          <input type="hidden" name="id" value={staff.id} />
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            disabled={copilotSending}
          >
            Stuur copilot-registratie
          </Button>
        </form>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      ) : null}
      {inviteState.ok ? (
        <p role="status" className="text-sm text-success-text">
          Uitnodiging verstuurd.
        </p>
      ) : null}
      {copilotState.ok ? (
        <p role="status" className="text-sm text-success-text">
          Aangemeld bij copilot.
        </p>
      ) : null}
    </div>
  )
}
