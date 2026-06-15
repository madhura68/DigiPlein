import { PageHeader } from '@/components/page-header'
import { requireStaff } from '@/lib/auth'

import { PasswordForm } from './password-form'

export default async function PasswordPage() {
  const session = await requireStaff({ allowPasswordChange: true })
  const forced = Boolean(session.mustChangePassword)

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
      <PageHeader
        title="Wachtwoord wijzigen"
        description={
          forced
            ? 'Kies een eigen wachtwoord voordat je DigiPlein verder gebruikt.'
            : 'Bevestig je huidige wachtwoord voordat je een nieuw wachtwoord opslaat.'
        }
      />
      <PasswordForm forced={forced} />
    </main>
  )
}
