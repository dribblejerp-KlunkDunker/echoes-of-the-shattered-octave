#!/usr/bin/env python3
"""Phase 106: contact sheets from the sweep's pictures (tools/dev/out/sweep/{r3d,classic}/<map>-<view>.png).

  python3 tools/dev/sheets106.py [out_dir]     # sheets of six places each: 3D day, 3D behind, 3D night, classic day

Each row is one place, labelled with its map id. Sheets: out_dir/sheet-NN.jpg.
"""
import os, sys, glob
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
SW = os.path.join(HERE, 'out', 'sweep')
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(SW, 'sheets')
os.makedirs(OUT, exist_ok=True)
COLS = [('r3d', 'day'), ('r3d', 'back'), ('r3d', 'night'), ('classic', 'day')]
W, H, ROWS = 480, 225, 6
maps = sorted({os.path.basename(p).rsplit('-', 1)[0] for p in glob.glob(os.path.join(SW, 'r3d', '*-day.png'))})
order = open('/tmp/maps106.txt').read().split() if os.path.exists('/tmp/maps106.txt') else maps
maps = [m for m in order if m in maps] + [m for m in maps if m not in order]
for s in range(0, len(maps), ROWS):
    page = maps[s:s + ROWS]
    sheet = Image.new('RGB', (W * len(COLS), (H + 18) * len(page)), (20, 20, 20))
    d = ImageDraw.Draw(sheet)
    for r, m in enumerate(page):
        y = r * (H + 18)
        d.text((4, y + 3), '%s   (3D day | 3D behind | 3D night | classic day)' % m, fill=(240, 220, 160))
        for c, (rend, v) in enumerate(COLS):
            p = os.path.join(SW, rend, '%s-%s.png' % (m, v))
            if os.path.exists(p): sheet.paste(Image.open(p).convert('RGB').resize((W, H)), (c * W, y + 18))
    sheet.save(os.path.join(OUT, 'sheet-%02d.jpg' % (s // ROWS + 1)), quality=82)
print(len(maps), 'places,', (len(maps) + ROWS - 1) // ROWS, 'sheets in', OUT)
