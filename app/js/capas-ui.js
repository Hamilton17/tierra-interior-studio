/* ═══════════════════════════════════════════════════════════════
   CAPAS UI — Interfaz del Explorador de Capas
   Dependencias: capas-data.js, capas-viewer.js
   Datos ricos: /app-assets/capas/datos.json
═══════════════════════════════════════════════════════════════ */

let currentIdx  = 3;
let DATOS       = null;   /* datos.json completo */
let compareIdxA = null;
let compareIdxB = null;

/* ── CARGA DE DATOS RICOS ───────────────────────────────────── */
async function loadDatos() {
  try {
    const ids = LAYERS.map(l => l.id);
    const results = await Promise.all(
      ids.map(id => fetch(`/app-assets/capas/${id}/datos/datos.json`).then(r => r.ok ? r.json() : null))
    );
    DATOS = { capas: results.filter(Boolean) };
  } catch (_) { /* seguimos con datos básicos si falla */ }
}

/* ── LISTA DE CAPAS (PANEL IZQUIERDO) ───────────────────────── */
function buildLayerList() {
  let html = '', lastG = '';
  LAYERS.forEach((l, i) => {
    if (l.grupo !== lastG) {
      html += `<div class="group-label">${l.grupo}</div>`;
      lastG = l.grupo;
    }
    html += `
      <div class="layer-item${i === currentIdx ? ' active' : ''}" onclick="selectLayer(${i})">
        <div class="layer-swatch" style="${l.sw}">${l.emoji}</div>
        <div>
          <div class="layer-name">${l.nombre}</div>
          <div class="layer-depth">${l.depth}</div>
          <div class="layer-badges">
            <span class="layer-badge badge-temp">${l.bTemp}</span>
            <span class="layer-badge badge-state">${l.bState}</span>
            ${l.bThick ? `<span class="layer-badge badge-thick">${l.bThick}</span>` : ''}
          </div>
        </div>
      </div>`;
  });
  document.getElementById('layerList').innerHTML = html;
}

/* ── PANEL DERECHO CON DETALLE COMPLETO ─────────────────────── */
function buildRightPanel(l) {
  const d = DATOS ? DATOS.capas.find(c => c.id === l.id) : null;
  const minerales = d ? buildMineralesHTML(d.composicion.minerales) : '';
  const quiz      = d ? buildQuizHTML(d.quiz) : '';

  document.getElementById('rightPanel').innerHTML = `
  <div class="ilustracion-section"
       style="background-image:url('/app-assets/capas/${l.id}/ilustraciones/perfil.svg')">
  </div>
  <div class="detail-top">
    <div class="layer-avatar" style="${l.avatarBg}">${l.emoji}</div>
    <div class="layer-name-lg">${l.nombre}</div>
    <div class="layer-desc-sm">${l.depth}</div>
    <div class="detail-grid">
      <div class="detail-item">
        <div class="detail-icon"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
        <div class="detail-label">Profundidad</div>
        <div class="detail-value">${l.profundidad}</div>
      </div>
      <div class="detail-item">
        <div class="detail-icon"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/></svg></div>
        <div class="detail-label">Grosor</div>
        <div class="detail-value">${l.grosor}</div>
      </div>
      <div class="detail-item">
        <div class="detail-icon"><svg viewBox="0 0 24 24"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg></div>
        <div class="detail-label">Temperatura</div>
        <div class="detail-value">${l.temp}</div>
      </div>
      <div class="detail-item">
        <div class="detail-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
        <div class="detail-label">Estado</div>
        <div class="detail-value">${l.estado}</div>
      </div>
    </div>
  </div>

  <div class="pbar-section">
    <div class="pbar-row">
      <div class="pbar-name">Presión</div>
      <div class="pbar-track"><div class="pbar-fill" style="width:${l.pres.pct}%;background:linear-gradient(90deg,${l.pres.g})"></div></div>
      <div class="pbar-val">${l.pres.val}</div>
    </div>
    <div class="pbar-row">
      <div class="pbar-name">Densidad</div>
      <div class="pbar-track"><div class="pbar-fill" style="width:${l.dens.pct}%;background:linear-gradient(90deg,${l.dens.g})"></div></div>
      <div class="pbar-val">${l.dens.val}</div>
    </div>
    <div class="pbar-row">
      <div class="pbar-name">Volumen</div>
      <div class="pbar-track"><div class="pbar-fill" style="width:${l.vol.pct}%;background:linear-gradient(90deg,${l.vol.g})"></div></div>
      <div class="pbar-val">${l.vol.val}</div>
    </div>
  </div>

  ${minerales}

  <div class="notes-section">
    <div class="section-title">
      <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      Descripción Geológica
    </div>
    <div class="notes-text">${d ? d.descripcion_larga : l.desc}</div>
    <div class="fact-box">
      <div class="fact-icon">⚡</div>
      <div>
        <div class="fact-label">${l.datoLabel}</div>
        <div class="fact-text">${l.dato}</div>
      </div>
    </div>
  </div>

  ${d && d.descubrimiento_historico ? buildDescubrimientoHTML(d.descubrimiento_historico) : ''}
  ${quiz}`;
}

