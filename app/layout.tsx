import type { Metadata } from "next"
import { Poppins } from "next/font/google"

import { APP_NAME } from "@/lib/app-name"
import "./globals.css"

// Poppins 400/500/700 met automatisch size-adjusted Arial-fallback (CLS-arm).
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata: Metadata = {
  title: APP_NAME,
  description:
    "Interne cursusplanning voor het digivaardigheidsteam van Bibliotheek Rotterdam.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl" className={poppins.variable}>
      <body className="min-h-screen antialiased">
        <header className="border-b border-outline-variant print:hidden">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <span className="text-xl font-bold">{APP_NAME}</span>
            {/* Navigatie-items volgen per beheer-story (ST-101 e.v.). */}
          </nav>
        </header>
        {children}
      </body>
    </html>
  )
}
