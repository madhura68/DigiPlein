import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Huisstijl Bibliotheek Rotterdam: pill-knoppen, Poppins 700. ADR-0001 — base-ui
// met de `render`-prop (geen Radix/asChild). Focus = oranje rand (brand).
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-pill border-2 font-bold transition-colors outline-none focus-visible:border-brand disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Zwart vlak, witte tekst; hover inverteert naar wit + zwarte rand.
        primary:
          "border-transparent bg-primary text-primary-foreground hover:border-foreground hover:bg-background hover:text-foreground",
        // Wit vlak, zwarte tekst, 2px zwarte rand; hover lichtgrijs.
        secondary:
          "border-foreground bg-background text-foreground hover:bg-surface-hover",
      },
      size: {
        default: "h-11 px-[18px] py-2.5 text-base",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
