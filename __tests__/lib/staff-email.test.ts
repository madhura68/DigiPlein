import { normalizeStaffEmail } from '@/lib/auth/staff-email'
import { describe, expect, it } from 'vitest'

describe('normalizeStaffEmail', () => {
  it('trims and lowercases staff email addresses consistently', () => {
    expect(normalizeStaffEmail('  Sandra.VanDijk@Bibliotheek.Rotterdam.NL  ')).toBe(
      'sandra.vandijk@bibliotheek.rotterdam.nl'
    )
  })
})