function buildMineralesHTML(minerales) {
  if (!minerales || !minerales.length) return '';
  const bars = minerales.map(m => `
    <div class="mineral-row">
      <div class="mineral-dot" style="background:${m.color}"></div>
      <div class="mineral-name">${m.nombre}</div>
      <div class="mineral-formula">${m.formula}</div>
      <div class="mineral-bar-wrap">
        <div class="mineral-bar" style="width:${m.porcentaje}%;background:${m.color === '#f5f0e8' ? '#c0b870' : m.color}"></div>
      </div>
      <div class="mineral-pct">${m.porcentaje}%</div>
    </div>`).join('');
  return `
  <div class="minerals-section">
    <div class="section-title">
      <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      Composición Mineral
    </div>
    ${bars}
  </div>`;
}

function buildDescubrimientoHTML(d) {
  return `
  <div class="discovery-section">
    <div class="section-title">
      <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      Descubrimiento
    </div>
    <div class="discovery-box">
      <div class="disc-year">${d.año}</div>
      <div class="disc-info">
        <div class="disc-name">${d.cientifico} · ${d.pais}</div>
        <div class="disc-limit">${d.nombre_limite}</div>
        <div class="disc-note">${d.curiosidad}</div>
      </div>
    </div>
  </div>`;
}

function buildQuizHTML(quiz) {
  if (!quiz || !quiz.length) return '';
  const q = quiz[Math.floor(Math.random() * quiz.length)];
  const opciones = [q.respuesta_correcta, ...q.incorrectas]
    .sort(() => Math.random() - 0.5)
    .map(op => `<button class="quiz-opt" onclick="checkQuiz(this,'${op.replace(/'/g,"\\'")}','${q.respuesta_correcta.replace(/'/g,"\\'")}')">${op}</button>`)
    .join('');
  return `
  <div class="quiz-section">
    <div class="section-title">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      ¿Lo sabías?
    </div>
    <div class="quiz-q">${q.pregunta}</div>
    <div class="quiz-opts">${opciones}</div>
    <div class="quiz-feedback" id="quizFeedback"></div>
  </div>`;
}

/* ── QUIZ INTERACTIVO ────────────────────────────────────────── */
function checkQuiz(btn, selected, correct) {
  const opts = btn.closest('.quiz-opts').querySelectorAll('.quiz-opt');
  opts.forEach(b => {
    b.disabled = true;
    if (b.textContent === correct)  b.classList.add('quiz-correct');
    if (b === btn && selected !== correct) b.classList.add('quiz-wrong');
  });
  const fb = document.getElementById('quizFeedback');
  if (fb) fb.textContent = selected === correct ? '✓ ¡Correcto!' : `✗ Era: ${correct}`;
}

