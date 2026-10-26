"""The models of the pixel-3D set: each is a function (pose) -> Figure, built from primitives in world units, standing
on z = 0, facing -Y. Colours are the game's own palettes (the painted sprites' tones). MODELS maps a sprite name to
(builder, frame width, frame height, kind): kind 'creature' bakes the five views in every pose; 'prop' bakes one
front view (the engine's props do not turn)."""
import math
from lib import Figure

# ---------------------------------------------------------------- the Cacophony Hound (sprite 'hound')
# A big grey hound of the Hedge, low and long, ears back, red eyes. 0.86 units at the ears at scale 1 (the game's
# def scale is 0.8). Poses: walk = diagonal legs swing; wind-up = haunches down, head up; strike = the lunge, jaws open.
def hound(pose):
    f = Figure('hound')
    fur, dark, pale, nose, eye, tooth = '#5c6474', '#3e4452', '#8a9099', '#1a1a1e', '#e0303a', '#e8e4d8'
    # body: a deep chest, a sagging belly, the hindquarters; a pale underside; a dark ruff at the shoulders
    f.box('chest', (0.30, 0.34, 0.32), (0, -0.14, 0.46), fur)
    f.box('belly', (0.26, 0.30, 0.24), (0, 0.12, 0.42), fur)
    f.box('rump', (0.28, 0.26, 0.30), (0, 0.32, 0.46), dark)
    f.box('underside', (0.22, 0.60, 0.10), (0, 0.06, 0.32), pale)
    f.box('ruff', (0.36, 0.16, 0.36), (0, -0.28, 0.50), dark)
    # neck and head: the neck's pivot is its base at the chest, the head's pivot its base at the neck's end
    f.box('neck', (0.18, 0.22, 0.18), (0, -0.30, 0.58), fur, origin='front')
    f.box('head', (0.22, 0.26, 0.20), (0, -0.22, 0.05), fur, parent='neck', origin='front')
    f.wedge('snout', (0.14, 0.18, 0.12), (0, -0.34, -0.03), fur, parent='head', taper=0.7)
    f.box('nose', (0.08, 0.04, 0.06), (0, -0.44, -0.01), nose, parent='head')
    f.box('jaw', (0.12, 0.20, 0.05), (0, -0.24, -0.08), dark, parent='head', origin='front')
    f.box('teeth', (0.10, 0.02, 0.03), (0, -0.42, -0.06), tooth, parent='head')
    f.box('eyeL', (0.03, 0.02, 0.03), (-0.08, -0.26, 0.05), eye, parent='head')
    f.box('eyeR', (0.03, 0.02, 0.03), (0.08, -0.26, 0.05), eye, parent='head')
    f.wedge('earL', (0.07, 0.05, 0.14), (-0.08, -0.08, 0.14), dark, parent='head', rot=(-20, -15, 0), taper=0.3, axis='x')
    f.wedge('earR', (0.07, 0.05, 0.14), (0.08, -0.08, 0.14), dark, parent='head', rot=(-20, 15, 0), taper=0.3, axis='x')
    # legs: an upper from the shoulder or hip, a lower from the knee, a paw at the end (pivots at the top of each)
    for side, sx in (('L', -0.11), ('R', 0.11)):
        f.box('shoulder' + side, (0.10, 0.12, 0.22), (sx, -0.16, 0.40), fur, origin='top')
        f.box('fore' + side, (0.08, 0.09, 0.20), (0, 0.0, -0.22), fur, parent='shoulder' + side, origin='top')
        f.box('fpaw' + side, (0.10, 0.13, 0.06), (0, -0.03, -0.17), dark, parent='fore' + side)
        f.box('hip' + side, (0.11, 0.16, 0.22), (sx, 0.32, 0.40), dark, origin='top')
        f.box('hind' + side, (0.08, 0.09, 0.20), (0, 0.0, -0.22), fur, parent='hip' + side, origin='top')
        f.box('hpaw' + side, (0.10, 0.13, 0.06), (0, -0.03, -0.17), dark, parent='hind' + side)
    f.box('tail', (0.06, 0.28, 0.06), (0, 0.44, 0.50), dark, rot=(-30, 0, 0), origin='back')
    # poses
    if pose == '_w1':
        f.rot('shoulderL', x=25); f.rot('hipR', x=25); f.rot('shoulderR', x=-22); f.rot('hipL', x=-22)
        f.rot('foreR', x=20); f.rot('hindL', x=20)
    elif pose == '_w2':
        f.rot('shoulderL', x=-22); f.rot('hipR', x=-22); f.rot('shoulderR', x=25); f.rot('hipL', x=25)
        f.rot('foreL', x=20); f.rot('hindR', x=20)
    elif pose == '_a1':       # haunches down, head up, ears flat
        for n in ('hipL', 'hipR'): f.rot(n, x=35)
        for n in ('hindL', 'hindR'): f.rot(n, x=-50)
        f.rot('neck', x=-25); f.rot('earL', x=-45, y=-15); f.rot('earR', x=-45, y=15)
        f.move('rump', dz=-0.08); f.move('belly', dz=-0.03)
    elif pose == '_a2':       # the lunge: everything forward and up, jaws wide
        for n in ('chest', 'belly', 'rump', 'underside', 'ruff', 'neck', 'tail'): f.move(n, dy=-0.10, dz=0.08)
        f.rot('shoulderL', x=-40); f.rot('shoulderR', x=-40); f.rot('hipL', x=35); f.rot('hipR', x=35)
        f.rot('neck', x=18); f.rot('jaw', x=35); f.move('teeth', dz=-0.015)
    return f


