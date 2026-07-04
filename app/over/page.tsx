import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'
import { getBuildInfo } from '@/lib/build-info'
import { requireStaff } from '@/lib/auth'

export default async function AboutPage() {
  await requireStaff()
  const buildInfo = getBuildInfo()

  return (
    <main id="main-content" className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
      <PageHeader
        title="Over DigiPlein"
        description="Informatie over de maker, werkwijze en de actieve build."
      />

      <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Card plectrum className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl">Gemaakt door JP Visser</h2>
            <p className="text-muted-foreground">
              Meer over mijn werk en projecten staat op{' '}
              <a
                href="https://jp-visser.nl"
                className="font-bold text-foreground underline underline-offset-4 hover:text-primary-text"
                rel="noreferrer"
                target="_blank"
              >
                jp-visser.nl
              </a>
              .
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl">Ontwikkeld met Scrum4Me</h2>
            <p className="text-muted-foreground">
              DigiPlein is gemaakt met Scrum4Me: ideeën, specificaties, taken,
              implementatie en verificatie worden per stap vastgelegd zodat de app
              gecontroleerd kan worden uitgebreid.
            </p>
          </div>
        </Card>

        <Card className="flex flex-col gap-4">
          <h2 className="text-2xl">Build</h2>
          <dl className="grid gap-3">
            <div className="flex items-baseline justify-between gap-4 border-b border-outline-variant pb-3">
              <dt className="font-medium text-muted-foreground">Versie</dt>
              <dd className="font-bold">{buildInfo.version}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="font-medium text-muted-foreground">Gebouwd op</dt>
              <dd className="text-right font-bold">
                {buildInfo.builtAt ? (
                  <time dateTime={buildInfo.builtAt}>{buildInfo.builtAtLabel}</time>
                ) : (
                  buildInfo.builtAtLabel
                )}
              </dd>
            </div>
          </dl>
        </Card>
      </section>
    </main>
  )
}
