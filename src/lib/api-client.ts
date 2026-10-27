import type { AssessmentResult, AssessmentSession } from '@/types/assessment'

/**
 * Envía la evaluación completa (anónima, vinculada solo al token elegido
 * por el participante) al backend de recolección de datos de la tesis
 * (Netlify Function + Blobs, ver netlify/functions/submit-assessment.mts).
 * Falla en silencio: si el envío no llega (offline, función caída, etc.)
 * el participante igual ve su resultado — nunca debe bloquear el flujo.
 */
export async function submitAssessmentToResearchStore(
  session: AssessmentSession,
  result: AssessmentResult,
): Promise<void> {
  try {
    await fetch('/api/submit-assessment', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ session, result }),
    })
  } catch {
    // sin conexión o función no disponible — no interrumpe el flujo del participante
  }
}

/**
 * Integración opcional con la plataforma SaaS (vulneracheck-platform).
 * Solo se activa si VITE_PLATFORM_URL está configurada en el build — en
 * caso contrario la PWA sigue funcionando 100% standalone (comportamiento
 * actual, sin cambios). Ver netlify/functions y vulneracheck-platform/src
 * /app/api/public/tokens para el contrato de estos endpoints.
 */
const PLATFORM_URL = (import.meta.env.VITE_PLATFORM_URL as string | undefined)?.replace(/\/$/, '')

export interface TokenValidation {
  /** true si se pudo consultar la plataforma (aunque el token no sea válido) */
  checked: boolean
  valid: boolean
  reason?: string
}

/**
 * Valida un token de campaña contra la plataforma antes de arrancar el
 * test. Si la plataforma no está configurada o no responde, no bloquea:
 * se asume válido para no romper el uso standalone de la PWA.
 */
export async function validatePlatformToken(tokenId: string): Promise<TokenValidation> {
  if (!PLATFORM_URL) return { checked: false, valid: true }
  try {
    const res = await fetch(`${PLATFORM_URL}/api/public/tokens/${encodeURIComponent(tokenId)}`)
    const data = await res.json().catch(() => ({}))
    if (res.ok) return { checked: true, valid: Boolean(data.valid) }
    return { checked: true, valid: false, reason: data.reason }
  } catch {
    return { checked: false, valid: true }
  }
}

// La plataforma conserva su enum RiskTier de 4 valores; MODERADO ya se
// muestra como "Medio" en el dashboard. La escala de 3 niveles nunca envía
// CRITICO.
const LEVEL_TO_PLATFORM: Record<AssessmentResult['level'], string> = {
  bajo: 'BAJO',
  medio: 'MODERADO',
  alto: 'ALTO',
}

/**
 * Reporta el resultado completado a la plataforma (para que el analista lo
 * vea en /dashboard/campaigns/[id]) además de al researchStore. Silencioso
 * ante fallos, igual que submitAssessmentToResearchStore. La plataforma
 * espera puntajes 0-100, así que se envía el total normalizado; los puntajes
 * brutos por dimensión viajan en factorScores.
 */
export async function submitAssessmentToPlatform(
  session: AssessmentSession,
  result: AssessmentResult,
): Promise<void> {
  if (!PLATFORM_URL) return
  try {
    await fetch(`${PLATFORM_URL}/api/public/tokens/${encodeURIComponent(session.tokenId)}/submit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        totalScore: result.totalNormalizedScore,
        riskTier: LEVEL_TO_PLATFORM[result.level],
        nivel1Score: result.totalNormalizedScore,
        nivel2SimulatedScore: 0, // el instrumento ya no tiene Nivel 2; el campo sigue siendo obligatorio en la plataforma
        factorScores: result.dimensions.map((d) => ({
          factor: d.dimension,
          label: d.label,
          score: d.normalizedScore,
          weight: 1 / result.dimensions.length,
          rawScore: d.rawScore,
          maxScore: d.maxScore,
          level: d.level,
        })),
      }),
    })
  } catch {
    // no interrumpe el flujo del participante
  }
}
