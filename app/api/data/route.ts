import { NextRequest, NextResponse } from "next/server";
import { autorizado } from "@/lib/auth";
import { hdel, hgetall, hset, smembers, sset, usandoMemoria } from "@/lib/store";

export const dynamic = "force-dynamic";

const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const ID = /^[a-z0-9-]{1,40}$/;
const SLOTS = ["desayuno", "almuerzo", "colacion", "comida", "extra"];

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
  const [pesosRaw, shopping, logRaw, foodsRaw, ...doneDias] = await Promise.all([
    hgetall("weights"),
    smembers(`shop:${week}`),
    hgetall(`log:${date}`),
    hgetall("foods"),
    ...dias.map((d) => smembers(`done:${d}`)),
  ]);

  const weights: Record<string, number> = {};
  for (const [k, v] of Object.entries(pesosRaw)) weights[k] = Number(v);

  const doneWeek: Record<string, string[]> = {};
  dias.forEach((d, i) => (doneWeek[d] = doneDias[i]));
  const done = doneWeek[date] ?? (await smembers(`done:${date}`));

  const log = Object.values(logRaw)
    .map((v) => {
      try {
        return JSON.parse(v);
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => String(a.creado).localeCompare(String(b.creado)));

  const foods = Object.values(foodsRaw)
    .map((v) => {
      try {
        return JSON.parse(v);
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => String(a.nombre).localeCompare(String(b.nombre)));

  return NextResponse.json({ weights, done, doneWeek, shopping, log, foods, memoria: usandoMemoria, fotos: Boolean(process.env.ANTHROPIC_API_KEY) });
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

  if (action === "check") {
    return NextResponse.json({ ok: true, memoria: usandoMemoria, fotos: Boolean(process.env.ANTHROPIC_API_KEY) });
  }

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

  if (action === "log-add") {
    const date = String(body.date ?? "");
    const e = (body.entry ?? {}) as Record<string, unknown>;
    const id = String(e.id ?? "");
    const slot = String(e.slot ?? "");
    const foto = typeof e.foto === "string" ? e.foto : "";
    if (!FECHA.test(date) || !ID.test(id) || !SLOTS.includes(slot)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    if (foto && (!foto.startsWith("data:image/jpeg;base64,") || foto.length > 60000)) {
      return NextResponse.json({ error: "Foto inválida" }, { status: 400 });
    }
    const num = (v: unknown, max: number) => Math.max(0, Math.min(max, Math.round(Number(v) || 0)));
    const entry = {
      id,
      slot,
      nombre: String(e.nombre ?? "Comida").slice(0, 80),
      detalle: String(e.detalle ?? "").slice(0, 400),
      kcal: num(e.kcal, 5000),
      prot: num(e.prot, 400),
      carbs: num(e.carbs, 800),
      grasa: num(e.grasa, 400),
      foto,
      creado: new Date().toISOString(),
    };
    await hset(`log:${date}`, id, JSON.stringify(entry));
    return NextResponse.json({ ok: true, entry });
  }

  if (action === "food-add") {
    const f = (body.food ?? {}) as Record<string, unknown>;
    const id = String(f.id ?? "");
    const nombre = String(f.nombre ?? "").trim().slice(0, 60);
    const kcal = Math.round(Number(f.kcal));
    if (!ID.test(id) || !nombre || !Number.isFinite(kcal) || kcal <= 0 || kcal > 5000) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    const food = {
      id,
      nombre,
      porcion: String(f.porcion ?? "1 porción").slice(0, 40),
      kcal,
      prot: Math.max(0, Math.min(400, Math.round(Number(f.prot) || 0))),
      cat: "Mis comidas",
      propio: true,
    };
    await hset("foods", id, JSON.stringify(food));
    return NextResponse.json({ ok: true, food });
  }

  if (action === "food-del") {
    const id = String(body.id ?? "");
    if (!ID.test(id)) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    await hdel("foods", id);
    return NextResponse.json({ ok: true });
  }

  if (action === "log-del") {
    const date = String(body.date ?? "");
    const id = String(body.id ?? "");
    if (!FECHA.test(date) || !ID.test(id)) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    await hdel(`log:${date}`, id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Acción desconocida" }, { status: 400 });
}
