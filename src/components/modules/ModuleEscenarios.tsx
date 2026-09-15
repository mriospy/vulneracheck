import { useEffect, useMemo, useState } from 'react'
import { MessageSquare, Bell, Phone, QrCode } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAssessmentStore } from '@/store/assessment-store'
import { nowMs, elapsedSince, shuffle } from '@/lib/metrics-collector'
import { SCENARIO_MOCKS, type ScenarioMock } from '@/lib/item-banks'
import type { ScenarioChoice } from '@/types/assessment'

const KIND_ICON: Record<ScenarioMock['kind'], typeof MessageSquare> = {
  sms: MessageSquare,
  push: Bell,
  llamada: Phone,
  qr: QrCode,
}

const KIND_LABEL: Record<ScenarioMock['kind'], string> = {
  sms: 'Mensaje de texto',
  push: 'Notificación push',
  llamada: 'Llamada entrante',
  qr: 'Publicación / QR',
}

const CHOICES: { value: ScenarioChoice; label: string }[] = [
  { value: 'ignorar', label: 'Ignorar' },
  { value: 'verificar', label: 'Verificar por canal oficial' },
  { value: 'responder', label: 'Responder / hacer clic' },
  { value: 'llamar', label: 'Llamar al número del mensaje' },
]

function pickOnePerKind(mocks: readonly ScenarioMock[]): ScenarioMock[] {
  const byKind = new Map<ScenarioMock['kind'], ScenarioMock[]>()
  for (const m of mocks) {
    const arr = byKind.get(m.kind) ?? []
    arr.push(m)
    byKind.set(m.kind, arr)
  }
  return Array.from(byKind.values()).map((variants) => shuffle(variants)[0])
}

export function ModuleEscenarios({ onComplete }: { onComplete: () => void }) {
  const addScenarioResult = useAssessmentStore((s) => s.addScenarioResult)
  const scenarios = useMemo(() => shuffle(pickOnePerKind(SCENARIO_MOCKS)), [])
  const [index, setIndex] = useState(0)
  const [stepStart, setStepStart] = useState(() => nowMs())

  useEffect(() => {
    setStepStart(nowMs())
  }, [index])

  const scenario = scenarios[index]
  const Icon = KIND_ICON[scenario.kind]

  const handleChoice = (choice: ScenarioChoice) => {
    addScenarioResult({
      scenarioId: scenario.id,
      choice,
      correct: choice === scenario.correctChoice,
      latencyMs: elapsedSince(stepStart),
    })
    if (index + 1 < scenarios.length) {
      setIndex(index + 1)
    } else {
      onComplete()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Progress value={((index + 1) / scenarios.length) * 100} />
      <Card>
        <CardHeader>
          <CardTitle>Módulo 3 · Escenarios</CardTitle>
          <CardDescription>¿Qué harías si recibís esto en tu celular ahora mismo?</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-muted/50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary" />
              <Badge variant="outline">{KIND_LABEL[scenario.kind]}</Badge>
            </div>
            <p className="text-sm font-semibold">{scenario.title}</p>
            <p className="mt-1 text-sm leading-relaxed">{scenario.body}</p>
            <p className="mt-2 text-xs text-muted-foreground">{scenario.meta}</p>
          </div>

          <div className="flex flex-col gap-2">
            {CHOICES.map((c) => (
              <Button key={c.value} variant="outline" onClick={() => handleChoice(c.value)}>
                {c.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      <p className="text-center text-xs text-muted-foreground">
        Escenario {index + 1} de {scenarios.length}
      </p>
    </div>
  )
}
