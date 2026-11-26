# Phase 127: the callings, part two, "the quarry" (record)

26 November 2026. Built on branch `p127-callings` from the design `Phase 127 - The callings, part two (design, for the builder).md` (§3.1, §3.2, §4, §5 and §6 for 127). **MS** is Book One's full manuscript, by line; **SB** the Series Bible. Every invention is marked **[PROPOSED]**. The Flambeau Penitent, the Clerk at the Malting, the Bell Yard and the Cloister, and the Quarry-Hand at the Rite pumps are **127b** (design §3.3, §3.4, §6.8): nothing of them was built.

## What was built

| Part | Commit | What |
| --- | --- | --- |
| 1 | `64508c94` | `test/callings127.test.js`, the design's §6.4, red |
| 2 | `cea3bfa3` | The three Phase 126 catches, each with its failing check first |
| 3 | `01721778` | The quarry at work (`js/quarrywork127.js`), life74's two pump lines mended |
| 4 | `863903f8` | The Quarry-Hand (`js/callings127.js`, which also carries the Clerk) |
| 5 | `774c2b47` | The Catalogue Clerk; the Root-vault Legionnaire renamed, with her voice |
| 6 | (this commit) | French merged, precache, the suites, this record, Vol VIII, README, ROADMAP |

`test/callings127.test.js`: **92 of 92** on the final tree (two pages: the game, and the game with both new modules blocked, for the "exactly as before" checks).

## The Catalogue Clerk (`archivist`)

