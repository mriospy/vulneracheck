import { getStore } from '@netlify/blobs'
import type { Context, Config } from '@netlify/functions'

interface SubmitPayload {
  session: { sessionId?: unknown; tokenId?: unknown }
  result: { totalScore?: unknown }
}

function isValidPayload(body: unknown): body is SubmitPayload {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  const session = b.session as Record<string, unknown> | undefined
  const result = b.result as Record<string, unknown> | undefined
  return (
    !!session &&
    typeof session.sessionId === 'string' &&
    typeof session.tokenId === 'string' &&
    !!result &&
    typeof result.totalScore === 'number'
  )
}

export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  if (!isValidPayload(body)) {
    return new Response('Invalid payload', { status: 422 })
  }

  const store = getStore('vulneracheck-assessments')
  const sessionId = (body.session as { sessionId: string }).sessionId
  await store.setJSON(sessionId, {
    ...body,
    receivedAt: new Date().toISOString(),
  })

  return new Response(JSON.stringify({ ok: true }), {
    status: 201,
    headers: { 'content-type': 'application/json' },
  })
}

export const config: Config = {
  path: '/api/submit-assessment',
}
