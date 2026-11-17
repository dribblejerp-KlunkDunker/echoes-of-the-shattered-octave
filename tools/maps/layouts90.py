#!/usr/bin/env python3
"""Phase 90: the layouts, drawn in code.

Makes, in screenshots/p90/:
  places-<realm>.jpg   every great place of a realm as a plan: rooms, lamps, the keeper's arena,
                       the shortcut loop, and what does not open
  city-<realm>.jpg     the great city's cymatic figure at walking scale, with its gates, its lamps,
                       the heart's way in and the doors of its great places
  city-organum.jpg     the Organum: straight ranks, its pipe-banks set where all eight figures meet
Nothing uses random numbers.
"""
import json, math, os, sys, textwrap
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from layouts90_data import PLACES

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FONTS = os.environ.get('MAPFONTS', '/tmp/cmap/fonts')
CY = os.environ.get('CYDIR', '/tmp')
LABELS = os.environ.get('CYLABELS', '/tmp/p89/labels.json')
OUT = os.path.join(ROOT, 'screenshots/p90'); os.makedirs(OUT, exist_ok=True)
def F(n, s): return ImageFont.truetype(os.path.join(FONTS, n + '.ttf'), s)
SC7, IT, RG, BI, CZ = 'alegreya-sc-latin-700-normal', 'alegreya-latin-400-italic', 'alegreya-latin-500-normal', 'alegreya-latin-700-italic', 'cinzel-latin-700-normal'
INK, PAPER, RED = (40, 28, 20), (241, 231, 205), (120, 30, 24)
KIND = {  # fill, outline
    'gate': ((214, 196, 150), INK), 'lamp': ((248, 214, 120), (150, 96, 30)), 'room': ((236, 226, 200), INK),
    'hazard': ((226, 190, 160), (140, 70, 40)), 'keeper': ((176, 52, 40), (90, 20, 14)), 'secret': ((206, 196, 226), (90, 70, 120)),
    'closed': ((200, 200, 200), (90, 90, 90)), 'vista': ((190, 214, 220), (50, 90, 110)), 'haven': ((196, 220, 170), (60, 100, 40)),
}
REALMNAME = {'reach': 'The Resonant Reach', 'heights': 'The Dawning Heights', 'cinder': 'Cinderhold', 'peaks': 'The Iron Peaks',
             'dunes': 'The Shifting Dunes', 'coast': 'The Rust Coast', 'woods': 'The Spectral Woods', 'rift': 'The Continental Rift',
             'middle': 'The Middle Country'}
REALM_HZ = {'reach': '174 Hz', 'heights': '528 Hz', 'cinder': '285 Hz', 'peaks': '396 Hz', 'dunes': '417 Hz', 'coast': '639 Hz',
            'woods': '741 Hz', 'rift': '852 Hz', 'middle': 'the Keynote'}

def paper(w, h):
    im = Image.new('RGB', (w, h), PAPER); d = ImageDraw.Draw(im)
    for j in range(0, h, 6):  # a faint ruled grain, worked out from position
        v = int(6 * math.sin(j * 0.37) * math.sin(j * 0.011))
        d.line([(0, j), (w, j)], fill=(PAPER[0] + v, PAPER[1] + v, PAPER[2] + v))
    return im

def arrow(d, a, b, col, w=3, size=14):
    ang = math.atan2(b[1] - a[1], b[0] - a[0])
    p1 = (b[0] - size * math.cos(ang - 0.4), b[1] - size * math.sin(ang - 0.4))
    p2 = (b[0] - size * math.cos(ang + 0.4), b[1] - size * math.sin(ang + 0.4))
    d.polygon([b, p1, p2], fill=col)

