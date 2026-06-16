import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

function findPageFiles(dir: string): string[] {
  const results: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) results.push(...findPageFiles(full))
    else if (entry.name === 'page.tsx') results.push(full)
  }
  return results
}

describe('skip-link guard', () => {
  it('elke page.tsx met een <main> heeft id="main-content"', () => {
    const appDir = join(process.cwd(), 'app')
    const pages = findPageFiles(appDir)
    const violations: string[] = []

    for (const file of pages) {
      const src = readFileSync(file, 'utf8')
      const hasMain = /<main[\s>]/.test(src)
      const hasId = /id=["']main-content["']/.test(src)
      if (hasMain && !hasId) violations.push(file.replace(process.cwd() + '/', ''))
    }

    expect(violations, `Pages met <main> zonder id="main-content":\n${violations.join('\n')}`).toEqual([])
  })
})
