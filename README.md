# VulneraCheck

PWA de evaluación de vulnerabilidad conductual frente al Fraude de Pagos
Autorizados (APP) — instrumento de tesis. Vite + React 19 + TypeScript.
Test de 4 módulos (~6-8 min), score pentafactorial, exportación de informe
en PDF, y (opcional) integración con `~/vulneracheck-platform`.

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

Corre standalone (sin depender de `vulneracheck-platform`): 4 tests —
flujo completo de evaluación, resiliencia ante reload + exportación de PDF,
y aleatorización del banco de ítems del Micro-GSS. `playwright.config.ts`
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
de la PWA: 4 módulos completos, PDF export, historial local, backend de
recolección de datos (Netlify Functions + Blobs) e integración opcional con
la plataforma — todo verificado end-to-end.
