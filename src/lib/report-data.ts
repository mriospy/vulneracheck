import type { AssessmentResult, AssessmentSession, DimensionKey } from '@/types/assessment'
import { LIKERT_LABELS, SCALE_ITEMS, type ScaleItem } from '@/lib/item-banks'
import { adjustedValue } from '@/lib/scoring-engine'

export const LEVEL_LABEL = { bajo: 'Bajo', medio: 'Medio', alto: 'Alto' } as const
export const VULNERABILITY_LABEL = {
  bajo: 'Vulnerabilidad baja',
  medio: 'Vulnerabilidad media',
  alto: 'Vulnerabilidad alta',
} as const

export interface SenalDetectada {
  item: ScaleItem
  value: number // respuesta original 1-5
  adjusted: number // 4 o 5 = respuesta en dirección vulnerable
  /** Etiqueta Likert de lo que respondió. Necesaria en los ítems inversos,
   *  donde el texto es protector y lo vulnerable fue estar en desacuerdo. */
  answerLabel: string
}

/**
 * Ítems respondidos en la dirección vulnerable (puntaje ajustado >= 4), por
 * dimensión. Le muestran a la persona qué situaciones concretas explican su
 * puntaje, en lugar de un número abstracto.
 */
export function buildSenales(session: AssessmentSession): Record<DimensionKey, SenalDetectada[]> {
  const byDimension: Record<DimensionKey, SenalDetectada[]> = {
    urgencia: [],
    autoridad: [],
    reciprocidad: [],
    conformidad: [],
    alfabetizacion: [],
  }
  for (const r of session.responses) {
    const item = SCALE_ITEMS.find((i) => i.id === r.itemId)
    if (!item) continue
    const adjusted = adjustedValue(item, r.value)
    if (adjusted >= 4) {
      byDimension[item.dimension].push({ item, value: r.value, adjusted, answerLabel: LIKERT_LABELS[r.value - 1] })
    }
  }
  for (const list of Object.values(byDimension)) list.sort((a, b) => b.adjusted - a.adjusted)
  return byDimension
}

/** Frase diagnóstica breve para el resumen, basada en la dimensión más alta. */
export function buildDiagnosisSentence(result: AssessmentResult): string {
  const vulnerable = result.dimensions.filter((d) => d.level !== 'bajo')
  if (vulnerable.length === 0) {
    return 'No se detectaron dimensiones con vulnerabilidad media o alta en esta evaluación.'
  }
  const worst = [...vulnerable].sort((a, b) => b.normalizedScore - a.normalizedScore)[0]
  const others = vulnerable.length - 1
  const suffix =
    others > 0 ? ` Además, ${others} dimensión${others > 1 ? 'es' : ''} más en nivel medio o alto.` : ''
  return `Tu punto más débil es la dimensión "${worst.label}" (nivel ${LEVEL_LABEL[worst.level].toLowerCase()}).${suffix}`
}