def dashed(d, a, b, col, w, dash=14, gap=9):
    L = math.hypot(b[0] - a[0], b[1] - a[1]); n = max(1, int(L // (dash + gap)))
    for i in range(n + 1):
        t0 = i * (dash + gap) / L; t1 = min(1, t0 + dash / L)
        if t0 >= 1: break
        d.line([(a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0), (a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1)], fill=col, width=w)

def panel(p, W=1180, H=760):
    im = paper(W, H); d = ImageDraw.Draw(im)
    d.rectangle([4, 4, W - 5, H - 5], outline=INK, width=3)
    d.text((24, 18), p['name'], font=F(SC7, 40), fill=INK)
    d.text((26, 66), p['kind'] + ('  ·  keeper: ' + p['keeper'] if p['keeper'] else '  ·  no keeper'), font=F(IT, 26), fill=RED)
    x0, y0, x1, y1 = 100, 175, W - 120, H - 120
    pos = {r[0]: (x0 + r[2] / 10 * (x1 - x0), y0 + r[3] / 6 * (y1 - y0)) for r in p['rooms']}
    # ways first
    for a, b, t in p['edges']:
        A, B = pos[a], pos[b]
        if t == 'path': d.line([A, B], fill=(120, 84, 50), width=6)
        elif t == 'climb':
            d.line([A, B], fill=(120, 84, 50), width=3)
            L = math.hypot(B[0] - A[0], B[1] - A[1]); nx, ny = -(B[1] - A[1]) / L * 9, (B[0] - A[0]) / L * 9
            for k in range(1, int(L // 18)):
                cx, cy = A[0] + (B[0] - A[0]) * k * 18 / L, A[1] + (B[1] - A[1]) * k * 18 / L
                d.line([(cx - nx, cy - ny), (cx + nx, cy + ny)], fill=(120, 84, 50), width=2)
        elif t == 'one':
            d.line([A, B], fill=(70, 70, 110), width=4)
            m = ((A[0] + B[0]) / 2, (A[1] + B[1]) / 2); arrow(d, A, m, (70, 70, 110), size=20)
        elif t == 'short':
            # the shortcut bows out so it reads as a loop
            mx, my = (A[0] + B[0]) / 2, (A[1] + B[1]) / 2; L = math.hypot(B[0] - A[0], B[1] - A[1]) or 1
            nx, ny = -(B[1] - A[1]) / L, (B[0] - A[0]) / L; c = (mx + nx * 70, my + ny * 70)
            pts = [((1 - u) ** 2 * A[0] + 2 * (1 - u) * u * c[0] + u * u * B[0], (1 - u) ** 2 * A[1] + 2 * (1 - u) * u * c[1] + u * u * B[1]) for u in [i / 40 for i in range(41)]]
            for i in range(0, 40, 2): d.line([pts[i], pts[i + 1]], fill=(40, 120, 70), width=5)
            arrow(d, pts[-4], pts[-1], (40, 120, 70), size=18)
            arrow(d, pts[20], pts[22], (40, 120, 70), size=18)
    # rooms
    for i, (rid, label, x, y, kind, note) in enumerate(p['rooms'], 1):
        X, Y = pos[rid]; fill, ol = KIND[kind]
        lines = textwrap.wrap(label, 18)
        w = max(d.textlength(l, font=F(RG, 22)) for l in lines) + 26; h = 26 * len(lines) + 16
        shape = [X - w / 2, Y - h / 2, X + w / 2, Y + h / 2]
        if kind == 'keeper':
            d.rounded_rectangle([shape[0] - 6, shape[1] - 6, shape[2] + 6, shape[3] + 6], 14, fill=(90, 20, 14))
        d.rounded_rectangle(shape, 10, fill=fill, outline=ol, width=3)
        tc = (250, 240, 230) if kind == 'keeper' else INK
        for k, l in enumerate(lines):
            d.text((X, Y - h / 2 + 8 + k * 26 + 13), l, font=F(RG, 22), fill=tc, anchor='mm')
        d.ellipse([shape[0] - 14, shape[1] - 14, shape[0] + 14, shape[1] + 14], fill=INK)
        d.text((shape[0], shape[1]), str(i), font=F(SC7, 18), fill=PAPER, anchor='mm')
        if kind == 'lamp':  # a small flame
            fx, fy = shape[2] - 4, shape[1] - 2
            d.polygon([(fx, fy - 18), (fx + 8, fy), (fx, fy + 6), (fx - 8, fy)], fill=(220, 120, 30), outline=(120, 50, 10))
    if p.get('note'):
        for k, l in enumerate(textwrap.wrap(p['note'], 95)):
            d.text((26, H - 70 + k * 28), l, font=F(IT, 24), fill=(70, 54, 40))
    return im

def legend(W=2380, H=120):
    im = paper(W, H); d = ImageDraw.Draw(im)
    x = 30
    for k, t in [('gate', 'the way in'), ('lamp', 'a lamp (rest)'), ('room', 'a room'), ('hazard', 'a hazard'), ('keeper', 'the keeper'),
                 ('secret', 'a secret'), ('closed', 'seen, not entered'), ('vista', 'a view'), ('haven', 'a haven')]:
        fill, ol = KIND[k]; d.rounded_rectangle([x, 30, x + 46, 62], 8, fill=fill, outline=ol, width=3)
        d.text((x + 56, 46), t, font=F(RG, 24), fill=INK, anchor='lm'); x += 66 + d.textlength(t, font=F(RG, 24)) + 22
    y = 92; x = 30
    d.line([(x, y), (x + 60, y)], fill=(120, 84, 50), width=6); d.text((x + 72, y), 'a way', font=F(RG, 24), fill=INK, anchor='lm'); x += 200
    d.line([(x, y), (x + 60, y)], fill=(120, 84, 50), width=3)
    for q in range(6, 60, 12): d.line([(x + q, y - 8), (x + q, y + 8)], fill=(120, 84, 50), width=2)
    d.text((x + 72, y), 'a climb', font=F(RG, 24), fill=INK, anchor='lm'); x += 220
    d.line([(x, y), (x + 60, y)], fill=(70, 70, 110), width=4); arrow(d, (x, y), (x + 40, y), (70, 70, 110), size=18)
    d.text((x + 72, y), 'a drop (one way)', font=F(RG, 24), fill=INK, anchor='lm'); x += 300
    for q in range(0, 60, 16): d.line([(x + q, y), (x + q + 8, y)], fill=(40, 120, 70), width=5)
    d.text((x + 72, y), 'the shortcut, opened from the far side', font=F(RG, 24), fill=INK, anchor='lm')
    return im

def realm_sheet(realm):
    ps = [p for p in PLACES if p['realm'] == realm]
    n = len(ps); cols = 2 if n > 1 else 1; rows = (n + cols - 1) // cols
    PW, PH = 1180, 760
    W = 20 + cols * (PW + 20); H = 150 + rows * (PH + 20) + 140
    im = paper(W, H); d = ImageDraw.Draw(im)
    d.text((W // 2, 60), REALMNAME[realm].upper(), font=F(CZ, 64), fill=RED, anchor='mm')
    d.text((W // 2, 116), 'the great places, room by room  ·  ' + REALM_HZ[realm], font=F(IT, 32), fill=INK, anchor='mm')
    for i, p in enumerate(ps):
        im.paste(panel(p, PW, PH), (20 + (i % cols) * (PW + 20), 150 + (i // cols) * (PH + 20)))
    lg = legend(W - 40, 120); im.paste(lg, (20, H - 135))
    im.save(os.path.join(OUT, 'places-%s.jpg' % realm), quality=88)
    return im.size

# ------------------------------------------------------------------ the cities at walking scale
ROUTE = {  # the heart's way in, as pin numbers on the Phase 89 figure; lamps; the keeper's pin
    'heights': ([9, 8, 7, 3, 1], [9, 8, 1], 3), 'cinder': ([3, 11, 10, 1], [3, 11, 10], 10),
    'fortis': ([11, 7, 4, 2, 1], [11, 2, 1], 4), 'dunes': ([8, 4, 1, 2], [8, 1, 2], 2),
    'coast': ([2, 3, 4, 5, 6, 7, 8, 9], [2, 6, 9], 9), 'woods': ([8, 5, 2, 1], [12, 5, 1], 6),
    'rift': ([8, 4, 9, 1, 2], [8, 4, 2], 9), 'reach': ([], [], None),
}
DOORS = {  # where the other great places open, by pin
    'heights': {10: 'the Anchorage', 2: 'the Pilgrim Chain', 5: 'the White Mile'},
    'cinder': {1: 'the Under-Forge (below) and the Ignis Hearth (above)', 13: 'the Thermal Margin'},
    'fortis': {1: 'the Lodestone Vaults and the First Compact\'s Stair', 11: 'the road to Tremor Basin'},
    'dunes': {1: 'the Gnomon', 9: 'the road to the Tomb', 8: 'the road to Veridia'},
    'coast': {3: 'the Undercliff', 12: 'Wendmere, and the boat to Site Nine'},
    'woods': {1: 'the Weeping Canopy', 12: 'the Pools of Strangers; the House and its labyrinth'},
    'rift': {2: 'the rope to the Shelf and the Under-Shelves', 10: 'the Edge; Redoubt Zero to the south'},
    'reach': {9: 'the old stair'},
}
CYK = {'reach': 'reach', 'heights': 'heights', 'cinder': 'cinder', 'fortis': 'fortis', 'dunes': 'dunes', 'coast': 'coast', 'woods': 'woods', 'rift': 'rift'}
ZC = {'core': (120, 60, 44), 'mixed': (160, 112, 76), 'residential': (186, 158, 116), 'green': (110, 140, 90)}

def city_sheet(k):
    L = json.load(open(LABELS))[k]
    dd = json.load(open(os.path.join(CY, 'cy_%s.json' % CYK[k])))
    S = 1500; W = S + 900; H = S + 180
    im = paper(W, H); d = ImageDraw.Draw(im, 'RGBA')
    RR = max(max(abs(r[0]), abs(r[1]), abs(r[2]), abs(r[3])) for r in dd['roads'])
    rad = S / 2 - 90; sc = rad / RR; cx, cy = S / 2 + 20, S / 2 + 150
    P = lambda x, y: (cx + x * sc, cy + y * sc)
    for b in dd['b']:
        x, y = P(b[0], b[1]); r = max(1.2, b[2] * sc * 0.5); d.rectangle([x - r, y - r, x + r, y + r], fill=ZC.get(b[5], (150, 120, 90)))
    for r in dd['roads']:
        w = 5 if r[5] == 'boulevard' else 3 if r[5] in ('ring', 'perimeter') else 1
        col = (40, 30, 24) if r[5] == 'boulevard' else (70, 56, 44) if r[5] in ('ring', 'perimeter') else (130, 112, 94)
        d.line([P(r[0], r[1]), P(r[2], r[3])], fill=col, width=w)
    pin = lambda i: (cx + L['pins'][i - 1][0] * rad, cy + L['pins'][i - 1][1] * rad)
    route, lamps, keeper = ROUTE[k]
    if route:
        pts = [pin(i) for i in route]
        for a, b in zip(pts, pts[1:]): dashed(d, a, b, (210, 110, 30, 255), 9, 22, 12)
        arrow(d, pts[-2], pts[-1], (210, 110, 30), size=30)
    for i, (x, y, name) in enumerate(L['pins'], 1):
        X, Y = pin(i)
        if i in lamps:
            d.polygon([(X + 22, Y - 34), (X + 32, Y - 12), (X + 22, Y - 4), (X + 12, Y - 12)], fill=(240, 140, 40), outline=(110, 50, 10))
        if i == keeper:
            d.ellipse([X - 30, Y - 30, X + 30, Y + 30], outline=(150, 30, 20), width=6)
        d.ellipse([X - 20, Y - 20, X + 20, Y + 20], fill=(250, 244, 226), outline=RED, width=4)
        d.text((X, Y), str(i), font=F(SC7, 22), fill=RED, anchor='mm')
    # the city is drawn 500 steps across (Phase 89 ruling: 400 to 600)
    steps_per_px = 500 / (2 * rad)
    bx, by = 60, H - 70; px100 = 100 / steps_per_px
    for q in range(5):
        d.rectangle([bx + q * px100 / 2, by, bx + (q + 1) * px100 / 2, by + 14], fill=INK if q % 2 == 0 else PAPER, outline=INK)
    d.text((bx + px100 * 2.5 + 20, by + 7), '250 steps   (the city is 500 steps across)', font=F(IT, 28), fill=INK, anchor='lm')
    d.text((30, 30), L['title'], font=F(SC7, 46), fill=INK)
    d.text((32, 92), L['note'] + '  Orange: the heart\'s way in. Flame: a lamp. Red ring: the keeper.', font=F(IT, 26), fill=(80, 60, 40))
    tx = S + 60; ty = 190
    d.text((tx, ty - 40), 'On the plan', font=F(SC7, 36), fill=RED)
    for i, (x, y, name) in enumerate(L['pins'], 1):
        tags = []
        if i in lamps: tags.append('lamp')
        if i == keeper: tags.append('keeper')
        if i in route: tags.append('the way in, %d' % (route.index(i) + 1))
        line = f"{i:>2}  {name}"
        d.text((tx, ty), line, font=F(RG, 26), fill=INK)
        if tags: d.text((tx + 40, ty + 30), '; '.join(tags), font=F(IT, 22), fill=(150, 80, 20)); ty += 26
        if i in DOORS.get(k, {}): d.text((tx + 40, ty + 30), 'door to ' + DOORS[k][i], font=F(IT, 22), fill=(40, 100, 60)); ty += 26
        ty += 40
    im.save(os.path.join(OUT, 'city-%s.jpg' % k), quality=86)

def organum_sheet():
    import numpy as np
    G = 900
    cover = np.zeros((G, G), np.int32)
    from PIL import Image as I2
    for k in ['reach', 'cinder', 'fortis', 'dunes', 'heights', 'coast', 'woods', 'rift']:
        dd = json.load(open(os.path.join(CY, 'cy_%s.json' % k)))
        RR = max(max(abs(r[0]), abs(r[1]), abs(r[2]), abs(r[3])) for r in dd['roads'])
        m = I2.new('L', (G, G), 0); md = ImageDraw.Draw(m)
        for r in dd['roads']:
            if r[5] in ('boulevard', 'ring', 'perimeter'):
                md.line([(G / 2 + r[0] / RR * G * 0.46, G / 2 + r[1] / RR * G * 0.46), (G / 2 + r[2] / RR * G * 0.46, G / 2 + r[3] / RR * G * 0.46)], fill=1, width=9)
        cover += np.array(m, np.int32)
    S = 1500; W = S + 900; H = S + 180
    im = paper(W, H); d = ImageDraw.Draw(im, 'RGBA')
    ox, oy, sc = 40, 170, S / G * 0.92
    # the ranks: straight streets like a keyboard (canon), north-south every 24 cells, two cross-streets
    ranks = list(range(60, G - 40, 24))
    for x in ranks: d.line([(ox + x * sc, oy + 50 * sc), (ox + x * sc, oy + (G - 50) * sc)], fill=(150, 140, 120), width=2)
    for y in (G * 0.3, G * 0.5, G * 0.7): d.line([(ox + 50 * sc, oy + y * sc), (ox + (G - 50) * sc, oy + y * sc)], fill=(110, 100, 86), width=6)
    # pipes: on a rank line wherever five or more of the eight figures' great lines meet
    n_p = 0
    for x in ranks:
        for y in range(60, G - 40, 10):
            c = cover[y, x]
            if c >= 4:
                hgt = 3 + (c - 3) * 3
                d.rectangle([ox + x * sc - 5, oy + y * sc - hgt, ox + x * sc + 5, oy + y * sc + hgt], fill=(70, 66, 64), outline=(30, 26, 24))
                n_p += 1
    # Registry Square, the Hall, the Choir-Hall
    def box(x, y, w, h, t, col=(180, 60, 40), right=False):
        d.rectangle([ox + x * sc, oy + y * sc, ox + (x + w) * sc, oy + (y + h) * sc], fill=col + (200,), outline=INK, width=3)
        if right: d.text((ox + (x + w + 8) * sc, oy + (y + h / 2) * sc), t, font=F(SC7, 28), fill=INK, anchor='lm', stroke_width=4, stroke_fill=PAPER)
        else: d.text((ox + (x + w / 2) * sc, oy + (y + h + 14) * sc), t, font=F(SC7, 28), fill=INK, anchor='mm', stroke_width=4, stroke_fill=PAPER)
    box(400, 400, 100, 70, 'Registry Square', (210, 200, 170)); box(505, 405, 40, 60, 'the Hall of Carriage', right=True)
    box(410, 210, 80, 60, 'the Choir-Hall', (150, 140, 160)); box(400, 330, 100, 40, 'the Arbiterium', (180, 170, 150))
    box(150, 430, 50, 30, 'the Tramway terminus', (120, 110, 100))
    d.ellipse([ox + 450 * sc - 14, oy + 450 * sc - 14, ox + 450 * sc + 14, oy + 450 * sc + 14], outline=RED, width=5)
    d.text((30, 30), 'The Organum, on the Keynote', font=F(SC7, 46), fill=INK)
    d.text((32, 92), 'Straight ranks, as the canon says. A pipe stands on a rank wherever four or more of the eight realms\' figures cross.', font=F(IT, 26), fill=(80, 60, 40))
    tx, ty = S + 60, 200
    for t in ['%d pipes, worked out from the eight figures:' % n_p, 'nothing placed by hand, nothing random.', '',
              'From the street it is a keyboard.', 'From the air the pipes fall in curving banks', 'no one in the city can see.', '',
              'The red ring is the Keynote, under', 'Registry Square: the Undercroft (Book Four\'s).', '',
              'The city is 600 steps across.']:
        d.text((tx, ty), t, font=F(RG, 28), fill=INK); ty += 40
    im.save(os.path.join(OUT, 'city-organum.jpg'), quality=86)
    return n_p

if __name__ == '__main__':
    for r in ['reach', 'heights', 'cinder', 'peaks', 'dunes', 'coast', 'woods', 'rift', 'middle']:
        print('places', r, realm_sheet(r))
    for k in ['reach', 'heights', 'cinder', 'fortis', 'dunes', 'coast', 'woods', 'rift']:
        city_sheet(k); print('city', k)
    print('organum pipes', organum_sheet())
