import { PageHeader } from '@/components/page-header'
import { Tile } from '@/components/tile'
import { requireStaff } from '@/lib/auth'

type TileDefinition = {
  href: string
  title: string
  description: string
  adminOnly?: boolean
}

const TILES: TileDefinition[] = [
  {
    href: '/clienten',
    title: 'Cliënten',
    description: 'Registreer en bekijk cliënten van Klik & Tik en Les op maat.',
  },
  {
    href: '/vrijwilligers',
    title: 'Vrijwilligers',
    description: 'Bekijk en beheer het vrijwilligersrooster en contactgegevens.',
  },
  {
    href: '/cursusaanbod',
    title: 'Cursusaanbod',
    description: 'Bekijk en beheer het aanbod van cursussen en workshops.',
  },
  {
    href: '/medewerkers',
    title: 'Medewerkers',
    description: 'Beheer wie toegang heeft tot DigiPlein.',
    adminOnly: true,
  },
  {
    href: '/beheer',
    title: 'Beheer',
    description: 'Instellingen en overige beheerfuncties.',
    adminOnly: true,
  },
  {
    href: '/audit',
    title: 'Audit-log',
    description: 'Bekijk een overzicht van alle wijzigingen in de app.',
    adminOnly: true,
  },
]

export default async function Home() {
  const session = await requireStaff()
  const tiles = TILES.filter((t) => !t.adminOnly || session.role === 'ADMIN')

  return (
    <main id="main-content" className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
      <PageHeader
        title={`Welkom terug, ${session.name}.`}
        description="Kies een onderdeel om mee aan de slag te gaan."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) => (
          <Tile
            key={tile.href}
            href={tile.href}
            title={tile.title}
            description={tile.description}
          />
        ))}
      </div>
    </main>
  )
}
