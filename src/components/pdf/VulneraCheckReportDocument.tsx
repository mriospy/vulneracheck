import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { AssessmentResult, AssessmentSession, RiskTier } from '@/types/assessment'
import { buildModuleBreakdown, buildDiagnosisSentence } from '@/lib/report-data'
import { deriveControls } from '@/lib/controls-engine'
import type { HistoryEntry } from '@/lib/history-store'

const RISK_COLOR: Record<RiskTier, string> = {
  bajo: '#16a34a',
  moderado: '#d97706',
  alto: '#dc2626',
  critico: '#991b1b',
}

const RISK_LABEL: Record<RiskTier, string> = {
  bajo: 'RIESGO BAJO',
  moderado: 'RIESGO MEDIO',
  alto: 'RIESGO ALTO',
  critico: 'RIESGO CRÍTICO',
}

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 9, fontFamily: 'Helvetica', color: '#1e293b' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  brand: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#0f172a' },
  brandSub: { fontSize: 8, color: '#64748b', marginTop: 2 },
  metaBox: { alignItems: 'flex-end' },
  metaLine: { fontSize: 8, color: '#475569' },
  hr: { borderBottomWidth: 1, borderBottomColor: '#e2e8f0', marginVertical: 10 },
  sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginBottom: 6, marginTop: 14 },

  scoreCard: { flexDirection: 'row', gap: 16, alignItems: 'center', padding: 14, borderRadius: 6, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' },
  scoreNumber: { fontSize: 34, fontFamily: 'Helvetica-Bold', color: '#0f172a' },
  scoreLabel: { fontSize: 8, color: '#64748b' },
  badge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10, alignSelf: 'flex-start' },
  badgeText: { color: '#ffffff', fontSize: 8, fontFamily: 'Helvetica-Bold' },
  diagnosisText: { fontSize: 9, color: '#334155', marginTop: 4, maxWidth: 340 },

  table: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  tHeadRow: { flexDirection: 'row', backgroundColor: '#0f172a' },
  tRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  tRowAlt: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#e2e8f0', backgroundColor: '#f8fafc' },
  th: { color: '#ffffff', fontSize: 8, fontFamily: 'Helvetica-Bold', padding: 6 },
  td: { fontSize: 8, padding: 6, color: '#334155' },

  footer: { position: 'absolute', bottom: 24, left: 36, right: 36, fontSize: 7, color: '#94a3b8', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 6 },
  pageNumber: { position: 'absolute', bottom: 24, right: 36, fontSize: 7, color: '#94a3b8' },
})

