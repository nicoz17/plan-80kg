"""Genera lib/productos.ts a partir de páginas JSON de Open Food Facts (productos de Chile).

Uso: python3 scripts/productos.py carpeta_con_json lib/productos.ts
Datos: Open Food Facts (https://world.openfoodfacts.org), licencia ODbL.
"""

import glob
import json
import re
import sys

src, out = sys.argv[1], sys.argv[2]

CATS = [
    (("en:beverages", "en:waters", "en:sodas", "en:juices", "en:plant-based-beverages", "en:teas", "en:coffees"), "Súper: bebidas"),
    (("en:alcoholic-beverages", "en:beers", "en:wines"), "Súper: alcohol"),
    (("en:yogurts", "en:dairies", "en:milks", "en:cheeses", "en:desserts"), "Súper: lácteos"),
    (("en:breads", "en:breakfast-cereals", "en:cereals-and-potatoes", "en:pastas", "en:rices"), "Súper: panes, cereales y pastas"),
    (("en:biscuits-and-cakes", "en:biscuits", "en:chocolates", "en:confectioneries", "en:sweet-snacks", "en:candies", "en:ice-creams"), "Súper: galletas y dulces"),
    (("en:salty-snacks", "en:chips-and-fries", "en:appetizers", "en:nuts"), "Súper: snacks salados"),
    (("en:meats", "en:prepared-meats", "en:sausages", "en:hams", "en:poultries", "en:fishes", "en:seafood"), "Súper: carnes, cecinas y pescados"),
    (("en:meals", "en:frozen-foods", "en:soups", "en:pizzas"), "Súper: comidas preparadas y congelados"),
    (("en:spreads", "en:sauces", "en:condiments", "en:fats", "en:jams"), "Súper: salsas, untables y aceites"),
    (("en:canned-foods", "en:legumes", "en:fruits-and-vegetables-based-foods"), "Súper: conservas, legumbres y verduras"),
    (("en:dietary-supplements", "en:protein-bars", "en:bodybuilding-supplements"), "Súper: suplementos y barras"),
]


PALABRAS = [
    (r"cerveza|vino |vino$|pisco|ron |vodka|whisky|espumante", "Súper: alcohol"),
    (r"yogh?urt|yogur|leche|quesillo|queso|kefir|manjar|postre|flan|crema", "Súper: lácteos"),
    (r"jugo|néctar|nectar|bebida|agua|gaseosa|refresco|té |te helado|café|cafe|energ|isot|kapo|guaran", "Súper: bebidas"),
    (r"galleta|chocolate|choco|alfajor|caramelo|dulce|gomita|helado|bizcocho|magdalena|queque|wafer|oblea|super 8|negrita|chokita|gelatina|jalea", "Súper: galletas y dulces"),
    (r"papas fritas|papa frita|ramita|suflé|chips|maní|mani |almendra|nuez|nueces|mix|cracker|tostada|tortilla de maiz|nacho", "Súper: snacks salados"),
    (r"pan |pan$|cereal|avena|granola|fideo|spaghetti|pasta|arroz|harina|wrap|tortilla|marraqueta|hallulla|molde", "Súper: panes, cereales y pastas"),
    (r"jamón|jamon|vienesa|salchicha|longaniza|chorizo|pollo|pavo|carne|hamburguesa|salame|atún|atun|jurel|sardina|salmón|salmon", "Súper: carnes, cecinas y pescados"),
    (r"mayonesa|ketchup|mostaza|salsa|aceite|margarina|mantequilla|mermelada|aderezo|ají|aji", "Súper: salsas, untables y aceites"),
    (r"proteína|proteina|protein|barra", "Súper: suplementos y barras"),
    (r"pizza|empanada|lasaña|nugget|congelad|sopa|crema de", "Súper: comidas preparadas y congelados"),
    (r"poroto|lenteja|garbanzo|arveja|choclo|durazno|piña|tomate|conserva", "Súper: conservas, legumbres y verduras"),
]


