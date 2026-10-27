import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAssessmentStore } from '@/store/assessment-store'
import { nowMs, elapsedSince } from '@/lib/metrics-collector'
import { LIKERT_LABELS, SCALE_ITEMS, type ScaleItem } from '@/lib/item-banks'

const ITEM_BY_ID = new Map(SCALE_ITEMS.map((i) => [i.id, i]))

export function ModuleEscala({ onComplete }: { onComplete: () => void }) {
  const session = useAssessmentStore((s) => s.session)
  const setResponse = useAssessmentStore((s) => s.setResponse)

  const items = useMemo<ScaleItem[]>(
    () => (session?.itemOrder ?? []).map((id) => ITEM_BY_ID.get(id)).filter((i): i is ScaleItem => !!i),
    [session?.itemOrder],
  )

  // Si la persona recarga a mitad de camino, retoma en el primer ítem sin responder.
  const [index, setIndex] = useState(() => {
    const answered = new Set(session?.responses.map((r) => r.itemId))
    const first = items.findIndex((i) => !answered.has(i.id))
    return first === -1 ? 0 : first
  })
  const [stepStart, setStepStart] = useState(() => nowMs())

  useEffect(() => {
    setStepStart(nowMs())
  }, [index])

  if (!session || items.length === 0) return null

  const item = items[index]
  const previous = session.responses.find((r) => r.itemId === item.id)?.value

  const answer = (value: number) => {
    setResponse({ itemId: item.id, value, latencyMs: elapsedSince(stepStart) })
    if (index + 1 >= items.length) onComplete()
    else setIndex(index + 1)
  }

  return (
    <div className="flex flex-col gap-4">
      <Progress value={(index / items.length) * 100} />
      <Card>
        <CardHeader>
          <CardDescription>
            Indicá qué tan de acuerdo estás con cada afirmación, pensando en cómo actuarías realmente.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-base font-medium leading-relaxed" data-testid="item-text">
            {item.text}
          </p>
          <div className="flex flex-col gap-2" role="radiogroup" aria-label="Grado de acuerdo">
            {LIKERT_LABELS.map((label, i) => {
              const value = i + 1
              const selected = previous === value
              return (
                <button
                  key={label}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => answer(value)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition-colors active:scale-[0.99] ${
                    selected
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-xs font-semibold">
                    {value}
                  </span>
                  <span>{label}</span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" disabled={index === 0} onClick={() => setIndex(index - 1)}>
          <ChevronLeft className="h-4 w-4" /> Anterior
        </Button>
        <p className="text-xs text-muted-foreground">
          Afirmación {index + 1} de {items.length}
        </p>
      </div>
    </div>
  )
}
