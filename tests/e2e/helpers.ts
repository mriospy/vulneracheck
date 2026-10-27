import type { Page } from '@playwright/test'

/** Completa el onboarding con un token dado y llega a la escala. */
export async function startAssessment(page: Page, token: string) {
  await page.goto(`/?token=${token}`)
  await page.waitForSelector('#token')
  await page.locator('input[type=checkbox]').click()
  await page.getByRole('button', { name: /Comenzar evaluación/ }).click()
  await page.waitForSelector('[data-testid=item-text]')
}

/**
 * Responde las 40 afirmaciones. `value` (1-5) es la opción elegida en todos
 * los ítems, o una función que la decide según el número de afirmación.
 */
export async function answerScale(page: Page, value: number | ((index: number) => number) = 3) {
  for (let i = 0; i < 40; i++) {
    const v = typeof value === 'function' ? value(i) : value
    const counter = page.getByText(`Afirmación ${i + 1} de 40`)
    await counter.waitFor({ timeout: 5_000 })
    await page.getByRole('radio').nth(v - 1).click()
  }
  await page.waitForSelector('text=Puntaje total de vulnerabilidad', { timeout: 20_000 })
}

/** Flujo completo: onboarding -> 40 ítems -> resultados. */
export async function completeFullAssessment(page: Page, token: string, value: number | ((index: number) => number) = 3) {
  await startAssessment(page, token)
  await answerScale(page, value)
}
