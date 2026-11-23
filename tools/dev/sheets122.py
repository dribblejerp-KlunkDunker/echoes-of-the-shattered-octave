# Phase 122: the before/after sheet of the sculpted hands' finishing pass, from tools/dev/shots122.sh's pictures.
#   python3 tools/dev/sheets122.py BEFORE_DIR AFTER_DIR OUT.jpg
# BEFORE_DIR: shots122.sh against the code before Phase 122; AFTER_DIR: against this branch. Three columns a row.
import sys
from PIL import Image, ImageDraw, ImageFont
bd, ad, out = sys.argv[1:4]
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
TW, TH, BAR = 480, 300, 20
BG, INK, DIM = (18, 16, 14), (236, 226, 204), (176, 166, 146)
VIEW = (64, 41, 1216, 581)   # the 3D view in a 1280 x 720 frame
def im(d, n): return Image.open(f'{d}/{n}.png').convert('RGB')
def fit(i, box):   # a crop of the frame, scaled to fill a tile (aspect kept, centred on grey)
    c = i.crop(box); k = min(TW / c.width, TH / c.height); c = c.resize((int(c.width * k), int(c.height * k)), Image.LANCZOS)
    t = Image.new('RGB', (TW, TH), BG); t.paste(c, ((TW - c.width) // 2, (TH - c.height) // 2)); return t
V = VIEW; WR = (760, 150, 1216, 560); GR4 = (1000, 330, 1150, 470); RF = (960, 250, 1216, 490); RF4 = (1040, 280, 1170, 400); LF = (150, 340, 390, 520); CL = (440, 41, 940, 541)
rows = [
    ('The first view of a fresh profile', [('Before: the pixel hands', fit(im(bd, 'first'), V)), ('After: the sculpted hands', fit(im(ad, 'first'), V)), ('', None)]),
    ('The bare fist (right), about 2x', [('Phase 112', fit(im(bd, 'fist'), RF)), ('Phase 122', fit(im(ad, 'fist'), RF)), ('The pixel fist', fit(im(ad, 'fist-px'), RF))]),
    ('The bare fist, about 4x', [('Phase 112', fit(im(bd, 'fist'), RF4)), ('Phase 122', fit(im(ad, 'fist'), RF4)), ('Phase 122, the left fist', fit(im(ad, 'fist'), LF))]),
    ('Three skin tones, the lightest, a middle one and the darkest (Phase 122)', [('Face 4', fit(im(ad, 'fist-f4'), RF)), ('Face 1', fit(im(ad, 'fist'), RF)), ('Face 5', fit(im(ad, 'fist-f5'), RF))]),
    ('The nails at about 4x (Phase 122)', [('The right fist', fit(im(ad, 'fist'), RF4)), ('A knife', fit(im(ad, 'knife'), GR4)), ('An axe', fit(im(ad, 'axe'), GR4))]),
    ('Bare hands on three weapons (Phase 122)', [('Knife', fit(im(ad, 'knife'), WR)), ('Sword', fit(im(ad, 'sword'), WR)), ('Axe', fit(im(ad, 'axe'), WR))]),
    ('A climb, gloved', [('The pixel arm', fit(im(ad, 'climb-px'), CL)), ('Phase 112', fit(im(bd, 'climb'), CL)), ('Phase 122', fit(im(ad, 'climb'), CL))]),
    ('A climb, bare hands', [('The pixel arm', fit(im(ad, 'climbbare-px'), CL)), ('Phase 112', fit(im(bd, 'climbbare'), CL)), ('Phase 122', fit(im(ad, 'climbbare'), CL))]),
    ('The glass arm (unchanged)', [('Raised, Phase 112', fit(im(bd, 'glass'), V)), ('Raised, Phase 122', fit(im(ad, 'glass'), V)), ('At rest, Phase 122', fit(im(ad, 'blade'), V))]),
]
H = len(rows) * (TH + 2 * BAR)
S = Image.new('RGB', (3 * TW, H), BG); d = ImageDraw.Draw(S); y = 0
for label, tiles in rows:
    d.text((6, y + 2), label, fill=INK, font=F); y += BAR
    for i, (cap, t) in enumerate(tiles):
        if t is None: continue
        d.text((i * TW + 6, y + 2), cap, fill=DIM, font=f); S.paste(t, (i * TW, y + BAR))
    y += TH + BAR
S.save(out, quality=85); print(out, S.size)
