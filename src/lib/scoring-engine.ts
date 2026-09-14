import type {
  AssessmentResult,
  AssessmentSession,
  FactorKey,
  FactorScore,
  Nivel1Result,
  RiskTier,
} from '@/types/assessment'
import { TIPI_ITEMS } from '@/lib/item-banks'

// --- Modelo Pentafactorial -------------------------------------------------
// El Nivel 1 (Perfil de Vulnerabilidad Conductual, 60% del score total) se
// descompone en 5 factores. Las ponderaciones son parámetros de
// pre-calibración: se fijaron por diseño en base a la literatura citada en
// cada módulo (ver caption de cada componente), no por ajuste empírico sobre
// datos propios todavía. Deben recalibrarse una vez recolectada una muestra
// piloto (ver panel de validación en ResultsPage).
export const FACTOR_WEIGHTS: Record<FactorKey, number> = {
  personalidad: 0.15,
  vulnerabilidadFinanciera: 0.2,
  sugestionabilidad: 0.25,
  juicioSituacional: 0.25,
  impulsividad: 0.15,
}

const FACTOR_LABELS: Record<FactorKey, string> = {
  personalidad: 'Personalidad (TIPI)',
  vulnerabilidadFinanciera: 'Vulnerabilidad Financiera',
  sugestionabilidad: 'Sugestionabilidad (Micro-GSS)',
  juicioSituacional: 'Juicio Situacional',
  impulsividad: 'Impulsividad (Go/No-Go)',
}

const FACTOR_DESCRIPTIONS: Record<FactorKey, string> = {
  personalidad:
    'Rasgos de amabilidad y baja escrupulosidad, asociados en la literatura a mayor susceptibilidad al engaño.',
  vulnerabilidadFinanciera:
    'Brecha entre confianza financiera percibida y conocimiento objetivo, más exposición reciente a intentos de fraude.',
  sugestionabilidad:
    'Tendencia a ceder ante preguntas líder y a cambiar respuestas bajo presión de autoridad simulada (adaptado de GSS).',
  juicioSituacional:
    'Precisión y velocidad de decisión ante escenarios simulados de phishing, vishing y push notifications fraudulentas.',
  impulsividad:
    'Errores de comisión en tarea Go/No-Go: responder cuando se debía inhibir la respuesta, proxy de control inhibitorio bajo presión de tiempo.',
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n))
}

function toScore100(fraction: number): number {
  return Math.round(clamp01(fraction) * 100)
}

// --- Factor 1: Personalidad (TIPI) -----------------------------------------
// Puntúa 1-5 por ítem; los reverse-scored se invierten (6 - valor) antes de
// promediar por rasgo. Vulnerabilidad = alta Amabilidad + baja Escrupulosidad
// (perfil "complaciente y poco meticuloso", ver Abroshan et al. 2026).
export function scorePersonalidad(session: AssessmentSession): number {
  const byTrait = new Map<string, number[]>()
  for (const r of session.tipi) {
    const item = TIPI_ITEMS.find((i) => i.id === r.itemId)
    if (!item) continue
    const adjusted = item.reverseScored ? 6 - r.value : r.value
    const arr = byTrait.get(item.trait) ?? []
    arr.push(adjusted)
    byTrait.set(item.trait, arr)
  }
  const avg = (trait: string) => {
    const arr = byTrait.get(trait)
    if (!arr || arr.length === 0) return 3 // neutral si falta el ítem
    return arr.reduce((a, b) => a + b, 0) / arr.length
  }
  const agreeableness = avg('agreeableness') // 1-5, mayor = más vulnerable
  const conscientiousness = avg('conscientiousness') // 1-5, mayor = menos vulnerable

  const agreeablenessFraction = (agreeableness - 1) / 4
  const lowConscientiousnessFraction = 1 - (conscientiousness - 1) / 4

  return toScore100(0.5 * agreeablenessFraction + 0.5 * lowConscientiousnessFraction)
}

// --- Factor 2: Vulnerabilidad Financiera ------------------------------------
// Combina la brecha de sobreconfianza (Lusardi-Mitchell: autopercepción vs.
// desempeño objetivo) con el contexto de exposición/victimización reciente.
export function scoreVulnerabilidadFinanciera(session: AssessmentSession): number {
  const totalObjective = session.financialObjective.length
  const correctCount = session.financialObjective.filter((r) => r.correct).length
  const objectiveFraction = totalObjective > 0 ? correctCount / totalObjective : 0.5

  const confidenceValue = session.financialConfidence?.value ?? 3
  const confidenceFraction = (confidenceValue - 1) / 4

  // Brecha de sobreconfianza: confía más de lo que su desempeño justifica.
  const overconfidenceGap = clamp01(confidenceFraction - objectiveFraction)

  const victimaReciente = boolContext(session, 'ctx_victima_reciente')
  const intentoReciente = boolContext(session, 'ctx_intento_reciente')
  const noVerifica = 1 - likertContextFraction(session, 'ctx_verifica_canal_oficial')

  const contextFraction =
    0.5 * (victimaReciente ? 1 : 0) + 0.3 * (intentoReciente ? 1 : 0) + 0.2 * noVerifica

  return toScore100(0.55 * overconfidenceGap + 0.45 * contextFraction)
}

