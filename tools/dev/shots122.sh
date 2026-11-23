#!/bin/bash
# tools/dev/shots122.sh OUT
#   Phase 122: the pictures for the sculpted hands' finishing pass, taken by tools/dev/hands111.js in the 3D view (as
#   tools/dev/shots112.sh takes Phase 112's): the bare fist in three skin tones and on three weapons, the climb gloved and
#   bare, the glass arm raised and at rest, and a fresh profile's first view (no switch set: the game's own default).
#   The same names with -px are the pixel hands. Run it once against this branch and once against the code before it
#   (another server, PREVIEW_URL), then tools/dev/sheets122.py makes the before/after sheet.
O="${1:?an output folder}"; cd "$(dirname "$0")/../.." || exit 1
export PREVIEW_URL="${PREVIEW_URL:-http://127.0.0.1:4176}" PLAYWRIGHT_MODULE="${PLAYWRIGHT_MODULE:-/opt/npm-tools/node_modules/playwright}"
F="flags:sculptedHands=1"; P="flags:sculptedHands=0"; B="g:0,h:bare"
S=("first=face:1" "fist=w:hands,$B,face:1,$F" "fist-f2=w:hands,$B,face:2,$F" "fist-f5=w:hands,$B,face:5,$F"
   "knife=w:knife,$B,face:1,$F" "sword=$B,face:1,$F" "axe=w:axe,$B,face:1,$F"
   "climb=climb:0.5,low:1,face:1,$F" "climbbare=climb:0.3,low:1,$B,face:1,$F"
   "glass=w:glass,face:1,$F" "blade=face:1,$F"
   "fist-px=w:hands,$B,face:1,$P" "climb-px=climb:0.5,low:1,face:1,$P" "climbbare-px=climb:0.3,low:1,$B,face:1,$P")
tools/dev/browser.sh node tools/dev/hands111.js "$O" "${S[@]}" | grep -c tier
