import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { hdel, hgetall, hset, smembers, sset, usandoMemoria } from "@/lib/store";

export const dynamic = "force-dynamic";

const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const ID = /^[a-z0-9-]{1,40}$/;

function autorizado(req: NextRequest): NextResponse | null {
  const pin = process.env.APP_PIN;
  if (!pin) {
    return NextResponse.json(
      { error: "Falta configurar APP_PIN en las variables de entorno de Vercel." },
      { status: 500 },
    );
  }
  const dado = Buffer.from(req.headers.get("x-pin") ?? "");
  const real = Buffer.from(pin);
  if (dado.length !== real.length || !timingSafeEqual(dado, real)) {
    return NextResponse.json({ error: "PIN incorrecto" }, { status: 401 });
  }
  return null;
}

function sumarDias(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d) + n * 86400000).toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  const no = autorizado(req);
  if (no) return no;

  const date = req.nextUrl.searchParams.get("date") ?? "";
  const week = req.nextUrl.searchParams.get("week") ?? "";
  if (!FECHA.test(date) || !FECHA.test(week)) {
    return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
  }

  const dias = Array.from({ length: 7 }, (_, i) => sumarDias(week, i));
  const [pesosRaw, shopping, ...doneDias] = await Promise.all([
    hgetall("weights"),
    smembers(`shop:${week}`),
    ...dias.map((d) => smembers(`done:${d}`)),
  ]);

  const weights: Record<string, number> = {};
  for (const [k, v] of Object.entries(pesosRaw)) weights[k] = Number(v);

  const doneWeek: Record<string, string[]> = {};
  dias.forEach((d, i) => (doneWeek[d] = doneDias[i]));
  const done = doneWeek[date] ?? (await smembers(`done:${date}`));

  return NextResponse.json({ weights, done, doneWeek, shopping, memoria: usandoMemoria });
}

export async function POST(req: NextRequest) {
  const no = autorizado(req);
  if (no) return no;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { action } = body;

  if (action === "check") return NextResponse.json({ ok: true, memoria: usandoMemoria });

  if (action === "weight") {
    const date = String(body.date ?? "");
    if (!FECHA.test(date)) return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
    if (body.kg === null) {
      await hdel("weights", date);
      return NextResponse.json({ ok: true });
    }
    const kg = Number(body.kg);
    if (!Number.isFinite(kg) || kg < 30 || kg > 250) {
      return NextResponse.json({ error: "Peso fuera de rango" }, { status: 400 });
    }
    await hset("weights", date, kg.toFixed(1));
    return NextResponse.json({ ok: true });
  }

  if (action === "done" || action === "shop") {
    const key = String((action === "done" ? body.date : body.week) ?? "");
    const id = String(body.id ?? "");
    if (!FECHA.test(key) || !ID.test(id)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    await sset(`${action === "done" ? "done" : "shop"}:${key}`, id, Boolean(body.on));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Acción desconocida" }, { status: 400 });
}
