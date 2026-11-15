#!/usr/bin/env python3
"""The continent of Aethelgard, painted in code (Phase 89).

Every mark is worked out from position alone (hashed noise), so the map is the
same every time it is drawn: nothing here uses random numbers.

Run:  python3 tools/maps/continent89.py  [out.jpg]
Needs: numpy, scipy, Pillow, and the game's fonts converted to TTF in /tmp/cmap/fonts
(tools/maps/README.md says how).
"""
import json, math, os, sys
import numpy as np
from scipy import ndimage
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FONTS = os.environ.get('MAPFONTS', '/tmp/cmap/fonts')
CY = os.environ.get('CYDIR', '/tmp')            # the cymatic city plans (cy_<realm>.json)
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'screenshots/p89/continent-map.jpg')

W, H = 3600, 2300
def F(name, size): return ImageFont.truetype(os.path.join(FONTS, name + '.ttf'), size)
SC7, SC5 = 'alegreya-sc-latin-700-normal', 'alegreya-sc-latin-500-normal'
IT, RG, BI, CZ = 'alegreya-latin-400-italic', 'alegreya-latin-500-normal', 'alegreya-latin-700-italic', 'cinzel-latin-700-normal'

# Map coordinates are the Master Reference's (x 0..1500, y 0..860); this places them on the canvas.
def P(x, y): return (150 + x * 2.2, 150 + (y - 100) * 2.62)

# ---------- hashed noise (deterministic) ----------
def hash2(ix, iy, seed):
    v = np.sin(ix * 127.1 + iy * 311.7 + seed * 74.7) * 43758.5453
    return v - np.floor(v)

def vnoise(x, y, seed):
    ix, iy = np.floor(x), np.floor(y); fx, fy = x - ix, y - iy
    ux, uy = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
    a, b = hash2(ix, iy, seed), hash2(ix + 1, iy, seed)
    c, d = hash2(ix, iy + 1, seed), hash2(ix + 1, iy + 1, seed)
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy

def fbm(x, y, seed, oct=5, gain=0.5):
    s, amp, f, norm = 0.0, 1.0, 1.0, 0.0
    for o in range(oct):
        s = s + amp * vnoise(x * f, y * f, seed + o * 13); norm += amp; amp *= gain; f *= 2.03
    return s / norm

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
# back to reference coordinates for every pixel
rx = (xx - 150) / 2.2; ry = (yy - 150) / 2.62 + 100

# ---------- the land ----------
def blob(cx, cy, ax, ay):
    return 1 - np.sqrt(((rx - cx) / ax) ** 2 + ((ry - cy) / ay) ** 2)

n1 = fbm(xx / 260, yy / 260, 1, 6)
main = blob(800, 470, 660, 340) + (n1 - 0.5) * 0.55
# a bight on the south-west where the Heights meet the sea, and the Rift's east shore
main -= np.clip(blob(330, 760, 170, 90), 0, None) * 1.2
coast = blob(110, 560, 95, 230) + (fbm(xx / 140, yy / 140, 9, 5) - 0.5) * 0.6   # the Rust Coast
coast = np.where(rx > 196, -1, coast)
main -= np.clip(1 - np.abs(rx - 214 - (fbm(yy / 200, xx * 0, 11, 3) - 0.5) * 30) / 26, 0, None) * 2.0   # the strait: the Coast is across the sea
isles = np.zeros_like(main)
for (cx, cy, a, b) in [(140, 360, 34, 20), (60, 300, 22, 14), (205, 690, 26, 16), (40, 700, 30, 18), (75, 420, 14, 10), (230, 300, 16, 10)]:
    isles = np.maximum(isles, blob(cx, cy, a, b) + (fbm(xx / 60, yy / 60, 21, 4) - 0.5) * 0.7)
landv = np.maximum(np.maximum(main, coast), isles)
land = landv > 0

# ---------- the realms ----------
REALMS = {
    'reach': (330, 440), 'dunes': (640, 200), 'cinder': (1130, 250), 'peaks': (1210, 650),
    'heights': (660, 740), 'coast': (110, 560), 'woods': (770, 530), 'rift': (1400, 420), 'middle': (1010, 470),
}
WEIGHT = {'reach': 1.0, 'dunes': 1.15, 'cinder': 0.85, 'peaks': 0.95, 'heights': 0.95, 'coast': 0.9, 'woods': 1.0, 'rift': 0.6, 'middle': 0.72}
wx = rx + (fbm(xx / 300, yy / 300, 31, 4) - 0.5) * 120
wy = ry + (fbm(xx / 300, yy / 300, 37, 4) - 0.5) * 120
names = list(REALMS)
dist = np.stack([np.hypot(wx - REALMS[k][0], (wy - REALMS[k][1]) * 1.25) / WEIGHT[k] for k in names])
realm = np.argmin(dist, axis=0)
realm[coast > 0] = names.index('coast'); realm[(isles > 0) & (rx < 260)] = names.index('coast')
R = {k: (realm == i) & land for i, k in enumerate(names)}

