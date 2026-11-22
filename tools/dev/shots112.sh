#!/bin/bash
# tools/dev/shots112.sh OUT
#   Phase 112: every picture the sculpted hands' review sheets and clip are made from, taken by tools/dev/hands111.js in
#   the 3D view with "Hands: Sculpted" chosen. Writes OUT/s (the scenes) and OUT/clip (a slash and a thrust, frame by
#   frame), then tools/dev/sheets112.py makes the sheets. Start the server first (see tools/dev/runsuites.sh).
#     tools/dev/shots112.sh /tmp/h112 && python3 tools/dev/sheets112.py /tmp/h112/s PIXEL_DIR /tmp/h112/clip screenshots/p109-options.jpg screenshots
#   PIXEL_DIR: Phase 111's pictures of the pixel hands (blade, fist, glass, song; CROP=1).
O="${1:?an output folder}"; cd "$(dirname "$0")/../.." || exit 1
export PREVIEW_URL="${PREVIEW_URL:-http://127.0.0.1:4176}" PLAYWRIGHT_MODULE="${PLAYWRIGHT_MODULE:-/opt/npm-tools/node_modules/playwright}"
F="flags:sculptedHands=1"; N="tod:0.95,$F"; L="tod:0.95,at:oakhaven@25.0@29.3@-0.5,$F"
S=("blade=$F" "fist=w:hands,g:0,h:bare,$F" "glass=w:glass,$F" "song=song:1,$F"
   "blade-n=$N" "fist-n=w:hands,g:0,h:bare,$N" "glass-n=w:glass,$N" "song-n=song:528,$N"
   "blade-l=$L" "fist-l=w:hands,g:0,h:bare,$L" "glass-l=w:glass,$L" "song-l=song:1,$L"
   "knife=w:knife,$F" "longsword=w:longsword,$F" "axe=w:axe,$F" "mace=w:mace,$F"
   "spear=w:spear,$F" "glaive=w:p12_bellglaive,$F" "maul=w:maul,$F" "glassblade=w:p12_glassblade,$F"
   "pistol=w:pistol,$F" "sling=w:p87_feltsling,$F" "crossbow=w:crossbow,$F" "hornbow=w:p87_hornbow,$F"
   "mail=h:a_gauntlets,$F" "swing=atk:0.46,$F" "maulswing=w:maul,atk:0.5,dir:chop down,$F"
   "shield=s:a_kite,$F" "buckler=s:a_buckler,g:0,h:bare,$F" "climb=climb:0.5,low:1,$F" "climbbare=climb:0.3,low:1,g:0,h:bare,$F")
tools/dev/browser.sh node tools/dev/hands111.js "$O/s" "${S[@]}" | grep -c tier
C=(); for a in 04 12 20 28 36 44 52 60 68 76 84 92; do C+=("sw$a=atk:0.$a,$F"); done
for a in 10 22 34 46 58 70 82 94; do C+=("th$a=w:spear,atk:0.$a,dir:thrust,$F"); done
for a in 04 12 20 30 45 60 75 86 95; do C+=("so$a=song:1,cast:0.$a,$F"); done
tools/dev/browser.sh node tools/dev/hands111.js "$O/clip" "${C[@]}" | grep -c tier
