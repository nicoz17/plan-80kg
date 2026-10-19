"use client";

import { useMemo, useState } from "react";
import { Alimento, BASE, TIPICOS, TODOS_TIPICOS } from "@/lib/alimentos";
import { IcX } from "./Icons";

export type Plato = Record<string, number>; // id → cantidad de porciones

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/yogh?urt/g, "yogur");

const cant = (n: number) => (n === 0.5 ? "½" : Number.isInteger(n) ? String(n) : `${Math.floor(n)}½`);

export function catalogo(propios: Alimento[], planItem?: Alimento): Alimento[] {
  const vistos = new Set<string>();
  return [...(planItem ? [planItem] : []), ...propios, ...TODOS_TIPICOS, ...BASE].filter((a) => {
    if (vistos.has(a.id)) return false;
    vistos.add(a.id);
    return true;
  });
}

export default function Selector({
  slot,
  planItem,
  propios,
  plato,
  setPlato,
  onCrear,
  onBorrarPropio,
  autoFocus,
}: {
  slot: string;
  planItem?: Alimento;
  propios: Alimento[];
  plato: Plato;
  setPlato: (p: Plato) => void;
  onCrear: (a: Omit<Alimento, "id" | "cat">) => void;
  onBorrarPropio: (id: string) => void;
  autoFocus: boolean;
}) {
  const [q, setQ] = useState("");
  const [creando, setCreando] = useState(false);
  const [verTodo, setVerTodo] = useState(false);
  const [cat, setCat] = useState<string | null>(null);
  const [nuevo, setNuevo] = useState({ nombre: "", porcion: "", kcal: "", prot: "" });

  const todos = useMemo(() => catalogo(propios, planItem), [propios, planItem]);
  const buscando = q.trim().length > 0;

  const grupos = useMemo((): [string, Alimento[]][] => {
    const agrupar = (lista: Alimento[]) => {
      const m = new Map<string, Alimento[]>();
      for (const a of lista) {
        if (!m.has(a.cat)) m.set(a.cat, []);
        m.get(a.cat)!.push(a);
      }
      return [...m.entries()];
    };
    if (buscando) {
      const t = norm(q.trim());
      const palabras = t.split(/\s+/);
      const hits = todos
        .map((a) => ({ a, n: norm(a.nombre) }))
        .filter(({ n }) => palabras.every((p) => n.includes(p)))
        .map(({ a, n }) => ({
          a,
          score: (n.startsWith(t) ? 0 : n.includes(" " + palabras[0]) ? 1 : 2) + (a.cat.startsWith("Súper") ? 3 : 0),
        }))
        .sort((x, y) => x.score - y.score || x.a.nombre.length - y.a.nombre.length)
        .slice(0, 80)
        .map((x) => x.a);
      return agrupar(hits);
    }
    if (verTodo && cat) return [[cat, todos.filter((a) => a.cat === cat)]];
    const menu: [string, Alimento[]][] = [];
    if (planItem) menu.push(["Lo del plan", [planItem]]);
    if (TIPICOS[slot]?.length) menu.push([TIPICOS[slot][0].cat, TIPICOS[slot]]);
    if (propios.length) menu.push(["Mis comidas", propios]);
    return verTodo ? [] : menu;
  }, [buscando, q, todos, planItem, slot, propios, verTodo, cat]);

  const categorias = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of BASE) m.set(a.cat, (m.get(a.cat) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => Number(a[0].startsWith("Súper")) - Number(b[0].startsWith("Súper")));
  }, []);

  function cambiar(id: string, delta: number) {
    const n = Math.max(0, (plato[id] ?? 0) + delta);
    const p = { ...plato };
    if (n === 0) delete p[id];
    else p[id] = n;
    setPlato(p);
  }

  function crear(e: React.FormEvent) {
    e.preventDefault();
    const kcal = Number(nuevo.kcal);
    if (!nuevo.nombre.trim() || !kcal) return;
    onCrear({
      nombre: nuevo.nombre.trim(),
      porcion: nuevo.porcion.trim() || "1 porción",
      kcal,
      prot: Number(nuevo.prot) || 0,
      propio: true,
    });
    setNuevo({ nombre: "", porcion: "", kcal: "", prot: "" });
    setCreando(false);
    setQ("");
  }

  return (
    <div className="picker">
      <input
        className="search"
        type="search"
        placeholder="Buscar: marraqueta, cazuela, completo…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus={autoFocus}
        aria-label="Buscar alimento"
      />

      {!buscando && verTodo && (
        <div className="browse-h">
          <button className="textlink" onClick={() => (cat ? setCat(null) : setVerTodo(false))}>
            {cat ? "← Categorías" : "← Volver al menú"}
          </button>
          {!cat && <span className="muted small">{BASE.length.toLocaleString("es-CL")} alimentos</span>}
        </div>
      )}

      {!buscando && verTodo && !cat && (
        <div className="cats">
          {categorias.map(([c, n]) => (
            <button key={c} className="cat-btn" onClick={() => setCat(c)}>
              <span>{c}</span>
              <span className="num">{n}</span>
            </button>
          ))}
        </div>
      )}

      {grupos.length === 0 && buscando && !creando && (
        <p className="muted small" style={{ margin: "14px 2px" }}>
          No está en la lista. Créalo abajo y queda guardado para la próxima.
        </p>
      )}

      {grupos.map(([cat, items]) => (
        <div key={cat}>
          <div className="pick-cat">{cat}</div>
          <ul className="pick-list">
            {items.map((a) => {
              const n = plato[a.id] ?? 0;
              return (
                <li key={a.id} className={`pick ${n ? "in" : ""}`}>
                  <button className="pick-main" onClick={() => cambiar(a.id, n ? 0 : 1)} aria-pressed={n > 0}>
                    <span className="pick-name">{a.nombre}</span>
                    <span className="pick-meta">
                      {a.porcion}: <b>{a.kcal}</b> kcal, {a.prot} g prot.
                    </span>
                  </button>
                  {n > 0 ? (
                    <div className="stepper" aria-label={`Cantidad de ${a.nombre}`}>
                      <button onClick={() => cambiar(a.id, -0.5)} aria-label="Menos">
                        −
                      </button>
                      <span className="num">{cant(n)}</span>
                      <button onClick={() => cambiar(a.id, 0.5)} aria-label="Más">
                        +
                      </button>
                    </div>
                  ) : a.propio ? (
                    <button
                      className="x"
                      aria-label={`Quitar ${a.nombre} de mi lista`}
                      onClick={() => {
                        if (confirm(`¿Quitar "${a.nombre}" de tu lista?`)) onBorrarPropio(a.id);
                      }}
                    >
                      <IcX />
                    </button>
                  ) : (
                    <button className="add" onClick={() => cambiar(a.id, 1)} aria-label={`Agregar ${a.nombre}`}>
                      +
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {!buscando && !verTodo && (
        <button className="btn" style={{ marginTop: 12 }} onClick={() => setVerTodo(true)}>
          Explorar los {BASE.length.toLocaleString("es-CL")} alimentos por categoría
        </button>
      )}

      {creando ? (
        <form className="create" onSubmit={crear}>
          <div className="pick-cat" style={{ marginTop: 0 }}>
            Nuevo alimento
          </div>
          <div className="field">
            <label htmlFor="n-nombre">Nombre</label>
            <input id="n-nombre" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} placeholder="Ej: Sándwich del casino" autoFocus />
          </div>
          <div className="field">
            <label htmlFor="n-porcion">Porción</label>
            <input id="n-porcion" value={nuevo.porcion} onChange={(e) => setNuevo({ ...nuevo, porcion: e.target.value })} placeholder="1 unidad" />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="n-kcal">Calorías</label>
              <input id="n-kcal" inputMode="numeric" value={nuevo.kcal} onChange={(e) => setNuevo({ ...nuevo, kcal: e.target.value.replace(/\D/g, "") })} placeholder="450" />
            </div>
            <div className="field">
              <label htmlFor="n-prot">Proteína (g)</label>
              <input id="n-prot" inputMode="numeric" value={nuevo.prot} onChange={(e) => setNuevo({ ...nuevo, prot: e.target.value.replace(/\D/g, "") })} placeholder="20" />
            </div>
          </div>
          <div className="sheet-actions" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <button type="button" className="btn" onClick={() => setCreando(false)}>
              Cancelar
            </button>
            <button className="btn primary" disabled={!nuevo.nombre.trim() || !nuevo.kcal}>
              Crear y agregar
            </button>
          </div>
          <p className="muted small" style={{ margin: "8px 2px 0" }}>
            ¿No sabes las calorías? Mándale la foto a Claude en el chat y te las calcula.
          </p>
        </form>
      ) : (
        <button
          className="add-extra"
          onClick={() => {
            setNuevo({ ...nuevo, nombre: q.trim() });
            setCreando(true);
          }}
        >
          {q.trim() ? `Crear "${q.trim()}"` : "Crear un alimento nuevo"}
        </button>
      )}
    </div>
  );
}

export function resumenPlato(plato: Plato, todos: Alimento[]) {
  const items = Object.entries(plato)
    .map(([id, n]) => ({ a: todos.find((x) => x.id === id), n }))
    .filter((x): x is { a: Alimento; n: number } => Boolean(x.a));
  const kcal = items.reduce((s, x) => s + x.a.kcal * x.n, 0);
  const prot = items.reduce((s, x) => s + x.a.prot * x.n, 0);
  const nombre = items.map((x) => (x.n === 1 ? x.a.nombre : `${x.a.nombre} ×${cant(x.n)}`)).join(" + ");
  const detalle = items.map((x) => `${cant(x.n)} × ${x.a.porcion} ${x.a.nombre}`).join(", ");
  return { items, kcal: Math.round(kcal), prot: Math.round(prot), nombre, detalle };
}
