import { test, expect } from '@playwright/test'
import { completeFullAssessment } from './helpers'

test('completa el flujo completo de evaluación sin errores de consola', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  await completeFullAssessment(page, `PART-TEST-${Date.now()}`)

  await expect(page.locator('.text-5xl')).toBeVisible()
  const score = await page.locator('.text-5xl').innerText()
  expect(Number(score)).toBeGreaterThanOrEqual(0)
  expect(Number(score)).toBeLessThanOrEqual(100)
  expect(errors).toEqual([])
})

test('el historial de evaluaciones aparece luego de una segunda evaluación', async ({ page }) => {
  test.setTimeout(120_000) // corre el flujo completo dos veces seguidas
  await completeFullAssessment(page, `PART-HIST-1-${Date.now()}`)
  await page.getByRole('button', { name: /Nueva evaluación/ }).click()
  await completeFullAssessment(page, `PART-HIST-2-${Date.now()}`)

  await expect(page.getByText('Evolución histórica')).toBeVisible()
})
