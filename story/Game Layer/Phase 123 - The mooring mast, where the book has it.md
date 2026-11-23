# Phase 123: the mooring mast, where the book has it

The owner, 23 Nov 2026 (`story/Game Layer/Rulings of 23 Nov 2026.md`, l. 78), of the mast, which the game had on the east
side of Oakhaven's square and Book One has north of the town over the quarry: **"match the book and change the map."**

## 1. The book

Book One, full manuscript (`story/Books/Book One - The Silenced Province/Book One - The Silenced Province (full manuscript).md`).
Every line about the mast, the quarry rim and the road between the North Gate and the quarry, read in the manuscript:

| Line | What it says |
|---|---|
| 650 | "down the track from the North Gate and along Cooper's Row toward the square" (the way into town from the quarry side) |
| 672 | "above the roofs to the north, where the Consortium's mooring mast stood over the quarry like a gallows, a skyship was riding at anchor." (from the square) |
| 883 | "The skyship rode at the mast above the roofs, turning slowly on its line." (from the square, noon) |
| 887 | "A smuggler at the mast who would not ask questions." |
| 1203 | "There's a skyship at the quarry mast." (Kaelen) |
| 1321 | "The *Drift-Kestrel* rode at the Consortium's mooring mast a hundred feet above the Oakhaven quarry, turning slowly on her line" |
| 1339 | "Two days they had ridden at this mast with twelve crates of the Catalogue's property in the hold" |
| 1351 | Vane "swung himself onto the mast-ladder" to go down to the tavern in town |
| 1394 | "the quarry-hands at the mast" |
| 1657 | "It was full dark when he climbed back up the mast-ladder. Mags met him at the top with a lantern" |
| 1715 | from the quarry's stepped terraces: "Above it all, black against the stars, rose the mooring mast, and at the mast rode the little smuggler's ship with no colors, a single lantern burning low in her hold." |
| 2527 | "On Driftday afternoon, from the North Gate, he watched a small figure ... climb the mast-ladder of the *Drift-Kestrel*" |
| 2568 | "*The* Drift-Kestrel*, at the Oakhaven mast. Driftday night.*" |
| 2574 | "Mags had brought them up the mast-ladder at three in the afternoon in full view of the quarry" ... "*Nobody looks up.*" |
| 2576 | "Nobody in the Oakhaven works had looked up at a mooring mast all week ... a small boy going up a ladder a hundred feet above their heads" |
| 2652 | "The sensible thing, obviously, was to cut the mast-line." |
| 3380-3392 | the Greening in the quarry: Tobiah "at the rim"; "the two of them came out onto the quarry road and saw the town" |
| 3404 | "the wall was closing over the North Gate" |
| 3594-3598 | "The mast went first." ... "The Consortium's mooring mast was a hundred and twenty feet of riveted iron on four splayed legs, sunk into the bedrock of the quarry rim. There was a young oak in the middle of it. It had not been there twenty minutes ago. It had come up between the legs ... the iron on the north leg went from straight to not-straight with a sound like a bell being hit with a hammer, over and over, as the rivets let go one at a time." |
| 3604 | "The mooring cable was two inches of wound steel ... parting with a crack that went across the whole quarry" |
| 3606 | "the town of Oakhaven came out from behind the quarry rim below them like something being uncovered." |
| 3644 | "Take her down over the north gate" (Grab the Line is at the North Gate, not at the mast) |
| 6471 | (an Echo) "Vane cuts the mast-line at the quarry and runs, because there is nobody at the North Gate worth going back for" |

