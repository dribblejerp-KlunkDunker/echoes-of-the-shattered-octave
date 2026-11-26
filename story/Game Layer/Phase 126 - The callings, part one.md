# Phase 126: the callings, part one (record)

25 November 2026. Built by one builder from `story/Game Layer/Phase 126 - The callings, part one (design, for the builder).md`, under the Commander's two rulings on the design's questions and the owner's ruling on cargo night (6b below). Branch `p126-callings`.

**Abbreviations.** **MS** = `story/Books/Book One - The Silenced Province/Book One - The Silenced Province (full manuscript).md`, by line. **SB** = `story/World Bibles/Series Bible (canon).md`, by line. **[PROPOSED]** marks the game's own inventions.

## What was built

One mechanism, `js/callings126.js` (`window.CALLINGS126`), and three callings registered in its table. Phase 127 registers the other three with `CALLINGS126.register(id, { radius, targets, draw, acts, tick, lines })`; check 1 registers a dummy fourth calling and sees the sight draw it.

### The shared mechanism [PROPOSED]

- **The sight.** What your trade notices, drawn over the world on the HUD layer after the frame (`Engine.ctx`: the same canvas in the classic view and under the 3D view's HUD layer). Marks are anchored to each thing's on-screen rect (`e._screen`, which both renderers fill), or for a world point go through `toView()` (`R3D.project` under the 3D view; in the classic view the raycaster's own projection, from a read-only post hook that copies the camera and draws nothing). Hidden behind walls by three depth probes (`Engine.depthAt`). All glyphs are code-drawn in logical pixels (dots, rings, the press's fork, lenses, hum threads, lines with strain or fray ticks, plumbs, dithered floor patches, tanks); phases come from hashes, never random numbers.
- **When it shows (the Commander's ruling 1).** The Options row "Your calling's sight" (`gfx-callingSight126`) has three settings: *hidden* / *when you stand still* (the default) / *always*. Standing still: it fades in after 0.55 s still (speed under 0.35; a murmur is not moving) over 0.4 s, and fades out over 0.2 s when you move. `GFX.callingSight` is the preset switch (in `GFX.FX`, `PRESETS.keep`, and `LOW_OFF`): off in Original and Low, on in Medium and above. Off, nothing in the module touches the canvas (check 3: frame hashes equal a run with the drawing stubbed out, in both views). Suppressed outside play, in a hero's boots, in photo mode and in a co-op guest's game.
- **The act.** `interact` is wrapped: the picked thing is offered to your calling's acts first, each a small card with a way back. Key E, the pad's A and the touch Use button all reach `interact` (`js/game.js` ll. 2139, 2224; `js/upgrades.js` l. 1708). The act works with the sight hidden and in every preset; with it hidden, the Glass-Hand gets a one-time "E: Take it by the bell" the first time on a map it aims at a bell it could take.
- **Flags** (validated on every load; anything not a small integer becomes 0): `p126_seen`, `p126_did` (bits by calling), `p126_bells`, `p126_vosk`, `p126_slips`. Not saved: the hand's ringing, the fade, the targets, a slip in progress. No migration: an old save starts at zeros (check 20 loads the p123 fixture save: nothing changes but the five flags at 0, and no extra random numbers are drawn).

### What each calling sees and does

**Glass-Hand (`blade`).**
- *Sees* (within 6 cells): the pale lilac core through every Legionnaire's bronze ("a sphere of pale lilac glass the size of an apple", MS 1875; "a low overlapping murmur", MS 1313), with faint rings round it; the brass hand-press at a proctor's belt, its ampoule glinting, quicker inside about 3 cells ("brass, about the size of a hand, shaped like a squat two-tined fork with a glass ampoule seated between the tines", MS 4335); the Factor's green lenses ("Aether-Glass, pale green and faintly luminous", MS 704), brighter while your hand rings.
- *Does:* **Take it by the bell** on a Legionnaire at reach (not Tamsin Reed, not a staged figure, not a boss). The card: the drink (MS 1855-1857, in the second person and present tense), then the voice inside, clear (the game's own `coreMurmur`, after MS 654). **Put your fist through the grille** (kills it through `killEnemy`; its name in the ledger as for any core kill; "something smooth and cold the size of an apple cracks under your knuckles", after MS 1875) or **Let go** (it stands stunned for 3 s). Either way the tideline climbs 3, never past 99 (`js/tamsin52.js`'s number and cap), and the noise is held where it was. On a proctor the press comes off his belt first: the arm locks for 8 s (MS 4335-4345; SB 160). Locked, E says the arm is locked. At Tamsin Reed, Depot Three's own card opens.
- *Heard in turn* [PROPOSED]: for 60 s afterward the hand rings, low and full (MS 1855: "afterward the arm rang low and full"). A Legionnaire within earshot (7) with a clear line logs it for the Factor (`js/audit54.js` `BITS.hand = 128`); her next morning walk reads it back ("A wrapped hand, laid flat on one of my bells…") and her store goes up a step. Vosk in front of you while it rings: once a game, her lenses rest on your sleeve "a moment longer than is comfortable" (MS 765, 712).
- *First landing:* the quarry's Legionnaires and Vosk's walk next morning.

**Cantor.**
- *Sees* (within 9): who is humming and how true. A thread rises from each mouth: its wobble is how untrue the note is, its height is pitch, and a person's hum breaks for breath every 4 to 7 s (hashed); a reed does not. The night-hummers at the three crossings (MS 412), Old Tam short and true ("could not reach any note above the middle of the stave", MS 1989), Bettany wide ("a voice like a saw in a knot … badly", MS 3956), every lit hush-lamp's silver reed-whistle (MS 412; a dark lamp has none), the Conservatory's youngest student wavering and stopping until her lesson is found, Lyra with no voice only a breath puff ("only air in the shape of the note", MS 977), the Church's choir on the road as one white-gold line through the singers' mouths that never breaks (MS 2263), and the Pure Note over Oakhaven as a flat band across the sky at 25°, drawn only where the view shows sky ("settled over Oakhaven like a lid", MS 2323). The three colours are [PROPOSED]: the books give no colour to a sound.
- *Does:* (1) **The hum under the Narrow.** A Cantor's murmur holds the noise at 1.7: above the Hush's 1.5, below everything that listens. A Cantor can stand still and listen in the quarry or the Root-vault without the Hush; no other calling can. Not under a listening horn: on the cutter at the ten heartbeats (`js/cutter68.js` stage 4) and on an air93 flight with a live courier-cutter the murmur is the ordinary one ("a man on that horn could hear a cough on a deck"). From the game's own Cantor history ("how to hold a note under your breath where the hounds cannot hear it", `js/data.js`). (2) **Hum the tending note into their hands**: E on a hurt companion, nothing hunting you within 10: 8 voice, noise +0.9, mends 14 (the Tending Note's numbers); short of voice, "You have nothing left to hum with." (after MS 977, 1037). The card also offers "Talk instead" and "Step back", so a Cantor loses no talk.
- *First landing:* **Hob Wendle's step** (Rootday). Walking beside Lyra or with the Grafters, with 8 voice or more, the Cantor has one more choice: "Hum the Root note into his hands, low". It costs 8 voice; the book's end follows unchanged ("He'll walk."). The line after it ends "Every mending borrows." (MS 1039; the note "for wounds that needed closing", MS 364). At Orla Hale's chair the Cantor reads one line and does nothing: "It is not you Mother Hale is asking." (after MS 1051).

**Corsair.**
- *Sees* (within 10): loads and lines. The Kestrel at her mast: the mooring line at the mast head with strain ticks (bar-taut), a 3-bar plumb under her keel (2 once cargo night has put the long gun over, `p56` 2), and her tanks marked where her sprite carries them, one with a sour flicker on odd game days [PROPOSED] (MS 1321, 674). The first time: "She flies no colours, she is riding heavy…" (after MS 674). Scaffolds and chandeliers: their lashings or chain with fray ticks, and the floor patch where each will land (under a chandelier; for a scaffold on the side away from you, as `js/rigging12.js` `knockScaff` falls). On an air93 deck: the grapnel chains up out of view, fray ticks on the one bitten deepest; knock-rings on an unlashed hold; a plumb for each thing that can go over (salvage, water, spares); the four tanks at the cradle, sound, sour or weeping.
- *Does:* (1) **Slip it by hand** (air93): the first time E is used on a grapnel chain in a flight, a card offers "Cut it" (the old three loud blows) or "Slip it by hand", and the choice holds for the flight. A slip is 5 s standing at the chain; walking off lets the hook bite again. Done, the chain goes as the axe's last blow takes it, but the noise spike is +0.1 once, where each axe blow is +0.6. Never offered on the cutter's own line (`js/cutter68.js` stage 6 uses its own `c68_line`). (2) **Hand-cant to Mags** on cargo night (MS 1327, 5588): in any round of the stall, once a night, "Sign it to Mags, behind his back" counts as a good round without using a topic.
- *First landing:* cargo night (Part One).

**Every other calling loses nothing.** A traveller of another calling sees and plays exactly what they did before: checks 5 (no cores for the Cantor or the Corsair), 9 (the Cantor's E on a Legionnaire gives the old murmur line), 13 (Hob's list deep-equals the old one for the Corsair and for a Cantor short of voice), 14 (Orla's card byte for byte), 15 (no tending for the Glass-Hand), 18 (three choices a round for the Glass-Hand), 19 (a Glass-Hand at a chain swings the axe). Every landing stays passable without the calling.

### The Arbiter (part 6)

`js/pumps58.js` `voiceGlass` had the Arbiter speak in the glassed traveller's own arm. The party line is for "two pieces cut from the same Spire" (SB 160), and Phase 125 ruled that the traveller's glass is raw seam glass. The line now reads [PROPOSED]: "Halfway down the archive steps your arm goes cold to the shoulder, and goes on ringing to itself. It is not your glass anything is speaking through. Ahead of you Kaelen has stopped with his glass hand flat on the wall, and gone grey. When it is over he tells you what it said, word for word, in a voice that is not quite his." Everyone else's line is unchanged (check 21).

## 6b. Cargo night: the traveller no longer says Vane's line (the owner's ruling, 25 Nov: "it may go")

The book (MS 2808-2814): Pim says "You should tell her … Annet. She'd like to know." Then "Captain Vane of the *Drift-Kestrel* … got down on the boards of his own hold in the lantern-light, and put his mouth close to the pine of the third crate, and said: 'Annet. You're going home.'" (The ruling's message gave the first line to Kaelen; at MS 2808 it is Pim's.)

- **Removed:** the choice "Say it yourself" and its line ("Annet," you say, to the wood…) from `js/cargo56.js`. The card has one choice, "Let him say it", and Vane says it.
- **What outcome 2 gave:** nothing outcome 1 did not. Both set `p56 = 2`, `p56_gun = 1`, gave the long gun's lock, wrote the same journal line and gave the same 25 xp. Only `p56_say` (2 against 1) and the line differed, and nothing in the game reads `p56_say`.
- **Old saves:** a save with `p56_say = 2` loads as 1 (`js/cargo56.js` restoreGame); nobody is stranded or loses anything (check 26).
- `js/audit54.js`'s "Say it aloud" is a different choice (speaking near a bell, against writing on the slate) and is unchanged.
- The Corsair's hand-cant and this sit together: check 26 plays cargo night as Corsair, signs to Mags in the stall, and Vane still says the line at the crate.

## Found about the design (the code)

- **Hob's choices (§4.2, check 13).** The design counted "six choices with C6 last" and "the old five". `HOB_CHOICES` has one or two choices for each way (five in all across the three ways): the Cantor gets the old choices of the way she is walking, and the hum last. The check follows the code.
- **The murmur's own noise (§4.2, check 12).** "adds 0.3 noise" and "noise ≤ 1.75" cannot both hold: a cast at 1.65 plus 0.3 is 1.95. The under-murmur adds only what lifts the noise to its own 1.7 (at most 0.3), so it never goes past 1.75.
- **The fade's times (§3.2, check 4).** 0.6 s still plus 0.4 s fade is 1.0 s after the speed falls under 0.35, and the walk takes about 0.1 s to slow: over the check's 1.1 s. The wait is 0.55 s, and the fade-out 0.2 s (0.25 + the speed's rise went past 0.3).
- **Lamps.** Which hush-lamps are lit is a pure function of the hour (`js/narrow28.js` relights them inside every `Engine.render`): the dark lamp of check 11 is one the lamplighter has not reached yet on his round (17:36 to 19:00). At 20:00 every lamp in the town is lit, so the night picture has no dark lamp.
- **The 3D view's depth.** Under R3D a thing's billboard sits a little nearer than its rect's depth (measured 0.12-0.13 for a Legionnaire, 0.22 for air93's tank-cradle), and the read-back is a frame late and waits on the GPU. The probes allow 0.1 + 0.4 × the thing's radius there (0.08 in the classic view). Check 5b tests a bell behind a wall in the 3D view with real pauses between frames.
- **The Kestrel's mooring line** (`js/smalllife.js` `rope()`) is short: her bow cone rides up against the mast head. The line is drawn with strain ticks either side, and her tanks are marked where her sprite carries them (read from its own pixels), not computed from her lift.
- **The air93 hop.** A flight is met only coming home from far (`js/kestrel16.js` `hop`); the checks start it as air93 would (`AIR93.start(…, force)`).
- **The cupped hands** (C4) are at MS 366, not 368.
- `window.R11DRESSERS` does not exist, as the design said; nothing uses it.

## What is [PROPOSED]

Everything in the mechanism and its numbers (radii, the fade, the 60 s ring, 5 s to slip, +0.1); every new line but those quoted from the book above; the three colours of the Cantor's threads; the sour flicker on odd days; the Factor hearing the hand (`AUDIT54` "A wrapped hand…"); the Glass-Hand taking any Legionnaire by the bell; the Cantor's hum at Hob's step and the under-murmur's 1.7; the slip and the hand-cant. Lines added beyond §5: the Options settings "when you stand still" and "always" (the Commander's three-setting row; "shown" was not needed), and the tending card's "They are hurt. Nothing is hunting you, and your hands are free." and "Talk instead".

## Moved to 126b (not built)

The proctors' presses as a scene (the clearing, the Malting); the cores in crates; the Conservatory as an act; the Corsair at the cutter and at Grab the Line; climbing; Crane hearing the hand from Dawnday; a lit 3D version of the glows.

## Tests

- `test/callings126.test.js`: the design's checks 1 to 25, plus 5b (the 3D view's walls) and 26 (cargo night, 6b). Written first and seen red (commit `72530565`; 26 seen red before 6b's change). **93 of 93.**
- **Taught:** `test/presets.test.js` (`cheapOff` gains `callingSight`, as the design names); `test/cargo56.test.js` (Annet: the card has only "Let him say it", Vane's line, `p56_say` 1; with a comment naming MS 2808-2814). `tools/i18n/p58-pumps.tsv` carries the Arbiter's new line in place of the old, and `p54-audit.tsv` and `p67-grafters.tsv` carry the new audit and Hob lines (the cargo56, audit54 and grafters67 suites read each module's French from its own pair file; the Hob line follows the glossary, "la Note-racine"). No other test was changed.

## The frame's cost

`CALLINGS126.stats.ms`, the mean over 120 frames, Glass-Hand standing still in the quarry with 12 Legionnaires and proctors placed in view, Medium at 1x: **0.23 to 0.45 ms in the classic view, 0.26 to 0.59 ms in the 3D view** across the runs (12-13 marks); under the 1.0 ms budget. `Engine.render` runs once a frame with the sight on (120 of 120).

## Pictures

`screenshots/p126-*.jpg` (JPEG q 85), taken with `tools/dev/shots126.sh` (each scene in a page of its own): `glass-cores-classic`, `glass-cores-3d` (two bells in view, one behind the wall not marked), `glass-press-classic`, `glass-press-3d` (one proctor: the two in the clearing are eight cells apart and the sight reaches six), `glass-vosk-3d`, `glass-bell-card`, `cantor-night-classic`, `cantor-night-3d`, `cantor-lid-3d`, `cantor-choir-classic`, `cantor-hob-card`, `corsair-mast-classic`, `corsair-mast-3d`, `corsair-scaffold-classic`, `corsair-scaffold-3d`, `corsair-air93-3d`, `off-classic` and `off-3d` (on beside off).

## Suites

Each through `tools/dev/browser.sh`, one runner at a time; the load-sensitive ones alone.

| Suite | Result |
|---|---|
| callings126 | 93 / 93 |
| presets 7, boots125 70, tamsin52 13, audit54 13, grafters67 19, cargo56 15, air93 19, rigging12 108, r3narrow28 27, cutter68 23, rope45 18, kestrel16 (0 checks printed, exit 0), mast123 67, r5conservatory59 11, church55 13, touches75 32, companions 1, companion-talk 124, hud11 55, dread 18 | all green |
| cover105 8, body21 11, hands122 9, sculpted112 10, pixelhands110 12, pixelhands111 4, strangers125 24, own124 11, text121 68, story-i18n 17, voices 14, voice-acting 4, sidequests 29, law 7, foundation 1, phase1-integration 7, desktop 73 | all green |
| alone: fold113 45, deepsky113 19, light21 21, gpu18 20, visual 15 | all green |
| alone: r3d21 | 24 / 24 (the seeded trace: 480 steps the same with the 3D view on and off) |

- **audit54 and grafters67** were red on their first run for their own pair files' French (taught as above, not the tests).
- **smalllife** (not on the design's list; run because the Corsair reads its Kestrel) failed 2 of 4 runs on this branch at "the probe is deterministic without the module": two pages *without* `js/smalllife.js` disagreeing on one frame (the tavern once, Oakhaven once), and passed the other two, one of them with `js/callings126.js` blocked and one with it loaded. On a clean copy of main it passed 2 of 2. I could not make the difference follow my module; it is noted as owed, to watch.
- **light21** failed once (its Root-vault CPU frame, with against without `js/light21.js`), then passed 4 times running: with the module whole, and with each of its render, update and post-hook wrappers left out in turn. A load flake as far as I can tell.
- `tools/i18n/coverage.js`: 99.78% (12 missing, none of them this phase's: `motion10`, `origins`, `game`, `dread`, `hanger22` and the like).
- The full 228-suite pass on the final commit was not run here (the design's §6.5 asks for it): owed, for integration.

## Owed

- 126b, as above.
- No voices were needed: no line is a book character speaking.
- The sight's look on a phone is not yet seen by the owner; the marks are deliberately small and pale.
