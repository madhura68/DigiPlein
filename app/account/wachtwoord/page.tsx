import { PageHeader } from '@/components/page-header'
import { requireStaff } from '@/lib/auth'

import { PasswordForm } from './password-form'

export default async function PasswordPage() {
  await requireStaff()

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
      <PageHeader
        title="Wachtwoord wijzigen"
        description="Bevestig je huidige wachtwoord voordat je een nieuw wachtwoord opslaat."
      />
      <PasswordForm />
    </main>
  )
}
