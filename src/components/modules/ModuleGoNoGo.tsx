import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAssessmentStore } from '@/store/assessment-store'
import { nowMs, elapsedSince, shuffle } from '@/lib/metrics-collector'
import { GO_NO_GO_CONFIG } from '@/lib/item-banks'
import type { GoNoGoTrial } from '@/types/assessment'

type TrialType = 'go' | 'nogo'
type Phase = 'instrucciones' | 'blank' | 'stimulus' | 'finalizando'

function buildTrialSequence(): TrialType[] {
  const { totalTrials, goRatio } = GO_NO_GO_CONFIG
  const goCount = Math.round(totalTrials * goRatio)
  const noGoCount = totalTrials - goCount
  const sequence: TrialType[] = [
    ...Array<TrialType>(goCount).fill('go'),
    ...Array<TrialType>(noGoCount).fill('nogo'),
  ]
  return shuffle(sequence)
}

export function ModuleGoNoGo({ onComplete }: { onComplete: () => void }) {
  const addGoNoGoTrial = useAssessmentStore((s) => s.addGoNoGoTrial)
  const sequence = useMemo(() => buildTrialSequence(), [])

  const [phase, setPhase] = useState<Phase>('instrucciones')
  const [trialIndex, setTrialIndex] = useState(0)

  const respondedRef = useRef(false)
  const stimulusStartRef = useRef(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const recordTrial = (responded: boolean, reactionTimeMs: number | null) => {
    const type = sequence[trialIndex]
    const correct = type === 'go' ? responded : !responded
    const trial: GoNoGoTrial = { trialIndex, type, responded, correct, reactionTimeMs }
    addGoNoGoTrial(trial)

    if (trialIndex + 1 >= sequence.length) {
      setPhase('finalizando')
      setTimeout(onComplete, 400)
    } else {
      setTrialIndex(trialIndex + 1)
      setPhase('blank')
    }
  }

  useEffect(() => {
    if (phase !== 'blank') return
    const [min, max] = GO_NO_GO_CONFIG.stimulusIntervalMsRange
    const delay = min + Math.random() * (max - min)
    respondedRef.current = false
    const t = setTimeout(() => {
      stimulusStartRef.current = nowMs()
      setPhase('stimulus')
    }, delay)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, trialIndex])

  useEffect(() => {
    if (phase !== 'stimulus') return
    clearTimer()
    timeoutRef.current = setTimeout(() => {
      if (!respondedRef.current) {
        respondedRef.current = true
        recordTrial(false, null)
      }
    }, GO_NO_GO_CONFIG.responseWindowMs)
    return clearTimer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, trialIndex])

  const handleTap = () => {
    if (phase !== 'stimulus' || respondedRef.current) return
    respondedRef.current = true
    clearTimer()
    recordTrial(true, elapsedSince(stimulusStartRef.current))
  }

  const startTask = () => setPhase('blank')

  const currentType = sequence[trialIndex]

  return (
    <div className="flex flex-col gap-4">
      <Progress value={(trialIndex / sequence.length) * 100} />
      <Card>
        <CardHeader>
          <CardTitle>Módulo 4 · Go / No-Go</CardTitle>
          <CardDescription>Control inhibitorio bajo presión de tiempo.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {phase === 'instrucciones' && (
            <>
              <p className="text-center text-sm leading-relaxed">
                Cuando aparezca un círculo <span className="font-semibold text-emerald-600">verde</span>,
                tocalo lo más rápido posible. Cuando aparezca un círculo{' '}
                <span className="font-semibold text-red-600">rojo</span>, no lo toques.
              </p>
              <Button onClick={startTask}>Comenzar ({GO_NO_GO_CONFIG.totalTrials} ensayos)</Button>
            </>
          )}

          {(phase === 'blank' || phase === 'stimulus') && (
            <button
              type="button"
              onClick={handleTap}
              disabled={phase !== 'stimulus'}
              aria-label={phase === 'stimulus' ? currentType : 'esperando'}
              className={`flex h-40 w-40 items-center justify-center rounded-full transition-colors ${
                phase === 'stimulus'
                  ? currentType === 'go'
                    ? 'bg-emerald-500 active:scale-95'
                    : 'bg-red-500 active:scale-95'
                  : 'bg-muted'
              }`}
            />
          )}

          {phase === 'finalizando' && <p className="text-sm text-muted-foreground">Procesando resultados…</p>}
        </CardContent>
      </Card>
      {phase !== 'instrucciones' && (
        <p className="text-center text-xs text-muted-foreground">
          Ensayo {Math.min(trialIndex + 1, sequence.length)} de {sequence.length}
        </p>
      )}
    </div>
  )
}
