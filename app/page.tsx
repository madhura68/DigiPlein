import { PageHeader } from '@/components/page-header'
import { requireStaff } from '@/lib/auth'

export default async function Home() {
  const session = await requireStaff()

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
      <PageHeader
        title={`Welkom terug, ${session.name}.`}
        description="Kies hierboven een onderdeel om mee aan de slag te gaan."
      />
      {/* De copilot (chat·docs·ideas·jobs) zit app-breed in de header-drawer (AppShell). */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Ruimte voor het M3/M4 "vandaag"-overzicht (wie er komt + bezetting) — YAGNI. */}
        <div className="rounded-card rounded-br-[2rem] border border-dashed border-outline-variant bg-card p-6">
          <p className="font-bold">Vandaag</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Het overzicht van wie er komt en de bezetting verschijnt hier in een
            latere fase.
          </p>
        </div>
      </div>
    </main>
  )
}
