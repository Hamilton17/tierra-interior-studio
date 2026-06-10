/* ═══════════════════════════════════════════════════════════════
   ECOSISTEMAS DATA — Datos de biomas, clasificación y overlays
   Consumido por: ecosistemas-viewer.js, ecosistemas-ui.js
═══════════════════════════════════════════════════════════════ */

/* ── DATOS DE BIOMAS ────────────────────────────────────────── */
const BIOMES = {
  selva: {
    nombre:'Selva Tropical', desc:'El pulmón verde del planeta, hogar del 50% de especies terrestres',
    emoji:'🌿', bg:'linear-gradient(135deg,#bbf7d0,#4ade80)',
    tags:['Alta humedad','>2,000 mm lluvia/año','Dosel denso','Suelo pobre'],
    stats:[
      {icon:'🌡',name:'Temperatura',  val:'25–30°C',    pct:85, g:'#f97316,#ef4444'},
      {icon:'💧',name:'Precipitación',val:'>2,000 mm',  pct:95, g:'#3b82f6,#06b6d4'},
      {icon:'🌿',name:'Biodiversidad',val:'Extrema',    pct:100,g:'#22c55e,#10b981'},
      {icon:'☀️',name:'Luz solar',    val:'Media',      pct:55, g:'#fbbf24,#f59e0b'},
    ],
    especies:[
      {e:'🦜',n:'Guacamayo Escarlata',r:'Ave bandera'},
      {e:'🐆',n:'Jaguar',            r:'Depredador apex'},
      {e:'🐸',n:'Rana Dardo',        r:'Anfibio tóxico'},
      {e:'🦥',n:'Perezoso',          r:'Herbívoro arbóreo'},
    ],
    dato:'Las selvas amazónicas producen el 20% del oxígeno del planeta y albergan más de 40,000 especies de plantas.',
    datoLabel:'Dato Ambiental', datoIcon:'🌬️'
  },
  bosque: {
    nombre:'Bosque Templado', desc:'Estaciones marcadas y rica biodiversidad estacional',
    emoji:'🌳', bg:'linear-gradient(135deg,#bbf7d0,#86efac)',
    tags:['4 estaciones','600–2,000 mm','Hojas caducas','Suelo rico'],
    stats:[
      {icon:'🌡',name:'Temperatura',  val:'5–20°C',       pct:55,g:'#22c55e,#16a34a'},
      {icon:'💧',name:'Precipitación',val:'600–2,000 mm', pct:65,g:'#3b82f6,#60a5fa'},
      {icon:'🌿',name:'Biodiversidad',val:'Alta',          pct:72,g:'#22c55e,#10b981'},
      {icon:'☀️',name:'Luz solar',    val:'Variable',      pct:60,g:'#fbbf24,#f59e0b'},
    ],
    especies:[
      {e:'🦌',n:'Ciervo Rojo',  r:'Herbívoro grande'},
      {e:'🦅',n:'Águila Calva', r:'Rapaz cumbre'},
      {e:'🐺',n:'Lobo Gris',   r:'Depredador social'},
      {e:'🦊',n:'Zorro Rojo',  r:'Omnívoro adaptable'},
    ],
    dato:'Los bosques templados de Europa y Norteamérica secuestran millones de toneladas de CO₂ cada año.',
    datoLabel:'Dato Climático', datoIcon:'🌲'
  },
  taiga: {
    nombre:'Taiga Boreal', desc:'El bosque más extenso del mundo, dominado por coníferas',
    emoji:'🌲', bg:'linear-gradient(135deg,#c7e8d8,#4d9060)',
    tags:['Inviernos extremos','-50°C mín','Permafrost parcial','Coníferas'],
    stats:[
      {icon:'🌡',name:'Temperatura',  val:'-50 a 20°C', pct:30,g:'#60a5fa,#3b82f6'},
      {icon:'💧',name:'Precipitación',val:'400–900 mm',  pct:42,g:'#3b82f6,#93c5fd'},
      {icon:'🌿',name:'Biodiversidad',val:'Moderada',    pct:45,g:'#4ade80,#22c55e'},
      {icon:'☀️',name:'Luz solar',    val:'Baja',        pct:35,g:'#fbbf24,#fde68a'},
    ],
    especies:[
      {e:'🐻',n:'Oso Pardo',      r:'Omnívoro hibernante'},
      {e:'🐈',n:'Lince de Canadá',r:'Felino boreal'},
      {e:'🦌',n:'Caribú',         r:'Migrador ártico'},
      {e:'🦉',n:'Búho Nival',     r:'Rapaz nocturna'},
    ],
    dato:'La taiga siberiana es el bosque continuo más grande de la Tierra, con más de 12 millones de km².',
    datoLabel:'Dato Boreal', datoIcon:'❄️'
  },
  tundra: {
    nombre:'Tundra Ártica', desc:'Paisaje sin árboles entre la taiga y los hielos perpetuos',
    emoji:'🏔️', bg:'linear-gradient(135deg,#e0f2fe,#bae6fd)',
    tags:['Permafrost','Invierno 9 meses','Vegetación baja','Vientos fuertes'],
    stats:[
      {icon:'🌡',name:'Temperatura',  val:'-40 a 10°C',pct:20,g:'#93c5fd,#60a5fa'},
      {icon:'💧',name:'Precipitación',val:'<250 mm',   pct:18,g:'#bae6fd,#93c5fd'},
      {icon:'🌿',name:'Biodiversidad',val:'Baja',       pct:22,g:'#86efac,#4ade80'},
      {icon:'☀️',name:'Luz solar',    val:'Muy baja',  pct:20,g:'#fde68a,#fbbf24'},
    ],
    especies:[
      {e:'🐺',n:'Lobo Ártico',  r:'Depredador boreal'},
      {e:'🦊',n:'Zorro Ártico', r:'Superviviente polar'},
      {e:'🦉',n:'Búho Nival',   r:'Rapaz invernal'},
      {e:'🌾',n:'Pasto Ártico', r:'Planta base'},
    ],
    dato:'El permafrost almacena el doble de carbono que toda la atmósfera terrestre. Su deshielo es una alarma climática global.',
    datoLabel:'Dato Polar', datoIcon:'🌡'
  },
  desierto: {
    nombre:'Desierto', desc:'Regiones áridas con menos de 250 mm de lluvia al año',
    emoji:'🏜️', bg:'linear-gradient(135deg,#fef3c7,#fbbf24)',
    tags:['<250 mm lluvia','Temperaturas extremas','Alta evaporación','Suelo pobre'],
    stats:[
      {icon:'🌡',name:'Temperatura',  val:'-5 a 55°C', pct:90, g:'#f97316,#ef4444'},
      {icon:'💧',name:'Precipitación',val:'<250 mm',   pct:8,  g:'#93c5fd,#bae6fd'},
      {icon:'🌿',name:'Biodiversidad',val:'Baja',       pct:20, g:'#86efac,#4ade80'},
      {icon:'☀️',name:'Luz solar',    val:'Extrema',   pct:100,g:'#fbbf24,#f59e0b'},
    ],
    especies:[
      {e:'🐪',n:'Dromedario',          r:'Adaptado al calor'},
      {e:'🦎',n:'Lagarto del Desierto',r:'Reptil termófilo'},
      {e:'🦂',n:'Escorpión',           r:'Depredador nocturno'},
      {e:'🌵',n:'Saguaro',             r:'Cactus gigante'},
    ],
    dato:'El Sahara fue un savana verde hace 6,000 años. La propia Tierra puede transformar paisajes radicalmente.',
    datoLabel:'Dato Árido', datoIcon:'☀️'
  },
  sabana: {
    nombre:'Sabana', desc:'Praderas tropicales con árboles dispersos y estaciones secas y húmedas',
    emoji:'🌾', bg:'linear-gradient(135deg,#fef3c7,#fde68a)',
    tags:['Estación seca','500–1,500 mm','Pastos altos','Megafauna'],
    stats:[
      {icon:'🌡',name:'Temperatura',  val:'20–35°C',      pct:78,g:'#f59e0b,#f97316'},
      {icon:'💧',name:'Precipitación',val:'500–1,500 mm', pct:48,g:'#3b82f6,#93c5fd'},
      {icon:'🌿',name:'Biodiversidad',val:'Alta',          pct:78,g:'#22c55e,#4ade80'},
      {icon:'☀️',name:'Luz solar',    val:'Alta',          pct:85,g:'#fbbf24,#f59e0b'},
    ],
    especies:[
      {e:'🦒',n:'Jirafa',  r:'Herbívoro gigante'},
      {e:'🦁',n:'León',    r:'Depredador apex'},
      {e:'🐘',n:'Elefante',r:'Ingeniero del hábitat'},
      {e:'🦓',n:'Cebra',   r:'Migrador en manadas'},
    ],
    dato:'La Gran Migración del Serengeti involucra 1.5 millones de ñus en un recorrido circular de 1,800 km.',
    datoLabel:'Dato Salvaje', datoIcon:'🌍'
  },
  polar: {
    nombre:'Región Polar', desc:'Casquetes de hielo y tundra permanente en los extremos del planeta',
    emoji:'🧊', bg:'linear-gradient(135deg,#e0f2fe,#bfdbfe)',
    tags:['Hielo permanente','Polar extremo','Sin árboles','Sol de medianoche'],
    stats:[
      {icon:'🌡',name:'Temperatura',  val:'-90 a 0°C', pct:5, g:'#bfdbfe,#93c5fd'},
      {icon:'💧',name:'Precipitación',val:'<100 mm',   pct:6, g:'#dbeafe,#bfdbfe'},
      {icon:'🌿',name:'Biodiversidad',val:'Muy baja',  pct:12,g:'#bbf7d0,#86efac'},
      {icon:'☀️',name:'Luz solar',    val:'Mínima',    pct:10,g:'#fef9c3,#fde68a'},
    ],
    especies:[
      {e:'🐧',n:'Pingüino Emperador',  r:'Ave no voladora polar'},
      {e:'🐻',n:'Oso Polar',           r:'Depredador ártico'},
      {e:'🦭',n:'Foca de Weddell',     r:'Mamífero marino'},
      {e:'🐳',n:'Ballena de Groenlandia',r:'Cetáceo polar'},
    ],
    dato:'La Antártida contiene el 70% del agua dulce de la Tierra. Si se derritiera, los océanos subirían 58 metros.',
    datoLabel:'Dato Polar', datoIcon:'🧊'
  },
  matorral: {
    nombre:'Matorral Mediterráneo', desc:'Vegetación adaptada a veranos secos e inviernos suaves',
    emoji:'🌿', bg:'linear-gradient(135deg,#ecfccb,#d9f99d)',
    tags:['Verano seco','Invierno suave','Fuego frecuente','Alta endemicidad'],
    stats:[
      {icon:'🌡',name:'Temperatura',  val:'10–35°C',   pct:65,g:'#f59e0b,#84cc16'},
      {icon:'💧',name:'Precipitación',val:'300–700 mm',pct:35,g:'#3b82f6,#93c5fd'},
      {icon:'🌿',name:'Biodiversidad',val:'Alta',       pct:80,g:'#84cc16,#22c55e'},
      {icon:'☀️',name:'Luz solar',    val:'Alta',       pct:80,g:'#fbbf24,#f59e0b'},
    ],
    especies:[
      {e:'🦅',n:'Águila Real',r:'Rapaz dominante'},
      {e:'🦎',n:'Lagartija',  r:'Reptil endémico'},
      {e:'🌸',n:'Lavanda',    r:'Planta aromática'},
      {e:'🐇',n:'Conejo Europeo',r:'Herbívoro base'},
    ],
    dato:'Ocupa el 2% de la superficie terrestre pero alberga el 20% de las especies vegetales del planeta.',
    datoLabel:'Dato Botánico', datoIcon:'🌸'
  },
  oceano: {
    nombre:'Océano', desc:'Cubre el 71% de la Tierra y regula el clima global',
    emoji:'🌊', bg:'linear-gradient(135deg,#dbeafe,#60a5fa)',
    tags:['Profundidades >11km','~97% del agua','Generador de oxígeno','Regulador térmico'],
    stats:[
      {icon:'🌡',name:'Temperatura',      val:'-2 a 30°C', pct:50,g:'#3b82f6,#06b6d4'},
      {icon:'💧',name:'Profundidad med.', val:'3,688 m',   pct:75,g:'#2563eb,#1d4ed8'},
      {icon:'🌿',name:'Biodiversidad',    val:'Inmensa',   pct:90,g:'#22c55e,#16a34a'},
      {icon:'☀️',name:'Penetración luz',  val:'200 m max', pct:30,g:'#fbbf24,#93c5fd'},
    ],
    especies:[
      {e:'🐋',n:'Ballena Azul',      r:'Ser más grande Tierra'},
      {e:'🦈',n:'Gran Tiburón Blanco',r:'Depredador apex'},
      {e:'🐙',n:'Calamar Gigante',   r:'Cefalópodo abismal'},
      {e:'🐠',n:'Pez Payaso',        r:'Simbionte anémona'},
    ],
    dato:'El océano ha absorbido el 90% del calor extra generado por el cambio climático y el 25% de las emisiones de CO₂ humanas.',
    datoLabel:'Dato Oceánico', datoIcon:'🌊'
  },
};

