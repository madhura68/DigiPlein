export type MailTransport = 'noop' | 'smtp'

export type StaffInviteMailInput = {
  appBaseUrl: string
  mailTransport: MailTransport
  to: string
  staffName: string
  token: string
}

export type StaffInviteMailResult =
  | { transport: 'noop'; skipped: true }
  | { transport: 'smtp'; skipped: false }

export function buildStaffInviteUrl(appBaseUrl: string, token: string): string {
  const baseUrl = appBaseUrl.endsWith('/') ? appBaseUrl : `${appBaseUrl}/`
  return new URL(`uitnodiging/${token}`, baseUrl).toString()
}

export async function sendStaffInviteMail(
  input: StaffInviteMailInput
): Promise<StaffInviteMailResult> {
  if (input.mailTransport === 'noop') {
    console.info('[mail] staff invite skipped by noop transport')
    return { transport: 'noop', skipped: true }
  }

  void buildStaffInviteUrl(input.appBaseUrl, input.token)
  void input.to
  void input.staffName
  throw new Error('SMTP mail transport is nog niet geconfigureerd')
}
