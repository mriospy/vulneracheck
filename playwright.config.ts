import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5183',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
  webServer: {
    command: 'npm run dev -- --port 5183',
    url: 'http://localhost:5183',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    // Esta suite prueba la PWA standalone (sin la plataforma corriendo).
    // Forzamos VITE_PLATFORM_URL vacío para no heredar el valor que .env.local
    // pueda tener seteado localmente para probar la integración cross-proyecto
    // — si no, un fetch a una plataforma que no está levantada logea un error
    // de red en la consola del navegador aunque el try/catch de la app lo
    // maneje bien (el flujo del participante no se rompe, pero el test de
    // "cero errores de consola" sí lo detecta, correctamente en ese contexto
    // pero no en este).
    env: { VITE_PLATFORM_URL: '' },
  },
})
