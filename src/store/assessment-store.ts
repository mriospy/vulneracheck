import { create } from 'zustand'
import type { AssessmentResult, AssessmentSession, ScaleResponse } from '@/types/assessment'
import { newSessionId, shuffle } from '@/lib/metrics-collector'
import { computeAssessmentResult } from '@/lib/scoring-engine'
import { SCALE_ITEMS } from '@/lib/item-banks'
import { submitAssessmentToResearchStore, submitAssessmentToPlatform } from '@/lib/api-client'
import { appendHistoryEntry, getHistory, type HistoryEntry } from '@/lib/history-store'

const CURRENT_RESULT_KEY = 'vulneracheck.currentResult.v2'

interface StoredCompletedResult {
  session: AssessmentSession
  result: AssessmentResult
}

/**
 * El resultado recién calculado se guarda en sessionStorage (dura solo
 * mientras la pestaña sigue abierta) para que un reload accidental — o
 * uno deliberado tras un fallo de carga de un chunk luego de un
 * redeploy — no borre el resultado ya calculado del participante.
 */
function saveCurrentResult(session: AssessmentSession, result: AssessmentResult) {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.setItem(CURRENT_RESULT_KEY, JSON.stringify({ session, result }))
  } catch {
    // almacenamiento no disponible — no bloquea el flujo
  }
}

function loadCurrentResult(): StoredCompletedResult | null {
  if (typeof sessionStorage === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(CURRENT_RESULT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredCompletedResult
  } catch {
    return null
  }
}

function clearCurrentResult() {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.removeItem(CURRENT_RESULT_KEY)
  } catch {
    // no-op
  }
}

// Los 40 ítems se presentan mezclados entre dimensiones y en orden aleatorio
// por sesión, para que la persona no responda por bloques temáticos ni en
// "piloto automático". El orden usado queda registrado en la sesión.
function emptySession(tokenId: string): AssessmentSession {
  return {
    sessionId: newSessionId(),
    tokenId,
    consentedAt: new Date().toISOString(),
    startedAt: new Date().toISOString(),
    completedAt: null,
    itemOrder: shuffle(SCALE_ITEMS).map((i) => i.id),
    responses: [],
  }
}

interface AssessmentStore {
  tokenId: string | null
  consented: boolean
  session: AssessmentSession | null
  result: AssessmentResult | null
  isSubmitting: boolean
  history: HistoryEntry[]

  startSession: (tokenId: string) => void
  /** Registra o reemplaza (si la persona volvió atrás) la respuesta a un ítem. */
  setResponse: (r: ScaleResponse) => void
  finalizeAssessment: () => Promise<void>
  reset: () => void
}

const restored = loadCurrentResult()

export const useAssessmentStore = create<AssessmentStore>((set, get) => ({
  tokenId: restored?.session.tokenId ?? null,
  consented: false,
  session: restored?.session ?? null,
  result: restored?.result ?? null,
  isSubmitting: false,
  history: getHistory(),

  startSession: (tokenId) =>
    set({
      tokenId,
      consented: true,
      session: emptySession(tokenId),
      result: null,
    }),

  setResponse: (r) =>
    set((s) =>
      s.session
        ? {
            session: {
              ...s.session,
              responses: [...s.session.responses.filter((x) => x.itemId !== r.itemId), r],
            },
          }
        : s,
    ),

  finalizeAssessment: async () => {
    const { session } = get()
    if (!session) return
    set({ isSubmitting: true })
    try {
      const completedSession: AssessmentSession = {
        ...session,
        completedAt: new Date().toISOString(),
      }
      const result = computeAssessmentResult(completedSession)
      const history = appendHistoryEntry({
        sessionId: completedSession.sessionId,
        tokenId: completedSession.tokenId,
        completedAt: completedSession.completedAt ?? new Date().toISOString(),
        totalRawScore: result.totalRawScore,
        totalMaxScore: result.totalMaxScore,
        level: result.level,
      })
      set({ session: completedSession, result, isSubmitting: false, history })
      saveCurrentResult(completedSession, result)
      void submitAssessmentToResearchStore(completedSession, result)
      void submitAssessmentToPlatform(completedSession, result)
    } catch {
      set({ isSubmitting: false })
    }
  },

  reset: () => {
    clearCurrentResult()
    set({
      tokenId: null,
      consented: false,
      session: null,
      result: null,
      isSubmitting: false,
    })
  },
}))