/* ── GALERÍA DINÁMICA DE FENÓMENOS ──────────────────────────── */
function updateGallery(layerId) {
  const galleryGrid = document.querySelector('.gallery-grid');
  if (!galleryGrid || !DATOS) return;
  const d = DATOS.capas.find(c => c.id === layerId);
  if (!d || !d.fenomenos_asociados) return;

  galleryGrid.innerHTML = d.fenomenos_asociados.map((f, i) => `
    <div class="gallery-item" data-desc="${f.descripcion.replace(/"/g,'&quot;')}"
         onclick="selectGalleryItem(this)">
      <div class="gallery-img" style="background:${f.bg}">${f.emoji}</div>
      <div class="gallery-label">${f.nombre}</div>
    </div>`).join('');

  let descBox = galleryGrid.parentElement.querySelector('.gallery-active-desc');
  if (!descBox) {
    descBox = document.createElement('div');
    descBox.className = 'gallery-active-desc';
    galleryGrid.parentElement.appendChild(descBox);
  }
  descBox.textContent = 'Selecciona un fenómeno para ver su descripción.';
}

function selectGalleryItem(el) {
  document.querySelectorAll('.gallery-item').forEach(i => i.classList.remove('active-gallery'));
  el.classList.add('active-gallery');
  const box = el.closest('.mini-card').querySelector('.gallery-active-desc');
  if (box) box.textContent = el.dataset.desc;
}

/* ── COMPARACIÓN DE CAPAS ────────────────────────────────────── */
function setCompareSlot(idx) {
  compareIdxA = idx;
  const chipA = document.getElementById('chipA');
  chipA.textContent = LAYERS[idx].emoji + ' ' + LAYERS[idx].nombre;
  chipA.classList.add('filled');
  if (compareIdxB === idx) {
    compareIdxB = null;
    const chipB = document.getElementById('chipB');
    chipB.textContent = '⭐ Elegir...';
    chipB.classList.remove('filled');
  }
}

function pickCompareB() {
  const existing = document.getElementById('compareBPicker');
  if (existing) { existing.remove(); return; }
  const chipB = document.getElementById('chipB');
  const rect  = chipB.getBoundingClientRect();
  const picker = document.createElement('div');
  picker.id = 'compareBPicker';
  picker.className = 'compare-picker';
  picker.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.top - 4}px;transform:translateY(-100%);z-index:9999;min-width:${rect.width}px`;
  picker.innerHTML = LAYERS
    .map((l, i) => i !== compareIdxA
      ? `<div class="picker-opt" onclick="selectCompareB(${i})">${l.emoji} ${l.nombre}</div>`
      : '')
    .join('');
  document.body.appendChild(picker);
  setTimeout(() => {
    document.addEventListener('click', function closePicker(e) {
      if (!picker.contains(e.target) && e.target.id !== 'chipB') {
        picker.remove();
        document.removeEventListener('click', closePicker);
      }
    });
  }, 0);
}

function selectCompareB(idx) {
  compareIdxB = idx;
  const chipB = document.getElementById('chipB');
  chipB.textContent = LAYERS[idx].emoji + ' ' + LAYERS[idx].nombre;
  chipB.classList.add('filled');
  document.getElementById('compareBPicker')?.remove();
}

function openComparacion() {
  if (compareIdxA === null || compareIdxB === null) {
    alert('Elige una segunda capa haciendo clic en "⭐ Elegir..."');
    return;
  }
  showCompareModal(compareIdxA, compareIdxB);
}

function showCompareModal(idxA, idxB) {
  const lA = LAYERS[idxA], lB = LAYERS[idxB];
  const dA = DATOS ? DATOS.capas.find(c => c.id === lA.id) : null;
  const dB = DATOS ? DATOS.capas.find(c => c.id === lB.id) : null;
  const mat = DATOS ? DATOS.comparacion_matriz : null;

  const filas = [
    { label: 'Temperatura',  valA: lA.temp,    valB: lB.temp    },
    { label: 'Grosor',       valA: lA.grosor,  valB: lB.grosor  },
    { label: 'Profundidad',  valA: lA.profundidad, valB: lB.profundidad },
    { label: 'Densidad',     valA: lA.dens.val, valB: lB.dens.val },
    { label: 'Presión',      valA: lA.pres.val, valB: lB.pres.val },
    { label: 'Estado',       valA: lA.estado,  valB: lB.estado  },
    { label: 'Roca principal', valA: dA ? dA.composicion.tipo_roca_principal : '—', valB: dB ? dB.composicion.tipo_roca_principal : '—' },
    { label: 'Vel. Onda P',  valA: dA ? dA.propiedades_fisicas.velocidad_onda_P_km_s + ' km/s' : '—', valB: dB ? dB.propiedades_fisicas.velocidad_onda_P_km_s + ' km/s' : '—' },
  ];

  const rows = filas.map(f => `
    <tr>
      <td class="cmp-label">${f.label}</td>
      <td class="cmp-a">${f.valA}</td>
      <td class="cmp-b">${f.valB}</td>
    </tr>`).join('');

  let barras = '';
  if (mat) {
    const vA = mat.valores[lA.id], vB = mat.valores[lB.id];
    barras = mat.ejes.map(eje => {
      const pA = Math.round((vA[eje.id] / eje.max) * 100);
      const pB = Math.round((vB[eje.id] / eje.max) * 100);
      return `
      <div class="cmp-bar-row">
        <div class="cmp-bar-label">${eje.label}</div>
        <div class="cmp-bar-track">
          <div class="cmp-bar-fill cmp-bar-a" style="width:${pA}%"></div>
        </div>
        <div class="cmp-bar-track">
          <div class="cmp-bar-fill cmp-bar-b" style="width:${pB}%"></div>
        </div>
      </div>`;
    }).join('');
  }

  const existing = document.getElementById('compareModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'compareModal';
  modal.className = 'compare-modal-overlay';
  modal.innerHTML = `
    <div class="compare-modal">
      <div class="cmp-header">
        <div class="cmp-col-a"><span>${lA.emoji}</span> ${lA.nombre}</div>
        <div class="cmp-vs">VS</div>
        <div class="cmp-col-b"><span>${lB.emoji}</span> ${lB.nombre}</div>
        <button class="cmp-close" onclick="document.getElementById('compareModal').remove()">✕</button>
      </div>
      ${barras ? `<div class="cmp-bars-legend"><span class="cmp-leg-a">■ ${lA.nombre}</span><span class="cmp-leg-b">■ ${lB.nombre}</span></div><div class="cmp-bars">${barras}</div>` : ''}
      <table class="cmp-table">
        <thead><tr><th>Propiedad</th><th>${lA.emoji} ${lA.nombre}</th><th>${lB.emoji} ${lB.nombre}</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

