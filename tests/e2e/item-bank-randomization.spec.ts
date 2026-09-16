import { test, expect } from '@playwright/test'
import { completeModule1, startAssessment } from './helpers'

/**
 * Verifica que el banco de ítems del Micro-GSS y de Escenarios realmente
 * varía entre sesiones (protege contra memorización en administraciones
 * repetidas del instrumento — requisito explícito del proyecto).
 */
test('la narrativa del Micro-GSS varía entre sesiones distintas', async ({ page, browser }) => {
  const narratives = new Set<string>()

  for (let i = 0; i < 4; i++) {
    const ctx = await browser.newContext()
    const p = await ctx.newPage()
    await startAssessment(p, `PART-GSS-${i}-${Date.now()}`)
    await completeModule1(p)
    const narrative = await p.locator('p.leading-relaxed').first().innerText()
    narratives.add(narrative.slice(0, 30))
    await ctx.close()
  }

  // Con 6 variantes y 4 corridas, es extremadamente improbable (pero no
  // imposible) sacar la misma las 4 veces — pedimos al menos 2 distintas.
  expect(narratives.size).toBeGreaterThanOrEqual(2)
})
