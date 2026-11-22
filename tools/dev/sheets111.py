# Phase 111: the two review sheets, from pictures taken by tools/dev/hands111.js with CROP=1.
#   python3 tools/dev/sheets111.py NEW_DIR OLD_DIR P109_OPTIONS.jpg OUT_DIR
# NEW_DIR: this phase's pictures; OLD_DIR: the same scenes from the game before it (blade, fist, glass, song, buckler, swing).
# Writes OUT_DIR/p111-hands.jpg (the four poses: approved sheet, before, now by day, now by night),
# OUT_DIR/p111-kinds.jpg (every weapon kind, the shield, the climb, swings, night) and OUT_DIR/p111-before-after.jpg.
import sys
from PIL import Image, ImageDraw, ImageFont
new, old, p109, out = sys.argv[1:5]
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
TW, TH, BAR, HEAD = 480, 208, 20, 30
BG, INK, DIM = (18, 16, 14), (236, 226, 204), (176, 166, 146)
def tile(path): return Image.open(path).convert('RGB').resize((TW, TH), Image.LANCZOS)
def sheet(cols, heads, rows, name, quality=88):
    H = (HEAD if heads else 0) + len(rows) * (TH + BAR)
    S = Image.new('RGB', (cols * TW, H), BG); d = ImageDraw.Draw(S)
    if heads:
        for i, h in enumerate(heads): d.text((i * TW + 6, 7), h, fill=INK, font=F)
    y = HEAD if heads else 0
    for label, tiles in rows:
        d.text((6, y + 3), label, fill=DIM, font=f)
        for i, t in enumerate(tiles):
            if isinstance(t, tuple): d.text((i * TW + 6, y + 3), t[0], fill=DIM, font=f); t = t[1]
            if t is not None: S.paste(t, (i * TW, y + BAR))
        y += TH + BAR
    S.save(out + '/' + name, quality=quality); print(name, S.size)
# column 3 of the Phase 109 sheet: four rows, each a 480-wide picture under a caption band
o = Image.open(p109).convert('RGB'); rh = o.height / 4.0
col3 = [o.crop((1440, int(i * rh + (60 if i == 0 else 36)), 1920, int((i + 1) * rh))).resize((TW, TH), Image.LANCZOS) for i in range(4)]
poses = [('A blade in hand', 'blade'), ('The bare fist', 'fist'), ('The glass arm', 'glass'), ('Open hands for a Song', 'song')]
sheet(4, ['Approved (Phase 109, option 3)', 'In the game before (Phase 110)', 'Now, by day', 'Now, by night'],
      [(lab, [col3[i], tile(f'{old}/{k}.png'), tile(f'{new}/{k}.png'), tile(f'{new}/{k}-n.png')]) for i, (lab, k) in enumerate(poses)], 'p111-hands.jpg')
kinds = [[('Short sword', 'blade'), ('Knife', 'knife'), ('Longsword', 'longsword'), ('Axe', 'axe')],
         [('Mace', 'mace'), ('Spear (both hands)', 'spear'), ('Bell-glaive', 'glaive'), ('Maul', 'maul')],
         [('Glass blade', 'glassblade'), ('Pistol', 'pistol'), ('Sling', 'sling'), ('Crossbow', 'crossbow')],
         [('Carbine', 'carbine'), ('Harpoon gun', 'harpoon'), ('Hornbow', 'hornbow'), ('Hand-bow', 'handbow')],
         [('The arm behind a buckler', 'buckler'), ('Behind the kite shield', 'kite'), ('The climb', 'climb'), ('Mail gauntlets', 'mail')],
         [('Mid-swing: the arm runs out of the view', 'swing'), ('A maul coming down', 'maulswing'), ('Shield, by night', 'shield-n'), ('By a lamp at night', 'lamp')]]
sheet(4, None, [('', [(lab, tile(f'{new}/{k}.png')) for lab, k in row]) for row in kinds], 'p111-kinds.jpg')
ba = [('The arm behind a shield', 'buckler'), ('Mid-swing', 'swing'), ('A Song', 'song')]
sheet(2, ['Before (Phase 110)', 'Now (Phase 111)'], [(lab, [tile(f'{old}/{k}.png'), tile(f'{new}/{k}.png')]) for lab, k in ba], 'p111-before-after.jpg')
