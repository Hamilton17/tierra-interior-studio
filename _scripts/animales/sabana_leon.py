"""
Blender 5.1 — León (Lion) para Hábitats
blender --background --python sabana_leon.py
"""
import bpy, math, os

OUTPUT = r"D:\CUERPO_HUMANO\Tierra-Interior-Studio\app-assets\3D\animales\sabana\leon.glb"

def clear_scene():
    if bpy.context.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    for d in [bpy.data.materials, bpy.data.meshes, bpy.data.armatures, bpy.data.actions]:
        for item in list(d): d.remove(item)

clear_scene()

def mat(name, color, roughness=0.80, metallic=0.0, emit_col=None, emit_str=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nd = m.node_tree.nodes; lk = m.node_tree.links; nd.clear()
    b = nd.new('ShaderNodeBsdfPrincipled')
    b.inputs['Base Color'].default_value = color
    b.inputs['Roughness'].default_value  = roughness
    b.inputs['Metallic'].default_value   = metallic
    if emit_col:
        b.inputs['Emission Color'].default_value = emit_col
        b.inputs['Emission Strength'].default_value = emit_str
    o = nd.new('ShaderNodeOutputMaterial')
    lk.new(b.outputs['BSDF'], o.inputs['Surface'])
    return m

M_FUR    = mat('m_fur',   (0.820, 0.600, 0.280, 1))  # dorado leonado
M_BELLY  = mat('m_belly', (0.910, 0.780, 0.540, 1))  # crema vientre
M_MANE   = mat('m_mane',  (0.220, 0.145, 0.060, 1), roughness=0.95)  # melena oscura
M_NOSE   = mat('m_nose',  (0.180, 0.080, 0.080, 1))
M_EYE    = mat('m_eye',   (0.480, 0.300, 0.020, 1), roughness=0.12, metallic=0.08)
M_PUPIL  = mat('m_pupil', (0.010, 0.008, 0.008, 1), roughness=0.05)
M_CLAW   = mat('m_claw',  (0.900, 0.820, 0.650, 1), roughness=0.45)
M_TUFT   = mat('m_tuft',  (0.180, 0.120, 0.050, 1), roughness=0.95)

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
body = sphere('body', 0.38, (0,0,0.60), scale=(1.0, 0.60, 0.65))
assign(body, M_FUR)

# vientre más claro
belly = sphere('belly', 0.28, (0.05, 0, 0.45), scale=(0.9, 0.50, 0.55))
assign(belly, M_BELLY)

# ── Cuello ────────────────────────────────────────────────────────────────────
neck = cyl('neck', 0.12, 0.28, (0.18, 0, 0.88), rot=(0.55, 0, 0))
assign(neck, M_FUR)

# ── Melena (esfera aplanada grande) ──────────────────────────────────────────
mane = sphere('mane', 0.30, (0.28, 0, 0.98), scale=(1.15, 1.0, 1.0), segs=20, rings=14)
assign(mane, M_MANE)
mane_ring = sphere('mane_ring', 0.22, (0.30, 0, 0.98), scale=(1.1, 1.15, 0.85))
assign(mane_ring, M_MANE)

# ── Cabeza ────────────────────────────────────────────────────────────────────
head = sphere('head', 0.21, (0.34, 0, 1.00), scale=(1.25, 0.90, 0.90), segs=20, rings=14)
assign(head, M_FUR)
muzzle = sphere('muzzle', 0.13, (0.48, 0, 0.97), scale=(1.2, 0.88, 0.70))
assign(muzzle, M_BELLY)
nose = sphere('nose', 0.040, (0.57, 0, 1.02), scale=(1.2, 0.80, 0.70))
assign(nose, M_NOSE)

# ── Ojos ─────────────────────────────────────────────────────────────────────
for s in (-1, 1):
    eye = sphere(f'eye_{s}', 0.045, (0.38, s*0.115, 1.05), segs=14, rings=10)
    assign(eye, M_EYE)
    pupil = sphere(f'pupil_{s}', 0.025, (0.406, s*0.122, 1.050), segs=12, rings=8)
    assign(pupil, M_PUPIL)

# ── Orejas ────────────────────────────────────────────────────────────────────
for s in (-1, 1):
    ear = sphere(f'ear_{s}', 0.065, (0.22, s*0.19, 1.08), scale=(0.65, 1.25, 0.75))
    assign(ear, M_FUR)
    inner = sphere(f'inner_ear_{s}', 0.040, (0.225, s*0.192, 1.085), scale=(0.55, 1.0, 0.65))
    assign(inner, M_NOSE)

# ── Patas delanteras ─────────────────────────────────────────────────────────
front_legs = [('fl', (0.22,-0.14)), ('fr', (0.22, 0.14))]
for n, (lx, ly) in front_legs:
    upper = cyl(f'upper_{n}', 0.080, 0.38, (lx, ly, 0.32))
    assign(upper, M_FUR)
    lower = cyl(f'lower_{n}', 0.065, 0.30, (lx, ly, 0.03))
    assign(lower, M_FUR)
    paw = sphere(f'paw_{n}', 0.085, (lx, ly, -0.11), scale=(1.2, 0.90, 0.50))
    assign(paw, M_BELLY)
    for ci, cx in enumerate([-0.04, 0, 0.04]):
        cl = cyl(f'claw_{n}_{ci}', 0.012, 0.06, (lx+0.08+cx, ly, -0.14), rot=(0,0.4,0))
        assign(cl, M_CLAW)

# ── Patas traseras ────────────────────────────────────────────────────────────
back_legs = [('bl', (-0.22,-0.14)), ('br', (-0.22, 0.14))]
for n, (lx, ly) in back_legs:
    upper = cyl(f'upper_{n}', 0.090, 0.38, (lx, ly, 0.32))
    assign(upper, M_FUR)
    lower = cyl(f'lower_{n}', 0.070, 0.32, (lx, ly, 0.03))
    assign(lower, M_FUR)
    paw = sphere(f'paw_{n}', 0.090, (lx, ly, -0.11), scale=(1.1, 0.90, 0.50))
    assign(paw, M_BELLY)

# ── Cola ──────────────────────────────────────────────────────────────────────
tail = cyl('tail', 0.030, 0.45, (-0.45, 0, 0.50), rot=(0.30, 0, 0))
assign(tail, M_FUR)
tail2 = cyl('tail2', 0.025, 0.22, (-0.63, 0, 0.32), rot=(0.65, 0, 0))
assign(tail2, M_FUR)
tuft = sphere('tuft', 0.065, (-0.72, 0, 0.22))
assign(tuft, M_TUFT)

# ── Armadura ──────────────────────────────────────────────────────────────────
arm_data = bpy.data.armatures.new('LeonArm')
arm_data.display_type = 'STICK'
arm_obj  = bpy.data.objects.new('LeonArm', arm_data)
bpy.context.collection.objects.link(arm_obj)
bpy.context.view_layer.objects.active = arm_obj
arm_obj.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')

def eb(name, hd, tl, parent=None):
    b = arm_data.edit_bones.new(name)
    b.head = hd; b.tail = tl
    if parent: b.parent = arm_data.edit_bones[parent]; b.use_connect = False
    return b

eb('root',   (0,0,0),         (0,0,0.05))
eb('body',   (0,0,0.40),      (0,0,0.78),   'root')
eb('neck',   (0.18,0,0.80),   (0.28,0,1.00),'body')
eb('head',   (0.28,0,1.00),   (0.52,0,1.00),'neck')
eb('tail',   (-0.35,0,0.58),  (-0.70,0,0.24),'body')
eb('leg_fl', (0.22,-0.14,0.55),(0.22,-0.14,-0.14),'body')
eb('leg_fr', (0.22, 0.14,0.55),(0.22, 0.14,-0.14),'body')
eb('leg_bl', (-0.22,-0.14,0.55),(-0.22,-0.14,-0.14),'body')
eb('leg_br', (-0.22, 0.14,0.55),(-0.22, 0.14,-0.14),'body')

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

# ── Acción 1: idle (respiración + cola) ──────────────────────────────────────
act_idle = bpy.data.actions.new('idle')
arm_obj.animation_data.action = act_idle

body_pb = arm_obj.pose.bones['body']
tail_pb = arm_obj.pose.bones['tail']
head_pb = arm_obj.pose.bones['head']

for fr, sz in [(1, (1,1,1)),(30,(1,1,1.03)),(60,(1,1,1)),(90,(1,1,0.97)),(120,(1,1,1))]:
    body_pb.scale = sz
    body_pb.keyframe_insert('scale', frame=fr)

for fr, rz in [(1,0.0),(20,0.25),(50,0.0),(80,-0.25),(110,0.0),(120,0.0)]:
    set_rot(tail_pb, (0,0,rz), fr)

for fr, rx in [(1,0),(60,0.05),(120,0)]:
    set_rot(head_pb, (rx,0,0), fr)

# ── Acción 2: roar (cabeza arriba + cuerpo tensión) ───────────────────────────
act_roar = bpy.data.actions.new('roar')
arm_obj.animation_data.action = act_roar

for fr, rx in [(1,0.0),(25,-0.50),(50,-0.55),(75,-0.50),(100,0.0)]:
    set_rot(head_pb, (rx,0,0), fr)
for fr, rz in [(1,0.0),(25,0.45),(50,0.0),(75,-0.45),(100,0.0)]:
    set_rot(tail_pb, (0,0,rz), fr)

bpy.ops.object.mode_set(mode='OBJECT')

arm_obj.animation_data_create()
for action in [act_idle, act_roar]:
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
print(f'[OK] leon.glb → {OUTPUT}')
