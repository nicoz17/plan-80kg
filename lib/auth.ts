import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

export function autorizado(req: NextRequest): NextResponse | null {
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