# ---------- relief ----------
ridge = lambda a, b, w: np.clip(1 - np.abs(a) / w, 0, 1) * b
hgt = fbm(xx / 120, yy / 120, 51, 6) * 0.35
# the Titan's Spine, north to south through the Peaks
spine_x = 1265 + (fbm(yy / 400, xx * 0, 61, 3) - 0.5) * 80
hgt += ridge(rx - spine_x, 1.0, 55) * np.clip((ry - 430) / 60, 0, 1) * np.clip((830 - ry) / 60, 0, 1)
# Mount Lumina and the alabaster peaks
hgt += np.clip(blob(700, 760, 210, 75), 0, None) * 1.6
# the caldera's rim
cd = np.hypot(rx - 1150, (ry - 280) * 1.2)
hgt += np.exp(-((cd - 62) / 18) ** 2) * 0.9 - np.exp(-(cd / 40) ** 2) * 0.5
# the Grey Teeth, north of the Reach
hgt += ridge(ry - 320 - (rx - 350) * 0.05, 0.7, 20) * np.clip(1 - np.abs(rx - 420) / 140, 0, 1)
hgt *= land
gy, gx = np.gradient(hgt * 900)
shade = np.clip(0.78 + (-gx * 0.6 - gy * 0.8) / 900 * 3.2, 0.45, 1.25)

# ---------- colour ----------
base = {
    'reach':  (122, 150, 82), 'dunes': (214, 186, 128), 'cinder': (86, 76, 72), 'peaks': (138, 124, 106),
    'heights': (230, 228, 220), 'coast': (150, 150, 104), 'woods': (72, 94, 98), 'rift': (92, 96, 108), 'middle': (178, 172, 140),
}
var = {
    'reach': (26, 22, 10), 'dunes': (24, 18, 12), 'cinder': (18, 14, 12), 'peaks': (20, 20, 18),
    'heights': (12, 12, 14), 'coast': (20, 20, 12), 'woods': (16, 14, 24), 'rift': (14, 14, 14), 'middle': (14, 14, 12),
}
img = np.zeros((H, W, 3), np.float32)
tex = fbm(xx / 38, yy / 38, 71, 4) - 0.5
tex2 = fbm(xx / 9, yy / 9, 73, 3) - 0.5
for k in names:
    m = R[k]
    for c in range(3):
        img[..., c] = np.where(m, base[k][c] + tex * var[k][c] * 2.2 + tex2 * 8, img[..., c])
# soft blend across borders
for c in range(3):
    img[..., c] = ndimage.gaussian_filter(img[..., c], 6) * land + img[..., c] * 0
img *= shade[..., None]
# snow on the high ground
snow = np.clip((hgt - 0.95) * 3, 0, 1)[..., None]
img = img * (1 - snow) + np.array([236, 236, 232]) * snow
# lava light in the caldera floor
lava = np.clip(1 - cd / 34, 0, 1) * land
img = img * (1 - lava[..., None] * 0.8) + np.array([214, 92, 40]) * lava[..., None] * 0.8

# the sea
d_land = ndimage.distance_transform_edt(~land)
sea = np.stack([np.full((H, W), 58.0), np.full((H, W), 92.0), np.full((H, W), 112.0)], -1)
shallow = np.clip(1 - d_land / 46, 0, 1)[..., None]
sea = sea * (1 - shallow) + np.array([112, 152, 156]) * shallow
sea += (fbm(xx / 70, yy / 70, 81, 4) - 0.5)[..., None] * 18
img = np.where(land[..., None], img, sea)
# the Glass Sea: a sea fused to glass, on the Dunes' western edge
gsea = (blob(445, 200, 82, 48) + (fbm(xx / 80, yy / 80, 91, 4) - 0.5) * 0.5) > 0
gl = np.array([150, 196, 168]) + (fbm(xx / 20, yy / 20, 93, 3) - 0.5)[..., None] * 40
img = np.where(gsea[..., None], gl, img)

# the Rift: a black chasm the length of the east
rift_x = 1405 + (fbm(yy / 160, xx * 0, 101, 4) - 0.5) * 60
rw = 7 + fbm(yy / 60, xx * 0, 103, 3) * 10
rd = np.abs(rx - rift_x)
void = (rx > rift_x) & (landv > 0.0)
chasm = (rd < rw) & land
lip = (rd < rw + 9) & land & ~chasm & ~void
img[lip] = img[lip] * 0.55
img[void] = np.array([214, 210, 220]) + (fbm(xx / 90, yy / 90, 109, 3) - 0.5)[void, None] * 6
img[chasm] = np.array([16, 14, 18])
# the Maw: where the Rift opens wide, by Null-Watch
maw = (np.hypot(rx - 1400, (ry - 336) * 1.1) < 24 + fbm(xx / 30, yy / 30, 105, 3) * 12)
img[maw] = np.array([30, 26, 36]) + (fbm(xx / 7, yy / 7, 107, 2) - 0.5)[maw, None] * 10

land = land & ~void & ~chasm
for k in names: R[k] = R[k] & land
# coast line and shading
edge = land & ~ndimage.binary_erosion(land, iterations=2)
edge &= ~ndimage.binary_dilation(gsea, iterations=3)
img[edge] = np.array([58, 48, 36])
gedge = gsea & ~ndimage.binary_erosion(gsea, iterations=2)
img[gedge] = np.array([62, 96, 80])
img = np.clip(img, 0, 255).astype(np.uint8)
pic = Image.fromarray(img, 'RGB')
d = ImageDraw.Draw(pic, 'RGBA')

def h01(i, j, s): v = math.sin(i * 127.1 + j * 311.7 + s * 74.7) * 43758.5453; return v - math.floor(v)
def at(m, x, y):
    xi, yi = int(x), int(y)
    return 0 <= xi < W and 0 <= yi < H and m[yi, xi]