function Header({ session, folio }: { session: AssessmentSession; folio: string }) {
  const dt = new Date(session.completedAt ?? session.startedAt)
  return (
    <View style={styles.headerRow}>
      <View>
        <Text style={styles.brand}>VulneraCheck</Text>
        <Text style={styles.brandSub}>Informe de Perfil de Vulnerabilidad y Controles de Mitigación de APP Fraud</Text>
      </View>
      <View style={styles.metaBox}>
        <Text style={styles.metaLine}>Folio: {folio}</Text>
        <Text style={styles.metaLine}>
          {dt.toLocaleDateString('es-PY')} {dt.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <Text style={styles.metaLine}>Token: {session.tokenId}</Text>
      </View>
    </View>
  )
}

function Th({ children, flex }: { children: React.ReactNode; flex?: number }) {
  return <Text style={[styles.th, { flex: flex ?? 1 }]}>{children}</Text>
}
function Td({ children, flex }: { children: React.ReactNode; flex?: number }) {
  return <Text style={[styles.td, { flex: flex ?? 1 }]}>{children}</Text>
}

export function VulneraCheckReportDocument({
  session,
  result,
  history,
}: {
  session: AssessmentSession
  result: AssessmentResult
  history: HistoryEntry[]
}) {
  const folio = session.sessionId.slice(0, 8).toUpperCase()
  const breakdown = buildModuleBreakdown(session, result)
  const diagnosis = buildDiagnosisSentence(result)
  const controls = deriveControls(result)

  return (
    <Document title={`VulneraCheck_Informe_${folio}`}>
      {/* ---------- Página 1 ---------- */}
      <Page size="A4" style={styles.page}>
        <Header session={session} folio={folio} />
        <View style={styles.hr} />

        <Text style={styles.sectionTitle}>Resumen Ejecutivo</Text>
        <View style={styles.scoreCard}>
          <View>
            <Text style={styles.scoreNumber}>{result.totalScore}</Text>
            <Text style={styles.scoreLabel}>Score total (0–100)</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={[styles.badge, { backgroundColor: RISK_COLOR[result.riskTier] }]}>
              <Text style={styles.badgeText}>{RISK_LABEL[result.riskTier]}</Text>
            </View>
            <Text style={styles.diagnosisText}>{diagnosis}</Text>
            <Text style={{ fontSize: 7, color: '#94a3b8', marginTop: 6 }}>
              Nivel 1 (Perfil Conductual, medido): {result.nivel1.compositeScore}/100 · Nivel 2 ({result.nivel2Label}): {result.nivel2SimulatedScore}/100
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Desglose de Resultados por Módulo</Text>
        <View style={styles.table}>
          <View style={styles.tHeadRow}>
            <Th flex={2.2}>Módulo</Th>
            <Th flex={1}>Score</Th>
            <Th flex={3}>Indicadores clave</Th>
          </View>
          <View style={styles.tRow}>
            <Td flex={2.2}>1. Autorreporte / Contexto</Td>
            <Td flex={1}>{breakdown.module1.score}/100</Td>
            <Td flex={3}>
              Brecha de sobreconfianza: {breakdown.module1.overconfidenceGapPct} pp · Educación financiera:{' '}
              {breakdown.module1.objectiveCorrectCount}/{breakdown.module1.objectiveTotal} correctas ·{' '}
              {breakdown.module1.recentVictim ? 'víctima reciente reportada' : 'sin victimización reciente'}
            </Td>
          </View>
          <View style={styles.tRowAlt}>
            <Td flex={2.2}>2. Sugestionabilidad (Micro-GSS)</Td>
            <Td flex={1}>{breakdown.module2.score}/100</Td>
            <Td flex={3}>
              Yield: {breakdown.module2.yieldPct}% · Shift (bajo presión): {breakdown.module2.shiftPct}% · n=
              {breakdown.module2.trialCount} preguntas
            </Td>
          </View>
          <View style={styles.tRow}>
            <Td flex={2.2}>3. Escenarios Situacionales</Td>
            <Td flex={1}>{breakdown.module3.score}/100</Td>
            <Td flex={3}>
              Acierto global: {breakdown.module3.accuracyPct}% · Latencia media: {breakdown.module3.avgLatencyMs} ms
            </Td>
          </View>
          {breakdown.module3.byType.map((t, i) => (
            <View key={t.label} style={i % 2 === 0 ? styles.tRowAlt : styles.tRow}>
              <Td flex={2.2}>   · {t.label}</Td>
              <Td flex={1}>{t.correct}/{t.total}</Td>
              <Td flex={3}>Latencia media: {t.avgLatencyMs} ms</Td>
            </View>
          ))}
          <View style={styles.tRow}>
            <Td flex={2.2}>4. Control Inhibitorio (Go/No-Go)</Td>
            <Td flex={1}>{breakdown.module4.score}/100</Td>
            <Td flex={3}>
              Errores de comisión: {breakdown.module4.commissionErrorPct}% · Errores de omisión:{' '}
              {breakdown.module4.omissionErrorPct}% · TR medio (Go correcto): {breakdown.module4.avgReactionTimeMs} ms
            </Td>
          </View>
        </View>

        <Text style={styles.footer}>
          VulneraCheck — Instrumento de investigación académica. Score pentafactorial pre-calibrado por literatura, no
          validado empíricamente aún (ver nota metodológica, página 2).
        </Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </Page>

      {/* ---------- Página 2 ---------- */}
      <Page size="A4" style={styles.page}>
        <Header session={session} folio={folio} />
        <View style={styles.hr} />

        <Text style={styles.sectionTitle}>Matriz de Controles Mitigantes para APP Fraud</Text>
        <View style={styles.table}>
          <View style={styles.tHeadRow}>
            <Th flex={1.4}>Categoría</Th>
            <Th flex={2.6}>Acción específica</Th>
            <Th flex={2.6}>Justificación técnica</Th>
          </View>
          {controls.map((c, i) => (
            <View key={i} style={i % 2 === 0 ? styles.tRow : styles.tRowAlt}>
              <Td flex={1.4}>{c.category}</Td>
              <Td flex={2.6}>{c.action}</Td>
              <Td flex={2.6}>{c.justification}</Td>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Evolución Histórica</Text>
        {history.length <= 1 ? (
          <Text style={{ fontSize: 8, color: '#64748b' }}>
            Esta es la primera evaluación registrada en este dispositivo para el token {session.tokenId}.
          </Text>
        ) : (
          <View style={styles.table}>
            <View style={styles.tHeadRow}>
              <Th flex={1.5}>Fecha</Th>
              <Th flex={1}>Score</Th>
              <Th flex={1.2}>Clasificación</Th>
              <Th flex={1}>Variación</Th>
            </View>
            {history.map((h, i) => {
              const prev = history[i + 1]
              const delta = prev ? h.totalScore - prev.totalScore : null
              return (
                <View key={h.sessionId} style={i % 2 === 0 ? styles.tRow : styles.tRowAlt}>
                  <Td flex={1.5}>{new Date(h.completedAt).toLocaleDateString('es-PY')}</Td>
                  <Td flex={1}>{h.totalScore}/100</Td>
                  <Td flex={1.2}>{RISK_LABEL[h.riskTier]}</Td>
                  <Td flex={1}>{delta === null ? '—' : delta > 0 ? `+${delta}` : `${delta}`}</Td>
                </View>
              )
            })}
          </View>
        )}

        <Text style={styles.sectionTitle}>Declaración de Conformidad</Text>
        <Text style={{ fontSize: 8, color: '#334155', lineHeight: 1.5 }}>
          Este informe fue generado automáticamente a partir de las respuestas registradas en la sesión identificada
          por el folio {folio}. Los datos se procesan de forma anónima, vinculados únicamente a un token de
          participación, con fines exclusivamente académicos y de investigación sobre mitigación del Fraude de Pagos
          Autorizados (APP). El tratamiento de los datos observa los principios de minimización y confidencialidad
          aplicables bajo la normativa de protección de datos personales vigente. Este documento no constituye
          asesoramiento legal ni una decisión automatizada definitiva sobre el cliente evaluado.
        </Text>

        <Text style={styles.footer}>
          Documento generado por VulneraCheck el {new Date(result.generatedAt).toLocaleString('es-PY')}. Confidencial
          — uso interno / académico.
        </Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </Page>
    </Document>
  )
}
