import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAssessmentStore } from '@/store/assessment-store'
import { nowMs, elapsedSince, shuffle } from '@/lib/metrics-collector'
import { GO_NO_GO_CONFIG, GO_NO_GO_SUBTESTS } from '@/lib/item-banks'
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

  const [blockIndex, setBlockIndex] = useState(0)
  const block = GO_NO_GO_SUBTESTS[blockIndex]
  const isLastBlock = blockIndex === GO_NO_GO_SUBTESTS.length - 1

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sequence = useMemo(() => buildTrialSequence(), [blockIndex])

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
    const trial: GoNoGoTrial = { subTest: block.key, trialIndex, type, responded, correct, reactionTimeMs }
    addGoNoGoTrial(trial)

    if (trialIndex + 1 >= sequence.length) {
      if (isLastBlock) {
        setPhase('finalizando')
        setTimeout(onComplete, 400)
      } else {
        setPhase('instrucciones')
        setTrialIndex(0)
        setBlockIndex((b) => b + 1)
      }
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
  }, [phase, trialIndex, blockIndex])

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
  }, [phase, trialIndex, blockIndex])

  const handleTap = () => {
    if (phase !== 'stimulus' || respondedRef.current) return
    respondedRef.current = true
    clearTimer()
    recordTrial(true, elapsedSince(stimulusStartRef.current))
  }

  const startBlock = () => setPhase('blank')

  const currentType = sequence[trialIndex]
  const totalOverallTrials = GO_NO_GO_SUBTESTS.length * sequence.length
  const overallCompleted = blockIndex * sequence.length + trialIndex
  const stimulusConfig = currentType === 'go' ? block.go : block.noGo

  return (
    <div className="flex flex-col gap-4">
      <Progress value={(overallCompleted / totalOverallTrials) * 100} />
      <Card>
        <CardHeader>
          <CardTitle>
            Módulo 4 · Go / No-Go — {block.label} ({blockIndex + 1}/{GO_NO_GO_SUBTESTS.length})
          </CardTitle>
          <CardDescription>Control inhibitorio bajo presión de tiempo.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {phase === 'instrucciones' && (
            <>
              <p className="text-center text-sm leading-relaxed">{block.instructions}</p>
              <Button onClick={startBlock}>Comenzar ({GO_NO_GO_CONFIG.totalTrials} ensayos)</Button>
            </>
          )}

          {(phase === 'blank' || phase === 'stimulus') && (
            <button
              type="button"
              onClick={handleTap}
              disabled={phase !== 'stimulus'}
              aria-label={phase === 'stimulus' ? currentType : 'esperando'}
              className={`flex h-40 w-40 items-center justify-center text-3xl font-bold text-white transition-colors ${
                phase === 'stimulus' ? `${stimulusConfig.className} active:scale-95` : 'rounded-full bg-muted'
              }`}
            >
              {phase === 'stimulus' && block.stimulusKind === 'text' ? stimulusConfig.text : null}
            </button>
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
