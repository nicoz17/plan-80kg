import { GENERICOS } from "./genericos";
import { PRODUCTOS } from "./productos";

// Lista de alimentos para anotar comidas sin gastar en IA.
// Valores aproximados por la porción indicada. Agrega aquí lo que comas seguido.

export type Alimento = {
  id: string;
  nombre: string;
  porcion: string;
  kcal: number;
  prot: number;
  cat: string;
  propio?: boolean;
};

const a = (cat: string, id: string, nombre: string, porcion: string, kcal: number, prot: number): Alimento => ({
  id,
  nombre,
  porcion,
  kcal,
  prot,
  cat,
});

export const ALIMENTOS: Alimento[] = [
  // Platos del plan
  a("Del plan", "p-pollo-arroz", "Pollo con arroz y ensalada (plan)", "200 g pollo + 150 g arroz", 640, 66),
  a("Del plan", "p-molida-papas", "Carne molida con papas (plan)", "180 g carne + 250 g papa", 620, 42),
  a("Del plan", "p-lentejas", "Lentejas con huevo (plan)", "300 g + 2 huevos", 600, 40),
  a("Del plan", "p-once-plan", "Once del plan", "marraqueta, huevos, quesillo, pavo", 700, 55),
  a("Del plan", "p-batido", "Batido whey + fruta + almendras", "1 scoop + fruta + 20 g", 315, 28),

  // Proteínas
  a("Proteínas", "pollo", "Pechuga de pollo cocida", "100 g", 165, 31),
  a("Proteínas", "pollo-asado", "Pollo asado con piel", "¼ pollo", 430, 40),
  a("Proteínas", "carne-magra", "Carne magra (posta, lomo liso)", "100 g", 190, 28),
  a("Proteínas", "molida", "Carne molida 5%", "100 g", 140, 21),
  a("Proteínas", "entrana", "Entraña o asado tira", "150 g", 450, 36),
  a("Proteínas", "longaniza", "Longaniza", "1 unidad (100 g)", 330, 14),
  a("Proteínas", "choripan", "Choripán", "1 unidad", 450, 16),
  a("Proteínas", "huevo", "Huevo", "1 unidad", 75, 6),
  a("Proteínas", "salmon", "Salmón", "150 g", 310, 31),
  a("Proteínas", "reineta", "Reineta o merluza a la plancha", "150 g", 170, 33),
  a("Proteínas", "atun", "Atún en agua", "1 lata (120 g)", 130, 28),
  a("Proteínas", "pavo-lam", "Pechuga de pavo laminada", "50 g", 50, 10),
  a("Proteínas", "jamon", "Jamón", "2 láminas (40 g)", 60, 7),

  // Lácteos
  a("Lácteos", "yogur-prot", "Yogur proteico", "1 pote", 120, 15),
  a("Lácteos", "yogur-griego", "Yogur griego natural", "1 pote (170 g)", 150, 15),
  a("Lácteos", "quesillo", "Quesillo", "60 g", 75, 8),
  a("Lácteos", "queso-gauda", "Queso gauda / mantecoso", "2 láminas (30 g)", 110, 7),
  a("Lácteos", "leche-desc", "Leche descremada", "1 taza (200 ml)", 70, 7),
  a("Lácteos", "whey", "Proteína whey", "1 scoop (30 g)", 120, 24),

  // Carbohidratos
  a("Carbohidratos", "marraqueta", "Marraqueta", "1 unidad (100 g)", 270, 9),
  a("Carbohidratos", "hallulla", "Hallulla", "1 unidad (90 g)", 290, 8),
  a("Carbohidratos", "pan-molde", "Pan de molde integral", "2 rebanadas", 140, 6),
  a("Carbohidratos", "pita", "Pan pita integral", "1 unidad", 170, 6),
  a("Carbohidratos", "arroz", "Arroz cocido", "150 g (un puño)", 195, 4),
  a("Carbohidratos", "fideos", "Fideos cocidos", "180 g", 280, 10),
  a("Carbohidratos", "papa-cocida", "Papa cocida", "200 g", 170, 4),
  a("Carbohidratos", "pure", "Puré de papas", "200 g", 220, 4),
  a("Carbohidratos", "papas-fritas", "Papas fritas", "porción mediana (150 g)", 470, 5),
  a("Carbohidratos", "avena", "Avena", "40 g", 150, 5),
  a("Carbohidratos", "lentejas", "Lentejas guisadas", "1 plato (300 g)", 350, 20),
  a("Carbohidratos", "porotos", "Porotos con riendas", "1 plato", 520, 22),
  a("Carbohidratos", "choclo", "Pastel de choclo", "1 porción (greda)", 750, 35),

  // Frutas y verduras
  a("Frutas y verduras", "platano", "Plátano", "1 unidad", 105, 1),
  a("Frutas y verduras", "manzana", "Manzana", "1 unidad", 80, 0),
  a("Frutas y verduras", "naranja", "Naranja", "1 unidad", 70, 1),
  a("Frutas y verduras", "palta", "Palta", "40 g (2 cdas)", 65, 1),
  a("Frutas y verduras", "ensalada", "Ensalada verde o chilena", "1 plato, 1 cdta aceite", 70, 2),
  a("Frutas y verduras", "verduras", "Verduras salteadas", "200 g", 110, 4),

  // Snacks
  a("Snacks", "almendras", "Almendras o nueces", "20 g (un puñado)", 120, 4),
  a("Snacks", "barra-prot", "Barra de proteína", "1 unidad", 200, 20),
  a("Snacks", "galletas", "Galletas (tipo Tritón, Oreo)", "4 unidades", 200, 2),
  a("Snacks", "chocolate", "Chocolate", "4 cuadritos (25 g)", 135, 2),
  a("Snacks", "papas-bolsa", "Papas fritas de bolsa", "bolsa chica (45 g)", 240, 3),
  a("Snacks", "helado", "Helado", "2 bolas", 280, 4),

  // Comida rápida y salidas
  a("Comida fuera", "completo-it", "Completo italiano", "1 unidad", 480, 14),
  a("Comida fuera", "as-italiano", "As / churrasco italiano", "1 unidad", 650, 32),
  a("Comida fuera", "barros-luco", "Barros luco", "1 unidad", 700, 38),
  a("Comida fuera", "hamburguesa", "Hamburguesa simple", "1 unidad", 500, 25),
  a("Comida fuera", "hamburguesa-doble", "Hamburguesa doble con queso", "1 unidad", 750, 42),
  a("Comida fuera", "pizza", "Pizza", "1 trozo (familiar)", 290, 12),
  a("Comida fuera", "empanada-pino", "Empanada de pino horno", "1 unidad", 480, 18),
  a("Comida fuera", "empanada-queso", "Empanada de queso frita", "1 unidad", 420, 12),
  a("Comida fuera", "sushi-roll", "Sushi roll (con queso crema)", "10 piezas", 500, 16),
  a("Comida fuera", "sushi-tempura", "Sushi roll tempura", "10 piezas", 650, 15),
  a("Comida fuera", "sashimi", "Sashimi de salmón", "10 cortes", 300, 30),
  a("Comida fuera", "ceviche", "Ceviche", "1 plato", 250, 30),
  a("Comida fuera", "chorrillana", "Chorrillana", "porción para 2", 1600, 60),
  a("Comida fuera", "sopaipilla", "Sopaipilla", "1 unidad", 180, 3),
  a("Comida fuera", "burrito", "Burrito", "1 unidad", 700, 30),

  // Bebidas
  a("Bebidas", "schop", "Schop de cerveza", "500 ml", 220, 2),
  a("Bebidas", "lata-cerveza", "Cerveza lata", "350 ml", 150, 1),
  a("Bebidas", "vino", "Copa de vino", "150 ml", 125, 0),
  a("Bebidas", "piscola-zero", "Piscola con bebida zero", "1 vaso", 130, 0),
  a("Bebidas", "piscola", "Piscola con bebida normal", "1 vaso", 230, 0),
  a("Bebidas", "bebida", "Bebida normal", "lata 350 ml", 150, 0),
  a("Bebidas", "jugo", "Jugo de fruta", "1 vaso (250 ml)", 115, 1),
  a("Bebidas", "cafe-leche", "Café con leche y azúcar", "1 taza", 90, 3),
];

