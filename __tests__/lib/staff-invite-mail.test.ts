import { describe, expect, it, vi } from 'vitest'

import { buildStaffInviteUrl, sendStaffInviteMail } from '@/lib/mail/staff-invite'

describe('staff invite mail', () => {
  it('builds invite links under the configured app base url', () => {
    expect(buildStaffInviteUrl('http://localhost:3000', 'abc_DEF-123')).toBe(
      'http://localhost:3000/uitnodiging/abc_DEF-123'
    )
  })

  it('noop transport returns delivery metadata without logging the token or link', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    const result = await sendStaffInviteMail({
      appBaseUrl: 'https://digiplein.example',
      mailTransport: 'noop',
      to: 'sandra@example.nl',
      staffName: 'Sandra',
      token: 'secret-token-123',
    })

    expect(result).toEqual({ transport: 'noop', skipped: true })
    expect(info).toHaveBeenCalledOnce()
    const logged = info.mock.calls.flat().join(' ')
    expect(logged).not.toContain('secret-token-123')
    expect(logged).not.toContain('/uitnodiging/')
    expect(logged).not.toContain('sandra@example.nl')
    expect(logged).not.toContain('Sandra')

    info.mockRestore()
  })
})
