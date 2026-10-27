import { Document, Page, View, Text, Image, StyleSheet, Svg, Rect, Line, Circle, Polyline } from '@react-pdf/renderer'
import type { AssessmentResult, AssessmentSession, RiskTier, FactorScore } from '@/types/assessment'
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

function Header({
  session,
  folio,
  institutionName,
  institutionLogoUrl,
}: {
  session: AssessmentSession
  folio: string
  institutionName?: string | null
  institutionLogoUrl?: string | null
}) {
  const dt = new Date(session.completedAt ?? session.startedAt)
  return (
    <View style={styles.headerRow}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {institutionLogoUrl && <Image src={institutionLogoUrl} style={{ width: 28, height: 28, objectFit: 'contain' }} />}
        <View>
          <Text style={styles.brand}>VulneraCheck</Text>
          <Text style={styles.brandSub}>Informe de Perfil de Vulnerabilidad y Controles de Mitigación de APP Fraud</Text>
          {institutionName && <Text style={styles.brandSub}>Institución: {institutionName}</Text>}
        </View>
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

// --- Gráficos del informe (SVG puro + Text posicionado por flexbox, evita
// el Text con x/y dentro de <Svg> cuyo soporte de fontSize no está
// documentado con certeza en esta versión de @react-pdf/renderer). ---

const GAUGE_SEGMENTS: { from: number; to: number; color: string }[] = [
  { from: 0, to: 25, color: '#16a34a' },
  { from: 25, to: 50, color: '#d97706' },
  { from: 50, to: 75, color: '#dc2626' },
  { from: 75, to: 100, color: '#991b1b' },
]

function ScoreGauge({ score }: { score: number }) {
  const W = 480
  const H = 16
  const svgH = 20
  const clamped = Math.min(100, Math.max(0, score))
  const markerX = (clamped / 100) * W

  return (
    <View style={{ marginTop: 6 }}>
      <View style={{ position: 'relative' }}>
        <Svg width={W} height={svgH}>
          {GAUGE_SEGMENTS.map((s) => (
            <Rect
              key={s.from}
              x={(s.from / 100) * W}
              y={2}
              width={((s.to - s.from) / 100) * W}
              height={H}
              fill={s.color}
            />
          ))}
          <Line x1={markerX} y1={0} x2={markerX} y2={svgH} stroke="#0f172a" strokeWidth={1.5} />
        </Svg>
        <Text
          style={{
            position: 'absolute',
            top: -9,
            left: Math.max(0, Math.min(W - 16, markerX - 8)),
            fontSize: 7,
            fontFamily: 'Helvetica-Bold',
            color: '#0f172a',
          }}
        >
          {clamped}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
        {[0, 25, 50, 75, 100].map((v) => (
          <Text key={v} style={{ fontSize: 6, color: '#94a3b8' }}>
            {v}
          </Text>
        ))}
      </View>
    </View>
  )
}

function CompositionBar({ nivel1Score, nivel2Score }: { nivel1Score: number; nivel2Score: number }) {
  const W = 260
  const H = 10
  const c1 = nivel1Score * 0.6
  const c2 = nivel2Score * 0.4
  const w1 = (Math.min(100, Math.max(0, c1)) / 100) * W
  const w2 = (Math.min(100, Math.max(0, c2)) / 100) * W

  return (
    <View style={{ marginTop: 8 }}>
      <Svg width={W} height={H}>
        <Rect x={0} y={0} width={W} height={H} fill="#e2e8f0" />
        <Rect x={0} y={0} width={w1} height={H} fill="#0f172a" />
        <Rect x={w1} y={0} width={w2} height={H} fill="#64748b" />
      </Svg>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 3 }}>
        <Text style={{ fontSize: 6.5, color: '#0f172a' }}>■ Nivel 1 medido (60%): {Math.round(c1)} pts</Text>
        <Text style={{ fontSize: 6.5, color: '#64748b' }}>■ Nivel 2 simulado (40%): {Math.round(c2)} pts</Text>
      </View>
    </View>
  )
}

