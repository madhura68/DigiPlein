'use client'

import { useActionState } from 'react'
import { Bot, MailPlus, UserCog, UserX } from 'lucide-react'

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
  const roleLabel = staff.role === 'ADMIN' ? 'Maak medewerker' : 'Maak beheerder'

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        {staff.isActive ? (
          <form action={deactivateAction}>
            <input type="hidden" name="id" value={staff.id} />
            <Button
              type="submit"
              size="icon"
              variant="secondary"
              aria-label="Deactiveren"
              title="Deactiveren"
              disabled={deactivating}
            >
              <UserX />
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
            size="icon"
            variant="secondary"
            aria-label={roleLabel}
            title={roleLabel}
            disabled={roleChanging}
          >
            <UserCog />
          </Button>
        </form>
        <form action={inviteAction}>
          <input type="hidden" name="id" value={staff.id} />
          <Button
            type="submit"
            size="icon"
            variant="secondary"
            aria-label="Uitnodiging sturen"
            title="Uitnodiging sturen"
            disabled={inviting}
          >
            <MailPlus />
          </Button>
        </form>
        {staff.isActive && !staff.copilotRegistered ? (
          <form action={copilotAction}>
            <input type="hidden" name="id" value={staff.id} />
            <Button
              type="submit"
              size="icon"
              variant="secondary"
              aria-label="Copilot-registratie sturen"
              title="Copilot-registratie sturen"
              disabled={copilotSending}
            >
              <Bot />
            </Button>
          </form>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="text-xs text-error">
          {error}
        </p>
      ) : null}
      {inviteState.ok ? (
        <p role="status" className="text-xs text-success-text">
          Uitnodiging verstuurd.
        </p>
      ) : null}
      {copilotState.ok ? (
        <p role="status" className="text-xs text-success-text">
          Aangemeld bij copilot.
        </p>
      ) : null}
    </div>
  )
}
