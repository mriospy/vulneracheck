import type { Page } from '@playwright/test'

/** Completa el onboarding con un token dado y llega a Módulo 1. */
export async function startAssessment(page: Page, token: string) {
  await page.goto(`/?token=${token}`)
  await page.waitForSelector('#token')
  await page.locator('input[type=checkbox]').click()
  await page.getByRole('button', { name: /Comenzar evaluación/ }).click()
}

/** Completa el Módulo 1 (Autorreporte, ~18 ítems) con respuestas neutrales/plausibles. */
export async function completeModule1(page: Page) {
  for (let i = 0; i < 20; i++) {
    if ((await page.locator('text=Módulo 2').count()) > 0) break
    const financial = page.locator('button.justify-start').first()
    const yes = page.getByRole('button', { name: 'Sí', exact: true })
    const likert = page.locator('.grid.grid-cols-5 button').first()
    if ((await financial.count()) > 0) await financial.click()
    else if ((await yes.count()) > 0) await yes.click()
    else await likert.click()
    await page.waitForTimeout(30)
  }
  await page.waitForSelector('text=Módulo 2', { timeout: 10_000 })
}

/** Completa el Módulo 2 (Micro-GSS): cede en ambas preguntas, luego cambia bajo presión. */
export async function completeModule2(page: Page) {
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.getByRole('button', { name: 'Sí', exact: true }).click()
  await page.getByRole('button', { name: 'Sí', exact: true }).click()
  await page.getByRole('button', { name: 'Reconfirmar respuestas' }).click()
  await page.getByRole('button', { name: 'No', exact: true }).click()
  await page.getByRole('button', { name: 'No', exact: true }).click()
  await page.waitForSelector('text=Módulo 3', { timeout: 10_000 })
}

/** Completa el Módulo 3 (Escenarios): siempre "verificar", con fallback a "ignorar". */
export async function completeModule3(page: Page) {
  for (let i = 0; i < 4; i++) {
    if ((await page.locator('text=Módulo 4').count()) > 0) break
    await page
      .getByRole('button', { name: 'Verificar por canal oficial' })
      .click()
      .catch(async () => {
        await page.getByRole('button', { name: 'Ignorar' }).click()
      })
    await page.waitForTimeout(30)
  }
  await page.waitForSelector('text=Módulo 4', { timeout: 10_000 })
}

/** Completa el Módulo 4 (Go/No-Go): toca solo el estímulo verde ("go"). */
export async function completeModule4(page: Page) {
  await page.getByRole('button', { name: /Comenzar/ }).click()
  const deadline = Date.now() + 60_000
  while (Date.now() < deadline) {
    if ((await page.locator('text=Score total de vulnerabilidad').count()) > 0) break
    const stimulus = page.locator('button[aria-label="go"]')
    if ((await stimulus.count()) > 0) await stimulus.click({ timeout: 500 }).catch(() => {})
    await page.waitForTimeout(100)
  }
  await page.waitForSelector('text=Score total de vulnerabilidad', { timeout: 20_000 })
}

/** Flujo completo: onboarding -> 4 módulos -> resultados. */
export async function completeFullAssessment(page: Page, token: string) {
  await startAssessment(page, token)
  await completeModule1(page)
  await completeModule2(page)
  await completeModule3(page)
  await completeModule4(page)
}
