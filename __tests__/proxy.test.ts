import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'

import { proxy } from '@/proxy'

function request(pathname: string, cookie?: string) {
  return new NextRequest(`http://localhost:3000${pathname}`, {
    headers: cookie ? { cookie } : undefined,
  })
}

describe('proxy auth boundaries', () => {
  it('laat publieke uitnodigingslinks zonder sessie door', () => {
    const response = proxy(request('/uitnodiging/abc_DEF-123'))
    expect(response.headers.get('x-middleware-next')).toBe('1')
  })

  it('redirect andere pagina’s zonder sessie naar login', () => {
    const response = proxy(request('/medewerkers'))
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/login')
  })
})
