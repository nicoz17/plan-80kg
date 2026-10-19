import { NextRequest, NextResponse } from "next/server";
import { autorizado } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODELO = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";

const HERRAMIENTA = {
  name: "registrar_comida",
  description: "Registra la estimación nutricional de la comida de la foto.",
  input_schema: {
    type: "object",
    properties: {
      es_comida: { type: "boolean", description: "false si la foto no muestra comida ni bebida" },
      nombre: { type: "string", description: "Nombre corto del plato en español de Chile, máx. 6 palabras" },
      items: {
        type: "array",
        description: "Cada alimento visible con su porción estimada",
        items: {
          type: "object",
          properties: {
            nombre: { type: "string" },
            gramos: { type: "number" },
            kcal: { type: "number" },
            prot: { type: "number" },
          },
          required: ["nombre", "gramos", "kcal", "prot"],
        },
      },
      kcal: { type: "number", description: "Total de calorías" },
      prot: { type: "number", description: "Total de proteína en gramos" },
      carbs: { type: "number", description: "Total de carbohidratos en gramos" },
      grasa: { type: "number", description: "Total de grasa en gramos" },
      confianza: { type: "string", enum: ["alta", "media", "baja"] },
      comentario: {
        type: "string",
        description: "Una frase corta y directa comparando con el plan (proteína, porción de carbos, frituras). Tono de amigo, sin sermones.",
      },
    },
    required: ["es_comida", "nombre", "items", "kcal", "prot", "carbs", "grasa", "confianza", "comentario"],
  },
};

// Solo para probar en local sin clave (ANALYZE_MOCK=1 y next dev)
const MOCK = {
  nombre: "Pollo con arroz y ensalada",
  items: [
    { nombre: "Pechuga de pollo a la plancha", gramos: 180, kcal: 297, prot: 56 },
    { nombre: "Arroz blanco", gramos: 200, kcal: 260, prot: 5 },
    { nombre: "Ensalada de tomate y lechuga", gramos: 150, kcal: 30, prot: 1 },
    { nombre: "Palta", gramos: 40, kcal: 64, prot: 1 },
  ],
  kcal: 651,
  prot: 63,
  carbs: 66,
  grasa: 13,
  confianza: "media",
  comentario: "Bien de proteína. El arroz se pasó un poco del puño: la próxima, la mitad y más ensalada.",
};

export async function POST(req: NextRequest) {
  const no = autorizado(req);
  if (no) return no;

  if (process.env.ANALYZE_MOCK === "1" && process.env.NODE_ENV !== "production") {
    return NextResponse.json({ resultado: MOCK });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Falta ANTHROPIC_API_KEY en Vercel. Mientras tanto puedes anotar la comida a mano." },
      { status: 501 },
    );
  }

  let body: { image?: string; plan?: string; nota?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(body.image ?? "");
  if (!m || m[1].length > 2_000_000) {
    return NextResponse.json({ error: "La foto no llegó bien. Intenta de nuevo." }, { status: 400 });
  }

  const contexto = [
    "Persona: hombre de 24 años, 88 kg, bajando a 80 kg. Meta diaria: 2.300 kcal y 170 g de proteína.",
    body.plan ? `Lo que el plan indicaba para esta comida: ${String(body.plan).slice(0, 400)}` : "",
    body.nota ? `Nota del usuario sobre la foto: ${String(body.nota).slice(0, 300)}` : "",
    "Estima porciones mirando el tamaño del plato, cubiertos y manos. Usa referencias chilenas (marraqueta ~100 g, palta, etc.). Si hay aceite o salsas visibles, inclúyelos. Si dudas entre dos porciones, elige la mayor.",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODELO,
      max_tokens: 1024,
      tools: [HERRAMIENTA],
      tool_choice: { type: "tool", name: "registrar_comida" },
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: m[1] } },
            { type: "text", text: contexto },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const detalle = await res.text().catch(() => "");
    console.error("Anthropic", res.status, detalle.slice(0, 500));
    const msg =
      res.status === 401
        ? "La clave de la API no es válida. Revisa ANTHROPIC_API_KEY en Vercel."
        : res.status === 400 && detalle.includes("credit")
          ? "Tu cuenta de la API no tiene saldo. Carga crédito en console.anthropic.com."
          : "No se pudo analizar la foto. Intenta de nuevo o anótala a mano.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const data = await res.json();
  const uso = data.content?.find((c: { type: string }) => c.type === "tool_use");
  if (!uso?.input) {
    return NextResponse.json({ error: "No se pudo leer la respuesta. Intenta de nuevo." }, { status: 502 });
  }
  if (uso.input.es_comida === false) {
    return NextResponse.json({ error: "No veo comida en esa foto. Prueba con otra." }, { status: 422 });
  }
  return NextResponse.json({ resultado: uso.input });
}