The World Bibles (all but Vol VIII) say nothing about where the mast stands; the Series Bible (l. 597, ch. 12 "Grab the
Line") says only "The mooring mast is taken by a tree". Book Two (Part Two Ch8-14 l. 142, "sixty feet of iron rungs")
and Book Three (the Watch's mast) are other masts.

What the book settles: the mast is iron, a lattice on four splayed legs, 120 feet, sunk in the bedrock of the **quarry's
rim**, north of the town; it is seen from the square over the roofs to the north and from the North Gate, with the
ladder and anyone on it in view; the ship rides a hundred feet up, turning slowly on her line; at night her lantern
shows. In the Greening a young oak comes up between the legs and bends the north leg, the cable is cut, and the ship
comes down **over the North Gate** for Grab the Line.

### What the book changed in the design

1. **The map.** The design asks for the mast "in the quarry map (id 'quarry')". The game's `quarry` map is the
   underground workings below the headframe (`js/maps.js` `buildQuarry`, a `genDungeon` with a stone ceiling at 2.7):
   there is no sky in it and no rim. The quarry's rim, where the headframe stands in the open, is the north end of the
   `clearing` map ("Outside the Hedge": the headframe door "The quarry headframe" at (20, 4) leads down into `quarry`).
   The book puts the mast "on the quarry rim", in the open, seen from the North Gate road: so it is built there, beside
   the headframe on the clearing's north edge, at (11.5, 4.0). In Oakhaven's own frame (js/horizon20.js `OFF`, the North
   Gate joining the two maps) that is (14.5, -31): north of the square, 55 cells away, over the roofs.
2. **Grab the Line stays at the North Gate.** The design lists "the cable cut and Grab the Line" among what happens at
   the mast. In the book (l. 3604-3644) the cable is cut at the mast and the ship then comes down over the North Gate,
   where the four hundred are; js/rope45.js already plays it there. It does not move.
3. **During the Greening nobody reaches the mast.** The Hedge closes over the North Gate (l. 3404) and the ship comes to
   the town. So the greened town keeps no "run for the mast" trigger; the mast's own trigger on the rim keeps the old
   Part Two ending for anyone who reaches it when the Greening's scene is not running (a guest, an old save).

## 2. The survey (written before any code changed)

Every place the game used the mast, the `'crates'` use at the ladder, the trigger `'mast'`, or the cells near (35..38,
19..22) of the Oakhaven map; and every test that stood the player there. "Now" is what each does after this phase.

### The code

| # | File (line) | What it did at the mast | What it does now |
|---|---|---|---|
| 1 | js/maps.js 298-301 | the pylon cells `rect(36,19,37,20,'t_wood')`; deco `crates` (35.5, 21.5); deco `ladder` (38.5, 21.5) `use:'crates'` "The Drift-Kestrel's mast-ladder, up to her hold"; `trigger(36.5, 22.5, 2.2, 'mast')` | no pylon cells (cobbles); the two decos keep their places in the list (saves keep entities by index) and become the carters' mounting-block and water trough [PROPOSED]; the trigger keeps its slot (saves keep triggers by index) as an inert `mast_was`, never entered |
| 2 | js/maps.js 436-437 `shapeOakhaven` | `lowWall(36,19,37,20,'t_wood',3.6)`, the timber pylon's height | gone |
| 3 | js/maps.js `buildClearing` (and the new js/mast123.js) | nothing at the rim | the iron mast at (11.5, 4.0), the ladder deco `use:'crates'` at its foot (same label), the `'mast'` trigger, a stone apron where the legs go into the rock; appended after every older entity and trigger of the clearing |
| 4 | js/game.js 1513-1517 `useDeco` `'crates'` | the hold card; after the Greening "The mast-ladder sways over the square. Not now." | the same card from the rim's ladder; "The mast-ladder sways over the quarry rim. Not now." |
| 5 | js/game.js 1550 the Greening card's journal and message | "...the North Gate — and reach the mooring mast on the east side of the square before the oaks close over it." / "...through the gate, to the mooring mast." | the route to the quarry rim (no gate: the mast is before it) |
| 6 | js/game.js 1576-1590 `checkTriggers` `'mast'` | before the Greening the "Nobody is aboard who will talk to you yet" line; after it, the voice and the hounds if the Hedge was answered, then `ending()` | the same, from the rim; while the Greening's scene runs (js/greening44.js `live()`) or Grab the Line runs (js/rope45.js stages 1-6) the trigger only says the first line, so the book's order holds |
| 7 | js/game.js 1792 `PLACE_POS.mast` (36.5, 22.5), `askPlace` | "Where is the mooring mast?" gave paces east of the square | the answer points north, out through the North Gate to the quarry rim (one new line) |
| 8 | js/game.js 1976 the automap's hand-lettered names | 'Mast' at (36.5, 18.4) on Oakhaven | 'Mast' on the clearing's automap, at the rim |
| 9 | js/data.js 290, 299, 394-411 | the Kestrel's profile ("A skyship at the mooring mast"), `PLACES` 'The mooring mast', Hetty's and Vane's lines ("at the mast", "up the mast-ladder") | unchanged: none says where the mast is |
| 10 | js/cargo56.js 4, 181 | cargo night and the third crate from the ladder, `G.mapId === 'oakhaven'` | the same steps, flags and lines from the rim's ladder (`'clearing'`) |
| 11 | js/touches71.js 19-20, 171 | "Forty-eight." at the bottom of the ladder at night, `G.mapId === 'oakhaven'` | the same from the rim's ladder |
| 12 | js/smalllife.js 9-10, 551-576, 641-660 | the moored Kestrel, turning on her line at MAST (37, 20, top 2.8) on Oakhaven; the mooring line | moored at the rim's mast on the clearing, a hundred feet up (lift 10, the mast head 12), turning slowly; the line from the mast head; she stays until the cable is cut (js/rope45.js stage 1), not only until the bit snaps (l. 3594-3604: the mast "went first", during the gate scene) |
| 13 | js/horizon20.js 15, 306 | the far town seen from the clearing and the Downs drew the pylon's cells; the knoll's sign names "the mooring mast" among Oakhaven's roofs | the pylon is not in the town's cells; the mast and the ship are drawn where they stand from Oakhaven and the Downs too (js/mast123.js); the knoll's line puts the mast away to the north-east, over the quarry |
| 14 | js/eaves78.js 20, 74, 112 | comments: no ridge reaches the mast (3.6) | comments say the tower; no code used the mast |
| 15 | js/rumours.js 91 | "Get to the mooring mast on the east side of the square." | "...on the quarry rim." |
| 16 | js/rumours.js 93, 101-105, 288 | the ship lifting off the mast; Hetty up the mast-ladder; the Gazette's "make their way to the mooring mast" | unchanged: none says where |
| 17 | js/rite43.js 206-207 | the Greening's journal and button: "the shaft, the headframe, the North Gate — and reach the mooring mast"; "UP. The service ladder, the headframe, the gate, the mooring mast." | the route to the rim (no gate) |
| 18 | js/greening44.js 4, 30 | comments: "the lone 300-second dash to the mast"; "The mast still ends Part Two for a player who runs for it" | the comment says where the mast is now and when its trigger ends Part Two |
| 19 | js/rope45.js 4, 77 | the Kestrel "has come down over the North Gate" | unchanged (the book's place) |
| 20 | js/kestrel16.js 15 | comment: "Before the escape the ship stays at the Oakhaven mast" | comment: the quarry rim |
| 21 | js/thread70.js 169 | the Echo: "Vane cuts the mast-line at the quarry and runs" | unchanged (already the book's line) |
| 22 | js/ash50.js 95, 101, 245, 264 | "Kaelen, by the mast": the ship's own mast, on her deck | unchanged (not the mooring mast) |
| 23 | js/places97.js 9, 52, 88 | the mooring mast is one of Oakhaven's "Where is" places, drawn from `PLACE_POS` | a place of the clearing (the rim), with its anchor mark |
| 24 | js/ledger15.js 536 | the "Where is" marks on Oakhaven's map from `PLACE_POS` | the mast has no mark inside Oakhaven (it is not there); its mark is the clearing's (row 23) |
| 25 | js/engine.js 900, js/r3d21.js 1643, js/sprites21.js 581 | every sprite past 1.14 fog lengths is dropped | the same, except a sprite marked `farSee` (only the mast and the ship at it): the tallest thing for miles is seen at any distance, hazed |
| 26 | js/upgrades.js 846-847 | comment: the house's door onto Oakhaven, "and its mast would replay the Part Two ending" | left (true of the old map, harmless) |
| 27 | js/governor46.js, js/night13.js, js/nerves13.js, js/guard.js, js/access.js, js/audio.js | named in the brief; read: nothing at the mast (the Governor's house is at (37, 7), the north row; night13 and nerves13 count Oakhaven safe, not the mast; audio has no mast sound) | unchanged |
| 28 | js/cinematic24.js 79 | the opening's 'town' shot looks east along the road from (10.5, 23.5) to (18.5, 23.5), toward where the pylon stood | the same shot; the east side is the carters' standing |
| 29 | js/logmap.js 30, 184, 241 | the logbook's sketches 'crates' and 'kestrel' (crates; an airship): no mast, no place | unchanged |
| 30 | js/cantabile17.js, js/rift100.js, js/heights92.js, js/anchorage94.js, js/stores113.js, js/fold113.js, js/air93.js, js/epigraphs73.js, js/couriers.js, js/coda.js, js/grove.js, js/cutter68.js, js/library26-books.js, js/data.js 114/130 | other masts: Port Cantabile's mast-tower, the Watch's mooring-mast, the Kestrel's own mast, Whisper-Grove's mast-ladder, the Kestrel's ladder abroad | unchanged |

30 entries; 20 change (1-8, 10-15, 17, 18, 20, 23-25), the rest were read and left.

### The tests that stood the player at the old place

| Test | What it did | Taught |
|---|---|---|
| test/cargo56.test.js 50 | `loadMap('oakhaven')`, the ladder with `use:'crates'` | the same on `'clearing'` |
| test/canon32.test.js 102-114 | the one `use:'crates'` deco in Oakhaven, with the mast-ladder label | the one on the clearing |
| test/canon32.test.js 205-212 | the `'mast'` trigger on Oakhaven after the Greening: voice, hounds, ending | the same on the clearing's trigger |
| test/r1release27.test.js 61-71 | the `'mast'` trigger on Oakhaven: nothing in Part Three, the ending after the Greening | the same on the clearing's trigger |
| test/smalllife.test.js 183-205 | moored on Oakhaven, 1.5-2.2 cells from MAST; gone at the Greening; "not moored anywhere else" (the clearing) | moored on the clearing at SHIP.half from the mast; gone once the cable is cut; not moored on Oakhaven |
| test/touches71.test.js 123 | the ladder found in the current map (Oakhaven) | the same on the clearing |
| test/eaves78.test.js 37, 185, 237 | the pylon cell (36, 19) at 3.6 as the skyline's top | the tower is the town's top; the mast is not in the town's cells |
| test/relief.test.js 41 | (36, 19) keeps 3.6 after the town is built | (36, 19) is ground; the plinth and the parapets keep theirs |

Read and not touching the old place: places97 (only the name's kind), rope45 (the ending card's words), cutter68,
epigraphs73, cantabile17, air11, greening14, folk14, mods, origins, phase1-integration, props14, traversal, visual,
gates, max20, screenshots.js (other crates, other masts).
