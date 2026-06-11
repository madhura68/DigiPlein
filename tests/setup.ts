import '@testing-library/jest-dom/vitest'

// lib/env valideert process.env bij import; geef tests geldige dummy-waarden
// (geen echte secrets) zodat modules die env importeren laadbaar zijn.
process.env.DATABASE_URL ??=
  'postgresql://digiplein:digiplein@localhost:5432/digiplein'
process.env.SESSION_SECRET ??= 'test-session-secret-minstens-32-tekens-lang'
process.env.APP_BASE_URL ??= 'http://localhost:3000'
