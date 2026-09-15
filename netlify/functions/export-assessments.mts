import { getStore } from '@netlify/blobs'
import type { Context, Config } from '@netlify/functions'

/**
 * Exporta todas las evaluaciones recolectadas (JSON o CSV) protegido por un
 * secreto compartido (RESEARCH_EXPORT_KEY, configurado como env var del
 * sitio). Uso: GET /api/export-assessments?key=...&format=csv|json
 */
export default async (req: Request, _context: Context) => {
  const url = new URL(req.url)
  const key = url.searchParams.get('key')
  const expectedKey = Netlify.env.get('RESEARCH_EXPORT_KEY')

  if (!expectedKey || key !== expectedKey) {
    return new Response('Unauthorized', { status: 401 })
  }

  const store = getStore('vulneracheck-assessments')
  const { blobs } = await store.list()
  const records = await Promise.all(blobs.map((b) => store.get(b.key, { type: 'json' })))

  const format = url.searchParams.get('format') ?? 'json'
  if (format === 'csv') {
    const rows = records.map((r) => ({
      sessionId: r?.session?.sessionId ?? '',
      tokenId: r?.session?.tokenId ?? '',
      completedAt: r?.session?.completedAt ?? '',
      totalScore: r?.result?.totalScore ?? '',
      riskTier: r?.result?.riskTier ?? '',
      nivel1Score: r?.result?.nivel1?.compositeScore ?? '',
      nivel2Score: r?.result?.nivel2SimulatedScore ?? '',
      receivedAt: r?.receivedAt ?? '',
    }))
    const header = Object.keys(rows[0] ?? { sessionId: '' }).join(',')
    const csvLines = rows.map((row) =>
      Object.values(row)
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(','),
    )
    const csv = [header, ...csvLines].join('\n')
    return new Response(csv, {
      status: 200,
      headers: { 'content-type': 'text/csv; charset=utf-8' },
    })
  }

  return new Response(JSON.stringify({ count: records.length, records }, null, 2), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}

export const config: Config = {
  path: '/api/export-assessments',
}
