"use client";

import { useMemo, useState } from "react";
import { BANDA_KG, fechaCorta, fechaLarga, lunesDe, metaDelDia, METAS, sumarDias } from "@/lib/plan";
import { Estado } from "./api";
import Grafico, { PuntoSemana } from "./Grafico";

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

  // Semana actual: promedio vs meta de esos mismos días
  const lunesHoy = lunesDe(hoy);
  const estaSemana = diarios.filter((d) => d.fecha >= lunesHoy && d.fecha <= sumarDias(lunesHoy, 6));
  const promSemana = estaSemana.length ? estaSemana.reduce((a, d) => a + d.kg, 0) / estaSemana.length : null;
  const metaSemana = estaSemana.length
    ? estaSemana.reduce((a, d) => a + metaDelDia(d.fecha), 0) / estaSemana.length
    : metaDelDia(hoy);
  const ultimo = diarios.at(-1);
  const referencia = semanales.at(-1)?.prom ?? ultimo?.kg;
  const bajado = referencia !== undefined ? METAS[0] - referencia : null;

  let estadoTexto: { txt: string; warn: boolean } | null = null;
  if (promSemana !== null) {
    const diff = promSemana - metaSemana;
    if (Math.abs(diff) <= BANDA_KG) {
      estadoTexto = {
        txt: `Vas bien: tu promedio está ${diff >= 0 ? kgFmt(diff) + " kg sobre" : kgFmt(-diff) + " kg bajo"} la meta, dentro del rango normal.`,
        warn: false,
      };
    } else if (diff > 0) {
      estadoTexto = {
        txt: `Estás ${kgFmt(diff)} kg sobre la meta. Si se repite la próxima semana: saca el arroz de la comida o suma 2.000 pasos diarios. Un ajuste a la vez.`,
        warn: true,
      };
    } else {
      estadoTexto = { txt: `Vas ${kgFmt(-diff)} kg adelantado. No aprietes más: mantén el plan como está.`, warn: false };
    }
  }

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    const v = Number(kg.replace(",", "."));
    if (!Number.isFinite(v) || v < 30 || v > 250) return;
    guardarPeso(fecha, v);
    setKg("");
  }

  const yaHay = estado.weights[fecha];

  return (
    <>
      <header className="top">
        <div>
          <h1>Peso</h1>
          <div className="sub">Pésate 3 veces por semana, en ayunas</div>
        </div>
      </header>

      <section className="card">
        <form onSubmit={guardar}>
          <div className="peso-form">
            <div className="field">
              <label htmlFor="fecha">Fecha</label>
              <input id="fecha" type="date" value={fecha} max={hoy} onChange={(e) => setFecha(e.target.value || hoy)} />
            </div>
            <div className="field">
              <label htmlFor="kg">Peso (kg)</label>
              <input
                id="kg"
                type="text"
                inputMode="decimal"
                placeholder={yaHay ? kgFmt(yaHay) : "87,4"}
                value={kg}
                onChange={(e) => setKg(e.target.value)}
              />
            </div>
          </div>
          <button className="btn primary" disabled={!kg}>
            {yaHay ? "Reemplazar peso de ese día" : "Guardar peso"}
          </button>
        </form>
      </section>

      <section className="card">
        <div className="stats">
          <div className="stat">
            <div className="sv">{ultimo ? kgFmt(ultimo.kg) : "—"}</div>
            <div className="sl">Último{ultimo ? ` · ${fechaCorta(ultimo.fecha)}` : ""}</div>
          </div>
          <div className="stat">
            <div className="sv">{promSemana !== null ? kgFmt(promSemana) : "—"}</div>
            <div className="sl">Promedio semana · meta {kgFmt(metaSemana)}</div>
          </div>
          <div className="stat">
            <div className="sv">{bajado !== null ? (bajado >= 0 ? "−" : "+") + kgFmt(Math.abs(bajado)) : "—"}</div>
            <div className="sl">Desde 88 kg</div>
          </div>
        </div>
        {estadoTexto ? (
          <div className={`estado ${estadoTexto.warn ? "warn" : ""}`}>{estadoTexto.txt}</div>
        ) : (
          <div className="note">Registra tu primer peso de la semana para ver cómo vas contra la meta.</div>
        )}
      </section>

      <section className="card">
        <div className="card-label">Tu peso contra la meta</div>
        <Grafico diarios={diarios} semanales={semanales} hoy={hoy} />
        <div className="note">El peso diario varía hasta 1–2 kg por agua. Mira el promedio semanal (punto negro), no el día.</div>
      </section>

      {diarios.length > 0 && (
        <section className="card">
          <div className="card-label">Registros</div>
          <ul className="registros">
            {[...diarios]
              .reverse()
              .slice(0, 21)
              .map((d) => (
                <li key={d.fecha}>
                  <span>{fechaLarga(d.fecha)}</span>
                  <span>
                    <b>{kgFmt(d.kg)} kg</b>
                    <button
                      className="borrar"
                      aria-label={`Borrar ${fechaCorta(d.fecha)}`}
                      onClick={() => {
                        if (confirm(`¿Borrar el peso del ${fechaCorta(d.fecha)}?`)) guardarPeso(d.fecha, null);
                      }}
                    >
                      Borrar
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
