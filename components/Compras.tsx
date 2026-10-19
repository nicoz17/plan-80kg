"use client";

import { COMPRAS, fechaCorta, MEAL_PREP } from "@/lib/plan";
import { Estado } from "./api";
import { Check } from "./Check";

export default function Compras({
  semana,
  estado,
  comprar,
}: {
  fecha: string;
  semana: string;
  estado: Estado;
  comprar: (id: string, on: boolean) => void;
}) {
  const categorias = [...new Set(COMPRAS.map((c) => c.cat))];
  const listos = COMPRAS.filter((c) => estado.shopping.includes(c.id)).length;

  return (
    <>
      <header className="top">
        <div>
          <h1>Compras</h1>
          <div className="sub">Semana del {fechaCorta(semana)} · se reinicia cada lunes</div>
        </div>
      </header>

      <section className="card">
        <div className="progreso" style={{ gridTemplateColumns: "1fr", marginTop: 0 }}>
          <div className="prog-item">
            <div className="pv">
              {listos} <span className="pl">de {COMPRAS.length} en el carro</span>
            </div>
            <div className="bar">
              <i style={{ width: `${(listos / COMPRAS.length) * 100}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        {categorias.map((cat) => (
          <div key={cat}>
            <div className="cat-title">{cat}</div>
            <ul className="check-list">
              {COMPRAS.filter((c) => c.cat === cat).map((c) => {
                const on = estado.shopping.includes(c.id);
                return (
                  <Check key={c.id} on={on} onToggle={() => comprar(c.id, !on)}>
                    <div className="ci-head">
                      <span className="ci-title">{c.producto}</span>
                      <span className="ci-side">{c.cantidad}</span>
                    </div>
                  </Check>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      <section className="card">
        <div className="card-label">Meal prep del domingo · ~90 min</div>
        <ol style={{ margin: "4px 0 0", paddingLeft: 20, fontSize: 15 }}>
          {MEAL_PREP.map((p) => (
            <li key={p} style={{ margin: "6px 0" }}>
              {p}
            </li>
          ))}
        </ol>
        <div className="note">El lunes deja en la oficina: yogures proteicos, whey, shaker y almendras en porciones de 20 g.</div>
      </section>
    </>
  );
}
