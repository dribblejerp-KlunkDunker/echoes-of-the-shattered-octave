#!/bin/bash
# tools/dev/shots125b.sh [moment ...]   Phase 125b's pictures into screenshots/p125b-*.jpg (design 5.8), through the browser lock.
# Moments: needle hold bolts rope names coda frame off (default: all). Serve the game first at $PORT (default 4228).
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; PORT="${PORT:-4228}"; cd "$ROOT" || exit 1
PREVIEW_URL=http://127.0.0.1:$PORT PLAYWRIGHT_MODULE=${PLAYWRIGHT_MODULE:-/opt/npm-tools/node_modules/playwright} \
  timeout 2400 tools/dev/browser.sh node tools/dev/shots125b.js "$ROOT/screenshots" "$@" || exit $?
# the first-frame sheet: before and after, side by side, one JPEG
if [ -f screenshots/p125b-frame-before.jpg ] && [ -f screenshots/p125b-frame-after.jpg ]; then
  python3 - <<'PY'
from PIL import Image, ImageDraw
a, b = Image.open('screenshots/p125b-frame-before.jpg'), Image.open('screenshots/p125b-frame-after.jpg')
w, h = a.size; s = Image.new('RGB', (w * 2 + 12, h + 34), (17, 17, 17)); s.paste(a, (4, 30)); s.paste(b, (w + 8, 30))
d = ImageDraw.Draw(s); d.text((8, 8), 'frame 1 in the tavern, before the fix', fill=(220, 220, 220)); d.text((w + 12, 8), 'frame 1 in the tavern, with the fix', fill=(220, 220, 220))
s.save('screenshots/p125b-frame.jpg', quality=85)
PY
  rm -f screenshots/p125b-frame-before.jpg screenshots/p125b-frame-after.jpg; echo "wrote screenshots/p125b-frame.jpg"
fi
