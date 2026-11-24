# Phase 116: roofs for the later places (Sun-Peak Vigil, Null-Watch, Cross Pool), then raised as in Phase 108

Phase 108's first question to the owner: the later places were not built as houses with roofs, and raising them meant designing their roofs from the books first. The owner, 23 Nov: "finish up with 5". Everything below that the books do not give is **[PROPOSED]**.

**Nothing was added to the world.** The maps (walls, doors, what can be walked through) are untouched; the classic view and the Original preset (which draws the classic view) are byte for byte as before. It is part of the eaves art (Options, "Roofs, windows and eaves"; `GFX.ART` 'eaves'), so it follows that switch. No new in-game words.

## The books first

**Sun-Peak Vigil.** No book describes its buildings or names a roof.
- Series Bible (canon), 205: "Alabaster peaks in the south. ... **Sun-Peak Vigil**".
- Vol II - Gazetteer and Bestiary, 91: "SUN-PEAK VIGIL ... Mountain monastery of the old Choral Orthodoxy. Twelve clergy left."; 93: "The Vigil rings a bell at dusk"; 100: Abbess Coriel.
- Book Two, Part Two Ch8-14, 523: "Peaks, white as bone ... snow on their summits even at the end of Ashfall."
- Book Two, Part Two Ch8-14, 1099: "the roof of a white house, in the shadow of its white chimney ... over the parapet": this is Sol-Luminary's white city, not the Vigil, so it does not bind the Vigil's roofs (noted, not followed).
- So its roofs are invented: pale stone, snow. [PROPOSED]

**Null-Watch.** No line describes a roof.
- Book Three, Part One Ch1-4, 783: "long coats with lead plates sewn into them"; 787: the Lead Brothers' robes "dull grey, heavy. Lead."; 795: the General's "breastplate of plain dark iron"; 859: the mooring-yard and the mast.
- Vol VI §1 (lines 111-112): "**Smell:** lead, lamp-oil, wet wool, cold rock. **Texture:** obsidian and lead mortar, four miles of it. Everything heavy. Everything cold."
- Lead is the Watch's own stuff, so its roofs are lead. [PROPOSED]

**Cross Pool.** The game's own place (Phase 85), the Low Rings' drowned old town.
- Vol II, 26: Oakhaven, "iron-bough trunks trained into halls ... **roofed in slate**"; the Low Rings are one of its four quarters, "flooded lower city, abandoned since the Flume began over-pumping". No book names the Flume country's or the Low Rings' houses further.
- The game's own text (js/roads86.js): "Lead off the garret roofs, brass off the doors"; "Lead flashing on a garret roof, half off already". Built: lead flashing half off the four garrets the salvagers strip.

No book line contradicts the design.

## What was built (js/roofs116.js)

