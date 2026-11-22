# Phase 112: the sculpted hands' review sheets and clip, from full-frame pictures taken by tools/dev/hands111.js.
#   python3 tools/dev/sheets112.py SCULPTED_DIR PIXEL_DIR CLIP_DIR screenshots/p109-options.jpg OUT_DIR
# SCULPTED_DIR: scenes with flags:sculptedHands=1 (full frames); PIXEL_DIR: Phase 111's pixel-hand pictures of the four
# poses (CROP=1); CLIP_DIR: swing frames (sw04..sw92, th10..th94). Writes p112-hands.jpg (the approved sculpted option,
# the pixel hands, sculpted by day, by night, by a street lamp at night), p112-kinds.jpg and p112-swing.gif.
import sys, glob, os
from PIL import Image, ImageDraw, ImageFont
sc, px, clip, p109, out = sys.argv[1:6]
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
TW, TH, BAR, HEAD = 480, 225, 20, 30
BG, INK, DIM = (18, 16, 14), (236, 226, 204), (176, 166, 146)
VIEW = (64, 41, 1216, 581)   # the 3D view in a 1280 x 720 frame
def view(path): return Image.open(path).convert('RGB').crop(VIEW).resize((TW, TH), Image.LANCZOS)
def fit(im): return im.convert('RGB').resize((TW, TH), Image.LANCZOS)
def sheet(cols, heads, rows, name):
    H = (HEAD if heads else 0) + len(rows) * (TH + BAR)
    S = Image.new('RGB', (cols * TW, H), BG); d = ImageDraw.Draw(S)
    if heads:
        for i, h in enumerate(heads): d.text((i * TW + 6, 7), h, fill=INK, font=F)
    y = HEAD if heads else 0
    for label, tiles in rows:
        d.text((6, y + 3), label, fill=DIM, font=f)
        for i, t in enumerate(tiles):
            if isinstance(t, tuple): d.text((i * TW + 6, y + 3), t[0], fill=DIM, font=f); t = t[1]
            S.paste(t, (i * TW, y + BAR))
        y += TH + BAR
    S.save(out + '/' + name, quality=88); print(name, S.size)
o = Image.open(p109).convert('RGB'); rh = o.height / 4.0
col1 = [fit(o.crop((480, int(i * rh + (60 if i == 0 else 36)), 960, int((i + 1) * rh)))) for i in range(4)]
poses = [('A blade in hand', 'blade'), ('The bare fist', 'fist'), ('The glass arm', 'glass'), ('Open hands for a Song', 'song')]
sheet(5, ['The option chosen (Phase 109, option 1)', 'The pixel hands (Phase 111, the default)', 'Sculpted, in the game, by day', 'Sculpted, by night', 'Sculpted, by a street lamp at night'],
      [(lab, [col1[i], fit(Image.open(f'{px}/{k}.png')), view(f'{sc}/{k}.png'), view(f'{sc}/{k}-n.png'), view(f'{sc}/{k}-l.png')]) for i, (lab, k) in enumerate(poses)], 'p112-hands.jpg')
kinds = [[('Knife', 'knife'), ('Longsword', 'longsword'), ('Axe', 'axe'), ('Mace', 'mace')],
         [('Spear (both hands)', 'spear'), ('Bell-glaive', 'glaive'), ('Maul', 'maul'), ('Glass blade', 'glassblade')],
         [('Pistol', 'pistol'), ('Sling', 'sling'), ('Crossbow', 'crossbow'), ('Hornbow', 'hornbow')],
         [('Mail gauntlets', 'mail'), ('Mid-swing', 'swing'), ('A maul coming down', 'maulswing'), ('By a street lamp at night', 'blade-l')],
         [('Behind a kite shield (the glass arm)', 'shield'), ('Behind a buckler (bare)', 'buckler'), ('Climbing', 'climb'), ('Climbing, bare hands', 'climbbare')]]
sheet(4, None, [('', [(lab, view(f'{sc}/{k}.png')) for lab, k in row]) for row in kinds], 'p112-kinds.jpg')
frames = [view(p) for p in sorted(glob.glob(clip + '/sw*.png'))] + [view(p) for p in sorted(glob.glob(clip + '/th*.png'))]
if frames:
    frames[0].save(out + '/p112-swing.gif', save_all=True, append_images=frames[1:], duration=90, loop=0, optimize=True)
    print('p112-swing.gif', len(frames), os.path.getsize(out + '/p112-swing.gif'))
