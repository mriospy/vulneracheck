import type { AssessmentResult, AssessmentSession } from '@/types/assessment'

/**
 * Simulación del Nivel 2 (Perfil Transaccional y Entorno Técnico, 40% del
 * score total). En producción esto sería un webhook real hacia el Core
 * Bancario que analiza historial transaccional y huella del dispositivo.
 * Acá se simula localmente con una latencia de red artificial y un score
 * pseudoaleatorio acotado, dejando el contrato de la función estable para
 * que un backend real pueda reemplazar esta implementación sin tocar
 * scoring-engine.ts ni la UI.
 */
export interface Nivel2WebhookPayload {
  sessionId: string
  tokenId: string
  clientTimestamp: string
  userAgent: string
}

export interface Nivel2WebhookResponse {
  score: number // 0-100, mayor = mayor riesgo transaccional/técnico
  label: string
  source: 'simulado'
}

const SIMULATED_LATENCY_MS = 600

export async function submitNivel2Webhook(
  session: AssessmentSession,
): Promise<Nivel2WebhookResponse> {
  const payload: Nivel2WebhookPayload = {
    sessionId: session.sessionId,
    tokenId: session.tokenId,
    clientTimestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
  }

  await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS))

  // Placeholder determinístico-aleatorio: en la versión real, el Core
  // Bancario devolvería un score basado en CAM/CAS/HRS (ver flujo de gating
  // documentado en el proyecto). Acá solo generamos ruido acotado para que
  // el dashboard de resultados sea funcional end-to-end.
  const score = Math.round(20 + Math.random() * 40)

  void payload // el payload se arma para documentar el contrato del webhook real

  return {
    score,
    label: 'Perfil Transaccional y Entorno Técnico (simulado)',
    source: 'simulado',
  }
}

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

const RISK_TIER_TO_PLATFORM: Record<AssessmentResult['riskTier'], string> = {
  bajo: 'BAJO',
  moderado: 'MODERADO',
  alto: 'ALTO',
  critico: 'CRITICO',
}

/**
 * Reporta el resultado completado a la plataforma (para que el analista lo
 * vea en /dashboard/campaigns/[id]) además de al researchStore. Silencioso
 * ante fallos, igual que submitAssessmentToResearchStore.
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
        totalScore: result.totalScore,
        riskTier: RISK_TIER_TO_PLATFORM[result.riskTier],
        nivel1Score: result.nivel1.compositeScore,
        nivel2SimulatedScore: result.nivel2SimulatedScore,
        factorScores: result.nivel1.factors,
      }),
    })
  } catch {
    // no interrumpe el flujo del participante
  }
}
