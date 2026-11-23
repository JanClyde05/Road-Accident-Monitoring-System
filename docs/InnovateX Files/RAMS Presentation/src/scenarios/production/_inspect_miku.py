import json
import struct
import numpy as np

p = r"D:\Antigravity\Projects\Road Accident Monitoring System\docs\3D models\Hatsune Miku\source\ip-vocaloid__hatsune-miku__concept__tpose.glb"
with open(p, "rb") as f:
    f.read(12)
    chunk_len, _ = struct.unpack("<I4s", f.read(8))
    g = json.loads(f.read(chunk_len))
    chunk_len, _ = struct.unpack("<I4s", f.read(8))
    blob = f.read(chunk_len)

view = g["bufferViews"][4]
raw = blob[view["byteOffset"] : view["byteOffset"] + view["byteLength"]]
stride = view["byteStride"]
count = g["accessors"][2]["count"]
pos = np.ndarray((count, 3), np.float32, raw, 12, (stride, 4))
rng = np.random.default_rng(2)
sample = pos[rng.choice(count, 120000, replace=False)].copy()


def show(mask, title):
    sl = sample[mask]
    print(f"\n{title} n={len(sl)}")
    if len(sl) < 30:
        return
    print(
        "  x",
        np.round(np.percentile(sl[:, 0], [5, 50, 95]), 3),
        "y",
        np.round(np.percentile(sl[:, 1], [5, 50, 95]), 3),
        "z",
        np.round(np.percentile(sl[:, 2], [5, 50, 95]), 3),
    )
    for sign, name in ((1, "L+z"), (-1, "R-z")):
        side = sl[sl[:, 2] * sign > 0.05]
        if len(side) < 20:
            continue
        print(
            " ",
            name,
            "centroid",
            np.round(side.mean(0), 3),
            "n",
            len(side),
        )


# legs below skirt
show((sample[:, 1] < -0.55) & (np.abs(sample[:, 2]) > 0.02), "legs")
# arms: far from centerline, mid height, not the back hair (hair has smaller |x| wait hair is -x)
show(
    (sample[:, 1] > -0.05)
    & (sample[:, 1] < 0.42)
    & (np.abs(sample[:, 2]) > 0.22)
    & (sample[:, 0] > -0.05),
    "arms forward",
)
show(
    (sample[:, 1] > 0.0)
    & (sample[:, 1] < 0.55)
    & (np.abs(sample[:, 2]) > 0.28),
    "wide z mid",
)
# hands: extreme |z|
show((np.abs(sample[:, 2]) > 0.48) & (sample[:, 1] < 0.5), "extreme z below hair")
show((np.abs(sample[:, 2]) > 0.48) & (sample[:, 1] > 0.35), "extreme z hair")

# torso core
core = sample[(np.abs(sample[:, 2]) < 0.12) & (sample[:, 1] > -0.2) & (sample[:, 1] < 0.85)]
print("\ncore y percentiles along spine")
for y0 in np.linspace(-0.15, 0.9, 12):
    sl = core[(core[:, 1] > y0) & (core[:, 1] < y0 + 0.08)]
    if len(sl) < 15:
        continue
    print(f" y {y0:.2f} n {len(sl):4d} x med {np.median(sl[:,0]):.3f} x p10 {np.percentile(sl[:,0],10):.3f} p90 {np.percentile(sl[:,0],90):.3f}")
