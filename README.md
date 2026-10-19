# Plan 80

App personal para el plan 88 → 80 kg (19 oct 2026 – 21 feb 2027).

- **Hoy:** entrenamiento del día (barras o trote según la semana) y menú con check por comida.
- **Peso:** registro, promedio semanal contra la meta y gráfico.
- **Compras:** lista semanal con checks (se reinicia cada lunes) y meal prep.

Todo el contenido del plan está en `lib/plan.ts`.

## Publicar en Vercel

1. En [vercel.com/new](https://vercel.com/new), importa este repo de GitHub y dale **Deploy** (sin cambiar nada).
2. En el proyecto: **Storage → Create Database → Upstash for Redis** (plan gratis) y conéctala al proyecto. Esto agrega solo `KV_REST_API_URL` y `KV_REST_API_TOKEN`.
3. **Settings → Environment Variables:** agrega `APP_PIN` con el PIN que quieras para entrar.
4. **Deployments → ⋯ → Redeploy** para que tome las variables.
5. En el celular, abre la URL y "Agregar a pantalla de inicio".

Sin base de datos la app funciona en modo prueba (los datos se pierden).

## Local

```bash
npm install
APP_PIN=1234 npm run dev
```
