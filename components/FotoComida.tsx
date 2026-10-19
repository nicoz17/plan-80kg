"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { diaSemana, MENU } from "@/lib/plan";
import { analizar, Analisis, comprimir, ErrorApi, miniatura, nuevoId, Registro, Slot } from "./api";
import { IcX } from "./Icons";
import Selector, { Plato, resumenPlato } from "./Selector";
import { Alimento, ALIMENTOS } from "@/lib/alimentos";

const SLOTS: { id: Slot; nombre: string }[] = [
  { id: "desayuno", nombre: "Desayuno" },
  { id: "almuerzo", nombre: "Almuerzo" },
  { id: "colacion", nombre: "Colación" },
  { id: "comida", nombre: "Comida u once" },
  { id: "extra", nombre: "Fuera del plan" },
];

const PORCIONES = [0.5, 0.75, 1, 1.25, 1.5];
const PORCION_TXT: Record<number, string> = { 0.5: "½", 0.75: "¾", 1: "1", 1.25: "1¼", 1.5: "1½" };

type Fase = "preparando" | "analizando" | "resultado" | "manual";

export default function FotoComida({
  pin,
  fecha,
  slotInicial,
  file,
  fotosOn,
  onCerrar,
  onGuardar,
  onError,
  propios,
  onCrearAlimento,
  onBorrarAlimento,
}: {
  pin: string;
  fecha: string;
  slotInicial: Slot;
  file: File | null;
  fotosOn: boolean;
  onCerrar: () => void;
  onGuardar: (r: Omit<Registro, "creado">) => void;
  onError: (e: unknown) => void;
  propios: Alimento[];
  onCrearAlimento: (a: Alimento) => void;
  onBorrarAlimento: (id: string) => void;
}) {
  const [slot, setSlot] = useState<Slot>(slotInicial);
  const [fase, setFase] = useState<Fase>(file ? "preparando" : "manual");
  const [foto, setFoto] = useState<string | null>(null);
  const [thumb, setThumb] = useState("");
  const [res, setRes] = useState<Analisis | null>(null);
  const [porcion, setPorcion] = useState(1);
  const [nota, setNota] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [plato, setPlato] = useState<Plato>({});
  const todos = useMemo(() => [...propios, ...ALIMENTOS], [propios]);
  const resumen = resumenPlato(plato, todos);
  const iniciado = useRef(false);

  const planDe = (s: Slot) => MENU[diaSemana(fecha)].find((c) => c.id === s)?.texto;

  async function correrAnalisis(img: string, conNota?: string) {
    setFase("analizando");
    setError(null);
    try {
      const { resultado } = await analizar(pin, img, planDe(slot), conNota);
      setRes(resultado);
      setPorcion(1);
      setFase("resultado");
    } catch (e) {
      if (e instanceof ErrorApi && e.status === 401) return onError(e);
      setError(e instanceof Error ? e.message : "No se pudo analizar la foto.");
      setFase("manual");
    }
  }

  useEffect(() => {
    if (!file || iniciado.current) return;
    iniciado.current = true;
    (async () => {
      try {
        const grande = await comprimir(file, 1024, 0.8);
        setFoto(grande);
        setThumb(await miniatura(grande));
        if (fotosOn) await correrAnalisis(grande);
        else setFase("manual");
      } catch {
        setError("No se pudo leer la foto. Prueba con otra.");
        setFase("manual");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  useEffect(() => {
    const f = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", f);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", f);
      document.body.style.overflow = prev;
    };
  }, [onCerrar]);

  const k = (n: number) => Math.round(n * porcion);

  function guardarResultado() {
    if (!res) return;
    onGuardar({
      id: nuevoId(),
      slot,
      nombre: porcion === 1 ? res.nombre : `${res.nombre} (${PORCION_TXT[porcion]} porción)`,
      detalle: res.items.map((i) => `${i.nombre} ${Math.round(i.gramos * porcion)} g`).join(", "),
      kcal: k(res.kcal),
      prot: k(res.prot),
      carbs: k(res.carbs),
      grasa: k(res.grasa),
      foto: thumb,
    });
  }

  function guardarPlato() {
    if (!resumen.items.length) return;
    onGuardar({
      id: nuevoId(),
      slot,
      nombre: resumen.nombre.slice(0, 80),
      detalle: resumen.detalle.slice(0, 400),
      kcal: resumen.kcal,
      prot: resumen.prot,
      carbs: 0,
      grasa: 0,
      foto: thumb,
    });
  }

  function crearAlimento(a: Omit<Alimento, "id" | "cat">) {
    const nuevo: Alimento = { ...a, id: `f-${nuevoId().slice(2)}`, cat: "Mis comidas", propio: true };
    onCrearAlimento(nuevo);
    setPlato((p) => ({ ...p, [nuevo.id]: 1 }));
  }

  const titulo =
    fase === "resultado" ? "Revisa y guarda" : fase === "manual" ? "¿Qué comiste?" : fotosOn ? "Analizando…" : "Preparando…";

  return (
    <div className="scrim" onClick={onCerrar}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={titulo} onClick={(e) => e.stopPropagation()}>
        <div className="grab" />
        <div className="sheet-h">
          <h3>{titulo}</h3>
          <button className="x" onClick={onCerrar} aria-label="Cerrar">
            <IcX />
          </button>
        </div>

        {(foto || file) && (
          <div className={`photo ${fase === "manual" ? "small" : ""}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {foto && <img src={foto} alt="Tu comida" />}
            {(fase === "preparando" || fase === "analizando") && (
              <div className="scan" aria-live="polite">
                {fase === "preparando" ? "Preparando la foto" : "Calculando porciones y calorías"}
              </div>
            )}
          </div>
        )}

        <div className="slots" role="radiogroup" aria-label="Qué comida es">
          {SLOTS.map((s) => (
            <button
              key={s.id}
              className={`slot ${slot === s.id ? "on" : ""}`}
              role="radio"
              aria-checked={slot === s.id}
              onClick={() => setSlot(s.id)}
            >
              {s.nombre}
            </button>
          ))}
        </div>

        {error && <div className="err">{error}</div>}

        {fase === "resultado" && res && (
          <div className="result">
            <div className="result-name">{res.nombre}</div>

            <div className="macros">
              <div className="macro hl">
                <div className="v">{k(res.kcal)}</div>
                <div className="l">kcal</div>
              </div>
              <div className="macro">
                <div className="v">{k(res.prot)}</div>
                <div className="l">proteína g</div>
              </div>
              <div className="macro">
                <div className="v">{k(res.carbs)}</div>
                <div className="l">carbos g</div>
              </div>
              <div className="macro">
                <div className="v">{k(res.grasa)}</div>
                <div className="l">grasa g</div>
              </div>
            </div>

            <div className="portions" role="radiogroup" aria-label="Cuánto comiste">
              <span>Comí</span>
              {PORCIONES.map((p) => (
                <button
                  key={p}
                  className={`portion ${porcion === p ? "on" : ""}`}
                  role="radio"
                  aria-checked={porcion === p}
                  onClick={() => setPorcion(p)}
                >
                  {PORCION_TXT[p]}
                </button>
              ))}
            </div>

            {res.comentario && <div className="comment">{res.comentario}</div>}

            <ul className="items">
              {res.items.map((i) => (
                <li key={i.nombre}>
                  <span>
                    {i.nombre}, {Math.round(i.gramos * porcion)} g
                  </span>
                  <span>{Math.round(i.kcal * porcion)} kcal</span>
                </li>
              ))}
            </ul>
            <div className="conf">
              Confianza {res.confianza}. Es una estimación por foto: si sabes los gramos, corrige los valores.
            </div>

            <div className="field">
              <label htmlFor="nota">¿Algo que no se ve en la foto?</label>
              <div className="entry">
                <input
                  id="nota"
                  style={{ minHeight: 48, borderRadius: 12, border: "2px solid var(--line)", background: "var(--bg)", padding: "0 12px" }}
                  placeholder="Ej: con mayo, era doble"
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                />
                <button
                  className="btn"
                  style={{ minHeight: 48, padding: "0 14px" }}
                  disabled={!nota.trim() || !foto}
                  onClick={() => foto && correrAnalisis(foto, nota)}
                >
                  Recalcular
                </button>
              </div>
            </div>

            <div className="sheet-actions">
              <button className="btn primary" onClick={guardarResultado}>
                Guardar en {SLOTS.find((s) => s.id === slot)!.nombre.toLowerCase()}
              </button>
              <button className="btn" onClick={() => setFase("manual")}>
                Mejor elegir de mi lista
              </button>
            </div>
          </div>
        )}

        {fase === "manual" && (
          <>
            <Selector
              propios={propios}
              plato={plato}
              setPlato={setPlato}
              onCrear={crearAlimento}
              onBorrarPropio={onBorrarAlimento}
              autoFocus={!file}
            />
            <div className="tray">
              <div className="tray-sum">
                {resumen.items.length ? (
                  <>
                    <span className="num tray-k">{resumen.kcal.toLocaleString("es-CL")}</span> kcal,{" "}
                    <b>{resumen.prot}</b> g proteína
                    <div className="tray-n">{resumen.items.length === 1 ? "1 alimento" : `${resumen.items.length} alimentos`}</div>
                  </>
                ) : (
                  <span className="muted">Toca lo que comiste</span>
                )}
              </div>
              <button className="btn primary" style={{ width: "auto", padding: "0 18px" }} disabled={!resumen.items.length} onClick={guardarPlato}>
                Guardar
              </button>
            </div>
            {foto && fotosOn && (
              <button type="button" className="btn" style={{ marginTop: 8 }} onClick={() => correrAnalisis(foto, nota || undefined)}>
                Analizar la foto con IA
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
