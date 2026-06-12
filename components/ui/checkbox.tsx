import { cn } from '@/lib/utils'

// Huisstijl-checkbox (HS-3): native input met merk-oranje accent (geen browser-blauw)
// en de gedeelde focus-indicator (de globale :focus-visible-ring uit theme.css).
function Checkbox({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type="checkbox"
      data-slot="checkbox"
      className={cn('size-4 shrink-0 accent-brand', className)}
      {...props}
    />
  )
}

export { Checkbox }
