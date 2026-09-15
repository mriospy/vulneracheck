import type { RiskTier } from '@/types/assessment'

export interface HistoryEntry {
  sessionId: string
  tokenId: string
  completedAt: string
  totalScore: number
  riskTier: RiskTier
}

const STORAGE_KEY = 'vulneracheck.history.v1'
const MAX_ENTRIES = 5

function readRaw(): HistoryEntry[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Historial de evaluaciones persistido en localStorage del dispositivo
 * (no hay backend). Se guarda solo lo necesario para la tabla de
 * "Evolución Histórica" del informe PDF — nunca las respuestas crudas del test.
 */
export function getHistory(): HistoryEntry[] {
  return readRaw().sort((a, b) => b.completedAt.localeCompare(a.completedAt))
}

export function appendHistoryEntry(entry: HistoryEntry): HistoryEntry[] {
  if (typeof localStorage === 'undefined') return [entry]
  const next = [entry, ...readRaw()]
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    .slice(0, MAX_ENTRIES)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // almacenamiento no disponible (modo privado, cuota excedida, etc.) — no bloquea el flujo
  }
  return next
}

export function clearHistory(): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // no-op
  }
}
