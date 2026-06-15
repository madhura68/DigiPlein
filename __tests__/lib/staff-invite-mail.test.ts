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

  it('sends invite mail through sendmail-compatible smtp transport', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    const runSendmail = vi.fn().mockResolvedValue({
      code: 0,
      stderr: '',
    })

    const result = await sendStaffInviteMail(
      {
        appBaseUrl: 'https://digiplein.example',
        mailTransport: 'smtp',
        to: 'sandra@example.nl',
        staffName: 'Sandra',
        token: 'secret-token-123',
        from: 'DigiPlein <noreply@example.nl>',
        sendmailPath: '/usr/sbin/sendmail',
      },
      { runSendmail }
    )

    expect(result).toEqual({ transport: 'smtp', skipped: false })
    expect(runSendmail).toHaveBeenCalledWith({
      path: '/usr/sbin/sendmail',
      args: ['-t', '-oi'],
      input: expect.stringContaining('Subject: Uitnodiging voor DigiPlein'),
    })
    const message = runSendmail.mock.calls[0][0].input
    expect(message).toContain('From: DigiPlein <noreply@example.nl>')
    expect(message).toContain('To: sandra@example.nl')
    expect(message).toContain('https://digiplein.example/uitnodiging/secret-token-123')
    expect(info).toHaveBeenCalledWith(
      '[mail] staff invite accepted by smtp transport'
    )
    expect(info.mock.calls.flat().join(' ')).not.toContain('sandra@example.nl')
    expect(info.mock.calls.flat().join(' ')).not.toContain('secret-token-123')
    info.mockRestore()
  })

  it('throws on non-zero smtp transport exit without logging invite content', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const runSendmail = vi.fn().mockResolvedValue({
      code: 67,
      stderr: 'recipient rejected: sandra@example.nl secret-token-123',
    })

    await expect(
      sendStaffInviteMail(
        {
          appBaseUrl: 'https://digiplein.example',
          mailTransport: 'smtp',
          to: 'sandra@example.nl',
          staffName: 'Sandra',
          token: 'secret-token-123',
          from: 'DigiPlein <noreply@example.nl>',
          sendmailPath: '/usr/sbin/sendmail',
        },
        { runSendmail }
      )
    ).rejects.toThrow('SMTP mail transport failed')

    const logged = error.mock.calls.flat().join(' ')
    expect(logged).toContain('exit_code=67')
    expect(logged).not.toContain('sandra@example.nl')
    expect(logged).not.toContain('secret-token-123')
    expect(logged).not.toContain('/uitnodiging/')
    error.mockRestore()
  })

  it('rejects newline injection in mail headers', async () => {
    await expect(
      sendStaffInviteMail(
        {
          appBaseUrl: 'https://digiplein.example',
          mailTransport: 'smtp',
          to: 'sandra@example.nl\nBcc: attacker@example.nl',
          staffName: 'Sandra',
          token: 'secret-token-123',
          from: 'DigiPlein <noreply@example.nl>',
          sendmailPath: '/usr/sbin/sendmail',
        },
        { runSendmail: vi.fn() }
      )
    ).rejects.toThrow('Ongeldige mailheader')
  })
})