# ---------- marks on the land ----------
# woods: the Reach's oaks (dark green), the Spectral Woods' willows (silver and lilac), pines in the Peaks
def stipple(mask, step, col, r, s, density, col2=None):
    for j in range(0, H, step):
        for i in range(0, W, step):
            if h01(i, j, s) > density: continue
            x = i + h01(i, j, s + 1) * step; y = j + h01(i, j, s + 2) * step
            if not at(mask, x, y): continue
            rr = r * (0.7 + h01(i, j, s + 3) * 0.6)
            d.ellipse([x - rr + 2, y - rr + 3, x + rr + 2, y + rr + 3], fill=(20, 26, 14, 70))
            d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=col if (col2 is None or h01(i, j, s + 4) < 0.6) else col2)

forest_field = fbm(xx / 160, yy / 160, 121, 4)
reach_wood = R['reach'] & (forest_field > 0.5)
woods_wood = R['woods'] & (forest_field > 0.36)
peak_pine = R['peaks'] & (hgt < 0.75) & (forest_field > 0.48)
coast_wood = R['coast'] & (forest_field > 0.6)
stipple(reach_wood, 13, (46, 78, 38, 255), 6, 201, 0.75, (62, 96, 44, 255))
stipple(woods_wood, 13, (188, 196, 200, 255), 5, 211, 0.62, (158, 144, 184, 255))
stipple(peak_pine, 14, (44, 62, 52, 255), 5, 221, 0.7)
stipple(coast_wood, 15, (70, 88, 52, 255), 5, 231, 0.7)
# the Woods' phosphorescent pools
for j in range(0, H, 46):
    for i in range(0, W, 46):
        if h01(i, j, 241) > 0.14: continue
        x = i + h01(i, j, 242) * 46; y = j + h01(i, j, 243) * 46
        if not at(R['woods'], x, y): continue
        a = 4 + h01(i, j, 244) * 6
        d.ellipse([x - a * 1.4, y - a, x + a * 1.4, y + a], fill=(150, 130, 200, 200), outline=(220, 210, 250, 220))

# dune ripples in the Erg
for j in range(0, H, 22):
    for i in range(0, W, 36):
        x = i + h01(i, j, 251) * 30; y = j + h01(i, j, 252) * 14
        if not at(R['dunes'], x, y) or at(gsea, x, y): continue
        L = 14 + h01(i, j, 253) * 16
        d.arc([x - L, y - 6, x + L, y + 8], 200, 340, fill=(160, 124, 74, 200), width=2)

# the Reach's fields: a patchwork near the farms
for j in range(0, H, 30):
    for i in range(0, W, 30):
        x = i + 4; y = j + 4
        if not at(R['reach'], x, y) or at(reach_wood, x, y): continue
        if h01(i, j, 261) > 0.33: continue
        t = h01(i, j, 262)
        col = (168, 170, 92, 90) if t < 0.33 else (150, 120, 70, 70) if t < 0.66 else (136, 168, 96, 90)
        d.rectangle([x, y, x + 22 + t * 8, y + 18], fill=col)

# mountains as drawn peaks (light from the north-west)
def peak(x, y, s, snowcap=True, col=(150, 146, 136)):
    d.polygon([(x - s, y), (x, y - s * 1.25), (x + s * 0.2, y - s * 0.4), (x + s, y)], fill=col + (255,))
    d.polygon([(x, y - s * 1.25), (x + s, y), (x + s * 0.15, y)], fill=tuple(int(c * 0.62) for c in col) + (255,))
    if snowcap: d.polygon([(x - s * 0.32, y - s * 0.85), (x, y - s * 1.25), (x + s * 0.3, y - s * 0.82), (x + s * 0.06, y - s * 0.92)], fill=(244, 244, 240, 255))
    d.line([(x - s, y), (x, y - s * 1.25), (x + s, y)], fill=(54, 46, 40, 255), width=2)
pk = []
for j in range(0, H, 26):
    for i in range(0, W, 30):
        x = i + h01(i, j, 271) * 22; y = j + h01(i, j, 272) * 18
        if not (0 <= int(x) < W and 0 <= int(y) < H) or not land[int(y), int(x)]: continue
        hv = hgt[int(y), int(x)]
        if hv < 0.62 or at(chasm, x, y): continue
        k = names[realm[int(y), int(x)]]
        col = (226, 222, 210) if k == 'heights' else (78, 70, 66) if k == 'cinder' else (150, 146, 136)
        pk.append((y, x, 10 + hv * 16, hv > 0.95 or k == 'heights', col))
for (y, x, s, sn, col) in sorted(pk): peak(x, y, s, sn, col)

# ships fused in the Glass Sea, and its cracks
for n, (gx_, gy_) in enumerate([(420, 190), (455, 215), (470, 180), (400, 210)]):
    X, Y = P(gx_, gy_); ang = h01(n, 3, 291) * math.pi
    c_, s_ = math.cos(ang), math.sin(ang)
    hull = [(X + c_ * u - s_ * v, Y + s_ * u + c_ * v) for (u, v) in [(-18, 0), (-12, 6), (12, 6), (20, 0), (12, -2), (-12, -2)]]
    d.polygon(hull, fill=(80, 60, 44, 230), outline=(40, 30, 20, 255)); d.line([(X, Y), (X - s_ * -1 * 0, Y - 22)], fill=(40, 30, 20, 255), width=2)
for n in range(9):
    X, Y = P(400 + h01(n, 1, 295) * 90, 170 + h01(n, 2, 295) * 50)
    pts = [(X, Y)]
    for k in range(4):
        X += (h01(n, k, 296) - 0.5) * 60; Y += (h01(n, k, 297) - 0.5) * 40; pts.append((X, Y))
    if all(at(gsea, x, y) for x, y in pts): d.line(pts, fill=(230, 250, 240, 200), width=2)

