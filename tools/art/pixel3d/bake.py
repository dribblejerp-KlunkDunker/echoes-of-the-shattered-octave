#!/usr/bin/env python3
"""Bake the pixel-3D set: python3 tools/art/pixel3d/bake.py [model ...] [--engine CYCLES|BLENDER_WORKBENCH] [--preview]

For each model in models.MODELS: build it in every pose, render the five bearings (one for a prop), quantise to the
pixel look, crop, and pack one atlas PNG per model into img/pixel3d/<name>.png with a cell table; the tables of every
baked model are written between the markers in js/pixel3d.js. --preview also writes tools/art/pixel3d/preview.png
(every cell at 3x) for a look.
"""
import os, sys, json, re, hashlib, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib
from lib import ROOT, HERE, VIEWS, POSES, PX_PER_UNIT
import models
from PIL import Image

OUT = os.path.join(ROOT, 'img', 'pixel3d')
RUNTIME = os.path.join(ROOT, 'js', 'pixel3d.js')
args = [a for a in sys.argv[1:] if not a.startswith('--')]
engine = 'CYCLES' if '--engine' in sys.argv and 'CYCLES' in sys.argv else 'BLENDER_WORKBENCH'
names = args or list(models.MODELS)
os.makedirs(OUT, exist_ok=True)
tmp = os.path.join(HERE, '.render'); os.makedirs(tmp, exist_ok=True)

tables = {}
previews = []
for name in names:
    build, fw, fh, kind = models.MODELS[name]
    cells = []
    poses = POSES if kind == 'creature' else ['']
    views = VIEWS if kind == 'creature' else [0]
    for pose in poses:
        for vi, bearing in enumerate(views):
            lib.reset(engine)
            fig = build(pose)
            fig.face(bearing)
            cam, W, H = lib.camera(fw, fh, (fh / 2 - 0.1) / math.cos(math.radians(lib.PITCH)))   # the feet 8 px above the frame's bottom
            orow, ocol = lib.origin_row(cam, W, H)
            path = os.path.join(tmp, '%s_%d%s.png' % (name, vi, pose))
            lit, flat = lib.render(path)
            img = lib.quantise(Image.open(lit), Image.open(flat))
            c = lib.crop(img, orow, ocol)
            if not c: raise SystemExit('empty render ' + path)
            sp, hs, cx, dy = c
            key = '%d|%s' % (vi, pose)
            cells.append((key, sp, (hs, cx, dy)))
            previews.append((name + key, sp))
            print('  %s %s view %d: %dx%d hs %.3f cx %.3f dy %.3f' % (name, pose or 'idle', vi, sp.size[0], sp.size[1], hs, cx, dy), flush=True)
    table, sheet = lib.atlas(cells, os.path.join(OUT, name + '.png'))
    with open(os.path.join(OUT, name + '.png'), 'rb') as fh_: v = hashlib.sha1(fh_.read()).hexdigest()[:8]
    tables[name] = {'f': name + '.png', 'v': v, 'k': kind, 'c': table}
    print('baked', name, sheet.size, flush=True)

# merge into the runtime's table (other models keep their cells)
if os.path.exists(RUNTIME):
    src = open(RUNTIME).read()
    m = re.search(r'// @@ATLAS-BEGIN.*?\n(.*?)\n  // @@ATLAS-END', src, re.S)
    if m:
        old = {}
        mm = re.search(r'const ATLAS = (\{.*\});', m.group(1), re.S)
        if mm:
            try: old = json.loads(mm.group(1))
            except ValueError: old = {}
        old.update(tables)
        line = '  const ATLAS = ' + json.dumps(old, separators=(',', ':')) + ';'
        src = src[:m.start(1)] + line + src[m.end(1):]
        open(RUNTIME, 'w').write(src)
        print('wrote', RUNTIME, 'models:', ' '.join(sorted(old)))
if '--preview' in sys.argv:
    S = 3
    W = sum(im.size[0] * S + 4 for _, im in previews); H = max(im.size[1] * S for _, im in previews)
    prev = Image.new('RGBA', (W, H), (70, 70, 74, 255)); x = 0
    for _, im in previews:
        big = im.resize((im.size[0] * S, im.size[1] * S), Image.NEAREST)
        prev.paste(big, (x, H - big.size[1]), big); x += big.size[0] + 4
    prev.save(os.path.join(HERE, 'preview.png')); print('preview', prev.size)
