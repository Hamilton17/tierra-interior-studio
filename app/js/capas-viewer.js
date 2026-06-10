/* ═══════════════════════════════════════════════════════════════
   CAPAS VIEWER — Visor 3D Three.js del corte transversal
   Usa planet.glb generado con Blender (hemisferios pre-cortados).
   Dependencias: three.min.js, OrbitControls.js, GLTFLoader.js
   Config 3D:    app-assets/3D/capas/scene.json
═══════════════════════════════════════════════════════════════ */

let scene, camera, renderer, controls;
let layerSpheres = []; /* { mesh, mat, idx } */
let ringMats = [];
let CFG = null;

/* ── NUEVAS REFERENCIAS PARA MODOS ─────────────────────────── */
let gltfRoot       = null;   /* referencia a gltf.scene para toggle */
let ringMeshesArr  = [];     /* anillos del corte para toggle */
let fullEarthMesh  = null;   /* esfera completa para modo 360° */
let seismicGroup   = null;   /* anillos sísmicos animados */
let platesGroup    = null;   /* líneas de placas tectónicas */
let quakesGroup    = null;   /* puntos de terremotos */
let seismicWaves   = [];     /* { mesh, mat, offset } para animación */
let seismicMaxR    = 0.545;  /* radio CMB normalizado (por defecto) */
let viewMode3D     = 'corte';
let overlayMode3D  = 'none';
let ambientLight   = null;   /* referencia para cambio de intensidad */

function loadGLTF(url) {
  return new Promise((resolve, reject) =>
    new THREE.GLTFLoader().load(url, resolve, undefined, reject)
  );
}

