import { spawn } from 'node:child_process'

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

function buildStaffInviteMessage(input: Required<StaffInviteMailInput>): string {
  assertHeaderValue(input.from)
  assertHeaderValue(input.to)

  const inviteUrl = buildStaffInviteUrl(input.appBaseUrl, input.token)
  const body = [
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

  return [
    `From: ${input.from}`,
    `To: ${input.to}`,
    'Subject: Uitnodiging voor DigiPlein',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    body,
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
