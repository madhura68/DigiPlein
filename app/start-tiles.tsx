import type { StaffRole } from '@prisma/client'
import Link from 'next/link'

import { Tile } from '@/components/tile'

// Rolafhankelijke tegels van het startscherm. Apart van page.tsx zodat de
// per-rol-weergave direct te renderen valt in de test (geen async/sessie). De
// chat-tegel komt als slot binnen (ST-201), zodat de feature-flag buiten dit
// rol-component blijft.
export function StartTiles({
  role,
  chatSlot,
}: {
  role: StaffRole
  chatSlot?: React.ReactNode
}) {
  const isAdmin = role === 'ADMIN'

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Tile
          href="/vrijwilligers"
          title="Vrijwilligers"
          description="Hier zet je wie er op dinsdag en donderdag helpt."
        />
        <Tile
          href="/clienten"
          title="Cliënten"
          description="Houd bij wie er leert en wat hun leerwens is."
        />
        <Tile
          href="/cursusaanbod"
          title="Cursusaanbod"
          description="Bekijk de lesvormen en hoeveel sessies erbij horen."
        />
        {isAdmin ? (
          <Tile
            href="/medewerkers"
            title="Medewerkers"
            description="Beheer wie toegang heeft tot DigiPlein."
          />
        ) : null}
        {chatSlot}
      </div>

      {isAdmin ? (
        <p className="text-sm">
          <Link
            href="/audit"
            className="underline underline-offset-2 hover:text-primary-text"
          >
            Bekijk het audit-log →
          </Link>
        </p>
      ) : null}
    </div>
  )
}
