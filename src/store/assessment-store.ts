import { create } from 'zustand'
import type {
  AssessmentResult,
  AssessmentSession,
  ContextResponse,
  FinancialObjectiveResponse,
  GoNoGoTrial,
  GssTrialResult,
  LikertResponse,
  ScenarioResult,
  TipiResponse,
} from '@/types/assessment'
import { newSessionId } from '@/lib/metrics-collector'
import { computeAssessmentResult } from '@/lib/scoring-engine'
import { submitNivel2Webhook, submitAssessmentToResearchStore } from '@/lib/api-client'
import { appendHistoryEntry, getHistory, type HistoryEntry } from '@/lib/history-store'

export type ModuleKey = 'autorreporte' | 'microGss' | 'escenarios' | 'goNoGo'
export const MODULE_ORDER: ModuleKey[] = ['autorreporte', 'microGss', 'escenarios', 'goNoGo']

const CURRENT_RESULT_KEY = 'vulneracheck.currentResult.v1'

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

function emptySession(tokenId: string): AssessmentSession {
  return {
    sessionId: newSessionId(),
    tokenId,
    consentedAt: new Date().toISOString(),
    startedAt: new Date().toISOString(),
    completedAt: null,
    tipi: [],
    financialObjective: [],
    financialConfidence: null,
    context: [],
    gss: [],
    scenarios: [],
    goNoGo: [],
  }
}

interface AssessmentStore {
  tokenId: string | null
  consented: boolean
  session: AssessmentSession | null
  currentModuleIndex: number
  result: AssessmentResult | null
  isSubmitting: boolean
  history: HistoryEntry[]

  startSession: (tokenId: string) => void
  addTipiResponse: (r: TipiResponse) => void
  addFinancialObjectiveResponse: (r: FinancialObjectiveResponse) => void
  setFinancialConfidence: (r: LikertResponse) => void
  addContextResponse: (r: ContextResponse) => void
  addGssTrial: (r: GssTrialResult) => void
  addScenarioResult: (r: ScenarioResult) => void
  addGoNoGoTrial: (r: GoNoGoTrial) => void

  goToNextModule: () => void
  isLastModule: () => boolean
  finalizeAssessment: () => Promise<void>
  reset: () => void
}

const restored = loadCurrentResult()

export const useAssessmentStore = create<AssessmentStore>((set, get) => ({
  tokenId: restored?.session.tokenId ?? null,
  consented: false,
  session: restored?.session ?? null,
  currentModuleIndex: 0,
  result: restored?.result ?? null,
  isSubmitting: false,
  history: getHistory(),

  startSession: (tokenId) =>
    set({
      tokenId,
      consented: true,
      session: emptySession(tokenId),
      currentModuleIndex: 0,
      result: null,
    }),

  addTipiResponse: (r) =>
    set((s) => (s.session ? { session: { ...s.session, tipi: [...s.session.tipi, r] } } : s)),

  addFinancialObjectiveResponse: (r) =>
    set((s) =>
      s.session
        ? { session: { ...s.session, financialObjective: [...s.session.financialObjective, r] } }
        : s,
    ),

  setFinancialConfidence: (r) =>
    set((s) => (s.session ? { session: { ...s.session, financialConfidence: r } } : s)),

  addContextResponse: (r) =>
    set((s) =>
      s.session ? { session: { ...s.session, context: [...s.session.context, r] } } : s,
    ),

  addGssTrial: (r) =>
    set((s) => (s.session ? { session: { ...s.session, gss: [...s.session.gss, r] } } : s)),

  addScenarioResult: (r) =>
    set((s) =>
      s.session ? { session: { ...s.session, scenarios: [...s.session.scenarios, r] } } : s,
    ),

  addGoNoGoTrial: (r) =>
    set((s) =>
      s.session ? { session: { ...s.session, goNoGo: [...s.session.goNoGo, r] } } : s,
    ),

  goToNextModule: () =>
    set((s) => ({
      currentModuleIndex: Math.min(s.currentModuleIndex + 1, MODULE_ORDER.length - 1),
    })),

  isLastModule: () => get().currentModuleIndex === MODULE_ORDER.length - 1,

  finalizeAssessment: async () => {
    const { session } = get()
    if (!session) return
    set({ isSubmitting: true })
    try {
      const completedSession: AssessmentSession = {
        ...session,
        completedAt: new Date().toISOString(),
      }
      const nivel2 = await submitNivel2Webhook(completedSession)
      const result = computeAssessmentResult(completedSession, nivel2.score, nivel2.label)
      const history = appendHistoryEntry({
        sessionId: completedSession.sessionId,
        tokenId: completedSession.tokenId,
        completedAt: completedSession.completedAt ?? new Date().toISOString(),
        totalScore: result.totalScore,
        riskTier: result.riskTier,
      })
      set({ session: completedSession, result, isSubmitting: false, history })
      saveCurrentResult(completedSession, result)
      void submitAssessmentToResearchStore(completedSession, result)
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
      currentModuleIndex: 0,
      result: null,
      isSubmitting: false,
    })
  },
}))
