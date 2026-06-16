import { PageHeader } from '@/components/page-header'
import { Tile } from '@/components/tile'
import { requireAdmin } from '@/lib/auth'

export default async function BeheerPage() {
  await requireAdmin()

  return (
    <main id="main-content" className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
      <PageHeader
        title="Beheer"
        description="Beheer de onderdelen die alleen voor beheerders beschikbaar zijn."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Tile
          href="/medewerkers"
          title="Gebruikersbeheer"
          description="Medewerkers uitnodigen, rollen beheren en toegang deactiveren."
        />
        <Tile
          href="/audit"
          title="Audit-log"
          description="Wijzigingsgeschiedenis voor verantwoording en controle bekijken."
        />
      </div>
    </main>
  )
}
