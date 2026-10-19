import type { Alimento } from "@/lib/alimentos";

export type Slot = "desayuno" | "almuerzo" | "colacion" | "comida" | "extra";

export type Registro = {
  id: string;
  slot: Slot;
  nombre: string;
  detalle: string;
  kcal: number;
  prot: number;
  carbs: number;
  grasa: number;
  foto: string;
  creado: string;
};

export type Estado = {
  weights: Record<string, number>;
  done: string[];
  doneWeek: Record<string, string[]>;
  shopping: string[];
  log: Registro[];
  foods: Alimento[];
  memoria: boolean;
};

export type Analisis = {
  nombre: string;
  items: { nombre: string; gramos: number; kcal: number; prot: number }[];
  kcal: number;
  prot: number;
  carbs: number;
  grasa: number;
  confianza: "alta" | "media" | "baja";
  comentario: string;
};

export class ErrorApi extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

const PIN_KEY = "plan80-pin";
const FOTOS_KEY = "plan80-fotos";

export function leerPin(): string | null {
  try {
    return localStorage.getItem(PIN_KEY);
  } catch {
    return null;
  }
}

export function guardarPin(pin: string | null) {
  try {
    if (pin) localStorage.setItem(PIN_KEY, pin);
    else localStorage.removeItem(PIN_KEY);
  } catch {
    /* sin almacenamiento: se pedirá el PIN de nuevo */
  }
}

export function leerFotos(): boolean {
  try {
    return localStorage.getItem(FOTOS_KEY) === "1";
  } catch {
    return false;
  }
}

export function guardarFotos(on: boolean) {
  try {
    localStorage.setItem(FOTOS_KEY, on ? "1" : "0");
  } catch {
    /* nada */
  }
}

async function llamar<T>(url: string, pin: string, init: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "content-type": "application/json", "x-pin": pin },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ErrorApi(data.error ?? "Sin conexión. Revisa tu internet.", res.status);
  return data as T;
}

export function cargar(pin: string, date: string, week: string) {
  return llamar<Estado>(`/api/data?date=${date}&week=${week}`, pin, { method: "GET" });
}

export function enviar<T = { ok: boolean; memoria?: boolean; fotos?: boolean }>(pin: string, body: Record<string, unknown>) {
  return llamar<T>("/api/data", pin, { method: "POST", body: JSON.stringify(body) });
}

export function analizar(pin: string, image: string, plan?: string, nota?: string) {
  return llamar<{ resultado: Analisis }>("/api/analyze", pin, {
    method: "POST",
    body: JSON.stringify({ image, plan, nota }),
  });
}

/** Reduce una foto a JPEG del lado largo indicado. */
export async function comprimir(file: File, lado: number, calidad: number): Promise<string> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions).catch(
    () => null,
  );
  let w: number, h: number, fuente: CanvasImageSource;
  if (bitmap) {
    w = bitmap.width;
    h = bitmap.height;
    fuente = bitmap;
  } else {
    const url = URL.createObjectURL(file);
    const img = new Image();
    await new Promise((ok, mal) => {
      img.onload = ok;
      img.onerror = mal;
      img.src = url;
    });
    w = img.naturalWidth;
    h = img.naturalHeight;
    fuente = img;
  }
  const k = Math.min(1, lado / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * k);
  canvas.height = Math.round(h * k);
  canvas.getContext("2d")!.drawImage(fuente, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", calidad);
}

/** Miniatura cuadrada para guardar con el registro. */
export async function miniatura(dataUrl: string, lado = 160): Promise<string> {
  const img = new Image();
  await new Promise((ok, mal) => {
    img.onload = ok;
    img.onerror = mal;
    img.src = dataUrl;
  });
  const s = Math.min(img.naturalWidth, img.naturalHeight);
  const canvas = document.createElement("canvas");
  canvas.width = lado;
  canvas.height = lado;
  canvas
    .getContext("2d")!
    .drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, lado, lado);
  return canvas.toDataURL("image/jpeg", 0.7);
}

export function nuevoId(): string {
  return `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
