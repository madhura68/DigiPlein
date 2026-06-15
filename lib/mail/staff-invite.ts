import { spawn } from 'node:child_process'

import { DIGIPLEIN_EMAIL_THEME } from '@/lib/brand'

export type MailTransport = 'noop' | 'smtp'

export type StaffInviteMailInput = {
  appBaseUrl: string
  mailTransport: MailTransport
  to: string
  staffName: string
  token: string
  from?: string
  sendmailPath?: string
}

export type StaffInviteMailResult =
  | { transport: 'noop'; skipped: true }
  | { transport: 'smtp'; skipped: false }

export type SendmailRunInput = {
  path: string
  args: string[]
  input: string
}

export type SendmailRunResult = {
  code: number | null
  stderr: string
}

export type StaffInviteMailDependencies = {
  runSendmail?: (input: SendmailRunInput) => Promise<SendmailRunResult>
}

export function buildStaffInviteUrl(appBaseUrl: string, token: string): string {
  const baseUrl = appBaseUrl.endsWith('/') ? appBaseUrl : `${appBaseUrl}/`
  return new URL(`uitnodiging/${token}`, baseUrl).toString()
}

function assertHeaderValue(value: string): void {
  if (/[\r\n]/.test(value)) {
    throw new Error('Ongeldige mailheader')
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function formatMailAddress(displayName: string, address: string): string {
  assertHeaderValue(displayName)
  assertHeaderValue(address)

  if (/^[A-Za-z0-9 !#$%&'*+/=?^_`{|}~-]+$/.test(displayName)) {
    return `${displayName} <${address}>`
  }

  const escapedName = displayName.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  return `"${escapedName}" <${address}>`
}

function buildStaffInviteTextBody(
  input: Required<StaffInviteMailInput>,
  inviteUrl: string
): string {
  return [
    `Hallo ${input.staffName},`,
    '',
    'Je bent uitgenodigd om DigiPlein te gebruiken.',
    'Open de onderstaande link om in te loggen en direct je wachtwoord in te stellen:',
    '',
    inviteUrl,
    '',
    'Deze link is 72 uur geldig en kan eenmalig worden gebruikt.',
    '',
    'Met vriendelijke groet,',
    'DigiPlein',
  ].join('\n')
}

function buildStaffInviteHtmlBody(
  input: Required<StaffInviteMailInput>,
  inviteUrl: string
): string {
  const theme = DIGIPLEIN_EMAIL_THEME
  const staffName = escapeHtml(input.staffName)
  const safeInviteUrl = escapeHtml(inviteUrl)

  return [
    '<!doctype html>',
    '<html lang="nl">',
    '  <head>',
    '    <meta charset="UTF-8">',
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '    <title>Uitnodiging voor DigiPlein</title>',
    '  </head>',
    `  <body style="margin:0;background:${theme.page};color:${theme.foreground};font-family:Poppins, Arial, sans-serif;">`,
    '    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;">',
    '      <tr>',
    '        <td align="center" style="padding:32px 16px;">',
    `          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;border-collapse:collapse;background:${theme.card};border:1px solid ${theme.border};border-radius:6px;overflow:hidden;">`,
    '            <tr>',
    `              <td style="height:8px;background:${theme.brand};font-size:0;line-height:0;">&nbsp;</td>`,
    '            </tr>',
    '            <tr>',
    '              <td style="padding:32px;">',
    `                <p style="margin:0 0 10px;color:${theme.primaryText};font-size:13px;font-weight:700;line-height:1.4;text-transform:uppercase;letter-spacing:0;">DigiPlein</p>`,
    `                <h1 style="margin:0 0 18px;color:${theme.foreground};font-size:28px;line-height:1.2;font-weight:700;">Hallo ${staffName},</h1>`,
    `                <p style="margin:0 0 16px;color:${theme.foreground};font-size:16px;line-height:1.6;">Je bent uitgenodigd om DigiPlein te gebruiken.</p>`,
    `                <p style="margin:0 0 24px;color:${theme.foreground};font-size:16px;line-height:1.6;">Open de link om in te loggen en direct je wachtwoord in te stellen.</p>`,
    `                <p style="margin:0 0 24px;"><a href="${safeInviteUrl}" style="display:inline-block;background:${theme.primary};color:${theme.primaryForeground};border:2px solid ${theme.primary};border-radius:9999px;padding:12px 22px;font-size:16px;font-weight:700;line-height:1.25;text-decoration:none;">Inloggen en wachtwoord instellen</a></p>`,
    `                <p style="margin:0 0 20px;color:${theme.mutedForeground};font-size:14px;line-height:1.6;">Deze link is 72 uur geldig en kan eenmalig worden gebruikt.</p>`,
    `                <p style="margin:0;color:${theme.foreground};font-size:14px;line-height:1.6;">Werkt de knop niet? Gebruik dan deze link:<br><a href="${safeInviteUrl}" style="color:${theme.primaryText};font-weight:700;text-decoration:underline;word-break:break-all;">${safeInviteUrl}</a></p>`,
    '              </td>',
    '            </tr>',
    '            <tr>',
    `              <td style="padding:18px 32px;background:${theme.secondary};color:${theme.secondaryForeground};font-size:13px;line-height:1.5;">DigiPlein</td>`,
    '            </tr>',
    '          </table>',
    '        </td>',
    '      </tr>',
    '    </table>',
    '  </body>',
    '</html>',
  ].join('\n')
}

function buildStaffInviteMessage(input: Required<StaffInviteMailInput>): string {
  assertHeaderValue(input.from)
  assertHeaderValue(input.to)

  const boundary = 'digiplein-staff-invite'
  const inviteUrl = buildStaffInviteUrl(input.appBaseUrl, input.token)
  const textBody = buildStaffInviteTextBody(input, inviteUrl)
  const htmlBody = buildStaffInviteHtmlBody(input, inviteUrl)

  return [
    `From: ${input.from}`,
    `To: ${input.to}`,
    'Subject: Uitnodiging voor DigiPlein',
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    textBody,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    htmlBody,
    '',
    `--${boundary}--`,
    '',
  ].join('\n')
}

function runSendmail(input: SendmailRunInput): Promise<SendmailRunResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(input.path, input.args, {
      stdio: ['pipe', 'ignore', 'pipe'],
    })
    const stderr: Buffer[] = []

    child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk))
    child.stdin.on('error', reject)
    child.on('error', reject)
    child.on('close', (code) => {
      resolve({ code, stderr: Buffer.concat(stderr).toString('utf8') })
    })
    child.stdin.end(input.input)
  })
}

export async function sendStaffInviteMail(
  input: StaffInviteMailInput,
  dependencies: StaffInviteMailDependencies = {}
): Promise<StaffInviteMailResult> {
  if (input.mailTransport === 'noop') {
    console.info('[mail] staff invite skipped by noop transport')
    return { transport: 'noop', skipped: true }
  }

  if (!input.from || !input.sendmailPath) {
    throw new Error('SMTP mail transport is niet volledig geconfigureerd')
  }

  const runner = dependencies.runSendmail ?? runSendmail
  const result = await runner({
    path: input.sendmailPath,
    args: ['-t', '-oi'],
    input: buildStaffInviteMessage({
      appBaseUrl: input.appBaseUrl,
      mailTransport: input.mailTransport,
      to: input.to,
      staffName: input.staffName,
      token: input.token,
      from: input.from,
      sendmailPath: input.sendmailPath,
    }),
  })

  if (result.code !== 0) {
    console.error(
      `[mail] staff invite smtp transport failed exit_code=${result.code ?? 'null'}`
    )
    throw new Error('SMTP mail transport failed')
  }

  console.info('[mail] staff invite accepted by smtp transport')
  return { transport: 'smtp', skipped: false }
}
