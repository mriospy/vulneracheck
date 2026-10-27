import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAssessmentStore } from '@/store/assessment-store'
import { ModuleEscala } from '@/components/modules/ModuleEscala'

export function EvalPage() {
  const navigate = useNavigate()
  const session = useAssessmentStore((s) => s.session)
  const finalizeAssessment = useAssessmentStore((s) => s.finalizeAssessment)
  const isSubmitting = useAssessmentStore((s) => s.isSubmitting)

  useEffect(() => {
    if (!session) navigate('/', { replace: true })
  }, [session, navigate])

  if (!session) return null

  const handleComplete = async () => {
    await finalizeAssessment()
    navigate('/results')
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-5 p-5">
      <div className="text-xs font-medium text-muted-foreground">
        Escala de Vulnerabilidad frente a Estafas en Servicios Financieros Digitales
      </div>

      {isSubmitting ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Calculando tu perfil de vulnerabilidad…</p>
        </div>
      ) : (
        <ModuleEscala onComplete={handleComplete} />
      )}
    </div>
  )
}
