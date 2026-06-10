/* ═══════════════════════════════════════════════════════════════
   CAPAS DATA — Datos científicos y educativos de las capas.
   Solo contiene información geológica (textos, UI, badges).
   La configuración 3D (colores, radios, iluminación) está en:
   app-assets/3D/capas/scene.json  ←  cargado por capas-viewer.js
═══════════════════════════════════════════════════════════════ */

const LAYERS = [
  {
    id:'corteza_continental', emoji:'🏔️', nombre:'Corteza Continental', grupo:'Capas Externas',
    depth:'0 – 35 km de profundidad', grosor:'35 km', temp:'~200°C', estado:'Sólida',
    sw:'background:linear-gradient(135deg,#8b9e6a,#6b7e4a)', bTemp:'~200°C', bState:'Sólida', bThick:'35 km',
    profundidad:'0 – 35 km', densidad:'2.7 g/cm³', volumen:'~1% Tierra',
    desc:'La capa más superficial de nuestro planeta. Compuesta de granito y basalto, sostiene todos los continentes.',
    dato:'¡La corteza continental puede superar los 70 km de grosor bajo grandes cadenas montañosas como el Himalaya!',
    datoLabel:'Dato Geológico',
    pres:{val:'0–1 GPa',pct:5,g:'#8b9e6a,#65a30d'}, dens:{val:'2.7 g/cm³',pct:30,g:'#8b9e6a,#a3e635'}, vol:{val:'~1% Tierra',pct:4,g:'#84cc16,#8b9e6a'},
    avatarBg:'radial-gradient(circle at 40% 35%,#b6c97a,#6b7e4a)', rulerPct:1
  },
  {
    id:'corteza_oceanica', emoji:'🌊', nombre:'Corteza Oceánica', grupo:'Capas Externas',
    depth:'0 – 10 km (bajo océanos)', grosor:'10 km', temp:'~150°C', estado:'Sólida',
    sw:'background:linear-gradient(135deg,#5a8ab0,#3a6a90)', bTemp:'~150°C', bState:'Sólida', bThick:'10 km',
    profundidad:'0 – 10 km', densidad:'3.0 g/cm³', volumen:'~0.1% Tierra',
    desc:'Más delgada y densa que la continental. Formada por basalto, cubre el fondo de los océanos y se renueva en las dorsales.',
    dato:'La corteza oceánica más antigua tiene apenas ~200 millones de años. ¡Es continuamente reciclada por la subducción!',
    datoLabel:'Dato Tectónico',
    pres:{val:'0–0.3 GPa',pct:3,g:'#5a8ab0,#3b82f6'}, dens:{val:'3.0 g/cm³',pct:35,g:'#3b82f6,#60a5fa'}, vol:{val:'~0.1% Tierra',pct:2,g:'#60a5fa,#5a8ab0'},
    avatarBg:'radial-gradient(circle at 40% 35%,#7ab8d8,#1d6096)', rulerPct:1
  },
  {
    id:'manto_superior', emoji:'🌋', nombre:'Manto Superior', grupo:'Capas Intermedias',
    depth:'35 – 660 km de profundidad', grosor:'625 km', temp:'~1,400°C', estado:'Plástico',
    sw:'background:linear-gradient(135deg,#c4782a,#a85c1a)', bTemp:'~1,400°C', bState:'Plástico',
    profundidad:'35 – 660 km', densidad:'3.4 g/cm³', volumen:'~10% Tierra',
    desc:'Contiene la astenosfera semiplástica donde las placas tectónicas flotan y se mueven por corrientes de convección.',
    dato:'Las placas tectónicas se mueven a la velocidad con la que crecen tus uñas: 2–10 cm por año.',
    datoLabel:'Dato Tectónico',
    pres:{val:'1–24 GPa',pct:18,g:'#c4782a,#a85c1a'}, dens:{val:'3.4 g/cm³',pct:45,g:'#a85c1a,#c4782a'}, vol:{val:'~10% Tierra',pct:22,g:'#c4782a,#f59e0b'},
    avatarBg:'radial-gradient(circle at 40% 35%,#e8a060,#a85c1a)', rulerPct:10
  },
  {
    id:'manto_inferior', emoji:'🔥', nombre:'Manto Inferior', grupo:'Capas Intermedias',
    depth:'660 – 2,900 km de profundidad', grosor:'2,240 km', temp:'~3,700°C', estado:'Viscoso',
    sw:'background:linear-gradient(135deg,#d44820,#b83008)', bTemp:'~3,700°C', bState:'Viscoso',
    profundidad:'660 – 2,900 km', densidad:'4.4 g/cm³', volumen:'38% Tierra',
    desc:'La capa más gruesa del planeta. Silicatos de magnesio y hierro que fluyen lentamente por convección, moviendo las placas.',
    dato:'Las ondas sísmicas tipo S no atraviesan el núcleo externo líquido. ¡Descubrimos el interior de la Tierra con terremotos!',
    datoLabel:'Dato Sísmico',
    pres:{val:'24–136 GPa',pct:78,g:'#c45c1a,#e64010'}, dens:{val:'4.4 g/cm³',pct:65,g:'#c45c1a,#f59e0b'}, vol:{val:'38% Tierra',pct:55,g:'#f59e0b,#c45c1a'},
    avatarBg:'radial-gradient(circle at 40% 35%,#f5a020,#e84010 60%,#c02000)', rulerPct:46
  },
  {
    id:'nucleo_externo', emoji:'💧', nombre:'Núcleo Externo', grupo:'Núcleo',
    depth:'2,900 – 5,150 km de profundidad', grosor:'2,250 km', temp:'~5,000°C', estado:'Líquido',
    sw:'background:linear-gradient(135deg,#e84010,#c02000)', bTemp:'~5,000°C', bState:'Líquido',
    profundidad:'2,900 – 5,150 km', densidad:'9.9 g/cm³', volumen:'15% Tierra',
    desc:'Hierro y níquel en estado líquido. Su movimiento convectivo genera el campo magnético que protege toda la vida del viento solar.',
    dato:'El campo magnético generado por el núcleo externo desvía partículas solares. Sin él, la atmósfera se evaporaría al espacio.',
    datoLabel:'Dato Magnético',
    pres:{val:'136–329 GPa',pct:88,g:'#e84010,#c02000'}, dens:{val:'9.9 g/cm³',pct:85,g:'#c02000,#e84010'}, vol:{val:'15% Tierra',pct:40,g:'#e84010,#f87171'},
    avatarBg:'radial-gradient(circle at 40% 35%,#f87171,#ef4444 60%,#dc2626)', rulerPct:71
  },
  {
    id:'nucleo_interno', emoji:'⭐', nombre:'Núcleo Interno', grupo:'Núcleo',
    depth:'5,150 – 6,371 km (centro)', grosor:'1,220 km', temp:'~6,000°C', estado:'Sólido',
    sw:'background:linear-gradient(135deg,#f5a020,#d08010)', bTemp:'~6,000°C', bState:'Sólido',
    profundidad:'5,150 – 6,371 km', densidad:'13 g/cm³', volumen:'~1% Tierra',
    desc:'El corazón de la Tierra: esfera sólida de hierro y níquel, más caliente que la superficie del Sol, sólida por la presión extrema.',
    dato:'El núcleo interno rota ~0.3–0.5° por año más rápido que la superficie terrestre. ¡El centro de la Tierra tiene su propio movimiento!',
    datoLabel:'Dato Asombroso',
    pres:{val:'329–364 GPa',pct:100,g:'#f5a020,#d08010'}, dens:{val:'13 g/cm³',pct:100,g:'#d08010,#fbbf24'}, vol:{val:'~1% Tierra',pct:4,g:'#fbbf24,#f5a020'},
    avatarBg:'radial-gradient(circle at 40% 35%,#fde68a,#f59e0b 50%,#d97706)', rulerPct:100
  }
];

