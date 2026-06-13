import { QrLoginButton } from '@/app/login/qr-login-button'
import { PageHeader } from '@/components/page-header'
import { Card } from '@/components/ui/card'
import { requireStaff } from '@/lib/auth'

export default async function QrPairingPage() {
  await requireStaff()

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
      <PageHeader
        title="QR-login starten"
        description="Open deze pagina op de desktop waarop je wilt inloggen."
      />

      <Card className="flex max-w-xl flex-col gap-5">
        <p className="text-muted-foreground">
          Scan de QR-code met een mobiel apparaat waarop je al bent ingelogd.
        </p>
        <QrLoginButton />
      </Card>
    </main>
  )
}
