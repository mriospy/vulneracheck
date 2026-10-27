// Tipos centrales del instrumento VulneraCheck: Escala de Vulnerabilidad
// Frente a Estafas en Servicios Financieros Digitales de Entidades Bancarias.
// Escala Likert 1-5, 5 dimensiones, ítems directos e inversos (ver
// lib/item-banks.ts). Construida siguiendo Boateng et al. (2018).

export type DimensionKey =
  | 'urgencia'
  | 'autoridad'
  | 'reciprocidad'
  | 'conformidad'
  | 'alfabetizacion'

export interface ScaleResponse {
  itemId: string
  value: number // 1-5, tal como lo marcó el participante (antes de invertir)
  latencyMs: number
}

export interface AssessmentSession {
  sessionId: string
  tokenId: string
  consentedAt: string
  startedAt: string
  completedAt: string | null
  /** Orden en que se presentaron los ítems en esta sesión. */
  itemOrder: string[]
  responses: ScaleResponse[]
}

export type RiskLevel = 'bajo' | 'medio' | 'alto'

export interface DimensionScore {
  dimension: DimensionKey
  label: string
  /** Suma de puntajes (inversos ya invertidos), mayor = mayor vulnerabilidad. */
  rawScore: number
  minScore: number
  maxScore: number
  /** rawScore normalizado a 0-100, solo para comparar dimensiones y para la plataforma. */
  normalizedScore: number
  level: RiskLevel
  itemCount: number
  /** Suma parcial por contexto de los ítems (4 + 4 en la escala mixta). */
  rawByContext: { cotidiano: number; bancario: number }
}

export interface AssessmentResult {
  dimensions: DimensionScore[]
  totalRawScore: number
  totalMinScore: number
  totalMaxScore: number
  totalNormalizedScore: number
  level: RiskLevel
  generatedAt: string
}
