// JS-toegankelijke merkkleuren voor de PWA-manifest (app/manifest.ts) en de
// <meta name="theme-color"> (viewport in app/layout.tsx). theme.css blijft de bron
// voor de CSS-tokens; houd deze waarden in sync met --brand / --page daar. lib/
// valt buiten de hex-scan, zodat app/-bestanden hieruit importeren i.p.v. losse hex.
export const BRAND_COLOR = '#ee7203' // = --brand
export const BRAND_BACKGROUND = '#eef0f5' // = --page
