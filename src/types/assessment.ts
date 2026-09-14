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

export interface TipiResponse extends LikertResponse {
  trait: 'extraversion' | 'agreeableness' | 'conscientiousness' | 'stability' | 'openness'
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

export interface GoNoGoTrial {
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
