/* ═══════════════════════════════════════════════════════════════
   ECOSISTEMAS VIEWER — Visor Three.js del globo terráqueo
   Reemplaza CesiumJS con Three.js + GLTFLoader + Raycaster.
   Config 3D: /app-assets/3D/ecosistemas/scene.json
   Servidor debe estar en la raíz del proyecto (iniciar-servidor.bat)
   URL correcta: http://localhost:8080/app/ecosistemas.html
═══════════════════════════════════════════════════════════════ */

let scene, camera, renderer, controls;
let earthMesh  = null;
let overlayMat = null;
let markerMesh = null;
let isRotating = true;
let CFG        = null;

/* Expuesta al UI para cambiar overlay */
function setOverlay(mode, canvas) {
  if (!overlayMat) return;
  if (mode === 'sat') {
    overlayMat.opacity = 0;
    overlayMat.needsUpdate = true;
    return;
  }
  if (overlayMat.map) overlayMat.map.dispose();
  overlayMat.map         = new THREE.CanvasTexture(canvas);
  overlayMat.map.flipY   = false;
  overlayMat.opacity = CFG.overlay.alpha;
  overlayMat.needsUpdate = true;
}

function loadGLTF(url) {
  return new Promise((resolve, reject) =>
    new THREE.GLTFLoader().load(url, resolve, undefined, reject)
  );
}

function showViewerError(container, msg) {
  container.innerHTML = `<div style="color:#f87171;font-family:monospace;padding:24px;font-size:13px;white-space:pre-wrap;">${msg}</div>`;
}

(async function initThree() {
  const container = document.getElementById('cesiumContainer');

  try {
    /* Configuración desde JSON — paths root-relative (servidor en raíz del proyecto) */
    const cfgResp = await fetch('/app-assets/3D/ecosistemas/scene.json');
    if (!cfgResp.ok) throw new Error(`scene.json ${cfgResp.status} — ¿Servidor en raíz del proyecto?\nURL correcta: http://localhost:8080/app/ecosistemas.html`);
    CFG = await cfgResp.json();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000610);

    /* Estrellas */
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

    /* Iluminación */
    scene.add(new THREE.AmbientLight(CFG.lights.ambient.color, CFG.lights.ambient.intensity));
    const sun = new THREE.DirectionalLight(CFG.lights.sun.color, CFG.lights.sun.intensity);
    sun.position.set(...CFG.lights.sun.position);
    scene.add(sun);

    /* Cámara */
    const w = container.clientWidth || 800, h = container.clientHeight || 600;
    const { fov, near, far, position } = CFG.camera;
    camera = new THREE.PerspectiveCamera(fov, w / h, near, far);
    camera.position.set(...position);

    /* Renderer */
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);

    /* Cargar planeta Blender */
    const gltf = await loadGLTF('/app-assets/3D/ecosistemas/planet.glb');
    const texLoader = new THREE.TextureLoader();

    gltf.scene.traverse((obj) => {
      if (!obj.isMesh) return;

      if (obj.name === 'earth') {
        earthMesh = obj;
        obj.material = new THREE.MeshPhongMaterial({
          map:       makeOceanTex(),
          specular:  new THREE.Color(0x112244),
          shininess: 30,
        });
        /* flipY=false: el GLB de Blender tiene V invertido (spec GLTF) */
        texLoader.load(
          'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_atmos_2048.jpg',
          tex => { tex.flipY = false; obj.material.map = tex; obj.material.needsUpdate = true; }
        );
        texLoader.load(
          'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_specular_2048.jpg',
          tex => { tex.flipY = false; obj.material.specularMap = tex; obj.material.needsUpdate = true; }
        );
      }

      if (obj.name === 'clouds') {
        obj.material = new THREE.MeshPhongMaterial({
          color: 0xffffff, transparent: true, opacity: 0.28, depthWrite: false,
        });
      }

      if (obj.name === 'atmosphere') {
        obj.material = new THREE.MeshPhongMaterial({
          color: 0x4488ff, transparent: true, opacity: 0.10,
          side: THREE.BackSide, depthWrite: false,
        });
      }
    });

    scene.add(gltf.scene);

    /* Overlay: clona la geometría de earthMesh para que el UV sea idéntico
       y los biomas se alineen exactamente con la textura NASA */
    overlayMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    const overlayMesh = new THREE.Mesh(earthMesh.geometry.clone(), overlayMat);
    overlayMesh.scale.setScalar(1.003);
    earthMesh.parent.add(overlayMesh);

    /* Marcador de clic */
    const mMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(CFG.marker.color) });
    markerMesh = new THREE.Mesh(new THREE.SphereGeometry(CFG.marker.radius, 8, 8), mMat);
    markerMesh.visible = false;
    scene.add(markerMesh);

    /* OrbitControls */
    const { minDistance, maxDistance, dampingFactor } = CFG.controls;
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping   = true;
    controls.dampingFactor   = dampingFactor;
    controls.minDistance     = minDistance;
    controls.maxDistance     = maxDistance;
    controls.autoRotate      = isRotating;
    controls.autoRotateSpeed = CFG.autoRotate.speed;

    /* Raycaster: clic → UV → lat/lon → bioma */
    const raycaster = new THREE.Raycaster();
    const mouse     = new THREE.Vector2();

    renderer.domElement.addEventListener('click', (e) => {
      if (!earthMesh) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) / rect.width  *  2 - 1;
      mouse.y = (e.clientY - rect.top)  / rect.height * -2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObject(earthMesh, true);
      if (!hits.length) return;

      const uv  = hits[0].uv;
      const lat = 90 - uv.y * 180;  /* UV.v=0 = polo norte en GLB de Blender */
      const lon = uv.x * 360 - 180;

      const ns = lat >= 0 ? 'N' : 'S', ew = lon >= 0 ? 'E' : 'O';
      document.getElementById('locText').textContent =
        `${Math.abs(lat).toFixed(2)}°${ns}  ${Math.abs(lon).toFixed(2)}°${ew}`;

      markerMesh.position.copy(hits[0].point).multiplyScalar(1.015);
      markerMesh.visible = true;

      const hint = document.getElementById('clickHint');
      if (hint) hint.style.opacity = '0';

      selectBiome(getBiome(lat, lon), lat, lon);
    });

    /* Loop de animación */
    (function animate() {
      requestAnimationFrame(animate);
      controls.update();
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

    buildLegend('sat');

  } catch (err) {
    console.error('[EcosistemaViewer]', err);
    showViewerError(container,
      '⚠ Error al cargar el visor de ecosistemas\n\n' + err.message +
      '\n\nVerifica:\n• Servidor activo desde iniciar-servidor.bat\n• URL: http://localhost:8080/app/ecosistemas.html'
    );
  }
})();

/* Textura oceánica de fallback mientras carga NASA Blue Marble */
function makeOceanTex() {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 64);
  g.addColorStop(0, '#1a4f8a'); g.addColorStop(1, '#0d2f52');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.flipY = false;
  return tex;
}
