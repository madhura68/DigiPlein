import { Card } from '@/components/ui/card'
import { requireStaff } from '@/lib/auth'

import { PairConfirmation } from './pair-confirmation'

export default async function PairPage() {
  await requireStaff()

  return (
    <main id="main-content" className="mx-auto flex min-h-[80vh] max-w-lg flex-col justify-center px-6 py-10">
      <Card className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold uppercase text-primary-text">
            Mobiel apparaat
          </p>
          <h1 className="text-2xl">Mobiele login bevestigen</h1>
          <p className="text-muted-foreground">
            Controleer de desktopgegevens voordat je toegang geeft.
          </p>
        </div>
        <PairConfirmation />
      </Card>
    </main>
  )
}
