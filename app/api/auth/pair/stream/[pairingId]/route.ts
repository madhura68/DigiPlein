import { Client } from 'pg'

import { readPairCookie } from '@/lib/auth/pair-cookie'
import { verifyToken } from '@/lib/auth/pairing'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

const CHANNEL = 'digiplein_pairing'
const HEARTBEAT_MS = 25_000
const HARD_CLOSE_MS = 240_000
const TERMINAL_STATUSES = new Set(['consumed', 'cancelled'])

interface NotifyPayload {
  pairing_id?: string
  status?: string
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ pairingId: string }> }
) {
  const { pairingId } = await params
  const desktopToken = await readPairCookie()
  if (!desktopToken) {
    return Response.json({ error: 'Geen pairing-cookie' }, { status: 401 })
  }

  const pairing = await prisma.loginPairing.findUnique({
    where: { id: pairingId },
    select: { desktopTokenHash: true, status: true, expiresAt: true },
  })
  if (!pairing) {
    return Response.json({ error: 'Pairing niet gevonden' }, { status: 404 })
  }
  if (pairing.expiresAt < new Date()) {
    return Response.json({ error: 'Pairing verlopen' }, { status: 410 })
  }
  if (!verifyToken(desktopToken, pairing.desktopTokenHash)) {
    return Response.json({ error: 'Ongeldige cookie' }, { status: 401 })
  }

  const connectionString = getPostgresConnectionString()
  if (!connectionString) {
    return Response.json(
      { error: 'DATABASE_URL niet geconfigureerd' },
      { status: 500 }
    )
  }

  const encoder = new TextEncoder()
  const pgClient = new Client({ connectionString })

  let closed = false
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null
  let hardCloseTimer: ReturnType<typeof setTimeout> | null = null

  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (chunk: string) => {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(chunk))
        } catch {
          // Stream is already closing.
        }
      }

      const cleanup = async () => {
        if (closed) return
        closed = true
        if (heartbeatTimer) clearInterval(heartbeatTimer)
        if (hardCloseTimer) clearTimeout(hardCloseTimer)
        try {
          await pgClient.end()
        } catch {
          // Ignore cleanup failures.
        }
        try {
          controller.close()
        } catch {
          // Already closed.
        }
      }

      try {
        await pgClient.connect()
        await pgClient.query(`LISTEN ${CHANNEL}`)
      } catch {
        enqueue(
          `event: error\ndata: ${JSON.stringify({
            message: 'pg connect failed',
          })}\n\n`
        )
        await cleanup()
        return
      }

      pgClient.on('notification', (msg) => {
        if (!msg.payload) return
        let payload: NotifyPayload
        try {
          payload = JSON.parse(msg.payload) as NotifyPayload
        } catch {
          return
        }
        if (payload.pairing_id !== pairingId) return
        enqueue(`data: ${msg.payload}\n\n`)
        if (payload.status && TERMINAL_STATUSES.has(payload.status)) {
          void cleanup()
        }
      })

      pgClient.on('error', () => {
        void cleanup()
      })

      const fresh = await prisma.loginPairing.findUnique({
        where: { id: pairingId },
        select: { status: true },
      })
      const currentStatus = fresh?.status ?? pairing.status
      enqueue(
        `event: state\ndata: ${JSON.stringify({
          pairing_id: pairingId,
          status: currentStatus,
        })}\n\n`
      )

      if (TERMINAL_STATUSES.has(currentStatus)) {
        await cleanup()
        return
      }

      heartbeatTimer = setInterval(() => {
        enqueue(': heartbeat\n\n')
      }, HEARTBEAT_MS)

      hardCloseTimer = setTimeout(() => {
        void cleanup()
      }, HARD_CLOSE_MS)

      request.signal.addEventListener('abort', () => {
        void cleanup()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}

function getPostgresConnectionString(): string | null {
  const directUrl = process.env.DIRECT_URL
  if (directUrl?.startsWith('postgres')) return directUrl
  const databaseUrl = process.env.DATABASE_URL
  if (databaseUrl?.startsWith('postgres')) return databaseUrl
  return null
}