function FactorBarChart({ factors }: { factors: FactorScore[] }) {
  const chartW = 260
  const barH = 9
  const rowH = 17
  const svgH = factors.length * rowH

  return (
    <View style={{ flexDirection: 'row', marginTop: 6, alignItems: 'flex-start' }}>
      <View style={{ width: 150 }}>
        {factors.map((f) => (
          <View key={f.factor} style={{ height: rowH, justifyContent: 'center' }}>
            <Text style={{ fontSize: 7.5, color: '#334155' }}>{f.label}</Text>
          </View>
        ))}
      </View>
      <Svg width={chartW} height={svgH}>
        {factors.map((f, i) => (
          <Rect key={`track-${f.factor}`} x={0} y={i * rowH + (rowH - barH) / 2} width={chartW} height={barH} fill="#e2e8f0" />
        ))}
        {factors.map((f, i) => (
          <Rect
            key={`value-${f.factor}`}
            x={0}
            y={i * rowH + (rowH - barH) / 2}
            width={(Math.min(100, Math.max(0, f.score)) / 100) * chartW}
            height={barH}
            fill="#0f172a"
          />
        ))}
      </Svg>
      <View style={{ width: 34, marginLeft: 6 }}>
        {factors.map((f) => (
          <View key={f.factor} style={{ height: rowH, justifyContent: 'center' }}>
            <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold' }}>{f.score}/100</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

function HistoryLineChart({ history }: { history: HistoryEntry[] }) {
  const chronological = [...history].reverse()
  const W = 480
  const H = 90
  const pad = 10
  const innerW = W - pad * 2
  const innerH = H - pad * 2
  const n = chronological.length

  const points = chronological.map((h, i) => {
    const x = pad + (n > 1 ? (i / (n - 1)) * innerW : innerW / 2)
    const y = pad + innerH - (Math.min(100, Math.max(0, h.totalScore)) / 100) * innerH
    return { x, y }
  })
  const pointsAttr = points.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <View style={{ marginTop: 6 }}>
      <Svg width={W} height={H}>
        {[0, 25, 50, 75, 100].map((v) => {
          const y = pad + innerH - (v / 100) * innerH
          return <Line key={v} x1={pad} y1={y} x2={W - pad} y2={y} stroke="#e2e8f0" strokeWidth={0.5} />
        })}
        <Polyline points={pointsAttr} stroke="#0f172a" strokeWidth={1.5} fill="none" />
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={2.5} fill="#0f172a" />
        ))}
      </Svg>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
        <Text style={{ fontSize: 6, color: '#94a3b8' }}>
          {new Date(chronological[0].completedAt).toLocaleDateString('es-PY')}
        </Text>
        <Text style={{ fontSize: 6, color: '#94a3b8' }}>
          {new Date(chronological[n - 1].completedAt).toLocaleDateString('es-PY')}
        </Text>
      </View>
    </View>
  )
}

export function VulneraCheckReportDocument({
  session,
  result,
  history,
  institutionName,
  institutionLogoUrl,
}: {
  session: AssessmentSession
  result: AssessmentResult
  history: HistoryEntry[]
  institutionName?: string | null
  institutionLogoUrl?: string | null
}) {
  const folio = session.sessionId.slice(0, 8).toUpperCase()
  const breakdown = buildModuleBreakdown(session, result)
  const diagnosis = buildDiagnosisSentence(result)
  const controls = deriveControls(result)

  return (
    <Document title={`VulneraCheck_Informe_${folio}`}>
      {/* ---------- Página 1 ---------- */}
      <Page size="A4" style={styles.page}>
        <Header session={session} folio={folio} institutionName={institutionName} institutionLogoUrl={institutionLogoUrl} />
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
          </View>
        </View>
        <ScoreGauge score={result.totalScore} />
        <Text style={{ fontSize: 7, color: '#94a3b8', marginTop: 8 }}>
          Composición del score total — cómo se llega a {result.totalScore}/100:
        </Text>
        <CompositionBar nivel1Score={result.nivel1.compositeScore} nivel2Score={result.nivel2SimulatedScore} />

        <Text style={styles.sectionTitle}>Perfil por Factor (Modelo Pentafactorial)</Text>
        <FactorBarChart factors={result.nivel1.factors} />

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
            <Td flex={2.2}>4. Control Inhibitorio (Go/No-Go, promedio de 4 sub-pruebas)</Td>
            <Td flex={1}>{breakdown.module4.score}/100</Td>
            <Td flex={3}>
              Errores de comisión: {breakdown.module4.commissionErrorPct}% · Errores de omisión:{' '}
              {breakdown.module4.omissionErrorPct}% · TR medio (Go correcto): {breakdown.module4.avgReactionTimeMs} ms
            </Td>
          </View>
          {breakdown.module4.bySubTest.map((s, i) => (
            <View key={s.label} style={i % 2 === 0 ? styles.tRowAlt : styles.tRow}>
              <Td flex={2.2}>   · {s.label}</Td>
              <Td flex={1}>{s.score}/100</Td>
              <Td flex={3}>
                Comisión: {s.commissionErrorPct}% · Omisión: {s.omissionErrorPct}% · TR medio: {s.avgReactionTimeMs} ms
              </Td>
            </View>
          ))}
        </View>

        <Text style={styles.footer} fixed>
          VulneraCheck — Instrumento de investigación académica. Score pentafactorial pre-calibrado por literatura, no
          validado empíricamente aún (ver nota metodológica, página 2).
        </Text>
        <Text style={styles.pageNumber} fixed render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </Page>

      {/* ---------- Página 2 ---------- */}
      <Page size="A4" style={styles.page}>
        <Header session={session} folio={folio} institutionName={institutionName} institutionLogoUrl={institutionLogoUrl} />
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
          <>
            <HistoryLineChart history={history} />
            <View style={[styles.table, { marginTop: 8 }]}>
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
          </>
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

        <Text style={styles.footer} fixed>
          Documento generado por VulneraCheck el {new Date(result.generatedAt).toLocaleString('es-PY')}. Confidencial
          — uso interno / académico.
        </Text>
        <Text style={styles.pageNumber} fixed render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </Page>
    </Document>
  )
}
