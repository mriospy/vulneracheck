import { test, expect } from '@playwright/test'
import { completeFullAssessment } from './helpers'

test('el resultado sobrevive a un reload y el PDF se sigue pudiendo exportar', async ({ page }) => {
  await completeFullAssessment(page, `PART-RELOAD-${Date.now()}`)
  const scoreBefore = await page.locator('.text-5xl').innerText()

  await page.reload()
  await expect(page.getByText('Score total de vulnerabilidad')).toBeVisible({ timeout: 10_000 })
  const scoreAfter = await page.locator('.text-5xl').innerText()
  expect(scoreAfter).toBe(scoreBefore)

  const downloadPromise = page.waitForEvent('download', { timeout: 30_000 })
  await page.getByRole('button', { name: /Exportar informe PDF/ }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/^VulneraCheck_Informe_.*\.pdf$/)
})
