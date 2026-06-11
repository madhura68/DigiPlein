import { cn } from "@/lib/utils"

// Plectrum-motief: kleine basisradius + één sterk afgeronde hoek (100px) op
// uitgelichte kaarten — de signatuur uit de huisstijl van Bibliotheek Rotterdam.
function Card({
  className,
  plectrum = false,
  ...props
}: React.ComponentProps<"div"> & { plectrum?: boolean }) {
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-card border border-outline-variant bg-card p-6 text-card-foreground",
        plectrum && "rounded-br-[100px]",
        className
      )}
      {...props}
    />
  )
}

export { Card }
