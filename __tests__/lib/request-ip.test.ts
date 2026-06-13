import { describe, expect, it } from 'vitest'

import { getTrustedClientIp } from '@/lib/request-ip'

function request(headers: Record<string, string>) {
  return new Request('https://digiplein.example.test/api/auth/pair/start', {
    headers,
  })
}

describe('getTrustedClientIp', () => {
  it('geeft unknown terug zonder proxyheaders', () => {
    expect(getTrustedClientIp(request({}))).toBe('unknown')
  })

  it('gebruikt de laatste X-Forwarded-For hop die door de dichtstbijzijnde proxy is gezet', () => {
    expect(
      getTrustedClientIp(
        request({
          'x-forwarded-for': '203.0.113.10, 198.51.100.24',
        })
      )
    ).toBe('198.51.100.24')
  })

  it('valt terug op X-Real-IP wanneer X-Forwarded-For ontbreekt', () => {
    expect(getTrustedClientIp(request({ 'x-real-ip': '198.51.100.7' }))).toBe(
      '198.51.100.7'
    )
  })

  it('weigert onbruikbare of te lange IP-waarden', () => {
    expect(getTrustedClientIp(request({ 'x-forwarded-for': 'not an ip' }))).toBe(
      'unknown'
    )
    expect(getTrustedClientIp(request({ 'x-real-ip': '1'.repeat(46) }))).toBe(
      'unknown'
    )
  })
})
