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
// Escala mixta: en cada dimensión hay 4 ítems de contexto COTIDIANO (el
// mecanismo psicológico en la vida diaria, sin relación con bancos ni
// seguridad) y 4 de contexto BANCARIO (situaciones reconocibles de los
// servicios financieros digitales locales). Así la persona no percibe un
// "test de ciberseguridad", y el análisis puede contrastar la tendencia
// general con la conducta bancaria (la susceptibilidad general a la
// persuasión no equivale necesariamente a la vulnerabilidad específica).
//
// Redacción orientada a reducir el sesgo de deseabilidad social:
//  - Sin términos que delaten el engaño ("estafa", "falso", "supuesto",
//    comillas irónicas): la situación se describe como la percibe quien la
//    vive, es decir, como algo legítimo.
//  - Los ítems directos justifican la conducta vulnerable con un valor
//    socialmente aceptable (rapidez, cortesía, confianza, practicidad).
//  - Los ítems inversos presentan la conducta protectora con un costo
//    ("aunque me demore", "puedo parecer descortés").

import type { DimensionKey } from '@/types/assessment'

export const LIKERT_LABELS = [
  'Totalmente en desacuerdo',
  'En desacuerdo',
  'Ni de acuerdo ni en desacuerdo',
  'De acuerdo',
  'Totalmente de acuerdo',
] as const

export type ItemContext = 'cotidiano' | 'bancario'

export type ScamModality =
  | 'Falso bloqueo / alerta'
  | 'Falso soporte del banco'
  | 'SIM swapping'
  | 'Transferencia falsa'
  | 'Phishing por enlace'
  | 'Falso premio / reembolso'
  | 'Inversión falsa'
  | 'Robo de credenciales'

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
      { id: 'URG-a', text: 'Acción inmediata ante avisos de plazo, bloqueo o pérdida' },
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
      { id: 'AUT-a', text: 'Acatamiento de instrucciones de figuras con un rol institucional' },
      { id: 'AUT-b', text: 'Divulgación de credenciales o códigos ante un rol institucional' },
      { id: 'AUT-c', text: 'Confianza en señales de oficialidad (cargo, uniforme, credencial, datos conocidos)' },
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
      { id: 'REC-b', text: 'Entrega de información o compromiso a cambio de un beneficio' },
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
      { id: 'ADF-a', text: 'Verificación de direcciones web y canales oficiales' },
      { id: 'ADF-b', text: 'Reconocimiento de pantallas y aplicaciones que cambian de lo habitual' },
      { id: 'ADF-c', text: 'Gestión de credenciales, permisos y configuración del dispositivo' },
      { id: 'ADF-d', text: 'Verificación de pagos antes y después de una operación' },
    ],
  },
]

export interface ScaleItem {
  id: string
  dimension: DimensionKey
  indicator: string
  context: ItemContext
  text: string
  reverseScored: boolean
  /** Modalidad de estafa que representa (solo ítems bancarios). */
  modality: ScamModality | null
}

