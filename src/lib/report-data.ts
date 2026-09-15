import type { AssessmentResult, AssessmentSession } from '@/types/assessment'
import { SCENARIO_MOCKS } from '@/lib/item-banks'

// Textos alineados a los términos usados en el informe (Vishing, Smishing,
// Quishing, Control Remoto) en vez de los ids internos de item-banks.ts.
const SCENARIO_KIND_LABEL: Record<(typeof SCENARIO_MOCKS)[number]['kind'], string> = {
  sms: 'Smishing (SMS)',
  push: 'Control Remoto (push)',
  llamada: 'Vishing (llamada)',
  qr: 'Quishing (QR)',
}

export interface Module1Breakdown {
  score: number
  overconfidenceGapPct: number // puntos porcentuales entre confianza autopercibida y desempeño objetivo
  objectiveCorrectCount: number
  objectiveTotal: number
  recentVictim: boolean
  recentAttempt: boolean
}

export interface Module2Breakdown {
  score: number
  yieldPct: number
  shiftPct: number
  trialCount: number
}

export interface ScenarioTypeStat {
  label: string
  correct: number
  total: number
  avgLatencyMs: number
}

export interface Module3Breakdown {
  score: number
  accuracyPct: number
  avgLatencyMs: number
  byType: ScenarioTypeStat[]
}

export interface Module4Breakdown {
  score: number
  commissionErrorPct: number
  omissionErrorPct: number
  avgReactionTimeMs: number
}

export interface ReportModuleData {
  module1: Module1Breakdown
  module2: Module2Breakdown
  module3: Module3Breakdown
  module4: Module4Breakdown
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
}

export function buildModuleBreakdown(
  session: AssessmentSession,
  result: AssessmentResult,
): ReportModuleData {
  const factorScore = (key: string) =>
    result.nivel1.factors.find((f) => f.factor === key)?.score ?? 0

  const objectiveTotal = session.financialObjective.length
  const objectiveCorrectCount = session.financialObjective.filter((r) => r.correct).length
  const objectiveFraction = objectiveTotal > 0 ? objectiveCorrectCount / objectiveTotal : 0.5
  const confidenceFraction = ((session.financialConfidence?.value ?? 3) - 1) / 4
  const overconfidenceGapPct = Math.round(
    Math.max(0, confidenceFraction - objectiveFraction) * 100,
  )

  const module1: Module1Breakdown = {
    score: factorScore('vulnerabilidadFinanciera'),
    overconfidenceGapPct,
    objectiveCorrectCount,
    objectiveTotal,
    recentVictim: Boolean(session.context.find((c) => c.itemId === 'ctx_victima_reciente')?.value),
    recentAttempt: Boolean(session.context.find((c) => c.itemId === 'ctx_intento_reciente')?.value),
  }

  const gssTotal = session.gss.length
  const module2: Module2Breakdown = {
    score: factorScore('sugestionabilidad'),
    yieldPct: gssTotal > 0 ? Math.round((session.gss.filter((t) => t.yielded).length / gssTotal) * 100) : 0,
    shiftPct: gssTotal > 0 ? Math.round((session.gss.filter((t) => t.shifted).length / gssTotal) * 100) : 0,
    trialCount: gssTotal,
  }

  const byTypeMap = new Map<string, { correct: number; total: number; latencies: number[] }>()
  for (const r of session.scenarios) {
    const mock = SCENARIO_MOCKS.find((m) => m.id === r.scenarioId)
    const label = mock ? SCENARIO_KIND_LABEL[mock.kind] : 'Otro'
    const entry = byTypeMap.get(label) ?? { correct: 0, total: 0, latencies: [] }
    entry.total += 1
    if (r.correct) entry.correct += 1
    entry.latencies.push(r.latencyMs)
    byTypeMap.set(label, entry)
  }
  const byType: ScenarioTypeStat[] = Array.from(byTypeMap.entries()).map(([label, v]) => ({
    label,
    correct: v.correct,
    total: v.total,
    avgLatencyMs: avg(v.latencies),
  }))
  const scenarioTotal = session.scenarios.length
  const scenarioCorrect = session.scenarios.filter((s) => s.correct).length
  const module3: Module3Breakdown = {
    score: factorScore('juicioSituacional'),
    accuracyPct: scenarioTotal > 0 ? Math.round((scenarioCorrect / scenarioTotal) * 100) : 0,
    avgLatencyMs: avg(session.scenarios.map((s) => s.latencyMs)),
    byType,
  }

  const goTrials = session.goNoGo.filter((t) => t.type === 'go')
  const noGoTrials = session.goNoGo.filter((t) => t.type === 'nogo')
  const commissionErrors = noGoTrials.filter((t) => t.responded).length
  const omissionErrors = goTrials.filter((t) => !t.responded).length
  const module4: Module4Breakdown = {
    score: factorScore('impulsividad'),
    commissionErrorPct: noGoTrials.length > 0 ? Math.round((commissionErrors / noGoTrials.length) * 100) : 0,
    omissionErrorPct: goTrials.length > 0 ? Math.round((omissionErrors / goTrials.length) * 100) : 0,
    avgReactionTimeMs: avg(
      goTrials.filter((t) => t.reactionTimeMs !== null).map((t) => t.reactionTimeMs as number),
    ),
  }

  return { module1, module2, module3, module4 }
}

/**
 * Frase diagnóstica breve basada en el factor con mayor contribución
 * ponderada (score * peso) al score total, para el resumen ejecutivo.
 */
export function buildDiagnosisSentence(result: AssessmentResult): string {
  const worst = [...result.nivel1.factors].sort((a, b) => b.score * b.weight - a.score * a.weight)[0]
  if (!worst || worst.score < 30) {
    return 'Perfil sin patrones dominantes de vulnerabilidad conductual detectados en esta administración del instrumento.'
  }
  const sentenceByFactor: Record<string, string> = {
    personalidad: 'Perfil de personalidad propenso a la complacencia ante solicitudes de terceros con apariencia de autoridad.',
    vulnerabilidadFinanciera: 'Perfil con brecha de sobreconfianza financiera y/o exposición reciente a intentos de fraude.',
    sugestionabilidad: 'Perfil propenso a la cesión de credenciales o información bajo presión de urgencia/autoridad.',
    juicioSituacional: 'Perfil con dificultad para distinguir comunicaciones fraudulentas de legítimas en escenarios simulados.',
    impulsividad: 'Perfil con control inhibitorio reducido bajo presión de tiempo, asociado a decisiones apresuradas.',
  }
  return sentenceByFactor[worst.factor] ?? 'Perfil con vulnerabilidad conductual detectada, ver desglose por módulo.'
}