# the caldera's smoke and the Rift's lip-posts
for i in range(14):
    a = i / 14 * 2 * math.pi
    x, y = P(1150 + math.cos(a) * 62, 280 + math.sin(a) * 52)
    d.ellipse([x - 3, y - 3, x + 3, y + 3], fill=(240, 130, 50, 230))      # the Thermal Margin's drills
for i in range(6):
    x, y = P(1150 + i * 6 - 15, 270 - i * 9)
    r = 10 + i * 5
    d.ellipse([x - r, y - r * 0.7, x + r, y + r * 0.7], fill=(60, 56, 56, 70 - i * 8))

# rivers (curves through hashed bends; they run to the sea)
def river(pts, w, col=(70, 112, 140, 255)):
    path = []
    for (a, b) in zip(pts, pts[1:]):
        for t in np.linspace(0, 1, 24, endpoint=False):
            x = a[0] + (b[0] - a[0]) * t; y = a[1] + (b[1] - a[1]) * t
            k = math.sin(t * math.pi)
            x += math.sin(y / 23 + a[0]) * 7 * k; y += math.cos(x / 31 + a[1]) * 5 * k
            path.append(P(x, y))
    path.append(P(*pts[-1]))
    d.line(path, fill=col, width=w, joint='curve')
river([(420, 330), (390, 380), (372, 404), (350, 470), (300, 540), (232, 600)], 5)          # the Flume's river, the Reach
river([(1240, 520), (1120, 520), (980, 560), (860, 590), (760, 610), (640, 640), (520, 690), (380, 745)], 4)  # the Grey Water [PROPOSED]
river([(700, 690), (620, 700), (540, 770), (420, 790)], 3)                                  # the Lumen, off the Heights [PROPOSED]
river([(560, 300), (520, 330), (470, 360), (420, 360)], 3)                                    # into the Reach from the Dunes' edge

# realm borders: dashed where the realm changes
bd = np.zeros((H, W), bool)
for i in range(len(names)):
    m = (realm == i) & land
    bd |= m & ~ndimage.binary_erosion(m, iterations=1)
