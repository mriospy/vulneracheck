# VulneraCheck

PWA de la Escala de Vulnerabilidad Frente a Estafas en Servicios Financieros
Digitales de Entidades Bancarias — instrumento de tesis. Vite + React 19 +
TypeScript. 40 ítems Likert 1-5 (~6-8 min) en 5 dimensiones: reactividad
ante la urgencia, obediencia a la autoridad, reciprocidad interpersonal,
conformidad social y alfabetización digital financiera. Ítems directos e
inversos (inversión automática), suma por dimensión (8-40) y total (40-200),
niveles bajo/medio/alto, orientaciones preventivas personalizadas, informe
PDF generado localmente y (opcional) integración con `~/vulneracheck-platform`.

El banco de ítems, las definiciones e indicadores de cada dimensión están
en `src/lib/item-banks.ts`; la puntuación y los puntos de corte en
`src/lib/scoring-engine.ts`.

Desplegada en: https://vulneracheck.netlify.app

## Desarrollo local

```bash
npm install
npm run dev
```

## Tests E2E (Playwright)

```bash
npm run test:e2e
```

Corre standalone (sin depender de `vulneracheck-platform`): 7 tests —
flujo completo, verificación de la inversión de ítems inversos (todo 1 =
104, todo 5 = 136), navegación hacia atrás, historial, orden aleatorio de
los ítems entre sesiones y resiliencia ante reload + exportación de PDF. `playwright.config.ts`
levanta el server de dev solo y fuerza `VITE_PLATFORM_URL` vacío para no
heredar configuración local de integración cross-proyecto.

## Integración opcional con vulneracheck-platform

Si `~/vulneracheck-platform` está corriendo local (`npm run dev` en
`localhost:3000`), configurá en `.env.local`:

```
VITE_PLATFORM_URL=http://localhost:3000
```

Con esto, la PWA valida cada token de campaña contra la plataforma antes de
arrancar y reporta el resultado al completar el test. Sin esta variable
(el caso del deploy actual en Netlify), la PWA funciona 100% standalone.

## Estado

Ver el README de `~/vulneracheck-platform` para el estado del lado
institucional (auth, campañas, simulador de phishing, dashboard). Del lado
de la PWA: escala de 40 ítems completa, PDF export, historial local, backend de
recolección de datos (Netlify Functions + Blobs) e integración opcional con
la plataforma — todo verificado end-to-end.
