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
   the headframe on the clearing's north edge, at (13.0, 3.6). In Oakhaven's own frame (js/horizon20.js `OFF`, the North
   Gate joining the two maps) that is (16.0, -31.4): north of the square, 55 cells away, over the roofs.
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

## 3. What was built

**The mast on the quarry rim** (js/mast123.js). The foot at (13.0, 3.6) on the clearing, west of the headframe, on the
clearing's north edge. In Oakhaven's frame it is (16.0, -31.4): from the square, 55 cells north and a
little west, over the roofs. It was first put at (11.5, 4.0); the pictures showed the oak at (11.1, 8.0) standing
straight in front of it from the North Gate road, hiding the ladder, so it moved a cell and a half east, where the
road sees it clear of that oak. Nothing on the rim moved for it: the headframe, its door, the pump, the crates, the
sign and every oak are where they were (no tree could be moved without changing every later tree: they are placed by
a seeded draw).

- Riveted iron, drawn in code pixel by pixel: four legs from stone footings (the front pair outermost, the back pair
  inside them and darker), girders at eleven levels with the panels shortening as the legs come together, X-bracing on
  the face, zig-zags on the sides, 132 rivets (down the front legs and two at every joint), rust at every joint and
  running down from it (from a hash), a platform with a rail at the head and the mooring cone. Twelve units high: a
  hundred and twenty feet, against the Chapel's tower at 4.1 and the tallest oak on the rim at about 6. The mast-ladder
  runs up the middle of the face; its foot is the old ladder deco (same `use`, same label), drawn now as iron rails.
- The legs go into stone: the ground under the foot is the rim's stone (`t_stone`).
- The space between the legs is open from the ground to the first girder, where the book's young oak comes up.
- After the cut (rope45 stage 1 on, Grab the Line; or g44 past 5; or Part Three) the mast is drawn as the book leaves
  it: the young oak up between the legs and through the lattice, the north leg bent above it, the whole leaning a
  little, the cut cable hanging from the head.
- The Kestrel (js/smalllife.js) rides at the head: keel ten units up, the mast head at 11.2, a ship of 3.4 (about sixty
  feet), turning slowly on her line as before; her lanterns (bow, stern, the hold's) burn after dark.

**Seen from where the book sees it.** The mast and the ship carry `farSee`: the three sprite passes (js/engine.js,
js/r3d21.js's default provider and its picking frame, js/sprites21.js) no longer drop them past the fog, so on the rim
they are seen from the North Gate road at thirty cells. From Oakhaven and the Watch Downs js/mast123.js hands the
renderer two far copies with the frame's own entities (never in a map's list, never saved, never picked): each is the
true thing scaled about the eye, stood just inside the map's edge on the line of sight, so it covers exactly the
pixels the real one would at any pitch, everything in the town hides it where it would, and it is hazed as a thing at
the town's edge, not as a ghost. At its true size, 55 cells off, it was a thin pale mark below the far hill (the
Commander's review of the first square picture). So the far view draws it, as the horizon's other landmarks are drawn,
at the height Book One's line needs ("above the roofs to the north ... like a gallows", l. 672): the copy grows smoothly
with distance from its true size at the North Gate (33 cells) to 1.8 times it from 58 cells on, the ship with it at its
head, so it never pops as you walk toward it, and at the gate the far copy and the rim's own mast agree within six
per cent. In the 3D view the lighting (js/light21.js) hazes a farSee sprite (material 6.5 from js/sprites21.js, flag
128) by at most 0.3, so it is a dark iron silhouette on the skyline in both views; nothing else is touched by that line.
At night it is a dark shape against the sky. The book gives the mast no lamp; the ship has "a single lantern burning
low in her hold" (l. 1715) and Mags meets Vane "at the top with a lantern" (l. 1657), so her lanterns burn and the
mast carries none.

**Everything that happened at the mast happens there.** The ladder's `use:'crates'` (the hold card, the ledger names,
the journal), cargo night (js/cargo56.js: the clerk on Driftday night, the third crate at the dead hour), "Forty-eight."
(js/touches71.js), the "Not now" after the bit snaps, the trigger's line before the Greening, and after it the voice and
the hounds for a player who answered the Hedge, then the ship. Steps, flags, lines and rewards are the same.

