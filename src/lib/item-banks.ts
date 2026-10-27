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
//
// Redacción orientada a reducir el sesgo de deseabilidad social (que la
// persona no perciba qué conducta se está evaluando):
//  - Sin términos que delaten el engaño ("estafa", "falso", "supuesto",
//    comillas irónicas): la situación se describe como la percibe quien la
//    vive, es decir, como algo legítimo.
//  - Los ítems directos justifican la conducta vulnerable con un valor
//    socialmente aceptable (rapidez, cortesía, confianza, practicidad), para
//    que estar de acuerdo no se sienta como la respuesta "incorrecta".
//  - Los ítems inversos presentan la conducta protectora con un costo
//    ("aunque me demore", "puedo parecer descortés"), para que tampoco sea
//    la respuesta obvia.

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
    text: 'Cuando mi banco me avisa de un problema con mi cuenta, prefiero resolverlo en el momento desde el mismo mensaje antes que dejarlo para después.',
    reverseScored: false,
    modality: 'Falso bloqueo / alerta',
  },
  {
    id: 'urg_2',
    dimension: 'urgencia',
    indicator: 'URG-a',
    text: 'Si me llega una alerta de un movimiento que no reconozco, lo primero que hago es seguir los pasos que indica la alerta para frenarlo.',
    reverseScored: false,
    modality: 'Phishing por enlace',
  },
  {
    id: 'urg_3',
    dimension: 'urgencia',
    indicator: 'URG-b',
    text: 'Cuando tengo que resolver algo de dinero con un plazo corto, confío más en mi intuición que en ponerme a averiguar.',
    reverseScored: false,
    modality: 'Falso bloqueo / alerta',
  },
  {
    id: 'urg_4',
    dimension: 'urgencia',
    indicator: 'URG-b',
    text: 'En días de mucho movimiento, si el cliente ya me mostró el comprobante de pago, le entrego la mercadería para no hacerlo esperar.',
    reverseScored: false,
    modality: 'Transferencia falsa',
  },
  {
    id: 'urg_5',
    dimension: 'urgencia',
    indicator: 'URG-c',
    text: 'Si existe la posibilidad de perder dinero de mi cuenta, hago lo que haga falta para evitarlo cuanto antes.',
    reverseScored: false,
    modality: 'Falso bloqueo / alerta',
  },
  {
    id: 'urg_6',
    dimension: 'urgencia',
    indicator: 'URG-b',
    text: 'Aunque un aviso diga que es urgente, me tomo mi tiempo: si fuera algo serio, el banco volvería a contactarme.',
    reverseScored: true,
    modality: 'Falso bloqueo / alerta',
  },
  {
    id: 'urg_7',
    dimension: 'urgencia',
    indicator: 'URG-a',
    text: 'Me molestan los mensajes que me apuran; cuando me presionan, prefiero no responder en el momento.',
    reverseScored: true,
    modality: 'Falso bloqueo / alerta',
  },
  {
    id: 'urg_8',
    dimension: 'urgencia',
    indicator: 'URG-c',
    text: 'Antes de mover dinero por un imprevisto, suelo comentarlo con alguien de mi confianza, aunque eso me demore.',
    reverseScored: true,
    modality: 'Falso bloqueo / alerta',
  },

  // --- D2 · Obediencia a la autoridad ---------------------------------------
  {
    id: 'aut_1',
    dimension: 'autoridad',
    indicator: 'AUT-a',
    text: 'Cuando alguien del banco me llama para ayudarme con mi cuenta, sigo sus indicaciones porque conoce mejor el sistema.',
    reverseScored: false,
    modality: 'Falso soporte del banco',
  },
  {
    id: 'aut_2',
    dimension: 'autoridad',
    indicator: 'AUT-b',
    text: 'Si el área de seguridad de mi banco me pide confirmar un código que me llegó al celular, se lo leo para agilizar el trámite.',
    reverseScored: false,
    modality: 'Falso soporte del banco',
  },
  {
    id: 'aut_3',
    dimension: 'autoridad',
    indicator: 'AUT-c',
    text: 'Si la persona que me llama ya tiene mis datos (nombre, cédula, últimos números de la tarjeta), no veo necesidad de pedirle más pruebas.',
    reverseScored: false,
    modality: 'Falso soporte del banco',
  },
  {
    id: 'aut_4',
    dimension: 'autoridad',
    indicator: 'AUT-a',
    text: 'Si un técnico me indica instalar una aplicación para revisar mi celular a distancia, lo hago para que el problema se resuelva rápido.',
    reverseScored: false,
    modality: 'Acceso remoto',
  },
  {
    id: 'aut_5',
    dimension: 'autoridad',
    indicator: 'AUT-b',
    text: 'Cuando mi compañía telefónica me pide un código para actualizar o mejorar mi línea, se lo paso sin problema.',
    reverseScored: false,
    modality: 'SIM swapping',
  },
  {
    id: 'aut_6',
    dimension: 'autoridad',
    indicator: 'AUT-b',
    text: 'Puedo parecer descortés, pero no le dicto códigos ni claves a nadie por teléfono, sea quien sea.',
    reverseScored: true,
    modality: 'Falso soporte del banco',
  },
  {
    id: 'aut_7',
    dimension: 'autoridad',
    indicator: 'AUT-a',
    text: 'Cuando me llama alguien del banco, prefiero cortar y llamar yo a la línea oficial, aunque tenga que esperar para que me atiendan.',
    reverseScored: true,
    modality: 'Falso soporte del banco',
  },
  {
    id: 'aut_8',
    dimension: 'autoridad',
    indicator: 'AUT-c',
    text: 'Un cargo importante o un tono muy profesional no me alcanzan para confiar en quien me llama.',
    reverseScored: true,
    modality: 'Falso soporte del banco',
  },

  // --- D3 · Reciprocidad interpersonal --------------------------------------
  {
    id: 'rec_1',
    dimension: 'reciprocidad',
    indicator: 'REC-a',
    text: 'Si alguien de atención al cliente se tomó el trabajo de ayudarme, me cuesta negarle lo que me pide después.',
    reverseScored: false,
    modality: 'Falso soporte del banco',
  },
  {
    id: 'rec_2',
    dimension: 'reciprocidad',
    indicator: 'REC-a',
    text: 'Cuando una persona es muy atenta conmigo por teléfono, siento que lo justo es colaborar con ella.',
    reverseScored: false,
    modality: 'Falso soporte del banco',
  },
  {
    id: 'rec_3',
    dimension: 'reciprocidad',
    indicator: 'REC-b',
    text: 'Si me ofrecen un beneficio (un reintegro, un premio, una tasa preferencial), no me molesta compartir mis datos para acceder a él.',
    reverseScored: false,
    modality: 'Falso premio / reembolso',
  },
  {
    id: 'rec_4',
    dimension: 'reciprocidad',
    indicator: 'REC-c',
    text: 'Si alguien me avisa que me transfirió dinero por equivocación, se lo devuelvo enseguida; me parece lo correcto.',
    reverseScored: false,
    modality: 'Transferencia falsa',
  },
  {
    id: 'rec_5',
    dimension: 'reciprocidad',
    indicator: 'REC-c',
    text: 'Si un vendedor me hizo un buen descuento, no me parece bien pedirle más garantías antes de pagarle.',
    reverseScored: false,
    modality: 'Venta falsa',
  },
  {
    id: 'rec_6',
    dimension: 'reciprocidad',
    indicator: 'REC-c',
    text: 'Aunque alguien haya sido muy amable conmigo, si me pide datos personales le digo que no, sin sentir culpa.',
    reverseScored: true,
    modality: 'Falso soporte del banco',
  },
  {
    id: 'rec_7',
    dimension: 'reciprocidad',
    indicator: 'REC-a',
    text: 'Me incomoda que alguien que no conozco me ofrezca ayuda con mis cuentas sin que yo se la haya pedido.',
    reverseScored: true,
    modality: 'Falso soporte del banco',
  },
  {
    id: 'rec_8',
    dimension: 'reciprocidad',
    indicator: 'REC-b',
    text: 'Prefiero perderme un beneficio antes que dar mis datos para recibirlo.',
    reverseScored: true,
    modality: 'Falso premio / reembolso',
  },

  // --- D4 · Conformidad social -----------------------------------------------
  {
    id: 'con_1',
    dimension: 'conformidad',
    indicator: 'CON-a',
    text: 'Antes de invertir o comprar en línea me fijo en los comentarios de otros clientes; si son buenos, me alcanza para decidir.',
    reverseScored: false,
    modality: 'Inversión falsa',
  },
  {
    id: 'con_2',
    dimension: 'conformidad',
    indicator: 'CON-b',
    text: 'Si varios conocidos de mi grupo ya están ganando con una inversión, sumarme me parece una decisión razonable.',
    reverseScored: false,
    modality: 'Inversión falsa',
  },
  {
    id: 'con_3',
    dimension: 'conformidad',
    indicator: 'CON-c',
    text: 'Una página o un perfil con muchos seguidores me transmite seriedad.',
    reverseScored: false,
    modality: 'App o página clonada',
  },
  {
    id: 'con_4',
    dimension: 'conformidad',
    indicator: 'CON-b',
    text: 'Si un familiar me comparte una promoción del banco, la aprovecho directamente desde lo que me envió.',
    reverseScored: false,
    modality: 'Phishing por enlace',
  },
  {
    id: 'con_5',
    dimension: 'conformidad',
    indicator: 'CON-c',
    text: 'Si una aplicación de préstamos o inversiones es muy usada, doy por hecho que está en regla.',
    reverseScored: false,
    modality: 'Inversión falsa',
  },
  {
    id: 'con_6',
    dimension: 'conformidad',
    indicator: 'CON-a',
    text: 'Aunque una inversión tenga muy buenas recomendaciones, averiguo por mi cuenta si la empresa está habilitada para operar.',
    reverseScored: true,
    modality: 'Inversión falsa',
  },
  {
    id: 'con_7',
    dimension: 'conformidad',
    indicator: 'CON-a',
    text: 'Los testimonios y comentarios en redes sociales influyen poco en mis decisiones de dinero.',
    reverseScored: true,
    modality: 'Inversión falsa',
  },
  {
    id: 'con_8',
    dimension: 'conformidad',
    indicator: 'CON-b',
    text: 'Que todos en un grupo estén entusiasmados con una oportunidad no me hace decidir más rápido.',
    reverseScored: true,
    modality: 'Inversión falsa',
  },

  // --- D5 · Alfabetización digital financiera --------------------------------
  {
    id: 'adf_1',
    dimension: 'alfabetizacion',
    indicator: 'ADF-a',
    text: 'Antes de escribir mi usuario y clave, me fijo en la dirección web que aparece en el navegador.',
    reverseScored: true,
    modality: 'App o página clonada',
  },
  {
    id: 'adf_2',
    dimension: 'alfabetizacion',
    indicator: 'ADF-b',
    text: 'Me doy cuenta enseguida cuando la pantalla de mi banco tiene algo distinto de lo habitual.',
    reverseScored: true,
    modality: 'App o página clonada',
  },
  {
    id: 'adf_3',
    dimension: 'alfabetizacion',
    indicator: 'ADF-a',
    text: 'Para entrar a la banca por internet, me resulta más práctico usar el primer resultado del buscador o un enlace que ya tengo en mis mensajes.',
    reverseScored: false,
    modality: 'Phishing por enlace',
  },
  {
    id: 'adf_4',
    dimension: 'alfabetizacion',
    indicator: 'ADF-c',
    text: 'Para no olvidarme, tengo mis claves o mi PIN guardados en el celular (en notas, fotos o chats).',
    reverseScored: false,
    modality: 'Robo de credenciales',
  },
  {
    id: 'adf_5',
    dimension: 'alfabetizacion',
    indicator: 'ADF-c',
    text: 'Tengo configurado un PIN adicional (verificación en dos pasos) en mi WhatsApp.',
    reverseScored: true,
    modality: 'Robo de WhatsApp',
  },
  {
    id: 'adf_6',
    dimension: 'alfabetizacion',
    indicator: 'ADF-d',
    text: 'Para mí, una captura del comprobante de transferencia es prueba suficiente de que me pagaron.',
    reverseScored: false,
    modality: 'Transferencia falsa',
  },
  {
    id: 'adf_7',
    dimension: 'alfabetizacion',
    indicator: 'ADF-b',
    text: 'Las aplicaciones de bancos las instalo solamente desde la tienda oficial del celular, nunca desde un enlace.',
    reverseScored: true,
    modality: 'App o página clonada',
  },
  {
    id: 'adf_8',
    dimension: 'alfabetizacion',
    indicator: 'ADF-d',
    text: 'Si mi celular se queda sin señal de golpe, pienso que es un problema de antena y espero a que vuelva.',
    reverseScored: false,
    modality: 'SIM swapping',
  },
]

export function dimensionDefinition(key: DimensionKey): DimensionDefinition {
  const def = DIMENSIONS.find((d) => d.key === key)
  if (!def) throw new Error(`Dimensión desconocida: ${key}`)
  return def
}