def categoria(tags, nombre=""):
    tags = tags or []
    # el alcohol primero, porque también es "beverages"
    for keys, cat_tag in [CATS[1]] + CATS[:1] + CATS[2:]:
        if any(t in tags for t in keys):
            return cat_tag
    n = nombre.lower()
    for patron, cat in PALABRAS:
        if re.search(patron, n):
            return cat
    return "Súper: otros"


def limpio(s):
    s = re.sub(r"\s+", " ", str(s or "")).strip()
    if s and s.upper() == s and sum(c.isalpha() for c in s) > 3:
        s = s.capitalize()
    return s[:1].upper() + s[1:] if s else s


def num(v):
    try:
        v = float(v)
        return v if v == v else None
    except (TypeError, ValueError):
        return None


filas, vistos = [], set()
for f in sorted(glob.glob(f"{src}/*.json")):
    try:
        data = json.load(open(f))
    except Exception:
        continue
    for p in data.get("products", []):
        nombre = limpio(p.get("product_name_es") or p.get("product_name"))
        if not nombre or len(nombre) < 3 or not re.search(r"[a-záéíóúñ]", nombre.lower()):
            continue
        marca = limpio((p.get("brands") or "").split(",")[0])
        n = p.get("nutriments") or {}
        k100 = num(n.get("energy-kcal_100g"))
        if k100 is None and num(n.get("energy_100g")) is not None:
            k100 = num(n.get("energy_100g")) / 4.184
        p100 = num(n.get("proteins_100g")) or 0
        if k100 is None or k100 < 0 or k100 > 900:
            continue
        # datos claramente mal cargados (ej. almendras con 34 kcal/100 g)
        if re.search(r"almendra|nuez|nueces|maní|mani |aceite|chocolate|mantequilla|galleta|papas fritas", nombre.lower()) and k100 < 250 and "bebida" not in nombre.lower() and "leche" not in nombre.lower():
            continue
        if p100 * 4 > k100 * 1.1:
            continue

        sq = num(p.get("serving_quantity"))
        ks = num(n.get("energy-kcal_serving"))
        if sq and 5 <= sq <= 600:
            kcal = k100 * sq / 100 if k100 else ks
            prot = p100 * sq / 100
            txt = str(p.get("serving_size") or "").lower()
            unidad = "ml" if "ml" in txt else "g"
            extra = re.match(r"^\s*(\d+[.,]?\d*\s*(unidad|unidades|galletas?|rebanadas?|láminas?|laminas?|cdas?|tazas?|vasos?|barras?)[^()]*)", txt)
            porcion = f"{extra.group(1).strip()} ({sq:g} {unidad})" if extra else f"{sq:g} {unidad}"
        else:
            kcal, prot, porcion = k100, p100, "100 g"

        if kcal is None or kcal > 2000:
            continue
        if kcal < 1 and not re.search(r"zero|light|sin az|agua|diet", nombre.lower()):
            continue

        visible = nombre if (not marca or marca.lower() in nombre.lower()) else f"{nombre} ({marca})"
        clave = re.sub(r"[^a-z0-9]", "", visible.lower())
        if clave in vistos:
            continue
        vistos.add(clave)
        filas.append([categoria(p.get("categories_tags"), visible), visible[:70], porcion[:40], round(kcal), round(prot)])

filas.sort(key=lambda r: (r[0], r[1].lower()))

with open(out, "w") as o:
    o.write("// Generado por scripts/productos.py desde Open Food Facts (ODbL), productos vendidos en Chile.\n")
    o.write("// [categoría, nombre, porción, kcal, proteína g]. No editar a mano: vuelve a correr el script.\n\n")
    o.write("export const PRODUCTOS: [string, string, string, number, number][] = [\n")
    for r in filas:
        o.write("  " + json.dumps(r, ensure_ascii=False) + ",\n")
    o.write("];\n")

print(len(filas), "productos")
