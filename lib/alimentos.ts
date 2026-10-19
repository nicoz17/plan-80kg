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
