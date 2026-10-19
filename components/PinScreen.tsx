"use client";

import { useState } from "react";
import { enviar, ErrorApi } from "./api";

export default function PinScreen({ onOk }: { onOk: (pin: string) => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    if (!pin) return;
    setEnviando(true);
    setError(null);
    try {
      await enviar(pin, { action: "check" });
      onOk(pin);
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : "Sin conexión. Revisa tu internet.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="pin-screen">
      <form className="pin-card" onSubmit={entrar}>
        <h1>
          88
          <br />
          a 80
        </h1>
        <p>18 semanas. Barras, trote y comida ordenada.</p>
        <input
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          placeholder="PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          autoFocus
          aria-label="PIN"
        />
        <button className="btn" disabled={!pin || enviando}>
          {enviando ? "Entrando…" : "Entrar"}
        </button>
        {error && (
          <div className="pin-err" role="alert">
            {error}
          </div>
        )}
      </form>
    </main>
  );
}
