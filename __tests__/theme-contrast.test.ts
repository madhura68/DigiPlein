import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Leest de hex-tokens uit theme.css (de @theme-mappings met var(...) matchen niet)
// en toetst dat elk gebruikt achtergrond/tekst-rolpaar WCAG 2.2 AA haalt. Vangt
// o.a. de "wit op groen/oranje"-valkuilen die de hex-scan niet ziet.
const themeCss = readFileSync(join(process.cwd(), 'app/styles/theme.css'), 'utf8')

const tokens: Record<string, string> = {}
for (const match of themeCss.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\b/gi)) {
  tokens[match[1].toLowerCase()] = match[2].toLowerCase()
}

function luminance(hex: string): number {
  const v = hex.replace('#', '')
  const channel = (i: number) => {
    const c = parseInt(v.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4)
}

function contrast(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

// Achtergrond-/tekstrol-paren zoals ze in de UI worden gebruikt. Elk paar moet
// ≥ 4,5:1 halen (WCAG 2.2 AA, normale tekst).
const PAIRS: Array<[string, string, string]> = [
  ['primary', 'primary-foreground', 'primaire knop'],
  ['primary-container', 'primary-container-foreground', 'oranje container'],
  ['secondary', 'secondary-foreground', 'secondary-vlak'],
  ['tertiary', 'tertiary-foreground', 'tertiary-vlak'],
  ['error', 'error-foreground', 'error-vlak'],
  ['success', 'success-foreground', 'success-vlak'],
  ['card', 'card-foreground', 'contentkaart'],
  ['background', 'foreground', 'wit vlak'],
  ['page', 'foreground', 'pagina-achtergrond'],
  ['brand', 'foreground', 'tekst op merk-oranje (zwart)'],
  ['accent-indigo', 'primary-foreground', 'wit op indigo'],
  ['surface-variant', 'foreground', 'grijze status-chip'],
  ['accent-blue', 'foreground', 'blauwe status-chip'],
]

describe('theme — token-paar-contrast (WCAG 2.2 AA)', () => {
  it.each(PAIRS)('%s / %s (%s) haalt minimaal 4,5:1', (bg, fg) => {
    expect(tokens[bg], `token --${bg} ontbreekt in theme.css`).toBeDefined()
    expect(tokens[fg], `token --${fg} ontbreekt in theme.css`).toBeDefined()
    expect(contrast(tokens[bg], tokens[fg])).toBeGreaterThanOrEqual(4.5)
  })

  it('success-foreground is niet langer wit (regressiebewaking)', () => {
    expect(tokens['success-foreground']).not.toBe('#ffffff')
  })

  it('de pagina-achtergrond is gedefinieerd en niet puur wit', () => {
    expect(tokens['page']).toBeDefined()
    expect(tokens['page']).not.toBe('#ffffff')
  })
})
