"use client";

import { COMER_FUERA, faseDe, MEAL_PREP, progresionBarras, semanaDe, TOTAL_SEMANAS } from "@/lib/plan";

export default function Guia({ fecha }: { fecha: string }) {
  const semana = Math.min(Math.max(semanaDe(fecha), 1), TOTAL_SEMANAS);
  const fase = faseDe(semana);

  return (
    <>
      <header className="head">
        <div>
          <h1>Guía</h1>
          <div className="sub">Lo que no cambia en las 18 semanas</div>
        </div>
      </header>

      <section className="card">
        <div className="card-h">
          <h3>Las 5 reglas</h3>
        </div>
        <ol className="rules">
          <li>Proteína en cada comida: 170 g al día.</li>
          <li>Máximo un pan al día.</li>
          <li>Cero líquidos con calorías de lunes a viernes.</li>
          <li>La mitad del plato es verdura.</li>
          <li>Máximo 2 a 3 tragos a la semana, en una sola salida.</li>
        </ol>
      </section>

      <section className="card">
        <div className="card-h">
          <h3>Esta etapa</h3>
          <span className="aside">
            Fase {fase.n}: {fase.nombre.toLowerCase()}
          </span>
        </div>
        <p style={{ margin: 0 }}>{progresionBarras(semana)}</p>
      </section>

      <section className="card">
        <div className="card-h">
          <h3>Comer fuera</h3>
          <span className="aside">kcal aprox.</span>
        </div>
        {COMER_FUERA.map((f) => (
          <div className="out" key={f.lugar}>
            <div className="out-h">
              <span>{f.lugar}</span>
              <span className="num">{f.kcal}</span>
            </div>
            <p>{f.pide}</p>
            <p className="no">Evita: {f.evita}</p>
          </div>
        ))}
      </section>

      <section className="card">
        <div className="card-h">
          <h3>Meal prep del domingo</h3>
          <span className="aside">90 min</span>
        </div>
        <ol className="steps">
          {MEAL_PREP.map((p) => {
            const [t, ...resto] = p.split(" · ");
            return (
              <li key={p}>
                <span className="t">{t}</span>
                <span>{resto.join(" · ")}</span>
              </li>
            );
          })}
        </ol>
        <p className="muted small" style={{ margin: "8px 0 0" }}>
          El lunes deja en la oficina los yogures proteicos, la whey, el shaker y las almendras en porciones de 20 g.
        </p>
      </section>
    </>
  );
}
