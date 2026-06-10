"""
Blender 5.1 — Elefante Africano para Hábitats
blender --background --python sabana_elefante.py
"""
import bpy, math, os

OUTPUT = r"D:\CUERPO_HUMANO\Tierra-Interior-Studio\app-assets\3D\animales\sabana\elefante.glb"

def clear_scene():
    if bpy.context.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    for d in [bpy.data.materials, bpy.data.meshes, bpy.data.armatures, bpy.data.actions]:
        for item in list(d): d.remove(item)

clear_scene()

def mat(name, color, roughness=0.90, metallic=0.0):
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

M_SKIN   = mat('m_skin',   (0.440, 0.400, 0.370, 1))  # gris claro
M_DARK   = mat('m_dark',   (0.280, 0.250, 0.230, 1))  # gris oscuro pliegues
M_EYE    = mat('m_eye',    (0.030, 0.025, 0.020, 1), roughness=0.10)
M_TUSK   = mat('m_tusk',   (0.940, 0.900, 0.780, 1), roughness=0.40)
M_NAIL   = mat('m_nail',   (0.760, 0.680, 0.560, 1), roughness=0.55)
M_INNER  = mat('m_inner',  (0.660, 0.540, 0.460, 1))  # interior oreja

def sphere(name, r, loc, scale=(1,1,1), segs=24, rings=16):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc,
                                          segments=segs, ring_count=rings)
    o = bpy.context.active_object; o.name = name
    o.scale = scale; bpy.ops.object.shade_smooth(); return o

def cyl(name, r, depth, loc, rot=(0,0,0), verts=16):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth,
        location=loc, rotation=rot, vertices=verts)
    o = bpy.context.active_object; o.name = name
    bpy.ops.object.shade_smooth(); return o

def assign(obj, m): obj.data.materials.clear(); obj.data.materials.append(m)

# ── Cuerpo ────────────────────────────────────────────────────────────────────
body = sphere('body', 0.58, (0, 0, 0.80), scale=(1.0, 0.70, 0.78))
assign(body, M_SKIN)

# ── Hombros y cadera (abultamientos) ─────────────────────────────────────────
shoulder = sphere('shoulder', 0.28, (0.30, 0, 1.12), scale=(1.0, 0.80, 0.80))
assign(shoulder, M_SKIN)
hip = sphere('hip', 0.24, (-0.30, 0, 1.02), scale=(1.0, 0.80, 0.80))
assign(hip, M_SKIN)

# ── Cuello ────────────────────────────────────────────────────────────────────
neck = cyl('neck', 0.18, 0.32, (0.36, 0, 1.12), rot=(0.55, 0, 0))
assign(neck, M_SKIN)

# ── Cabeza ────────────────────────────────────────────────────────────────────
head = sphere('head', 0.30, (0.48, 0, 1.24), scale=(1.20, 0.85, 0.90), segs=22, rings=16)
assign(head, M_SKIN)

# Frente abultada (característica elefante)
forehead = sphere('forehead', 0.18, (0.46, 0, 1.38), scale=(1.0, 0.85, 0.80))
assign(forehead, M_SKIN)

# ── Trompa ────────────────────────────────────────────────────────────────────
trunk1 = cyl('trunk1', 0.085, 0.38, (0.72, 0, 1.14), rot=(1.50, 0, 0.10))
assign(trunk1, M_SKIN)
trunk2 = cyl('trunk2', 0.075, 0.30, (0.80, 0, 0.77), rot=(2.40, 0, 0.05))
assign(trunk2, M_SKIN)
trunk_tip = sphere('trunk_tip', 0.065, (0.70, 0, 0.52))
assign(trunk_tip, M_DARK)

# ── Colmillos ────────────────────────────────────────────────────────────────
for s in (-1, 1):
    t1 = cyl(f'tusk1_{s}', 0.035, 0.36, (0.68, s*0.09, 1.08), rot=(1.20, s*0.25, 0))
    assign(t1, M_TUSK)
    t2 = cyl(f'tusk2_{s}', 0.025, 0.22, (0.76, s*0.20, 0.82), rot=(1.75, s*0.38, 0))
    assign(t2, M_TUSK)
    tip = sphere(f'tusk_tip_{s}', 0.022, (0.72, s*0.28, 0.68))
    assign(tip, M_TUSK)

# ── Orejas grandes (característica) ──────────────────────────────────────────
for s in (-1, 1):
    ear_out = sphere(f'ear_out_{s}', 0.32, (0.20, s*0.44, 1.10),
                     scale=(0.60, 1.60, 1.30), segs=18, rings=14)
    assign(ear_out, M_SKIN)
    ear_in = sphere(f'ear_in_{s}', 0.24, (0.22, s*0.44, 1.10),
                    scale=(0.55, 1.50, 1.20))
    assign(ear_in, M_INNER)

# ── Ojos ─────────────────────────────────────────────────────────────────────
for s in (-1, 1):
    eye = sphere(f'eye_{s}', 0.040, (0.52, s*0.20, 1.28), segs=14, rings=10)
    assign(eye, M_EYE)

