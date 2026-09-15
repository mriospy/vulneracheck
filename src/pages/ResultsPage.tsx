import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAssessmentStore } from '@/store/assessment-store'
import type { RiskTier } from '@/types/assessment'
import { PDFExportButton } from '@/components/pdf/PDFExportButton'

const RISK_TIER_LABEL: Record<RiskTier, string> = {
  bajo: 'Riesgo bajo',
  moderado: 'Riesgo moderado',
  alto: 'Riesgo alto',
  critico: 'Riesgo crítico',
}

const RISK_TIER_VARIANT: Record<RiskTier, 'success' | 'warning' | 'destructive'> = {
  bajo: 'success',
  moderado: 'warning',
  alto: 'destructive',
  critico: 'destructive',
}

export function ResultsPage() {
  const navigate = useNavigate()
  const result = useAssessmentStore((s) => s.result)
  const history = useAssessmentStore((s) => s.history)
  const reset = useAssessmentStore((s) => s.reset)

  useEffect(() => {
    if (!result) navigate('/', { replace: true })
  }, [result, navigate])

  if (!result) return null

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-5 p-5">
      <div className="flex flex-col items-center gap-3 pt-4 text-center">
        <p className="text-sm font-medium text-muted-foreground">Score total de vulnerabilidad</p>
        <div className="text-5xl font-bold">{result.totalScore}</div>
        <Badge variant={RISK_TIER_VARIANT[result.riskTier]}>{RISK_TIER_LABEL[result.riskTier]}</Badge>
        <PDFExportButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Composición del score</CardTitle>
          <CardDescription>
            Nivel 1 (Perfil Conductual, medido en esta app): 60% · Nivel 2 (Perfil Transaccional y
            Entorno Técnico, simulado): 40%
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <span>Nivel 1 — Perfil Conductual</span>
            <span className="font-semibold">{result.nivel1.compositeScore}/100</span>
          </div>
          <Progress value={result.nivel1.compositeScore} />
          <div className="flex items-center justify-between text-sm">
            <span>Nivel 2 — {result.nivel2Label}</span>
            <span className="font-semibold">{result.nivel2SimulatedScore}/100</span>
          </div>
          <Progress value={result.nivel2SimulatedScore} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Modelo Pentafactorial (Nivel 1)</CardTitle>
          <CardDescription>Ponderación de cada factor dentro del Perfil Conductual.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {result.nivel1.factors.map((f) => (
            <div key={f.factor} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {f.label} <span className="text-muted-foreground">({Math.round(f.weight * 100)}%)</span>
                </span>
                <span className="font-semibold">{f.score}/100</span>
              </div>
              <Progress value={f.score} />
              <p className="text-xs text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" /> Panel de validación (nota metodológica)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs leading-relaxed text-muted-foreground">
          <p>
            Las ponderaciones del modelo pentafactorial son parámetros de pre-calibración basados en
            literatura, no en ajuste empírico sobre datos propios. Abroshan et al. (2026) reportan que
            los modelos de ridge regression sobre rasgos psicológicos explican una porción limitada de
            la varianza en susceptibilidad real al fraude — este instrumento debe interpretarse como
            un tamizaje exploratorio, no como un diagnóstico definitivo, hasta contar con una muestra
            piloto que permita recalibrar los pesos.
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
                <span className="font-medium">{h.totalScore}/100</span>
                <Badge variant={RISK_TIER_VARIANT[h.riskTier]}>{RISK_TIER_LABEL[h.riskTier]}</Badge>
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
