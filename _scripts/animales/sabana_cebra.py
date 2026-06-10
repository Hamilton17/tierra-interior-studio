"""
Blender 5.1 — Cebra para Hábitats
blender --background --python sabana_cebra.py
"""
import bpy, math, os

OUTPUT = r"D:\CUERPO_HUMANO\Tierra-Interior-Studio\app-assets\3D\animales\sabana\cebra.glb"

def clear_scene():
    if bpy.context.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    for d in [bpy.data.materials, bpy.data.meshes, bpy.data.armatures, bpy.data.actions]:
        for item in list(d): d.remove(item)

clear_scene()

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

M_WHITE  = mat('m_white',  (0.940, 0.930, 0.910, 1))
M_BLACK  = mat('m_black',  (0.040, 0.038, 0.036, 1))
M_MUZZLE = mat('m_muzzle', (0.820, 0.790, 0.750, 1))
M_EYE    = mat('m_eye',    (0.025, 0.020, 0.018, 1), roughness=0.10)
M_HOOF   = mat('m_hoof',   (0.100, 0.088, 0.078, 1), roughness=0.50)

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

def assign_stripe(obj, freq=5):
    """Alterna materiales blanco/negro por polígono para simular rayas."""
    obj.data.materials.clear()
    obj.data.materials.append(M_WHITE)
    obj.data.materials.append(M_BLACK)
    for i, p in enumerate(obj.data.polygons):
        p.material_index = 1 if (i // freq) % 2 == 0 else 0

def assign(obj, m): obj.data.materials.clear(); obj.data.materials.append(m)

# ── Cuerpo ────────────────────────────────────────────────────────────────────
body = sphere('body', 0.40, (0, 0, 0.72), scale=(1.0, 0.58, 0.68))
assign_stripe(body, freq=4)

# ── Cuello ────────────────────────────────────────────────────────────────────
neck = cyl('neck', 0.10, 0.38, (0.18, 0, 1.0), rot=(0.45, 0, 0))
assign_stripe(neck, freq=3)

# ── Crin (cresta de pelo erguida, rayas) ──────────────────────────────────────
mane_body = sphere('mane_body', 0.045, (0.08, 0, 1.12), scale=(0.50, 0.40, 4.0))
assign_stripe(mane_body, freq=2)

# ── Cabeza ────────────────────────────────────────────────────────────────────
head = sphere('head', 0.175, (0.34, 0, 1.12), scale=(1.45, 0.75, 0.80), segs=20, rings=14)
assign_stripe(head, freq=3)

muzzle = sphere('muzzle', 0.095, (0.50, 0, 1.10), scale=(1.4, 0.80, 0.72))
assign(muzzle, M_MUZZLE)

nostrils_l = sphere('nostril_l', 0.020, (0.575, -0.030, 1.12))
nostrils_r = sphere('nostril_r', 0.020, (0.575,  0.030, 1.12))
assign(nostrils_l, M_BLACK)
assign(nostrils_r, M_BLACK)

# ── Ojos ─────────────────────────────────────────────────────────────────────
for s in (-1, 1):
    eye = sphere(f'eye_{s}', 0.038, (0.30, s*0.12, 1.18), segs=14, rings=10)
    assign(eye, M_EYE)
    # halo blanco alrededor del ojo
    eye_ring = sphere(f'eye_ring_{s}', 0.048, (0.296, s*0.118, 1.179), scale=(1.0, 1.2, 1.1))
    assign(eye_ring, M_WHITE)

# ── Orejas ────────────────────────────────────────────────────────────────────
for s in (-1, 1):
    ear = sphere(f'ear_{s}', 0.062, (0.14, s*0.145, 1.22), scale=(0.55, 1.3, 0.70))
    assign_stripe(ear, freq=2)
    ear_in = sphere(f'ear_in_{s}', 0.038, (0.145, s*0.146, 1.225), scale=(0.45, 1.1, 0.60))
    assign(ear_in, M_MUZZLE)

# ── Patas ─────────────────────────────────────────────────────────────────────
legs = [
    ('fl', ( 0.24, -0.14)),
    ('fr', ( 0.24,  0.14)),
    ('bl', (-0.24, -0.14)),
    ('br', (-0.24,  0.14)),
]
for n, (lx, ly) in legs:
    upper = cyl(f'upper_{n}', 0.068, 0.42, (lx, ly, 0.38))
    assign_stripe(upper, freq=4)
    lower = cyl(f'lower_{n}', 0.055, 0.32, (lx, ly, 0.06))
    assign_stripe(lower, freq=3)
    hoof = sphere(f'hoof_{n}', 0.062, (lx, ly, -0.10), scale=(1.1, 0.90, 0.52))
    assign(hoof, M_HOOF)

# ── Cola ──────────────────────────────────────────────────────────────────────
tail = cyl('tail', 0.022, 0.38, (-0.44, 0, 0.60), rot=(0.28, 0, 0))
assign_stripe(tail, freq=2)
tail_tuft = sphere('tail_tuft', 0.055, (-0.56, 0, 0.44))
assign(tail_tuft, M_BLACK)

# ── Armadura ──────────────────────────────────────────────────────────────────
arm_data = bpy.data.armatures.new('CebraArm')
arm_data.display_type = 'STICK'
arm_obj  = bpy.data.objects.new('CebraArm', arm_data)
bpy.context.collection.objects.link(arm_obj)
bpy.context.view_layer.objects.active = arm_obj
arm_obj.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')

def eb(name, hd, tl, parent=None):
    b = arm_data.edit_bones.new(name)
    b.head = hd; b.tail = tl
    if parent: b.parent = arm_data.edit_bones[parent]; b.use_connect = False
    return b

eb('root',   (0,0,0),          (0,0,0.05))
eb('body',   (0,0,0.52),       (0,0,0.88),   'root')
eb('neck',   (0.18,0,0.88),    (0.28,0,1.10),'body')
eb('head',   (0.28,0,1.10),    (0.50,0,1.12),'neck')
eb('tail',   (-0.38,0,0.68),   (-0.54,0,0.48),'body')
eb('leg_fl', (0.24,-0.14,0.70),(0.24,-0.14,-0.14),'body')
eb('leg_fr', (0.24, 0.14,0.70),(0.24, 0.14,-0.14),'body')
eb('leg_bl', (-0.24,-0.14,0.70),(-0.24,-0.14,-0.14),'body')
eb('leg_br', (-0.24, 0.14,0.70),(-0.24, 0.14,-0.14),'body')

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

# ── Acción 1: idle (cabeza sube/baja pastando) ───────────────────────────────
act_idle = bpy.data.actions.new('idle')
arm_obj.animation_data.action = act_idle

head_pb = arm_obj.pose.bones['head']
neck_pb = arm_obj.pose.bones['neck']
tail_pb = arm_obj.pose.bones['tail']

for fr, rx in [(1,0.0),(40,0.30),(80,0.0),(120,0.0)]:
    set_rot(head_pb, (rx,0,0), fr)
for fr, rx in [(1,0.0),(40,0.20),(80,0.0),(120,0.0)]:
    set_rot(neck_pb, (rx,0,0), fr)
for fr, rz in [(1,0.0),(20,0.20),(40,0.0),(60,-0.20),(80,0.0),(100,0.20),(120,0.0)]:
    set_rot(tail_pb, (0,0,rz), fr)

# ── Acción 2: gallop (patas alternan) ────────────────────────────────────────
act_gallop = bpy.data.actions.new('gallop')
arm_obj.animation_data.action = act_gallop

leg_fl = arm_obj.pose.bones['leg_fl']
leg_bl = arm_obj.pose.bones['leg_bl']
leg_fr = arm_obj.pose.bones['leg_fr']
leg_br = arm_obj.pose.bones['leg_br']
body_pb = arm_obj.pose.bones['body']

# Trote alternado simple: FL+BR adelante, luego FR+BL
for fr, rx in [(1,0.0),(15,0.60),(30,0.0),(45,-0.35),(60,0.0),(75,0.60),(90,0.0),(105,-0.35),(120,0.0)]:
    set_rot(leg_fl, (rx,0,0), fr)
for fr, rx in [(1,0.0),(15,-0.35),(30,0.0),(45,0.60),(60,0.0),(75,-0.35),(90,0.0),(105,0.60),(120,0.0)]:
    set_rot(leg_br, (rx,0,0), fr)
for fr, rx in [(1,0.0),(15,-0.35),(30,0.0),(45,0.60),(60,0.0),(75,-0.35),(90,0.0),(105,0.60),(120,0.0)]:
    set_rot(leg_fr, (rx,0,0), fr)
for fr, rx in [(1,0.0),(15,0.60),(30,0.0),(45,-0.35),(60,0.0),(75,0.60),(90,0.0),(105,-0.35),(120,0.0)]:
    set_rot(leg_bl, (rx,0,0), fr)
# Cuerpo oscila ligeramente
for fr, rx in [(1,0.0),(15,0.06),(30,0.0),(45,-0.06),(60,0.0),(75,0.06),(90,0.0),(105,-0.06),(120,0.0)]:
    set_rot(body_pb, (rx,0,0), fr)

bpy.ops.object.mode_set(mode='OBJECT')

arm_obj.animation_data_create()
for action in [act_idle, act_gallop]:
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
print(f'[OK] cebra.glb → {OUTPUT}')