- **Sun-Peak Vigil.** The weather side, once for the whole place, is **west** [PROPOSED]: the map has no open side on the ranges' long axis (north is the drop past the parapet, south the landing shelf, east and west the mountain's rock) and no book gives the Heights' weather; west lets the garth see one range's snow and the other's bare stone. (Review of 23 Nov: the roofs had read clean and dry.) The two ranges of cells: steep roofs (pitch 0.92) of heavy stone slates; on the west pitch snow lies thick from a rounded lip at the ridge down to an uneven slid edge (a hashed tile, cut out), with a hand's breadth of bare wet slate at the eaves; the east pitch is bare stone dark with wet, snow lodged only in its joints and along the ridge. The snow is blue-grey, never pure white, and at night the palest thing in the Vigil but still dark. from the garth one range shows its snow and the other its stone. A lean-to pentice of the same slates round the cloister walk, its low edge on a timber beam over the white pillars, its head against the ranges and the north wall (the wall given a coping to meet it, which is also the arch's lintel). A small gable over the gate on two stone corbels, snow on its west verge. A low stone cap on four piers over the bell tower: the bell hangs plain to see between them. The gate's gable has snow on its west pitch and a lip over its ridge, the pentice a thin snow over all of it, the tower's cap snow on its west face and thin snow elsewhere. One stone stack on the west range, bare and dark with soot, the snow melted back round it, and its one thin smoke, seen across the garth (js/firesmoke.js: `_fsThin`, `_fsRate`, `_fsRange` on one chimney; the 3D view only; the Vigil is given an empty chimney list when firesmoke has placed none). Nothing gilded, nothing coloured.
- **Null-Watch.** Low roofs (pitch 0.28) of dull mid-dark grey lead sheet, plainly another stuff from the black glass (review of 23 Nov), darker in the laps, no shine, with rolled seams standing up down both pitches every 0.6 of a cell, a rolled drip at each eave and a lead roll on the ridge, on the Talking Halls, the blocks that stand free three by three, and every block of the Watch's blockwork at least four by four (carved out of the mass, the biggest first): 331 roofs. By night the mesh is built with a black lead (as EAVES78 does for its lit windows), so they go black with the wall. Obsidian gables. One iron stove-pipe with a lead collar and a cowl, on the Halls. Nothing on the wall, the towers, the batteries, the cart gate or the mooring-yard (the test checks every cell). At night they go black with the wall. The old garrison's store has no outside of its own (its door is in the obsidian at Tower Nine's foot), so it has no roof.
- **Cross Pool.** Every house: slate gone green with deep moss, ridges that sag between the gables, a course or two slipped to show the battens and rafters, barge boards and fascias. The six garrets have a knee wall under their eaves with a row of six small weavers' casements over the board (one pane gone, one boarded), and four of them the salvagers' lead flashing half off the ridge, one sheet hanging over the eave. The corn loft and the kerb house are dry inside and you walk into them, so they are raised; every other house stands in the water, keeps its drowned height and gets only its roof.

## Raised, as Phase 108

| Place | Ground storey taller by | Door | Why [PROPOSED] |
| --- | --- | --- | --- |
| Sun-Peak Vigil (the twelve cells) | 0 | 1.30 | the ranges already stand 3.6 high: each cell's door raised, a stone head over it, the range made good above it |
| Null-Watch (the Talking Halls) | 0 | 1.30 | the Halls already stand 3.6 high: its door raised under an obsidian head dressed in lead |
| Cross Pool (the corn loft, the kerb house) | 0.38 | 1.24 | the Low Rings' own proportions (Phase 108): the same town |

Not raised: the Vigil's gate and postern, every gate, postern and tower door on the Wall, the blockhouses (no door; already 2 to 3 high), the drowned garrets and houses.

## Verification
- New: `test/roofs116.test.js` (13 checks, with the Vigil's snow by pitch and the lead's day and night tiles): each place's roofs and kinds its own, its tiles used nowhere else; the Vigil's snow on one pitch, the lead low and rolled with one pipe, the drowned roofs sagging and slipped, the weavers' windows; nothing on the Wall's wall, towers, batteries, cart gate or yard; the doors raised per the table and nothing else; the maps untouched; the classic frame byte for byte; the switch; no random numbers; the cost.
- Cost: the roofs add about 900 (Vigil), 44,000 (Null-Watch) and 6,800 (Cross Pool) triangles to the static mesh; drawing them takes 1 to 6 ms (the Vigil, Cross Pool) and 36 to 132 ms (Null-Watch, on a shared machine) of a mesh build; the per-frame hook costs under 0.1 ms.
- Picture: `screenshots/p116-roofs.jpg` (before on the left).

## For the owner
0. **The wall-walk view.** From the wall-walk the inner wall body stands just under eye height and hides every roof within about twenty-five cells; only a far, hazed line of lead shows. The sheet's Watch row is a street view (the drips and rolled verges); the seams themselves show only from above, which the map nowhere gives.
1. The Vigil's pentice sits nearly edge-on to anyone standing in the garth, so from there it reads as a line over the pillars; from the walk itself it reads as a covered walk. *Recommend: leave it; a steeper pentice would cut into the ranges' eaves.*
2. The Halls' lead is low enough that from the square only its stove-pipe shows over the parapet line; the blockhouses' lead reads from the streets. *Recommend: leave it ("low-pitched", as ruled).*
