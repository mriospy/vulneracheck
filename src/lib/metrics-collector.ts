// Utilidades de cronometraje de alta resolución para las tareas conductuales.
// Usa performance.now() (monotónico, sub-milisegundo) en lugar de Date.now().

export function nowMs(): number {
  return performance.now()
}

export function elapsedSince(startMs: number): number {
  return Math.round(performance.now() - startMs)
}

export function newSessionId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Baraja un arreglo con Fisher-Yates. Se usa para presentar ítems del
 * banco de preguntas y variantes de escenario en orden aleatorio por sesión,
 * evitando el efecto de memorización en administraciones repetidas del test.
 */
export function shuffle<T>(items: readonly T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}
