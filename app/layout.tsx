import type { Metadata, Viewport } from "next"
import { Poppins } from "next/font/google"

import { AppShell } from "@/components/app-shell"
import { APP_NAME } from "@/lib/app-name"
import { getSession } from "@/lib/auth"
import { BRAND_COLOR } from "@/lib/brand"
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
  // PWA: app/manifest.ts levert het manifest (Next linkt het automatisch).
  applicationName: APP_NAME,
  appleWebApp: { capable: true, statusBarStyle: "default", title: APP_NAME },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.png" }],
  },
}

export const viewport: Viewport = {
  themeColor: BRAND_COLOR,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Shell alleen voor ingelogde medewerkers; /login krijgt geen sessie en dus geen
  // shell. De export-/printpagina's blijven schoon via de print:hidden-shell.
  const session = await getSession()

  return (
    <html lang="nl" className={poppins.variable}>
      <body className="min-h-screen antialiased">
        {session.staffId ? (
          <AppShell name={session.name} role={session.role} />
        ) : null}
        {children}
      </body>
    </html>
  )
}