**What a scene now does differently.**
1. The mast's trigger ends Part Two only when neither the Greening's scene (js/greening44.js `live()`) nor Grab the Line
   (js/rope45.js stages 1-6) is running; while they run it says the Kestrel's first line. In the book the ship comes to
   the North Gate; nobody reaches the mast (ll. 3404, 3594-3644). Before, the pylon in the square could end Part Two in
   the middle of the Greening's scene.
2. The Kestrel stays moored through the Greening's lanes until she comes down over the North Gate (rope45 stage 1);
   before, she vanished the moment the bit snapped. The book: "The mast went first", during the gate scene (l. 3594).
3. The hounds the voice brings count against the game's own cap of five alive at once (game.js `spawnHound`). On the
   rim there are hounds already, so the voice may bring two, not three.
4. "Where is the mooring mast?" no longer puts a mark on Oakhaven's map (js/ledger15.js): the mast is not in the town.
   The answer points north, out of the North Gate, and the mast's mark is the clearing's (js/places97.js).
5. The ladder is outside the North Gate, so it can be reached only after Harrow opens the gate on Lyra's word (the
   main quest's first errand). Hetty's errand can be taken before that and waits.

**The east side of the square** [PROPOSED]: the carters' standing. Cobbles over the pylon's cells; a stone mounting-block
of three worn steps (35.5, 21.5) and a stone water trough (38.5, 21.5) in the two old slots; a hitching rail (37.0,
19.6). One look line each; nothing to use. The greened town has the block and the trough, not the rail (it is built
without the outer wrapper, as before).

## 4. The words

Each line kept its voice; only where changed. French in `tools/i18n/p123-mast.tsv`, merged into locales/story/fr.json.

| Where | Said | Says |
|---|---|---|
| js/game.js, the ladder after the bit snaps | The mast-ladder sways over the square. Not now. | The mast-ladder sways over the quarry rim. Not now. |
| js/game.js, the Greening's journal | ...the shaft, the headframe, the North Gate — and reach the mooring mast on the east side of the square before the oaks close over it. | ...the shaft, the headframe — and reach the mooring mast on the quarry rim before the oaks close over it. |
| js/game.js, the Greening's message | GET OUT. Up the shaft, up the headframe, through the gate, to the mooring mast. | GET OUT. Up the shaft, up the headframe, to the mooring mast on the quarry rim. |
| js/rite43.js jGreening | ...the shaft, the headframe, the North Gate — and reach the mooring mast. | ...the shaft, the headframe — and reach the mooring mast on the quarry rim. |
| js/rite43.js getOut | UP. The service ladder, the headframe, the gate, the mooring mast. | UP. The service ladder, the headframe, the mooring mast. |
| js/rumours.js d_greening | Get to the mooring mast on the east side of the square. | Get to the mooring mast on the quarry rim. |
| js/horizon20.js, Hedge Knoll's sign | ...the Greenhall dome, the mooring mast, the Chapel's tower. | ...the Greenhall dome, the Chapel's tower. Away to the north-east the mooring mast stands over the quarry. |
| js/game.js "Where is the mooring mast?" | (paces east of the square) | "North of here, about 326 paces. Out through the North Gate, and up to the quarry rim. You cannot miss it." (new line) |
| the carters' standing | — | three look lines (new) |

The gate is not on the route any more because the mast is before it: from the headframe the rim is right there.
The automap's hand-lettered "Mast" moved from Oakhaven to the clearing; places97 puts the mooring mast (its anchor mark)
on the clearing; ledger15 has no mark for it inside the town.

## 5. The voices

None of the changed lines had a recording (`js/voice-lines.js`, `tools/voices/dialogue.json`, `voices/script.json` were
searched for each), and none of the new ones is spoken dialogue, so nothing was re-made and nothing was removed.

## 6. Old saves

Saves keep a map's entities and triggers by their place in the list. So the two Oakhaven decos of the old mast keep
their two places (they are the block and the trough), its trigger keeps its slot (inert, `mast_was`), and everything new
on the clearing and the rail in the town comes after every older entity (js/mast123.js is the last script; its
buildAllMaps wrapper is the outermost). Checked against the code before this phase: the base lists of the town, the
greened town and the clearing are the same entity for entity, but for the two slots and the new things at the end (the
scenery props and ground cover that are drawn again on every load moved a little: they are never saved).

