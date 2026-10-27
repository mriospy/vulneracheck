import { test, expect } from '@playwright/test'
import { completeFullAssessment, startAssessment } from './helpers'

test('completa el flujo completo de evaluación sin errores de consola', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  await completeFullAssessment(page, `PART-TEST-${Date.now()}`)

  // Todo "3" => cada ítem aporta 3 (invertido también da 3) => 40 x 3 = 120, nivel medio.
  await expect(page.getByTestId('total-score')).toHaveText('120')
  await expect(page.getByText('Vulnerabilidad media')).toBeVisible()
  await expect(page.getByText('Orientaciones preventivas')).toBeVisible()
  expect(errors).toEqual([])
})

// Con 5 ítems directos y 3 inversos en D1-D4, y 4 + 4 en D5:
// todo "1" => D1-D4: 5x1 + 3x5 = 20 c/u; D5: 4x1 + 4x5 = 24 => total 104.
// todo "5" => D1-D4: 5x5 + 3x1 = 28 c/u; D5: 4x5 + 4x1 = 24 => total 136.
// Si la inversión de los ítems inversos fallara, darían 40 y 200.
test('invierte los ítems inversos al sumar (todo "Totalmente en desacuerdo")', async ({ page }) => {
  await completeFullAssessment(page, `PART-INV1-${Date.now()}`, 1)
  await expect(page.getByTestId('total-score')).toHaveText('104')
  await expect(page.getByText('20/40')).toHaveCount(4)
  await expect(page.getByText('24/40')).toHaveCount(1)
})

test('invierte los ítems inversos al sumar (todo "Totalmente de acuerdo")', async ({ page }) => {
  await completeFullAssessment(page, `PART-INV5-${Date.now()}`, 5)
  await expect(page.getByTestId('total-score')).toHaveText('136')
  await expect(page.getByText('28/40')).toHaveCount(4)
  await expect(page.getByText('24/40')).toHaveCount(1)
})

test('permite volver a la afirmación anterior y ver la respuesta marcada', async ({ page }) => {
  await startAssessment(page, `PART-BACK-${Date.now()}`)
  const firstText = await page.getByTestId('item-text').innerText()
  await page.getByRole('radio').nth(3).click()
  await expect(page.getByText('Afirmación 2 de 40')).toBeVisible()

  await page.getByRole('button', { name: /Anterior/ }).click()
  await expect(page.getByTestId('item-text')).toHaveText(firstText)
  await expect(page.getByRole('radio').nth(3)).toHaveAttribute('aria-checked', 'true')
})

test('el historial de evaluaciones aparece luego de una segunda evaluación', async ({ page }) => {
  test.setTimeout(120_000) // corre el flujo completo dos veces seguidas
  await completeFullAssessment(page, `PART-HIST-1-${Date.now()}`)
  await page.getByRole('button', { name: /Nueva evaluación/ }).click()
  await completeFullAssessment(page, `PART-HIST-2-${Date.now()}`)

  await expect(page.getByText('Evolución histórica')).toBeVisible()
})
