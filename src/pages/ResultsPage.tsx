import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, RotateCcw, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAssessmentStore } from '@/store/assessment-store'
import type { RiskLevel } from '@/types/assessment'
import { buildOrientaciones } from '@/lib/orientaciones'
import { buildDiagnosisSentence, buildSenales, LEVEL_LABEL, VULNERABILITY_LABEL } from '@/lib/report-data'
import { PDFExportButton } from '@/components/pdf/PDFExportButton'

const LEVEL_VARIANT: Record<RiskLevel, 'success' | 'warning' | 'destructive'> = {
  bajo: 'success',
  medio: 'warning',
  alto: 'destructive',
}

export function ResultsPage() {
  const navigate = useNavigate()
  const result = useAssessmentStore((s) => s.result)
  const session = useAssessmentStore((s) => s.session)
  const history = useAssessmentStore((s) => s.history)
  const reset = useAssessmentStore((s) => s.reset)

  useEffect(() => {
    if (!result) navigate('/', { replace: true })
  }, [result, navigate])

  if (!result || !session) return null

  const orientaciones = buildOrientaciones(result)
  const senales = buildSenales(session)

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-5 p-5">
      <div className="flex flex-col items-center gap-3 pt-4 text-center">
        <p className="text-sm font-medium text-muted-foreground">Puntaje total de vulnerabilidad</p>
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-bold" data-testid="total-score">
            {result.totalRawScore}
          </span>
          <span className="text-lg text-muted-foreground">/ {result.totalMaxScore}</span>
        </div>
        <Badge variant={LEVEL_VARIANT[result.level]}>{VULNERABILITY_LABEL[result.level]}</Badge>
        <p className="text-sm text-muted-foreground">{buildDiagnosisSentence(result)}</p>
        <PDFExportButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">¿Qué evaluaban las afirmaciones?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-muted-foreground">
          Las afirmaciones medían, sin decirlo, tu sensibilidad a las tácticas de ingeniería social
          más usadas en estafas bancarias: la presión del tiempo, la autoridad de quien dice ser del
          banco, los favores o beneficios a cambio de datos, la influencia de grupos y redes, y tus
          prácticas en el uso de la banca digital. La mitad hablaba de tu vida cotidiana, porque
          estas tácticas aprovechan las mismas tendencias que mostramos todos los días.
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Resultado por dimensión</CardTitle>
          <CardDescription>
            Suma de tus respuestas en cada dimensión. Mayor puntaje = mayor vulnerabilidad.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {result.dimensions.map((d) => (
            <div key={d.dimension} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="font-medium">{d.label}</span>
                <span className="flex items-center gap-2">
                  <span className="font-semibold">
                    {d.rawScore}/{d.maxScore}
                  </span>
                  <Badge variant={LEVEL_VARIANT[d.level]}>{LEVEL_LABEL[d.level]}</Badge>
                </span>
              </div>
              <Progress value={d.normalizedScore} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <ShieldCheck className="h-4 w-4 text-primary" /> Orientaciones preventivas
          </CardTitle>
          <CardDescription>Ordenadas de tu punto más débil al más fuerte.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {orientaciones.map((o) => (
            <div key={o.dimension} className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{o.label}</span>
                <Badge variant={LEVEL_VARIANT[o.level]}>{LEVEL_LABEL[o.level]}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{o.summary}</p>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
                {o.pautas.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              {senales[o.dimension].length > 0 && (
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer">
                    Situaciones en las que respondiste de forma vulnerable ({senales[o.dimension].length})
                  </summary>
                  <ul className="mt-1 flex list-disc flex-col gap-1 pl-5">
                    {senales[o.dimension].map((s) => (
                      <li key={s.item.id}>
                        «{s.item.text}» <span className="font-medium">— respondiste: {s.answerLabel}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" /> Nota metodológica
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs leading-relaxed text-muted-foreground">
          <p>
            Los niveles bajo, medio y alto surgen de dividir en tres partes iguales el rango posible de
            cada suma. Son puntos de corte teóricos: la escala cuenta con validación de contenido por
            juicio de expertos (Boateng et al., 2018), no con baremos de campo. El perfil orienta sobre
            tus puntos débiles; no predice con certeza si una persona será víctima de una estafa.
          </p>
        </CardContent>
      </Card>

      {history.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Evolución histórica</CardTitle>
            <CardDescription>Últimas evaluaciones registradas en este dispositivo.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {history.map((h) => (
              <div key={h.sessionId} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {new Date(h.completedAt).toLocaleDateString('es-PY')}
                </span>
                <span className="font-medium">
                  {h.totalRawScore}/{h.totalMaxScore}
                </span>
                <Badge variant={LEVEL_VARIANT[h.level]}>{LEVEL_LABEL[h.level]}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Button
        variant="outline"
        onClick={() => {
          reset()
          navigate('/')
        }}
      >
        <RotateCcw className="h-4 w-4" /> Nueva evaluación
      </Button>
    </div>
  )
}
