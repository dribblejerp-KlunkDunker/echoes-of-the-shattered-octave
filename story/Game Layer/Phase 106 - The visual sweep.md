# Phase 106: the visual sweep

20 November 2026. Branch `p106-sweep`. Built by Opus 5.5. The owner, 20 Nov: "I also want to go back and make sure that visually the game looks right with assets", then "proceed".

## How it was done
`tools/dev/sweep106.js` photographed all 101 places in the game from where each one's map says you arrive: in the 3D view looking ahead and behind by day and ahead by night, and in the classic view by day, with the hands and the HUD as the player sees them. 404 pictures, put on contact sheets by `tools/dev/sheets106.py` and looked at one by one. No place raised a page error.

## Fixed in this phase
1. **Black ceilings near you in the 3D view.** Wherever you stood exactly on the line between two cells (which is where many rooms put you when you come in: the surgery, the mill, the tannery, the arena, the bakery, the carders, the Wick and Renn houses, the governor's house and room, the barge hold), the part of the ceiling closest to you came out black: a black band across the top third of the view. The cause: with the eye on a cell line, the corners of the cells beside it sit at zero depth, and the software rasteriser this machine uses (and some real ones) then drops those whole squares. The 3D eye is now nudged a hundred-thousandth of a step off any exact line, too small to see, and the rooms are whole. (`js/r3d21.js`)
2. **A pale void past the edge of hilly maps.** Where a hilly map ends at something low (a hedge at Poundstair, the bank at the Hollows), the 3D view showed a flat pale plane beyond, like fog lying on nothing. Flat maps have always had ground running on past their edge; hilly maps now do too, at the lowest height along their edge, and what the ground cannot reach the sky paints in the ground's own colour fading into the haze. (`js/r3d21.js`, `js/light21.js`)
3. **People walking out through you.** The road-walkers of Phase 60 go home by the gate, and that gate is where you arrive. If you came in as one set out, they stepped out of the gate inside you, filling the view with a sprite at arm's length. They now wait indoors while you stand on the doorstep, and come out once you step away. (`js/life60.js`)
4. **The Long Night orchard's frost stood up.** Its six frost patches were drawn as upright pale cards in the 3D view. They are now rime lying in the snow: the same snow tile with frozen glints in it, in those cells, in both views. (`js/longnight17.js`)

## Seen, and left as it is (by the books or by design)
- **The Continental Rift is the same grey by night as by day.** The book: "grey from above", lit the same at every hour, no stars. Built that way in Phase 100.
- **The Kestrel's deck and hold** load Whispergrove when the ship is not moored there; that is the game's rule, not a fault.
- **The gutted house (the White Mile), the Basilica School and the Black Square are very dark.** They were built dark on purpose (Phases 96 and 97); a lamp shows them.
- **Very close arrivals** (the flume landing facing a fence, the antler gallery's lamp niche at your elbow): the sweep stood at each map's built-in arrival point, and you never arrive at some of these, because the road or door you come by sets its own.

## Seen, and for the owner (not changed here)
- **One ceiling everywhere.** The tavern, Lyra's house, Greenhall, the cooper's, Tarrow's, the Bellwether, the library rooms and the Cantabile houses all have the same painted plaster-and-beam ceiling with the same crack in the same place. A few ceiling variants (different beams, no crack, smoke-stained, limewashed) would make houses feel different.
- **Beech trunks in the Hanger** are plain grey pillars with no bark at all; at close range they read as a missing texture.
- **The classic view of the Rift** shows a crawling moiré on its far walls.
- **Map edges** of most open places are tall rock walls standing all round the horizon; they read as the edge of a stage.
- **Older sprites close up**: the Phase 60 road-walkers and the old grass tufts are blocky at arm's length next to the painted people of Phases 75 and 76 (the hands-and-arms overhaul is already on the list).

## Verification
- `test/sweep106.test.js` (new, 5 checks): the surgery from its door at x = 2.0 and a room on a y line draw their near ceiling and match a view from a hair beside; Poundstair's view out of the gate shows ground darker than the haze; the orchard has no frost cards and its rime cells; the Stride's gauger waits in the gate while you stand there and comes out when you step away; no page errors.
- Also passing: `life60`, `life62`, `life64`, `life74`, `malting61`, `longnight17`, `visual`, `water`, `bestiary20b`, `walls77`, `cover105`, `eaves78`, `eaves82`, `body21`, `sprites21`, `card21`, `hanger22`, `mutton101`, `sheepwalk22`, `presets`, `pwa18`, `flume83`, `r3d21`, `light21`.
- The sweep's pictures: `tools/dev/out/sweep/` (not committed); the before-and-after sheet: `screenshots/p106-fixes.jpg`.
