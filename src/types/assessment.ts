// Tipos centrales del instrumento de evaluación VulneraCheck.
// Nivel 1 = Perfil de Vulnerabilidad Conductual (60% del score total, medido en esta PWA).
// Nivel 2 = Perfil Transaccional y Entorno Técnico (40%, simulado vía webhook al Core Bancario).

export type ScenarioChoice = 'ignorar' | 'verificar' | 'responder' | 'llamar'

export interface TimedResponse {
  itemId: string
  latencyMs: number
}

export interface LikertResponse extends TimedResponse {
  value: number // escala 1-5
}

// 'decoy' = ítem señuelo (ver TIPI_DECOY_ITEMS en item-banks.ts): mismo
// formato visual que un ítem TIPI real, mezclado al azar entre ellos, pero
// no puntúa nada — diluye la señal de "esto mide 5 rasgos de personalidad
// x 2 ítems" para reducir el sesgo de deseabilidad social.
export interface TipiResponse extends LikertResponse {
  trait: 'extraversion' | 'agreeableness' | 'conscientiousness' | 'stability' | 'openness' | 'decoy'
  reverseScored: boolean
}

export interface FinancialObjectiveResponse extends TimedResponse {
  selectedOptionId: string
  correct: boolean
}

export interface ContextResponse extends TimedResponse {
  value: number | boolean
}

export interface GssTrialResult {
  scenarioId: string
  questionId: string
  initialAnswer: 'si' | 'no'
  initialLatencyMs: number
  finalAnswer: 'si' | 'no'
  finalLatencyMs: number
  yielded: boolean
  shifted: boolean
}

export interface ScenarioResult {
  scenarioId: string
  choice: ScenarioChoice
  correct: boolean
  latencyMs: number
}

// Las 4 sub-pruebas de tipo Go/No-Go (la clásica por color + 3 nuevas),
// cada una con su propio sub-score visible en el reporte. El factor
// "impulsividad" del modelo pentafactorial es el promedio de las 4.
export type GoNoGoSubTestKey = 'colorClasico' | 'formaNeutra' | 'semantico' | 'reglaInvertida'

export interface GoNoGoTrial {
  subTest: GoNoGoSubTestKey
  trialIndex: number
  type: 'go' | 'nogo'
  responded: boolean
  correct: boolean
  reactionTimeMs: number | null
}

export interface AssessmentSession {
  sessionId: string
  tokenId: string
  consentedAt: string
  startedAt: string
  completedAt: string | null
  tipi: TipiResponse[]
  financialObjective: FinancialObjectiveResponse[]
  financialConfidence: LikertResponse | null
  context: ContextResponse[]
  gss: GssTrialResult[]
  scenarios: ScenarioResult[]
  goNoGo: GoNoGoTrial[]
}

export type FactorKey =
  | 'personalidad'
  | 'vulnerabilidadFinanciera'
  | 'sugestionabilidad'
  | 'juicioSituacional'
  | 'impulsividad'

export interface FactorScore {
  factor: FactorKey
  label: string
  score: number // 0-100, mayor = mayor vulnerabilidad
  weight: number // ponderación dentro del Nivel 1
  description: string
}

export interface Nivel1Result {
  factors: FactorScore[]
  compositeScore: number // 0-100
}

export type RiskTier = 'bajo' | 'moderado' | 'alto' | 'critico'

export interface AssessmentResult {
  nivel1: Nivel1Result
  nivel2SimulatedScore: number
  nivel2Label: string
  totalScore: number
  riskTier: RiskTier
  generatedAt: string
}
