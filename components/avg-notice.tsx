import { AVG_NOTE_INSTRUCTION } from '@/lib/avg'

// Vaste AVG-instructie als hulptekst onder notitievelden (hardstop 1).
export function AvgNotice() {
  return (
    <p data-slot="avg-notice" className="text-sm text-muted-foreground">
      {AVG_NOTE_INSTRUCTION}
    </p>
  )
}