// Ejemplos típicos por comida: platos completos, listos para un toque.
const t = (slot: string, id: string, nombre: string, porcion: string, kcal: number, prot: number): Alimento => ({
  id: `t-${id}`,
  nombre,
  porcion,
  kcal,
  prot,
  cat: `Típicos ${slot}`,
});

export const TIPICOS: Record<string, Alimento[]> = {
  desayuno: [
    t("de desayuno", "des-plan", "Plátano + yogur proteico + café cortado", "lo del plan", 260, 21),
    t("de desayuno", "des-palta-huevo", "Marraqueta con palta y 2 huevos", "1 pan", 500, 22),
    t("de desayuno", "des-jamon-queso", "Marraqueta con jamón y queso", "1 pan", 420, 22),
    t("de desayuno", "des-avena", "Avena con leche y plátano", "1 taza", 380, 14),
    t("de desayuno", "des-revueltos", "3 huevos revueltos con tostada", "1 plato", 330, 21),
    t("de desayuno", "des-griego", "Yogur griego con granola y fruta", "1 pote", 330, 18),
    t("de desayuno", "des-cafe-galletas", "Café con leche y galletas", "1 taza + 4", 290, 5),
  ],
  almuerzo: [
    t("de almuerzo", "alm-casino", "Casino: pollo, arroz y ensalada", "1 bandeja", 650, 45),
    t("de almuerzo", "alm-cazuela", "Cazuela de vacuno", "1 plato", 450, 30),
    t("de almuerzo", "alm-porotos", "Porotos con riendas", "1 plato", 520, 22),
    t("de almuerzo", "alm-lentejas", "Lentejas guisadas", "1 plato", 400, 22),
    t("de almuerzo", "alm-charquican", "Charquicán con huevo frito", "1 plato", 520, 25),
    t("de almuerzo", "alm-arroz-pollo", "Arroz con pollo al jugo", "1 plato", 600, 40),
    t("de almuerzo", "alm-bolognesa", "Tallarines con salsa boloñesa", "1 plato", 700, 32),
    t("de almuerzo", "alm-cesar", "Ensalada César con pollo", "1 plato", 550, 40),
    t("de almuerzo", "alm-pescado-pure", "Pescado frito con puré", "1 plato", 750, 35),
    t("de almuerzo", "alm-choclo", "Pastel de choclo", "1 greda", 750, 35),
    t("de almuerzo", "alm-pobre", "Lomo a lo pobre", "1 plato", 1300, 60),
  ],
  colacion: [
    t("de colación", "col-batido", "Batido whey + fruta + almendras", "lo del plan", 315, 28),
    t("de colación", "col-yogur-fruta", "Yogur proteico + fruta", "1 + 1", 200, 16),
    t("de colación", "col-barra", "Barra de proteína", "1 unidad", 200, 20),
    t("de colación", "col-fruta-almendras", "Fruta + puñado de almendras", "1 + 20 g", 200, 5),
    t("de colación", "col-sandwich-pavo", "Sándwich de pavo y quesillo", "pan de molde", 280, 22),
    t("de colación", "col-cafe-galletas", "Café con leche y galletas", "1 taza + 4", 290, 5),
  ],
  comida: [
    t("de once o comida", "com-once-palta", "Once: pan con palta y huevo + té", "1 pan", 450, 18),
    t("de once o comida", "com-once-jq", "Once: pan con jamón y queso + té", "1 pan", 420, 22),
    t("de once o comida", "com-once-doble", "Once: 2 panes con palta + té con azúcar", "2 panes", 700, 18),
    t("de once o comida", "com-omelette", "Omelette con quesillo y verduras", "3 huevos", 380, 32),
    t("de once o comida", "com-pollo-verduras", "Pollo con verduras salteadas", "1 plato", 450, 50),
    t("de once o comida", "com-sopaipillas", "Sopaipillas", "3 unidades", 540, 9),
    t("de once o comida", "com-completo", "Completo italiano + bebida zero", "1 completo", 480, 14),
    t("de once o comida", "com-pizza", "Pizza con la polola", "3 trozos", 870, 36),
    t("de once o comida", "com-sushi", "Sushi para compartir (tu parte)", "20 piezas", 1000, 32),
  ],
  extra: [
    t("fuera del plan", "ext-cervezas", "2 schops", "2 × 500 ml", 440, 4),
    t("fuera del plan", "ext-piscolas", "2 piscolas con zero", "2 vasos", 260, 0),
    t("fuera del plan", "ext-chocolate", "Chocolate", "4 cuadritos", 135, 2),
    t("fuera del plan", "ext-helado", "Helado", "2 bolas", 280, 4),
    t("fuera del plan", "ext-papas", "Papas fritas de bolsa", "bolsa chica", 240, 3),
  ],
};

