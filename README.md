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

## Registrar comida

Gratis: busca en la lista de alimentos (`lib/alimentos.ts`) o crea los tuyos desde la app.

### Cálculo por foto con IA (opcional, pagado)

Para que la app calcule calorías desde una foto, agrega en Vercel la variable `ANTHROPIC_API_KEY`
(se crea en [console.anthropic.com](https://console.anthropic.com), se paga por uso: unos pocos pesos por foto)
y haz Redeploy. Sin la clave, la foto se guarda igual y anotas las calorías a mano.

### Lista de alimentos

- `lib/alimentos.ts`: básicos y típicos por comida.
- `lib/genericos.ts`: ~400 alimentos y platos chilenos (valores aproximados).
- `lib/productos.ts`: productos de supermercado en Chile, generado con `scripts/productos.py`
  desde [Open Food Facts](https://world.openfoodfacts.org) (licencia ODbL).
