import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAssessmentStore } from '@/store/assessment-store'
import { nowMs, elapsedSince, shuffle } from '@/lib/metrics-collector'
import {
  TIPI_ITEMS,
  FINANCIAL_OBJECTIVE_ITEMS,
  CONTEXT_ITEMS,
  type TipiItem,
  type FinancialObjectiveItem,
  type ContextItem,
} from '@/lib/item-banks'

type Step =
  | { kind: 'tipi'; item: TipiItem }
  | { kind: 'financial'; item: FinancialObjectiveItem }
  | { kind: 'confidence' }
  | { kind: 'context'; item: ContextItem }

const LIKERT_LABELS = ['Muy en desacuerdo', 'En desacuerdo', 'Neutral', 'De acuerdo', 'Muy de acuerdo']

export function ModuleAutorreporte({ onComplete }: { onComplete: () => void }) {
  const addTipiResponse = useAssessmentStore((s) => s.addTipiResponse)
  const addFinancialObjectiveResponse = useAssessmentStore((s) => s.addFinancialObjectiveResponse)
  const setFinancialConfidence = useAssessmentStore((s) => s.setFinancialConfidence)
  const addContextResponse = useAssessmentStore((s) => s.addContextResponse)

  const steps = useMemo<Step[]>(() => {
    const tipiSteps: Step[] = shuffle(TIPI_ITEMS).map((item) => ({ kind: 'tipi', item }))
    const financialSteps: Step[] = shuffle(FINANCIAL_OBJECTIVE_ITEMS).map((item) => ({
      kind: 'financial',
      item,
    }))
    const contextSteps: Step[] = shuffle(CONTEXT_ITEMS).map((item) => ({ kind: 'context', item }))
    return [...tipiSteps, ...financialSteps, { kind: 'confidence' }, ...contextSteps]
  }, [])

  const [index, setIndex] = useState(0)
  const [stepStart, setStepStart] = useState(() => nowMs())

  useEffect(() => {
    setStepStart(nowMs())
  }, [index])

  const advance = () => {
    if (index + 1 >= steps.length) {
      onComplete()
    } else {
      setIndex(index + 1)
    }
  }

  const step = steps[index]

  const answerLikert = (value: number) => {
    const latencyMs = elapsedSince(stepStart)
    if (step.kind === 'tipi') {
      addTipiResponse({ itemId: step.item.id, value, latencyMs, trait: step.item.trait, reverseScored: step.item.reverseScored })
    } else if (step.kind === 'confidence') {
      setFinancialConfidence({ itemId: 'fin_confianza', value, latencyMs })
    } else if (step.kind === 'context') {
      addContextResponse({ itemId: step.item.id, value, latencyMs })
    }
    advance()
  }

  const answerBoolean = (value: boolean) => {
    if (step.kind !== 'context') return
    addContextResponse({ itemId: step.item.id, value, latencyMs: elapsedSince(stepStart) })
    advance()
  }

  const answerFinancial = (optionId: string) => {
    if (step.kind !== 'financial') return
    addFinancialObjectiveResponse({
      itemId: step.item.id,
      selectedOptionId: optionId,
      correct: optionId === step.item.correctOptionId,
      latencyMs: elapsedSince(stepStart),
    })
    advance()
  }

  return (
    <div className="flex flex-col gap-4">
      <Progress value={((index + 1) / steps.length) * 100} />
      <Card>
        <CardHeader>
          <CardTitle>Módulo 1 · Autorreporte</CardTitle>
          <CardDescription>
            Personalidad (TIPI), educación financiera y contexto de exposición al fraude.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {step.kind === 'tipi' && (
            <>
              <p className="text-base font-medium">
                Me percibo a mí mismo/a como: <span className="text-primary">{step.item.text}</span>
              </p>
              <LikertScale onSelect={answerLikert} />
            </>
          )}

          {step.kind === 'financial' && (
            <>
              <p className="text-base font-medium">{step.item.prompt}</p>
              <div className="flex flex-col gap-2">
                {step.item.options.map((opt) => (
                  <Button
                    key={opt.id}
                    variant="outline"
                    className="justify-start whitespace-normal text-left"
                    onClick={() => answerFinancial(opt.id)}
                  >
                    {opt.text}
                  </Button>
                ))}
              </div>
            </>
          )}

          {step.kind === 'confidence' && (
            <>
              <p className="text-base font-medium">
                En general, considero que mi nivel de conocimiento financiero es alto.
              </p>
              <LikertScale onSelect={answerLikert} />
            </>
          )}

          {step.kind === 'context' && step.item.type === 'boolean' && (
            <>
              <p className="text-base font-medium">{step.item.text}</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => answerBoolean(true)}>
                  Sí
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => answerBoolean(false)}>
                  No
                </Button>
              </div>
            </>
          )}

          {step.kind === 'context' && step.item.type === 'likert' && (
            <>
              <p className="text-base font-medium">{step.item.text}</p>
              <LikertScale onSelect={answerLikert} />
            </>
          )}
        </CardContent>
      </Card>
      <p className="text-center text-xs text-muted-foreground">
        Ítem {index + 1} de {steps.length} · banco aleatorizado por sesión
      </p>
    </div>
  )
}

function LikertScale({ onSelect }: { onSelect: (value: number) => void }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {LIKERT_LABELS.map((label, i) => (
        <button
          key={label}
          onClick={() => onSelect(i + 1)}
          className="flex flex-col items-center gap-1.5 rounded-xl border border-border p-2 text-center transition-colors hover:border-primary hover:bg-primary/5 active:scale-95"
        >
          <span className="text-lg font-semibold">{i + 1}</span>
          <span className="text-[10px] leading-tight text-muted-foreground">{label}</span>
        </button>
      ))}
    </div>
  )
}
