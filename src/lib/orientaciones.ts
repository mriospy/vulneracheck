import type { AssessmentResult, DimensionKey, RiskLevel } from '@/types/assessment'

// Orientaciones preventivas personalizadas por dimensión y nivel (objetivo
// del prototipo según el anteproyecto: que el usuario reconozca sus puntos
// débiles psicológicos y tecnológicos y tome pautas concretas). No es
// educación genérica: solo se muestran las pautas de la dimensión y del nivel
// que obtuvo la persona.

export interface Orientacion {
  dimension: DimensionKey
  label: string
  level: RiskLevel
  summary: string
  pautas: string[]
}

interface OrientacionTexts {
  summary: Record<RiskLevel, string>
  /** Pautas para nivel medio o alto. */
  pautas: string[]
  /** Pauta de refuerzo para nivel bajo. */
  refuerzo: string
}

const TEXTS: Record<DimensionKey, OrientacionTexts> = {
  urgencia: {
    summary: {
      bajo: 'Ante mensajes que exigen actuar ya, tendés a frenar y verificar.',
      medio: 'En algunas situaciones de apuro podrías actuar antes de verificar.',
      alto: 'La prisa y el miedo a perder dinero pueden llevarte a actuar sin verificar: es la palanca más usada en las estafas de falso bloqueo.',
    },
    pautas: [
      'Ningún banco bloquea tu cuenta "en minutos" por WhatsApp. Si un mensaje te apura, tomalo como señal de estafa.',
      'Antes de actuar, cerrá el mensaje y entrá vos a la app oficial del banco o llamá al número que figura detrás de tu tarjeta.',
      'Si vendés: no entregues mercadería hasta ver el dinero acreditado en tu propia app; una captura de comprobante no es un pago.',
    ],
    refuerzo: 'Seguí aplicando la regla de pausar y verificar por tu cuenta ante cualquier alerta urgente.',
  },
  autoridad: {
    summary: {
      bajo: 'No aceptás un cargo o un tono oficial como prueba de identidad.',
      medio: 'Un supuesto funcionario del banco o de la telefonía podría convencerte en algunos casos.',
      alto: 'Tendés a seguir instrucciones de quien dice hablar en nombre del banco: es la base del falso soporte y del SIM swapping.',
    },
    pautas: [
      'Tu banco nunca te pide claves, PIN, token ni códigos SMS por teléfono, WhatsApp o correo, ni siquiera "auditoría" o "seguridad".',
      'Que conozcan tu nombre o tu cédula no prueba nada: esos datos circulan. Cortá y llamá vos al número oficial.',
      'No instales aplicaciones que te pida un "técnico" ni pases códigos a tu compañía telefónica: así se toma el control de tu celular o de tu línea.',
    ],
    refuerzo: 'Mantené la costumbre de cortar y devolver la llamada al número oficial cuando alguien dice ser del banco.',
  },
  reciprocidad: {
    summary: {
      bajo: 'La amabilidad de un desconocido no te hace bajar la guardia.',
      medio: 'Un trato amable o un supuesto favor podría hacerte sentir en deuda.',
      alto: 'Cuando alguien te ayuda o te ofrece un beneficio, sentís presión por corresponder: los estafadores fingen ayudar justamente para eso.',
    },
    pautas: [
      'La amabilidad no es una credencial: si quien te "ayuda" te pide un dato o un código, cortá.',
      'Si te avisan de una transferencia "por error", no devuelvas nada: consultá primero con tu banco si el dinero realmente entró.',
      'Desconfiá de premios, bonos o reembolsos que no pediste y que requieren tus datos bancarios.',
    ],
    refuerzo: 'Seguí rechazando ayudas o beneficios que no pediste cuando a cambio te piden datos.',
  },
  conformidad: {
    summary: {
      bajo: 'Verificás por tu cuenta aunque muchos recomienden algo.',
      medio: 'Las opiniones de otros o la popularidad de una página pueden influir en tu decisión.',
      alto: 'Los comentarios positivos, los seguidores o lo que hace tu grupo pesan mucho en tu decisión: así funcionan las falsas inversiones.',
    },
    pautas: [
      'Los comentarios, "me gusta" y testimonios se compran o se inventan; no prueban que una inversión sea real.',
      'Antes de invertir, verificá que la empresa esté autorizada por las autoridades financieras del país.',
      'Un enlace reenviado por un familiar puede ser falso: tu contacto también pudo haber sido engañado.',
    ],
    refuerzo: 'Mantené el hábito de verificar por tu cuenta, aunque la oportunidad venga recomendada.',
  },
  alfabetizacion: {
    summary: {
      bajo: 'Contás con prácticas digitales que te ayudan a detectar canales falsos.',
      medio: 'Algunas prácticas digitales pueden dejarte expuesto/a a páginas clonadas o al robo de credenciales.',
      alto: 'Hay brechas en cómo verificás páginas, guardás tus claves o confirmás pagos: son puntos ciegos tecnológicos que los estafadores aprovechan.',
    },
    pautas: [
      'Entrá al banco escribiendo vos la dirección o desde la app oficial; nunca desde enlaces de mensajes o anuncios del buscador.',
      'Activá la verificación en dos pasos de WhatsApp y no guardes claves ni PIN en notas o fotos del celular.',
      'Si tu celular se queda sin señal de golpe y sin motivo, avisá de inmediato a tu compañía telefónica y a tu banco: puede ser SIM swapping.',
    ],
    refuerzo: 'Revisá cada tanto que la verificación en dos pasos siga activa y que la app del banco esté actualizada.',
  },
}

const LEVEL_ORDER: Record<RiskLevel, number> = { alto: 0, medio: 1, bajo: 2 }

/**
 * Orientaciones ordenadas de mayor a menor vulnerabilidad (nivel y luego
 * puntaje normalizado), para que lo más urgente quede primero.
 */
export function buildOrientaciones(result: AssessmentResult): Orientacion[] {
  return [...result.dimensions]
    .sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level] || b.normalizedScore - a.normalizedScore)
    .map((d) => {
      const texts = TEXTS[d.dimension]
      return {
        dimension: d.dimension,
        label: d.label,
        level: d.level,
        summary: texts.summary[d.level],
        pautas: d.level === 'bajo' ? [texts.refuerzo] : texts.pautas,
      }
    })
}
