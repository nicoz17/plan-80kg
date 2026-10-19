"use client";

import { useState } from "react";
import {
  BARRAS_A,
  BARRAS_B,
  CALENTAMIENTO_BARRAS,
  CALENTAMIENTO_TROTE,
  diaSemana,
  fechaCorta,
  KCAL_META,
  LUGAR,
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
import { Estado, Registro, Slot } from "./api";
import type { AbrirFoto } from "./App";
import { IcCam, IcCheck, IcFlecha, IcPlato, IcX } from "./Icons";

const INICIALES = ["L", "M", "M", "J", "V", "S", "D"];
const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

const fmt = (n: number) => Math.round(n).toLocaleString("es-CL");

export function totalesDelDia(fecha: string, estado: Estado) {
  const plan = MENU[diaSemana(fecha)];
  let kcal = 0;
  let prot = 0;
  for (const c of plan) {
    const regs = estado.log.filter((r) => r.slot === c.id);
    if (regs.length) {
      kcal += regs.reduce((a, r) => a + r.kcal, 0);
      prot += regs.reduce((a, r) => a + r.prot, 0);
    } else if (estado.done.includes(c.id)) {
      kcal += c.kcal;
      prot += c.prot;
    }
  }
  for (const r of estado.log.filter((r) => r.slot === "extra")) {
    kcal += r.kcal;
    prot += r.prot;
  }
  return { kcal, prot };
}

export default function Hoy({
  fecha,
  hoy,
  setFecha,
  estado,
  cargando,
  marcar,
  abrirFoto,
  borrarRegistro,
}: {
  fecha: string;
  hoy: string;
  setFecha: (f: string) => void;
  estado: Estado;
  cargando: boolean;
  marcar: (id: string, on: boolean) => void;
  abrirFoto: AbrirFoto;
  borrarRegistro: (id: string) => void;
}) {
  const semana = semanaDe(fecha);
  const s = Math.min(Math.max(semana, 1), TOTAL_SEMANAS);
  const [, mes, dia] = fecha.split("-").map(Number);
  const esHoy = fecha === hoy;
  const lunes = lunesDe(fecha);
  const dias = Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));

  return (
    <>
      <header className="head">
        <div>
          <h1>{esHoy ? "Hoy" : DIAS[diaSemana(fecha)]}</h1>
          <div className="sub">
            {esHoy ? `${DIAS[diaSemana(fecha)]} ${dia} de ${MESES[mes - 1]}` : `${dia} de ${MESES[mes - 1]}`}
          </div>
        </div>
        <div style={{ display: "grid", gap: 6, justifyItems: "end" }}>
          {semana === 0 ? (
            <span className="pill soft">Partes el {fechaCorta("2026-10-19")}</span>
          ) : semana > TOTAL_SEMANAS ? (
            <span className="pill soft">Mantención</span>
          ) : (
            <span className="pill soft">
              Semana {semana} de {TOTAL_SEMANAS}
            </span>
          )}
          {!esHoy && (
            <button className="textlink" onClick={() => setFecha(hoy)}>
              Volver a hoy
            </button>
          )}
        </div>
      </header>

      <nav className="week" aria-label="Días de la semana">
        {dias.map((d, i) => {
          const hecho = (estado.doneWeek[d] ?? []).includes("entreno");
          return (
            <button
              key={d}
              className={`wd ${hecho ? "done" : ""} ${d === fecha ? "sel" : ""} ${d === hoy ? "today" : ""}`}
              onClick={() => setFecha(d)}
              aria-label={`${DIAS[diaSemana(d)]} ${Number(d.slice(8))}${hecho ? ", entrenado" : ""}`}
              aria-pressed={d === fecha}
            >
              {INICIALES[i]}
              <span className="n">{Number(d.slice(8))}</span>
            </button>
          );
        })}
      </nav>

      <Sesion fecha={fecha} semana={s} hecho={estado.done.includes("entreno")} cargando={cargando} marcar={marcar} />

      <Combustible
        fecha={fecha}
        estado={estado}
        cargando={cargando}
        marcar={marcar}
        abrirFoto={abrirFoto}
        borrarRegistro={borrarRegistro}
      />

      <div className="muted small" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 14 }}>
        <button className="x" aria-label="Día anterior" onClick={() => setFecha(sumarDias(fecha, -1))}>
          <IcFlecha dir="l" />
        </button>
        <span>
          Meta de la semana:{" "}
          {semana >= 1 && semana <= TOTAL_SEMANAS ? `${METAS[s].toFixed(1).replace(".", ",")} kg` : "88,0 kg"}
        </span>
        <button className="x" aria-label="Día siguiente" onClick={() => setFecha(sumarDias(fecha, 1))}>
          <IcFlecha dir="r" />
        </button>
      </div>
    </>
  );
}

