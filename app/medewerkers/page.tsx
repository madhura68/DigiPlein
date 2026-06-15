import Link from 'next/link'

import { AdminList } from '@/components/admin-list'
import { PageHeader } from '@/components/page-header'
import { buttonVariants } from '@/components/ui/button'
import { StatusChip } from '@/components/ui/status-chip'
import { TableCell, TableRow } from '@/components/ui/table'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { STAFF_ROLE_LABELS } from '@/lib/enums'

import { MedewerkerRijActies } from './medewerker-rij-acties'

export default async function MedewerkersPage() {
  await requireAdmin()
  const staff = await prisma.staffMember.findMany({
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
  })

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
      <PageHeader
        title="Medewerkers"
        description="Beheer wie toegang heeft tot DigiPlein. Je kunt medewerkers uitnodigen, rollen aanpassen en toegang deactiveren."
        action={
          <Link href="/medewerkers/nieuw" className={buttonVariants()}>
            Nieuwe medewerker
          </Link>
        }
      />

      {staff.length > 0 ? (
        <AdminList headers={['Naam', 'Rol', 'Status', 'Acties']}>
          {staff.map((member) => (
            <TableRow
              key={member.id}
              className={member.isActive ? undefined : 'opacity-60'}
            >
              <TableCell>
                <span className="font-bold">{member.name}</span>
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </TableCell>
              <TableCell>{STAFF_ROLE_LABELS[member.role]}</TableCell>
              <TableCell>
                <StatusChip
                  label={member.isActive ? 'Actief' : 'Gedeactiveerd'}
                  tone={member.isActive ? 'active' : 'neutral'}
                />
              </TableCell>
              <TableCell>
                <MedewerkerRijActies
                  staff={{
                    id: member.id,
                    name: member.name,
                    email: member.email,
                    role: member.role,
                    isActive: member.isActive,
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </AdminList>
      ) : (
        <p className="text-muted-foreground">
          Nog geen medewerkers. Voeg de eerste toe.
        </p>
      )}
    </main>
  )
}
