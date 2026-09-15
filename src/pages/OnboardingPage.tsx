import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ShieldCheck, Clock, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useAssessmentStore } from '@/store/assessment-store'

export function OnboardingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const startSession = useAssessmentStore((s) => s.startSession)

  const [token, setToken] = useState(searchParams.get('token') ?? '')
  const [consentOpen, setConsentOpen] = useState(false)
  const [accepted, setAccepted] = useState(false)

  const canStart = token.trim().length > 0 && accepted

  const handleStart = () => {
    if (!canStart) return
    startSession(token.trim())
    navigate('/eval')
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center gap-6 p-5">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <ShieldCheck className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">VulneraCheck</h1>
        <p className="text-sm text-muted-foreground">
          Instrumento de investigación sobre vulnerabilidad conductual frente al fraude de pagos
          autorizados (APP).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-primary" /> Duración estimada: 6 a 8 minutos
          </CardTitle>
          <CardDescription>
            4 módulos: autorreporte, comprensión bajo presión, escenarios simulados y una breve
            tarea de atención.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="flex flex-col gap-2">
        <label htmlFor="token" className="text-sm font-medium">
          Código de participación
        </label>
        <input
          id="token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Ej: PART-2026-0142"
          className="h-11 rounded-xl border border-border bg-transparent px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-xs text-muted-foreground">
          Este código vincula tu sesión de forma anónima con el estudio de tesis.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setConsentOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-border p-3 text-left text-sm transition-colors hover:bg-muted"
      >
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => {
            e.stopPropagation()
            setAccepted(e.target.checked)
          }}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4"
        />
        <span>
          Leí y acepto el <span className="font-medium text-primary">consentimiento informado</span>
        </span>
      </button>

      <Button size="lg" disabled={!canStart} onClick={handleStart}>
        Comenzar evaluación
      </Button>

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" /> Tus respuestas se procesan de forma anónima y con fines
        exclusivamente académicos.
      </p>

      <Dialog open={consentOpen} onOpenChange={setConsentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Consentimiento informado</DialogTitle>
            <DialogDescription asChild>
              <div className="mt-2 flex max-h-72 flex-col gap-3 overflow-y-auto text-left text-sm">
                <p>
                  Esta evaluación forma parte de una tesis de grado sobre mitigación del Fraude de
                  Pagos Autorizados (APP) mediante ingeniería social. Tu participación es voluntaria
                  y anónima.
                </p>
                <p>
                  Se registrarán tus respuestas, tiempos de reacción y decisiones ante escenarios
                  simulados. No se te pedirá ningún dato bancario real en ningún momento.
                </p>
                <p>
                  Podés abandonar la evaluación en cualquier momento sin consecuencias. Los datos se
                  usarán exclusivamente con fines de investigación académica.
                </p>
                <p>
                  Este dispositivo guarda localmente un historial mínimo (fecha, score y
                  clasificación de riesgo) de tus últimas evaluaciones, para mostrar tu evolución en
                  el informe descargable. Ninguna respuesta individual del test se almacena en este
                  historial.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => {
              setAccepted(true)
              setConsentOpen(false)
            }}
          >
            Entiendo y acepto
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
