"""
Genera todos los assets PNG para Tierra Interior Studio:
  1. Miniaturas de capas   → app-assets/miniaturas/capas/
  2. Miniaturas biblioteca → app-assets/miniaturas/biblioteca/
  3. Ilustraciones PNG     → app-assets/capas/{id}/ilustraciones/perfil.png
                             (convertidas desde los SVG existentes)
"""

import os, math, struct, zlib
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# ── Rutas base ──────────────────────────────────────────────────────────────
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "app-assets")

os.makedirs(os.path.join(ASSETS, "miniaturas", "capas"),      exist_ok=True)
os.makedirs(os.path.join(ASSETS, "miniaturas", "biblioteca"), exist_ok=True)

# ── Helpers de color ─────────────────────────────────────────────────────────
def hex2rgb(h):
    h = h.strip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def lerp_rgb(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

# ── Gradiente radial ─────────────────────────────────────────────────────────
def radial_gradient(w, h, stops, cx_r=0.45, cy_r=0.4):
    """stops = [(color_hex, position 0-1), ...]"""
    cx, cy = cx_r * w, cy_r * h
    maxd = math.sqrt(max(cx, w-cx)**2 + max(cy, h-cy)**2)
    xs = np.arange(w, dtype=np.float32)
    ys = np.arange(h, dtype=np.float32)
    xx, yy = np.meshgrid(xs, ys)
    d = np.sqrt((xx - cx)**2 + (yy - cy)**2) / maxd  # 0..1
    rgbs = [hex2rgb(c) for c, _ in stops]
    pos  = [p for _, p in stops]
    r_arr = np.zeros((h, w), np.uint8)
    g_arr = np.zeros((h, w), np.uint8)
    b_arr = np.zeros((h, w), np.uint8)
    for i in range(len(pos) - 1):
        p0, p1 = pos[i], pos[i+1]
        c0, c1 = rgbs[i], rgbs[i+1]
        mask = (d >= p0) & (d < p1)
        t = np.where(mask, (d - p0) / max(p1 - p0, 1e-6), 0.0)
        for ch, ca, cb in zip([r_arr, g_arr, b_arr], c0, c1):
            ch[mask] = np.clip(ca + (cb - ca) * t[mask], 0, 255).astype(np.uint8)
    # last stop clamp
    last_mask = d >= pos[-1]
    lc = rgbs[-1]
    r_arr[last_mask] = lc[0]; g_arr[last_mask] = lc[1]; b_arr[last_mask] = lc[2]
    return Image.fromarray(np.stack([r_arr, g_arr, b_arr], axis=-1), "RGB")

# ── Gradiente lineal a 135° ──────────────────────────────────────────────────
def linear_gradient_135(w, h, color1_hex, color2_hex):
    c1 = np.array(hex2rgb(color1_hex), dtype=np.float32)
    c2 = np.array(hex2rgb(color2_hex), dtype=np.float32)
    xs = np.linspace(0, 1, w, dtype=np.float32)
    ys = np.linspace(0, 1, h, dtype=np.float32)
    xx, yy = np.meshgrid(xs, ys)
    # 135° = diagonal top-left → bottom-right projection
    t = np.clip((xx + yy) / 2.0, 0, 1)
    img = np.zeros((h, w, 3), np.uint8)
    for ch in range(3):
        img[:, :, ch] = np.clip(c1[ch] + (c2[ch] - c1[ch]) * t, 0, 255).astype(np.uint8)
    return Image.fromarray(img, "RGB")

# ── Redondear esquinas ────────────────────────────────────────────────────────
def round_corners(img, r=16):
    mask = Image.new("L", img.size, 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([0, 0, img.width - 1, img.height - 1], radius=r, fill=255)
    result = img.convert("RGBA")
    result.putalpha(mask)
    return result

# ── Renderizar emoji ─────────────────────────────────────────────────────────
EMOJI_FONTS = [
    r"C:\Windows\Fonts\seguiemj.ttf",
    r"C:\Windows\Fonts\seguisym.ttf",
    r"C:\Windows\Fonts\segoeui.ttf",
]
_emoji_cache = {}

def get_emoji_font(size):
    if size in _emoji_cache:
        return _emoji_cache[size]
    for path in EMOJI_FONTS:
        if os.path.exists(path):
            try:
                f = ImageFont.truetype(path, size)
                _emoji_cache[size] = f
                return f
            except Exception:
                pass
    _emoji_cache[size] = ImageFont.load_default()
    return _emoji_cache[size]

def draw_emoji(draw, emoji, xy, size, color=(255, 255, 255, 220)):
    font = get_emoji_font(size)
    x, y = xy
    # shadow
    draw.text((x+1, y+1), emoji, font=font, fill=(0, 0, 0, 80))
    draw.text((x, y), emoji, font=font, fill=color)

def center_emoji(img_rgba, emoji, font_size):
    overlay = Image.new("RGBA", img_rgba.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    font = get_emoji_font(font_size)
    try:
        bbox = d.textbbox((0, 0), emoji, font=font)
        ew = bbox[2] - bbox[0]
        eh = bbox[3] - bbox[1]
    except Exception:
        ew, eh = font_size, font_size
    x = (img_rgba.width - ew) // 2
    y = (img_rgba.height - eh) // 2
    draw_emoji(d, emoji, (x, y), font_size)
    return Image.alpha_composite(img_rgba, overlay)

# ═══════════════════════════════════════════════════════════════════════════════
# 1. MINIATURAS DE CAPAS  (120×120 rounded, radial gradient)
# ═══════════════════════════════════════════════════════════════════════════════
CAPAS = [
    {
        "id":    "corteza_continental",
        "emoji": "🏔️",
        "stops": [("#b6c97a", 0.0), ("#7d9450", 0.5), ("#4a6030", 1.0)],
    },
    {
        "id":    "corteza_oceanica",
        "emoji": "🌊",
        "stops": [("#7ab8d8", 0.0), ("#3a80a8", 0.5), ("#1d6096", 1.0)],
    },
    {
        "id":    "manto_superior",
        "emoji": "🌋",
        "stops": [("#e8a060", 0.0), ("#c47030", 0.5), ("#a85c1a", 1.0)],
    },
    {
        "id":    "manto_inferior",
        "emoji": "🔥",
        "stops": [("#f5a020", 0.0), ("#e84010", 0.55), ("#c02000", 1.0)],
    },
    {
        "id":    "nucleo_externo",
        "emoji": "💧",
        "stops": [("#f87171", 0.0), ("#ef4444", 0.55), ("#dc2626", 1.0)],
    },
    {
        "id":    "nucleo_interno",
        "emoji": "⭐",
        "stops": [("#fde68a", 0.0), ("#f59e0b", 0.45), ("#d97706", 1.0)],
    },
]

SZ = 120
print("Generando miniaturas de capas...")
for capa in CAPAS:
    bg = radial_gradient(SZ, SZ, capa["stops"])
    img = round_corners(bg, r=22)
    img = center_emoji(img, capa["emoji"], font_size=52)
    out = os.path.join(ASSETS, "miniaturas", "capas", f"{capa['id']}.png")
    img.save(out, "PNG")
    print(f"  OK {capa['id']}.png")

# ═══════════════════════════════════════════════════════════════════════════════
# 2. MINIATURAS BIBLIOTECA  (280×120 linear 135°, rounded)
# ═══════════════════════════════════════════════════════════════════════════════
RECURSOS = [
    {"id": "volcan-art",      "c1": "#fef3c7", "c2": "#fb923c", "emoji": "🌋"},
    {"id": "artico-art",      "c1": "#e0f2fe", "c2": "#38bdf8", "emoji": "🧊"},
    {"id": "nucleo-int-art",  "c1": "#fef3c7", "c2": "#f97316", "emoji": "⭐"},
    {"id": "selva-art",       "c1": "#d1fae5", "c2": "#34d399", "emoji": "🌿"},
    {"id": "sismicas-vid",    "c1": "#dbeafe", "c2": "#60a5fa", "emoji": "⚡"},
    {"id": "placas-vid",      "c1": "#dcfce7", "c2": "#4ade80", "emoji": "🌏"},
    {"id": "serengeti-vid",   "c1": "#fef9c3", "c2": "#fde047", "emoji": "🌾"},
    {"id": "tectonica-info",  "c1": "#dcfce7", "c2": "#4ade80", "emoji": "🌍"},
    {"id": "corteza-info",    "c1": "#fef3c7", "c2": "#86efac", "emoji": "🏔️"},
    {"id": "nucleo-ext-info", "c1": "#fce7f3", "c2": "#f9a8d4", "emoji": "🧲"},
    {"id": "campo-quiz",      "c1": "#fdf4ff", "c2": "#d8b4fe", "emoji": "🔬"},
    {"id": "sismos-quiz",     "c1": "#fef3c7", "c2": "#fb923c", "emoji": "⚡"},
]

BW, BH = 280, 120
print("\nGenerando miniaturas de biblioteca...")
for rec in RECURSOS:
    bg = linear_gradient_135(BW, BH, rec["c1"], rec["c2"])
    img = round_corners(bg, r=14)
    img = center_emoji(img, rec["emoji"], font_size=56)
    out = os.path.join(ASSETS, "miniaturas", "biblioteca", f"{rec['id']}.png")
    img.save(out, "PNG")
    print(f"  OK {rec['id']}.png")

# ═══════════════════════════════════════════════════════════════════════════════
# 3. MINIATURAS ECOSISTEMAS  (120×120 linear 135°, rounded)
# ═══════════════════════════════════════════════════════════════════════════════
ECOSISTEMAS = [
    {"id": "selva_tropical",       "c1": "#bbf7d0", "c2": "#4ade80", "emoji": "🌿"},
    {"id": "bosque_templado",      "c1": "#bbf7d0", "c2": "#86efac", "emoji": "🌳"},
    {"id": "taiga_boreal",         "c1": "#c7e8d8", "c2": "#4d9060", "emoji": "🌲"},
    {"id": "tundra",               "c1": "#e0f2fe", "c2": "#bae6fd", "emoji": "🏔️"},
    {"id": "desierto",             "c1": "#fef3c7", "c2": "#fbbf24", "emoji": "🏜️"},
    {"id": "sabana",               "c1": "#fef3c7", "c2": "#fde68a", "emoji": "🌾"},
    {"id": "polar",                "c1": "#e0f2fe", "c2": "#bfdbfe", "emoji": "🧊"},
    {"id": "matorral_mediterraneo","c1": "#ecfccb", "c2": "#d9f99d", "emoji": "🌿"},
    {"id": "oceano",               "c1": "#dbeafe", "c2": "#60a5fa", "emoji": "🌊"},
]

os.makedirs(os.path.join(ASSETS, "miniaturas", "ecosistemas"), exist_ok=True)
print("\nGenerando miniaturas de ecosistemas...")
for eco in ECOSISTEMAS:
    bg = linear_gradient_135(SZ, SZ, eco["c1"], eco["c2"])
    img = round_corners(bg, r=22)
    img = center_emoji(img, eco["emoji"], font_size=52)
    out = os.path.join(ASSETS, "miniaturas", "ecosistemas", f"{eco['id']}.png")
    img.save(out, "PNG")
    print(f"  OK {eco['id']}.png")

# ═══════════════════════════════════════════════════════════════════════════════
# 4. MINIATURAS DE ESPECIES  (96×96 por bioma, en ecosistemas/{id}/especies/)
# ═══════════════════════════════════════════════════════════════════════════════
ESPECIES = [
    # selva_tropical
    {"bioma":"selva_tropical", "id":"guacamayo_escarlata", "emoji":"🦜", "c1":"#d1fae5","c2":"#34d399"},
    {"bioma":"selva_tropical", "id":"jaguar",              "emoji":"🐆", "c1":"#bbf7d0","c2":"#10b981"},
    {"bioma":"selva_tropical", "id":"rana_dardo",          "emoji":"🐸", "c1":"#a7f3d0","c2":"#059669"},
    {"bioma":"selva_tropical", "id":"perezoso",            "emoji":"🦥", "c1":"#d1fae5","c2":"#6ee7b7"},
    # bosque_templado
    {"bioma":"bosque_templado","id":"ciervo_rojo",         "emoji":"🦌", "c1":"#dcfce7","c2":"#86efac"},
    {"bioma":"bosque_templado","id":"aguila_calva",        "emoji":"🦅", "c1":"#f0fdf4","c2":"#4ade80"},
    {"bioma":"bosque_templado","id":"lobo_gris",           "emoji":"🐺", "c1":"#d1fae5","c2":"#6ee7b7"},
    {"bioma":"bosque_templado","id":"zorro_rojo",          "emoji":"🦊", "c1":"#fef3c7","c2":"#86efac"},
    # taiga_boreal
    {"bioma":"taiga_boreal",   "id":"oso_pardo",           "emoji":"🐻", "c1":"#d1fae5","c2":"#4d9060"},
    {"bioma":"taiga_boreal",   "id":"lince_canada",        "emoji":"🐈", "c1":"#c7e8d8","c2":"#6ee7b7"},
    {"bioma":"taiga_boreal",   "id":"caribu",              "emoji":"🦌", "c1":"#e0f4ea","c2":"#5aab78"},
    {"bioma":"taiga_boreal",   "id":"buho_nival",          "emoji":"🦉", "c1":"#f0fdf4","c2":"#4ade80"},
    # tundra
    {"bioma":"tundra",         "id":"lobo_artico",         "emoji":"🐺", "c1":"#e0f2fe","c2":"#93c5fd"},
    {"bioma":"tundra",         "id":"zorro_artico",        "emoji":"🦊", "c1":"#dbeafe","c2":"#bae6fd"},
    {"bioma":"tundra",         "id":"buho_nival_t",        "emoji":"🦉", "c1":"#eff6ff","c2":"#bfdbfe"},
    {"bioma":"tundra",         "id":"pasto_artico",        "emoji":"🌾", "c1":"#e0f2fe","c2":"#7dd3fc"},
    # desierto
    {"bioma":"desierto",       "id":"dromedario",          "emoji":"🐪", "c1":"#fef9c3","c2":"#fde047"},
    {"bioma":"desierto",       "id":"lagarto_desierto",    "emoji":"🦎", "c1":"#fef3c7","c2":"#fbbf24"},
    {"bioma":"desierto",       "id":"escorpion",           "emoji":"🦂", "c1":"#fffbeb","c2":"#f59e0b"},
    {"bioma":"desierto",       "id":"saguaro",             "emoji":"🌵", "c1":"#fef3c7","c2":"#fcd34d"},
    # sabana
    {"bioma":"sabana",         "id":"jirafa",              "emoji":"🦒", "c1":"#fef9c3","c2":"#fde68a"},
    {"bioma":"sabana",         "id":"leon",                "emoji":"🦁", "c1":"#fef3c7","c2":"#fbbf24"},
    {"bioma":"sabana",         "id":"elefante",            "emoji":"🐘", "c1":"#fefce8","c2":"#fde047"},
    {"bioma":"sabana",         "id":"cebra",               "emoji":"🦓", "c1":"#fffbeb","c2":"#f59e0b"},
    # polar
    {"bioma":"polar",          "id":"pinguino_emperador",  "emoji":"🐧", "c1":"#eff6ff","c2":"#bfdbfe"},
    {"bioma":"polar",          "id":"oso_polar",           "emoji":"🐻‍❄️","c1":"#e0f2fe","c2":"#bae6fd"},
    {"bioma":"polar",          "id":"foca_weddell",        "emoji":"🦭", "c1":"#dbeafe","c2":"#93c5fd"},
    {"bioma":"polar",          "id":"ballena_groenlandia", "emoji":"🐳", "c1":"#e0f2fe","c2":"#7dd3fc"},
    # matorral_mediterraneo
    {"bioma":"matorral_mediterraneo","id":"aguila_real",   "emoji":"🦅", "c1":"#f7fee7","c2":"#bef264"},
    {"bioma":"matorral_mediterraneo","id":"lagartija",     "emoji":"🦎", "c1":"#ecfccb","c2":"#a3e635"},
    {"bioma":"matorral_mediterraneo","id":"lavanda",       "emoji":"🌸", "c1":"#fdf4ff","c2":"#d8b4fe"},
    {"bioma":"matorral_mediterraneo","id":"conejo_europeo","emoji":"🐇", "c1":"#f0fdf4","c2":"#bbf7d0"},
    # oceano
    {"bioma":"oceano",         "id":"ballena_azul",        "emoji":"🐋", "c1":"#dbeafe","c2":"#60a5fa"},
    {"bioma":"oceano",         "id":"tiburon_blanco",      "emoji":"🦈", "c1":"#eff6ff","c2":"#93c5fd"},
    {"bioma":"oceano",         "id":"calamar_gigante",     "emoji":"🐙", "c1":"#fdf4ff","c2":"#818cf8"},
    {"bioma":"oceano",         "id":"pez_payaso",          "emoji":"🐠", "c1":"#fff7ed","c2":"#fb923c"},
]

ESZ = 96  # species thumbnail size
print("\nGenerando miniaturas de especies...")
for sp in ESPECIES:
    out_dir = os.path.join(ASSETS, "ecosistemas", sp["bioma"], "especies")
    os.makedirs(out_dir, exist_ok=True)
    bg = linear_gradient_135(ESZ, ESZ, sp["c1"], sp["c2"])
    img = round_corners(bg, r=18)
    img = center_emoji(img, sp["emoji"], font_size=44)
    out = os.path.join(out_dir, f"{sp['id']}.png")
    img.save(out, "PNG")
    print(f"  OK {sp['bioma']}/{sp['id']}.png")

# ═══════════════════════════════════════════════════════════════════════════════
# 5. CONVERTIR SVG ILUSTRACIONES → PNG
# ═══════════════════════════════════════════════════════════════════════════════
print("\nConvirtiendo ilustraciones SVG -> PNG...")
try:
    from svglib.svglib import svg2rlg
    from reportlab.graphics import renderPM

    capas_ids = [
        "corteza_continental", "corteza_oceanica",
        "manto_superior", "manto_inferior",
        "nucleo_externo", "nucleo_interno",
    ]
    for cid in capas_ids:
        svg_path = os.path.join(ASSETS, "capas", cid, "ilustraciones", "perfil.svg")
        png_path = os.path.join(ASSETS, "capas", cid, "ilustraciones", "perfil.png")
        if not os.path.exists(svg_path):
            print(f"  ✗ SVG no encontrado: {svg_path}")
            continue
        try:
            drawing = svg2rlg(svg_path)
            if drawing:
                renderPM.drawToFile(drawing, png_path, fmt="PNG", dpi=144)
                print(f"  OK {cid}/ilustraciones/perfil.png")
            else:
                print(f"  ✗ {cid}: svglib retornó None")
        except Exception as e:
            print(f"  ✗ {cid}: {e}")
except ImportError as e:
    print(f"  svglib no disponible: {e}")

print("\nGeneracion completada.")
