"""
Blender script: genera el planeta para el visor de ecosistemas → planet.glb
Uso: blender --background --python create_ecosistemas_planet.py

Produce 3 objetos:
  earth       → esfera completa  r=1.000  (textura Blue Marble en Three.js)
  clouds      → esfera completa  r=1.008  (capa de nubes semi-transparente)
  atmosphere  → esfera completa  r=1.025  (halo atmosférico)
"""

import bpy
import os

OUTPUT = r"D:\CUERPO_HUMANO\Tierra-Interior-Studio\app-assets\3D\ecosistemas\planet.glb"


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def make_material(name, base_color, roughness=0.7, metallic=0.0, alpha=1.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.location = (0, 0)
    bsdf.inputs['Base Color'].default_value = base_color
    bsdf.inputs['Roughness'].default_value  = roughness
    bsdf.inputs['Metallic'].default_value   = metallic
    if alpha < 1.0:
        mat.blend_method = 'BLEND'
        bsdf.inputs['Alpha'].default_value  = alpha

    output = nodes.new('ShaderNodeOutputMaterial')
    output.location = (300, 0)
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    return mat


def create_sphere(name, radius, segs=64, rings=32):
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=radius,
        segments=segs,
        ring_count=rings,
        location=(0, 0, 0)
    )
    obj = bpy.context.active_object
    obj.name = name
    bpy.ops.object.shade_smooth()
    return obj


# ── CONSTRUCCIÓN DE LA ESCENA ────────────────────────────────────────────────

clear_scene()

# Cuerpo terrestre — alta resolución para UV correcto y click preciso
earth = create_sphere("earth", 1.000, segs=128, rings=64)
earth_mat = make_material(
    name="mat_earth",
    base_color=(0.065, 0.255, 0.510, 1.0),  # fallback oceánico antes de textura NASA
    roughness=0.70,
    metallic=0.0,
)
earth.data.materials.append(earth_mat)

# Capa de nubes
clouds = create_sphere("clouds", 1.008, segs=64, rings=32)
clouds_mat = make_material(
    name="mat_clouds",
    base_color=(1.000, 1.000, 1.000, 1.0),
    roughness=0.9,
    alpha=0.30,
)
clouds.data.materials.append(clouds_mat)

# Halo atmosférico exterior
atm = create_sphere("atmosphere", 1.025, segs=64, rings=32)
atm_mat = make_material(
    name="mat_atmosphere",
    base_color=(0.267, 0.533, 1.000, 1.0),
    roughness=1.0,
    alpha=0.10,
)
atm.data.materials.append(atm_mat)

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

print(f"\n[OK] Ecosistemas planet exportado → {OUTPUT}\n")
