# Phase 113c: the Fold's stones (built)

23 Nov 2026. The faith of the stars, approved by the owner on 22 Nov at 6:14 pm ("excellent I approve"), put into the game.
Every line the player reads is the approved record's, word for word: `story/Game Layer/Phase 113c - The Fold, the faith of
the stars (for review).md` (called THE RECORD below), sections 2 to 7. Code: `js/fold113.js`. Test: `test/fold113.test.js`.
French: `tools/i18n/p113-fold.tsv`.

## 1. The sky's table (`window.STARLORE113`)

Built once in code, the same every time, with no chance in it. The sky does not turn (ruled 22 Nov), so every fixed
figure has one place. Bearings below are the game's angles (0 east, growing toward the south; north is -90) and heights
above the horizon, in degrees.

| Figure | Where | Shape as built |
| --- | --- | --- |
| The Badger | lamp at the Chord's first note-star (162, 10) | lamp at the sett's mouth, a blunt head, a long low back of four, two feet; 8 stars |
| The Salamander | lamp at the second (173.6, 29.7) | a bent line of six, the Ember at the bend |
| The Tortoise | lamp at the third (-169.1, 47.9) | a ring of five round the lamp |
| The Heron | lamp at the fourth (-136.9, 61.1) | the lamp is the eye; a neck of four, a body, one leg |
| The Cockerel | lamp at the fifth (-89.3, 61.1) | a comb of three, the breast (the lamp), a tail of three thrown up |
| The Hare | lamp at the sixth (-57.1, 47.9) | the lamp at the tail, a stretched back, two ears; turned to run along the Chord |
| The Magpie | lamp at the seventh (-39.9, 29.7) | the lamp in the beak, a head, a wing, a tail |
| The Owl | lamp at the eighth (-28.2, 10.0) | two eyes three degrees apart, no lines |
| The Sparrow | four to six degrees below the Badger's lamp, toward the horizon (about 165, 6) | three small faint stars |
| The Open Door | the sun's road at t 0.08 | four stars, the frame's posts and lintel drawn, nothing in it |
| The Cloister Walk | t 0.22 | five low arches (six feet, five heads), one bright star in the third |
| The Hound's Step | t 0.36 | four prints in a line, a fifth off to one side |
| The Floating Light | t 0.50 (it stands 69 degrees up) | one bright star over a small ring of six faint ones |
| The Road-Song | t 0.47 to 0.81, a little above the road | eleven faint stars in a wandering line |
| The Mourner's Hour | t 0.78 | a bowed figure of six, and one alone (the candle) |
| The Broken Fifth | t 0.92 | five places in a line, four stars, the fourth place dark; the line runs across the gap |

- Each Keeper's lamp is the note-star the sky already draws (js/deepsky113.js `NOTES`): the same place and the same hue
  exactly. Its brightness is set at 0.6 so it stays the brightest of its figure (the note-star alone is 0.34 and the
  design asks for the figure's other stars at 0.25 to 0.55).
- The loose five on the sun's road, moved by the game's day count only: Yow (white, the brightest point after the moon)
  swings to 45 degrees of road from the setting point and then from the rising point, over 224 days; the Lamb (small,
  white) to 25 degrees either side of the rising point over 116 days, so it is under the horizon half the time; Tup
  (red) round the road in 400 days; Old Wether (yellow) in 4,320 days (twelve years of 360 days); the Dog (faint blue) four
  degrees behind whichever of the other four is nearest to its own slow round. Where a loose one is under the horizon its
  stone says it is down.
- The three far folds are the sky's own three galaxies (js/deepsky113.js `GALAXIES`); the sky module had no ids for them,
  so the table carries them as frames (`frame: true`): four points round each galaxy that only set the zoom, laid into
  nothing and drawn by nothing. `DEEPSKY113.dirOf('g_farfold' | 'g_wheel' | 'g_fleeces')` is the galaxy's middle.
- The Lantern is the moon where both renderers draw it: opposite the sun, its height as js/light21.js has it, its phase
  js/calendar11.js's. By day it is down.

## 2. The stones: what stands where

Every stone carries the Fold's mark: cup-marks pecked in its face in the pattern of its figure, joined by a scratched line
(drawn into each stone's own sprite). Every sighting has a knee-high peg with a cup in its top; using the peg (or the
stone) walks you onto the peg and turns you, over half a second, to face the figure (yaw, and pitch as far as the view in
use can look), and then opens the view.

**Where the line of sight passes.** A needle's eye is cut where the line from your eye at the peg to the figure's
brightest star passes through the stone, and a notch-stone's notch the same; so in both views the brightest star sits in
the eye when the turn ends (tested in the 3D view for all seven, and in the classic view for the two it can look high
enough for). For a high figure that line climbs steeply, so the peg stands nearer than the design's 1.2 cells (never
nearer than 0.5) and the stone is taller: the needle-stones run from 2.0 to 4.9 units high (a person is about one).

| Map | Stone (cell) | Peg (cell) | Sights (bearing, height) | Label |
| --- | --- | --- | --- | --- |
| `p47_stones` | the eight Weekstones (Phase 47, untouched) | 1.2 behind each, along its Keeper's bearing: (19.64, 9.03), (23.65, 10.91), (25.28, 15.23), (23.34, 19.78), (18.49, 21.80), (13.89, 19.97), (11.98, 15.77), (13.48, 11.61) | the Keeper of its day | `Rootday's stone, and a cup-marked peg in the turf behind it` (one line a day) |
| `p47_stones` | a low round stone (11.44, 16.86), outside the ring toward the Sparrow; you stand at it | | the Sparrow (165, 6) | `A small stone, set apart, where a traveller would stand` |
| `clearing` | needle (7.50, 30.50) | (6.33, 30.23) | the Open Door (13, 13) | `A needle-stone` |
| `p83_stride` | needle (39.00, 21.50), moved 0.5 | (38.50, 21.09) | the Cloister Walk (40, 29) | |
| `p83_hollows` | needle (53.18, 142.21), moved 1.5 | (52.97, 141.76) | the Hound's Step (65, 47) | |
| `p79_road_e` | needle (84.50, 27.50) | (84.50, 27.00) | the Floating Light (90, 69) | |
| `p79_road_w` | needle (84.50, 42.50) | (84.71, 42.05) | the Road-Song (115, 50) | |
| `p79_greenroad` | needle (42.50, 48.50) | (43.13, 48.02) | the Mourner's Hour (143, 29) | |
| `p83_poundstair` | needle (24.50, 15.50) | (25.66, 15.21) | the Broken Fifth (166, 11) | |
| `p83_wethers` | the five great wethers `p83_wethm1..5` | a red-raddled peg 1.2 north of each | the loose five in the call's order (below) | `A raddled wether, and a peg at its foot` |
| `p22_combe` | Ewe Barrow's sarsen door (6.6, 50.4) | (7.90, 50.40) | the Lantern, wherever it stands | `Ewe Barrow's door-stone, and a peg in the turf` |
| `p20_downs` | notch (22.82, 13.38), moved 2.5 | the short stone (23.11, 12.21) | the Far Fold (104, 20) | `A notch-stone` |
| `p79_greenroad` | notch (130.31, 40.71), moved 2.5 | (129.51, 39.82) | the Wheel (48, 22) | |
| `p22_combe` | notch (9.50, 18.50) | (9.32, 17.31) | the Two Fleeces (82, 12) | |
| `p100_wall` | canted needle (315.5, 107.5), the open cell of the mooring-yard farthest from the stair, the mast, the doors and every person | (314.44, 108.07) | the Owl, never seen | `A canted needle-stone` |
| `p96_cliffs` | needle (24.50, 65.50) | (24.49, 66.70) | the Cockerel, never seen | `A needle-stone` |

- **Moved, and why.** The design's rule that no stone stands within three cells of a worn track's middle moved four: the
  Stride's needle 0.5 (the road was 2.8 cells off), the Hollows' 1.5 (2.2), the Downs' notch 2.5 (the sheep-track 1 cell
  off) and the Leap's notch 2.5 (the road 1 cell off). Each went to the nearest spot that keeps every rule (open ground,
  no tree, wall or person crowding it, the peg on open ground too, the line of sight open for twelve cells). Nothing else
  moved.
- **The Grey Wethers.** The call is "three, one, four, two, five": order the loose five as they stand along the sun's road
  from its rising, tonight; `wethm1` sights the third of them, `wethm2` the first, `wethm3` the fourth, `wethm4` the second,
  `wethm5` the fifth. The order changes as they move, so which wether rings which star changes with the season.
- **Old Marrable** sits at (14.23, 9.98), a cell outside the fallen Nullday stone, facing it.

## 3. The view

A panel in the game's event style: the figure's name; the zoomed sky (`DEEPSKY113.drawChart`, the whole panel's width, its
lines coming in over a second, at once with "Reduce motion"); under it the head line, the story, and for a sign that is
the traveller's own (`p11c_sign`) `This is the door you came in by.` The chart keeps its size and the words under it
scroll, so a long story (or the French) never shrinks the type. `Leave it.` or Escape closes it.

- Keepers: the record's italic line (`Rootday. His lamp is the Sett-Lamp, green.` and so on) and the paragraph.
- The Sparrow: `Off the Chord. Three small stars, and you have to be told.` and her paragraph.
- Signs: `One of the seven Signs, on the sun's road.` and the paragraph.
- The loose five: `One of the loose five.` and the record's line for each (its name is the panel's title).
- The far folds: `One of the far folds.`, the paragraph, and the lamp-teller's line about all three (record, section 6).
- The Lantern: `The Lantern.`, tonight's phase in the game's own words (js/calendar11.js, "waxing gibbous" and so on), the
  paragraph; the picture is the moon itself, close, in that phase, drawn in code.
