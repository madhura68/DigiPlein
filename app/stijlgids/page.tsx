import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const rolparen: { naam: string; klassen: string }[] = [
  { naam: "primary-container", klassen: "bg-primary-container text-primary-container-foreground" },
  { naam: "secondary", klassen: "bg-secondary text-secondary-foreground" },
  { naam: "tertiary", klassen: "bg-tertiary text-tertiary-foreground" },
  { naam: "surface-variant", klassen: "bg-surface-variant text-foreground" },
  { naam: "error", klassen: "bg-error text-error-foreground" },
  { naam: "success", klassen: "bg-success text-success-foreground" },
  { naam: "accent-yellow", klassen: "bg-accent-yellow text-foreground" },
  { naam: "accent-blue", klassen: "bg-accent-blue text-foreground" },
  { naam: "accent-indigo", klassen: "bg-accent-indigo text-primary-foreground" },
]

export default function StijlgidsPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-12">
      <header className="flex flex-col gap-3">
        <h1>Stijlgids</h1>
        <p className="max-w-2xl text-muted-foreground">
          De huisstijl van Bibliotheek Rotterdam vertaald naar MD3-rolparen. Elk
          vlak toont een achtergrondrol met de bijbehorende on-tekstkleur.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2>Kleurrollen</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="flex min-h-24 flex-col justify-end rounded-card bg-brand p-4">
            <span className="font-bold text-foreground">Aa primary (brand)</span>
          </div>
          {rolparen.map((rol) => (
            <div
              key={rol.naam}
              className={`flex min-h-24 flex-col justify-end rounded-card p-4 ${rol.klassen}`}
            >
              <span className="font-bold">Aa {rol.naam}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Oranje is uitsluitend een vlak-, rand- of focuskleur. De enige oranje
          tekst op wit is{" "}
          <span className="font-bold text-primary-text">primary-text</span>.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2>Knoppen</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button>Primaire knop</Button>
          <Button variant="secondary">Secundaire knop</Button>
          <Button disabled>Uitgeschakeld</Button>
        </div>
        <p>
          Een{" "}
          <a
            href="#"
            className="font-bold text-foreground underline underline-offset-4 hover:text-primary-text hover:no-underline"
          >
            tekstlink in lopende tekst
          </a>{" "}
          krijgt op hover de huisstijl-oranje tekstkleur.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2>Formulier</h2>
        <div className="flex max-w-sm flex-col gap-1.5">
          <label htmlFor="voorbeeld" className="font-medium">
            Voorbeeldveld
          </label>
          <Input id="voorbeeld" placeholder="Typ hier…" />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2>Kaart</h2>
        <Card plectrum className="max-w-sm">
          <h3 className="text-xl">Plectrum-kaart</h3>
          <p className="mt-2 text-muted-foreground">
            Eén sterk afgeronde hoek als signatuur-motief van de huisstijl.
          </p>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <h2>Status</h2>
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center rounded-pill bg-success px-3 py-1 text-sm font-bold text-success-foreground">
            Beschikbaar
          </span>
          <span className="inline-flex items-center rounded-pill bg-error px-3 py-1 text-sm font-bold text-error-foreground">
            Fout
          </span>
          <span className="font-bold text-success-text">Status-tekst groen</span>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2>Notitie-instructie (AVG)</h2>
        <div className="max-w-2xl rounded-card border border-outline-variant bg-muted p-4 text-sm text-muted-foreground">
          Alleen feitelijk en cursusgericht. Geen gezondheid of
          privéomstandigheden. Schrijf alsof de cliënt meeleest.
        </div>
      </section>
    </main>
  )
}
