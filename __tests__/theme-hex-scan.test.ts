import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'fs'
import path from 'path'

/*
 * ST-002 huisstijl-borging (hardstop 3 + 4):
 *  (a) hex-literals mogen alleen in app/styles/theme.css staan — componenten
 *      gebruiken uitsluitend MD3-rolparen/tokens;
 *  (b) oranje mag nooit een tekstkleur zijn: geen `text-brand`, geen
 *      `text-[<oranje-hex>]`, geen inline `color: #ee7203 | var(--brand)`.
 * De enige toegestane oranje tekst is `text-primary-text` (#b35400).
 */

const THEME_FILE = path.join('app', 'styles', 'theme.css')

// Allowlist voor gemotiveerde uitzonderingen (groot/bold op donkere of
// oranje-container-achtergrond). Vooralsnog leeg: de stijlgids gebruikt
// `bg-brand` met witte tekst, dus oranje is nergens een tekstkleur.
const HEX_ALLOWLIST: string[] = []

const HEX = /#[0-9a-fA-F]{3,8}\b/
const ORANGE_TEXT: RegExp[] = [
  /\btext-brand\b/,
  /text-\[\s*(?:#ee7203|#f79136|#d56603|var\(--brand\))\s*\]/i,
  /(?<!-)color\s*:\s*(?:#ee7203|#f79136|#d56603|var\(--brand\))/i,
]

function collect(dir: string, exts: string[]): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...collect(full, exts))
    else if (exts.some((e) => entry.endsWith(e))) out.push(full)
  }
  return out
}

function exists(dir: string): boolean {
  try {
    statSync(dir)
    return true
  } catch {
    return false
  }
}

// Scan alleen CODE, geen commentaar — een comment die ter documentatie een hex
// of `var(--brand)` benoemt mag geen valse treffer geven.
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
}

const roots = ['app', 'components'].filter(exists)

describe('huisstijl-tokens (hardstop 3 + 4)', () => {
  it('geen hex-literals buiten app/styles/theme.css', () => {
    const offenders: string[] = []
    for (const file of roots.flatMap((r) => collect(r, ['.ts', '.tsx', '.css']))) {
      if (path.normalize(file) === THEME_FILE) continue
      if (HEX_ALLOWLIST.includes(path.normalize(file))) continue
      if (HEX.test(stripComments(readFileSync(file, 'utf8')))) offenders.push(file)
    }
    expect(offenders).toEqual([])
  })

  it('oranje wordt nergens als tekstkleur gebruikt', () => {
    const offenders: string[] = []
    for (const file of roots.flatMap((r) => collect(r, ['.ts', '.tsx']))) {
      const src = stripComments(readFileSync(file, 'utf8'))
      if (ORANGE_TEXT.some((re) => re.test(src))) offenders.push(file)
    }
    expect(offenders).toEqual([])
  })
})
