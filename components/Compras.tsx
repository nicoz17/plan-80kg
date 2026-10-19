"use client";

import { COMPRAS, fechaCorta } from "@/lib/plan";
import { Estado } from "./api";
import { Check } from "./Check";

export default function Compras({
  semana,
  estado,
  comprar,
}: {
  semana: string;
  estado: Estado;
  comprar: (id: string, on: boolean) => void;
}) {
  const categorias = [...new Set(COMPRAS.map((c) => c.cat))];
  const listos = COMPRAS.filter((c) => estado.shopping.includes(c.id)).length;
  const pct = (listos / COMPRAS.length) * 100;

  return (
    <>
      <header className="head">
        <div>
          <h1>Compras</h1>
          <div className="sub">Semana del {fechaCorta(semana)}. Se reinicia cada lunes.</div>
        </div>
      </header>

      <section className="card">
        <div className="fuel-top" style={{ marginBottom: 10 }}>
          <div className="fuel-left">
            <div className="big num">
              {listos}
              <span style={{ fontSize: 28, color: "var(--muted)" }}> / {COMPRAS.length}</span>
            </div>
            <div className="lbl">{listos === COMPRAS.length ? "Todo en el carro" : "en el carro"}</div>
          </div>
        </div>
        <div className="meter prot">
          <i style={{ width: `${pct}%` }} />
        </div>
      </section>

      <section className="card">
        {categorias.map((cat) => (
          <div key={cat}>
            <div className="shop-cat">{cat}</div>
            <ul className="check-list">
              {COMPRAS.filter((c) => c.cat === cat).map((c) => {
                const on = estado.shopping.includes(c.id);
                return (
                  <Check key={c.id} on={on} onToggle={() => comprar(c.id, !on)}>
                    <span className="ci-title">{c.producto}</span>
                    <span className="ci-side">{c.cantidad}</span>
                  </Check>
                );
              })}
            </ul>
          </div>
        ))}
      </section>
    </>
  );
}
