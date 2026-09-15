import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAssessmentStore } from '@/store/assessment-store'

/**
 * Genera el informe PDF íntegramente en el navegador (sin servidor) a
 * partir de la sesión/resultado ya presentes en el store, y dispara la
 * descarga vía blob URL. Funciona offline dentro de la PWA.
 */
export function PDFExportButton() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(false)
  const session = useAssessmentStore((s) => s.session)
  const result = useAssessmentStore((s) => s.result)
  const history = useAssessmentStore((s) => s.history)

  const handleDownloadPDF = async () => {
    if (!session || !result) return
    setIsGenerating(true)
    setError(false)
    try {
      const [{ pdf }, { VulneraCheckReportDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/pdf/VulneraCheckReportDocument'),
      ])
      const folio = session.sessionId.slice(0, 8).toUpperCase()
      const blob = await pdf(
        <VulneraCheckReportDocument session={session} result={result} history={history} />,
      ).toBlob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `VulneraCheck_Informe_${folio}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error generando PDF:', err)
      setError(true)
    } finally {
      setIsGenerating(false)
    }
  }

  if (!session || !result) return null

  return (
    <div className="flex flex-col gap-1.5">
      <Button
        variant="secondary"
        className="gap-2"
        disabled={isGenerating}
        onClick={handleDownloadPDF}
      >
        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {isGenerating ? 'Generando PDF…' : 'Exportar informe PDF'}
      </Button>
      {error && (
        <p className="text-center text-xs text-destructive">
          No se pudo generar el PDF. Probá de nuevo.
        </p>
      )}
    </div>
  )
}
