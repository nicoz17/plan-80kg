"use client";

import { useCallback, useEffect, useState } from "react";
import { cargar, enviar, ErrorApi, Estado, guardarPin, leerPin } from "./api";
import { hoySantiago, lunesDe } from "@/lib/plan";
import Hoy from "./Hoy";
import Peso from "./Peso";
import Compras from "./Compras";
import PinScreen from "./PinScreen";

type Tab = "hoy" | "peso" | "compras";

const VACIO: Estado = { weights: {}, done: [], doneWeek: {}, shopping: [], memoria: false };

export default function App() {
  const [pin, setPin] = useState<string | null>(null);
  const [listo, setListo] = useState(false);
  const [tab, setTab] = useState<Tab>("hoy");
  const [hoy, setHoy] = useState(hoySantiago());
  const [fecha, setFecha] = useState(hoy);
  const [estado, setEstado] = useState<Estado>(VACIO);
  const [cargando, setCargando] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setPin(leerPin());
    setListo(true);
  }, []);

  // Si la app queda abierta, actualizar "hoy" al volver
  useEffect(() => {
    const f = () => {
      if (document.visibilityState !== "visible") return;
      const h = hoySantiago();
      setHoy((prev) => {
        if (prev !== h) setFecha(h);
        return h;
      });
    };
    document.addEventListener("visibilitychange", f);
    return () => document.removeEventListener("visibilitychange", f);
  }, []);

  const avisar = useCallback((t: string) => {
    setToast(t);
    setTimeout(() => setToast(null), 2600);
  }, []);

  const manejarError = useCallback(
    (e: unknown) => {
      if (e instanceof ErrorApi && e.status === 401) {
        guardarPin(null);
        setPin(null);
        return;
      }
      avisar(e instanceof Error ? e.message : "No se pudo guardar");
    },
    [avisar],
  );

  const semana = lunesDe(fecha);

  const recargar = useCallback(async () => {
    if (!pin) return;
    setCargando(true);
    try {
      setEstado(await cargar(pin, fecha, semana));
    } catch (e) {
      manejarError(e);
    } finally {
      setCargando(false);
    }
  }, [pin, fecha, semana, manejarError]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  if (!listo) return null;
  if (!pin) {
    return (
      <PinScreen
        onOk={(p) => {
          guardarPin(p);
          setPin(p);
        }}
      />
    );
  }

  // ----- Mutaciones optimistas -----

  async function marcar(id: string, on: boolean) {
    setEstado((s) => {
      const done = on ? [...new Set([...s.done, id])] : s.done.filter((x) => x !== id);
      return { ...s, done, doneWeek: { ...s.doneWeek, [fecha]: done } };
    });
    try {
      await enviar(pin!, { action: "done", date: fecha, id, on });
    } catch (e) {
      manejarError(e);
      recargar();
    }
  }

  async function comprar(id: string, on: boolean) {
    setEstado((s) => ({
      ...s,
      shopping: on ? [...new Set([...s.shopping, id])] : s.shopping.filter((x) => x !== id),
    }));
    try {
      await enviar(pin!, { action: "shop", week: semana, id, on });
    } catch (e) {
      manejarError(e);
      recargar();
    }
  }

  async function guardarPeso(date: string, kg: number | null) {
    setEstado((s) => {
      const weights = { ...s.weights };
      if (kg === null) delete weights[date];
      else weights[date] = Math.round(kg * 10) / 10;
      return { ...s, weights };
    });
    try {
      await enviar(pin!, { action: "weight", date, kg });
      avisar(kg === null ? "Registro borrado" : "Peso guardado");
    } catch (e) {
      manejarError(e);
      recargar();
    }
  }

  return (
    <>
      <main className="app">
        {estado.memoria && (
          <div className="aviso">
            Modo prueba: falta conectar la base de datos en Vercel, así que los datos se pueden perder.
          </div>
        )}
        {tab === "hoy" && (
          <Hoy
            fecha={fecha}
            hoy={hoy}
            setFecha={setFecha}
            estado={estado}
            cargando={cargando}
            marcar={marcar}
          />
        )}
        {tab === "peso" && <Peso hoy={hoy} estado={estado} guardarPeso={guardarPeso} />}
        {tab === "compras" && <Compras fecha={hoy} estado={estado} comprar={comprar} semana={semana} />}
      </main>

      {toast && <div className="toast">{toast}</div>}

      <nav className="tabbar" aria-label="Secciones">
        <div className="tabbar-inner">
          <TabBtn activo={tab === "hoy"} onClick={() => setTab("hoy")} label="Hoy">
            <path d="M4 12h3l2-5 4 10 2-5h5" />
          </TabBtn>
          <TabBtn activo={tab === "peso"} onClick={() => setTab("peso")} label="Peso">
            <path d="M4 18 L9 12 L13 15 L20 6" />
            <circle cx="20" cy="6" r="1.5" />
          </TabBtn>
          <TabBtn
            activo={tab === "compras"}
            onClick={() => {
              setFecha(hoy);
              setTab("compras");
            }}
            label="Compras"
          >
            <path d="M5 7h14l-1.5 10h-11z" />
            <path d="M9 7a3 3 0 0 1 6 0" />
          </TabBtn>
        </div>
      </nav>
    </>
  );
}

function TabBtn({
  activo,
  onClick,
  label,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button className={`tab ${activo ? "active" : ""}`} onClick={onClick} aria-current={activo ? "page" : undefined}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
      {label}
    </button>
  );
}
