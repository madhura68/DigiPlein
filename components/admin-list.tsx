import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Hybride beheerlist (HS-3): witte contentkaart met plectrum-hoek rond een tabel.
// Kolommen blijven zichtbaar voor scanbaarheid; de caller bouwt de rijen (eerste
// kolom = naam als donker-oranje link met secundaire regel, acties rechts) met
// TableRow/TableCell uit components/ui/table.
export function AdminList({
  headers,
  children,
}: {
  headers: string[]
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-card rounded-br-[2rem] border border-outline-variant bg-card">
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
  )
}
