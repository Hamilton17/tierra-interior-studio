# 🌍 Tierra Interior Studio

> **Interactive 3D educational platform** to explore Earth — its geological layers, biomes, ecosystems, and species. | **Plataforma educativa 3D interactiva** para explorar la Tierra.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Three.js](https://img.shields.io/badge/Three.js-r128-black?logo=three.js)](https://threejs.org/)
[![Open-Meteo](https://img.shields.io/badge/API-Open--Meteo-blue)](https://open-meteo.com/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/es/docs/Web/HTML)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2020-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)

---

## 📸 Vista previa

```
┌─────────────────────────────────────────────────────────────────┐
│  🌍  GLOBO HUB          │  🗺️  CAPAS GEOLÓGICAS                 │
│  Globo 3D interactivo   │  Corte transversal + datos por capa   │
│  con texturas NASA,     │  (Corteza → Núcleo interno)           │
│  OrbitControls y        │                                       │
│  marcadores de biomas   │  🌿  ECOSISTEMAS + CLIMA REAL         │
│                         │  Globo clicable · Open-Meteo API      │
├─────────────────────────┴───────────────────────────────────────┤
│  🎮  JUEGO DE HÁBITATS  │  📚  BIBLIOTECA   │  📓  CUADERNO     │
│  20 animales GLB 3D     │  Artículos JSON   │  localStorage     │
│  drag & drop · 5 niveles│  quizzes · videos │  notas personales │
└─────────────────────────┴───────────────────────────────────────┘
```

---

## ✨ Características

- 🌍 **Globo 3D central** — Rotación interactiva con OrbitControls, textura NASA Blue Marble, marcadores de biomas clicables. Hub de navegación al estilo Google Earth.
- 🗺️ **Explorador de Capas Geológicas** — Visor 3D de las 6 capas internas de la Tierra (corteza, mantos y núcleo), con corte transversal, datos científicos y comparaciones.
- 🌿 **Ecosistemas del Mundo** — Globo terráqueo clicable con detección automática de bioma por coordenadas, parámetros climáticos históricos y **clima en tiempo real** vía Open-Meteo API.
- 🎮 **Juego de Hábitats** — 5 niveles (Sabana, Selva, Polar, Océano, Desierto) con 20 modelos animales 3D (GLB/GLTF), drag & drop, sistema de puntuación y timer.
- 📚 **Biblioteca** — Artículos científicos, infografías, quizzes y videos educativos en formato JSON.
- 📓 **Cuaderno Personal** — Notas y apuntes persistentes con `localStorage`.

---

## 🛠️ Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| [Three.js](https://threejs.org/) | r128 | Renderizado 3D (globo, capas, animales) |
| GLTF/GLB | 2.0 | Modelos 3D de animales y planeta |
| [Open-Meteo API](https://open-meteo.com/) | v1 | Clima en tiempo real (sin API key) |
| [OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls) | r128 | Control de cámara |
| HTML5 / CSS3 | — | Interfaz, drag & drop, localStorage |
| JavaScript | ES2020 | Lógica de aplicación (vanilla, sin frameworks) |
| http-server (Node.js) | ^14 | Servidor local de desarrollo |

> **Sin dependencias de frontend framework.** Todo es HTML, CSS y JavaScript puro + Three.js desde CDN.

---

## 🚀 Instalación rápida

### Prerrequisitos

- [Node.js](https://nodejs.org/) v14 o superior (solo para el servidor local)
- Navegador moderno con soporte WebGL (Chrome, Firefox, Edge, Safari)
- Conexión a internet (para texturas NASA y clima en tiempo real)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/tierra-interior-studio.git
cd tierra-interior-studio

# 2. Instalar servidor (solo primera vez)
npm install

# 3. Iniciar servidor local
npm start
# → Servidor corriendo en http://localhost:8080

# 4. Abrir en el navegador
# http://localhost:8080/app/index.html
```

### Windows (método alternativo)

Doble clic en `iniciar-servidor.bat` y luego abrir `http://localhost:8080/app/` en el navegador.

> ⚠️ **El servidor local es necesario** para cargar los modelos 3D (.glb) y los datos JSON. Abrir los archivos directamente como `file://` cargará la mayoría de funciones excepto el Explorador de Capas y Ecosistemas.

---

## 📁 Estructura del Proyecto

```
tierra-interior-studio/
│
├── app/                          # Código fuente de la aplicación
│   ├── index.html                # 🌍 Hub central — Globo 3D interactivo
│   ├── capas.html                # 🗺️ Explorador de capas geológicas
│   ├── ecosistemas.html          # 🌿 Mapa de biomas y ecosistemas
│   ├── juego.html                # 🎮 Juego de hábitats
│   ├── biblioteca.html           # 📚 Biblioteca de contenido educativo
│   ├── cuaderno.html             # 📓 Cuaderno personal
│   ├── css/
│   │   ├── global.css            # Estilos compartidos, topbar, componentes
│   │   ├── capas.css             # Estilos del explorador de capas
│   │   └── ecosistemas.css       # Estilos del explorador de ecosistemas
│   └── js/
│       ├── data/
│       │   ├── capas-data.js     # Datos de las 6 capas geológicas
│       │   └── ecosistemas-data.js # Datos de biomas y especies
│       ├── capas-viewer.js       # Visor 3D Three.js para capas
│       ├── capas-ui.js           # Interfaz del explorador de capas
│       ├── ecosistemas-viewer.js # Visor 3D Three.js para el globo
│       └── ecosistemas-ui.js     # Interfaz + clima en tiempo real
│
├── app-assets/                   # Assets estáticos
│   ├── 3D/
│   │   ├── animales/             # 20 modelos GLB de animales por bioma
│   │   │   ├── sabana/           # jirafa, leon, elefante, cebra
│   │   │   ├── selva_tropical/   # jaguar, guacamayo, perezoso, rana_dardo
│   │   │   ├── polar/            # oso_polar, pinguino, foca, ballena
│   │   │   ├── oceano/           # ballena_azul, tiburon_blanco, calamar, pez_payaso
│   │   │   └── desierto/         # dromedario, escorpion, lagarto, zorro_fennec
│   │   ├── capas/
│   │   │   ├── planet.glb        # Modelo 3D del planeta (Blender)
│   │   │   └── scene.json        # Configuración de la escena 3D
│   │   └── ecosistemas/
│   │       ├── planet.glb        # Globo terráqueo con UV para detección de biomas
│   │       └── scene.json        # Configuración de cámara, luces y controles
│   ├── biblioteca/               # Contenido educativo en JSON
│   ├── capas/                    # Datos e ilustraciones por capa geológica
│   └── ecosistemas/              # Datos de biomas
│
├── _scripts/                     # Scripts de generación de assets (Python)
├── docs/
│   └── screenshots/              # Capturas de pantalla para el README
├── iniciar-servidor.bat          # Servidor local para Windows
├── package.json                  # Dependencias npm
├── LICENSE                       # Licencia MIT
└── README.md                     # Este archivo
```

---

## 🎮 Secciones de la Aplicación

### 🌍 Hub Central — Globo Interactivo
Punto de entrada de la plataforma. Un globo 3D con textura NASA Blue Marble rota automáticamente. Cinco marcadores geográficos coloridos representan los biomas jugables. Botones de acceso rápido a todas las secciones.

### 🗺️ Explorador de Capas Geológicas
Visor interactivo de las 6 capas de la Tierra con modelo 3D en corte transversal. Cada capa incluye: temperatura, presión, densidad, estado de la materia y descripción científica. Soporta modos de vista: Corte, 360° y Ondas S.

### 🌿 Exploistemas del Mundo
Globo terráqueo clicable con detección automática de bioma por coordenadas geográficas (UV mapping). Al hacer clic en cualquier punto muestra:
- Bioma identificado (sabana, selva, desierto, tundra, etc.)
- Parámetros climáticos históricos
- **Clima en tiempo real** (temperatura, humedad, viento, nubosidad vía Open-Meteo)
- Especies representativas
- Dato científico curioso

### 🎮 Juego de Hábitats
5 niveles con animales en 3D para colocar en su hábitat correcto mediante drag & drop. Los modelos GLB se cargan con animaciones, se escalan a proporciones realistas y pueden rotarse con el mouse. Sistema de puntuación con localStorage.

**Biomas disponibles:**
| Bioma | Animales |
|---|---|
| 🌾 Sabana Africana | Jirafa, León, Elefante, Cebra |
| 🌿 Selva Tropical | Guacamayo, Jaguar, Rana dardo, Perezoso |
| 🧊 Polar / Ártico | Oso polar, Pingüino, Foca, Ballena |
| 🌊 Océano Profundo | Ballena azul, Tiburón blanco, Calamar, Pez payaso |
| 🏜️ Desierto de Sonora | Dromedario, Escorpión, Lagarto, Zorro fennec |

### 📚 Biblioteca
Repositorio de contenido educativo cargado desde archivos JSON: artículos científicos, infografías interactivas, quizzes de conocimiento y referencias a videos.

### 📓 Cuaderno Personal
Área de notas personales con persistencia en `localStorage`. Los estudiantes pueden anotar conceptos, guardar datos interesantes y organizar su aprendizaje.

---

## 🌐 APIs Externas

### Open-Meteo (Clima en Tiempo Real)
```
GET https://api.open-meteo.com/v1/forecast
    ?latitude={lat}&longitude={lon}
    &current=temperature_2m,relative_humidity_2m,precipitation,
             weather_code,wind_speed_10m,wind_direction_10m,cloud_cover
    &wind_speed_unit=kmh&timezone=auto
```
- ✅ **Sin API key** — completamente gratuita
- ✅ **CORS abierto** — funciona desde cualquier origen
- ✅ Datos actualizados cada hora
- ✅ Cobertura mundial

### Three.js CDN
Texturas NASA Blue Marble cargadas desde:
```
https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/
```

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Para contribuir:

1. Fork del repositorio
2. Crear rama: `git checkout -b feature/nueva-caracteristica`
3. Commit de cambios: `git commit -m 'Add: descripción del cambio'`
4. Push a la rama: `git push origin feature/nueva-caracteristica`
5. Abrir Pull Request

### Ideas para contribuir
- 🐾 Nuevos modelos 3D de animales (GLB, ~5-10MB)
- 🌐 Traducción a otros idiomas
- 📖 Nuevos artículos en la biblioteca (`app-assets/biblioteca/`)
- 🎯 Nuevos niveles para el juego de hábitats
- ♿ Mejoras de accesibilidad

---

## 📋 Requisitos del Sistema

| Requisito | Mínimo | Recomendado |
|---|---|---|
| Navegador | Chrome 90+ / Firefox 88+ | Chrome 110+ / Edge 110+ |
| GPU | WebGL 1.0 | WebGL 2.0 |
| RAM | 4 GB | 8 GB |
| Conexión | Banda ancha (carga de GLBs ~7 MB c/u) | — |
| Node.js | v14+ (para servidor local) | v18+ |

---

## 📄 Licencia

Distribuido bajo la licencia **MIT**. Ver [`LICENSE`](LICENSE) para más información.

---

## 🙏 Créditos

- **Modelos 3D** — Animales y planeta creados en Blender
- **Texturas de la Tierra** — NASA Blue Marble (dominio público)
- **Motor 3D** — [Three.js](https://threejs.org/) por Mr.doob y contribuidores
- **API de Clima** — [Open-Meteo](https://open-meteo.com/) (open source)
- **Íconos de interfaz** — SVG inline personalizados

---

<div align="center">

**Tierra Interior Studio** · Plataforma educativa para explorar nuestro planeta

*Hecho con ❤️ para el aprendizaje de las ciencias de la Tierra*

</div>
