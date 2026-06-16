import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Hybride beheerlist (HS-3): witte contentkaart met plectrum-hoek rond een tabel.
// overflow-hidden clips de hoeken; de tussenliggende overflow-x-auto geeft horizontal
// scroll zonder dat de buitenrand wordt weggeknipt.
export function AdminList({
  headers,
  children,
}: {
  headers: string[]
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-card rounded-br-plectrum border border-outline-variant bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header) => (
                <TableHead key={header}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>{children}</TableBody>
        </Table>
      </div>
    </div>
  )
}
