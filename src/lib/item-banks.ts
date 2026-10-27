// Escala de Vulnerabilidad Frente a Estafas en Servicios Financieros Digitales
// de Entidades Bancarias (anteproyecto de tesis, Ríos Bazán 2026).
//
// 5 dimensiones x 8 ítems = 40 ítems, banco inicial para el juicio de
// expertos (Boateng et al., 2018 recomiendan generar aprox. el doble de los
// ítems finales). Formato Likert 1-5, de "Totalmente en desacuerdo" a
// "Totalmente de acuerdo".
//
// reverseScored = false (directo): estar de acuerdo indica MÁS vulnerabilidad.
// reverseScored = true (inverso): estar de acuerdo indica conducta protectora;
// el motor de puntuación lo invierte (6 - valor) antes de sumar, para que
// todas las sumas se lean igual: mayor puntaje = mayor vulnerabilidad.
//
// Los ítems describen situaciones reconocibles del contexto local (WhatsApp,
// llamadas, Marketplace, comercio de Ciudad del Este) y no rasgos abstractos.

import type { DimensionKey } from '@/types/assessment'

export const LIKERT_LABELS = [
  'Totalmente en desacuerdo',
  'En desacuerdo',
  'Ni de acuerdo ni en desacuerdo',
  'De acuerdo',
  'Totalmente de acuerdo',
] as const

export type ScamModality =
  | 'Falso bloqueo / alerta'
  | 'Falso soporte del banco'
  | 'SIM swapping'
  | 'Transferencia falsa'
  | 'Phishing por enlace'
  | 'Acceso remoto'
  | 'Falso premio / reembolso'
  | 'Venta falsa'
  | 'Inversión falsa'
  | 'Robo de credenciales'
  | 'App o página clonada'
  | 'Robo de WhatsApp'

export interface DimensionIndicator {
  id: string
  text: string
}

export interface DimensionDefinition {
  key: DimensionKey
  code: string
  label: string
  /** Definición conceptual, tal como figura en el anteproyecto. */
  definition: string
  source: string
  indicators: DimensionIndicator[]
}

export const DIMENSIONS: DimensionDefinition[] = [
  {
    key: 'urgencia',
    code: 'URG',
    label: 'Reactividad ante la urgencia',
    definition:
      'Propensión a experimentar una reducción del control cognitivo bajo la presión de estímulos que exigen acción inmediata, especialmente ante la amenaza de una pérdida inminente de fondos.',
    source: 'Lyu et al. (2025)',
    indicators: [
      { id: 'URG-a', text: 'Acción inmediata ante alertas de bloqueo o pérdida' },
      { id: 'URG-b', text: 'Omisión de la verificación bajo presión de tiempo' },
      { id: 'URG-c', text: 'Respuesta guiada por el miedo a la pérdida' },
    ],
  },
  {
    key: 'autoridad',
    code: 'AUT',
    label: 'Obediencia a la autoridad',
    definition:
      'Medida en que el usuario acata instrucciones o divulga credenciales al interactuar con individuos que suplantan roles legítimos o de alto estatus institucional dentro de una entidad bancaria.',
    source: 'Modic et al. (2018); Wulandari et al. (2022)',
    indicators: [
      { id: 'AUT-a', text: 'Acatamiento de instrucciones de supuesto personal bancario o de telefonía' },
      { id: 'AUT-b', text: 'Divulgación de credenciales o códigos ante un rol institucional' },
      { id: 'AUT-c', text: 'Confianza en señales de oficialidad (cargo, datos personales conocidos)' },
    ],
  },
  {
    key: 'reciprocidad',
    code: 'REC',
    label: 'Reciprocidad interpersonal',
    definition:
      'Susceptibilidad del usuario ante tácticas de supuesta empatía o favores simulados, que generan una presión interna para corresponder la amabilidad recibida.',
    source: 'Ferreira y Camera (2016)',
    indicators: [
      { id: 'REC-a', text: 'Sentimiento de deuda ante una ayuda o trato amable' },
      { id: 'REC-b', text: 'Entrega de información a cambio de un beneficio o favor' },
      { id: 'REC-c', text: 'Dificultad para negarse tras un favor recibido' },
    ],
  },
  {
    key: 'conformidad',
    code: 'CON',
    label: 'Conformidad social',
    definition:
      'Tendencia a buscar seguridad copiando el comportamiento mayoritario ante la incertidumbre, como ocurre con anuncios o plataformas que muestran comentarios positivos de supuestos clientes.',
    source: 'Norris y Brookes (2021)',
    indicators: [
      { id: 'CON-a', text: 'Confianza basada en opiniones o comentarios de terceros' },
      { id: 'CON-b', text: 'Imitación del comportamiento de contactos o grupos' },
      { id: 'CON-c', text: 'Credibilidad atribuida por popularidad' },
    ],
  },
  {
    key: 'alfabetizacion',
    code: 'ADF',
    label: 'Alfabetización digital financiera',
    definition:
      'Conocimiento práctico operativo del usuario: verificar que la dirección web del banco sea la correcta, distinguir una pantalla clonada de una real y manejar sus credenciales de manera privada.',
    source: 'Chen et al. (2026)',
    indicators: [
      { id: 'ADF-a', text: 'Verificación de la dirección web y del canal oficial' },
      { id: 'ADF-b', text: 'Reconocimiento de pantallas y aplicaciones clonadas' },
      { id: 'ADF-c', text: 'Gestión privada de credenciales (claves, PIN, token, verificación en dos pasos)' },
      { id: 'ADF-d', text: 'Verificación de pagos y de señales de SIM swapping' },
    ],
  },
]

