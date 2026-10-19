"""Rebuild the complete Shattered Octave Books bundle.

Expects every project doc dumped as markdown into /mnt/user-data/outputs/projectdocs/
with its original doc filename (minus the "claude/" prefix). Routes them into folders,
builds a PDF for each, writes the README, and zips the lot.
"""
import pathlib, shutil, subprocess, io, markdown
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

OUT  = pathlib.Path("/mnt/user-data/outputs")
ROOT = OUT / "Shattered Octave Books"
SRC  = OUT / "projectdocs"
TMP  = pathlib.Path("/tmp/bundlebuild"); TMP.mkdir(exist_ok=True)

CSS = """
<style>
@page { margin: 0; }
body { display:block !important; max-width:none !important; padding:0 !important; gap:0 !important;
       font:11.5pt/1.62 "DejaVu Serif", Georgia, serif !important; color:#111 !important;
       background:#fff !important; text-align:justify; }
h1 { font-family:"DejaVu Sans",Helvetica,sans-serif; font-size:19pt; text-align:left; margin:0 0 4pt; }
h2 { font-family:"DejaVu Sans",Helvetica,sans-serif; font-size:15pt; letter-spacing:.06em;
     text-align:left; margin:0 0 2pt; %(brk)s }
h3 { font-family:"DejaVu Serif",Georgia,serif; font-size:13pt; font-style:italic; font-weight:normal;
     text-align:left; margin:0 0 14pt; color:#333; }
h4,h5,h6 { font-family:"DejaVu Sans",Helvetica,sans-serif; text-align:left; }
h1,h2,h3,h4 { page-break-after:avoid; }
p { margin:0 0 8pt; orphans:3; widows:3; }
blockquote { font-style:italic; color:#333; border:0 !important; margin:10pt 26pt 14pt;
             font-size:10.5pt; text-align:left; page-break-inside:avoid; }
blockquote p { margin:0 0 3pt; }
hr { border:0; border-top:1px solid rgba(0,0,0,.25); width:28%%; margin:13pt auto; }
table { font-size:9pt; border-collapse:collapse; width:100%%; page-break-inside:avoid; margin:8pt 0 12pt; }
th,td { border:1px solid rgba(0,0,0,.25); padding:3pt 5pt; text-align:left; vertical-align:top; }
th { background:rgba(0,0,0,.05); font-family:"DejaVu Sans",Helvetica,sans-serif; font-size:8.5pt; }
</style>
"""


def wk(src, dest, title):
    subprocess.run(["wkhtmltopdf", "--quiet", "--enable-local-file-access", "--page-size", "Letter",
                    "--margin-top", "22mm", "--margin-bottom", "20mm",
                    "--margin-left", "24mm", "--margin-right", "24mm",
                    "--title", title, str(src), str(dest)], check=True)


def number(path):
    reader = PdfReader(str(path)); writer = PdfWriter()
    for i, page in enumerate(reader.pages, start=1):
        if i > 1:
            buf = io.BytesIO(); c = canvas.Canvas(buf, pagesize=letter)
            c.setFont("Times-Roman", 9); c.setFillGray(0.35)
            c.drawCentredString(letter[0] / 2, 32, str(i)); c.save(); buf.seek(0)
            page.merge_page(PdfReader(buf).pages[0])
        writer.add_page(page)
    with open(path, "wb") as f:
        writer.write(f)
    return len(reader.pages)


def pdf_from_markdown(md_path, dest, title, breaks=True):
    body = markdown.markdown(md_path.read_text(encoding="utf-8"),
                             extensions=["nl2br", "tables"])
    t = TMP / (dest.stem[:60] + ".html")
    t.write_text("<!doctype html><html><head><meta charset=utf-8>"
                 + (CSS % {"brk": "page-break-before:always;" if breaks else ""})
                 + "</head><body>" + body + "</body></html>", encoding="utf-8")
    wk(t, dest, title)
    return number(dest)


