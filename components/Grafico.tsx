"use client";

import { BANDA_KG, DIA_CERO, diasEntre, fechaCorta, META_FINAL, METAS, sumarDias, TOTAL_SEMANAS } from "@/lib/plan";

export type PuntoSemana = { domingo: string; prom: number; n: number };

const W = 340;
const H = 230;
const L = 30;
const R = 10;
const T = 12;
const B = 28;

export default function Grafico({
  diarios,
  semanales,
  hoy,
}: {
  diarios: { fecha: string; kg: number }[];
  semanales: PuntoSemana[];
  hoy: string;
}) {
  const diaHoy = diasEntre(DIA_CERO, hoy);
  const ultimoDia = Math.max(TOTAL_SEMANAS * 7, ...diarios.map((d) => diasEntre(DIA_CERO, d.fecha)));
  const primerDia = Math.min(0, ...diarios.map((d) => diasEntre(DIA_CERO, d.fecha)));
  const valores = diarios.map((d) => d.kg);
  const lo = Math.floor(Math.min(META_FINAL - 1, ...valores) - 0.3);
  const hi = Math.ceil(Math.max(METAS[0] + 1, ...valores) + 0.3);

  const x = (dia: number) => L + ((dia - primerDia) / (ultimoDia - primerDia)) * (W - L - R);
  const y = (kg: number) => T + ((hi - kg) / (hi - lo)) * (H - T - B);

  const metaPts = METAS.map((m, w) => ({ dia: w * 7, m }));
  const banda =
    metaPts.map((p) => `${x(p.dia)},${y(p.m + BANDA_KG)}`).join(" ") +
    " " +
    [...metaPts].reverse().map((p) => `${x(p.dia)},${y(p.m - BANDA_KG)}`).join(" ");
  const lineaMeta = metaPts.map((p, i) => `${i ? "L" : "M"}${x(p.dia)},${y(p.m)}`).join(" ");
  const lineaReal = semanales.map((p, i) => `${i ? "L" : "M"}${x(diasEntre(DIA_CERO, p.domingo))},${y(p.prom)}`).join(" ");

  const ticksY: number[] = [];
  for (let v = Math.ceil(lo / 2) * 2; v <= hi; v += 2) ticksY.push(v);

  // Primer día de cada mes dentro del rango
  const ticksX: { dia: number; label: string }[] = [{ dia: 0, label: "oct" }];
  for (let d = 1; d <= ultimoDia; d++) {
    const f = sumarDias(DIA_CERO, d);
    if (f.endsWith("-01") && d > 8) ticksX.push({ dia: d, label: fechaCorta(f).split(" ")[1] });
  }

  return (
    <>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Peso real contra peso meta">
        {ticksY.map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeWidth="1" />
            <text x={L - 6} y={y(v) + 4} textAnchor="end" fontSize="10" fill="var(--muted)">
              {v}
            </text>
          </g>
        ))}
        {ticksX.map((t) => (
          <text key={t.dia} x={x(t.dia)} y={H - 8} textAnchor={t.dia === 0 ? "start" : "middle"} fontSize="10" fill="var(--muted)">
            {t.label}
          </text>
        ))}

        <polygon points={banda} fill="var(--band)" />
        <line x1={L} x2={W - R} y1={y(META_FINAL)} y2={y(META_FINAL)} stroke="var(--muted)" strokeDasharray="4 3" strokeWidth="1" />
        <path d={lineaMeta} fill="none" stroke="var(--accent)" strokeWidth="2" strokeOpacity="0.55" />

        {diaHoy >= primerDia && diaHoy <= ultimoDia && (
          <g>
            <line x1={x(diaHoy)} x2={x(diaHoy)} y1={T} y2={H - B} stroke="var(--muted)" strokeWidth="1" strokeOpacity="0.5" />
            <text x={x(diaHoy) + 3} y={T + 9} fontSize="9" fill="var(--muted)">
              hoy
            </text>
          </g>
        )}

        {diarios.map((d) => (
          <circle key={d.fecha} cx={x(diasEntre(DIA_CERO, d.fecha))} cy={y(d.kg)} r="2" fill="var(--muted)" fillOpacity="0.6">
            <title>{`${fechaCorta(d.fecha)}: ${d.kg.toFixed(1)} kg`}</title>
          </circle>
        ))}

        {semanales.length > 1 && <path d={lineaReal} fill="none" stroke="var(--ink)" strokeWidth="2" />}
        {semanales.map((p) => (
          <circle key={p.domingo} cx={x(diasEntre(DIA_CERO, p.domingo))} cy={y(p.prom)} r="4" fill="var(--ink)" stroke="var(--card)" strokeWidth="1.5">
            <title>{`Semana al ${fechaCorta(p.domingo)}: promedio ${p.prom.toFixed(1)} kg (${p.n} registros)`}</title>
          </circle>
        ))}
      </svg>
      <div className="legend">
        <span>
          <i style={{ width: 16, height: 2, background: "var(--accent)", opacity: 0.6 }} />
          Meta
        </span>
        <span>
          <i style={{ width: 14, height: 10, background: "var(--band)" }} />
          Rango normal ±0,8 kg
        </span>
        <span>
          <i style={{ width: 8, height: 8, borderRadius: 4, background: "var(--ink)" }} />
          Promedio semanal
        </span>
        <span>
          <i style={{ width: 5, height: 5, borderRadius: 3, background: "var(--muted)" }} />
          Pesajes
        </span>
      </div>
    </>
  );
}
