import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('Scrum4Me-copilot route', () => {
  it('exporteert PATCH voor idea-updates', () => {
    const route = readFileSync(join(process.cwd(), 'app/api/s4m/[...path]/route.ts'), 'utf8')

    expect(route).toMatch(/export const \{\s*GET,\s*POST,\s*PATCH\s*\} = createS4MRoutes/)
  })

  it('houdt de teststub gelijk aan de route-methods', () => {
    const stub = readFileSync(join(process.cwd(), 'tests/stubs/s4m-kit.tsx'), 'utf8')

    expect(stub).toMatch(/PATCH:\s*async\s*\(\)\s*=>\s*new Response/)
  })
})
