import type { AssessmentResult, FactorKey } from '@/types/assessment'

export type ControlCategory =
  | 'Temporización'
  | 'Verificación Out-of-Band'
  | 'Fricción Nudge'
  | 'Reglas de Bloqueo'

export interface MitigationControl {
  category: ControlCategory
  action: string
  justification: string
  priority: number // score*weight que originó el control, usado solo para ordenar
}

interface ControlRule {
  factor: FactorKey
  threshold: number // score (0-100) del factor a partir del cual se activa
  category: ControlCategory
  action: string
  justification: (score: number) => string
}

const RULES: ControlRule[] = [
  {
    factor: 'sugestionabilidad',
    threshold: 40,
    category: 'Verificación Out-of-Band',
    action:
      'Exigir confirmación por un canal secundario (app oficial o llamada de retorno a un número previamente registrado) antes de ejecutar instrucciones recibidas por canales no verificados.',
    justification: (score) =>
      `Índice de sugestionabilidad de ${score}/100: el usuario cedió y/o cambió respuestas ante presión de autoridad simulada (adaptado de GSS), patrón asociado a la cesión de credenciales en ataques de vishing/smishing.`,
  },
  {
    factor: 'juicioSituacional',
    threshold: 40,
    category: 'Fricción Nudge',
    action:
      'Mostrar una advertencia interstitial con checklist de verificación antes de confirmar transferencias a beneficiarios nuevos originadas tras una notificación push, SMS o llamada entrante.',
    justification: (score) =>
      `Tasa de error de ${score}/100 en escenarios simulados de phishing/vishing/quishing, indicando dificultad para distinguir comunicaciones fraudulentas de legítimas bajo presión de tiempo.`,
  },
  {
    factor: 'impulsividad',
    threshold: 35,
    category: 'Temporización',
    action:
      'Aplicar un retardo (cooling-off) de al menos 15 minutos en transferencias a destinatarios nuevos o de monto elevado, con opción de cancelación durante la espera.',
    justification: (score) =>
      `Tasa de errores de comisión de ${score}/100 en la tarea Go/No-Go, proxy conductual de control inhibitorio reducido bajo presión de tiempo.`,
  },
  {
    factor: 'vulnerabilidadFinanciera',
    threshold: 40,
    category: 'Reglas de Bloqueo',
    action:
      'Establecer un límite diario reducido y requerir revisión manual para transferencias que excedan significativamente el patrón histórico del cliente.',
    justification: (score) =>
      `Score de vulnerabilidad financiera de ${score}/100, combinando brecha de sobreconfianza y/o exposición reciente a intentos de fraude.`,
  },
  {
    factor: 'personalidad',
    threshold: 45,
    category: 'Fricción Nudge',
    action:
      'Incorporar mensajes de refuerzo educativo sobre tácticas de ingeniería social en los puntos de fricción transaccional (antes de confirmar pagos a nuevos destinatarios).',
    justification: (score) =>
      `Perfil de personalidad (TIPI) con score de ${score}/100 en el eje de amabilidad/baja escrupulosidad, rasgos asociados en la literatura a mayor susceptibilidad al engaño.`,
  },
]

const MAX_CONTROLS = 5

/**
 * Deriva la matriz de controles mitigantes a partir de los 5 factores del
 * Nivel 1. Cada regla se activa por umbral de score; el resultado se ordena
 * por relevancia (score * peso del factor) y se limita a MAX_CONTROLS para
 * que la tabla quepa en una página A4.
 */
export function deriveControls(result: AssessmentResult): MitigationControl[] {
  const scoreByFactor = new Map(result.nivel1.factors.map((f) => [f.factor, f]))

  const controls: MitigationControl[] = []
  for (const rule of RULES) {
    const factor = scoreByFactor.get(rule.factor)
    if (!factor || factor.score < rule.threshold) continue
    controls.push({
      category: rule.category,
      action: rule.action,
      justification: rule.justification(factor.score),
      priority: factor.score * factor.weight,
    })
  }

  if (result.riskTier === 'alto' || result.riskTier === 'critico') {
    controls.push({
      category: 'Reglas de Bloqueo',
      action:
        'Escalar la evaluación a revisión manual de un analista antifraude antes de liberar transacciones de riesgo elevado.',
      justification: `Score total de vulnerabilidad clasificado como riesgo ${result.riskTier} (${result.totalScore}/100).`,
      priority: result.totalScore,
    })
  }

  if (controls.length === 0) {
    controls.push({
      category: 'Fricción Nudge',
      action:
        'Mantener los controles estándar vigentes; reforzar comunicación educativa periódica sobre fraude de pagos autorizados (APP).',
      justification: 'Ningún factor del Nivel 1 superó el umbral de activación de controles reforzados.',
      priority: 0,
    })
  }

  return controls.sort((a, b) => b.priority - a.priority).slice(0, MAX_CONTROLS)
}
