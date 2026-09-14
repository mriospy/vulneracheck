import { useEffect, useMemo, useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAssessmentStore } from '@/store/assessment-store'
import { nowMs, elapsedSince, pickRandom } from '@/lib/metrics-collector'
import { GSS_SCENARIOS } from '@/lib/item-banks'

type Phase = 'narrativa' | 'pregunta_inicial' | 'presion' | 'pregunta_final'

export function ModuleMicroGSS({ onComplete }: { onComplete: () => void }) {
  const addGssTrial = useAssessmentStore((s) => s.addGssTrial)
  const scenario = useMemo(() => pickRandom(GSS_SCENARIOS), [])

  const [phase, setPhase] = useState<Phase>('narrativa')
  const [qIndex, setQIndex] = useState(0)
  const [initialAnswers, setInitialAnswers] = useState<Record<string, { answer: 'si' | 'no'; latency: number }>>({})
  const [stepStart, setStepStart] = useState(() => nowMs())

  useEffect(() => {
    setStepStart(nowMs())
  }, [phase, qIndex])

  const question = scenario.questions[qIndex]

  const handleInitialAnswer = (answer: 'si' | 'no') => {
    const latency = elapsedSince(stepStart)
    setInitialAnswers((prev) => ({ ...prev, [question.id]: { answer, latency } }))
    if (qIndex + 1 < scenario.questions.length) {
      setQIndex(qIndex + 1)
    } else {
      setQIndex(0)
      setPhase('presion')
    }
  }

  const handleFinalAnswer = (answer: 'si' | 'no') => {
    const latency = elapsedSince(stepStart)
    const initial = initialAnswers[question.id]
    addGssTrial({
      scenarioId: scenario.id,
      questionId: question.id,
      initialAnswer: initial.answer,
      initialLatencyMs: initial.latency,
      finalAnswer: answer,
      finalLatencyMs: latency,
      yielded: initial.answer === 'si',
      shifted: answer !== initial.answer,
    })
    if (qIndex + 1 < scenario.questions.length) {
      setQIndex(qIndex + 1)
    } else {
      onComplete()
    }
  }

  const totalSteps = 1 + scenario.questions.length + 1 + scenario.questions.length
  const currentStep =
    phase === 'narrativa'
      ? 1
      : phase === 'pregunta_inicial'
        ? 1 + qIndex + 1
        : phase === 'presion'
          ? 1 + scenario.questions.length + 1
          : 1 + scenario.questions.length + 1 + qIndex + 1

  return (
    <div className="flex flex-col gap-4">
      <Progress value={(currentStep / totalSteps) * 100} />
      <Card>
        <CardHeader>
          <CardTitle>Módulo 2 · Micro-GSS</CardTitle>
          <CardDescription>Comprensión de mensajes bajo presión.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {phase === 'narrativa' && (
            <>
              <p className="text-base leading-relaxed">{scenario.narrative}</p>
              <Button onClick={() => setPhase('pregunta_inicial')}>Continuar</Button>
            </>
          )}

          {phase === 'pregunta_inicial' && (
            <>
              <p className="text-base font-medium">{question.text}</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => handleInitialAnswer('si')}>
                  Sí
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => handleInitialAnswer('no')}>
                  No
                </Button>
              </div>
            </>
          )}

          {phase === 'presion' && (
            <>
              <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <p className="text-sm text-amber-900 dark:text-amber-200">{scenario.pressureMessage}</p>
              </div>
              <Button onClick={() => setPhase('pregunta_final')}>Reconfirmar respuestas</Button>
            </>
          )}

          {phase === 'pregunta_final' && (
            <>
              <p className="text-base font-medium">{question.text}</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => handleFinalAnswer('si')}>
                  Sí
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => handleFinalAnswer('no')}>
                  No
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
