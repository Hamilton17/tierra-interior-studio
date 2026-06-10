/* ═══════════════════════════════════════════════════════════════
   ECOSISTEMAS UI — Interfaz del Explorador de Ecosistemas
   Dependencias: ecosistemas-data.js, ecosistemas-viewer.js
═══════════════════════════════════════════════════════════════ */

let overlayCache = {};

// ═══════════════════════════════════════════════════════
//  CLIMA EN TIEMPO REAL — Open-Meteo (sin API key)
// ═══════════════════════════════════════════════════════
function wmoInfo(code) {
  if (code === 0)          return {icon:'☀️',  text:'Despejado'};
  if (code <= 2)           return {icon:'🌤️', text:'Mayormente despejado'};
  if (code === 3)          return {icon:'☁️',  text:'Nublado'};
  if (code <= 48)          return {icon:'🌫️', text:'Niebla'};
  if (code <= 55)          return {icon:'🌦️', text:'Llovizna'};
  if (code <= 65)          return {icon:'🌧️', text:'Lluvia'};
  if (code <= 77)          return {icon:'❄️',  text:'Nevada'};
  if (code <= 82)          return {icon:'🌦️', text:'Chubascos'};
  if (code <= 86)          return {icon:'❄️',  text:'Nieve'};
  if (code <= 99)          return {icon:'⛈️', text:'Tormenta'};
  return {icon:'🌡️', text:'Variable'};
}

function windDir(deg) {
  return ['N','NE','E','SE','S','SO','O','NO'][Math.round(deg / 45) % 8];
}

async function fetchWeather(lat, lon, blockId) {
  const block = document.getElementById(blockId);
  if (!block) return;
  try {
    const url = `https://api.open-meteo.com/v1/forecast`
      + `?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}`
      + `&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,cloud_cover`
      + `&wind_speed_unit=kmh&timezone=auto`;

    const res  = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const c    = data.current;
    const cond = wmoInfo(c.weather_code);
    const wd   = windDir(c.wind_direction_10m);
    const hora = new Date().toLocaleTimeString('es', {hour:'2-digit', minute:'2-digit'});

    block.innerHTML = `
      <div class="weather-main">
        <div class="weather-temp">${Math.round(c.temperature_2m)}°C</div>
        <div class="weather-cond">
          <div class="weather-cond-icon">${cond.icon}</div>
          <div class="weather-cond-text">${cond.text}</div>
        </div>
      </div>
      <div class="weather-grid">
        <div class="weather-stat">
          <span class="weather-stat-ico">💧</span>
          <div><span class="weather-stat-lbl">HUMEDAD</span><span class="weather-stat-val">${c.relative_humidity_2m}%</span></div>
        </div>
        <div class="weather-stat">
          <span class="weather-stat-ico">🌬️</span>
          <div><span class="weather-stat-lbl">VIENTO</span><span class="weather-stat-val">${Math.round(c.wind_speed_10m)} km/h ${wd}</span></div>
        </div>
        <div class="weather-stat">
          <span class="weather-stat-ico">☁️</span>
          <div><span class="weather-stat-lbl">NUBOSIDAD</span><span class="weather-stat-val">${c.cloud_cover}%</span></div>
        </div>
        <div class="weather-stat">
          <span class="weather-stat-ico">🌧️</span>
          <div><span class="weather-stat-lbl">PRECIPITACIÓN</span><span class="weather-stat-val">${c.precipitation} mm</span></div>
        </div>
      </div>
      <div class="weather-updated">⏱ Actualizado a las ${hora} · Open-Meteo</div>`;
  } catch(e) {
    if (block) block.innerHTML =
      `<div class="weather-error">⚠️ No se pudo obtener el clima en tiempo real</div>`;
  }
}

/* ── MODOS DE VISTA (satélite / biomas / temperatura / precipitación) */
function setViewMode(mode) {
  ['sat', 'bioma', 'temp', 'precip'].forEach(m => {
    document.getElementById('tab-' + m).classList.toggle('active', m === mode);
  });
  if (mode !== 'sat' && !overlayCache[mode]) overlayCache[mode] = buildOverlayCanvas(mode);
  setOverlay(mode, overlayCache[mode] || null);
  buildLegend(mode);
}

/* ── TOGGLE AUTO-ROTACIÓN ───────────────────────────────────── */
function toggleRotate() {
  isRotating = !isRotating;
  if (controls) controls.autoRotate = isRotating;
  document.getElementById('rotateBtn').classList.toggle('on', isRotating);
}

/* ── PANEL DERECHO — DETALLE DE BIOMA ───────────────────────── */
function selectBiome(key, lat, lon) {
  const b = BIOMES[key]; if (!b) return;
  const ns = lat >= 0 ? 'N' : 'S', ew = lon >= 0 ? 'E' : 'O';
  const coordStr = `${Math.abs(lat).toFixed(2)}°${ns}, ${Math.abs(lon).toFixed(2)}°${ew}`;
  const wxId = 'wx' + Date.now();

  document.getElementById('rightPanel').innerHTML = `
  <div class="biome-hero">
    <div class="biome-emoji-wrap" style="${b.bg}">${b.emoji}</div>
    <div class="biome-name-lg">${b.nombre}</div>
    <div class="biome-desc-sm">${b.desc}</div>
    <div class="biome-coords">📍 ${coordStr}</div>
    <div class="biome-tags">${b.tags.map(t => `<span class="biome-tag">${t}</span>`).join('')}</div>
  </div>

  <div class="stats-section">
    <div class="sec-title">
      <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
      Parámetros Climáticos
    </div>
    ${b.stats.map(s => `
    <div class="stat-bar-row">
      <div class="stat-bar-icon">${s.icon}</div>
      <div class="stat-bar-name">${s.name}</div>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${s.pct}%;background:linear-gradient(90deg,${s.g})"></div></div>
      <div class="stat-bar-val">${s.val}</div>
    </div>`).join('')}
  </div>

  <div class="weather-section">
    <div class="sec-title">
      <svg viewBox="0 0 24 24"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/></svg>
      Clima en Tiempo Real
    </div>
    <div id="${wxId}">
      <div class="weather-loading">
        <div class="weather-spinner"></div>
        Consultando clima actual…
      </div>
    </div>
  </div>

  <div class="species-section">
    <div class="sec-title">
      <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      Especies Representativas
    </div>
    <div class="species-grid">
      ${b.especies.map(sp => `
      <div class="species-card">
        <div class="species-emoji">${sp.e}</div>
        <div class="species-name">${sp.n}</div>
        <div class="species-role">${sp.r}</div>
      </div>`).join('')}
    </div>
  </div>

  <div class="datos-section">
    <div class="sec-title">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      ${b.datoLabel}
    </div>
    <div class="dato-box">
      <div class="dato-icon-wrap">${b.datoIcon}</div>
      <div>
        <div class="dato-label">${b.datoLabel}</div>
        <div class="dato-text">${b.dato}</div>
      </div>
    </div>
  </div>`;

  fetchWeather(lat, lon, wxId);
}
