import { test, expect } from '@playwright/test'
import { startAssessment } from './helpers'

/**
 * Verifica que el orden de presentación de los 40 ítems varía entre
 * sesiones (mezcla entre dimensiones para evitar respuestas por bloque o en
 * "piloto automático").
 */
test('el orden de las afirmaciones varía entre sesiones distintas', async ({ browser }) => {
  const firstItems = new Set<string>()

  for (let i = 0; i < 4; i++) {
    const ctx = await browser.newContext()
    const p = await ctx.newPage()
    await startAssessment(p, `PART-ORDER-${i}-${Date.now()}`)
    firstItems.add(await p.getByTestId('item-text').innerText())
    await ctx.close()
  }

  // Con 40 ítems y 4 corridas, que salga el mismo primero las 4 veces es
  // extremadamente improbable — pedimos al menos 2 distintos.
  expect(firstItems.size).toBeGreaterThanOrEqual(2)
})