export const TODOS_TIPICOS: Alimento[] = Object.values(TIPICOS).flat();

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 34);

function desdeFilas(pref: string, filas: [string, string, string, number, number][]): Alimento[] {
  const usados = new Set<string>();
  return filas.map(([cat, nombre, porcion, kcal, prot]) => {
    let id = `${pref}-${slug(nombre)}`;
    for (let i = 2; usados.has(id); i++) id = `${pref}-${slug(nombre).slice(0, 30)}-${i}`;
    usados.add(id);
    return { id, nombre, porcion, kcal, prot, cat };
  });
}

/** Todo el catálogo fijo: básicos + genéricos + productos de supermercado. */
export const BASE: Alimento[] = (() => {
  const vistos = new Set(ALIMENTOS.map((a) => a.nombre.toLowerCase()));
  const extra = [...desdeFilas("g", GENERICOS), ...desdeFilas("s", PRODUCTOS)].filter((a) => {
    const k = a.nombre.toLowerCase();
    if (vistos.has(k)) return false;
    vistos.add(k);
    return true;
  });
  const MAPA: Record<string, string> = {
    Proteínas: "Carnes",
    Lácteos: "Huevos y lácteos",
    Carbohidratos: "Arroz, pastas y papas",
    "Frutas y verduras": "Frutas",
    Snacks: "Dulces y snacks",
    "Comida fuera": "Sándwiches y comida rápida",
  };
  return [...ALIMENTOS.map((a) => (MAPA[a.cat] ? { ...a, cat: MAPA[a.cat] } : a)), ...extra];
})();
