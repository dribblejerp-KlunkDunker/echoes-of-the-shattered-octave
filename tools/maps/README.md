# Map tools

`continent89.py` paints the continent of Aethelgard (Phase 89) in code: land, sea, realms, relief, woods, dunes, the Rift, roads, the Tramway, the Kestrel's way, every named place, and each great city drawn from its own cymatic figure. Every mark comes from hashed noise worked out from position, so the map is the same each time; nothing uses random numbers.

To run it:
1. Convert the game's fonts to TTF (needs `pip install brotli fonttools`):
   `python3 -c "from fontTools.ttLib import TTFont; ..."` for `fonts/alegreya-sc-latin-700-normal.woff2`, `alegreya-sc-latin-500-normal`, `alegreya-latin-400-italic`, `alegreya-latin-500-normal`, `alegreya-latin-700-italic`, `cinzel-latin-700-normal`, into `/tmp/cmap/fonts` (or set `MAPFONTS`).
2. Make the city plans with the Cymatic City Engine (`generateCity` at each realm's note, seed 1, fundamental 48 Hz) as `cy_<realm>.json` in `/tmp` (or set `CYDIR`); without them the city badges are drawn plain.
3. `python3 tools/maps/continent89.py [out.jpg]` (default `screenshots/p89/continent-map.jpg`, with a half-size copy beside it).