/* ── INICIALIZACIÓN THREE.JS ────────────────────────────────── */
async function initThree() {
  const container = document.getElementById('viewerBody');
  try {
    const cfgResp = await fetch('/app-assets/3D/capas/scene.json');
    if (!cfgResp.ok) throw new Error(`scene.json ${cfgResp.status} — URL correcta: http://localhost:8080/app/capas.html`);
    CFG = await cfgResp.json();
  scene = new THREE.Scene();

  /* Estrellas de fondo */
  const sv = [];
  const { count, minRadius, maxRadius, size } = CFG.stars;
  for (let i = 0; i < count; i++) {
    const r = minRadius + Math.random() * (maxRadius - minRadius);
    const t = Math.random() * Math.PI * 2;
    const p = Math.acos(2 * Math.random() - 1);
    sv.push(r * Math.sin(p) * Math.cos(t), r * Math.sin(p) * Math.sin(t), r * Math.cos(p));
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.Float32BufferAttribute(sv, 3));
  scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size })));

  /* Iluminación desde scene.json */
  const { ambient, sun, rim, core } = CFG.lights;
  ambientLight = new THREE.AmbientLight(ambient.color, ambient.intensity);
  scene.add(ambientLight);
  const sunLight = new THREE.DirectionalLight(sun.color, sun.intensity);
  sunLight.position.set(...sun.position);
  scene.add(sunLight);
  const rimLight = new THREE.DirectionalLight(rim.color, rim.intensity);
  rimLight.position.set(...rim.position);
  scene.add(rimLight);
  scene.add(new THREE.PointLight(core.color, core.intensity, core.distance));

  /* Cámara */
  const w = container.clientWidth, h = container.clientHeight;
  const { fov, near, far, position } = CFG.camera;
  camera = new THREE.PerspectiveCamera(fov, w / h, near, far);
  camera.position.set(...position);

  /* Renderer */
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);
  container.appendChild(renderer.domElement);

  /* Cargar modelo Blender (hemisferios pre-cortados) */
  const gltf = await loadGLTF('/app-assets/3D/capas/planet.glb');
  const layerMeshes = {};

  gltf.scene.traverse((obj) => {
    if (!obj.isMesh) return;

    if (obj.name === 'surface') {
      /* Hemisferio izquierdo — textura terrestre NASA */
      obj.material = new THREE.MeshPhongMaterial({
        map:       makeEarthTex(),
        specular:  new THREE.Color(0x112244),
        shininess: 22,
        side:      THREE.FrontSide,
      });
      const tl = new THREE.TextureLoader();
      /* flipY=false: GLB de Blender tiene V invertido (spec GLTF) */
      tl.load(
        'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_atmos_2048.jpg',
        tex => { tex.flipY = false; obj.material.map = tex; obj.material.needsUpdate = true; }
      );
      tl.load(
        'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_specular_2048.jpg',
        tex => { tex.flipY = false; obj.material.specularMap = tex; obj.material.needsUpdate = true; }
      );
    } else if (obj.name.startsWith('layer_')) {
      layerMeshes[parseInt(obj.name.replace('layer_', ''))] = obj;
    }
  });

  /* Aplicar materiales a las capas en orden correcto */
  for (let i = 0; i < CFG.layers.length; i++) {
    const obj = layerMeshes[i];
    if (!obj) continue;
    const lc = CFG.layers[i];
    const isCore = i >= 4;
    const mat = new THREE.MeshPhongMaterial({
      color:             lc.color,
      emissive:          lc.emissive,
      emissiveIntensity: isCore ? 0.55 : 0.25,
      shininess:         isCore ? 90   : 18,
      map:               makeLayerTex(i, lc.color),
      side:              THREE.DoubleSide,
      transparent:       lc.opacity < 1,
      opacity:           lc.opacity,
      depthWrite:        lc.opacity >= 1,
    });
    obj.material     = mat;
    obj.renderOrder  = (CFG.layers.length - 1 - i) + 2;
    layerSpheres.push({ mesh: obj, mat, idx: i });
  }

  gltfRoot = gltf.scene;
  scene.add(gltfRoot);

  /* Anillos de corte en el plano YZ (x = 0) — overlay visual de la cara de corte */
  const R = CFG.radii;
  seismicMaxR = R[4]; /* CMB: límite manto inferior / núcleo externo */
  [
    [0,    R[5], 5],
    [R[5], R[4], 4],
    [R[4], R[3], 3],
    [R[3], R[2], 2],
    [R[2], R[1], 1],
    [R[1], R[0], 0],
  ].forEach(([ri, ro, li]) => {
    const rMat  = new THREE.MeshBasicMaterial({ color: CFG.layers[li].color, side: THREE.DoubleSide });
    const rMesh = new THREE.Mesh(new THREE.RingGeometry(ri + 0.001, ro - 0.001, 128), rMat);
    rMesh.rotation.y  = Math.PI / 2;
    rMesh.renderOrder = (CFG.layers.length - 1 - li) + 2;
    scene.add(rMesh);
    ringMats[li] = rMat;
    ringMeshesArr.push(rMesh);
  });

  /* Objetos para los nuevos modos */
  fullEarthMesh = buildFullEarth();
  seismicGroup  = buildSeismicWaves();
  platesGroup   = buildPlateLines();
  quakesGroup   = buildQuakeDots();
  scene.add(fullEarthMesh);
  scene.add(seismicGroup);
  scene.add(platesGroup);
  scene.add(quakesGroup);

  /* Halo de atmósfera */
  const atm = CFG.atmosphere;
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(atm.radius, 32, 16),
    new THREE.MeshPhongMaterial({
      color: atm.color, transparent: true, opacity: atm.opacity,
      side: THREE.FrontSide, depthWrite: false,
    })
  ));

  /* Controles de órbita */
  const { minDistance, maxDistance, autoRotate, autoRotateSpeed, dampingFactor } = CFG.controls;
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping   = true;
  controls.dampingFactor   = dampingFactor;
  controls.minDistance     = minDistance;
  controls.maxDistance     = maxDistance;
  controls.autoRotate      = autoRotate;
  controls.autoRotateSpeed = autoRotateSpeed;

  /* Loop de animación */
  (function animate() {
    requestAnimationFrame(animate);
    controls.update();
    if (viewMode3D === 'ondas') animateSeismic();
    renderer.render(scene, camera);
  })();

  /* Responsive */
  new ResizeObserver(() => {
    const cw = container.clientWidth, ch = container.clientHeight;
    if (!cw || !ch) return;
    camera.aspect = cw / ch;
    camera.updateProjectionMatrix();
    renderer.setSize(cw, ch);
  }).observe(container);

  } catch (err) {
    console.error('[CapasViewer]', err);
    container.innerHTML = `<div style="color:#f87171;font-family:monospace;padding:24px;font-size:13px;white-space:pre-wrap;">⚠ Error al cargar el visor\n\n${err.message}\n\nVerifica:\n• Servidor activo desde iniciar-servidor.bat\n• URL: http://localhost:8080/app/capas.html</div>`;
  }
}