# ---------------------------------------------------------------- the Catalogue Proctor (sprite 'proctor')
# A grey man of the Catalogue: a long grey robe to the ground, a deep hood, a ledger held against the chest, a stylus
# in the other hand. 1.0 units tall. Poses: walk = the robe's hem steps, arms swing; wind-up = the ledger raised;
# strike = the stylus thrust down.
def proctor(pose):
    f = Figure('proctor')
    robe, robeD, hood, skin, book, bookP, brass = '#7a7d84', '#555860', '#3a3c44', '#c9b49a', '#5a2f28', '#d9cdb0', '#b08a3a'
    f.cyl('hem', 0.22, 0.52, (0, 0, 0), robeD, r_top=0.17, segs=10, origin='bottom')
    f.cyl('robe', 0.17, 0.30, (0, 0, 0.52), robe, r_top=0.15, segs=10, origin='bottom')
    f.box('shoulders', (0.36, 0.20, 0.10), (0, 0, 0.80), robe)
    f.ball('head', 0.10, (0, 0, 0.90), '#2a2a30', segs=8, rings=5)   # the face is in the hood's dark
    f.cyl('hoodBack', 0.13, 0.22, (0, 0.02, 0.80), hood, r_top=0.09, segs=10, origin='bottom')   # the cowl round the head
    f.box('hoodBrim', (0.26, 0.06, 0.08), (0, -0.09, 0.95), hood)
    f.box('hoodTop', (0.20, 0.20, 0.04), (0, 0.01, 1.00), hood)
    f.box('armL', (0.09, 0.09, 0.32), (-0.17, 0, 0.80), robe, origin='top')
    f.box('armR', (0.09, 0.09, 0.32), (0.17, 0, 0.80), robe, origin='top')
    f.box('handL', (0.07, 0.07, 0.06), (0, 0, -0.34), skin, parent='armL')
    f.box('handR', (0.07, 0.07, 0.06), (0, 0, -0.34), skin, parent='armR')
    f.box('ledger', (0.18, 0.05, 0.24), (0.05, -0.08, -0.26), book, parent='armL')
    f.box('pages', (0.15, 0.015, 0.20), (0.05, -0.115, -0.26), bookP, parent='armL')
    f.box('stylus', (0.015, 0.015, 0.22), (0, -0.05, -0.40), brass, parent='armR', rot=(60, 0, 0))
    f.box('belt', (0.36, 0.36, 0.04), (0, 0, 0.52), hood)
    if pose == '_w1':
        f.rot('armR', x=22); f.rot('armL', x=-10); f.rot('hem', x=0, y=4)
    elif pose == '_w2':
        f.rot('armR', x=-22); f.rot('armL', x=6); f.rot('hem', x=0, y=-4)
    elif pose == '_a1':       # the ledger raised, the stylus hand back
        f.rot('armL', x=-110); f.rot('armR', x=40)
    elif pose == '_a2':       # the stylus thrust forward and down
        f.rot('armL', x=-60); f.rot('armR', x=-85); f.rot('stylus', x=20)
    return f


# ---------------------------------------------------------------- props
def barrel(pose):
    f = Figure('barrel')
    wood, woodD, iron = '#7a5a36', '#5a4026', '#3a3a3c'
    f.cyl('lower', 0.17, 0.22, (0, 0, 0), wood, r_top=0.20, segs=12, origin='bottom')
    f.cyl('upper', 0.20, 0.22, (0, 0, 0.22), wood, r_top=0.17, segs=12, origin='bottom')
    f.cyl('lid', 0.16, 0.02, (0, 0, 0.44), woodD, segs=12, origin='bottom')
    f.cyl('hoop1', 0.205, 0.03, (0, 0, 0.09), iron, r_top=0.21, segs=12, origin='bottom')
    f.cyl('hoop2', 0.21, 0.03, (0, 0, 0.33), iron, r_top=0.205, segs=12, origin='bottom')
    return f


def crate(pose):
    f = Figure('crate')
    wood, woodD, iron = '#8a6a44', '#5e4630', '#3a3a3c'
    f.box('body', (0.44, 0.44, 0.44), (0, 0, 0.22), wood)
    for i, z in enumerate((0.07, 0.22, 0.37)):
        f.box('groove%d' % i, (0.46, 0.46, 0.012), (0, 0, z), woodD)
    for x in (-0.2, 0.2):
        for y in (-0.2, 0.2):
            f.box('brace%s%s' % (x > 0, y > 0), (0.05, 0.05, 0.45), (x, y, 0.225), iron)
    return f


MODELS = {
    'hound': (hound, 1.6, 1.2, 'creature'),
    'proctor': (proctor, 1.0, 1.25, 'creature'),
    'p_barrel': (barrel, 0.6, 0.6, 'prop'),
    'p_crate': (crate, 0.7, 0.7, 'prop'),
}