function boolContext(session: AssessmentSession, id: string): boolean {
  const r = session.context.find((c) => c.itemId === id)
  return r ? Boolean(r.value) : false
}

function likertContextFraction(session: AssessmentSession, id: string): number {
  const r = session.context.find((c) => c.itemId === id)
  if (!r || typeof r.value !== 'number') return 0.5
  return (r.value - 1) / 4
}

// --- Factor 3: Sugestionabilidad (Micro-GSS) --------------------------------
// Yield = ceder ante la pregunta líder en la primera pasada.
// Shift = cambiar la respuesta tras la retroalimentación de presión/autoridad.
// GSS clásico pondera "shift" como el indicador más específico de
// sugestionabilidad interrogativa (vs. aquiescencia simple).
export function scoreSugestionabilidad(session: AssessmentSession): number {
  const total = session.gss.length
  if (total === 0) return 0
  const yieldCount = session.gss.filter((t) => t.yielded).length
  const shiftCount = session.gss.filter((t) => t.shifted).length
  const yieldFraction = yieldCount / total
  const shiftFraction = shiftCount / total
  return toScore100(0.35 * yieldFraction + 0.65 * shiftFraction)
}

// --- Factor 4: Juicio Situacional --------------------------------------------
// Fracción de escenarios resueltos incorrectamente (acción distinta a
// "verificar por canal oficial" / "ignorar" según el caso). La latencia
// extremadamente baja en respuestas incorrectas suma un pequeño peso extra:
// decidir mal Y rápido es consistente con procesamiento heurístico (Sistema 1).
export function scoreJuicioSituacional(session: AssessmentSession): number {
  const total = session.scenarios.length
  if (total === 0) return 0
  const incorrect = session.scenarios.filter((s) => !s.correct)
  const errorFraction = incorrect.length / total

  const fastWrong = incorrect.filter((s) => s.latencyMs < 3000).length
  const fastWrongFraction = incorrect.length > 0 ? fastWrong / incorrect.length : 0

  return toScore100(0.85 * errorFraction + 0.15 * fastWrongFraction * errorFraction)
}

// --- Factor 5: Impulsividad (Go/No-Go) --------------------------------------
// Los errores de comisión (responder en un ensayo No-Go) son el indicador
// principal de falta de control inhibitorio. Las omisiones en ensayos Go
// pesan menos (pueden reflejar distracción, no impulsividad).
export function scoreImpulsividad(session: AssessmentSession): number {
  const goTrials = session.goNoGo.filter((t) => t.type === 'go')
  const noGoTrials = session.goNoGo.filter((t) => t.type === 'nogo')
  if (goTrials.length === 0 && noGoTrials.length === 0) return 0

  const commissionErrors = noGoTrials.filter((t) => t.responded).length
  const commissionFraction = noGoTrials.length > 0 ? commissionErrors / noGoTrials.length : 0

  const omissionErrors = goTrials.filter((t) => !t.responded).length
  const omissionFraction = goTrials.length > 0 ? omissionErrors / goTrials.length : 0

  return toScore100(0.8 * commissionFraction + 0.2 * omissionFraction)
}

export function computeNivel1(session: AssessmentSession): Nivel1Result {
  const scores: Record<FactorKey, number> = {
    personalidad: scorePersonalidad(session),
    vulnerabilidadFinanciera: scoreVulnerabilidadFinanciera(session),
    sugestionabilidad: scoreSugestionabilidad(session),
    juicioSituacional: scoreJuicioSituacional(session),
    impulsividad: scoreImpulsividad(session),
  }

  const factors: FactorScore[] = (Object.keys(scores) as FactorKey[]).map((key) => ({
    factor: key,
    label: FACTOR_LABELS[key],
    score: scores[key],
    weight: FACTOR_WEIGHTS[key],
    description: FACTOR_DESCRIPTIONS[key],
  }))

  const compositeScore = Math.round(
    factors.reduce((sum, f) => sum + f.score * f.weight, 0),
  )

  return { factors, compositeScore }
}

function riskTierFor(totalScore: number): RiskTier {
  if (totalScore < 25) return 'bajo'
  if (totalScore < 50) return 'moderado'
  if (totalScore < 75) return 'alto'
  return 'critico'
}

/**
 * Combina el Nivel 1 (medido, 60%) con el Nivel 2 (simulado, 40%, ver
 * lib/api-client.ts) en el score total y el nivel de riesgo.
 */
export function computeAssessmentResult(
  session: AssessmentSession,
  nivel2SimulatedScore: number,
  nivel2Label: string,
): AssessmentResult {
  const nivel1 = computeNivel1(session)
  const totalScore = Math.round(nivel1.compositeScore * 0.6 + nivel2SimulatedScore * 0.4)

  return {
    nivel1,
    nivel2SimulatedScore,
    nivel2Label,
    totalScore,
    riskTier: riskTierFor(totalScore),
    generatedAt: new Date().toISOString(),
  }
}
