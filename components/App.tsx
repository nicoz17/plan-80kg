"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cargar, enviar, ErrorApi, Estado, guardarFotos, guardarPin, leerFotos, leerPin, Registro, Slot } from "./api";
import { hoySantiago, lunesDe } from "@/lib/plan";
import Hoy from "./Hoy";
import Peso from "./Peso";
import Compras from "./Compras";
import Guia from "./Guia";
import PinScreen from "./PinScreen";
import FotoComida from "./FotoComida";
import { IcCam, IcCompras, IcGuia, IcHoy, IcPeso } from "./Icons";

type Tab = "hoy" | "peso" | "compras" | "guia";

const VACIO: Estado = { weights: {}, done: [], doneWeek: {}, shopping: [], log: [], memoria: false };

export type AbrirFoto = (slot?: Slot, conCamara?: boolean) => void;

export function slotPorHora(): Slot {
  const h = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: "America/Santiago", hour: "numeric", hour12: false }).format(new Date()),
  );
  if (h < 11) return "desayuno";
  if (h < 16) return "almuerzo";
  if (h < 19) return "colacion";
  return "comida";
}

export default function App() {
  const [pin, setPin] = useState<string | null>(null);
  const [listo, setListo] = useState(false);
  const [tab, setTab] = useState<Tab>("hoy");
  const [hoy, setHoy] = useState(hoySantiago());
  const [fecha, setFecha] = useState(hoy);
  const [estado, setEstado] = useState<Estado>(VACIO);
  const [fotosOn, setFotosOn] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [hoja, setHoja] = useState<{ slot: Slot; file: File | null } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const slotPendiente = useRef<Slot>("almuerzo");

  useEffect(() => {
    setPin(leerPin());
    setFotosOn(leerFotos());
    setListo(true);
  }, []);

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
      const e = await cargar(pin, fecha, semana);
      setEstado(e);
      const f = Boolean((e as Estado & { fotos?: boolean }).fotos);
      setFotosOn(f);
      guardarFotos(f);
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

  async function registrar(entry: Omit<Registro, "creado">) {
    const tmp: Registro = { ...entry, creado: new Date().toISOString() };
    setEstado((s) => ({ ...s, log: [...s.log, tmp] }));
    setHoja(null);
    try {
      await enviar(pin!, { action: "log-add", date: fecha, entry });
      avisar("Comida registrada");
    } catch (e) {
      manejarError(e);
      recargar();
    }
  }

  async function borrarRegistro(id: string) {
    setEstado((s) => ({ ...s, log: s.log.filter((r) => r.id !== id) }));
    try {
      await enviar(pin!, { action: "log-del", date: fecha, id });
      avisar("Registro borrado");
    } catch (e) {
      manejarError(e);
      recargar();
    }
  }

  const abrirFoto: AbrirFoto = (slot, conCamara = true) => {
    const s = slot ?? (fecha === hoy ? slotPorHora() : "almuerzo");
    if (conCamara) {
      slotPendiente.current = s;
      fileRef.current?.click();
    } else {
      setHoja({ slot: s, file: null });
    }
  };

  return (
    <>
      <main className="app">
        {estado.memoria && !cargando && (
          <div className="notice">
            Modo prueba: la base de datos no está conectada, así que lo que anotes se puede perder.
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
            abrirFoto={abrirFoto}
            borrarRegistro={borrarRegistro}
          />
        )}
        {tab === "peso" && <Peso hoy={hoy} estado={estado} guardarPeso={guardarPeso} />}
        {tab === "compras" && <Compras semana={semana} estado={estado} comprar={comprar} />}
        {tab === "guia" && <Guia fecha={hoy} />}
      </main>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) {
            setTab("hoy");
            setHoja({ slot: slotPendiente.current, file: f });
          }
        }}
      />

      {hoja && (
        <FotoComida
          pin={pin}
          fecha={fecha}
          slotInicial={hoja.slot}
          file={hoja.file}
          fotosOn={fotosOn}
          onCerrar={() => setHoja(null)}
          onGuardar={registrar}
          onError={manejarError}
        />
      )}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}

      <nav className="tabbar" aria-label="Secciones">
        <div className="tabbar-inner">
          <TabBtn activo={tab === "hoy"} onClick={() => setTab("hoy")} label="Hoy" icon={<IcHoy />} />
          <TabBtn activo={tab === "peso"} onClick={() => setTab("peso")} label="Peso" icon={<IcPeso />} />
          <button className="fab" onClick={() => abrirFoto()} aria-label="Fotografiar comida">
            <IcCam />
          </button>
          <TabBtn activo={tab === "compras"} onClick={() => setTab("compras")} label="Compras" icon={<IcCompras />} />
          <TabBtn activo={tab === "guia"} onClick={() => setTab("guia")} label="Guía" icon={<IcGuia />} />
        </div>
      </nav>
    </>
  );
}

function TabBtn({
  activo,
  onClick,
  label,
  icon,
}: {
  activo: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button className={`tab ${activo ? "active" : ""}`} onClick={onClick} aria-current={activo ? "page" : undefined}>
      {icon}
      {label}
    </button>
  );
}