/* ── CLASIFICACIÓN DE BIOMA POR COORDENADAS ─────────────────── */
function getBiome(lat, lon) {
  /* ── POLAR ────────────────────────────────────────────── */
  if (lat > 83 || lat < -80) return 'polar';
  if (lat < -65) return 'polar';
  if (lat > 75) return 'tundra';

  /* ── TUNDRA ───────────────────────────────────────────── */
  if (lat >= 67 && lat <= 75) return 'tundra';
  if (lat >= 63 && lat <= 70 && lon >= -25 && lon <= -13) return 'tundra'; // Islandia
  if (lat >= 65 && lat <= 70 && lon >= -168 && lon <= -140) return 'tundra'; // Alaska N

  /* ── TAIGA ────────────────────────────────────────────── */
  if (lat >= 50 && lat <= 67 && lon >= 55 && lon <= 168) return 'taiga';   // Siberia
  if (lat >= 48 && lat <= 67 && lon >= -145 && lon <= -58) return 'taiga'; // Canadá boreal
  if (lat >= 58 && lat <= 70 && lon >= 5 && lon <= 32) return 'taiga';     // Escandinavia

  /* ══════════ NORTEAMÉRICA ══════════════════════════════ */
  // Bosque templado este/oeste
  if (lat >= 25 && lat <= 50 && lon >= -95 && lon <= -60) return 'bosque';
  if (lat >= 42 && lat <= 55 && lon >= -130 && lon <= -114) return 'bosque';
  // Great Plains / pradera
  if (lat >= 30 && lat <= 50 && lon >= -110 && lon <= -95) return 'sabana';
  // Desiertos (Sonora, Chihuahua, Mohave, Gran Cuenca)
  if (lat >= 22 && lat <= 38 && lon >= -118 && lon <= -100) return 'desierto';
  // Costa Pacífico – matorral mediterráneo
  if (lat >= 32 && lat <= 42 && lon >= -125 && lon <= -116) return 'matorral';
  // México tropical (interior)
  if (lat >= 15 && lat <= 25 && lon >= -105 && lon <= -86) return 'selva';
  // México norte (seco)
  if (lat >= 25 && lat <= 32 && lon >= -115 && lon <= -95) return 'desierto';
  // Centroamérica y Caribe continental
  if (lat >= 5 && lat <= 22 && lon >= -92 && lon <= -76) return 'selva';
  // Islas del Caribe
  if (lat >= 10 && lat <= 24 && lon >= -85 && lon <= -58) return 'selva';

  /* ══════════ SUDAMÉRICA ════════════════════════════════ */
  // Amazonía + Cuenca del Orinoco
  if (lat >= -15 && lat <= 10 && lon >= -80 && lon <= -45) return 'selva';
  // Colombia / Venezuela (llanos)
  if (lat >= 5 && lat <= 12 && lon >= -75 && lon <= -60) return 'sabana';
  // Cerrado brasileño
  if (lat >= -25 && lat <= -5 && lon >= -60 && lon <= -38) return 'sabana';
  // Selva Atlántica / SE Brasil
  if (lat >= -32 && lat <= -20 && lon >= -54 && lon <= -40) return 'bosque';
  // Pampas argentinas
  if (lat >= -40 && lat <= -28 && lon >= -66 && lon <= -48) return 'sabana';
  // Atacama / Patagonia árida
  if (lat >= -30 && lat <= -18 && lon >= -74 && lon <= -66) return 'desierto';
  // Patagonia sur / Tierra del Fuego
  if (lat >= -56 && lat <= -40 && lon >= -76 && lon <= -62) return 'tundra';
  // Chile central mediterráneo
  if (lat >= -40 && lat <= -28 && lon >= -75 && lon <= -68) return 'matorral';
  // Andes tropicales (vertiente oriental)
  if (lat >= -20 && lat <= 5 && lon >= -80 && lon <= -72) return 'selva';

  /* ══════════ EUROPA ════════════════════════════════════ */
  // Mediterráneo europeo
  if (lat >= 33 && lat <= 46 && lon >= -10 && lon <= 36) return 'matorral';
  // Bosque templado
  if (lat >= 44 && lat <= 62 && lon >= -12 && lon <= 32) return 'bosque';
  if (lat >= 44 && lat <= 58 && lon >= 32 && lon <= 55) return 'bosque';
  // Estepa póntica (Ucrania, Kazajistán O)
  if (lat >= 42 && lat <= 52 && lon >= 30 && lon <= 55) return 'sabana';

  /* ══════════ ÁFRICA ════════════════════════════════════ */
  // Sahara
  if (lat >= 15 && lat <= 35 && lon >= -17 && lon <= 37) return 'desierto';
  // Desierto de Arabia / Cuerno de África
  if (lat >= 8 && lat <= 32 && lon >= 37 && lon <= 60) return 'desierto';
  // Kalahari / Namib
  if (lat >= -30 && lat <= -18 && lon >= 11 && lon <= 22) return 'desierto';
  // Costa N de África mediterránea
  if (lat >= 30 && lat <= 37 && lon >= -6 && lon <= 14) return 'matorral';
  // Sahel
  if (lat >= 10 && lat <= 17 && lon >= -17 && lon <= 38) return 'sabana';
  // Bosque guineo-congoleño
  if (lat >= -5 && lat <= 10 && lon >= -16 && lon <= 30) return 'selva';
  // Cuenca del Congo
  if (lat >= -8 && lat <= 4 && lon >= 12 && lon <= 32) return 'selva';
  // África oriental (sabana)
  if (lat >= -20 && lat <= 10 && lon >= 28 && lon <= 42) return 'sabana';
  // Selva madagascareña E
  if (lat >= -26 && lat <= -12 && lon >= 44 && lon <= 52) return 'selva';
  // África sur (sabana)
  if (lat >= -35 && lat <= -20 && lon >= 16 && lon <= 38) return 'sabana';
  // Cabo mediterráneo sudafricano
  if (lat >= -36 && lat <= -28 && lon >= 16 && lon <= 26) return 'matorral';

  /* ══════════ ASIA ══════════════════════════════════════ */
  // Península arábiga + Mesopotamia
  if (lat >= 12 && lat <= 35 && lon >= 36 && lon <= 60) return 'desierto';
  // Irán / Pakistán seco
  if (lat >= 25 && lat <= 40 && lon >= 52 && lon <= 68) return 'desierto';
  // Gobi + Asia central árida
  if (lat >= 38 && lat <= 50 && lon >= 88 && lon <= 122) return 'desierto';
  // Estepa Asia central
  if (lat >= 40 && lat <= 55 && lon >= 52 && lon <= 90) return 'sabana';
  // India sur tropical
  if (lat >= 8 && lat <= 22 && lon >= 68 && lon <= 88) return 'selva';
  // India norte / Himalaya templado
  if (lat >= 22 && lat <= 32 && lon >= 70 && lon <= 92) return 'bosque';
  // Indochina / Myanmar / Tailandia
  if (lat >= 5 && lat <= 22 && lon >= 92 && lon <= 108) return 'selva';
  // SE Asiático insular (Borneo, Sumatra, Java)
  if (lat >= -8 && lat <= 8 && lon >= 95 && lon <= 141) return 'selva';
  // Filipinas + Papua
  if (lat >= -10 && lat <= 20 && lon >= 118 && lon <= 155) return 'selva';
  // China sur / subtropical
  if (lat >= 20 && lat <= 32 && lon >= 100 && lon <= 122) return 'bosque';
  // China este / Corea / Japón templado
  if (lat >= 30 && lat <= 46 && lon >= 118 && lon <= 148) return 'bosque';
  // China norte / Mongolia estepa
  if (lat >= 38 && lat <= 50 && lon >= 105 && lon <= 122) return 'sabana';
  // Siberia este / taiga
  if (lat >= 48 && lat <= 58 && lon >= 130 && lon <= 145) return 'taiga';
  // Caucaso / Turquía / Creciente Fértil
  if (lat >= 36 && lat <= 46 && lon >= 26 && lon <= 52) return 'matorral';
  // Asia menor interior (seco)
  if (lat >= 36 && lat <= 42 && lon >= 30 && lon <= 44) return 'desierto';

  /* ══════════ OCEANÍA ═══════════════════════════════════ */
  // Australia interior / outback
  if (lat >= -35 && lat <= -18 && lon >= 114 && lon <= 142) return 'desierto';
  // Australia N (sabana tropical)
  if (lat >= -20 && lat <= -10 && lon >= 126 && lon <= 138) return 'sabana';
  // Australia NE tropical
  if (lat >= -20 && lat <= -10 && lon >= 138 && lon <= 150) return 'selva';
  // Australia SE (bosque / matorral)
  if (lat >= -38 && lat <= -28 && lon >= 140 && lon <= 153) return 'bosque';
  // SO Australia mediterráneo
  if (lat >= -36 && lat <= -28 && lon >= 113 && lon <= 122) return 'matorral';
  // Nueva Zelanda
  if (lat >= -47 && lat <= -34 && lon >= 165 && lon <= 180) return 'bosque';
  // PNG
  if (lat >= -10 && lat <= 0 && lon >= 130 && lon <= 152) return 'selva';

  return 'oceano';
}

