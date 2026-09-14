// Bancos de ítems de los 4 módulos del Nivel 1. Cada banco es más grande que lo
// mínimo necesario por sesión: el módulo selecciona un subconjunto aleatorio
// (ver metrics-collector#shuffle) para reducir el efecto de memorización.

export interface TipiItem {
  id: string
  text: string
  trait: 'extraversion' | 'agreeableness' | 'conscientiousness' | 'stability' | 'openness'
  reverseScored: boolean
}

// TIPI (Ten-Item Personality Inventory), Gosling, Rentfrow & Swann (2003).
// Ítems 2, 4, 6, 8, 10 tienen puntuación invertida.
export const TIPI_ITEMS: TipiItem[] = [
  { id: 'tipi_1', text: 'Extrovertido, entusiasta', trait: 'extraversion', reverseScored: false },
  { id: 'tipi_2', text: 'Crítico, propenso a discutir', trait: 'agreeableness', reverseScored: true },
  { id: 'tipi_3', text: 'Confiable, autodisciplinado', trait: 'conscientiousness', reverseScored: false },
  { id: 'tipi_4', text: 'Ansioso, se altera con facilidad', trait: 'stability', reverseScored: true },
  { id: 'tipi_5', text: 'Abierto a experiencias nuevas, poco convencional', trait: 'openness', reverseScored: false },
  { id: 'tipi_6', text: 'Reservado, callado', trait: 'extraversion', reverseScored: true },
  { id: 'tipi_7', text: 'Solidario, cálido con los demás', trait: 'agreeableness', reverseScored: false },
  { id: 'tipi_8', text: 'Desorganizado, descuidado', trait: 'conscientiousness', reverseScored: true },
  { id: 'tipi_9', text: 'Calmado, emocionalmente estable', trait: 'stability', reverseScored: false },
  { id: 'tipi_10', text: 'Convencional, poco creativo', trait: 'openness', reverseScored: true },
]

export interface FinancialObjectiveItem {
  id: string
  prompt: string
  options: { id: string; text: string }[]
  correctOptionId: string
}

// Adaptado de los "Big Three" de Lusardi & Mitchell (2011) — interés compuesto,
// inflación y diversificación de riesgo.
export const FINANCIAL_OBJECTIVE_ITEMS: FinancialObjectiveItem[] = [
  {
    id: 'fin_interes',
    prompt:
      'Depositás Gs. 1.000.000 en una cuenta que paga 2% de interés anual. Si no retirás nada, ¿cuánto tendrás en esa cuenta luego de 5 años?',
    options: [
      { id: 'a', text: 'Más de Gs. 1.100.000' },
      { id: 'b', text: 'Exactamente Gs. 1.100.000' },
      { id: 'c', text: 'Menos de Gs. 1.100.000' },
      { id: 'd', text: 'No sé' },
    ],
    correctOptionId: 'a',
  },
  {
    id: 'fin_inflacion',
    prompt:
      'Si la inflación anual es 5% y el interés de tu cuenta de ahorro es 1%, en un año ¿podrás comprar más, igual o menos que hoy con ese dinero?',
    options: [
      { id: 'a', text: 'Más que hoy' },
      { id: 'b', text: 'Exactamente igual' },
      { id: 'c', text: 'Menos que hoy' },
      { id: 'd', text: 'No sé' },
    ],
    correctOptionId: 'c',
  },
  {
    id: 'fin_diversificacion',
    prompt: '"Invertir todo tus ahorros en una sola empresa es más seguro que repartirlo en varias." ¿Verdadero o falso?',
    options: [
      { id: 'a', text: 'Verdadero' },
      { id: 'b', text: 'Falso' },
      { id: 'c', text: 'No sé' },
    ],
    correctOptionId: 'b',
  },
]

export interface ContextItem {
  id: string
  text: string
  type: 'boolean' | 'likert'
  reverseScored?: boolean
}

export const CONTEXT_ITEMS: ContextItem[] = [
  {
    id: 'ctx_victima_reciente',
    text: '¿Fuiste víctima de un fraude o estafa financiera en los últimos 12 meses (te hicieron transferir o entregar dinero)?',
    type: 'boolean',
  },
  {
    id: 'ctx_intento_reciente',
    text: '¿Recibiste una llamada, mensaje o correo sospechoso pidiendo datos bancarios o un pago urgente en el último mes?',
    type: 'boolean',
  },
  {
    id: 'ctx_verifica_canal_oficial',
    text: 'Cuando recibo una solicitud urgente que dice ser de mi banco, la verifico llamando a un número oficial antes de actuar.',
    type: 'likert',
    reverseScored: true,
  },
  {
    id: 'ctx_comparte_con_terceros',
    text: 'Antes de tomar una decisión financiera bajo presión, suelo consultarlo con otra persona de confianza.',
    type: 'likert',
    reverseScored: true,
  },
]

