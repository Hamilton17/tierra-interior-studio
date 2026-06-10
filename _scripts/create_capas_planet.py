"""
Blender script: genera el planeta de capas geológicas → planet.glb
Uso: blender --background --python create_capas_planet.py

Produce 7 objetos:
  surface  → hemisferio IZQUIERDO (x ≤ 0) para textura terrestre
  layer_0  → hemisferio DERECHO corteza continental   r=2.00
  layer_1  → hemisferio DERECHO corteza oceánica      r=1.92
  layer_2  → hemisferio DERECHO manto superior        r=1.78
  layer_3  → hemisferio DERECHO manto inferior        r=1.50
  layer_4  → hemisferio DERECHO núcleo externo        r=0.95
  layer_5  → hemisferio DERECHO núcleo interno        r=0.45
"""

import bpy
import math
import sys
import os

OUTPUT = r"D:\CUERPO_HUMANO\Tierra-Interior-Studio\app-assets\3D\capas\planet.glb"

RADII = [2.00, 1.92, 1.78, 1.50, 0.95, 0.45]

LAYER_COLORS = [
    (0.290, 0.376, 0.251, 1.0),   # corteza continental
    (0.165, 0.247, 0.345, 1.0),   # corteza oceánica
    (0.478, 0.157, 0.000, 1.0),   # manto superior
    (0.733, 0.267, 0.000, 1.0),   # manto inferior
    (1.000, 0.467, 0.000, 1.0),   # núcleo externo
    (1.000, 0.878, 0.251, 1.0),   # núcleo interno
]

EMISSIVE_COLORS = [
    (0.030, 0.045, 0.024, 1.0),
    (0.024, 0.032, 0.065, 1.0),
    (0.157, 0.032, 0.000, 1.0),
    (0.355, 0.095, 0.000, 1.0),
    (0.800, 0.188, 0.000, 1.0),
    (1.000, 0.627, 0.000, 1.0),
]


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def make_material(name, base_color, emissive_color, metallic=0.0, roughness=0.75):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True  # noqa: deprecated in Blender 6
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.location = (0, 0)
    bsdf.inputs['Base Color'].default_value    = base_color
    bsdf.inputs['Emission Color'].default_value = emissive_color
    bsdf.inputs['Emission Strength'].default_value = 1.0
    bsdf.inputs['Metallic'].default_value      = metallic
    bsdf.inputs['Roughness'].default_value     = roughness

    output = nodes.new('ShaderNodeOutputMaterial')
    output.location = (300, 0)
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    return mat


def create_hemisphere(name, radius, keep_right=True, segs=64, rings=32):
    """Crea un hemisferio suavizado cortando una esfera UV en x=0."""
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=radius,
        segments=segs,
        ring_count=rings,
        location=(0, 0, 0)
    )
    obj = bpy.context.active_object
    obj.name = name

    bpy.ops.object.shade_smooth()

    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')

    if keep_right:
        # Mantiene x ≥ 0 (hemisferio derecho / corte interior)
        bpy.ops.mesh.bisect(
            plane_co=(0, 0, 0),
            plane_no=(1, 0, 0),
            use_fill=False,
            clear_inner=True,
            clear_outer=False,
            threshold=0.0001
        )
    else:
        # Mantiene x ≤ 0 (hemisferio izquierdo / superficie terrestre)
        bpy.ops.mesh.bisect(
            plane_co=(0, 0, 0),
            plane_no=(1, 0, 0),
            use_fill=False,
            clear_inner=False,
            clear_outer=True,
            threshold=0.0001
        )

    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode='OBJECT')
    return obj


# ── CONSTRUCCIÓN DE LA ESCENA ────────────────────────────────────────────────

clear_scene()

# Capas interiores (hemisferio derecho x ≥ 0)
for i, (radius, color, emissive) in enumerate(zip(RADII, LAYER_COLORS, EMISSIVE_COLORS)):
    is_core = i >= 4
    obj = create_hemisphere(f"layer_{i}", radius, keep_right=True,
                            segs=max(24, 64 - i * 6), rings=max(12, 32 - i * 3))
    mat = make_material(
        name=f"mat_layer_{i}",
        base_color=color,
        emissive_color=emissive,
        metallic=0.7 if is_core else 0.0,
        roughness=0.25 if is_core else 0.85 - i * 0.05,
    )
    obj.data.materials.append(mat)

# Superficie terrestre (hemisferio izquierdo x ≤ 0) — ligeramente más grande
# para no competir en z con la capa 0
surf = create_hemisphere("surface", RADII[0] + 0.003, keep_right=False, segs=64, rings=32)
surf_mat = make_material(
    name="mat_surface",
    base_color=(0.065, 0.180, 0.400, 1.0),  # azul océano (fallback antes de textura NASA)
    emissive_color=(0.000, 0.010, 0.025, 1.0),
    metallic=0.0,
    roughness=0.75,
)
surf.data.materials.append(surf_mat)

# ── EXPORTAR GLB ─────────────────────────────────────────────────────────────

os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)

bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(
    filepath=OUTPUT,
    export_format='GLB',
    use_selection=True,
    export_apply=True,
    export_normals=True,
    export_materials='EXPORT',
    export_cameras=False,
    export_lights=False,
)

print(f"\n[OK] Capas planet exportado → {OUTPUT}\n")
