import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { StatusChip } from "@/components/ui/status-chip"
import { requireStaff } from "@/lib/auth"

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

export default async function StijlgidsPage() {
  await requireStaff()

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-12">
      <header className="flex flex-col gap-3">
        <h1>Stijlgids</h1>
        <p className="max-w-2xl text-muted-foreground">
          De huisstijl van Bibliotheek Rotterdam (compacte hybride richting). De
          app-shell, pagina-headers, filterblokken en contentkaarten zie je op de
          beheerschermen; hier staan de losse bouwstenen.
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
            className="font-bold text-foreground underline underline-offset-4 hover:text-primary-text"
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
        <label className="flex items-center gap-2">
          <Checkbox defaultChecked /> Selectievak met merk-oranje accent
        </label>
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
        <h2>Statuschips</h2>
        <div className="flex flex-wrap items-center gap-3">
          <StatusChip label="Aangemeld" tone="neutral" />
          <StatusChip label="Intake" tone="info" />
          <StatusChip label="Actief" tone="active" />
          <StatusChip label="Afgerond" tone="done" />
          <StatusChip label="Gestopt" tone="stopped" />
        </div>
        <p className="text-sm text-muted-foreground">
          Vaste, toegankelijke tokenparen per tone (≥ 4,5:1).
        </p>
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
