# Phase 105: ground cover

20 November 2026. Branch `p105-ground`. Built by Opus 5.5. The owner, 20 Nov: "1 add the ground details. keep the 453 mb download".

## What changed in the game
- **Small things on the ground near your feet, outdoors, in the 3D renderer.** Grass tufts (two crossed blades that sway a little in the wind) and the odd clover on grass and turf; pebbles on dirt and tracks; fallen leaves on woodland floors, in ochre, rust, pale and brown. They come from Phase 21's close-up ground (PR #44, closed on 19 Nov because Phase 77's sharp ground replaced its textures): this was the part Phase 77 did not have.
- **The same in the same place, every visit, every machine.** Where each piece stands, its size, its turn and its shade come from a hash of the cell and the map. No random numbers.
- **Each tuft takes its colour from the ground under it**, a little fresher, drier or darker than its neighbours, so Oakhaven's late-summer green gets late-summer tufts.
- **Only on soft ground.** Grass, turf, moss and tracks, including Oakhaven's four worn grass tiles from Phase 20; a newer tile is judged by its colour. Never on stone, cobbles, flags, boards, snow, chalk or water. Nothing indoors.
- **Nothing in play changes**: what you can click, hit or stand on is the same with it on or off.
- **Options > Graphics & access > "Ground cover"** switches it. Off in Original and Low, on in Medium and above. Reduce motion stops the sway. About 150 pieces near you; under a fifth of a millisecond a frame on this machine's software graphics.
- **Also fixed** (found by the Codex review of Phase 104): the Options hint for offline audio said "about 52 MB"; it now says about 450 MB, and a check fails if it drifts more than a fifth from the real download again. The download stays at 453 MB, as ruled.

## Pictures
`screenshots/p105-oakhaven.jpg` and `screenshots/p105-deepwoods.jpg` (top: off; bottom: on).

## Files
- `js/cover105.js` (new): the pass, the little pictures, which ground gets what, the Options row.
- `js/presets.js`: `groundCover` is off in Low.
- `js/pwa18.js`, `tools/i18n/p18-pwa.tsv`: the size hint. `tools/i18n/p105-cover.tsv`: the French for the Options row.
- `test/cover105.test.js` (new, 8 checks), `test/presets.test.js`, `test/pwa18.test.js`.

## Verification
- `cover105`: which tiles get cover; tufts on Oakhaven's green and leaves in the Deep Woods, the same twice, drawn, and gone when off; nothing indoors; picks, depth and material read-back the same on and off; Reduce motion; the Options row and the presets; cost; no page errors. 8 of 8.
- Also passing: `presets`, `pwa18` (with the new size check), `voice-acting`, `story-i18n`, and every suite that uses the 3D renderer: `body21`, `card21`, `eaves78`, `eaves82`, `hanger22`, `mutton101`, `sheepwalk22`, `sprites21`, `walls77`, `light21`, `cinematic24`, `r3d21`.