function Sesion({
  fecha,
  semana,
  hecho,
  cargando,
  marcar,
}: {
  fecha: string;
  semana: number;
  hecho: boolean;
  cargando: boolean;
  marcar: (id: string, on: boolean) => void;
}) {
  const [abierto, setAbierto] = useState<number | null>(null);
  const sesion = sesionDelDia(fecha);
  const ejercicios = sesion.tipo === "barrasA" ? BARRAS_A : sesion.tipo === "barrasB" ? BARRAS_B : null;
  const [titulo, que] = sesion.titulo.split(" · ");
  const rest = sesion.tipo === "descanso";

  return (
    <section className={`session ${rest ? "rest" : ""}`} aria-label="Entrenamiento del día">
      <div className="kicker">{ejercicios ? "Barras en la plaza" : sesion.tipo === "trote" ? "Cardio" : "Recuperación"}</div>
      <h2>{titulo}</h2>
      {que && <div className="what">{que[0].toUpperCase() + que.slice(1)}</div>}

      <div className="facts">
        <span className="fact">{sesion.duracion}</span>
        <span className="fact">Esfuerzo {sesion.esfuerzo.split(" (")[0].split(", ")[0]}</span>
        {ejercicios && <span className="fact">{LUGAR.split(" · ")[0]}</span>}
      </div>

      {sesion.detalle && !ejercicios && (
        <>
          <div className="run-big">{sesion.detalle}</div>
          <div className="run-help">
            {sesion.detalle.includes("×(")
              ? "Repeticiones × (minutos trotando / minutos caminando o suave)."
              : rest
                ? ""
                : "A un ritmo en que puedas conversar."}
            {sesion.nota ? ` ${sesion.nota}` : ""}
          </div>
        </>
      )}

      {ejercicios && (
        <>
          <ul className="ex-list">
            {ejercicios.map((e, i) => {
              const [reps, porLado] = e.series.split(" por ");
              return (
                <li className="ex" key={e.nombre}>
                  <button onClick={() => setAbierto(abierto === i ? null : i)} aria-expanded={abierto === i}>
                    <span className="ex-name">{e.nombre}</span>
                    <span className="ex-sets">
                      {reps}
                      <small>{porLado ? `por ${porLado}` : `descanso ${e.descanso}`}</small>
                    </span>
                    <span className="ex-where">{e.donde}</span>
                  </button>
                  {abierto === i && (
                    <div className="ex-more">
                      <div>
                        <b>Descanso:</b> {e.descanso}
                      </div>
                      <div>
                        <b>Si no llegas:</b> {e.alternativa}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="coach">{progresionBarras(semana)}</div>
        </>
      )}

      {!rest && (
        <details className="warmup">
          <summary>Calentamiento</summary>
          <ol>
            {(ejercicios ? CALENTAMIENTO_BARRAS : CALENTAMIENTO_TROTE).map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ol>
        </details>
      )}

      <button className={`done-btn ${hecho ? "is-done" : ""}`} onClick={() => marcar("entreno", !hecho)} disabled={cargando}>
        {hecho ? (
          <>
            <IcCheck className="ic" /> Hecho
          </>
        ) : (
          "Marcar como hecho"
        )}
      </button>
      {!hecho && !rest && <div className="hint">¿Poco tiempo? Haz 15 minutos. Nunca cero.</div>}
    </section>
  );
}

function Combustible({
  fecha,
  estado,
  cargando,
  marcar,
  abrirFoto,
  borrarRegistro,
}: {
  fecha: string;
  estado: Estado;
  cargando: boolean;
  marcar: (id: string, on: boolean) => void;
  abrirFoto: AbrirFoto;
  borrarRegistro: (id: string) => void;
}) {
  const [abierto, setAbierto] = useState<string | null>(null);
  const comidas = MENU[diaSemana(fecha)];
  const { kcal, prot } = totalesDelDia(fecha, estado);
  const quedan = KCAL_META - kcal;
  const extras = estado.log.filter((r) => r.slot === "extra");

  return (
    <section className="card" aria-label="Comida del día">
      <div className="fuel-top">
        <div className={`fuel-left ${quedan < 0 ? "over" : ""}`}>
          <div className="big num">{fmt(Math.abs(quedan))}</div>
          <div className="lbl">{quedan >= 0 ? "kcal disponibles" : "kcal sobre la meta"}</div>
        </div>
        <button className="btn primary" style={{ width: "auto", padding: "0 16px", minHeight: 46 }} onClick={() => abrirFoto()}>
          <IcCam /> Foto
        </button>
      </div>

      <div className="meters">
        <div>
          <div className="meter-row">
            <span>Calorías</span>
            <span>
              <b>{fmt(kcal)}</b> de {fmt(KCAL_META)}
            </span>
          </div>
          <div className={`meter ${kcal > KCAL_META ? "over" : ""}`}>
            <i style={{ width: `${Math.min(100, (kcal / KCAL_META) * 100)}%` }} />
          </div>
        </div>
        <div>
          <div className="meter-row">
            <span>Proteína</span>
            <span>
              <b>{fmt(prot)}</b> de {PROT_META} g
            </span>
          </div>
          <div className="meter prot">
            <i style={{ width: `${Math.min(100, (prot / PROT_META) * 100)}%` }} />
          </div>
        </div>
      </div>

      <ul className="meals">
        {comidas.map((c) => {
          const regs = estado.log.filter((r) => r.slot === c.id);
          const marcado = estado.done.includes(c.id);
          return (
            <li key={c.id} className={`meal ${marcado || regs.length ? "is-done" : ""}`}>
              <div className="meal-time">{c.hora.split("–")[0]}</div>
              <div>
                <div className="meal-title">
                  <span>{c.nombre}</span>
                  {!regs.length && <span className="k">{c.kcal} kcal</span>}
                </div>
                {!regs.length && (
                  <button className="meal-text-btn" onClick={() => setAbierto(abierto === c.id ? null : c.id)}>
                    <span className={`meal-text ${abierto === c.id ? "open" : ""}`}>{c.texto}</span>
                  </button>
                )}
                {regs.map((r) => (
                  <RegistroFila key={r.id} r={r} borrar={borrarRegistro} />
                ))}
              </div>
              <div className="meal-actions">
                {!regs.length && !marcado && (
                  <button
                    className="round cam"
                    onClick={() => abrirFoto(c.id as Slot)}
                    aria-label={`Fotografiar ${c.nombre.toLowerCase()}`}
                  >
                    <IcCam />
                  </button>
                )}
                {!regs.length && (
                  <button
                    className={`round ${marcado ? "on" : ""}`}
                    onClick={() => marcar(c.id, !marcado)}
                    disabled={cargando}
                    aria-label={`${c.nombre}: ${marcado ? "desmarcar" : "comí lo del plan"}`}
                    aria-pressed={marcado}
                  >
                    <IcCheck />
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {extras.length > 0 && (
        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12 }}>
          <div className="meal-title">Fuera del plan</div>
          {extras.map((r) => (
            <RegistroFila key={r.id} r={r} borrar={borrarRegistro} />
          ))}
        </div>
      )}

      <button className="add-extra" onClick={() => abrirFoto("extra", false)}>
        Anotar algo fuera del plan
      </button>
      <p className="muted small" style={{ margin: "10px 2px 0" }}>
        Check si comiste lo del plan. Foto si comiste otra cosa: se reemplaza por lo que fotografíes.
      </p>
    </section>
  );
}

function RegistroFila({ r, borrar }: { r: Registro; borrar: (id: string) => void }) {
  return (
    <div className="logged">
      {r.foto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={r.foto} alt="" />
      ) : (
        <div className="noimg">
          <IcPlato />
        </div>
      )}
      <div>
        <div className="logged-name">{r.nombre}</div>
        <div className="logged-macros">
          <b>{fmt(r.kcal)}</b> kcal, <b>{r.prot}</b> g proteína
        </div>
      </div>
      <button
        className="x"
        aria-label={`Borrar ${r.nombre}`}
        onClick={() => {
          if (confirm(`¿Borrar "${r.nombre}"?`)) borrar(r.id);
        }}
      >
        <IcX />
      </button>
    </div>
  );
}
