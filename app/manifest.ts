import type { MetadataRoute } from 'next'

import { BRAND_BACKGROUND, BRAND_COLOR } from '@/lib/brand'

// PWA-manifest (Next serveert dit op /manifest.webmanifest en linkt het automatisch).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DigiPlein',
    short_name: 'DigiPlein',
    description:
      'Interne cursusplanning voor het digivaardigheidsteam van Bibliotheek Rotterdam.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: BRAND_BACKGROUND,
    theme_color: BRAND_COLOR,
    lang: 'nl',
    dir: 'ltr',
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/icons/icon-192.png', type: 'image/png', sizes: '192x192' },
      { src: '/icons/icon-512.png', type: 'image/png', sizes: '512x512' },
      {
        src: '/icons/icon-512.png',
        type: 'image/png',
        sizes: '512x512',
        purpose: 'maskable',
      },
    ],
  }
}