- By day: `There is only sky in it by day. ...` over a drawing of the stone's face (the cup-marks in the figure's
  pattern, the scratched line), then the name, head line and story. At night under cloud, haze or too much light:
  `Too much light here tonight. The lamps are there. You cannot have them.` and the face, seen by night's light. A loose
  one or the Lantern under the horizon: `It is down tonight. The stone is patient.` and the face.
- The two blind stones show only their record line, over a drawing of the stone's eye: black at the Rift (the Owl's two
  cups over it, and the new cup under them rubbed at); pale and sunlit in the Heights.
- With "Deep night sky" off the view still draws the sky (the chart reads the sky's map whether the switch is on or not).

## 4. Old Marrable

At the Weekstones from 20:00 (the game's "night") through the dead hour (to 05:00); not there by day or at dawn. A
seated old woman in a drover's coat with a shawl over it and a stick across her knees (her sprite is drawn in code). She
sells nothing. Her greetings, her five sayings and the line about the signs are the record's; her subjects are buttons
(js/owntopics96.js); "The Church" is the game's shared subject, so her saying is its answer there. The all-eight line comes
once, after all eight Keepers have been seen under a clear sky; the Rift line once, after the Rift's blind stone. Her
voice is her own (js/voices.js profile: pitch 176, breathy). Nobody can strike her: the standing-stones are not ground
the watch keeps, she has no faction and no shop. Her dialogue portrait is the game's townswoman's (there is no old woman's
portrait in the game).

## 5. Flags and the logbook

`p113f_seen` (25 bits: the Keepers 0 to 7, the Sparrow 8, the Signs 9 to 15, the loose five 16 to 20, the far folds 21 to 23,
the Lantern 24; set only when the sky itself is shown), `p113f_blind` (1 the Rift's, 2 the Heights'), `p113f_marr` (1 met,
2 the all-eight line said, 4 the Rift line said). A value out of range reads as nothing. Logbook: `You looked through a
stone of the Fold, and saw what it was set to.` the first time; `Every lamp the stones are set to, seen and said good night
to.` when all twenty-five are seen. All of it survives a save and a load (tested).

## 6. Switches

None new. The stones, the pegs and Marrable are part of the world (the design, section 6). The view's sky obeys nothing
but the sky's map; the in-game sky's figure stars come and go with "Deep night sky" as the sky module has them.

## 7. What is canon, and what was decided here

Canon (THE RECORD, approved): the faith, every line, every figure's shape in words, where each stone stands, the call,
Marrable and her lines. The Weekstones are Phase 47's.

Decided here, within the design: the exact star places inside each shape; the Owl's eyes three degrees apart (the
design's least); the Road-Song lifted three degrees off the road so it does not sit on its neighbours; the loose five's
periods where the design gave none (Yow 224 days, the Lamb 116, the Dog's own round 700) and their starting places; the
peg distances and stone heights above; Marrable's place, sprite, voice and hours; the red raddle on the wethers' pegs; the
pictures of the faces, the moon and the blind eyes.

Not used as written: the design's label for the Heights' stone named the cliff walk with one of the four words the Rift's
secret keeps; it is labelled `A needle-stone`, like the others. The design called this record "(in the game)"; the brief
named it "(built)".

For the owner: the Dawning Heights' maps do have dark nights in the game (the Chalk Cliffs ring a dusk bell and go dark, and
the remnants come up by night). The Heights' line is unchanged, as asked.

## 8. Tests

`test/fold113.test.js` (43 checks): the table built the same twice with no chance; every Keeper's lamp on its note-star;
the Sparrow, the Owl, the Signs on the road and their sizes and shapes; the far folds on the galaxies; the loose five's
rules over 1,500 days; all 27 sightings placed with no chance, idempotent, on open ground, off the tracks, in the map's
base, the line of sight open; the Weekstone pegs and the ring untouched; every peg turns the camera within a degree and
opens its view with its name, head line, story and chart; the call's order; the day face, the cloud line, a loose one
down, the Lantern, the sky with the switch off; the logbook lines once each; Escape and `Leave it.`; the 3D view (and the
classic where it can look so high) shows each needle's brightest star in its eye with stone either side; Marrable's hours,
place, voice, subjects, once-lines and the save; French for every line, merged; the Rift's four words in none of this
phase's files.

## 9. Pictures

In `/home/claude/army113/F/shots/`: the views at 640 by 400 (`view-badger`, `view-heron`, `view-owl`, `view-sparrow`,
`view-opendoor`, `view-brokenfifth`, `view-yow`, `view-farfold`, `view-lantern`, `view-face-day`, `view-cloud`,
`view-blind-rift`, `view-blind-heights`, and `view-hare-fr` in French) and at 2x (`2x-view-*`); the stones in the 3D view
(`3d-world-needle-night`, `3d-world-needle-day`, `3d-world-cloister-night`, `3d-world-floatinglight-night`,
`3d-world-notch-night`, `3d-world-weekstones-night`, `3d-world-marrable-close`, `3d-world-through-weekstone`,
`3d-world-through-cloister`, `3d-through-fifth-3d`, `3d-world-wethers-pegs`, `3d-world-rift-stone`,
`3d-world-heights-stone`) and the classic (`classic-world-needle-night`, `classic-world-cloister-night`,
`classic-world-weekstones-night`); Marrable's dialogue (`marrable-talk`).
