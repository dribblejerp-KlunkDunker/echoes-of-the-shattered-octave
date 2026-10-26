#!/usr/bin/env python3
"""Phase 20b, the painted pieces: key the flat magenta background out of a generated painting and cut it to a game sprite.

  python3 tools/art/painted20/key.py            # every piece in PIECES -> img/painted20/<name>.png (RGBA) and a preview
  python3 tools/art/painted20/key.py --preview  # only the preview sheet

Source paintings (tools/art/painted20/src/*.png, 200x200, Canva's image generator; see CREDITS.md) were asked for on a
flat #FF00FF ground. Keying: a pixel is background by its distance from magenta in a de-spilled colour space; the edge is
hard (the engine draws alpha > 100 only) with the magenta spill pulled out of the rim; then the piece is cropped, scaled to
its sprite size with box filtering, lightly posterised to the game's painted-pixel look and given the same darkened rim
the procedural props have (scenery.js paint(), outline 0.58).
"""
import os, sys
from PIL import Image, ImageFilter
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(ROOT, 'img', 'painted20')
# name, source, target (w, h), options: pad (transparent rows kept under the piece), key strength
PIECES = [
    ('p_barrel', 'barrel.png', (48, 64), {}),
    ('p_cart', 'cart.png', (100, 76), {'anchor': 'bottom'}),
    ('p_crate', 'crate.png', (56, 56), {'anchor': 'bottom'}),
    ('p_statue_broken', 'statue.png', (56, 100), {'anchor': 'bottom'}),
    ('p_grass1', 'grass2.png', (40, 34), {'anchor': 'bottom', 'flip': True}),   # the broad clump, turned about (the tall tuft painting is too thin at this size)
    ('p_grass2', 'grass2.png', (40, 34), {'anchor': 'bottom'}),
    ('p_reed1', 'reeds.png', (28, 96), {'anchor': 'bottom'}),
    ('p_cart_broken', 'cart_broken.png', (100, 76), {'anchor': 'bottom'}),
    # wall decals: a cut-out with a transparent margin (the engine lays them over the wall; test/surfaces.test.js wants both)
    ('d_poster1', 'notice.png', (64, 64), {'margin': 3}),
    ('d_synod1', 'synod.png', (64, 64), {'margin': 3}),
    ('d_moss1', 'moss.png', (64, 64), {'margin': 1}),
    ('p_bones_small', 'bones.png', (60, 26), {'anchor': 'bottom'}),
]


def key(img, thresh=0.42):
    a = np.asarray(img.convert('RGB')).astype(np.float32) / 255.0
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    # magenta-ness: red and blue high, green low. d in [0,1], 0 = pure magenta
    d = np.sqrt(((1 - r) ** 2 + g ** 2 + (1 - b) ** 2) / 3.0)
    alpha = np.clip((d - thresh * 0.55) / (thresh * 0.9), 0, 1)
    # de-spill: pull the magenta cast out of translucent rim pixels by lifting green toward the red/blue mean
    spill = np.clip((r + b) / 2 - g, 0, 1) * (1 - alpha) * 2.0
    g2 = np.clip(g + spill * 0.6, 0, 1)
    r2 = np.clip(r - spill * 0.3, 0, 1); b2 = np.clip(b - spill * 0.3, 0, 1)
    rgba = np.dstack([r2, g2, b2, alpha])
    return Image.fromarray((rgba * 255).astype(np.uint8), 'RGBA')


def finish(img, size, opts):
    w, h = size
    bbox = img.split()[3].point(lambda v: 255 if v > 90 else 0).getbbox()
    if bbox: img = img.crop(bbox)
    if opts.get('flip'): img = img.transpose(Image.FLIP_LEFT_RIGHT)
    if opts.get('fill'):
        out = img.resize((w, h), Image.BOX)
    else:
        sw, sh = img.size
        mg = opts.get('margin', 0)
        k = min((w - 2 * mg) / sw, (h - 2 * mg) / sh)
        tw, th = max(1, round(sw * k)), max(1, round(sh * k))
        small = img.resize((tw, th), Image.BOX)
        out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        ox = (w - tw) // 2
        oy = h - th - mg if opts.get('anchor') == 'bottom' else (h - th) // 2
        out.paste(small, (ox, oy))
    a = np.asarray(out).astype(np.int32)
    rgb, al = a[..., :3], a[..., 3]
    solid = al > 100
    # the game's hard edge, then the painted-pixel look: a light posterise and the darkened rim
    rgb = (rgb // 6) * 6 + 3
    rim = solid & ~(np.roll(solid, 1, 0) & np.roll(solid, -1, 0) & np.roll(solid, 1, 1) & np.roll(solid, -1, 1))
    rgb = np.where(rim[..., None], rgb * 0.62, rgb)
    final = np.dstack([np.clip(rgb, 0, 255), np.where(solid, 255, 0)]).astype(np.uint8)
    return Image.fromarray(final, 'RGBA')


def main():
    os.makedirs(OUT, exist_ok=True)
    sheet = []
    for name, src, size, opts in PIECES:
        img = finish(key(Image.open(os.path.join(HERE, 'src', src))), size, opts)
        img.save(os.path.join(OUT, name + '.png'))
        sheet.append(img)
        print('wrote', name, img.size)
    W = sum(i.size[0] * 4 + 8 for i in sheet); H = max(i.size[1] for i in sheet) * 4
    prev = Image.new('RGBA', (W, H), (60, 60, 60, 255)); x = 0
    for i in sheet:
        prev.paste(i.resize((i.size[0] * 4, i.size[1] * 4), Image.NEAREST), (x, H - i.size[1] * 4), i.resize((i.size[0] * 4, i.size[1] * 4), Image.NEAREST)); x += i.size[0] * 4 + 8
    prev.save(os.path.join(HERE, 'preview.png')); print('preview', prev.size)


if __name__ == '__main__':
    main()
