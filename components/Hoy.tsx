"use client";

import {
  BARRAS_A,
  BARRAS_B,
  CALENTAMIENTO_BARRAS,
  CALENTAMIENTO_TROTE,
  COMER_FUERA,
  diaSemana,
  faseDe,
  fechaCorta,
  fechaLarga,
  KCAL_META,
  lunesDe,
  MENU,
  METAS,
  progresionBarras,
  PROT_META,
  semanaDe,
  sesionDelDia,
  sumarDias,
  TOTAL_SEMANAS,
} from "@/lib/plan";
import { Estado } from "./api";
import { Check } from "./Check";

const INICIALES = ["L", "M", "M", "J", "V", "S", "D"];

export default function Hoy({
  fecha,
  hoy,
  setFecha,
  estado,
  cargando,
  marcar,
}: {
  fecha: string;
  hoy: string;
  setFecha: (f: string) => void;
  estado: Estado;
  cargando: boolean;
  marcar: (id: string, on: boolean) => void;
}) {
  const semana = semanaDe(fecha);
  const s = Math.min(semana, TOTAL_SEMANAS);
  const fase = faseDe(Math.max(s, 1));
  const sesion = sesionDelDia(fecha);
  const comidas = MENU[diaSemana(fecha)];
  const hecho = estado.done.includes("entreno");
  const esHoy = fecha === hoy;

  const kcal = comidas.filter((c) => estado.done.includes(c.id)).reduce((a, c) => a + c.kcal, 0);
  const prot = comidas.filter((c) => estado.done.includes(c.id)).reduce((a, c) => a + c.prot, 0);
  const kcalPlan = comidas.reduce((a, c) => a + c.kcal, 0);

  const lunes = lunesDe(fecha);
  const dias = Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));
  const entrenados = dias.filter((d) => (estado.doneWeek[d] ?? []).includes("entreno")).length;

  const ejercicios = sesion.tipo === "barrasA" ? BARRAS_A : sesion.tipo === "barrasB" ? BARRAS_B : null;

  return (
    <>
      <header className="top">
        <div>
          <h1>{esHoy ? "Hoy" : fechaLarga(fecha).split(" ")[0]}</h1>
          <div className="sub">{fechaLarga(fecha)}</div>
        </div>
        <div className="nav-dias">
          <button className="icon-btn" aria-label="Día anterior" onClick={() => setFecha(sumarDias(fecha, -1))}>
            ‹
          </button>
          <button className="icon-btn" aria-label="Día siguiente" onClick={() => setFecha(sumarDias(fecha, 1))}>
            ›
          </button>
        </div>
      </header>

      <div className="chips">
        {semana === 0 ? (
          <span className="chip strong">Empiezas mañana · semana 1 el {fechaCorta("2026-10-19")}</span>
        ) : semana > TOTAL_SEMANAS ? (
          <span className="chip strong">Plan terminado · mantención</span>
        ) : (
          <>
            <span className="chip strong">
              Semana {semana} de {TOTAL_SEMANAS}
            </span>
            <span className="chip">
              Fase {fase.n} · {fase.nombre}
            </span>
            <span className="chip">Meta semana: {METAS[s].toFixed(1).replace(".", ",")} kg</span>
          </>
        )}
        {!esHoy && (
          <button className="link-hoy" onClick={() => setFecha(hoy)}>
            Volver a hoy
          </button>
        )}
      </div>

      {/* ---------- Entrenamiento ---------- */}
      <section className="card">
        <div className="card-label">Entrenamiento</div>
        <h2>{sesion.titulo}</h2>
        <div className="meta-line">
          {sesion.duracion} · esfuerzo {sesion.esfuerzo}
        </div>

        {sesion.detalle && <div className="big-detail">{sesion.detalle}</div>}
        {sesion.nota && <div className="note">{sesion.nota}</div>}
        {sesion.tipo === "trote" && sesion.detalle?.includes("×(") && (
          <div className="note">Formato: 6×(3 / 1) = 6 veces 3 min trotando + 1 min caminando o suave.</div>
        )}

        {ejercicios && (
          <>
            <ul className="ejercicios">
              {ejercicios.map((e) => (
                <li key={e.nombre}>
                  <span className="ej-nombre">{e.nombre}</span>
                  <span className="ej-series">
                    <b>{e.series}</b> · descanso {e.descanso}
                  </span>
                  <span className="ej-alt">Si no llegas: {e.alternativa}</span>
                </li>
              ))}
            </ul>
            <div className="note note-box">{progresionBarras(Math.max(s, 1))}</div>
          </>
        )}

        {sesion.tipo !== "descanso" && (
          <details>
            <summary>Calentamiento</summary>
            <ol>
              {(ejercicios ? CALENTAMIENTO_BARRAS : CALENTAMIENTO_TROTE).map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ol>
          </details>
        )}

        <button className={`btn ${hecho ? "done" : "primary"}`} onClick={() => marcar("entreno", !hecho)} disabled={cargando}>
          {hecho ? "✓ Hecho · toca para desmarcar" : "Marcar como hecho"}
        </button>
        {!hecho && <div className="note">¿Poco tiempo? Haz 15 min. Nunca cero.</div>}

        <div className="semana-dots" aria-label={`${entrenados} de 7 días entrenados esta semana`}>
          {dias.map((d, i) => (
            <button
              key={d}
              className={`dot-dia ${(estado.doneWeek[d] ?? []).includes("entreno") ? "hecho" : ""} ${d === fecha ? "hoy" : ""}`}
              onClick={() => setFecha(d)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              {INICIALES[i]}
              <span />
            </button>
          ))}
        </div>
      </section>

      {/* ---------- Comidas ---------- */}
      <section className="card">
        <div className="card-label">Comidas</div>
        <div className="progreso">
          <div className="prog-item">
            <div className="pv">
              {kcal.toLocaleString("es-CL")} <span className="pl">/ {KCAL_META.toLocaleString("es-CL")} kcal</span>
            </div>
            <div className="bar">
              <i style={{ width: `${Math.min(100, (kcal / KCAL_META) * 100)}%` }} />
            </div>
          </div>
          <div className="prog-item">
            <div className="pv">
              {prot} <span className="pl">/ {PROT_META} g proteína</span>
            </div>
            <div className="bar">
              <i style={{ width: `${Math.min(100, (prot / PROT_META) * 100)}%` }} />
            </div>
          </div>
        </div>
        <div className="note" style={{ marginTop: 4 }}>
          El menú suma ~{kcalPlan.toLocaleString("es-CL")} kcal; el resto es margen para aceite, salsas o una fruta extra.
        </div>

        <ul className="check-list" style={{ marginTop: 8 }}>
          {comidas.map((c) => {
            const on = estado.done.includes(c.id);
            return (
              <Check key={c.id} on={on} onToggle={() => marcar(c.id, !on)} disabled={cargando}>
                <div className="ci-head">
                  <span className="ci-title">{c.nombre}</span>
                  <span className="ci-side">
                    {c.hora} · {c.kcal} kcal · {c.prot} g
                  </span>
                </div>
                <div className="ci-text">{c.texto}</div>
              </Check>
            );
          })}
        </ul>
      </section>

      <section className="card">
        <div className="card-label">Las 5 reglas</div>
        <ol style={{ margin: "4px 0 0", paddingLeft: 20, fontSize: 15 }}>
          <li>Proteína en cada comida (170 g al día).</li>
          <li>Máximo 1 pan al día.</li>
          <li>Cero líquidos con calorías de lunes a viernes.</li>
          <li>La mitad del plato es verdura.</li>
          <li>Alcohol: máximo 2–3 tragos a la semana, en una sola ocasión.</li>
        </ol>
        <details>
          <summary>Qué pedir si comes fuera</summary>
          <div className="tabla-fuera">
            {COMER_FUERA.map((f) => (
              <div className="fuera-item" key={f.lugar}>
                <b>
                  {f.lugar} <small>{f.kcal} kcal</small>
                </b>
                <div className="si">Pide: {f.pide}</div>
                <div className="no">Evita: {f.evita}</div>
              </div>
            ))}
          </div>
        </details>
      </section>
    </>
  );
}
