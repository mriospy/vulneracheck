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
import { submitNivel2Webhook } from '@/lib/api-client'
import { appendHistoryEntry, getHistory, type HistoryEntry } from '@/lib/history-store'

export type ModuleKey = 'autorreporte' | 'microGss' | 'escenarios' | 'goNoGo'
export const MODULE_ORDER: ModuleKey[] = ['autorreporte', 'microGss', 'escenarios', 'goNoGo']

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

export const useAssessmentStore = create<AssessmentStore>((set, get) => ({
  tokenId: null,
  consented: false,
  session: null,
  currentModuleIndex: 0,
  result: null,
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
    } catch {
      set({ isSubmitting: false })
    }
  },

  reset: () =>
    set({
      tokenId: null,
      consented: false,
      session: null,
      currentModuleIndex: 0,
      result: null,
      isSubmitting: false,
    }),
}))
