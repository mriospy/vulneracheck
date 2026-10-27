import type {
  AssessmentResult,
  AssessmentSession,
  DimensionScore,
  RiskLevel,
} from '@/types/assessment'
import { DIMENSIONS, SCALE_ITEMS, type ScaleItem } from '@/lib/item-banks'

// --- Puntuación de la escala -------------------------------------------------
// Cada ítem puntúa 1-5. Los inversos se invierten (6 - valor) para que en
// todos los ítems un puntaje mayor signifique mayor vulnerabilidad. El
// puntaje de cada dimensión es la suma simple de sus ítems y el total es la
// suma de las 5 dimensiones, como indica el anteproyecto.
//
// Clasificación en 3 niveles por intervalos iguales del rango teórico
// [mín, máx] de cada suma (con 8 ítems: bajo 8-18, medio 19-29, alto 30-40;
// total de 40 ítems: bajo 40-93, medio 94-146, alto 147-200). Son puntos de
// corte teóricos: la validación psicométrica de campo (AFC, baremos) queda
// fuera del alcance de la tesis (ver Delimitación del proyecto).

const ITEM_BY_ID = new Map(SCALE_ITEMS.map((i) => [i.id, i]))

export function adjustedValue(item: ScaleItem, value: number): number {
  return item.reverseScored ? 6 - value : value
}

export function levelFor(raw: number, min: number, max: number): RiskLevel {
  const range = max - min
  if (raw <= Math.floor(min + range / 3)) return 'bajo'
  if (raw <= Math.floor(min + (2 * range) / 3)) return 'medio'
  return 'alto'
}

function toNormalized(raw: number, min: number, max: number): number {
  if (max === min) return 0
  return Math.round(((raw - min) / (max - min)) * 100)
}

export function computeDimensionScores(session: AssessmentSession): DimensionScore[] {
  return DIMENSIONS.map((dim) => {
    let rawScore = 0
    let itemCount = 0
    const rawByContext = { cotidiano: 0, bancario: 0 }
    for (const r of session.responses) {
      const item = ITEM_BY_ID.get(r.itemId)
      if (!item || item.dimension !== dim.key) continue
      const adjusted = adjustedValue(item, r.value)
      rawScore += adjusted
      rawByContext[item.context] += adjusted
      itemCount += 1
    }
    const minScore = itemCount
    const maxScore = itemCount * 5
    return {
      dimension: dim.key,
      label: dim.label,
      rawScore,
      minScore,
      maxScore,
      normalizedScore: toNormalized(rawScore, minScore, maxScore),
      level: levelFor(rawScore, minScore, maxScore),
      itemCount,
      rawByContext,
    }
  })
}

export function computeAssessmentResult(session: AssessmentSession): AssessmentResult {
  const dimensions = computeDimensionScores(session)
  const totalRawScore = dimensions.reduce((sum, d) => sum + d.rawScore, 0)
  const totalMinScore = dimensions.reduce((sum, d) => sum + d.minScore, 0)
  const totalMaxScore = dimensions.reduce((sum, d) => sum + d.maxScore, 0)

  return {
    dimensions,
    totalRawScore,
    totalMinScore,
    totalMaxScore,
    totalNormalizedScore: toNormalized(totalRawScore, totalMinScore, totalMaxScore),
    level: levelFor(totalRawScore, totalMinScore, totalMaxScore),
    generatedAt: new Date().toISOString(),
  }
}
