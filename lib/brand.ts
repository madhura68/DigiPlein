// JS-toegankelijke merkkleuren voor de PWA-manifest (app/manifest.ts) en de
// <meta name="theme-color"> (viewport in app/layout.tsx). theme.css blijft de bron
// voor de CSS-tokens; houd deze waarden in sync met --brand / --page daar. lib/
// valt buiten de hex-scan, zodat app/-bestanden hieruit importeren i.p.v. losse hex.
export const BRAND_COLOR = '#ee7203' // = --brand
export const BRAND_BACKGROUND = '#eef0f5' // = --page

export const DIGIPLEIN_EMAIL_THEME = {
  brand: BRAND_COLOR,
  page: BRAND_BACKGROUND,
  card: '#ffffff',
  foreground: '#000000',
  primary: '#000000',
  primaryForeground: '#ffffff',
  primaryText: '#b35400',
  secondary: '#38383a',
  secondaryForeground: '#ffffff',
  border: '#eeeff5',
  mutedForeground: '#565656',
} as const
