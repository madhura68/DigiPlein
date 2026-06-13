import { PageHeader } from '@/components/page-header'
import { Tile } from '@/components/tile'
import { requireStaff } from '@/lib/auth'

export default async function AccountPage() {
  await requireStaff()

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
      <PageHeader
        title="Account"
        description="Beheer je eigen login en veilige toegang."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Tile
          href="/account/wachtwoord"
          title="Wachtwoord wijzigen"
          description="Wijzig je eigen wachtwoord nadat je je huidige wachtwoord hebt bevestigd."
        />
        <Tile
          href="/account/qr-pairing"
          title="QR-login starten"
          description="Start QR-login voor een desktop met je al ingelogde mobiel."
        />
      </div>
    </main>
  )
}