The migration (js/mast123.js `migrate`): a save without `flags.p123` (every save made before this phase) that stands
within three cells of the old pylon, in the town before the Greening, with the North Gate open, loads at the foot of
the ladder on the rim. With the gate shut it loads where it was (open cobbles now): Harrow's gate is not opened for
anyone. Every save from now on carries `flags.p123` and is never moved. Four saves made on the old code are kept in
`test/fixtures/p123-oldsaves.json.gz` (at the old ladder with the gate open; the same, gate shut; the greened town where
the mast stood; aboard in Grab the Line) and test/mast123.test.js loads each.

## 7. What is [PROPOSED]

The carters' standing (the mounting-block, the trough, the rail and their three lines); the stone footings and the stone
apron under the legs; the head's platform, rail and cone; the far view's growth with distance (1.8 at most); the ship's
three lanterns (the book gives one in the hold); the young oak's shape and the north leg's bend (the book gives the oak
and the bend, not their drawing). The figures on the ladder that the book sees from the North Gate (Mags and the
children, l. 2527, 2574) are not in the game and were not added: nothing that was not there before.

## 8. The tests taught

| Test | Was | Now |
|---|---|---|
| cargo56 | the ladder found on Oakhaven | on the clearing |
| canon32 (crates) | the one crates deco on Oakhaven | on the clearing |
| canon32 (One Wearer) | the mast trigger on Oakhaven; hounds0 + 3 | on the clearing; hounds0 + 3 up to the game's five-alive cap (the rim has hounds of its own) |
| r1release27 | the mast trigger on Oakhaven | on the clearing |
| smalllife | moored on Oakhaven, 1.5-2.2 from MAST; gone at the Greening; "not moored anywhere else" on the clearing; the ship back after re-entering Oakhaven; the pixel check on Oakhaven | moored on the clearing at SHIP.half under the mast head; gone once the cable is cut (r45 1); not moored in the town; back after re-entering the rim; the pixel check from the North Gate road; "nothing left behind" on every map but the one entered |
| touches71 | the ladder in Oakhaven, three loads | in the clearing |
| eaves78 | the pylon cell (36, 19) at 3.6 is the skyline's top | the cell is ground; no ridge reaches 3.6 and the tower stands over all |
| relief | (36, 19) keeps 3.6 | (36, 19) is open ground |
| ledger15 | every "Where is" place has a town position | the places that are in the town (the mast is not) |

None was skipped or loosened beyond the new place: every count and threshold is as it was.

## 9. Pictures

In /home/claude/army121/M/shots/ and on the sheet screenshots/p123-mast.jpg (the square by day first): the square by
day and night, classic and 3D; inside the North Gate, classic and 3D; the North Gate road, by day and night; at its
foot, by day and night; beside the headframe; the east side of the square after; the young oak in the mast after the
cut; Grab the Line at the North Gate; the drawings themselves (p123_sprites.png). The game's quarry map is the workings
under the headframe, with a stone ceiling, so there is no "from the quarry floor": the nearest is the rim beside the
headframe.

## 10. The suites, on the final code (port 4224, through tools/dev/browser.sh)

mast123 60 of 60 (committed first failing; it crashed at its first runtime check); cargo56 15; canon32 43; r1release27 20;
touches71 24; eaves78 78; relief 2; ledger15 (all passed); greening44 25; rope45 18; rite43 37; ash50 23; r5governor46 19;
horizon20 9; places97 17; night13 13; nerves13 16; thread70 33; guard 2; access 47; spatial-audio 42; logmap 13;
story-i18n 17; voices 14; voice-acting 4; pwa18 89; desktop 73; sprites21 9; travel 2; sidequests 29; max20 9; rumours,
smalllife, kestrel16 exit 0 ("ok" lines). Alone: presets 7, far14 14, cinematic24 6, light21 21, gpu18 20, r3d21 24. All pass.

## 11. Not settled

- From the square the far mast is drawn up to 1.8 times its true size (the Commander's ruling: as the horizon's
  landmarks are drawn); at the North Gate it is within six per cent of the rim's own.
- In the classic view at night the ship's lanterns are a pixel or two from the square; in the 3D view they show.
- The rim's pump (15.0, 5.5) stands just east of the mast's legs; it was not moved.
- The Kestrel is not drawn over the North Gate during Grab the Line (she never was); only her line comes down.
