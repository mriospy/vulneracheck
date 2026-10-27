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
    // Una columna por dimensión (puntaje bruto) y una por ítem (respuesta
    // original 1-5, sin invertir) para el análisis de la tesis. Los registros
    // del instrumento anterior (sin result.dimensions) quedan con esas
    // columnas vacías.
    const DIMENSION_KEYS = ['urgencia', 'autoridad', 'reciprocidad', 'conformidad', 'alfabetizacion']
    type Dim = {
      dimension: string
      rawScore: number
      level: string
      rawByContext?: { cotidiano: number; bancario: number }
    }
    type Resp = { itemId: string; value: number }
    const itemIds = Array.from(
      new Set(records.flatMap((r) => ((r?.session?.responses ?? []) as Resp[]).map((x) => x.itemId))),
    ).sort()
    const rows = records.map((r) => {
      const dims = (r?.result?.dimensions ?? []) as Dim[]
      const responses = (r?.session?.responses ?? []) as Resp[]
      const row: Record<string, unknown> = {
        sessionId: r?.session?.sessionId ?? '',
        tokenId: r?.session?.tokenId ?? '',
        completedAt: r?.session?.completedAt ?? '',
        totalRawScore: r?.result?.totalRawScore ?? '',
        level: r?.result?.level ?? '',
      }
      for (const key of DIMENSION_KEYS) {
        const d = dims.find((x) => x.dimension === key)
        row[`${key}_raw`] = d?.rawScore ?? ''
        row[`${key}_level`] = d?.level ?? ''
        row[`${key}_cotidiano`] = d?.rawByContext?.cotidiano ?? ''
        row[`${key}_bancario`] = d?.rawByContext?.bancario ?? ''
      }
      for (const id of itemIds) row[id] = responses.find((x) => x.itemId === id)?.value ?? ''
      row.receivedAt = r?.receivedAt ?? ''
      return row
    })
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
