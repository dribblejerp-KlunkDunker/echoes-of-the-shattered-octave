#!/bin/bash
# tools/dev/shots127.sh [name ...]   Phase 127's pictures into screenshots/p127-*.jpg (design §6.6), through the browser lock.
# Each scene is taken in a page of its own, so one scene's staging (a flight, the Church's day) never leaks into the next.
# Names: workday worknight pumps rootvault rim off stamps card name timber seams shoulder (default: all). Serve the game first at $PORT (default 4232).
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; PORT="${PORT:-4232}"; cd "$ROOT" || exit 1
NAMES="$*"; [ -z "$NAMES" ] && NAMES="workday worknight pumps rootvault rim off stamps card name timber seams shoulder"
for n in $NAMES; do
  PREVIEW_URL=http://127.0.0.1:$PORT PLAYWRIGHT_MODULE=${PLAYWRIGHT_MODULE:-/opt/npm-tools/node_modules/playwright} \
    timeout 1200 tools/dev/browser.sh node tools/dev/shots127.js "$ROOT/screenshots" "$n" || echo "scene $n failed"
done
# the switch off, beside the switch on: one JPEG each view
for v in classic 3d; do
  if [ -f screenshots/p127-on-$v.jpg ] && [ -f screenshots/p127-off-$v.jpg ]; then
    V=$v python3 - <<'PY'
import os
from PIL import Image, ImageDraw
v = os.environ['V']
a, b = Image.open('screenshots/p127-on-%s.jpg' % v), Image.open('screenshots/p127-off-%s.jpg' % v)
w, h = a.size; s = Image.new('RGB', (w * 2 + 12, h + 34), (17, 17, 17)); s.paste(a, (4, 30)); s.paste(b, (w + 8, 30))
d = ImageDraw.Draw(s); d.text((8, 8), 'the quarry at work on', fill=(220, 220, 220)); d.text((w + 12, 8), 'the quarry at work off: the frame as before', fill=(220, 220, 220))
s.save('screenshots/p127-off-%s.jpg' % v, quality=85)
PY
    rm -f screenshots/p127-on-$v.jpg; echo "wrote screenshots/p127-off-$v.jpg"
  fi
done