**Sees** (radius 6, Phase 126's sight and switch):
- **The stamp:** a small bronze plate beside every Legionnaire's grille, and within three paces its serial, legible, in a code-drawn 3×5 pixel font [PROPOSED font]. Book: "put her hand on the grille in its chest … where the core sits — and tilted her head to read the serial stamped in the bronze beside it in the Office's blocky numerals" (MS 4828); the run is "WG-" (MS 2698, 4832).
- **The name lit:** a bell whose name is in your book has its first name in capitals above it [PROPOSED].
- **The blank plate:** a proctor's plate is struck through and has no number: proctors surrender "the name and the family" (MS 4411).
- **The serial** [PROPOSED]: `WG-` and 30,000 + ⌊hash(name) × 9000⌋, so WG-30,000 to WG-38,999, a pure function of the name, under every canon entry (39,802 and up: MS 4510, 4556, 4560, 2698-2700, 4832). No bell wears a book person's number (check 9).

**Does: "Copy it off the bronze"** [PROPOSED]. E at a live Legionnaire within 1.3 (not a proctor, not a boss, not a staged figure, not Tamsin Reed, not hunting you, not in a boot, name not yet in your book). The card "The stamp" opens with the line E always gave (`js/game.js` interact: "Stand close, and you can hear someone murmuring inside the bell…"), then the stamp: "Beside the grille, where the core sits, a serial is stamped into the bronze in the Office's blocky numerals" (after MS 4828). "Copy it into your book" puts the name in the ledger with the place and the day; the bell is untouched and the noise held. "You write it small, in a clerk's hand" (after MS 2698's "a fine clerk's hand"); "The bell does not move. It does not need to." is the game's own line (`js/audit54.js`). **The cost:** the bell heard you; the Factor reads it back at her morning walk (`AUDIT54` BITS.stamp 256, A11), her prices go up a step and so does the Rite's eye. Book: the bells keep everything, "She can hear it all back like reading a ledger" (MS 1751). What it is for: Umber's three names without breaking a bell.
- **First landing:** the quarry's bells (Part One, day 1). Sable's things are never touched: no Bound Ledger, no proctor's name, no Aegis serial (MS 4828 is Sable's), no Hollow given its name.

## The Quarry-Hand (`quarry`)

**Sees** (radius 8), after the game's own approved bio, "the sound rock makes before it goes … how to read a face for the line it will split on" (`js/data.js`):
- **Timber:** grain down both legs of each scaffold, a split on the sprung leg, and on the floor an arrow the way the frame will go (away from you, as `js/rigging12.js` knockScaff falls). (The design asked for the leg "nearer you": a scaffold is a billboard, both legs are as near; the sprung one is chosen by a hash of the scaffold's place.)
- **The line it would split on:** on glass-rock faces within 3.5 that face you (at most six), a crack of five hashed points; faint on ordinary rock, bright and ticked at each end on a resonant seam.
- **Loads:** an iron shoulder-hook over the workings' plain crates [PROPOSED].

**Does:**
- **"Shoulder it"** [PROPOSED] at a plain crate stack in the quarry (nothing hunting you within 10). The stack is not moved: you take one from it. While you walk with it, the quarry's Legionnaires and proctors take you for one of the shift (`disguiseProtects` wrapped, exactly as the Synod robes; Tamsin Reed's own three-pace card still opens, check 19). It ends on running, a strike, any song but the murmur, a hurt, a body, noise 4, leaving the workings, two minutes, or E (you set it down). **The cost:** the bells still count you: the first Legionnaire in earshot with a clear line logs `AUDIT54` BITS.shift 512 (Q13). Book: a workforce of "carters and quarrymen" (MS 1382), the shift "on the third terrace" (MS 3294); "Heavy. But a man could carry it." (MS 1833); "Nobody gets away with anything on her terraces." (MS 1751).
- **"Split it on its line"** at a resonant seam (the delves' "a heavy blow will crack it", `js/upgrades.js`), with nothing else in reach. It stands aside while the place's glass-rock echo (`js/dreams.js`) is unheard, so the echo comes first (check 21b).
- A shift man spoken to by a Quarry-Hand nods first (Q16) [PROPOSED].
- Never works the pumps (MS 1777), is never a foreman or of the summer's lost crew.

## The quarry at work (`js/quarrywork127.js`)

The book's quarry: the cable-drums, the glass-channels, the gantries and the depots (MS 1715); the clerk at the gate, "and for a long moment" looking (MS 1707); a clerk "in Consortium drab with ink on his cuffs and a tally-book" (MS 2598); "Nobody in the Oakhaven works had looked up at a mooring mast all week" (MS 2576); and 400 feet down, "There were men at the pumps. A dozen of them, in grey smocks, working the long iron handles in pairs, up and down, with a rhythm so perfect it looked like clockwork" (MS 1777), "Catalogue labor … They don't need rest" (MS 1779).

| Who | Where | When |
| --- | --- | --- |
| Day man A (life74's own "A quarryman, day shift") | down the headframe ladder at the change; carries between the entrance's crates and its own gallery | 6.7-17.4 |
| Day man B | the shaft room's lever (the drums); hammering at the barracks scaffold 11-13 | 6.8-17.4 |
| Day man C | raking spoil in the store | 6.9-17.5 |
| Night man A | the entrance's crates and gallery; up the ladder at six | 18.4-6.0 |
| Night man B | at the pump hall door, watching the pumps | 18.5-6.0 |
| Six Hollows, three handles | a pair at each pump of the quarry's pump hall, one beat for the room, each pair in antiphase | always, Part One |
| Eleven Hollows, four handles | the Root-vault casing: a pair at each pump and a third ready at three; with the map's own "Hollow at the pumps", the book's dozen | always, Part One |
| The clerk at the headframe | the rim, (22.3, 5.4), watching the track; look card W8 | always, Part One |

The hours are life74's [PROPOSED] six o'clock (the books give two shifts and no clock hours). The handle is a code-drawn sprite; the clockwork is presentation only (inside `animDeco`, from `ANIM.T`; at rest under reduce motion). E at a pump man gives `js/rite43.js`'s own card, so no new text. A fight stands the shift down (they walk to their way out and go); the pump men keep working. From the Rite (`rite_started`, or `js/rite43.js` at stage 1 or more), the Greening, the escape and Parts 3-4 nothing is staged: both shifts are "kept on" on the rails (MS 2944). Its own switch, **"The quarry at work"** (`GFX.quarryWork`), off in Original and Low; off, nothing is staged and nothing drawn. **[PROPOSED]:** every placement, the drab colour, the hours, the handle, the rim clerk's place and words.

## Found in the code, and how the build differs from the design

- **The quarry's rooms are joined by closed doors** (`js/maps.js` genDungeon), which LIFE60 never walks, and a walker must never open one (doors block the Legion's sight, `js/game.js` los). So the men whose work is beyond a door come and go at the door nearest the ladder on their way, as LIFE60's people go in at their own doors; only the entrance's own men come down the ladder itself. Day man A works the entrance's crates and gallery, not the depot (the depot is beyond two doors). Every placement was checked in the running game: the rooms are pumphall (26, 26, 9×7), depot (25, 2, 7×6), shaft (18, 9, 5×5), store (6, 18, 5×4), barracks (15, 19, 6×5), the entrance (8, 33, 5×5); the doors used are those below the barracks (20.5, 24.5), into the store (13.5, 20.5) and from the entrance (18.5, 35.5); the pump hall's door (30.5, 32.4); every pump man in an open cell (checks 25, 26).
- **A fight sends them home "within 12 s"** (design check 23): the walk to the door is longer than that; they set off at once and were all in by 14 s in the test.
- **Check 4** asked for equal `Math.random` counts and equal frame hashes against a page with the modules blocked. The game itself is not repeatable from a restored save across runs (the same run on one page gave 5049 and 8138 calls; js/smalllife.js's rats, the crows and LIFE60's private stream carry on across places; the clearing's frames are never repeatable). So: the entity lists are compared across the pages (rats left out, the walkers and crows without their jittered spot; on fresh pages they matched with them); no `Math.random` call is made from either module's own code, switch off or on (0 of 19,926); and on one page the frames hash equal to a run with the module's per-frame entry points stubbed out (classic and 3D, the quarry and the Root-vault; outdoors, nothing of the module's is there and its pose is never called).
- **Check 33** compares messages, cards and enemy states without the enemies' die rolls (a blow's damage) and with the tutorial's first-time lessons off, which come on each page's own history.
- The Root-vault's pump men stand at `js/rite43.js`'s own places at a pump (±0.75, 0.15 and 0, 0.8), so the room looks the same before and at the Rite; the quarry's at the design's ±0.55, +0.45.
- E while carrying puts the load down, whatever you look at (your hands are full).
- `js/life60.js` §4.6 (the stage guard) was not needed: the switch turned off in play goes through `opts.gone`, which LIFE60 already honours. Left out.
- The design's "the third man changes places every 40 strokes" was not built: the third man stands ready, still. Owed.
- In the 3D view the pump men stand in front of some bells, and the sight's depth probes hide those (the budget check counts at least 4 marks there, 8 in the classic view).

## The mends

- **The Root-vault Legionnaire "Mirren Salk" is Cass Yelland** [PROPOSED name; found nowhere in the books, the bibles or `js/`]. Her core is in the Kestrel's hold, fourth consignment (MS 4560). `js/maps.js`; old saves are renamed on load; a ledger entry from an old kill stays as written. Her death name rendered with Kokoro (`core.death.cass-yelland`, `tools/voices/build.py --only core_voice`). Mirren Salk's own clip stays: her name is in the crates.
- **life74's two pump lines** (`js/life74-smallplaces.js`): "The cable-drums, mostly, and the spoil. The pumps are the Office's men, and they don't talk…" and "Nine hours on the drums." (MS 1715, 1777-1779), with their French.
- **The three Phase 126 catches:** the first-sight line is each calling's registered `lines.first`, not a table of three; `callings126` check 1 taught; a Glass-Hand's first E at a proctor plays `js/dreams.js`'s echo first (new check 7b; the design's 29).

