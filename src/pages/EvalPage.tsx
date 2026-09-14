import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Progress } from '@/components/ui/progress'
import { useAssessmentStore, MODULE_ORDER } from '@/store/assessment-store'
import { ModuleAutorreporte } from '@/components/modules/ModuleAutorreporte'
import { ModuleMicroGSS } from '@/components/modules/ModuleMicroGSS'
import { ModuleEscenarios } from '@/components/modules/ModuleEscenarios'
import { ModuleGoNoGo } from '@/components/modules/ModuleGoNoGo'

const MODULE_LABELS: Record<(typeof MODULE_ORDER)[number], string> = {
  autorreporte: 'Autorreporte',
  microGss: 'Micro-GSS',
  escenarios: 'Escenarios',
  goNoGo: 'Go/No-Go',
}

export function EvalPage() {
  const navigate = useNavigate()
  const session = useAssessmentStore((s) => s.session)
  const currentModuleIndex = useAssessmentStore((s) => s.currentModuleIndex)
  const goToNextModule = useAssessmentStore((s) => s.goToNextModule)
  const finalizeAssessment = useAssessmentStore((s) => s.finalizeAssessment)
  const isSubmitting = useAssessmentStore((s) => s.isSubmitting)

  useEffect(() => {
    if (!session) navigate('/', { replace: true })
  }, [session, navigate])

  if (!session) return null

  const currentModule = MODULE_ORDER[currentModuleIndex]
  const isLast = currentModuleIndex === MODULE_ORDER.length - 1

  const handleModuleComplete = async () => {
    if (isLast) {
      await finalizeAssessment()
      navigate('/results')
    } else {
      goToNextModule()
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-5 p-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>
            Módulo {currentModuleIndex + 1} de {MODULE_ORDER.length} · {MODULE_LABELS[currentModule]}
          </span>
          <span>{Math.round(((currentModuleIndex + (isSubmitting ? 1 : 0)) / MODULE_ORDER.length) * 100)}%</span>
        </div>
        <Progress value={(currentModuleIndex / MODULE_ORDER.length) * 100} />
      </div>

      {isSubmitting ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Calculando tu perfil de vulnerabilidad…</p>
        </div>
      ) : (
        <>
          {currentModule === 'autorreporte' && <ModuleAutorreporte onComplete={handleModuleComplete} />}
          {currentModule === 'microGss' && <ModuleMicroGSS onComplete={handleModuleComplete} />}
          {currentModule === 'escenarios' && <ModuleEscenarios onComplete={handleModuleComplete} />}
          {currentModule === 'goNoGo' && <ModuleGoNoGo onComplete={handleModuleComplete} />}
        </>
      )}
    </div>
  )
}
