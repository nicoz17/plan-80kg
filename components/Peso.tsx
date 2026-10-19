"use client";

import { useMemo, useState } from "react";
import { BANDA_KG, fechaCorta, fechaLarga, lunesDe, META_FINAL, metaDelDia, METAS, sumarDias } from "@/lib/plan";
import { Estado } from "./api";
import Grafico, { PuntoSemana } from "./Grafico";
import { IcX } from "./Icons";

const kgFmt = (v: number) => v.toFixed(1).replace(".", ",");

export default function Peso({
  hoy,
  estado,
  guardarPeso,
}: {
  hoy: string;
  estado: Estado;
  guardarPeso: (date: string, kg: number | null) => void;
}) {
  const [fecha, setFecha] = useState(hoy);
  const [kg, setKg] = useState("");
  const [cambiarFecha, setCambiarFecha] = useState(false);

  const diarios = useMemo(
    () =>
      Object.entries(estado.weights)
        .map(([f, v]) => ({ fecha: f, kg: v }))
        .sort((a, b) => a.fecha.localeCompare(b.fecha)),
    [estado.weights],
  );

  const semanales: PuntoSemana[] = useMemo(() => {
    const grupos = new Map<string, number[]>();
    for (const d of diarios) {
      const dom = sumarDias(lunesDe(d.fecha), 6);
      if (!grupos.has(dom)) grupos.set(dom, []);
      grupos.get(dom)!.push(d.kg);
    }
    return [...grupos.entries()]
      .map(([domingo, vs]) => ({ domingo, prom: vs.reduce((a, b) => a + b, 0) / vs.length, n: vs.length }))
      .sort((a, b) => a.domingo.localeCompare(b.domingo));
  }, [diarios]);

  const lunesHoy = lunesDe(hoy);
  const estaSemana = diarios.filter((d) => d.fecha >= lunesHoy && d.fecha <= sumarDias(lunesHoy, 6));
  const promSemana = estaSemana.length ? estaSemana.reduce((a, d) => a + d.kg, 0) / estaSemana.length : null;
  const metaSemana = estaSemana.length
    ? estaSemana.reduce((a, d) => a + metaDelDia(d.fecha), 0) / estaSemana.length
    : metaDelDia(hoy);

  const actual = promSemana ?? semanales.at(-1)?.prom ?? diarios.at(-1)?.kg ?? null;
  const bajado = actual !== null ? METAS[0] - actual : 0;
  const faltan = actual !== null ? Math.max(0, actual - META_FINAL) : METAS[0] - META_FINAL;
  const avance = Math.max(0, Math.min(1, bajado / (METAS[0] - META_FINAL)));

  let estadoTexto: { txt: string; warn: boolean } | null = null;
  if (promSemana !== null) {
    const diff = promSemana - metaSemana;
    if (Math.abs(diff) <= BANDA_KG) {
      estadoTexto = {
        txt:
          diff >= 0
            ? `Vas bien. Estás ${kgFmt(diff)} kg sobre la meta, dentro del rango normal.`
            : `Vas bien. Estás ${kgFmt(-diff)} kg bajo la meta.`,
        warn: false,
      };
    } else if (diff > 0) {
      estadoTexto = {
        txt: `Estás ${kgFmt(diff)} kg sobre la meta. Si se repite la próxima semana, saca el arroz de la comida o suma 2.000 pasos diarios. Un ajuste a la vez.`,
        warn: true,
      };
    } else {
      estadoTexto = { txt: `Vas ${kgFmt(-diff)} kg adelantado. No aprietes más: sigue el plan tal cual.`, warn: false };
    }
  }

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    const v = Number(kg.replace(",", "."));
    if (!Number.isFinite(v) || v < 30 || v > 250) return;
    guardarPeso(fecha, v);
    setKg("");
    setFecha(hoy);
    setCambiarFecha(false);
  }

  const yaHay = estado.weights[fecha];

  return (
    <>
      <header className="head">
        <div>
          <h1>Peso</h1>
          <div className="sub">En ayunas, 3 veces por semana</div>
        </div>
      </header>

      <section className="scale" aria-label="Resumen de peso">
        <div className="scale-top">
          <div>
            <div className="kg num">
              {actual !== null ? kgFmt(actual) : "88,0"}
              <small>kg</small>
            </div>
            <div className="cap">{promSemana !== null ? "Promedio de esta semana" : actual !== null ? "Último promedio" : "Peso inicial"}</div>
          </div>
          <div className="scale-side">
            <div>
              <div className="v num">{bajado >= 0 ? "−" : "+"}{kgFmt(Math.abs(bajado))}</div>
              <div className="l">desde 88 kg</div>
            </div>
            <div>
              <div className="v num">{kgFmt(faltan)}</div>
              <div className="l">para llegar a 80</div>
            </div>
          </div>
        </div>
        <div className="journey" aria-label={`${Math.round(avance * 100)}% del camino`}>
          <div className="journey-bar">
            <i style={{ width: `${avance * 100}%` }} />
          </div>
          <div className="journey-ends">
            <span>88</span>
            <span>80</span>
          </div>
        </div>
      </section>

      <section className="card">
        <form onSubmit={guardar}>
          <div className="entry">
            <input
              className="kg-input"
              inputMode="decimal"
              placeholder={yaHay ? kgFmt(yaHay) : "Tu peso"}
              value={kg}
              onChange={(e) => setKg(e.target.value.replace(/[^\d.,]/g, ""))}
              aria-label="Peso en kilos"
            />
            <button className="btn primary" disabled={!kg}>
              {yaHay ? "Reemplazar" : "Guardar"}
            </button>
          </div>
          <div className="entry-date">
            {cambiarFecha ? (
              <>
                <label htmlFor="f">Fecha</label>
                <input id="f" type="date" value={fecha} max={hoy} onChange={(e) => setFecha(e.target.value || hoy)} />
              </>
            ) : (
              <>
                <span>{fecha === hoy ? "Para hoy" : fechaLarga(fecha)}</span>
                <button type="button" className="textlink" onClick={() => setCambiarFecha(true)}>
                  Otro día
                </button>
              </>
            )}
          </div>
        </form>
        {estadoTexto ? (
          <div className={`status ${estadoTexto.warn ? "warn" : ""}`}>{estadoTexto.txt}</div>
        ) : (
          <p className="muted small" style={{ margin: "12px 0 0" }}>
            Con tu primer peso de la semana te digo si vas bien contra la meta ({kgFmt(metaSemana)} kg).
          </p>
        )}
      </section>

      <section className="card">
        <div className="card-h">
          <h3>Tu curva</h3>
          <span className="aside">meta vs. real</span>
        </div>
        <Grafico diarios={diarios} semanales={semanales} hoy={hoy} />
        <p className="muted small" style={{ margin: "10px 0 0" }}>
          El peso de un día varía 1 a 2 kg por agua. Fíjate en el promedio semanal, no en el día.
        </p>
      </section>

      {diarios.length > 0 && (
        <section className="card">
          <div className="card-h">
            <h3>Registros</h3>
          </div>
          <ul className="rows">
            {[...diarios]
              .reverse()
              .slice(0, 21)
              .map((d) => (
                <li key={d.fecha}>
                  <span>{fechaLarga(d.fecha)}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span className="v">{kgFmt(d.kg)}</span>
                    <button
                      className="x"
                      aria-label={`Borrar el peso del ${fechaCorta(d.fecha)}`}
                      onClick={() => {
                        if (confirm(`¿Borrar el peso del ${fechaCorta(d.fecha)}?`)) guardarPeso(d.fecha, null);
                      }}
                    >
                      <IcX />
                    </button>
                  </span>
                </li>
              ))}
          </ul>
        </section>
      )}
    </>
  );
}
