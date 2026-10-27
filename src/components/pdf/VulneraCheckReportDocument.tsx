import { Document, Font, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { AssessmentResult, AssessmentSession, RiskLevel } from '@/types/assessment'
import { buildDiagnosisSentence, buildSenales, VULNERABILITY_LABEL } from '@/lib/report-data'
import { buildOrientaciones } from '@/lib/orientaciones'
import { dimensionDefinition } from '@/lib/item-banks'
import type { HistoryEntry } from '@/lib/history-store'

// El hyphenador por defecto de react-pdf es para inglés y corta mal palabras
// en español ("Re-conocimiento"); se desactiva la división de palabras.
Font.registerHyphenationCallback((word) => [word])

const LEVEL_COLOR: Record<RiskLevel, string> = {
  bajo: '#16a34a',
  medio: '#d97706',
  alto: '#dc2626',
}

const LEVEL_LABEL: Record<RiskLevel, string> = {
  bajo: 'BAJO',
  medio: 'MEDIO',
  alto: 'ALTO',
}

const styles = StyleSheet.create({
  page: { padding: 36, paddingBottom: 56, fontSize: 9, fontFamily: 'Helvetica', color: '#1e293b' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  brand: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#0f172a' },
  brandSub: { fontSize: 8, color: '#64748b', marginTop: 2, maxWidth: 360 },
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

  orientBlock: { marginBottom: 8, padding: 8, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4 },
  orientHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  orientTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#0f172a' },
  orientSummary: { fontSize: 8, color: '#475569', marginBottom: 3 },
  bullet: { fontSize: 8, color: '#334155', marginLeft: 6, marginBottom: 1.5 },
  senal: { fontSize: 7, color: '#64748b', marginLeft: 6, marginTop: 1 },

  footer: { position: 'absolute', bottom: 24, left: 36, right: 70, fontSize: 7, color: '#94a3b8', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 6 },
  pageNumber: { position: 'absolute', bottom: 24, right: 36, fontSize: 7, color: '#94a3b8' },
})

function Header({ session, folio }: { session: AssessmentSession; folio: string }) {
  const dt = new Date(session.completedAt ?? session.startedAt)
  return (
    <View style={styles.headerRow} fixed>
      <View>
        <Text style={styles.brand}>VulneraCheck</Text>
        <Text style={styles.brandSub}>
          Informe de perfil de vulnerabilidad frente a estafas en servicios financieros digitales
        </Text>
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

function LevelBadge({ level }: { level: RiskLevel }) {
  return (
    <View style={[styles.badge, { backgroundColor: LEVEL_COLOR[level] }]}>
      <Text style={styles.badgeText}>{LEVEL_LABEL[level]}</Text>
    </View>
  )
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
  const diagnosis = buildDiagnosisSentence(result)
  const orientaciones = buildOrientaciones(result)
  const senales = buildSenales(session)

  return (
    <Document title={`VulneraCheck_Informe_${folio}`}>
      {/* ---------- Página 1: resultados ---------- */}
      <Page size="A4" style={styles.page}>
        <Header session={session} folio={folio} />
        <View style={styles.hr} />

        <Text style={styles.sectionTitle}>Resumen</Text>
        <View style={styles.scoreCard}>
          <View>
            <Text style={styles.scoreNumber}>{result.totalRawScore}</Text>
            <Text style={styles.scoreLabel}>
              Puntaje total ({result.totalMinScore}–{result.totalMaxScore})
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={[styles.badge, { backgroundColor: LEVEL_COLOR[result.level] }]}>
              <Text style={styles.badgeText}>{VULNERABILITY_LABEL[result.level].toUpperCase()}</Text>
            </View>
            <Text style={styles.diagnosisText}>{diagnosis}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Resultados por dimensión</Text>
        <View style={styles.table}>
          <View style={styles.tHeadRow}>
            <Th flex={2}>Dimensión</Th>
            <Th flex={0.9}>Puntaje</Th>
            <Th flex={0.8}>Nivel</Th>
            <Th flex={3.3}>Indicadores evaluados</Th>
          </View>
          {result.dimensions.map((d, i) => {
            const def = dimensionDefinition(d.dimension)
            return (
              <View key={d.dimension} style={i % 2 === 0 ? styles.tRow : styles.tRowAlt}>
                <Td flex={2}>
                  {def.code} · {d.label}
                </Td>
                <Td flex={0.9}>
                  {d.rawScore}/{d.maxScore}
                </Td>
                <Td flex={0.8}>{LEVEL_LABEL[d.level]}</Td>
                <Td flex={3.3}>{def.indicators.map((ind) => ind.text).join(' · ')}</Td>
              </View>
            )
          })}
        </View>
        <Text style={{ fontSize: 7, color: '#64748b', marginTop: 4 }}>
          Cada dimensión suma 8 afirmaciones en escala 1–5 (los ítems inversos se invierten). Niveles por
          intervalos iguales del rango: bajo 8–18, medio 19–29, alto 30–40. Total: bajo 40–93, medio 94–146,
          alto 147–200.
        </Text>

        <Text style={styles.sectionTitle}>Evolución histórica</Text>
        {history.length <= 1 ? (
          <Text style={{ fontSize: 8, color: '#64748b' }}>
            Esta es la primera evaluación registrada en este dispositivo para el token {session.tokenId}.
          </Text>
        ) : (
          <View style={styles.table}>
            <View style={styles.tHeadRow}>
              <Th flex={1.5}>Fecha</Th>
              <Th flex={1}>Puntaje</Th>
              <Th flex={1.2}>Nivel</Th>
              <Th flex={1}>Variación</Th>
            </View>
            {history.map((h, i) => {
              const prev = history[i + 1]
              const delta = prev ? h.totalRawScore - prev.totalRawScore : null
              return (
                <View key={h.sessionId} style={i % 2 === 0 ? styles.tRow : styles.tRowAlt}>
                  <Td flex={1.5}>{new Date(h.completedAt).toLocaleDateString('es-PY')}</Td>
                  <Td flex={1}>
                    {h.totalRawScore}/{h.totalMaxScore}
                  </Td>
                  <Td flex={1.2}>{LEVEL_LABEL[h.level]}</Td>
                  <Td flex={1}>{delta === null ? '—' : delta > 0 ? `+${delta}` : `${delta}`}</Td>
                </View>
              )
            })}
          </View>
        )}

        <Text style={styles.footer} fixed>
          VulneraCheck — Instrumento de investigación académica. Puntos de corte teóricos; validación de contenido
          por juicio de expertos (Boateng et al., 2018).
        </Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>

      {/* ---------- Página 2: orientaciones preventivas ---------- */}
      <Page size="A4" style={styles.page}>
        <Header session={session} folio={folio} />
        <View style={styles.hr} />

        <Text style={styles.sectionTitle}>Orientaciones preventivas personalizadas</Text>
        {orientaciones.map((o) => (
          <View key={o.dimension} style={styles.orientBlock} wrap={false}>
            <View style={styles.orientHead}>
              <Text style={styles.orientTitle}>{o.label}</Text>
              <LevelBadge level={o.level} />
            </View>
            <Text style={styles.orientSummary}>{o.summary}</Text>
            {o.pautas.map((p) => (
              <Text key={p} style={styles.bullet}>
                • {p}
              </Text>
            ))}
            {senales[o.dimension].length > 0 && (
              <>
                <Text style={[styles.senal, { marginTop: 3, fontFamily: 'Helvetica-Bold' }]}>
                  Situaciones respondidas de forma vulnerable:
                </Text>
                {senales[o.dimension].map((s) => (
                  <Text key={s.item.id} style={styles.senal}>
                    – «{s.item.text}» — respondiste: {s.answerLabel}
                  </Text>
                ))}
              </>
            )}
          </View>
        ))}

        <View wrap={false}>
        <Text style={styles.sectionTitle}>Nota metodológica y privacidad</Text>
        <Text style={{ fontSize: 8, color: '#334155', lineHeight: 1.5 }}>
          Este informe se generó localmente en el dispositivo a partir de las respuestas de la sesión con folio {folio},
          vinculada solo a un token de participación anónimo. No se registran nombres, números de cédula, claves ni
          datos bancarios. El perfil describe puntos débiles frente a tácticas de ingeniería social; no predice con
          certeza si una persona será víctima de una estafa ni reemplaza las medidas de seguridad de su banco. Uso
          exclusivamente académico.
        </Text>
        </View>

        <Text style={styles.footer} fixed>
          Documento generado por VulneraCheck el {new Date(result.generatedAt).toLocaleString('es-PY')}.
        </Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>
    </Document>
  )
}
