"""
Blender 5.1 — Jirafa (Giraffe) para Hábitats
blender --background --python sabana_jirafa.py
"""
import bpy, math, os

OUTPUT = r"D:\CUERPO_HUMANO\Tierra-Interior-Studio\app-assets\3D\animales\sabana\jirafa.glb"

# ── Limpiar escena ───────────────────────────────────────────────────────────
def clear_scene():
    if bpy.context.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    for d in [bpy.data.materials, bpy.data.meshes, bpy.data.armatures, bpy.data.actions]:
        for item in list(d): d.remove(item)

clear_scene()

# ── Materiales ───────────────────────────────────────────────────────────────
def mat(name, color, roughness=0.82, metallic=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nd = m.node_tree.nodes; lk = m.node_tree.links; nd.clear()
    b = nd.new('ShaderNodeBsdfPrincipled')
    b.inputs['Base Color'].default_value = color
    b.inputs['Roughness'].default_value  = roughness
    b.inputs['Metallic'].default_value   = metallic
    o = nd.new('ShaderNodeOutputMaterial')
    lk.new(b.outputs['BSDF'], o.inputs['Surface'])
    return m

M_BODY  = mat('m_body',  (0.898, 0.627, 0.200, 1))  # naranja-dorado
M_SPOT  = mat('m_spot',  (0.290, 0.118, 0.035, 1))  # café oscuro manchas
M_HOOF  = mat('m_hoof',  (0.118, 0.090, 0.055, 1))  # pezuña oscura
M_EYE   = mat('m_eye',   (0.020, 0.012, 0.008, 1), roughness=0.15, metallic=0.15)
M_HORN  = mat('m_horn',  (0.220, 0.165, 0.090, 1))
M_NOSE  = mat('m_nose',  (0.780, 0.490, 0.310, 1))

# ── Helpers para crear primitivas ────────────────────────────────────────────
def sphere(name, r, loc, scale=(1,1,1), segs=24, rings=16):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc,
                                          segments=segs, ring_count=rings)
    o = bpy.context.active_object; o.name = name
    o.scale = scale; bpy.ops.object.shade_smooth(); return o

def cyl(name, r, depth, loc, rot=(0,0,0), verts=16):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth,
        location=loc, rotation=rot, vertices=verts, end_fill_type='NGON')
    o = bpy.context.active_object; o.name = name
    bpy.ops.object.shade_smooth(); return o

def cone(name, r1, r2, depth, loc, rot=(0,0,0)):
    bpy.ops.mesh.primitive_cone_add(radius1=r1, radius2=r2, depth=depth,
        location=loc, rotation=rot, vertices=16)
    o = bpy.context.active_object; o.name = name
    bpy.ops.object.shade_smooth(); return o

def assign_mat(obj, primary_mat, spot_mat=None, spot_freq=7):
    obj.data.materials.clear()
    obj.data.materials.append(primary_mat)
    if spot_mat:
        obj.data.materials.append(spot_mat)
        for i, p in enumerate(obj.data.polygons):
            p.material_index = 1 if i % spot_freq in (0,) else 0

# ── Cuerpo principal ─────────────────────────────────────────────────────────
body  = sphere('body',  0.36, (0, 0, 1.08), scale=(1.0, 0.62, 0.72))
assign_mat(body, M_BODY, M_SPOT, 6)

# ── Cuello ───────────────────────────────────────────────────────────────────
neck  = cyl('neck', 0.10, 0.82, (0.05, 0, 1.62), rot=(0.22, 0, 0))
assign_mat(neck, M_BODY, M_SPOT, 4)

# Transición cuello-cuerpo (esfera pequeña que une)
neck_base = sphere('neck_base', 0.13, (0.02, 0, 1.26), scale=(1.0, 0.8, 0.8))
assign_mat(neck_base, M_BODY)

# ── Cabeza ───────────────────────────────────────────────────────────────────
head = sphere('head', 0.155, (0.14, 0, 2.10), scale=(1.5, 0.78, 0.80), segs=20, rings=14)
assign_mat(head, M_BODY)

muzzle = sphere('muzzle', 0.075, (0.265, 0, 2.05), scale=(1.4, 0.85, 0.65))
muzzle.data.materials.append(M_NOSE)

# ── Ojos ─────────────────────────────────────────────────────────────────────
for s in (-1, 1):
    e = sphere(f'eye_{s}', 0.032, (0.13, s*0.11, 2.15), segs=12, rings=8)
    assign_mat(e, M_EYE)
    pupil = sphere(f'pupil_{s}', 0.018, (0.148, s*0.118, 2.150), segs=10, rings=8)
    assign_mat(pupil, mat(f'pupil_m{s}', (0.005, 0.003, 0.003, 1), roughness=0.05, metallic=0.3))

# ── Ossicones (cuernitos) ────────────────────────────────────────────────────
for s in (-1, 1):
    o = cyl(f'ossicone_{s}', 0.020, 0.14, (0.04, s*0.068, 2.26))
    assign_mat(o, M_HORN)
    tip = sphere(f'osstip_{s}', 0.028, (0.04, s*0.068, 2.34), segs=10, rings=8)
    assign_mat(tip, M_HORN)

# ── Orejas ───────────────────────────────────────────────────────────────────
for s in (-1, 1):
    ear = sphere(f'ear_{s}', 0.058, (-0.03, s*0.130, 2.17), scale=(0.55, 1.3, 0.6))
    assign_mat(ear, M_BODY)