export interface ScaleItem {
  id: string
  dimension: DimensionKey
  indicator: string
  text: string
  reverseScored: boolean
  modality: ScamModality
}

export const SCALE_ITEMS: ScaleItem[] = [
  // --- D1 · Reactividad ante la urgencia ------------------------------------
  {
    id: 'urg_1',
    dimension: 'urgencia',
    indicator: 'URG-a',
    text: 'Si me llega un WhatsApp que dice que mi tarjeta será bloqueada en los próximos minutos, sigo las instrucciones del mensaje para evitarlo.',
    reverseScored: false,
    modality: 'Falso bloqueo / alerta',
  },
  {
    id: 'urg_2',
    dimension: 'urgencia',
    indicator: 'URG-a',
    text: 'Cuando un mensaje me avisa de un movimiento que no reconozco en mi cuenta, toco el enlace que trae para cancelarlo cuanto antes.',
    reverseScored: false,
    modality: 'Phishing por enlace',
  },
  {
    id: 'urg_3',
    dimension: 'urgencia',
    indicator: 'URG-b',
    text: 'Si me dicen que tengo poco tiempo para salvar mi dinero, prefiero actuar rápido antes que perder tiempo verificando.',
    reverseScored: false,
    modality: 'Falso bloqueo / alerta',
  },
  {
    id: 'urg_4',
    dimension: 'urgencia',
    indicator: 'URG-b',
    text: 'Si un cliente apurado me muestra el comprobante de una transferencia, le entrego la mercadería sin esperar a ver el dinero acreditado.',
    reverseScored: false,
    modality: 'Transferencia falsa',
  },
  {
    id: 'urg_5',
    dimension: 'urgencia',
    indicator: 'URG-c',
    text: 'El miedo a perder mis ahorros me haría responder un mensaje del banco aunque me pareciera raro.',
    reverseScored: false,
    modality: 'Falso bloqueo / alerta',
  },
  {
    id: 'urg_6',
    dimension: 'urgencia',
    indicator: 'URG-b',
    text: 'Aunque un mensaje diga que mi cuenta se bloqueará hoy, primero entro a la app oficial del banco para confirmar si es cierto.',
    reverseScored: true,
    modality: 'Falso bloqueo / alerta',
  },
  {
    id: 'urg_7',
    dimension: 'urgencia',
    indicator: 'URG-a',
    text: 'Cuando un mensaje me exige actuar "de inmediato", lo tomo como una señal de posible estafa.',
    reverseScored: true,
    modality: 'Falso bloqueo / alerta',
  },
  {
    id: 'urg_8',
    dimension: 'urgencia',
    indicator: 'URG-c',
    text: 'Antes de responder a una alerta urgente sobre mi cuenta, me tomo unos minutos para pensarlo o consultarlo con alguien de confianza.',
    reverseScored: true,
    modality: 'Falso bloqueo / alerta',
  },

  // --- D2 · Obediencia a la autoridad ---------------------------------------
  {
    id: 'aut_1',
    dimension: 'autoridad',
    indicator: 'AUT-a',
    text: 'Si me llama alguien que se presenta como funcionario del área de seguridad de mi banco, sigo sus indicaciones.',
    reverseScored: false,
    modality: 'Falso soporte del banco',
  },
  {
    id: 'aut_2',
    dimension: 'autoridad',
    indicator: 'AUT-b',
    text: 'Le daría el código que me llegó por SMS a una persona de "auditoría" del banco si me explica que es para proteger mi cuenta.',
    reverseScored: false,
    modality: 'Falso soporte del banco',
  },
  {
    id: 'aut_3',
    dimension: 'autoridad',
    indicator: 'AUT-c',
    text: 'Si quien me llama conoce mi nombre completo y mi número de cédula, creo que realmente es de mi banco.',
    reverseScored: false,
    modality: 'Falso soporte del banco',
  },
  {
    id: 'aut_4',
    dimension: 'autoridad',
    indicator: 'AUT-a',
    text: 'Si un supuesto técnico del banco me pide instalar una aplicación para "revisar" mi celular, lo haría.',
    reverseScored: false,
    modality: 'Acceso remoto',
  },
  {
    id: 'aut_5',
    dimension: 'autoridad',
    indicator: 'AUT-b',
    text: 'Si alguien de mi compañía telefónica me pide un código para "actualizar mi línea", se lo paso.',
    reverseScored: false,
    modality: 'SIM swapping',
  },
  {
    id: 'aut_6',
    dimension: 'autoridad',
    indicator: 'AUT-b',
    text: 'Aunque quien me llama diga ser gerente del banco, me niego a darle mis claves o códigos.',
    reverseScored: true,
    modality: 'Falso soporte del banco',
  },
  {
    id: 'aut_7',
    dimension: 'autoridad',
    indicator: 'AUT-a',
    text: 'Cuando alguien dice llamar de mi banco, corto y llamo yo al número oficial que figura en mi tarjeta.',
    reverseScored: true,
    modality: 'Falso soporte del banco',
  },
  {
    id: 'aut_8',
    dimension: 'autoridad',
    indicator: 'AUT-c',
    text: 'Para mí, que alguien diga tener un cargo en el banco no prueba que sea quien dice ser.',
    reverseScored: true,
    modality: 'Falso soporte del banco',
  },

  // --- D3 · Reciprocidad interpersonal --------------------------------------
  {
    id: 'rec_1',
    dimension: 'reciprocidad',
    indicator: 'REC-a',
    text: 'Si alguien del "soporte" del banco fue muy amable y me ayudó con un problema, me sentiría mal negarle un dato que me pide.',
    reverseScored: false,
    modality: 'Falso soporte del banco',
  },
  {
    id: 'rec_2',
    dimension: 'reciprocidad',
    indicator: 'REC-a',
    text: 'Cuando alguien se toma el tiempo de guiarme paso a paso por teléfono, siento que debo colaborar con lo que me pide.',
    reverseScored: false,
    modality: 'Falso soporte del banco',
  },
  {
    id: 'rec_3',
    dimension: 'reciprocidad',
    indicator: 'REC-b',
    text: 'Si me avisan de un premio o reembolso a mi favor, estoy dispuesto/a a confirmar mis datos bancarios para recibirlo.',
    reverseScored: false,
    modality: 'Falso premio / reembolso',
  },
  {
    id: 'rec_4',
    dimension: 'reciprocidad',
    indicator: 'REC-c',
    text: 'Si alguien me escribe que me transfirió dinero "por error", se lo devolvería enseguida sin consultar antes al banco.',
    reverseScored: false,
    modality: 'Transferencia falsa',
  },
  {
    id: 'rec_5',
    dimension: 'reciprocidad',
    indicator: 'REC-c',
    text: 'Si un vendedor de Marketplace me hizo una rebaja especial, le pago por adelantado sin pedir más garantías.',
    reverseScored: false,
    modality: 'Venta falsa',
  },
  {
    id: 'rec_6',
    dimension: 'reciprocidad',
    indicator: 'REC-c',
    text: 'Aunque alguien haya sido muy amable conmigo por teléfono, corto la llamada si me pide claves o códigos.',
    reverseScored: true,
    modality: 'Falso soporte del banco',
  },
  {
    id: 'rec_7',
    dimension: 'reciprocidad',
    indicator: 'REC-a',
    text: 'Desconfío cuando un desconocido me ofrece ayuda con mi cuenta bancaria sin que yo la haya pedido.',
    reverseScored: true,
    modality: 'Falso soporte del banco',
  },
  {
    id: 'rec_8',
    dimension: 'reciprocidad',
    indicator: 'REC-b',
    text: 'Rechazo premios, bonos o beneficios que me piden mis datos personales a cambio.',
    reverseScored: true,
    modality: 'Falso premio / reembolso',
  },

  // --- D4 · Conformidad social -----------------------------------------------
  {
    id: 'con_1',
    dimension: 'conformidad',
    indicator: 'CON-a',
    text: 'Si una inversión ofrecida en redes sociales tiene muchos comentarios positivos de clientes, la considero confiable.',
    reverseScored: false,
    modality: 'Inversión falsa',
  },
  {
    id: 'con_2',
    dimension: 'conformidad',
    indicator: 'CON-b',
    text: 'Si varios conocidos de un grupo de WhatsApp dicen que ganaron dinero con una plataforma, me animaría a invertir también.',
    reverseScored: false,
    modality: 'Inversión falsa',
  },
  {
    id: 'con_3',
    dimension: 'conformidad',
    indicator: 'CON-c',
    text: 'Una página con muchos seguidores o "me gusta" me da confianza para cargar mis datos.',
    reverseScored: false,
    modality: 'App o página clonada',
  },
  {
    id: 'con_4',
    dimension: 'conformidad',
    indicator: 'CON-b',
    text: 'Si un familiar o amigo me reenvía el enlace de una promoción del banco, lo abro sin verificarlo.',
    reverseScored: false,
    modality: 'Phishing por enlace',
  },
  {
    id: 'con_5',
    dimension: 'conformidad',
    indicator: 'CON-c',
    text: 'Cuando veo que mucha gente usa una app de préstamos o inversiones, asumo que es segura.',
    reverseScored: false,
    modality: 'Inversión falsa',
  },
  {
    id: 'con_6',
    dimension: 'conformidad',
    indicator: 'CON-a',
    text: 'Aunque muchas personas recomienden una inversión, verifico por mi cuenta que la empresa esté autorizada antes de poner dinero.',
    reverseScored: true,
    modality: 'Inversión falsa',
  },
  {
    id: 'con_7',
    dimension: 'conformidad',
    indicator: 'CON-a',
    text: 'Sé que los comentarios positivos de una publicación pueden ser falsos o comprados.',
    reverseScored: true,
    modality: 'Inversión falsa',
  },
  {
    id: 'con_8',
    dimension: 'conformidad',
    indicator: 'CON-b',
    text: 'Que en un grupo todos compartan una "oportunidad" no cambia mi decisión de verificarla primero.',
    reverseScored: true,
    modality: 'Inversión falsa',
  },

  // --- D5 · Alfabetización digital financiera --------------------------------
  {
    id: 'adf_1',
    dimension: 'alfabetizacion',
    indicator: 'ADF-a',
    text: 'Sé revisar la dirección web para confirmar que estoy en la página oficial de mi banco.',
    reverseScored: true,
    modality: 'App o página clonada',
  },
  {
    id: 'adf_2',
    dimension: 'alfabetizacion',
    indicator: 'ADF-b',
    text: 'Puedo distinguir una pantalla falsa de la de mi banco aunque se vean parecidas.',
    reverseScored: true,
    modality: 'App o página clonada',
  },
  {
    id: 'adf_3',
    dimension: 'alfabetizacion',
    indicator: 'ADF-a',
    text: 'Entro a la banca por internet desde enlaces que me llegan por mensaje o desde anuncios del buscador.',
    reverseScored: false,
    modality: 'Phishing por enlace',
  },
  {
    id: 'adf_4',
    dimension: 'alfabetizacion',
    indicator: 'ADF-c',
    text: 'Guardo mis claves o mi PIN anotados en el celular, en notas o en fotos.',
    reverseScored: false,
    modality: 'Robo de credenciales',
  },
  {
    id: 'adf_5',
    dimension: 'alfabetizacion',
    indicator: 'ADF-c',
    text: 'Tengo activada la verificación en dos pasos en mi WhatsApp.',
    reverseScored: true,
    modality: 'Robo de WhatsApp',
  },
  {
    id: 'adf_6',
    dimension: 'alfabetizacion',
    indicator: 'ADF-d',
    text: 'Me alcanza con ver la captura de un comprobante de transferencia para dar por recibido un pago.',
    reverseScored: false,
    modality: 'Transferencia falsa',
  },
  {
    id: 'adf_7',
    dimension: 'alfabetizacion',
    indicator: 'ADF-b',
    text: 'Descargo la app de mi banco solo desde la tienda oficial (Google Play o App Store).',
    reverseScored: true,
    modality: 'App o página clonada',
  },
  {
    id: 'adf_8',
    dimension: 'alfabetizacion',
    indicator: 'ADF-d',
    text: 'Si mi celular se queda sin señal de repente, espero a que vuelva antes de avisar a mi compañía telefónica o a mi banco.',
    reverseScored: false,
    modality: 'SIM swapping',
  },
]

export function dimensionDefinition(key: DimensionKey): DimensionDefinition {
  const def = DIMENSIONS.find((d) => d.key === key)
  if (!def) throw new Error(`Dimensión desconocida: ${key}`)
  return def
}
