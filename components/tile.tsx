import Link from 'next/link'

import { Card } from '@/components/ui/card'

// Startscherm-tegel in plectrum-stijl. Met `href` een navigatietegel (focus =
// oranje rand, conform de knop-conventie); zonder `href` een nette niet-actieve
// tegel (bijv. "binnenkort").
export function Tile({
  href,
  title,
  description,
  badge,
}: {
  href?: string
  title: string
  description: string
  badge?: string
}) {
  const card = (
    <Card
      plectrum
      className="flex h-full flex-col gap-2 transition-colors group-hover:border-foreground group-focus-visible:border-brand"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl">{title}</h2>
        {badge ? (
          <span className="rounded-pill bg-surface-variant px-3 py-0.5 text-xs font-medium text-muted-foreground">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="text-muted-foreground">{description}</p>
    </Card>
  )

  if (!href) {
    return (
      <div aria-disabled="true" className="opacity-70">
        {card}
      </div>
    )
  }

  return (
    <Link href={href} className="group block rounded-card outline-none">
      {card}
    </Link>
  )
}
