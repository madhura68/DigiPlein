import { afterEach, describe, expect, it } from 'vitest'

import { getBuildInfo } from '@/lib/build-info'

const originalBuildTime = process.env.NEXT_PUBLIC_BUILD_TIME
const originalVersion = process.env.NEXT_PUBLIC_APP_VERSION

afterEach(() => {
  process.env.NEXT_PUBLIC_BUILD_TIME = originalBuildTime
  process.env.NEXT_PUBLIC_APP_VERSION = originalVersion
})

describe('getBuildInfo', () => {
  it('formatteert de build-versie en buildtijd voor weergave', () => {
    process.env.NEXT_PUBLIC_APP_VERSION = '0.1.0'
    process.env.NEXT_PUBLIC_BUILD_TIME = '2026-07-05T10:30:00.000Z'

    expect(getBuildInfo()).toEqual({
      version: '0.1.0',
      builtAt: '2026-07-05T10:30:00.000Z',
      builtAtLabel: '5 juli 2026 om 12:30',
    })
  })

  it('valt terug op Onbekend wanneer buildmetadata ontbreekt', () => {
    delete process.env.NEXT_PUBLIC_APP_VERSION
    delete process.env.NEXT_PUBLIC_BUILD_TIME

    expect(getBuildInfo()).toEqual({
      version: 'Onbekend',
      builtAt: null,
      builtAtLabel: 'Onbekend',
    })
  })
})
