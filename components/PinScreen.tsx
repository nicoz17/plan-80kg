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
      setError(err instanceof ErrorApi ? err.message : "No se pudo conectar");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="pin-screen">
      <form className="pin-card" onSubmit={entrar}>
        <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
          <rect width="64" height="64" rx="14" fill="var(--accent)" />
          <path d="M12 20 L28 34 L38 28 L52 44" fill="none" stroke="var(--bg)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h1>Plan 80</h1>
        <p>88 → 80 kg · 18 semanas</p>
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
        <button className="btn primary" disabled={!pin || enviando}>
          {enviando ? "Entrando…" : "Entrar"}
        </button>
        {error && <div className="error">{error}</div>}
      </form>
    </main>
  );
}