export const SCALE_ITEMS: ScaleItem[] = [
  // --- D1 · Reactividad ante la urgencia ------------------------------------
  {
    id: 'urg_c1',
    dimension: 'urgencia',
    indicator: 'URG-b',
    context: 'cotidiano',
    text: 'Cuando una oferta dice "últimas unidades" o "solo por hoy", siento que tengo que decidir ya.',
    reverseScored: false,
    modality: null,
  },
  {
    id: 'urg_c2',
    dimension: 'urgencia',
    indicator: 'URG-a',
    context: 'cotidiano',
    text: 'Si me avisan que algo vence hoy, dejo lo que estoy haciendo para resolverlo en el momento.',
    reverseScored: false,
    modality: null,
  },
  {
    id: 'urg_c3',
    dimension: 'urgencia',
    indicator: 'URG-b',
    context: 'cotidiano',
    text: 'Prefiero perder una oportunidad antes que decidir apurado/a.',
    reverseScored: true,
    modality: null,
  },
  {
    id: 'urg_c4',
    dimension: 'urgencia',
    indicator: 'URG-c',
    context: 'cotidiano',
    text: 'Cuando algo me preocupa mucho, espero a calmarme antes de tomar una decisión.',
    reverseScored: true,
    modality: null,
  },
  {
    id: 'urg_1',
    dimension: 'urgencia',
    indicator: 'URG-a',
    context: 'bancario',
    text: 'Cuando mi banco me avisa de un problema con mi cuenta, prefiero resolverlo en el momento desde el mismo mensaje antes que dejarlo para después.',
    reverseScored: false,
    modality: 'Falso bloqueo / alerta',
  },
  {
    id: 'urg_4',
    dimension: 'urgencia',
    indicator: 'URG-b',
    context: 'bancario',
    text: 'En días de mucho movimiento, si el cliente ya me mostró el comprobante de pago, le entrego la mercadería para no hacerlo esperar.',
    reverseScored: false,
    modality: 'Transferencia falsa',
  },
  {
    id: 'urg_5',
    dimension: 'urgencia',
    indicator: 'URG-c',
    context: 'bancario',
    text: 'Si existe la posibilidad de perder dinero de mi cuenta, hago lo que haga falta para evitarlo cuanto antes.',
    reverseScored: false,
    modality: 'Falso bloqueo / alerta',
  },
  {
    id: 'urg_6',
    dimension: 'urgencia',
    indicator: 'URG-b',
    context: 'bancario',
    text: 'Aunque un aviso diga que es urgente, me tomo mi tiempo: si fuera algo serio, el banco volvería a contactarme.',
    reverseScored: true,
    modality: 'Falso bloqueo / alerta',
  },

  // --- D2 · Obediencia a la autoridad ---------------------------------------
  {
    id: 'aut_c1',
    dimension: 'autoridad',
    indicator: 'AUT-a',
    context: 'cotidiano',
    text: 'Si un médico, un abogado o un funcionario me indica algo, lo hago sin pedir explicaciones.',
    reverseScored: false,
    modality: null,
  },
  {
    id: 'aut_c2',
    dimension: 'autoridad',
    indicator: 'AUT-c',
    context: 'cotidiano',
    text: 'Una persona con uniforme o credencial me genera confianza enseguida.',
    reverseScored: false,
    modality: null,
  },
  {
    id: 'aut_c3',
    dimension: 'autoridad',
    indicator: 'AUT-a',
    context: 'cotidiano',
    text: 'Antes de seguir una indicación pido que me expliquen el porqué, venga de quien venga.',
    reverseScored: true,
    modality: null,
  },
  {
    id: 'aut_c4',
    dimension: 'autoridad',
    indicator: 'AUT-a',
    context: 'cotidiano',
    text: 'Me animo a contradecir a un superior cuando creo que se equivoca.',
    reverseScored: true,
    modality: null,
  },
  {
    id: 'aut_2',
    dimension: 'autoridad',
    indicator: 'AUT-b',
    context: 'bancario',
    text: 'Si el área de seguridad de mi banco me pide confirmar un código que me llegó al celular, se lo leo para agilizar el trámite.',
    reverseScored: false,
    modality: 'Falso soporte del banco',
  },
  {
    id: 'aut_3',
    dimension: 'autoridad',
    indicator: 'AUT-c',
    context: 'bancario',
    text: 'Si la persona que me llama ya tiene mis datos (nombre, cédula, últimos números de la tarjeta), no veo necesidad de pedirle más pruebas.',
    reverseScored: false,
    modality: 'Falso soporte del banco',
  },
  {
    id: 'aut_5',
    dimension: 'autoridad',
    indicator: 'AUT-b',
    context: 'bancario',
    text: 'Cuando mi compañía telefónica me pide un código para actualizar o mejorar mi línea, se lo paso sin problema.',
    reverseScored: false,
    modality: 'SIM swapping',
  },
  {
    id: 'aut_6',
    dimension: 'autoridad',
    indicator: 'AUT-b',
    context: 'bancario',
    text: 'Puedo parecer descortés, pero no le dicto códigos ni claves a nadie por teléfono, sea quien sea.',
    reverseScored: true,
    modality: 'Falso soporte del banco',
  },

  // --- D3 · Reciprocidad interpersonal --------------------------------------
  {
    id: 'rec_c1',
    dimension: 'reciprocidad',
    indicator: 'REC-a',
    context: 'cotidiano',
    text: 'Si alguien me hace un favor, siento que le debo algo hasta devolvérselo.',
    reverseScored: false,
    modality: null,
  },
  {
    id: 'rec_c2',
    dimension: 'reciprocidad',
    indicator: 'REC-b',
    context: 'cotidiano',
    text: 'Cuando me dan una muestra gratis o una degustación, me siento un poco obligado/a a comprar.',
    reverseScored: false,
    modality: null,
  },
  {
    id: 'rec_c3',
    dimension: 'reciprocidad',
    indicator: 'REC-c',
    context: 'cotidiano',
    text: 'Puedo aceptar un favor sin sentir que después tengo que hacer lo que me pidan.',
    reverseScored: true,
    modality: null,
  },
  {
    id: 'rec_c4',
    dimension: 'reciprocidad',
    indicator: 'REC-c',
    context: 'cotidiano',
    text: 'Si un vendedor fue muy atento conmigo, igual me voy sin comprar cuando no me convence.',
    reverseScored: true,
    modality: null,
  },
  {
    id: 'rec_1',
    dimension: 'reciprocidad',
    indicator: 'REC-a',
    context: 'bancario',
    text: 'Si alguien de atención al cliente se tomó el trabajo de ayudarme, me cuesta negarle lo que me pide después.',
    reverseScored: false,
    modality: 'Falso soporte del banco',
  },
  {
    id: 'rec_3',
    dimension: 'reciprocidad',
    indicator: 'REC-b',
    context: 'bancario',
    text: 'Si me ofrecen un beneficio (un reintegro, un premio, una tasa preferencial), no me molesta compartir mis datos para acceder a él.',
    reverseScored: false,
    modality: 'Falso premio / reembolso',
  },
  {
    id: 'rec_4',
    dimension: 'reciprocidad',
    indicator: 'REC-c',
    context: 'bancario',
    text: 'Si alguien me avisa que me transfirió dinero por equivocación, se lo devuelvo enseguida; me parece lo correcto.',
    reverseScored: false,
    modality: 'Transferencia falsa',
  },
  {
    id: 'rec_8',
    dimension: 'reciprocidad',
    indicator: 'REC-b',
    context: 'bancario',
    text: 'Prefiero perderme un beneficio antes que dar mis datos para recibirlo.',
    reverseScored: true,
    modality: 'Falso premio / reembolso',
  },

  // --- D4 · Conformidad social -----------------------------------------------
  {
    id: 'con_c1',
    dimension: 'conformidad',
    indicator: 'CON-c',
    context: 'cotidiano',
    text: 'Si un local está lleno de gente, asumo que debe ser bueno.',
    reverseScored: false,
    modality: null,
  },
  {
    id: 'con_c2',
    dimension: 'conformidad',
    indicator: 'CON-b',
    context: 'cotidiano',
    text: 'Cuando todos en mi grupo opinan lo mismo, me cuesta pensar distinto.',
    reverseScored: false,
    modality: null,
  },
  {
    id: 'con_c3',
    dimension: 'conformidad',
    indicator: 'CON-b',
    context: 'cotidiano',
    text: 'Tomo mis decisiones sin importar lo que esté de moda.',
    reverseScored: true,
    modality: null,
  },
  {
    id: 'con_c4',
    dimension: 'conformidad',
    indicator: 'CON-a',
    context: 'cotidiano',
    text: 'Las reseñas de otras personas pesan poco cuando elijo un producto o un servicio.',
    reverseScored: true,
    modality: null,
  },
  {
    id: 'con_1',
    dimension: 'conformidad',
    indicator: 'CON-a',
    context: 'bancario',
    text: 'Antes de invertir o comprar en línea me fijo en los comentarios de otros clientes; si son buenos, me alcanza para decidir.',
    reverseScored: false,
    modality: 'Inversión falsa',
  },
  {
    id: 'con_2',
    dimension: 'conformidad',
    indicator: 'CON-b',
    context: 'bancario',
    text: 'Si varios conocidos de mi grupo ya están ganando con una inversión, sumarme me parece una decisión razonable.',
    reverseScored: false,
    modality: 'Inversión falsa',
  },
  {
    id: 'con_5',
    dimension: 'conformidad',
    indicator: 'CON-c',
    context: 'bancario',
    text: 'Si una aplicación de préstamos o inversiones es muy usada, doy por hecho que está en regla.',
    reverseScored: false,
    modality: 'Inversión falsa',
  },
  {
    id: 'con_6',
    dimension: 'conformidad',
    indicator: 'CON-a',
    context: 'bancario',
    text: 'Aunque una inversión tenga muy buenas recomendaciones, averiguo por mi cuenta si la empresa está habilitada para operar.',
    reverseScored: true,
    modality: 'Inversión falsa',
  },

  // --- D5 · Alfabetización digital financiera --------------------------------
  {
    id: 'adf_c1',
    dimension: 'alfabetizacion',
    indicator: 'ADF-c',
    context: 'cotidiano',
    text: 'Cuando instalo una aplicación, acepto los permisos que pide sin leerlos.',
    reverseScored: false,
    modality: null,
  },
  {
    id: 'adf_c2',
    dimension: 'alfabetizacion',
    indicator: 'ADF-c',
    context: 'cotidiano',
    text: 'Sé cambiar la configuración de mi celular sin pedir ayuda.',
    reverseScored: true,
    modality: null,
  },
  {
    id: 'adf_c3',
    dimension: 'alfabetizacion',
    indicator: 'ADF-b',
    context: 'cotidiano',
    text: 'Me doy cuenta cuando una aplicación o una página que uso seguido cambió de aspecto.',
    reverseScored: true,
    modality: null,
  },
  {
    id: 'adf_c4',
    dimension: 'alfabetizacion',
    indicator: 'ADF-d',
    context: 'cotidiano',
    text: 'Cuando compro por internet, reviso el detalle completo antes de confirmar el pago.',
    reverseScored: true,
    modality: null,
  },
  {
    id: 'adf_1',
    dimension: 'alfabetizacion',
    indicator: 'ADF-a',
    context: 'bancario',
    text: 'Antes de escribir mi usuario y clave, me fijo en la dirección web que aparece en el navegador.',
    reverseScored: true,
    modality: 'Phishing por enlace',
  },
  {
    id: 'adf_3',
    dimension: 'alfabetizacion',
    indicator: 'ADF-a',
    context: 'bancario',
    text: 'Para entrar a la banca por internet, me resulta más práctico usar el primer resultado del buscador o un enlace que ya tengo en mis mensajes.',
    reverseScored: false,
    modality: 'Phishing por enlace',
  },
  {
    id: 'adf_4',
    dimension: 'alfabetizacion',
    indicator: 'ADF-c',
    context: 'bancario',
    text: 'Para no olvidarme, tengo mis claves o mi PIN guardados en el celular (en notas, fotos o chats).',
    reverseScored: false,
    modality: 'Robo de credenciales',
  },
  {
    id: 'adf_6',
    dimension: 'alfabetizacion',
    indicator: 'ADF-d',
    context: 'bancario',
    text: 'Para mí, una captura del comprobante de transferencia es prueba suficiente de que me pagaron.',
    reverseScored: false,
    modality: 'Transferencia falsa',
  },
]

export function dimensionDefinition(key: DimensionKey): DimensionDefinition {
  const def = DIMENSIONS.find((d) => d.key === key)
  if (!def) throw new Error(`Dimensión desconocida: ${key}`)
  return def
}
