import { PageHeader } from '@/components/page-header'
import { hashStaffInviteToken } from '@/lib/auth/staff-invites'
import { prisma } from '@/lib/db'

import { StaffInviteAcceptForm } from './accept-form'
import { acceptStaffInvite } from './actions'

type InviteForPage = {
  expiresAt: Date
  usedAt: Date | null
  revokedAt: Date | null
  staff: { isActive: boolean }
}

function isOpenInvite(invite: InviteForPage | null, now = new Date()): boolean {
  return Boolean(
    invite &&
      invite.staff.isActive &&
      !invite.usedAt &&
      !invite.revokedAt &&
      invite.expiresAt > now
  )
}

async function findInviteForPage(token: string): Promise<InviteForPage | null> {
  return prisma.staffInvite.findUnique({
    where: { tokenHash: hashStaffInviteToken(token) },
    select: {
      expiresAt: true,
      usedAt: true,
      revokedAt: true,
      staff: { select: { isActive: true } },
    },
  })
}

export default async function StaffInvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const invite = await findInviteForPage(token)

  if (!isOpenInvite(invite)) {
    return (
      <main id="main-content" className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-6 px-6 py-10">
        <PageHeader
          title="Uitnodiging niet beschikbaar"
          description="Deze uitnodiging is ongeldig of verlopen. Vraag een beheerder om een nieuwe uitnodiging."
        />
      </main>
    )
  }

  const acceptAction = async (
    _prevState: Awaited<ReturnType<typeof acceptStaffInvite>>,
    _formData: FormData
  ) => {
    'use server'
    return acceptStaffInvite(token)
  }

  return (
    <main id="main-content" className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-6 px-6 py-10">
      <PageHeader
        title="Uitnodiging accepteren"
        description="Je stelt je wachtwoord in na het accepteren van deze uitnodiging."
      />
      <StaffInviteAcceptForm action={acceptAction} />
    </main>
  )
}
