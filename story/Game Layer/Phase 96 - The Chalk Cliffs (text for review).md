# Phase 96: the Dawning Heights, part four: the Chalk Cliffs (text for review)

*Written 16 Nov 2026 by team B (builder B-BUILD-CLIFFS), under the owner's approval of Phases 89 and 90 (14 Nov) and team B's design of 16 Nov. Code: `js/cliffs96.js`. Test: `test/cliffs96.test.js`. French: `tools/i18n/p96-cliffs.tsv`. Every line is new and [PROPOSED] unless a book or bible is named. Lore evidence: team B's `LORE-cliffs.md`.*

## The book changed the plan

The Chalk Cliffs are two lines of canon, both in Vol II, and no book names them:

- Vol II:93, the entry for the Chalk Cliffs: "Below the cloud deck. Shadow remnants crawl up them nightly. The Vigil rings a bell at dusk and the bell is the only thing that works."
- Vol II:112 (the Heights' hazard table): "Shadow remnant. Up the chalk cliffs at dusk."

What the reading changed:

1. **No cloud deck.** Phase 89:272 and Vol II put the cliffs "below the cloud deck". Book Two never shows a cloud in the Heights: the gulf is "two thousand feet of dark air, and the peaks at the bottom of it pale as teeth under the stars" (BkII 921). The game's text has no cloud. What lies past the edge is drawn as dark air, with white peaks on the horizon.
2. **The peaks have their snow.** BkII 523: "snow on their summits even at the end of Ashfall". The game shows Harvestmonth 419, before the Restoration takes the snow off the peaks below the gulf (BkII 2531, 2717, in Ashfall). The horizon peaks are drawn snow-capped.
3. **"Chalk" is the book's simile for the range** ("like a wall of chalk", BkII 523), not a rock. The cliff is drawn as off-white, pale grey rock with bedding lines: white, but not paper.
4. **A shadow remnant has no bestiary entry.** Canon gives it a name, that it crawls up these cliffs, that it comes "nightly" and "at dusk", and that the Vigil's bell "is the only thing that works". It gives no look, no harm and no fear. Everything else about it here is the least the place needs, and is [PROPOSED] (see below). By the Commander's ruling: weapons and songs do nothing to it; only the bell holds it.
5. **No Bleach here.** The cliffs stand on the range below Sun-Peak Vigil, away from the city and outside the mile of wrong light. Daylight is ordinary.
6. **Hours.** The game text never names the hour of dusk. Vol VII gives only Frostmonth's ("the sixth hour"). The engine's sun sets at tod 0.75, and the bell starts there [PROPOSED].

## What was built

- **The map `p96_cliffs`** (outdoor, 36 by 150 cells). The yard is on the map's south edge, against the Vigil's north wall, and the face goes down to the north (the map agrees with the ground: you leave the Vigil northward, so the Vigil lies south of you), 0.11 a cell, from 0 at the top to about -16 at the foot. West of the path is the cliff rock, a wall four high. East of the path is the drop: you cannot step into it.
- **The way in and out: the postern** at (18, 148), the south wall of the postern yard. A finger-post stands within five cells of it, and another by the Vigil's postern. It is a door into the Vigil, into the yard under its bell tower, landing at (34.5, 2.6), facing south. If the Vigil's map is not built, the door is barred ("Barred."). The Vigil's own postern into this map is set by `js/vigil96.js`. The player arrives at (18.5, 146.5), facing north, down the face.
- **The postern yard** (x 10 to 26, y 140 to 147), trodden snow, with **the postern lamp** at (13.5, 143.5) (the Souls rules, group `l`, one lamp, no keeper).
- **The cliff path**, two cells wide, in four stretches of switchbacks. The first ledge (y 103 to 109) has a rest-stone. The second ledge (y 65 to 71) has the overhang, a dry hollow under leaning rock. The third ledge (y 29 to 35) has an iron ring in the rock with a hand-rope going down. **The foot** (y 2 to 11) has the cairn of named stones. Each ledge and the foot has a one-time line.
- **The climb, measured:** 177 cells from the cairn to the postern; 179 units along the path's centre line; **53.4 seconds** at a new character's walking speed (3.35 a second).
- **The cairn** (once): twenty-five sovereigns and a tonic, under the top stone. After that: "The names. Nothing else."
- **The dusk bell, heard from above.** It is read from `VIGIL96.bell(tod)`, the one contract with the Vigil, with this module's own copy (`localBell`) behind a typeof guard. Twelve strokes, one every 1/360 of a day (six real seconds), from tod 0.75. Each stroke rings (`Audio_.sfx.bell`) with "The dusk bell. N of twelve." There are no callbacks between the modules: each finds its own strokes from the tod.
- **The shadow remnants.** By day there are none. At the first stroke eight lie at the foot, at fixed places along its north edge, over the drop. While the bell rings they stir a little up the foot (0.3 a second, never more than 1.8), and **each stroke they let go** and are back on their foot cells ("Below, the shadows let go of the rock."). When the bell stops it is dark, and they come up the path toward you at 1.1 a second. They stop at the lip of the yard: the yard is safe. Within 0.9 of you, each one does cold harm, 4 to 7, once a second, through the game's own hurt path ("It is cold where it holds you."). If you leave and come back in the dark, they are where the hour puts them (worked out from the tod, never chance). At dawn they are gone.
- **Nothing else works** (Vol II:93, "the only thing that works"). A blow goes through ("The blow goes into it and out of the rock behind. Nothing."); its health is set back each moment; nothing can put it down (the game's kill is refused for it); a song gets "It does not listen."; it gives no xp.
- **The top before dark** (Phase 90:131). Stand at the foot that dusk (in the afternoon or while the bell rings), then reach the yard before the last stroke: 150 xp and "Up before the last stroke.", once. On the face at the last stroke: "The last stroke. Dark.", counted.
- **What the remnants are, in code:** an `ENEMIES` entry (`p96c_remnant`, five frames, a silent voice) that the engine keeps still (speed 0, reach 0, always "passive", not solid). This module moves them. They are built hidden into the map, eight of them, and shown by the bell's phase.
- **The peaks on the horizon:** five snow-capped ridges (`LANDMARKS.p96_cliffs`), all round the east and south.

Flags (small ints): `p96b_foot` (the cairn taken), `p96b_top` (up before the last stroke, rewarded), `p96b_dark` (caught on the face at dark, to 99), `p96b_cseen` (bits: the once lines).

Test: `test/cliffs96.test.js`, 20 checks, all passing. Pictures (`tools/dev/out/`): `c96_yard`, `c96_path`, `c96_east`, `c96_ledge1`, `c96_ledge2`, `c96_ledge3`, `c96_foot`, `c96_foot_ring` (tod 0.752, the bell ringing, the remnants held at the foot), `c96_dark` (tod 0.795, dark, the remnants on the path below the third ledge).

## For the owner

1. **The remnant's look** [PROPOSED]: a long, flat, man-length dark shadow lying on the rock and the path, soft at the rim. No eyes, no light, no figure. *Recommend: keep.*
2. **The remnant's harm** [PROPOSED]: cold, 4 to 7, once a second each, within arm's reach. Canon gives it no harm. *Recommend: keep, and tune after you have walked it.*
3. **What the bell does** [PROPOSED]: while it rings they stir at the foot and let go at every stroke. When it stops, they climb. Canon says only "the bell is the only thing that works". *Recommend: keep.*
4. **The yard is safe** [PROPOSED]: they climb to the lip of the postern yard and no further. *Recommend: keep.*
5. **The numbers** [PROPOSED]: eight remnants; the bell's twelve strokes, six seconds apart (72 seconds in all); a climb of about 53 seconds; 1.1 a second climbing; 150 xp for the top before dark. *Recommend: keep.*
6. **The cairn of names, and what is under its top stone** (25 sovereigns and a tonic) [PROPOSED]. Who is named is not said. *Recommend: keep.*
7. **The three ledges' things** [PROPOSED]: the rest-stone, the overhang, the iron ring and hand-rope. *Recommend: keep.*
8. **The name "Shadow Remnant"** is capitalised as a foe's name, as the game's other foes are. The design's "a shadow remnant" would have read "The a shadow remnant" in the game's own lines. *Recommend: keep.*

## The new lines

| English | French |
|---|---|
| The Chalk Cliffs (canon: Vol II:93) | Les Falaises de craie |
| The postern, back into Sun-Peak Vigil [PROPOSED] | La poterne, pour rentrer à la Veille du Pic-Soleil |
| Barred. [PROPOSED] | Barrée. |
| A yard of trodden snow outside the Vigil's postern. Below it a path goes down the white face, ledge under ledge. [PROPOSED] | Une cour de neige tassée devant la poterne de la Veille. En dessous, un sentier descend la paroi blanche, corniche après corniche. |
| The first ledge. [PROPOSED] | La première corniche. |
| The second ledge. [PROPOSED] | La deuxième corniche. |
| The third ledge. [PROPOSED] | La troisième corniche. |
| The foot of the path. Past its edge the rock falls away again. [PROPOSED] | Le pied du sentier. Passé le bord, la roche plonge de nouveau. |
| A flat stone at the back of the ledge, worn smooth on top by people sitting. [PROPOSED] | Une pierre plate au fond de la corniche, polie sur le dessus par les gens qui s'y sont assis. |
| The rock leans out over the back of the ledge. Under it is a dry hollow, out of the wind. [PROPOSED] | La roche avance au-dessus du fond de la corniche. Dessous, un creux sec, à l'abri du vent. |
| An iron ring set deep in the rock, with a hand-rope tied to it going down the next stretch. [PROPOSED] | Un anneau de fer scellé profond dans la roche, avec une corde de main nouée dessus qui descend le passage suivant. |
| A cairn of flat stones at the foot of the path. A name is cut in each stone, in many hands. [PROPOSED] | Un cairn de pierres plates au pied du sentier. Un nom est gravé dans chaque pierre, de bien des mains. |
| Under the top stone, wrapped in oilcloth: twenty-five sovereigns and a tonic. You take them. [PROPOSED] | Sous la pierre du sommet, dans une toile cirée : vingt-cinq souverains et un tonique. Vous les prenez. |
| The names. Nothing else. [PROPOSED] | Les noms. Rien d'autre. |
| The postern lamp [PROPOSED] | La lampe de la poterne |
| A lamp on an iron post by the postern, unlit. Stand by it to light it. [PROPOSED] | Une lampe sur un poteau de fer près de la poterne, éteinte. Restez près d'elle pour l'allumer. |
| The lamp by the postern, burning. Use it to rest. [PROPOSED] | La lampe près de la poterne, allumée. Servez-vous-en pour vous reposer. |
| The dusk bell. {0} of twelve. [PROPOSED] | La cloche du crépuscule. {0} sur douze. |
| At the foot, shadows lie on the rock with nothing to cast them. [PROPOSED] | Au pied, des ombres sont couchées sur la roche, sans rien pour les projeter. |
| Below, the shadows let go of the rock. [PROPOSED] | En bas, les ombres lâchent la roche. |
| The last stroke. Dark. [PROPOSED] | Le dernier coup. La nuit. |
| Up before the last stroke. [PROPOSED] | En haut avant le dernier coup. |
| Shadow Remnant (canon: the name: Vol II:93, 112; capitalised as a foe's name [PROPOSED]) | Reste d'ombre |
| A shadow with nothing to cast it. It goes up the rock the way a shadow goes when the sun moves. [PROPOSED] | Une ombre que rien ne projette. Elle monte la roche comme monte une ombre quand le soleil tourne. |
| It is cold where it holds you. [PROPOSED] | Il fait froid là où elle vous tient. |
| The blow goes into it and out of the rock behind. Nothing. [PROPOSED] | Le coup entre en elle et ressort de la roche derrière. Rien. |
| It does not listen. [PROPOSED] | Elle n'écoute pas. |
| A finger-post. SUN-PEAK VIGIL, up, by the postern. [PROPOSED] | Un poteau indicateur. VEILLE DU PIC-SOLEIL, en haut, par la poterne. |
| A finger-post. THE CHALK CLIFFS, down, by the postern. Under it, smaller: be up before the last stroke. [PROPOSED] | Un poteau indicateur. LES FALAISES DE CRAIE, en bas, par la poterne. En dessous, plus petit : soyez en haut avant le dernier coup. |