/* ── PALETA Y CANVAS DE OVERLAY ─────────────────────────────── */
const PALETTE = {
  selva:[26,95,45], bosque:[60,128,50], taiga:[45,92,60], tundra:[140,165,112],
  desierto:[210,168,65], sabana:[168,145,82], polar:[208,228,245],
  matorral:[118,150,62], oceano:null
};

function buildOverlayCanvas(mode) {
  const W = 1024, H = 512, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(W, H);
  const d = img.data;
  for (let py = 0; py < H; py++) {
    const lat = 90 - (py / H) * 180;
    for (let px = 0; px < W; px++) {
      const lon = (px / W) * 360 - 180;
      const bk = getBiome(lat, lon);
      let r, g, b, a = 200;
      if (mode === 'bioma') {
        const p = PALETTE[bk]; if (!p) { a = 0; r = g = b = 0; } else { [r, g, b] = p; }
      } else if (mode === 'temp') {
        if (bk === 'oceano') { a = 0; r = g = b = 0; } else {
          const tMap = { polar:0, tundra:.1, taiga:.2, bosque:.5, matorral:.65, sabana:.78, desierto:.95, selva:.85 };
          const t = tMap[bk] || .5;
          r = Math.round(60 + t * 195); g = Math.round(180 - t * 140); b = Math.round(220 - t * 210); a = 185;
        }
      } else {
        if (bk === 'oceano') { a = 0; r = g = b = 0; } else {
          const pMap = { selva:1, bosque:.65, taiga:.4, tundra:.2, desierto:.05, sabana:.48, polar:.08, matorral:.32 };
          const p = pMap[bk] || .5;
          r = Math.round(220 - p * 170); g = Math.round(130 + p * 70); b = Math.round(50 + p * 160); a = 180;
        }
      }
      const i = (py * W + px) * 4; d[i] = r; d[i+1] = g; d[i+2] = b; d[i+3] = a;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/* ── LEYENDA DEL MAPA ───────────────────────────────────────── */
const LEGEND_BIOMA = [
  {label:'Selva',    col:'#1a5f2d'}, {label:'Bosque',   col:'#3c8032'},
  {label:'Taiga',    col:'#2d5c3c'}, {label:'Tundra',   col:'#8ca570'},
  {label:'Desierto', col:'#d2a841'}, {label:'Sabana',   col:'#a89152'},
  {label:'Polar',    col:'#d0e4f5'}, {label:'Matorral', col:'#76963e'},
];

function buildLegend(mode) {
  const bar = document.getElementById('legendBar');
  if (mode === 'temp') {
    bar.innerHTML = '<div class="legend-item"><div class="legend-swatch" style="width:70px;background:linear-gradient(90deg,#3b82f6,#22c55e,#f59e0b,#ef4444)"></div>&nbsp;Frío → Caliente</div>';
    return;
  }
  if (mode === 'precip') {
    bar.innerHTML = '<div class="legend-item"><div class="legend-swatch" style="width:70px;background:linear-gradient(90deg,#fbbf24,#86efac,#3b82f6)"></div>&nbsp;Seco → Húmedo</div>';
    return;
  }
  if (mode === 'sat') {
    bar.innerHTML = '<div class="legend-item" style="color:rgba(255,255,255,.5)">🛰 Imágenes satelitales ESRI/Earthstar Geographics · Haz clic en cualquier punto para identificar el bioma</div>';
    return;
  }
  bar.innerHTML = LEGEND_BIOMA.map(l =>
    `<div class="legend-item"><div class="legend-swatch" style="background:${l.col}"></div>${l.label}</div>`
  ).join('');
}
