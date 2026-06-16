// Paginakop (HS-3): titel + korte B1-uitleg links, optionele primaire actie rechts.
// Levert de enige <h1> van de pagina (de shell heeft er geen).
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        {/* text-3xl: bewust kleinere admin-kopmaat; de stijlgids toont de volledige h1-schaal (48–60px) */}
        <h1 className="text-3xl">{title}</h1>
        {description ? (
          <p className="text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  )
}
