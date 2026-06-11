import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "DigiPlein",
  description:
    "Interne cursusplanning voor het digivaardigheidsteam van Bibliotheek Rotterdam.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  )
}