# ---------------------------------------------------------------- routing
# (source filename in projectdocs/) -> (destination folder, destination stem, page-breaks)
ROUTES = [
    ("Book Two - Part One Ch4-7.md",
     "Books/Book Two - The Great Discord", "Part One Ch4-7", True),
    ("Book Two - Part Two Ch8-14.md",
     "Books/Book Two - The Great Discord", "Part Two Ch8-14", True),
    ("Book Three - Part One Ch1-4.md",
     "Books/Book Three", "Part One Ch1-4", True),
    ("Book Three - Part Two Ch5-8.md",
     "Books/Book Three", "Part Two Ch5-8", True),
    ("Book Three - Part Three Ch9-12.md",
     "Books/Book Three", "Part Three Ch9-12", True),
    ("Book Four - Part One Ch1-4.md",
     "Books/Book Four", "Part One Ch1-4", True),

    ("Source - The Expanded World Bible.md",
     "World Bibles", "Vol I - The Expanded World Bible", True),
    ("Source - World Bible Vol II - Gazetteer and Bestiary.md",
     "World Bibles", "Vol II - Gazetteer and Bestiary", True),
    ("Source - World Bible Vol III - Canon Reconciliation and the Road to Book Five.md",
     "World Bibles", "Vol III - Canon Reconciliation and the Road to Book Five", True),
    ("World Bible Vol III - Errata and Rulings.md",
     "World Bibles", "Vol III (b) - Errata and Rulings", True),
    ("Source - World Bible Vol IV - The Hush, the Organum, the Rust Coast.md",
     "World Bibles", "Vol IV - The Hush, the Organum, the Rust Coast", True),
    ("World Bible Vol V - The Winter Gazetteer.md",
     "World Bibles", "Vol V - The Winter Gazetteer", True),
    ("World Bible Vol VI - The Rift, the Organum Revisited, and the Press.md",
     "World Bibles", "Vol VI - The Rift, the Organum Revisited, and the Press", True),
    ("World Bible Vol VII - The Calendar of Aethelgard.md",
     "World Bibles", "Vol VII - The Calendar of Aethelgard", True),

    ("Game Design Document - Book One Prototype.md",
     "Game Layer", "Game Design Document - Book One Prototype", True),
    ("Game - Phase 6 New In-Game Text (for review).md",
     "Game Layer", "Phase 6 - New In-Game Text", True),
    ("Game - Phase 9 New In-Game Text (for review).md",
     "Game Layer", "Phase 9 - New In-Game Text", True),
]


def main():
    missing, built = [], []
    for fname, folder, stem, breaks in ROUTES:
        src = SRC / fname
        if not src.exists():
            missing.append(fname)
            continue
        d = ROOT / folder
        d.mkdir(parents=True, exist_ok=True)
        md = d / f"{stem}.md"
        shutil.copy(src, md)
        pages = pdf_from_markdown(md, d / f"{stem}.pdf", stem, breaks=breaks)
        built.append((folder + "/" + stem, pages))

    # Book One and the Book Two chapters 1-3 draft already live at the bundle root;
    # move them under Books/ so the whole thing has one shape.
    books = ROOT / "Books"; books.mkdir(exist_ok=True)
    for pat in ("Book One - The Silenced Province (manuscript).*", "Book One - Chapters"):
        for p in ROOT.glob(pat):
            target = books / p.name
            if p.resolve() != target.resolve() and not target.exists():
                shutil.move(str(p), str(target))
    b2 = books / "Book Two - The Great Discord"; b2.mkdir(parents=True, exist_ok=True)
    for p in list(ROOT.glob("Book Two - The Great Discord (draft).*")) + list(ROOT.glob("Book Two - Chapters")):
        name = p.name.replace("Book Two - The Great Discord (draft)", "Part One Ch1-3")
        target = b2 / name
        if not target.exists():
            shutil.move(str(p), str(target))
    for p in list(ROOT.glob("Series Bible.*")):
        target = ROOT / "World Bibles" / p.name.replace("Series Bible", "Series Bible (canon, v1.2)")
        target.parent.mkdir(exist_ok=True)
        if not target.exists():
            shutil.move(str(p), str(target))

    print("BUILT:")
    for name, pages in built:
        print(f"  {name}  ({pages} pp)")
    if missing:
        print("MISSING (not found in projectdocs/):")
        for m in missing:
            print("  " + m)


if __name__ == "__main__":
    main()
