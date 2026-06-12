// Statuschip (HS-3): pill met een vaste, toegankelijke achtergrond/tekst-tokenparen
// per tone (zie __tests__/theme-contrast.test.ts). De caller mapt de enum → tone.
export type ChipTone = 'neutral' | 'info' | 'active' | 'done' | 'stopped'

const TONE_CLASSES: Record<ChipTone, string> = {
  neutral: 'bg-surface-variant text-foreground',
  info: 'bg-accent-blue text-foreground',
  active: 'bg-success text-success-foreground',
  done: 'bg-primary-container text-primary-container-foreground',
  stopped: 'bg-secondary text-secondary-foreground',
}

export function StatusChip({
  label,
  tone = 'neutral',
}: {
  label: string
  tone?: ChipTone
}) {
  return (
    <span
      className={`inline-flex items-center rounded-pill px-3 py-0.5 text-xs font-bold ${TONE_CLASSES[tone]}`}
    >
      {label}
    </span>
  )
}
