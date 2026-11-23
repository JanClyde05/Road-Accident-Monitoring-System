"""Rig the supplied fan model for the exhibit. Requires Python and NumPy.

The exhibit stores four per-vertex garment regions on the pinned source mesh.
They keep hanging hair on the head while the hands and legs move independently.
"""
import argparse
import hashlib
import json
import struct
import zlib
from pathlib import Path

import numpy as np


SOURCE_SHA = "694d18611b0f14103a87a2b8010e0e3193f11fe3097496f9633c4a11aed72e5a"
HERE = Path(__file__).resolve().parent
DEFAULT_SOURCE = HERE.parents[5] / "docs/3D models/Hatsune Miku/source/ip-vocaloid__hatsune-miku__concept__tpose.glb"


def rig(source, destination):
    raw = source.read_bytes()
    if hashlib.sha256(raw).hexdigest() != SOURCE_SHA:
        raise ValueError("Bone landmarks are measured on the supplied Leon Okafor GLB.")
    length = struct.unpack_from("<I", raw, 12)[0]
    original = json.loads(raw[20:20 + length])
    data = raw[28 + length:]

    def source_array(index):
        a = original["accessors"][index]
        v = original["bufferViews"][a["bufferView"]]
        width = {"VEC3": 3, "VEC2": 2, "SCALAR": 1}[a["type"]]
        dtype = np.dtype({5126: "<f4", 5125: "<u4", 5123: "<u2"}[a["componentType"]])
        offset = v.get("byteOffset", 0) + a.get("byteOffset", 0)
        return np.ndarray((a["count"], width), dtype, buffer=data, offset=offset,
                          strides=(v.get("byteStride", width * dtype.itemsize), dtype.itemsize))

    primitive = original["meshes"][0]["primitives"][0]
    p = source_array(primitive["attributes"]["POSITION"])
    normals = source_array(primitive["attributes"]["NORMAL"])
    uv = source_array(primitive["attributes"]["TEXCOORD_0"])
    indices = source_array(primitive["indices"]).reshape(-1, 3)
    # Region IDs follow the original vertex order. A tiny compressed mask keeps
    # the exhibit's character-specific garment selections reproducible.
    region = HERE / "assets" / "miku-body-regions.bin"
    group = np.frombuffer(zlib.decompress(region.read_bytes()), dtype=np.uint8)
    assert len(group) == len(p)
    # UV splits need separate attributes but must meet at the same position,
    # otherwise one side of a texture seam can pull away from its neighbour.
    spatial = np.column_stack((group, np.floor(p / .006))).astype(np.int32)
    _, spatial_ids = np.unique(spatial, axis=0, return_inverse=True)
    count = np.bincount(spatial_ids)
    centers = np.column_stack([np.bincount(spatial_ids, weights=axis) / count for axis in p.T])
    cells = np.column_stack((spatial_ids, np.floor(uv * 190))).astype(np.int32)
    _, keep, remap = np.unique(cells, axis=0, return_index=True, return_inverse=True)
    faces = remap[indices]
    faces = faces[(faces[:, 0] != faces[:, 1]) & (faces[:, 1] != faces[:, 2]) & (faces[:, 2] != faces[:, 0])]
    p, group = centers[spatial_ids[keep]], group[keep]
    x, y, z = p.T
    # Front is source +X. Rotate into glTF +Z and fit a standing height of 1.65 m.
    scale = .825
    xyz = np.column_stack((-z, y + 1, x - .111)) * scale
    normal = normals[keep][:, [2, 1, 0]].copy()
    normal[:, 0] *= -1
    j = {"asset": {"version": "2.0", "generator": "RAMS exhibit character adapter",
                   "copyright": "Mesh by Leon Okafor (CC BY 4.0). Hatsune Miku by Crypton Future Media (CC BY-NC 3.0)."},
         "scene": 0, "scenes": [{"nodes": []}], "nodes": [], "buffers": [], "bufferViews": [],
         "accessors": [], "animations": [], "materials": original["materials"],
         "textures": original["textures"], "samplers": original.get("samplers", []), "images": []}
    blob = bytearray()

    def buffer_view(buffer):
        while len(blob) % 4:
            blob.append(0)
        n = len(j["bufferViews"])
        j["bufferViews"].append({"buffer": 0, "byteOffset": len(blob), "byteLength": len(buffer)})
        blob.extend(buffer)
        return n

    def accessor(array, dtype, component, kind, bounds=False):
        a = np.ascontiguousarray(array, dtype=dtype)
        info = {"bufferView": buffer_view(a.tobytes()), "componentType": component, "count": len(a), "type": kind}
        if bounds:
            info.update(min=a.min(axis=0).reshape(-1).tolist(), max=a.max(axis=0).reshape(-1).tolist())
        j["accessors"].append(info)
        return len(j["accessors"]) - 1

    bone_index, bind = {}, []
    def add(name, parent, raw_xyz):
        point = np.asarray(raw_xyz)
        world = np.array([point[0], point[1] + 1, point[2] - .111]) * scale
        i = len(bind)
        bind.append(world)
        bone_index[name] = i
        n = {"name": name, "translation": (world - (bind[bone_index[parent]] if parent else 0)).tolist()}
        if parent:
            j["nodes"][bone_index[parent]].setdefault("children", []).append(i)
        j["nodes"].append(n)

    add("hips", None, [0, .08, .115])
    add("spine", "hips", [0, .23, .12])
    add("chest", "spine", [0, .40, .12])
    add("neck", "chest", [0, .602, .13])
    add("head", "neck", [0, .655, .12])
    for s, suffix in [(1, "_L"), (-1, "_R")]:
        add("upperarm"+suffix, "chest", [s*.133, .585, .115])
        add("forearm"+suffix, "upperarm"+suffix, [s*.418, .577, .108])
        add("hand"+suffix, "forearm"+suffix, [s*.646, .564, .106])
        add("thigh"+suffix, "hips", [s*.105, .082, .12])
        add("calf"+suffix, "thigh"+suffix, [s*.145, -.414, .108])
        add("foot"+suffix, "calf"+suffix, [s*.173, -.925, .091])
        add("tail"+suffix, "head", [s*.14, .903, .074])
        add("tailMid"+suffix, "tail"+suffix, [s*.258, .442, -.095])
        add("tailTip"+suffix, "tailMid"+suffix, [s*.437, -.042, -.151])

    def ramp(a, b, val):
        h = np.clip((val - a) / (b - a), 0, 1)
        return h*h*(3-2*h)
    body, arms, boots = group == 1, group == 2, group == 3
    w = np.zeros((len(p),len(bind)), dtype=np.float32)
    def assign(name, val):
        w[:, bone_index[name]] += val
    shoulder = ramp(.085,.18,np.abs(z))*arms
    remaining = (body | arms | boots).astype(float)-shoulder
    # Skirt drapes with pelvis and upper thighs. Skin of each leg flexes at its knee.
    legs = (body | boots) * (1-ramp(.025,.112,y))
    remaining -= legs
    spine = ramp(.105,.27,y)
    chest = ramp(.30,.47,y)
    assign("hips", remaining*(1-spine))
    assign("spine",remaining*spine*(1-chest))
    assign("chest",remaining*spine*chest)
    hair_or_head = ~(body|arms|boots)
    # Face and hair share two connected islands. Use width and back depth
    # at the ties to blend into a three-joint chain without moving the face.
    tail = hair_or_head*ramp(.125,.176,np.abs(z))*(1-ramp(.86,.945,y))
    assign("head",hair_or_head-tail)
    for suffix, side in [("_L",z<=0),("_R",z>0)]:
        elbow, wrist = ramp(.37,.459,np.abs(z)), ramp(.61,.669,np.abs(z))
        a=shoulder*side
        assign("upperarm"+suffix,a*(1-elbow))
        assign("forearm"+suffix,a*elbow*(1-wrist))
        assign("hand"+suffix,a*elbow*wrist)
        g=legs*side
        knee=1-ramp(-.472,-.361,y)
        ankle=1-ramp(-.962,-.88,y)
        assign("thigh"+suffix,g*(1-knee))
        assign("calf"+suffix,g*knee*(1-ankle))
        assign("foot"+suffix,g*knee*ankle)
        g=tail*side
        mid=1-ramp(.32,.56,y)
        tip=1-ramp(-.15,.07,y)
        assign("tail"+suffix,g*(1-mid))
        assign("tailMid"+suffix,g*mid*(1-tip))
        assign("tailTip"+suffix,g*mid*tip)
    joints=np.argsort(w,axis=1)[:,-4:][:,::-1]
    weights=np.take_along_axis(w,joints,axis=1)
    assert np.min(weights.sum(1))>.997
    for name in ("hips", "head", "hand_R", "forearm_L", "calf_R", "foot_L", "tail_L"):
        assert np.count_nonzero(joints[:, 0] == bone_index[name]) > 100, f"Missing skin weights for {name}"
    weights/=weights.sum(1)[:,None]
    ids = accessor(faces.reshape(-1), "<u4", 5125, "SCALAR")
    attrs={"POSITION":accessor(xyz,"<f4",5126,"VEC3",True),
           "NORMAL":accessor(normal,"<f4",5126,"VEC3"),
           "TEXCOORD_0":accessor(uv[keep],"<f4",5126,"VEC2"),
           "JOINTS_0":accessor(joints,"<u1",5121,"VEC4"),
           "WEIGHTS_0":accessor(weights,"<f4",5126,"VEC4")}
    j["meshes"]=[{"name":"Miku","primitives":[{"attributes":attrs,"indices":ids,"material":0}]}]
    mesh_node=len(bind)
    j["nodes"].append({"name":"MikuSkinned","mesh":0,"skin":0})
    j["scenes"][0]["nodes"]=[0,mesh_node]
    ibm=np.repeat(np.eye(4)[None,:,:],len(bind),axis=0)
    ibm[:,3,:3]=-np.array(bind)
    j["skins"]=[{"joints":list(range(len(bind))),"skeleton":0,"inverseBindMatrices":accessor(ibm,"<f4",5126,"MAT4")}]
    # Time-normalised clip poses. All joints receive tracks, so an interrupted
    # pose can always be reconstructed by sampling a frame in isolation.
    for name,duration in [("idle",2.4),("walk",1.05)]:
        times=np.linspace(0,duration,33)
        turn=times/duration*np.pi*2
        time_id=accessor(times,"<f4",5126,"SCALAR",True)
        anime={"name":name,"channels":[],"samplers":[]}
        def channel(bone,path,values):
            a=accessor(values,"<f4",5126,"VEC4" if path=="rotation" else "VEC3")
            idx=len(anime["samplers"]);anime["samplers"].append({"input":time_id,"output":a})
            anime["channels"].append({"sampler":idx,"target":{"node":bone_index[bone],"path":path}})
        for bone in bone_index:
            rx,ry,rz=np.zeros_like(times),np.zeros_like(times),np.zeros_like(times)
            side=1 if bone.endswith("_L") else -1
            cycle=turn if side==1 else turn+np.pi
            move=name=="walk"
            if bone.startswith("upperarm"):
                rz[:]=-side*1.40
                if move:rx+=.32*np.sin(cycle)
            elif bone.startswith("forearm"):
                rx[:]=-.105 if move else -.04
            elif move and bone.startswith("thigh"):rx+=.46*np.sin(cycle)
            elif move and bone.startswith("calf"):rx+=.56*np.maximum(0,np.cos(cycle))
            elif move and bone.startswith("foot"):rx-=.24*np.sin(cycle)
            elif bone=="chest":ry+=np.sin(turn)*(.07 if move else .018)
            elif bone.startswith("tail"):rx+=.035*np.sin(turn-.6);rz+=side*.025*np.cos(turn)
            elif bone=="head":ry+=np.sin(turn)*.014
            sx,cx,sy,cy,sz,cz=np.sin(rx/2),np.cos(rx/2),np.sin(ry/2),np.cos(ry/2),np.sin(rz/2),np.cos(rz/2)
            channel(bone,"rotation",np.column_stack((sx*cy*cz+cx*sy*sz,cx*sy*cz-sx*cy*sz,cx*cy*sz+sx*sy*cz,cx*cy*cz-sx*sy*sz)))
        off=np.repeat(bind[0][None,:],len(times),axis=0)
        off[:,1]+=(.018*np.cos(2*turn) if name=="walk" else .003*np.sin(turn))
        channel("hips","translation",off)
        j["animations"].append(anime)
    for im in original["images"]:
        v=original["bufferViews"][im["bufferView"]]
        start=v.get("byteOffset",0)
        j["images"].append({**im,"bufferView":buffer_view(data[start:start+v["byteLength"]])})
    while len(blob)%4:blob.append(0)
    j["buffers"].append({"byteLength":len(blob)})
    json_chunk=json.dumps(j,separators=(",",":")).encode()
    json_chunk+=b" "*(-len(json_chunk)%4)
    payload=struct.pack("<I4s",len(json_chunk),b"JSON")+json_chunk+struct.pack("<I4s",len(blob),b"BIN\x00")+blob
    destination.write_bytes(struct.pack("<4sII",b"glTF",2,len(payload)+12)+payload)
    print(f"{len(p):,} vertices, {len(faces):,} triangles, {len(bind)} bones, {destination.stat().st_size:,} bytes")


if __name__=="__main__":
    cli=argparse.ArgumentParser(description=__doc__)
    cli.add_argument("source",type=Path,nargs="?",default=DEFAULT_SOURCE)
    cli.add_argument("--out",type=Path,default=HERE/"assets"/"miku-rigged.glb")
    options=cli.parse_args()
    rig(options.source, options.out)

