import { cn } from "@/lib/utils"

// Sterk afgerond invoerveld (rounded-field ~24px), rand uit token, oranje focus-rand.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-field border border-input bg-background px-4 py-2 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-brand disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