/* ── SELECCIÓN DE CAPA ───────────────────────────────────────── */
function selectLayer(idx) {
  currentIdx = idx;
  const l = LAYERS[idx];
  document.querySelectorAll('.layer-item').forEach((el, i) => el.classList.toggle('active', i === idx));
  document.getElementById('viewerTitle').textContent = l.nombre;
  document.getElementById('pillThick').textContent   = l.grosor + ' de grosor';
  document.getElementById('pillState').textContent   = 'Estado ' + l.estado;
  document.getElementById('rulerMarker').style.left  = l.rulerPct + '%';
  setCompareSlot(idx);
  buildRightPanel(l);
  updateGallery(l.id);
  highlight3D(idx);
}

/* ── CONTROLES DE NAVEGACIÓN Y VISTA ────────────────────────── */
function navigateLayer(d) { selectLayer((currentIdx + d + LAYERS.length) % LAYERS.length); }

function setMode(btn) {
  btn.closest('.mode-tabs').querySelectorAll('.mode-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const txt = btn.textContent.trim();
  const mode = txt === 'Corte' ? 'corte' : txt === '360°' ? '360' : 'ondas';
  if (typeof applyViewMode3D === 'function') applyViewMode3D(mode);
}

function setViewMode(btn) {
  btn.closest('.view-modes').querySelectorAll('.view-mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const txt = btn.textContent.trim();
  const mode = txt.includes('tectón') ? 'placas' : txt.includes('errem') ? 'terremotos' : 'none';
  if (typeof applyOverlay3D === 'function') applyOverlay3D(mode);
}

function zoomCam(dir) {
  if (!camera) return;
  const d = camera.position.length() + dir;
  camera.position.setLength(Math.max(3, Math.min(12, d)));
}

function resetCam() {
  if (!camera || !controls) return;
  camera.position.set(2, 1.2, 5.5);
  controls.target.set(0, 0, 0);
  controls.update();
}

/* ── ARRANQUE ───────────────────────────────────────────────── */
buildLayerList();
document.addEventListener('DOMContentLoaded', async () => {
  await loadDatos();
  await initThree();
  selectLayer(currentIdx);
});
