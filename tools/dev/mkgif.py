# python3 mkgif.py <out.gif> <width> <colours> <ms> <label> <frames dir> [<second dir for side-by-side "before">]
import sys, os, glob
from PIL import Image, ImageDraw, ImageFont
out, w, cols, ms, label, d = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), sys.argv[5], sys.argv[6]
d2 = sys.argv[7] if len(sys.argv) > 7 else None
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 13)
except Exception: font = ImageFont.load_default()
def tag(im, t):
    dr = ImageDraw.Draw(im); tw = dr.textlength(t, font=font); dr.rectangle([6, 6, 16 + tw, 26], fill=(18, 22, 26)); dr.text((11, 8), t, fill=(226, 214, 176), font=font); return im
fr = []
fs = sorted(glob.glob(d + '/*.png')); fs2 = sorted(glob.glob(d2 + '/*.png')) if d2 else None
for i, f in enumerate(fs):
    a = Image.open(f).convert('RGB'); h = round(a.height * w / a.width); a = a.resize((w, h), Image.LANCZOS)
    if fs2:
        b = Image.open(fs2[i]).convert('RGB').resize((w, h), Image.LANCZOS); im = Image.new('RGB', (w, h * 2 + 4), (18, 22, 26)); im.paste(tag(b, 'before'), (0, 0)); im.paste(tag(a, label), (0, h + 4))
    else: im = tag(a, label) if label else a
    fr.append(im)
if not os.environ.get('ONEWAY'): fr = fr + fr[-2:0:-1]                       # there and back
pal = fr[len(fr) // 3].quantize(cols, method=Image.MEDIANCUT)
q = [f.quantize(palette=pal, dither=Image.FLOYDSTEINBERG) for f in fr]
q[0].save(out, save_all=True, append_images=q[1:], duration=ms, loop=0, optimize=True)
print(out, len(q), 'frames', round(os.path.getsize(out) / 1e6, 2), 'MB')
