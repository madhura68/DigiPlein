import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'fs'
import path from 'path'

// ADR-0001 — naast de eslint-regels (no-restricted-imports / no-restricted-syntax)
// borgt deze test dat geen enkel bronbestand Radix importeert of `asChild` gebruikt.
// Bewust opgebouwd uit fragmenten zodat de test zichzelf niet als overtreder ziet.
const RADIX = '@radix' + '-ui'
const AS_CHILD = 'as' + 'Child'

function collectSources(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...collectSources(full))
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full)
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

describe('ADR-0001 base-ui guard', () => {
  it('geen bronbestand importeert Radix of gebruikt de asChild-prop', () => {
    const roots = ['app', 'components', 'lib'].filter(exists)
    const offenders: string[] = []
    for (const file of roots.flatMap(collectSources)) {
      const src = readFileSync(file, 'utf8')
      if (src.includes(RADIX)) offenders.push(`${file}: Radix-import`)
      if (new RegExp(`\\b${AS_CHILD}\\b`).test(src)) {
        offenders.push(`${file}: ${AS_CHILD}-prop`)
      }
    }
    expect(offenders).toEqual([])
  })
})
