// Zoek-/filterblok (HS-3): witte kaart met plectrum-hoek boven een lijst. De
// filtervelden komen als children binnen; het is een GET-formulier (querystring).
export function FilterPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-card rounded-br-[2rem] border border-outline-variant bg-card p-5">
      <form className="flex flex-wrap items-end gap-3">{children}</form>
    </div>
  )
}
