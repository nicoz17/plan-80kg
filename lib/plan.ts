// Datos del plan 88 → 80 kg. Todo el contenido de la app vive aquí.

export const START = "2026-10-19"; // lunes de la semana 1
export const DIA_CERO = "2026-10-18"; // hoy al empezar: 88 kg
export const TOTAL_SEMANAS = 18;
export const BANDA_KG = 0.8;
export const META_FINAL = 80;

// Peso meta al cierre de cada semana (índice = semana, 0 = inicio)
export const METAS: number[] = [
  88.0, 87.0, 86.5, 86.0, 85.5, 85.0, 84.6, 84.2, 83.8, 83.4, 83.0, 82.6, 82.2,
  81.8, 81.4, 81.0, 80.6, 80.3, 80.0,
];

export const KCAL_META = 2300;
export const PROT_META = 170;

// ---------- Fechas ----------

export function hoySantiago(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(new Date());
}

function toUTC(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function diasEntre(a: string, b: string): number {
  return Math.round((toUTC(b) - toUTC(a)) / 86400000);
}

export function sumarDias(iso: string, n: number): string {
  const t = new Date(toUTC(iso) + n * 86400000);
  return t.toISOString().slice(0, 10);
}

/** 0 = domingo … 6 = sábado */
export function diaSemana(iso: string): number {
  return new Date(toUTC(iso)).getUTCDay();
}

/** Semana del plan: 0 antes de empezar, 1..18 durante, >18 después */
export function semanaDe(iso: string): number {
  const d = diasEntre(START, iso);
  if (d < 0) return 0;
  return Math.floor(d / 7) + 1;
}

/** Lunes de la semana calendario de la fecha */
export function lunesDe(iso: string): string {
  const dw = diaSemana(iso);
  return sumarDias(iso, dw === 0 ? -6 : 1 - dw);
}

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function fechaCorta(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MESES[m - 1]}`;
}

export function fechaLarga(iso: string): string {
  return `${DIAS[diaSemana(iso)]} ${fechaCorta(iso)}`;
}

export function faseDe(semana: number): { n: number; nombre: string } {
  if (semana <= 4) return { n: 1, nombre: "Instalar hábitos" };
  if (semana <= 12) return { n: 2, nombre: "Ritmo" };
  return { n: 3, nombre: "Recta final" };
}

/** Meta interpolada para un día cualquiera (días desde DIA_CERO) */
export function metaDelDia(iso: string): number {
  const d = diasEntre(DIA_CERO, iso);
  if (d <= 0) return METAS[0];
  const w = d / 7;
  if (w >= TOTAL_SEMANAS) return META_FINAL;
  const i = Math.floor(w);
  const f = w - i;
  return METAS[i] + (METAS[i + 1] - METAS[i]) * f;
}

// ---------- Entrenamiento ----------

export type Ejercicio = {
  nombre: string;
  donde: string;
  series: string;
  descanso: string;
  alternativa: string;
};

// Implementos de Plaza Perú (Carmencita 130, Las Condes): barras de dominadas,
// paralelas, pasamanos, espaldera, barras bajas de flexiones y banca de abdominales.
export const LUGAR = "Plaza Perú · Carmencita 130";

export const BARRAS_A: Ejercicio[] = [
  { nombre: "Dominadas (agarre prono, ancho de hombros)", donde: "Barra de dominadas", series: "4 × máx − 1", descanso: "2 min", alternativa: "Menos de 4: 4 × 4 negativas (saltas arriba, bajas en 5 seg)" },
  { nombre: "Remo australiano", donde: "Paralelas: acostado debajo, entre las barras, tira el pecho hacia ellas (o la barra de dominadas más baja)", series: "3 × 10–12", descanso: "90 seg", alternativa: "Rodillas flectadas, pies más cerca" },
  { nombre: "Sentadilla búlgara", donde: "Pie trasero sobre la banca de abdominales", series: "3 × 10 por pierna", descanso: "90 seg", alternativa: "Zancada estática en el suelo" },
  { nombre: "Puente de glúteo a una pierna", donde: "Hombros apoyados en la banca", series: "3 × 12 por pierna", descanso: "45 seg", alternativa: "A dos piernas" },
  { nombre: "Elevación de rodillas colgado", donde: "Espaldera, espalda apoyada", series: "3 × 10–15", descanso: "60 seg", alternativa: "Rodillas a 90° en vez de al pecho" },
  { nombre: "Extra: cruzar el pasamanos", donde: "Pasamanos", series: "2 pasadas", descanso: "60 seg", alternativa: "Colgado 20 seg de un extremo" },
];

export const BARRAS_B: Ejercicio[] = [
  { nombre: "Fondos", donde: "Paralelas", series: "4 × máx − 1", descanso: "2 min", alternativa: "Menos de 5: fondos con manos en la banca, 3 × 12" },
  { nombre: "Flexiones profundas", donde: "Barras bajas de flexiones", series: "3 × 12–20", descanso: "90 seg", alternativa: "Manos en la banca. Fácil: pies sobre la banca" },
  { nombre: "Pike push-ups (flexión en V)", donde: "Pies sobre la banca, manos en el suelo", series: "3 × 8–10", descanso: "90 seg", alternativa: "Pies en el suelo" },
  { nombre: "Zancada hacia atrás alternada", donde: "Junto a la espaldera", series: "3 × 12 por pierna", descanso: "60 seg", alternativa: "Agarrado de la espaldera" },
  { nombre: "Hollow hold + plancha lateral", donde: "Suelo o banca", series: "3 × 25 seg + 2 × 30 seg por lado", descanso: "45 seg", alternativa: "Rodillas flectadas" },
];

export const CALENTAMIENTO_BARRAS = [
  "1 min de trote suave o saltos en el lugar",
  "10 círculos de brazos adelante y 10 atrás",
  "10 sentadillas sin peso",
  "20 seg colgado de la barra, soltando hombros",
  "5 flexiones y 5 remos australianos suaves",
];

export const CALENTAMIENTO_TROTE = [
  "1 min caminando rápido",
  "10 balanceos de pierna adelante-atrás por lado",
  "2 × 20 m de skipping suave",
];

export function progresionBarras(semana: number): string {
  if (semana <= 2) return "Aprender: deja 2–3 reps en reserva en todo. Foco en técnica y en no faltar.";
  if (semana <= 5) return "Construir: rangos completos. Flexiones con pies elevados al pasar 20. Búlgaras con mochila de 5 kg al pasar 12.";
  if (semana === 6) return "Descarga: haz la mitad de las series. Viernes: test de máximo de dominadas y fondos.";
  if (semana <= 11) return "Cargar: mochila 5–10 kg en búlgaras y zancadas. Dominadas a 5 series. Remo australiano con pies elevados.";
  if (semana === 12) return "Descarga: mitad de las series. Test de máximo el viernes.";
  return "Afinar: dominadas y fondos con mochila de 5 kg si haces 10+. Ejercicios 2–3 y 4–5 en superserie para bajar a 30 min. Test final en semana 18.";
}

// Trote por semana: [martes continuo, jueves intervalos, sábado largo]
export const TROTE: [string, string, string][] = [
  ["30 min caminando rápido", "30 min caminando rápido", "40 min caminando"], // semana 0
  ["6×(3 min trote / 1 min caminar)", "6×(30 seg rápido / 90 seg suave)", "7×(4 min trote / 1 min caminar)"],
  ["5×(4 / 1)", "6×(45 seg rápido / 90 seg suave)", "6×(6 / 1)"],
  ["3×(8 / 1)", "6×(1 min rápido / 1 min suave)", "4×(9 / 1)"],
  ["2×(12 / 1)", "7×(1 / 1)", "3×(12 / 1)"],
  ["25 min seguidos", "8×(1 / 1)", "40 min seguidos"],
  ["20 min (descarga)", "5×(1 / 1)", "30 min"],
  ["30 min", "6×(2 min rápido / 1 min suave)", "42 min"],
  ["30 min", "7×(2 / 1)", "44 min"],
  ["30 min, últimos 5 rápido", "5×(3 min rápido / 90 seg suave)", "46 min"],
  ["32 min", "6×(3 / 90 seg)", "48 min"],
  ["32 min", "10×(45 seg muy rápido / 75 seg suave)", "45 min"],
  ["25 min (descarga)", "5×(1 / 1)", "35 min"],
  ["35 min", "4×(4 min rápido / 2 min suave)", "50 min"],
  ["35 min, con 10 min a esfuerzo 7 en medio", "5×(4 / 2)", "50 min"],
  ["35 min", "8 subidas de cuesta de 45 seg, bajada caminando", "55 min"],
  ["35 min, con 15 min a esfuerzo 7", "5×(4 / 2)", "55 min"],
  ["35 min", "10×(1 / 1)", "60 min"],
  ["Test 5 km a tope (anota el tiempo)", "6×(1 / 1) suave", "40 min de celebración"],
];

export type Sesion = {
  tipo: "barrasA" | "barrasB" | "trote" | "descanso";
  titulo: string;
  duracion: string;
  esfuerzo: string;
  detalle?: string;
  nota?: string;
};

export function sesionDelDia(iso: string): Sesion {
  const s = Math.min(semanaDe(iso), TOTAL_SEMANAS);
  const t = TROTE[s];
  switch (diaSemana(iso)) {
    case 1:
      return { tipo: "barrasA", titulo: "Barras A · tirón + piernas", duracion: "40 min", esfuerzo: "7–8 de 10" };
    case 2:
      return { tipo: "trote", titulo: "Trote continuo", duracion: "~30 min", esfuerzo: "5–6 de 10 (puedes hablar en frases)", detalle: t[0] };
    case 3:
      return { tipo: "barrasB", titulo: "Barras B · empuje + piernas", duracion: "40 min", esfuerzo: "7–8 de 10" };
    case 4:
      return { tipo: "trote", titulo: "Trote por intervalos", duracion: "~30–40 min", esfuerzo: "8–9 de 10 en los rápidos", detalle: t[1], nota: "8 min de trote suave antes y 4 min después." };
    case 5:
      return s % 2 === 1
        ? { tipo: "barrasA", titulo: "Barras A · tirón + piernas", duracion: "40 min", esfuerzo: "7–8 de 10" }
        : { tipo: "barrasB", titulo: "Barras B · empuje + piernas", duracion: "40 min", esfuerzo: "7–8 de 10" };
    case 6:
      return { tipo: "trote", titulo: "Trote largo", duracion: "40–60 min", esfuerzo: "4–5 de 10, muy tranquilo", detalle: t[2] };
    default:
      return { tipo: "descanso", titulo: "Caminata o descanso", duracion: "30–60 min", esfuerzo: "2–3 de 10", detalle: "Camina tranquilo o descansa. Hoy toca meal prep." };
  }
}

// ---------- Comida ----------

export type Comida = {
  id: string;
  nombre: string;
  hora: string;
  texto: string;
  kcal: number;
  prot: number;
};

const DESAYUNO: Comida = {
  id: "desayuno",
  nombre: "Desayuno",
  hora: "8:30–9:30",
  texto: "1 plátano + 1 yogur proteico (150–170 g) + café cortado con 100 ml de leche descremada, sin azúcar. Plan B: plátano + 2 huevos duros + café.",
  kcal: 260,
  prot: 21,
};

const COLACION: Comida = {
  id: "colacion",
  nombre: "Colación",
  hora: "16:30–17:30",
  texto: "Batido: 1 scoop (30 g) de whey con 300 ml de agua + 1 manzana o naranja + 20 g de almendras (~15). Plan B: yogur griego 170 g + fruta + almendras.",
  kcal: 315,
  prot: 28,
};

// índice = día de la semana (0 = domingo)
export const MENU: Comida[][] = [
  // Domingo
  [
    { id: "desayuno", nombre: "Desayuno", hora: "9:30–10:30", texto: "60 g de avena cocida en 250 ml de leche descremada + 1 plátano + 1 scoop de proteína.", kcal: 520, prot: 45 },
    { id: "almuerzo", nombre: "Almuerzo", hora: "13:30–14:30", texto: "250 g de carne magra (posta, lomo liso desgrasado o pollo) + ensalada chilena + 1 papa mediana. Si hay asado: 1 choripán máximo.", kcal: 700, prot: 65 },
    { id: "colacion", nombre: "Colación", hora: "17:00", texto: "1 fruta + 20 g de almendras.", kcal: 195, prot: 4 },
    { id: "comida", nombre: "Comida", hora: "20:00–21:00", texto: "Liviano: 200 g de yogur griego + 30 g de avena + 1 fruta + 15 g de nueces.", kcal: 480, prot: 25 },
  ],
  // Lunes
  [
    DESAYUNO,
    { id: "almuerzo", nombre: "Almuerzo", hora: "13:00–14:00", texto: "200 g de pechuga de pollo + 150 g de arroz + ensalada de lechuga, tomate y pepino con 1 cdta de aceite de oliva + 50 g de palta.", kcal: 690, prot: 66 },
    COLACION,
    { id: "comida", nombre: "Once", hora: "20:00–21:00", texto: "1 marraqueta + 3 huevos revueltos + 60 g de quesillo + 100 g de pechuga de pavo laminada + tomate + 40 g de palta.", kcal: 700, prot: 55 },
  ],
  // Martes
  [
    DESAYUNO,
    { id: "almuerzo", nombre: "Almuerzo", hora: "13:00–14:00", texto: "180 g de carne molida 5% salteada con cebolla y pimentón + 250 g de papas cocidas + 200 g de verduras salteadas.", kcal: 620, prot: 42 },
    COLACION,
    { id: "comida", nombre: "Comida", hora: "20:00–21:00", texto: "200 g de pollo + 200 g de brócoli o zapallo italiano + 100 g de arroz.", kcal: 540, prot: 64 },
  ],
  // Miércoles
  [
    DESAYUNO,
    { id: "almuerzo", nombre: "Almuerzo", hora: "13:00–14:00", texto: "300 g de lentejas guisadas (con zapallo y zanahoria, sin longaniza) + 2 huevos duros + ensalada chilena.", kcal: 600, prot: 40 },
    COLACION,
    { id: "comida", nombre: "Once", hora: "20:00–21:00", texto: "1 marraqueta + 1 lata de atún en agua (120 g escurrido) con 1 cda de mayo light, tomate y 40 g de palta.", kcal: 620, prot: 45 },
  ],
  // Jueves
  [
    DESAYUNO,
    { id: "almuerzo", nombre: "Almuerzo", hora: "13:00–14:00", texto: "200 g de pollo + 180 g de fideos cocidos + 100 g de salsa de tomate casera + ensalada verde.", kcal: 720, prot: 70 },
    COLACION,
    { id: "comida", nombre: "Comida", hora: "20:00–21:00", texto: "Omelette de 3 huevos + 2 claras + 60 g de quesillo + espinaca y champiñones + 1 pan pita integral.", kcal: 520, prot: 40 },
  ],
  // Viernes
  [
    DESAYUNO,
    { id: "almuerzo", nombre: "Almuerzo", hora: "13:00–14:00", texto: "180 g de carne molida + 150 g de arroz + ensalada + 50 g de palta.", kcal: 720, prot: 44 },
    COLACION,
    { id: "comida", nombre: "Comida", hora: "20:00–21:00", texto: "150 g de salmón (crudo) al horno + 200 g de papas + 200 g de brócoli. Si sales: revisa “Comer fuera”.", kcal: 580, prot: 32 },
  ],
  // Sábado
  [
    { id: "desayuno", nombre: "Desayuno", hora: "9:30–10:30", texto: "3 huevos revueltos + 1 marraqueta + 40 g de palta + café.", kcal: 560, prot: 27 },
    { id: "almuerzo", nombre: "Almuerzo post-trote", hora: "13:30–14:30", texto: "200 g de pollo + 200 g de papas + ensalada grande.", kcal: 620, prot: 64 },
    { id: "colacion", nombre: "Colación", hora: "17:00", texto: "1 yogur proteico + 1 fruta.", kcal: 200, prot: 18 },
    { id: "comida", nombre: "Comida libre", hora: "Noche", texto: "Una comida libre (no el día). Hasta 2 tragos. Pide proteína clara si salen.", kcal: 900, prot: 35 },
  ],
];

export const COMER_FUERA: { lugar: string; pide: string; evita: string; kcal: string }[] = [
  { lugar: "Casino o menú del día", pide: "Pollo o pescado a la plancha + ensalada + arroz o papas cocidas (no las dos)", evita: "Fritos, pastel de choclo, lasaña, postre del menú", kcal: "600–750" },
  { lugar: "Sushi", pide: "1 sashimi (10 cortes) + 1 roll sin queso crema ni panko, o 2 handrolls de salmón sin queso", evita: "Tempura, apanados, queso crema, salsas a destajo", kcal: "500–700" },
  { lugar: "Restaurante / parrilla", pide: "Lomo liso, entraña o pescado + ensalada + papas cocidas o arroz", evita: "Papas fritas, pastas con crema, entrada + postre", kcal: "700–900" },
  { lugar: "Pizza", pide: "2 trozos de masa delgada con carne o pollo + ensalada", evita: "Masa gruesa, borde relleno, 4 quesos, tercer trozo", kcal: "600–700" },
  { lugar: "Comida rápida", pide: "Hamburguesa simple o doble sin mayo + bebida zero, sin papas", evita: "Combo grande, papas, bebida normal", kcal: "500–650" },
  { lugar: "Fuente de soda", pide: "1 churrasco italiano o 1 completo italiano + bebida zero", evita: "Chorrillana, as con todo, segundo sándwich", kcal: "600–750" },
  { lugar: "Peruano", pide: "Ceviche, ¼ pollo a la brasa sin piel con ensalada, saltado con arroz sin papas fritas", evita: "Chicharrón, jalea, ají de gallina", kcal: "600–800" },
  { lugar: "Bar / carrete", pide: "2 schops, 2 copas de vino o 2 piscolas con zero + algo con proteína", evita: "Picoteo frito, 3er trago, completo de madrugada", kcal: "300–600" },
];

// ---------- Compras ----------

export type ItemCompra = { id: string; cat: string; producto: string; cantidad: string };

export const COMPRAS: ItemCompra[] = [
  { id: "pollo", cat: "Proteína", producto: "Pechuga de pollo deshuesada", cantidad: "1,3 kg crudo" },
  { id: "molida", cat: "Proteína", producto: "Carne molida 5% grasa", cantidad: "450 g" },
  { id: "huevos", cat: "Proteína", producto: "Huevos", cantidad: "1 bandeja de 30" },
  { id: "salmon", cat: "Proteína", producto: "Salmón o reineta", cantidad: "150 g" },
  { id: "atun", cat: "Proteína", producto: "Atún en agua", cantidad: "2 latas" },
  { id: "pavo", cat: "Proteína", producto: "Pechuga de pavo laminada", cantidad: "100 g" },
  { id: "carne-dom", cat: "Proteína", producto: "Carne magra domingo (posta o lomo liso)", cantidad: "300 g" },
  { id: "yog-prot", cat: "Lácteos", producto: "Yogur proteico", cantidad: "6 potes" },
  { id: "yog-griego", cat: "Lácteos", producto: "Yogur griego natural sin azúcar", cantidad: "3 potes" },
  { id: "quesillo", cat: "Lácteos", producto: "Quesillo", cantidad: "1 (250 g)" },
  { id: "leche", cat: "Lácteos", producto: "Leche descremada", cantidad: "1 L" },
  { id: "arroz", cat: "Carbohidratos", producto: "Arroz", cantidad: "250 g crudo" },
  { id: "papas", cat: "Carbohidratos", producto: "Papas", cantidad: "1,5 kg" },
  { id: "lentejas", cat: "Carbohidratos", producto: "Lentejas", cantidad: "150 g crudas" },
  { id: "fideos", cat: "Carbohidratos", producto: "Fideos", cantidad: "80 g crudos" },
  { id: "marraqueta", cat: "Carbohidratos", producto: "Marraquetas (congelar)", cantidad: "3" },
  { id: "pita", cat: "Carbohidratos", producto: "Pan pita integral", cantidad: "1 paquete" },
  { id: "platanos", cat: "Fruta", producto: "Plátanos", cantidad: "7" },
  { id: "manzanas", cat: "Fruta", producto: "Manzanas o naranjas", cantidad: "8" },
  { id: "lechuga", cat: "Verdura", producto: "Lechugas", cantidad: "2" },
  { id: "basicos", cat: "Verdura", producto: "Pepino, cebolla, pimentón, zanahoria", cantidad: "1 de cada uno" },
  { id: "tomates", cat: "Verdura", producto: "Tomates", cantidad: "1 kg" },
  { id: "brocoli", cat: "Verdura", producto: "Brócoli", cantidad: "2" },
  { id: "zapallo-it", cat: "Verdura", producto: "Zapallo italiano", cantidad: "3" },
  { id: "espinaca", cat: "Verdura", producto: "Espinaca y champiñones", cantidad: "1 bolsa y 1 bandeja" },
  { id: "camote", cat: "Verdura", producto: "Zapallo camote", cantidad: "300 g" },
  { id: "paltas", cat: "Grasas", producto: "Paltas", cantidad: "4" },
  { id: "whey", cat: "Despensa (mensual)", producto: "Proteína whey", cantidad: "1 tarro ~1 kg" },
  { id: "avena", cat: "Despensa (mensual)", producto: "Avena", cantidad: "500 g" },
  { id: "frutos-secos", cat: "Despensa (mensual)", producto: "Almendras y nueces", cantidad: "300 g y 100 g" },
  { id: "aceite", cat: "Despensa (mensual)", producto: "Aceite de oliva, salsa de tomate, mayo light", cantidad: "según falte" },
];

export const MEAL_PREP: string[] = [
  "0:00 · Cuece 10 huevos (10 min desde que hierve) y 250 g de arroz. Pela y corta 1 kg de papas y ponlas a cocer.",
  "0:10 · Pollo: 1,3 kg en filetes con sal, pimienta, ajo y pimentón. Horno 200 °C, 22–25 min.",
  "0:15 · Lentejas: 150 g con zapallo camote, zanahoria y cebolla, 35 min a fuego medio.",
  "0:30 · Carne molida: sartén con cebolla y pimentón, 450 g, 10 min. Separa en 2.",
  "0:45 · Corta lechuga, pepino y tomate para 3 días; brócoli y zapallo en trozos.",
  "1:00 · Arma potes: 4 de 200 g de pollo, 2 de 180 g de carne, arroz de 150 g, papas de 250 g.",
  "1:15 · Refri: lunes a miércoles. Congelador: jueves y viernes (sácalo la noche anterior).",
];
