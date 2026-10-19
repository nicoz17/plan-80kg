export type Estado = {
  weights: Record<string, number>;
  done: string[];
  doneWeek: Record<string, string[]>;
  shopping: string[];
  memoria: boolean;
};

export class ErrorApi extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

const PIN_KEY = "plan80-pin";

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

async function llamar<T>(pin: string, init: RequestInit & { query?: string }): Promise<T> {
  const res = await fetch(`/api/data${init.query ?? ""}`, {
    ...init,
    headers: { "content-type": "application/json", "x-pin": pin },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ErrorApi(data.error ?? "Error de conexión", res.status);
  return data as T;
}

export function cargar(pin: string, date: string, week: string) {
  return llamar<Estado>(pin, { method: "GET", query: `?date=${date}&week=${week}` });
}

export function enviar(pin: string, body: Record<string, unknown>) {
  return llamar<{ ok: boolean; memoria?: boolean }>(pin, { method: "POST", body: JSON.stringify(body) });
}