bd &= ~edge & ~ndimage.binary_dilation(edge, iterations=3) & ~gsea
ys, xs = np.nonzero(bd)
for x, y in zip(xs[::1], ys[::1]):
    if ((x // 9) + (y // 9)) % 3 == 0: d.point((x, y), fill=(92, 30, 26, 230))
bdm = ndimage.binary_dilation(bd, iterations=1)
arr = np.array(pic); arr[bdm & (((xx // 10).astype(int) + (yy // 10).astype(int)) % 3 == 0)] = (110, 34, 28); pic = Image.fromarray(arr); d = ImageDraw.Draw(pic, 'RGBA')

# ---------- roads, the Tramway, and the Kestrel's way ----------
def road(pts, col=(150, 96, 44, 255), w=4, dash=None):
    path = []
    for (a, b) in zip(pts, pts[1:]):
        for t in np.linspace(0, 1, 30, endpoint=False):
            x = a[0] + (b[0] - a[0]) * t; y = a[1] + (b[1] - a[1]) * t
            k = math.sin(t * math.pi)
            x += math.sin(t * 7 + a[1]) * 9 * k; y += math.cos(t * 5 + a[0]) * 7 * k
            path.append(P(x, y))
    path.append(P(*pts[-1]))
    if dash:
        for i in range(0, len(path) - 1):
            if (i // dash) % 2 == 0: d.line([path[i], path[i + 1]], fill=col, width=w)
    else:
        d.line(path, fill=(60, 40, 20, 120), width=w + 3, joint='curve'); d.line(path, fill=col, width=w, joint='curve')
    return path
CITY = {'reach': (370, 400), 'dunes': (640, 250), 'cinder': (1150, 280), 'peaks': (1180, 560), 'heights': (700, 690),
        'coast': (150, 545), 'woods': (760, 470), 'rift': (1345, 330), 'middle': (1010, 470)}
# the old roads [PROPOSED where the books give none]
road([CITY['woods'], (880, 470), CITY['middle']])
road([CITY['middle'], (1100, 520), CITY['peaks']])
road([CITY['middle'], (1080, 380), CITY['cinder']])
road([CITY['middle'], (1200, 420), (1290, 360), CITY['rift']])
road([CITY['woods'], (700, 360), CITY['dunes']])
road([(560, 220), CITY['dunes'], (780, 180)])
road([CITY['reach'], (470, 300), (560, 220)])
road([CITY['peaks'], (1260, 600), (1210, 660)])
road([CITY['cinder'], (1080, 240)])
road([CITY['woods'], (700, 620)])
road([CITY['heights'], (640, 720)])
# the Iron Tramway (canon): out of the Reach, over the Valley of Velocity on piers, to the Heights; and east to the Organum
tram = road([CITY['reach'], (440, 470), (520, 590), (600, 660), CITY['heights']], col=(30, 26, 22, 255), w=3)
tram2 = road([CITY['reach'], (520, 420), (640, 430), (760, 455), (900, 455), CITY['middle']], col=(30, 26, 22, 255), w=3)
for path in (tram, tram2):
    for i in range(0, len(path) - 1, 3):
        (x1, y1), (x2, y2) = path[i], path[i + 1]
        dx, dy = x2 - x1, y2 - y1; L = math.hypot(dx, dy) or 1
        nx, ny = -dy / L * 6, dx / L * 6
        d.line([(x1 - nx, y1 - ny), (x1 + nx, y1 + ny)], fill=(30, 26, 22, 255), width=2)
# the Kestrel's way between the countries (dotted, in the sky)
def sky(a, b, bend):
    (x1, y1), (x2, y2) = P(*a), P(*b)
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2 - bend
    pts = [((1 - t) ** 2 * x1 + 2 * (1 - t) * t * mx + t * t * x2, (1 - t) ** 2 * y1 + 2 * (1 - t) * t * my + t * t * y2) for t in np.linspace(0, 1, 90)]
    for i in range(0, len(pts) - 1, 3): d.line([pts[i], pts[i + 1]], fill=(240, 236, 220, 200), width=7)
    for i in range(0, len(pts) - 1, 3): d.line([pts[i], pts[i + 1]], fill=(30, 60, 110, 255), width=4)
    mx2, my2 = pts[45]
    d.ellipse([mx2 - 16, my2 - 7, mx2 + 16, my2 + 7], fill=(150, 96, 44, 255), outline=(30, 20, 14, 255), width=2)
    d.line([(mx2 - 10, my2 + 7), (mx2 - 6, my2 + 14), (mx2 + 6, my2 + 14), (mx2 + 10, my2 + 7)], fill=(30, 20, 14, 255), width=2)
sky(CITY['reach'], CITY['coast'], 120)
sky(CITY['reach'], CITY['woods'], 160)
sky(CITY['woods'], CITY['heights'], 120)
sky(CITY['heights'], CITY['rift'], 260)

# the cloud deck below Sol-Luminary
cl = Image.new('RGBA', (W, H), (0, 0, 0, 0)); cg = ImageDraw.Draw(cl)
for j in range(0, H, 34):
    for i in range(0, W, 40):
        x = i + h01(i, j, 281) * 40; y = j + h01(i, j, 282) * 30
        if not at(R['heights'], x, y) or hgt[int(y), int(x)] > 0.7 or h01(i, j, 283) > 0.12: continue
        a = 20 + h01(i, j, 284) * 26
        cg.ellipse([x - a * 1.8, y - a * 0.6, x + a * 1.8, y + a * 0.6], fill=(255, 255, 255, 90))
cl = cl.filter(ImageFilter.GaussianBlur(10)); pic.paste(cl, (0, 0), cl); d = ImageDraw.Draw(pic, 'RGBA')

# ---------- the great cities, each drawn from its own cymatic figure ----------
CYK = {'reach': 'reach', 'dunes': 'dunes', 'cinder': 'cinder', 'peaks': 'fortis', 'heights': 'heights', 'coast': 'coast', 'woods': 'woods', 'rift': 'rift'}
def city_icon(k, r=46):
    x0, y0 = P(*CITY[k])
    tile = Image.new('RGBA', (r * 4, r * 4), (0, 0, 0, 0)); g = ImageDraw.Draw(tile)
    c = r * 2
    square = (k == 'peaks')
    if square: g.rectangle([c - r - 6, c - r - 6, c + r + 6, c + r + 6], fill=(244, 234, 206, 255), outline=(60, 40, 30, 255), width=4)
    else: g.ellipse([c - r - 6, c - r - 6, c + r + 6, c + r + 6], fill=(244, 234, 206, 255), outline=(60, 40, 30, 255), width=4)
    if k in CYK and os.path.exists(os.path.join(CY, 'cy_%s.json' % CYK[k])):
        dd = json.load(open(os.path.join(CY, 'cy_%s.json' % CYK[k])))
        RR = max(max(abs(q[0]), abs(q[1]), abs(q[2]), abs(q[3])) for q in dd['roads'])
        s = r / RR
        for q in dd['roads']:
            if q[5] in ('boulevard', 'ring', 'perimeter'):
                g.line([(c + q[0] * s, c + q[1] * s), (c + q[2] * s, c + q[3] * s)], fill=(120, 34, 26, 255), width=2)
    else:  # the Organum: ranks of pipes, a keyboard
        for i in range(-4, 5):
            g.line([(c + i * r / 4.5, c - r * 0.8), (c + i * r / 4.5, c + r * 0.8)], fill=(120, 34, 26, 255), width=2)
        for j in range(-3, 4):
            g.line([(c - r * 0.8, c + j * r / 3.5), (c + r * 0.8, c + j * r / 3.5)], fill=(120, 34, 26, 160), width=1)
    pic.paste(tile, (int(x0 - c), int(y0 - c)), tile)

# ---------- labels ----------
def label(x, y, text, font, fill=(40, 28, 20), halo=(244, 234, 210), anchor='mm', hw=4):
    d.text((x, y), text, font=font, fill=fill, anchor=anchor, stroke_width=hw, stroke_fill=halo)
def spaced(x, y, text, font, fill, track=8, halo=(244, 234, 210)):
    w = sum(d.textlength(ch, font=font) + track for ch in text) - track
    cx = x - w / 2
    for ch in text:
        d.text((cx, y), ch, font=font, fill=fill, anchor='lm', stroke_width=5, stroke_fill=halo + (200,)); cx += d.textlength(ch, font=font) + track

# realm names, large and spaced, in the colour of old red ink
REALM_LABEL = {
    'reach': ('THE RESONANT REACH', 'Growth · 174 Hz', (360, 590)),
    'dunes': ('THE SHIFTING DUNES', 'Time · 417 Hz', (660, 125)),
    'cinder': ('THE BLIGHTED CALDERA', 'Heat · 285 Hz', (1110, 165)),
    'peaks': ('THE IRON PEAKS', 'Mass · 396 Hz', (1150, 760)),
    'heights': ('THE DAWNING HEIGHTS', 'Light · 528 Hz', (760, 830)),
    'coast': ('THE RUST COAST', 'Velocity · 639 Hz', (105, 465)),
    'woods': ('THE SPECTRAL WOODS', 'Memory · 741 Hz', (845, 588)),
    'rift': ('THE RIFT', 'Decay · 852 Hz', (1340, 400)),
    'middle': ('THE MIDDLE COUNTRY', 'the Keynote', (1085, 405)),
}
for k, (t, sub, (x, y)) in REALM_LABEL.items():
    X, Y = P(x, y)
    small = k in ('coast', 'middle')
    spaced(X, Y, t, F(CZ, 32 if small else 40), (128, 36, 28), 5 if small else 9)
    label(X, Y + 38, sub, F(IT, 28), (110, 46, 36))

for k in CITY: city_icon(k)
CITYNAME = {'reach': 'Oakhaven', 'dunes': 'Sandglass Bazaar', 'cinder': 'Cinderhold', 'peaks': 'Bastion Fortis', 'heights': 'Sol-Luminary',
            'coast': 'Port Cantabile', 'woods': 'Whisper-Grove', 'rift': 'Null-Watch', 'middle': 'The Organum'}
CITYOFF = {'reach': (0, -78), 'dunes': (0, -78), 'cinder': (0, -80), 'peaks': (0, 80), 'heights': (0, -80), 'coast': (0, 78),
           'woods': (0, 80), 'rift': (-200, 0), 'middle': (0, -80)}
for k, nm in CITYNAME.items():
    X, Y = P(*CITY[k]); ox, oy = CITYOFF[k]
    label(X + ox, Y + oy, nm, F(SC7, 40), (30, 20, 14), hw=6)

# places: (name, x, y, kind, note, label offset)
# kinds: town, dungeon (canon D1-D6 and the great places), wonder, quiet (seen, not entered), haven
PLACES = [
    # the Reach
    ('Greenroot', 320, 440, 'town', None, (0, 30)), ('Stillwater Landing', 300, 520, 'town', None, (0, 32)),
    ('the Deep Grove', 430, 395, 'wonder', None, (10, -28)), ('the Watch Downs', 330, 360, 'town', None, (0, -28)),
    ('Wethercombe', 285, 395, 'town', None, (-20, -28)), ('the Malting', 540, 470, 'quiet', 'a harvest-house', (0, 34)),
    ('the Grey Teeth', 430, 305, 'none', None, (0, 0)),
    # the Rust Coast
    ('Driftwood Cay', 140, 360, 'town', None, (0, -28)), ('Wendmere', 212, 630, 'quiet', 'the drowned town', (0, 34)),
    ('Cape Dissonance', 110, 770, 'town', None, (0, 30)), ('Site Nine', 150, 812, 'dungeon', 'over the trench', (70, 0)),
    ('the Undercliff', 120, 605, 'dungeon', None, (0, 34)), ('the Roaring Strait', 214, 300, 'none', None, (0, 0)),
    ('the Siren Shallows', 214, 700, 'none', None, (0, 0)),
    # the Dunes
    ('Mirage Rest', 560, 220, 'town', None, (0, 30)), ('the Tomb of the Astrolabe', 780, 180, 'dungeon', 'the Chronos Drake', (0, 34)),
    ('the Hourglass Erg', 840, 140, 'none', None, (0, 0)), ('Veridia', 488, 238, 'wonder', 'twenty-four seconds', (0, 34)),
    ('The Glass Sea', 440, 196, 'none', None, (0, 0)),
    # the Caldera
    ('Slag-Town Scraps', 1080, 240, 'town', None, (-20, -28)), ('the Under-Forge', 1220, 360, 'dungeon', 'Pyraxis below', (0, 34)),
    ('the Thermal Margin', 1210, 245, 'wonder', None, (60, -26)),
    # the Peaks
    ('Quarry-Keep Stonehold', 1262, 600, 'town', None, (0, 30)), ('the Lodestone Vaults', 1210, 660, 'dungeon', None, (0, 32)),
    ('Tremor Basin', 1080, 700, 'wonder', 'the Terrasque', (0, 34)), ('Coldharrow', 1150, 470, 'town', None, (0, -26)),
    ('Greystairs', 1300, 700, 'town', None, (0, 30)), ('the floating fields', 1300, 560, 'wonder', None, (0, -28)),
    ("the Titan's Spine", 1262, 500, 'none', None, (0, 0)),
    # the Heights
    ('Sun-Peak Vigil', 640, 720, 'town', None, (-20, 30)), ('the Altar and the Eye', 760, 735, 'quiet', 'Mount Lumina', (60, 34)),
    ('the Chalk Cliffs', 600, 770, 'wonder', None, (0, 30)), 
    # the Woods
    ('the Weeping Canopy', 800, 420, 'quiet', 'the Memory Anchor', (0, -50)), ('the Cloister of the Lost Choir', 870, 500, 'town', None, (90, 30)),
    ('the House of the Silent Veil', 690, 620, 'dungeon', 'the Mausoleum of Chords', (0, -36)), ('the Pools of Strangers', 615, 545, 'wonder', None, (0, 30)),
    ('the Deep Woods camp', 750, 640, 'town', None, (125, 0)), ('Ebb Cross', 890, 410, 'quiet', 'a harvest-house', (0, 32)),
    ('Hollin Ford', 930, 600, 'quiet', 'a harvest-house', (0, 32)), ('the Fading at Ash Ford', 640, 505, 'wonder', None, (0, 30)),
    # the Middle Country
    ('the Valley of Velocity', 520, 600, 'wonder', 'the rain that hangs', (0, 36)),
    # villages named in the books and the plan
    ('Fenwick', 400, 470, 'town', None, (0, 28)), ("Hob's Weigh", 1120, 640, 'town', None, (0, 28)),
    ('Dunmarrow', 1330, 760, 'town', None, (0, 28)), ('Ketterfold', 1190, 480, 'town', None, (60, -20)),
    ('the Silk & Silica Way', 700, 300, 'none', None, (0, 0)), ('the cloud deck', 545, 770, 'none', None, (0, 0)),
    # the Rift
    ('the Maw', 1400, 336, 'none', None, (0, 0)), ('Redoubt Zero', 1378, 450, 'dungeon', 'the Null-Amalgam', (-110, 0)),
    ('the Shelf', 1396, 296, 'haven', None, (0, -26)), ('the Edge', 1386, 505, 'wonder', None, (-70, 0)),
]
for (nm, x, y, kind, note, (ox, oy)) in PLACES:
    X, Y = P(x, y)
    if kind == 'none':
        label(X, Y, nm, F(IT, 30), (40, 30, 24), hw=4); continue
    if kind == 'town':
        d.ellipse([X - 9, Y - 9, X + 9, Y + 9], fill=(40, 28, 20, 255), outline=(244, 234, 210, 255), width=3)
    elif kind == 'dungeon':
        d.polygon([(X, Y - 14), (X + 14, Y), (X, Y + 14), (X - 14, Y)], fill=(140, 34, 28, 255), outline=(244, 234, 210, 255))
    elif kind == 'wonder':
        for a in range(8):
            ang = a * math.pi / 4; rr = 15 if a % 2 == 0 else 7
            d.line([(X, Y), (X + math.cos(ang) * rr, Y + math.sin(ang) * rr)], fill=(150, 90, 170, 255), width=3)
        d.ellipse([X - 5, Y - 5, X + 5, Y + 5], fill=(250, 240, 255, 255), outline=(90, 50, 110, 255), width=2)
    elif kind == 'quiet':
        d.ellipse([X - 10, Y - 10, X + 10, Y + 10], fill=(0, 0, 0, 0), outline=(40, 28, 20, 255), width=3)
        d.ellipse([X - 4, Y - 4, X + 4, Y + 4], fill=(40, 28, 20, 255))
    elif kind == 'haven':
        d.rectangle([X - 8, Y - 8, X + 8, Y + 8], fill=(220, 160, 60, 255), outline=(40, 28, 20, 255), width=2)
    anc = 'mm'
    label(X + ox, Y + oy, nm, F(RG, 28) if kind != 'dungeon' else F(BI, 28), (30, 20, 14) if kind != 'dungeon' else (120, 30, 24), hw=4, anchor=anc)
    if note: label(X + ox, Y + oy + 26, note, F(IT, 23), (70, 54, 40), hw=3, anchor=anc)

# the Tramway and the Kestrel, named on their lines
label(*P(470, 520), 'the Iron Tramway', F(IT, 26), (24, 20, 16), hw=4)
label(*P(250, 470), "the Kestrel's way", F(IT, 26), (30, 60, 96), hw=4)
label(*P(1060, 560), 'the Grey Water', F(IT, 24), (50, 84, 110), hw=3)
label(*P(70, 640), 'THE WESTERN SEA', F(CZ, 34), (36, 66, 86), halo=(120, 160, 170), hw=3)
label(*P(500, 860), 'THE SOUTHERN DEEP', F(CZ, 34), (36, 66, 86), halo=(120, 160, 170), hw=3)
label(*P(1452, 520), 'the not-colour', F(IT, 30), (90, 86, 100), halo=(214, 210, 220), hw=3)

# ---------- the frame, the title, the compass, the legend ----------
BAND = 300
FW, FH = W + 160, H + 160 + BAND
fy, fx = np.mgrid[0:FH, 0:FW].astype(np.float32)
pt = (fbm(fx / 50, fy / 50, 301, 4) - 0.5) * 30
fa = np.full((FH, FW, 3), (232, 218, 186), np.float32) + pt[..., None]
frame = Image.fromarray(np.clip(fa, 0, 255).astype(np.uint8))
frame.paste(pic, (80, 80))
fr = ImageDraw.Draw(frame, 'RGBA')
fr.rectangle([70, 70, W + 89, H + 89], outline=(60, 40, 30), width=6)
fr.rectangle([56, 56, FW - 57, FH - 57], outline=(60, 40, 30), width=2)
for i in range(0, W + 40, 60):   # a scale-band on the border, like the game's charts
    fr.rectangle([60 + i, 60, 60 + i + 30, 66], fill=(60, 40, 30))
    fr.rectangle([60 + i, FH - 66, 60 + i + 30, FH - 60], fill=(60, 40, 30))
# title cartouche, in the north-west sea
cx0, cy0 = 80 + 60, 80 + 50
fr.rounded_rectangle([cx0, cy0, cx0 + 1020, cy0 + 196], 18, fill=(244, 234, 206, 236), outline=(60, 40, 30, 255), width=4)
fr.text((cx0 + 510, cy0 + 70), 'AETHELGARD', font=F(CZ, 92), fill=(110, 30, 24), anchor='mm')
fr.text((cx0 + 510, cy0 + 140), 'the eight realms and the Organum, Harvestmonth 419', font=F(IT, 36), fill=(50, 36, 26), anchor='mm')
# the key, in a band under the map
by = H + 80 + 40
fr.text((140, by + 20), 'Key', font=F(SC7, 44), fill=(110, 30, 24), anchor='lm')
rows = [('city', 'a great city, drawn from its own note'), ('town', 'a town or village'), ('dungeon', 'a great place, with a keeper'),
        ('wonder', 'a wonder of the broken law'), ('quiet', 'seen, not entered: the books\u2019 own'), ('haven', 'a haven'),
        ('tram', 'the Iron Tramway'), ('road', 'a road'), ('sky', "the Kestrel's way, by air"), ('border', 'the edge of a realm')]
for n, (k, t) in enumerate(rows):
    X = 160 + (n // 3) * 620; Y = by + 80 + (n % 3) * 50
    if k == 'city': fr.ellipse([X - 16, Y - 16, X + 16, Y + 16], fill=(244, 234, 206, 255), outline=(60, 40, 30, 255), width=3); fr.ellipse([X - 7, Y - 7, X + 7, Y + 7], outline=(120, 34, 26, 255), width=2)
    if k == 'town': fr.ellipse([X - 9, Y - 9, X + 9, Y + 9], fill=(40, 28, 20, 255))
    if k == 'dungeon': fr.polygon([(X, Y - 14), (X + 14, Y), (X, Y + 14), (X - 14, Y)], fill=(140, 34, 28, 255))
    if k == 'wonder':
        for a in range(8):
            ang = a * math.pi / 4; rr = 15 if a % 2 == 0 else 7
            fr.line([(X, Y), (X + math.cos(ang) * rr, Y + math.sin(ang) * rr)], fill=(150, 90, 170, 255), width=3)
    if k == 'quiet': fr.ellipse([X - 10, Y - 10, X + 10, Y + 10], outline=(40, 28, 20, 255), width=3); fr.ellipse([X - 4, Y - 4, X + 4, Y + 4], fill=(40, 28, 20, 255))
    if k == 'haven': fr.rectangle([X - 9, Y - 9, X + 9, Y + 9], fill=(220, 160, 60, 255), outline=(40, 28, 20, 255), width=2)
    if k == 'tram':
        fr.line([(X - 24, Y), (X + 24, Y)], fill=(30, 26, 22, 255), width=3)
        for q in range(-22, 24, 8): fr.line([(X + q, Y - 6), (X + q, Y + 6)], fill=(30, 26, 22, 255), width=2)
    if k == 'road': fr.line([(X - 24, Y), (X + 24, Y)], fill=(150, 96, 44, 255), width=5)
    if k == 'sky':
        for q in range(-24, 24, 9): fr.line([(X + q, Y), (X + q + 4, Y)], fill=(30, 60, 110, 255), width=4)
    if k == 'border':
        for q in range(-24, 24, 9): fr.line([(X + q, Y), (X + q + 3, Y)], fill=(110, 34, 28, 255), width=4)
    fr.text((X + 40, Y), t, font=F(RG, 30), fill=(40, 28, 20), anchor='lm')
# notes
nx = 160 + 4 * 620 - 40
fr.text((nx, by + 40), 'Between the countries there is no road:', font=F(IT, 30), fill=(40, 28, 20), anchor='lm')
fr.text((nx, by + 75), 'the Kestrel carries you, as in the books.', font=F(IT, 30), fill=(40, 28, 20), anchor='lm')
fr.text((nx, by + 120), 'Places from the Master Reference stand where it puts them;', font=F(IT, 26), fill=(70, 54, 40), anchor='lm')
fr.text((nx, by + 150), 'the rest are placed for Phase 89.', font=F(IT, 26), fill=(70, 54, 40), anchor='lm')
# compass rose, at the band's right
cx, cy, cr = FW - 230, by + 120, 100
for a in range(16):
    ang = a * math.pi / 8 - math.pi / 2; rr = cr if a % 4 == 0 else cr * 0.55 if a % 2 == 0 else cr * 0.35
    l = (cx + math.cos(ang + 0.14) * rr * 0.2, cy + math.sin(ang + 0.14) * rr * 0.2)
    r2 = (cx + math.cos(ang - 0.14) * rr * 0.2, cy + math.sin(ang - 0.14) * rr * 0.2)
    tip = (cx + math.cos(ang) * rr, cy + math.sin(ang) * rr)
    fr.polygon([(cx, cy), l, tip], fill=(110, 30, 24, 255) if a % 4 == 0 else (60, 40, 30, 255))
    fr.polygon([(cx, cy), r2, tip], fill=(244, 234, 206, 255), outline=(60, 40, 30, 255))
fr.ellipse([cx - cr * 0.62, cy - cr * 0.62, cx + cr * 0.62, cy + cr * 0.62], outline=(60, 40, 30, 255), width=2)
for t, ang in (('N', -math.pi / 2), ('E', 0), ('S', math.pi / 2), ('W', math.pi)):
    fr.text((cx + math.cos(ang) * (cr + 26), cy + math.sin(ang) * (cr + 26)), t, font=F(SC7, 38), fill=(40, 28, 20), anchor='mm')
# scale
sx, sy = nx, by + 215
for i in range(5):
    fr.rectangle([sx + i * 80, sy, sx + i * 80 + 80, sy + 14], fill=(60, 40, 30) if i % 2 == 0 else (244, 234, 206), outline=(60, 40, 30))
fr.text((sx + 520, sy + 7), "five days' ride", font=F(IT, 30), fill=(40, 28, 20), anchor='lm')

frame = frame.convert('RGB')
os.makedirs(os.path.dirname(OUT), exist_ok=True)
frame.save(OUT, quality=90)
frame.resize((FW // 2, FH // 2), Image.LANCZOS).save(OUT.replace('.jpg', '-half.jpg'), quality=88)
print(OUT, frame.size)
