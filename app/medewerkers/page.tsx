import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { STAFF_ROLE_LABELS } from '@/lib/enums'

import { MedewerkerRijActies } from './medewerker-rij-acties'
import { NieuweMedewerkerForm } from './nieuwe-medewerker-form'

export default async function MedewerkersPage() {
  await requireAdmin()
  const staff = await prisma.staffMember.findMany({
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
  })

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl">Medewerkers</h1>
        <p className="text-muted-foreground">
          Beheer wie toegang heeft tot DigiPlein. Je kunt medewerkers toevoegen,
          deactiveren en hun wachtwoord opnieuw instellen.
        </p>
      </header>

      <NieuweMedewerkerForm />

      <section className="flex flex-col gap-3">
        <h2 className="text-xl">Overzicht</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Naam</TableHead>
              <TableHead>E-mailadres</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Acties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => (
              <TableRow
                key={member.id}
                className={member.isActive ? undefined : 'opacity-60'}
              >
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{STAFF_ROLE_LABELS[member.role]}</TableCell>
                <TableCell>
                  {member.isActive ? 'Actief' : 'Gedeactiveerd'}
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
          </TableBody>
        </Table>
        {staff.length === 0 ? (
          <p className="text-muted-foreground">
            Nog geen medewerkers. Voeg de eerste toe.
          </p>
        ) : null}
      </section>
    </main>
  )
}