# ── Patas gruesas ─────────────────────────────────────────────────────────────
legs = [
    ('fl', ( 0.32, -0.20)),
    ('fr', ( 0.32,  0.20)),
    ('bl', (-0.28, -0.20)),
    ('br', (-0.28,  0.20)),
]
for n, (lx, ly) in legs:
    upper = cyl(f'upper_{n}', 0.12, 0.44, (lx, ly, 0.44))
    assign(upper, M_SKIN)
    lower = cyl(f'lower_{n}', 0.11, 0.36, (lx, ly, 0.10))
    assign(lower, M_SKIN)
    foot = sphere(f'foot_{n}', 0.130, (lx, ly, -0.08), scale=(1.1, 1.0, 0.55))
    assign(foot, M_DARK)
    for ci, cy in enumerate([-0.06, -0.02, 0.02, 0.06]):
        nl = sphere(f'nail_{n}_{ci}', 0.020, (lx+0.13, ly+cy, -0.10))
        assign(nl, M_NAIL)

# ── Cola ──────────────────────────────────────────────────────────────────────
tail = cyl('tail', 0.028, 0.30, (-0.54, 0, 0.72), rot=(0.25, 0, 0))
assign(tail, M_SKIN)
tail_tuft = sphere('tail_tuft', 0.045, (-0.64, 0, 0.58))
assign(tail_tuft, M_DARK)

# ── Armadura ──────────────────────────────────────────────────────────────────
arm_data = bpy.data.armatures.new('ElefanteArm')
arm_data.display_type = 'STICK'
arm_obj  = bpy.data.objects.new('ElefanteArm', arm_data)
bpy.context.collection.objects.link(arm_obj)
bpy.context.view_layer.objects.active = arm_obj
arm_obj.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')

def eb(name, hd, tl, parent=None):
    b = arm_data.edit_bones.new(name)
    b.head = hd; b.tail = tl
    if parent: b.parent = arm_data.edit_bones[parent]; b.use_connect = False
    return b

eb('root',    (0,0,0),          (0,0,0.06))
eb('body',    (0,0,0.62),       (0,0,1.08),    'root')
eb('neck',    (0.36,0,1.10),    (0.44,0,1.28), 'body')
eb('head',    (0.44,0,1.28),    (0.64,0,1.28), 'neck')
eb('trunk1',  (0.65,0,1.20),    (0.78,0,0.85), 'head')
eb('trunk2',  (0.78,0,0.85),    (0.72,0,0.50), 'trunk1')
eb('ear_l',   (0.20,-0.44,1.10),(0.10,-0.58,1.10),'body')
eb('ear_r',   (0.20, 0.44,1.10),(0.10, 0.58,1.10),'body')
eb('tail',    (-0.50,0,0.72),   (-0.62,0,0.56), 'body')
eb('leg_fl',  (0.32,-0.20,0.72),(0.32,-0.20,-0.12),'body')
eb('leg_fr',  (0.32, 0.20,0.72),(0.32, 0.20,-0.12),'body')
eb('leg_bl',  (-0.28,-0.20,0.72),(-0.28,-0.20,-0.12),'body')
eb('leg_br',  (-0.28, 0.20,0.72),(-0.28, 0.20,-0.12),'body')

bpy.ops.object.mode_set(mode='OBJECT')

all_meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
for o in all_meshes: o.select_set(True)
arm_obj.select_set(True)
bpy.context.view_layer.objects.active = arm_obj
bpy.ops.object.parent_set(type='ARMATURE_NAME')

bpy.context.view_layer.objects.active = arm_obj
bpy.ops.object.mode_set(mode='POSE')
arm_obj.animation_data_create()

def set_rot(pb, rot, frame):
    pb.rotation_mode = 'XYZ'
    pb.rotation_euler = rot
    pb.keyframe_insert('rotation_euler', frame=frame)

# ── Acción 1: idle (trompa oscila) ───────────────────────────────────────────
act_idle = bpy.data.actions.new('idle')
arm_obj.animation_data.action = act_idle

trunk1_pb = arm_obj.pose.bones['trunk1']
trunk2_pb = arm_obj.pose.bones['trunk2']
ear_l_pb  = arm_obj.pose.bones['ear_l']
ear_r_pb  = arm_obj.pose.bones['ear_r']

for fr, ry in [(1,0.0),(25,0.18),(50,0.0),(75,-0.18),(100,0.0),(120,0.0)]:
    set_rot(trunk1_pb, (0,ry,0), fr)
for fr, ry in [(1,0.0),(25,0.12),(50,0.0),(75,-0.12),(100,0.0),(120,0.0)]:
    set_rot(trunk2_pb, (0,ry,0), fr)
# orejas aletean suavemente
for fr, rz in [(1,0.0),(30,0.12),(60,0.0),(90,-0.12),(120,0.0)]:
    set_rot(ear_l_pb, (0,0, rz), fr)
    set_rot(ear_r_pb, (0,0,-rz), fr)

# ── Acción 2: drinking (trompa baja) ─────────────────────────────────────────
act_drink = bpy.data.actions.new('drinking')
arm_obj.animation_data.action = act_drink

for fr, rx in [(1,0.0),(40,0.90),(80,0.90),(110,0.0)]:
    set_rot(trunk1_pb, (rx,0,0), fr)
for fr, rx in [(1,0.0),(40,1.20),(80,1.20),(110,0.0)]:
    set_rot(trunk2_pb, (rx,0,0), fr)

bpy.ops.object.mode_set(mode='OBJECT')

arm_obj.animation_data_create()
for action in [act_idle, act_drink]:
    track = arm_obj.animation_data.nla_tracks.new()
    track.name = action.name
    track.strips.new(action.name, start=1, action=action)

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
print(f'[OK] elefante.glb → {OUTPUT}')
