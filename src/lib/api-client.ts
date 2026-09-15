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