/* ── TEXTURAS PROCEDURALES POR TIPO DE CAPA ─────────────────── */
function makeLayerTex(layerIdx, cssColor) {
  const W = 256, H = 128, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');

  const tmp = document.createElement('canvas');
  tmp.width = tmp.height = 1;
  const tctx = tmp.getContext('2d');
  tctx.fillStyle = cssColor; tctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = tctx.getImageData(0, 0, 1, 1).data;

  ctx.fillStyle = cssColor; ctx.fillRect(0, 0, W, H);

  if (layerIdx <= 1) {
    for (let n = 0; n < 80; n++) {
      const lum = 0.5 + Math.random() * 0.9;
      ctx.fillStyle = `rgba(${Math.min(255,r*lum|0)},${Math.min(255,g*lum|0)},${Math.min(255,b*lum|0)},0.5)`;
      const px = Math.random() * W, py = Math.random() * H, sz = 8 + Math.random() * 28;
      ctx.beginPath(); ctx.ellipse(px, py, sz, sz * 0.55, Math.random() * Math.PI, 0, Math.PI * 2); ctx.fill();
    }
    for (let n = 0; n < 12; n++) {
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1 + Math.random() * 2;
      ctx.beginPath(); ctx.moveTo(Math.random()*W, Math.random()*H); ctx.lineTo(Math.random()*W, Math.random()*H); ctx.stroke();
    }
  } else if (layerIdx <= 3) {
    for (let n = 0; n < 55; n++) {
      const lum = 0.4 + Math.random() * 1.1;
      ctx.fillStyle = `rgba(${Math.min(255,r*lum|0)},${Math.min(255,g*lum|0)},${Math.min(255,b*lum|0)},0.4)`;
      ctx.beginPath(); ctx.ellipse(Math.random()*W, Math.random()*H, 12+Math.random()*40, 8+Math.random()*28, Math.random()*Math.PI, 0, Math.PI*2); ctx.fill();
    }
    for (let n = 0; n < 18; n++) {
      const x0 = Math.random() * W;
      const grd = ctx.createLinearGradient(x0, H, x0 + (Math.random()-.5)*30, 0);
      grd.addColorStop(0,'rgba(255,160,0,0)'); grd.addColorStop(.5,'rgba(255,130,0,0.3)'); grd.addColorStop(1,'rgba(255,200,50,0)');
      ctx.fillStyle = grd; ctx.fillRect(x0-8, 0, 16, H);
    }
  } else {
    const grd = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H)/2);
    grd.addColorStop(0,'rgba(255,255,200,0.35)'); grd.addColorStop(.5,'rgba(255,180,0,0.12)'); grd.addColorStop(1,'rgba(200,80,0,0.2)');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
    for (let n = 0; n < 28; n++) {
      ctx.strokeStyle = `rgba(255,255,150,${Math.random()*0.4})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(Math.random()*W, Math.random()*H, 5+Math.random()*20, 0, Math.PI*2); ctx.stroke();
    }
  }
  return new THREE.CanvasTexture(c);
}

/* ── TEXTURA CANVAS TERRESTRE (fallback antes de cargar NASA) ── */
function makeEarthTex() {
  const W = 512, H = 256, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  const ocean = ctx.createLinearGradient(0, 0, 0, H);
  ocean.addColorStop(0, '#1a4f7a'); ocean.addColorStop(1, '#0d2f52');
  ctx.fillStyle = ocean; ctx.fillRect(0, 0, W, H);
  const fill = (col, pts) => {
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    pts.slice(1).forEach(p => ctx.lineTo(p[0], p[1]));
    ctx.closePath(); ctx.fill();
  };
  fill('#2e6a1a',[[52,52],[82,44],[105,48],[118,58],[108,75],[95,82],[84,100],[74,118],[60,128],[50,112],[44,82],[46,62]]);
  fill('#1a5c10',[[100,138],[118,132],[126,142],[120,158],[108,164],[98,158],[95,148]]);
  fill('#16650c',[[90,152],[118,144],[135,158],[140,180],[135,220],[118,252],[100,258],[84,240],[80,210],[85,180],[88,162]]);
  fill('#2e7a1a',[[218,50],[255,44],[272,54],[268,72],[252,78],[232,80],[218,68],[215,56]]);
  fill('#b45309',[[220,88],[270,80],[292,94],[298,128],[285,180],[268,220],[244,234],[220,224],[205,190],[202,155],[210,115],[215,94]]);
  fill('#15803d',[[232,152],[268,144],[284,158],[278,175],[250,178],[232,168],[225,155]]);
  fill('#2e7a1a',[[286,44],[410,32],[445,48],[440,85],[400,102],[355,105],[318,95],[295,78],[285,58]]);
  fill('#22c55e',[[348,98],[382,94],[392,112],[385,140],[368,152],[350,148],[342,130],[342,108]]);
  fill('#15803d',[[398,108],[440,100],[458,115],[452,132],[428,138],[402,128],[392,114]]);
  fill('#15803d',[[420,150],[460,142],[475,158],[468,172],[442,175],[422,164]]);
  fill('#d97706',[[398,175],[450,170],[468,185],[465,215],[442,225],[408,218],[392,202],[390,185]]);
  fill('#d0e8f8',[[145,26],[178,20],[195,32],[188,52],[165,58],[145,48],[138,36]]);
  ctx.fillStyle='#c0d8f0'; ctx.fillRect(0,0,W,18); ctx.fillRect(0,238,W,18);
  ctx.fillStyle='rgba(180,220,255,.04)'; ctx.fillRect(0,0,W,H/2);
  const tex = new THREE.CanvasTexture(c);
  tex.flipY = false;
  return tex;
}

/* ── HIGHLIGHT DE CAPA EN EL VISOR 3D ──────────────────────── */
function highlight3D(idx) {
  if (!CFG) return;
  layerSpheres.forEach(({ mat }, i) => {
    const isOn = i === idx;
    mat.emissiveIntensity = isOn ? 1.8 : (i >= 4 ? 0.55 : 0.25);
    mat.emissive.set(isOn ? CFG.layers[i].glowColor : CFG.layers[i].emissive);
  });
  ringMats.forEach((rMat, i) => {
    if (rMat) rMat.color.set(i === idx ? CFG.layers[i].glowColor : CFG.layers[i].color);
  });
}

/* ══════════════════════════════════════════════════════════════
   MODOS DE VISTA — VERDE: Corte / 360° / Ondas S
══════════════════════════════════════════════════════════════ */

function applyViewMode3D(mode) {
  if (!gltfRoot) return;
  viewMode3D = mode;

  const isCorte = mode === 'corte';
  const is360   = mode === '360';
  const isOndas = mode === 'ondas';

  /* Toggle modelo GLB + anillos de corte */
  gltfRoot.visible = !is360;
  ringMeshesArr.forEach(m => { m.visible = isCorte; });

  /* Esfera completa solo en 360° */
  if (fullEarthMesh) fullEarthMesh.visible = is360;

  /* Ondas S */
  if (seismicGroup) seismicGroup.visible = isOndas;

  /* Iluminación */
  if (ambientLight) {
    ambientLight.intensity = isOndas ? 0.15 : CFG.lights.ambient.intensity;
    ambientLight.color.set(isOndas ? 0x001830 : CFG.lights.ambient.color);
  }

  /* Auto-rotate en 360° */
  if (controls) controls.autoRotate = is360;

  /* Info overlay en la pantalla */
  const info = document.getElementById('viewerModeInfo');
  if (info) {
    if (isOndas) {
      info.style.display = 'block';
      info.innerHTML = `<strong>🌊 Ondas S</strong><br>Se propagan por el manto sólido.<br>No atraviesan el <span style="color:#ffaa44">núcleo externo líquido</span>.`;
    } else if (is360) {
      info.style.display = 'block';
      info.innerHTML = `<strong>🌍 Vista 360°</strong><br>Arrastra para rotar libremente.`;
      setTimeout(() => { if (info) info.style.display = 'none'; }, 3000);
    } else {
      info.style.display = 'none';
    }
  }

  /* Overlays de superficie solo en corte y 360° */
  if (isOndas) {
    if (platesGroup) platesGroup.visible = false;
    if (quakesGroup) quakesGroup.visible = false;
  } else {
    applyOverlay3D(overlayMode3D);
  }
}

/* ══════════════════════════════════════════════════════════════
   OVERLAYS — PÚRPURA: Corte transversal / Placas / Terremotos
══════════════════════════════════════════════════════════════ */

function applyOverlay3D(mode) {
  if (!platesGroup) return;
  overlayMode3D = mode;
  const active = viewMode3D !== 'ondas';
  platesGroup.visible = (mode === 'placas')     && active;
  quakesGroup.visible = (mode === 'terremotos') && active;

  const info = document.getElementById('overlayInfo');
  if (info) {
    if (mode === 'placas' && active) {
      info.style.display = 'block';
      info.textContent = '🗺 Límites de placas tectónicas — 15 placas principales';
    } else if (mode === 'terremotos' && active) {
      info.style.display = 'block';
      info.textContent = '⚡ 20 sismos históricos más importantes (Mw ≥ 7.0)';
    } else {
      info.style.display = 'none';
    }
  }
}

/* ── ANIMACIÓN ONDAS SÍSMICAS ───────────────────────────────── */
let seismicT = 0;
function animateSeismic() {
  seismicT += 0.006;
  seismicWaves.forEach(({ mesh, mat, offset }) => {
    const phase = ((seismicT + offset) % 1.0);
    const r = phase * seismicMaxR * 1.05;
    if (r < seismicMaxR) {
      mesh.scale.setScalar(Math.max(0.001, r));
      mat.opacity = 0.75 * (1 - phase * 0.85);
      mesh.visible = true;
    } else {
      mesh.visible = false;
    }
  });
}

/* ── CONSTRUIR ESFERA COMPLETA (modo 360°) ──────────────────── */
function buildFullEarth() {
  const geo = new THREE.SphereGeometry(1, 64, 32);
  const mat = new THREE.MeshPhongMaterial({
    map: makeEarthTex(),
    specular: new THREE.Color(0x112244),
    shininess: 22,
  });
  const mesh = new THREE.Mesh(geo, mat);
  new THREE.TextureLoader().load(
    'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_atmos_2048.jpg',
    tex => { tex.flipY = true; mat.map = tex; mat.needsUpdate = true; }
  );
  mesh.visible = false;
  return mesh;
}

/* ── CONSTRUIR ONDAS SÍSMICAS (modo Ondas S) ────────────────── */
function buildSeismicWaves() {
  const group = new THREE.Group();
  /* Anillo CMB permanente (barrera naranja) */
  const cmbMat  = new THREE.MeshBasicMaterial({ color: 0xff8822, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
  const cmbMesh = new THREE.Mesh(new THREE.RingGeometry(seismicMaxR - 0.005, seismicMaxR + 0.005, 128), cmbMat);
  cmbMesh.rotation.y = Math.PI / 2;
  cmbMesh.renderOrder = 20;
  group.add(cmbMesh);

  /* 3 anillos de ondas expandibles */
  const colors = [0x00eeff, 0x44aaff, 0x88ccff];
  for (let i = 0; i < 3; i++) {
    const mat  = new THREE.MeshBasicMaterial({ color: colors[i], transparent: true, opacity: 0.0, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(new THREE.RingGeometry(0.92, 1.0, 64), mat);
    mesh.rotation.y = Math.PI / 2;
    mesh.renderOrder = 21;
    mesh.scale.setScalar(0.001);
    group.add(mesh);
    seismicWaves.push({ mesh, mat, offset: i / 3 });
  }
  group.visible = false;
  return group;
}

/* ── CONVERSOR LAT/LON → 3D ─────────────────────────────────── */
function latLonTo3D(lat, lon, r) {
  const phi   = (90 - lat) * Math.PI / 180;
  const theta = (lon + 90) * Math.PI / 180; /* +90° para UV Blender */
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

/* ── CONSTRUIR PLACAS TECTÓNICAS ────────────────────────────── */
const PLATE_SEGMENTS = [
  /* Dorsal Mesoatlántica Norte */
  [[83,-35],[75,-10],[65,-18],[60,-30],[55,-35],[45,-30],[35,-35],[25,-44],[15,-45],[5,-33],[0,-20]],
  /* Dorsal Mesoatlántica Sur */
  [[0,-20],[-10,-14],[-20,-13],[-30,-13],[-40,-16],[-50,-8],[-55,-3],[-60,1]],
  /* Dorsal del Pacífico Este (EPR) */
  [[25,-110],[15,-105],[5,-103],[0,-102],[-10,-108],[-20,-114],[-30,-112],[-40,-110],[-53,-98]],
  /* Límite Pacífico - Norteamérica (San Andrés + costa NW) */
  [[60,-145],[55,-142],[50,-130],[48,-125],[44,-124],[38,-123],[33,-118],[28,-113]],
  /* Fosa de Aleutianas */
  [[53,-175],[53,-165],[53,-155],[53,-145],[53,-140]],
  /* Anillo de Fuego — Oeste del Pacífico (Japón → Nueva Zelanda) */
  [[55,162],[50,155],[45,148],[40,143],[35,140],[30,138],[25,126],[20,122],[15,120],[10,125],[5,127],[0,129],
   [-5,132],[-10,141],[-15,147],[-20,168],[-25,178],[-30,178],[-38,175],[-45,168]],
  /* India - Eurasia (Himalaya) */
  [[26,62],[28,70],[30,76],[30,84],[28,96],[26,100],[24,108]],
  /* Rift de África del Este */
  [[15,42],[10,40],[5,36],[0,36],[-5,38],[-10,40],[-15,35],[-20,36]],
  /* Mediterráneo / Alpino */
  [[37,-8],[37,0],[38,6],[40,10],[43,13],[38,20],[36,28],[37,36]],
  /* Placa del Caribe */
  [[20,-88],[22,-80],[20,-72],[16,-64],[11,-60],[8,-63],[8,-78],[10,-84],[15,-89],[20,-88]],
  /* Arco de Scotia (Atlántico Sur) */
  [[-55,-68],[-58,-60],[-60,-50],[-60,-40],[-55,-38]],
  /* Tonga - Kermadec */
  [[-15,-175],[-20,-175],[-25,-175],[-30,-175],[-35,-175]],
  /* Límite Eurasia - África (SO) */
  [[37,-8],[36,-5],[36,0],[37,5],[37,10]],
  /* Arabia - Eurasia */
  [[30,48],[32,52],[34,56],[36,60],[38,64],[40,68]],
];

function buildPlateLines() {
  const pts = [];
  PLATE_SEGMENTS.forEach(seg => {
    for (let i = 0; i < seg.length - 1; i++) {
      const a = latLonTo3D(seg[i][0],   seg[i][1],   1.013);
      const b = latLonTo3D(seg[i+1][0], seg[i+1][1], 1.013);
      pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  const mat = new THREE.LineBasicMaterial({ color: 0xffcc44, transparent: true, opacity: 0.85 });
  const lines = new THREE.LineSegments(geo, mat);
  lines.renderOrder = 15;
  lines.visible = false;
  return lines;
}

/* ── CONSTRUIR TERREMOTOS ───────────────────────────────────── */
const QUAKE_DATA = [
  { lat:-38.1, lon:-73.4, mag:9.5, nombre:'Chile 1960'      },
  { lat: 61.0, lon:-147.6,mag:9.2, nombre:'Alaska 1964'     },
  { lat:  3.3, lon: 96.0, mag:9.1, nombre:'Sumatra 2004'    },
  { lat: 38.3, lon:142.4, mag:9.1, nombre:'Tōhoku 2011'     },
  { lat: 51.6, lon:175.4, mag:9.0, nombre:'Kamchatka 1952'  },
  { lat:-36.1, lon:-72.9, mag:8.8, nombre:'Bío-Bío 2010'    },
  { lat:  2.1, lon: 97.1, mag:8.6, nombre:'N.Sumatra 2012'  },
  { lat:-12.5, lon:166.4, mag:8.5, nombre:'Vanuatu 2009'    },
  { lat: 28.2, lon: 84.7, mag:7.8, nombre:'Nepal 2015'      },
  { lat: 28.0, lon:103.5, mag:7.9, nombre:'Sichuan 2008'    },
  { lat: 37.8, lon:-122.4,mag:7.9, nombre:'S.Francisco 1906'},
  { lat: 18.5, lon:-72.5, mag:7.0, nombre:'Haití 2010'      },
  { lat: 41.1, lon:143.0, mag:7.7, nombre:'Hokkaido 2003'   },
  { lat:-17.5, lon:-178.5,mag:8.2, nombre:'Fiji 2018'       },
  { lat: 60.0, lon:-141.0,mag:7.9, nombre:'Alaska 2018'     },
  { lat: -4.7, lon:153.0, mag:8.0, nombre:'Papua 2000'      },
  { lat: 36.0, lon:141.0, mag:7.3, nombre:'Fukushima 2016'  },
  { lat:-33.0, lon:-71.5, mag:7.5, nombre:'Chile central 2015'},
  { lat: 30.0, lon: 81.0, mag:7.6, nombre:'Tibet 2015'      },
  { lat:-0.80, lon:132.5, mag:7.5, nombre:'Papua 2009'      },
];

function buildQuakeDots() {
  const group = new THREE.Group();
  QUAKE_DATA.forEach(eq => {
    const pos  = latLonTo3D(eq.lat, eq.lon, 1.016);
    const size = 0.014 + (eq.mag - 7.0) * 0.016;
    const col  = eq.mag >= 9.0 ? 0xff1100 : eq.mag >= 8.0 ? 0xff6600 : 0xffcc00;

    /* Punto central */
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(size, 8, 8),
      new THREE.MeshBasicMaterial({ color: col })
    );
    dot.position.copy(pos);
    dot.renderOrder = 16;

    /* Halo plano orientado hacia afuera */
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(size + 0.008, size + 0.022, 16),
      new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
    );
    halo.position.copy(pos);
    halo.lookAt(pos.clone().multiplyScalar(2));
    halo.renderOrder = 16;

    group.add(dot, halo);
  });
  group.visible = false;
  return group;
}