# ── Patas (4) ────────────────────────────────────────────────────────────────
legs = [
    ('fl', ( 0.22, -0.14)),
    ('fr', ( 0.22,  0.14)),
    ('bl', (-0.22, -0.14)),
    ('br', (-0.22,  0.14)),
]
for lname, (lx, ly) in legs:
    upper = cyl(f'upper_{lname}', 0.062, 0.42, (lx, ly, 0.68))
    assign_mat(upper, M_BODY, M_SPOT, 9)
    lower = cyl(f'lower_{lname}', 0.050, 0.40, (lx, ly, 0.29))
    assign_mat(lower, M_BODY)
    hf    = cyl(f'hoof_{lname}',  0.062, 0.07, (lx, ly, 0.065))
    assign_mat(hf, M_HOOF)

# ── Cola ─────────────────────────────────────────────────────────────────────
tail = cyl('tail', 0.025, 0.28, (-0.38, 0, 0.88), rot=(0.35, 0, 0))
assign_mat(tail, M_BODY)
tuft = sphere('tail_tuft', 0.050, (-0.48, 0, 0.72))
assign_mat(tuft, M_SPOT)

# ── Armadura ─────────────────────────────────────────────────────────────────
arm_data = bpy.data.armatures.new('JirafaArm')
arm_data.display_type = 'STICK'
arm_obj  = bpy.data.objects.new('JirafaArm', arm_data)
bpy.context.collection.objects.link(arm_obj)
bpy.context.view_layer.objects.active = arm_obj
arm_obj.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')

def eb(name, hd, tl, parent=None):
    b = arm_data.edit_bones.new(name)
    b.head = hd; b.tail = tl
    if parent: b.parent = arm_data.edit_bones[parent]; b.use_connect = False
    return b

eb('root',   (0,0,0),         (0,0,0.08))
eb('body',   (0,0,0.85),      (0,0,1.22),   'root')
eb('neck',   (0.04,0,1.24),   (0.10,0,1.88),'body')
eb('head',   (0.10,0,1.88),   (0.22,0,2.16),'neck')
eb('tail',   (-0.30,0,0.94),  (-0.46,0,0.74),'body')
eb('leg_fl', (0.22,-0.14,1.0),(0.22,-0.14,0.06),'body')
eb('leg_fr', (0.22, 0.14,1.0),(0.22, 0.14,0.06),'body')
eb('leg_bl', (-0.22,-0.14,1.0),(-0.22,-0.14,0.06),'body')
eb('leg_br', (-0.22, 0.14,1.0),(-0.22, 0.14,0.06),'body')

bpy.ops.object.mode_set(mode='OBJECT')

# Parentar todas las mallas a la armadura
all_meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
for o in all_meshes: o.select_set(True)
arm_obj.select_set(True)
bpy.context.view_layer.objects.active = arm_obj
bpy.ops.object.parent_set(type='ARMATURE_NAME')

# ── Animaciones ──────────────────────────────────────────────────────────────
bpy.context.view_layer.objects.active = arm_obj
bpy.ops.object.mode_set(mode='POSE')
arm_obj.animation_data_create()

def set_rot(pb, rot, frame):
    pb.rotation_mode = 'XYZ'
    pb.rotation_euler = rot
    pb.keyframe_insert('rotation_euler', frame=frame)

def set_loc(pb, loc, frame):
    pb.keyframe_insert('location', frame=frame)

# ── Acción 1: idle (balanceo del cuello) ─────────────────────────────────────
act_idle = bpy.data.actions.new('idle')
arm_obj.animation_data.action = act_idle

neck_pb = arm_obj.pose.bones['neck']
head_pb = arm_obj.pose.bones['head']
body_pb = arm_obj.pose.bones['body']

# Cuello: balanceo izquierda-derecha en 120 frames
for fr, rz in [(1,0.0),(30,0.12),(60,0.0),(90,-0.12),(120,0.0)]:
    set_rot(neck_pb, (0, 0, rz), fr)
for fr, rx in [(1,0.0),(60,0.025),(120,0.0)]:
    set_rot(body_pb, (rx, 0, 0), fr)
for fr, rz in [(1,0.0),(30,0.06),(60,0.0),(90,-0.06),(120,0.0)]:
    set_rot(head_pb, (0, 0, rz), fr)

# ── Acción 2: eating (cuello baja a beber agua) ───────────────────────────────
act_eat = bpy.data.actions.new('eating')
arm_obj.animation_data.action = act_eat

for fr, rx in [(1,0.0),(35,0.65),(80,0.65),(110,0.0)]:
    set_rot(neck_pb, (rx, 0, 0), fr)
for fr, rx in [(1,0.0),(35,0.30),(80,0.30),(110,0.0)]:
    set_rot(head_pb, (rx, 0, 0), fr)

bpy.ops.object.mode_set(mode='OBJECT')

# Empujar al NLA para que ambas acciones se exporten
arm_obj.animation_data_create()
for action in [act_idle, act_eat]:
    track = arm_obj.animation_data.nla_tracks.new()
    track.name = action.name
    track.strips.new(action.name, start=1, action=action)

# ── Exportar ─────────────────────────────────────────────────────────────────
bpy.ops.object.select_all(action='SELECT')
os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
bpy.ops.export_scene.gltf(
    filepath=OUTPUT,
    export_format='GLB',
    use_selection=True,
    export_apply=True,
    export_normals=True,
    export_materials='EXPORT',
    export_cameras=False,
    export_lights=False,
    export_animations=True,
    export_nla_strips=True,
)
print(f'[OK] jirafa.glb → {OUTPUT}')