export interface GssScenarioVariant {
  id: string
  narrative: string
  questions: {
    id: string
    /** Pregunta con premisa engañosa; responder "sí" = ceder a la sugestión (yield). */
    text: string
  }[]
  pressureMessage: string
}

// Adaptado metodológicamente de la Gudjonsson Suggestibility Scale (GSS):
// narrativa breve + preguntas líder, luego retroalimentación negativa/autoridad
// y re-pregunta para medir "yield" (ceder) y "shift" (cambiar bajo presión).
export const GSS_SCENARIOS: GssScenarioVariant[] = [
  {
    id: 'gss_variante_a',
    narrative:
      'Tu banco te envía una notificación: "Detectamos un acceso desde un nuevo dispositivo en Ciudad del Este a las 03:14 hs. Por seguridad, un asesor te llamará para confirmar tu identidad."',
    questions: [
      { id: 'q1', text: '¿El mensaje menciona que el acceso fue confirmado como fraudulento?' },
      { id: 'q2', text: '¿El mensaje indica que perderás el dinero de tu cuenta si no respondés en los próximos minutos?' },
    ],
    pressureMessage:
      'Nuestro sistema de verificación indica que tu respuesta anterior no coincide con el registro oficial. Por favor, confirmá nuevamente para continuar.',
  },
  {
    id: 'gss_variante_b',
    narrative:
      'Recibís un correo del "Departamento de Seguridad" de tu banco: "Su tarjeta fue bloqueada preventivamente. Un especialista certificado necesita validar 3 datos para reactivarla hoy mismo."',
    questions: [
      { id: 'q1', text: '¿El correo indica que la tarjeta ya fue reactivada automáticamente?' },
      { id: 'q2', text: '¿El correo advierte que el bloqueo será permanente si no se responde en el día?' },
    ],
    pressureMessage:
      'Según nuestros registros de auditoría, tu respuesta anterior fue marcada como inconsistente. Te pedimos reconfirmar para evitar la suspensión de tu cuenta.',
  },
]

export interface ScenarioMock {
  id: string
  kind: 'sms' | 'push' | 'llamada' | 'qr'
  title: string
  body: string
  meta: string
  correctChoice: 'ignorar' | 'verificar' | 'responder' | 'llamar'
}

export const SCENARIO_MOCKS: ScenarioMock[] = [
  {
    id: 'esc_sms_transferencia',
    kind: 'sms',
    title: 'SMS de "BancoSeguro"',
    body: 'Detectamos una transferencia inusual de Gs. 8.500.000. Si no fuiste vos, confirmá cancelando aquí: bncsgr.co/ok-2481',
    meta: 'Remitente: BancoSeguro · hace 2 min',
    correctChoice: 'verificar',
  },
  {
    id: 'esc_push_otp',
    kind: 'push',
    title: 'Notificación push',
    body: 'Validación biométrica requerida. Reenviá el código OTP que recibiste por SMS para completar la verificación de tu identidad.',
    meta: 'App Banco · ahora',
    correctChoice: 'verificar',
  },
  {
    id: 'esc_llamada_vishing',
    kind: 'llamada',
    title: 'Transcripción de llamada entrante',
    body: '"Buenas tardes, le habla Carla del área de Seguridad del banco. Detectamos movimientos irregulares en su cuenta y necesito que me confirme el código de 6 dígitos que le acabamos de enviar para revertir el cargo antes de que se procese."',
    meta: 'Número: oculto · llamada en curso',
    correctChoice: 'verificar',
  },
  {
    id: 'esc_qr_reembolso',
    kind: 'qr',
    title: 'Publicación: "Reembolso disponible"',
    body: 'El banco te debe un reembolso de Gs. 450.000 por comisiones cobradas de más. Escaneá el código QR y cargá tus datos para recibirlo hoy mismo.',
    meta: 'Publicación patrocinada',
    correctChoice: 'ignorar',
  },
]

export interface GoNoGoConfig {
  totalTrials: number
  goRatio: number
  stimulusIntervalMsRange: [number, number]
  responseWindowMs: number
}

export const GO_NO_GO_CONFIG: GoNoGoConfig = {
  totalTrials: 20,
  goRatio: 0.7,
  stimulusIntervalMsRange: [900, 1500],
  responseWindowMs: 800,
}