## Every act and what else listens on the same key

| Act | Also listening | Check |
| --- | --- | --- |
| Copy it off the bronze (E at a Legionnaire) | `js/game.js`'s murmur line (in the card); `js/dreams.js`'s first bell echo (stands aside); the Glass-Hand's act (Glass-Hand only); `js/tamsin52.js` (Tamsin excluded); `js/boots125.js` (never in a boot) | 10, 11, 12, 33 |
| Shoulder it (E at plain crates in the quarry) | `js/game.js`'s label only; `js/tamsin52.js`'s tick still opens her card | 16, 19, 33 |
| Split it (E at a wall) | `js/dreams.js`'s glass-rock echo (stands aside) | 21, 21b |
| A Quarry-Hand's talk to a shift man | the talk itself, unchanged | Q16 |

## Tests taught

- `test/callings126.test.js` check 1: `ids()` begins with the three and goes on; the dummy is added last; a registered `lines.first` is said. New 7b. (Comments name Phase 127.)
- `test/presets.test.js`: `cheapOff` has `quarryWork` (per frame, off in Low).
- (the suites below: anything else taught is listed there.)

## The frame cost (1x, Medium, 12 enemies in view, the pump hall with the quarry at work on)

| | Classic view | 3D view |
| --- | --- | --- |
| The Clerk's sight (`CALLINGS126.stats.ms`) | 0.17-0.18 ms | 0.25-0.31 ms |
| The quarry at work's own code a frame (poses, staging checks) | 0.005-0.012 ms | 0.007-0.015 ms |
| `render` with the quarry at work on minus off (120 frames each, interleaved) | -0.02 to +1.05 ms (noise on this 2-core machine) | not measurable (SwiftShader: 65-150 ms a frame) |

Under 1 ms a frame together. The carried crate's drawing is a few rectangles. `Engine.render` runs once a frame.

## Pictures

`screenshots/p127-work-day-classic.jpg`, `-work-day-3d`, `-work-night-classic`, `-work-night-3d`, `-work-pumps-3d`, `-work-rootvault-3d`, `-work-rim-0620-3d`, `-off-classic`, `-off-3d` (on beside off); `-clerk-stamps-classic`, `-clerk-stamps-3d`, `-clerk-card`, `-clerk-name-3d`; `-quarry-timber-classic`, `-quarry-timber-3d`, `-quarry-seams-3d` (a resonant seam set into the shaft room for the picture), `-quarry-shoulder-classic`, `-quarry-shoulder-3d`. Taken with `tools/dev/shots127.sh`.

## Owed

- **127b, the Church and the Office** (designed in the Phase 127 design §3.3, §3.4, §5, §6.8): the Flambeau Penitent whole; the Clerk at the Malting, in the Bell Yard and the Cloister; the Quarry-Hand at the Rite pumps.
- **The headframe's wheel turning at the shift change** (the owner's ruling of 26 Nov, 7:22 am, "decision 1 yes"): a later piece, 3D view only (`js/eaves78.js`), with its own switch and checks. Not in 127.
- The third pump man changing places every 40 strokes (design §4.1 B).
