# Phase 127: the callings, part two (design, for the builder)

26 November 2026. Catalogue Clerk (id `archivist`), Flambeau Penitent (`penitent`), Quarry-Hand (`quarry`), and the quarry at work. Read-only design: nothing in the repo was changed.

**Abbreviations.** **MS** = `story/Books/Book One - The Silenced Province/Book One - The Silenced Province (full manuscript).md`, by line. **SB** = `story/World Bibles/Series Bible (canon).md`. **Brief** = `story/Game Layer/Phase 125 - lore brief, the six callings.md`. **126D** = `story/Game Layer/Phase 126 - The callings, part one (design, for the builder).md`; **126R** = its record. Code lines are from main at `a3f1e98d` (Phase 126 merged). Every MS line cited below I re-read for this design; SB lines are cited from the brief (checked by the Commander) unless marked "re-read". **[PROPOSED]** marks the game's own inventions.

**The rule this design keeps** (126D's): at a canon set piece the traveller cannot change what happens. A calling's act matters in one of two ways. It can change how a book scene feels to play without changing what happens in it. Or it can make a real difference in the traveller's own play.

---

## 0. The short version, and the cut

The ids are confirmed from the code: `js/data.js` l. 39 `archivist` (name "Catalogue Clerk", l. 39), l. 48 `penitent` ("Flambeau Penitent"), l. 57 `quarry` ("Quarry-Hand").

- **Catalogue Clerk.** *Sees:* the serial stamped in the bronze beside every Legionnaire's grille, and the name lit above a bell once the name is in your book. A proctor's plate is blank, because proctors surrender their names. *Does:* **Copy it off the bronze**: the Legionnaire's name goes into the ledger without killing it, and the bell hears you do it. *First landing:* the quarry's bells and Umber's three names (Part One, day 1).
- **Quarry-Hand.** *Sees:* sound and unsound timber (the scaffolds' sprung leg and the way they will go), the line a face of glass-rock would split on, and the loads in the workings a hand could shoulder. *Does:* **Shoulder it**: with a crate on your shoulder at a walk, the quarry's Legionnaires and proctors take you for one of the shift. The bells still count you, and the Factor reads it back. Also **Split it on its line** at a resonant seam. *First landing:* the quarry at work.
- **The quarry at work** (`js/quarrywork127.js`, its own switch). The day and night shifts working the quarry map, changing at six by the headframe ladder. The Catalogue's Hollows work the long iron handles of the pumps in pairs, like clockwork: six in the quarry's pump hall, and in the Root-vault the book's dozen. There is a clerk at the headframe on the rim, under the mast. The rim's shift change on the track already exists (`js/life74-smallplaces.js`). Two of its lines put quarrymen on the pumps, which the book gives to Hollows, so they are mended.
- **Flambeau Penitent** (designed here, built in 127b). *Sees:* rank and intent among the Church: who walks first, who carries, where every hood is turned, and whether a stave is grounded or carried. *Does:* at the gate, **Fall in behind the fire**: you walk in with the column to the square, unchallenged while you keep a bearer's place. At the Rite procession you answer the first stave turned toward you. You sleep under the Pure Note as you always have.

**The cut, honestly.** The whole row is about 1.4 times Phase 126, too much for one builder. It is cut by place, so each part can be tested in its own maps:

- **127, "the quarry"** (this builder): the quarry at work; the Quarry-Hand whole; the Catalogue Clerk's sight and its act on the bells. The visual heart and the two callings that land in the same maps go together. "Taken for one of the shift" needs the shift to be there, and the Clerk's first landing is the quarry's bells.
- **127b, "the Church and the Office"** (the next phase, about half the size): the Flambeau Penitent whole; the Clerk at the Malting (believed by the line clerk) and in the Bell Yard and the Cloister (sight); the Quarry-Hand at the pumps in the Rite. §3.4 and §5 give 127b in full, so its builder only builds.

**Things in the row that cannot be built as written** (decided, with reasons):
1. **"Men on the ladders."** The books give the quarry a cage on a cable (MS 1767) and the shifts on the terraces and steps (MS 1723, 2944, 3294). The only ladders are the mast-ladder, the service ladder of the Greening climb (MS 3358, Kaelen's and Lyra's scene) and the catwalk ladder at the Rite (MS 3094). The game's way between the rim and the workings is "Up the headframe ladder" (`js/maps.js` l. 632), a wall portal with no rungs drawn. So the shift arrives and leaves by that ladder at six, and nobody is drawn on rungs.
2. **"The pumps turning"** are worked by Hollows, not by hands (MS 1777), so no quarryman works them, and the Quarry-Hand never does.
3. **"Archivist of the Veil"** is Sable's (ruled 24 Nov). Everything here says Catalogue Clerk.
4. **"The Malting and the Bell Yard" as the Clerk's first landing.** Both come after the Kestrel leaves Oakhaven (Whisper-Grove, `js/grove31.js`; the queue-yard, `js/malting61.js`). A Clerk would get nothing for half the game, so the quarry's bells come first and the Malting and Bell Yard are the second landings, in 127b.

**Two things found in the code that 127 mends:**
- **A canon collision the Clerk's sight would light up.** `js/maps.js` l. 705 names a Root-vault Legionnaire "Mirren Salk". In the book her core is in the Kestrel's hold, fourth consignment: "She is in the stack behind you" (MS 4560). The game's own rule says so too: "Nobody canon puts elsewhere (in a crate …) can speak from a core" (`js/data.js` l. 233). She is renamed [PROPOSED "Cass Yelland": both words are found nowhere in the books, the bibles or `js/`, checked by whole-word grep]. See §6.2.
- **A 126 slip of the same kind as the one mended at integration.** `js/callings126.js` l. 394 stands the Glass-Hand's act aside for `js/dreams.js`'s first bell echo only on Legionnaires (`isBell`). But `coreEcho` fires for any `def.core` enemy that is not chasing (`js/dreams.js` ll. 444-452), and proctors are `core: true` (`js/data.js` l. 223). So a Glass-Hand's first E at a proctor in a place with an unheard echo takes the press and loses the echo. Fixed with a failing check (§6.4, check 29).

---

## 1. What exists today

### 1.1 Shared, and the door Phase 126 left

| What | Where |
|---|---|
| `CALLINGS126.register(id, { radius, targets, draw, acts, tick, lines })` | `js/callings126.js` ll. 144-152 |
| Flag bits by calling: `ORDER = ['blade','cantor','corsair','archivist','penitent','quarry']` (archivist 8, penitent 16, quarry 32) in `p126_seen` / `p126_did` (0..63) | ll. 40-41, 100 |
| **The first-sight line is looked up in a local table of three**, `FIRST = { blade, cantor, corsair }`, not in the registered `lines.first` | l. 97, used l. 803. **127 must change this** (§6.2). |
| `firstAct` (the journal line, once) and `echoWaits` are not exported | ll. 107-110, 381-392; api ll. 876-880 |
| The glyph kit passed to every draw function: `px dot ring fork lens thread line plumb patch tank`, plus `toView visiblePt pulse now groundZ reduced onView` | ll. 242-309 |
| The act: `interact` wrapped; the picked entity goes to the calling's `acts` first | ll. 816-822, 353-360 |
| `test/callings126.test.js` check 1 pins `ids()` to exactly `['blade','cantor','corsair']` and the dummy at index 3 | ll. 127-129. It goes red the moment 127 registers, so it is taught (§6.2). |
| The calling lines around the boots moments, unvoiced: archivist `names`, penitent `needle`, quarry `bolts` | `js/boots125.js` ll. 176-189 |
| The audit: "The Archivist has two or three [touches]… The Penitent and the Quarry-Hand have different numbers and different starting gear and are otherwise the same person." "A Flambeau Penitent stands in the gatehouse while their own Church comes up the road, and is told what anyone is told. A Quarry-Hand goes down their own shaft as a visitor." | `story/Game Layer/Audit of 23 Nov 2026 - the game against the books, the quests, the dialogue, with ratings.md` ll. 108, 75; its table ll. 121-123; landings l. 125; "The Quarry, Depot Three and the Root-vault: 80. … the quarry map itself is bare between scenes. Raise: the shifts, for a Quarry-Hand." l. 157 |

### 1.2 Catalogue Clerk (`archivist`)

| Today | Where |
|---|---|
| desc: "…walked away from a harvest-house. You know what the glass cores are. You can read a Legionnaire's name off its bell. You know the forms, because you filled them in." bio: the copy-book, "an ordinary one" | `js/data.js` ll. 40-41 |
| Songs murmur, tending, **name**; 3 glass fragments at the start | `js/data.js` l. 44; `js/game.js` l. 148 |
| **Read the Name** (any calling with the song): costs a fragment and 6 voice, the nearest core within 4 in a 0.5 cone, killed; its name in the ledger | `js/data.js` l. 213; `js/game.js` ll. 780-787 |
| Lore +20, Law-Song +10 | `js/upgrades.js` l. 369 |
| Kit: the 'hush' set, six throwing knives, pistol | `js/gear87.js` l. 111 |
| Tobiah asks a Clerk whether the Office keeps everything | `js/tobiah57.js` l. 65 |
| Umber (the game's Veil runaway, outside the Hedge with two proctors) says to a Clerk "Seven forty-one. You are Veil-tuned." | `js/data.js` l. 544 (and l. 741, Sable); Umber placed `js/maps.js` l. 770 |
| Umber's quest: bring three names (any `G.ledger` entries) | `js/data.js` ll. 540-552 |
| Tamsin Reed: "Read her name" for anyone with the song | `js/tamsin52.js` l. 137 |
| How a name reaches the ledger today: a core killed (`js/game.js` l. 630); the crates card (Annet Sowerby, Corwin Aye, Mirren Salk; l. 1515, `js/cargo56.js` l. 160); the Bell Yard Roll; the Cloister tapes; the pumps at the Rite | as cited |
| Docket-like things in the game: the Bell Yard name-boards (`js/grove31.js` ll. 109-118, deco `use: 'p31_board'` l. 243); the Cloister's name-tapes (`js/maps.js` l. 889, `js/grove.js` l. 194); the Malting's queue clerk and ticket man (`js/malting61.js` ll. 244-250). There is no docket deco in Part One. | |

### 1.3 Flambeau Penitent (`penitent`)

| Today | Where |
|---|---|
| desc and bio: carried for the Flambeaux at a chapter far from the Reach, no rank, eleven years; "You still know every word of the Pure Note, and you say none of them." | `js/data.js` ll. 49-50 |
| Blunt +15, Law-Song +10; kit: kettle helm, gambeson, mace, hands | `js/upgrades.js` l. 370; `js/gear87.js` l. 112 |
| The Church at the gate (Dawnday 06:00-07:30): the gate card (two choices), the column of decos (`crane`, `cens`, `herald`, choir `ch00`-`ch33` on sprite `deacon`, Flambeaux `fl0w`…`fl2e` on sprite `proctor`), the noise rule (noise over 6.5 while it passes: a hood turns, `p55_heard`, `AUDIT54.log('gate')`), the warrant, the well-house | `js/church55.js` ll. 90-92, 112-128, 125, 136-139 |
| The chapel from `church_come`: Ignatius (npc) and two passive Legionnaires | `js/maps.js` ll. 410-412 |
| The Rite procession: column and kerb figures; "A loud Song turns a Flambeau's stave toward you; twice, and a Legionnaire walks you at the back" | `js/rite43.js` ll. 9, 321-345, 571-579 (`staveTurns` l. 97, `marched` l. 98) |
| The Pure Note as a lid: rests in town are halved while it holds | `js/touches75.js` ll. 7-12, 96 (`lidRest`) |
| Nothing else checks for the Penitent | grep: only the lines above |

### 1.4 Quarry-Hand (`quarry`)

| Today | Where |
|---|---|
| desc/bio: a stonecutter from a quarry down the Flume; "the sound rock makes before it goes, the smell of wet clay, and how to read a face for the line it will split on"; came because the works "were paying scrip to anyone who would ride the cage" | `js/data.js` ll. 58-59 |
| Blunt +15, Climbing +15; "Climbing" in its skills gives +1 climb rank (cheaper `doClimb`) | `js/upgrades.js` ll. 371, 1457-1460, 1462 |
| Kit: the 'works' set, the sledge | `js/gear87.js` l. 113 |
| Climbing exists only as `use: 'climb'` decos (Whisper-Grove, the Deep Woods) and the grapnel rings | `js/upgrades.js` ll. 1735-1745; `js/rigging12.js` ll. 5-10 |
| Scaffolds that fall when struck, two in the quarry (18.5, 19.4), (36.5, 13.5), one in the Root-vault | `js/rigging12.js` ll. 99-103, 378-387 |
| Resonant seams: `{ tex: 't_glassrock', resonant: true, label: '…(396 Hz or a heavy blow will crack it)' }`, **only in the procedural delves**; `checkResonantWall(freq)` opens `resonant` cells for any freq, and any `t_glassrock` at 396 | `js/upgrades.js` ll. 666, 695-707; `js/gates.js` ll. 576-583 (dust) |
| The quarry's crates: plain decos (no `use`) at the entrance, the depot and the store | `js/maps.js` ll. 634, 647, 656 |
| The Synod robes' cover: `disguiseProtects(e)` is the one seam `enemyUpdate` asks; already rebound by `js/phase1-native.js` l. 163 | `js/game.js` ll. 508-535, 565 |

### 1.5 The quarry between scenes

**The places.** The game's `quarry` map is the workings under the headframe: a seeded dungeon with a stone ceiling (`js/maps.js` ll. 625-690, seed 4127). Its rooms are `pumphall` (three `pump` decos, two Hollow npcs, Tobiah; ll. 635-641), `depot` (Tamsin Reed, the coil, the loading terrace), `shaft` (the locked gate to the Root-vault, a lever), `store`, `barracks` (Gethin Coote), seven fillers, and the entrance "Up the headframe ladder" (ll. 632-633). **The rim** is the clearing's north edge: the headframe door (20, 4), a pump, crates, a sign (`js/maps.js` ll. 502-503), and the mast at (13.0, 3.6) with its ladder (`js/mast123.js` ll. 9-25, 52-55). The headframe and its plank shed are drawn as geometry by `js/eaves78.js` ll. 901-918; the sheave is static, in the 3D view only. **The Root-vault** casing has four pumps and one Hollow npc "at the pumps" (`js/maps.js` ll. 696-703).

**Who moves there between scenes:**

| Who | Where | Pattern |
|---|---|---|
| The day and night shifts on the track, North Gate to headframe and back. Day: down at 6.0-6.7, "home" in the headframe until 17.5, back by 18.5. Night: down at 17.5-18.4, home in the headframe until 6.0. | the clearing only | `js/life74-smallplaces.js` ll. 173-201 (roster), l. 221 (gone from the Rite on), through **LIFE60** |
| Rats | the quarry, the Root-vault | `js/smalllife.js` l. 370 |
| The Factor's morning walk, 06:00-09:00 | the quarry among her WATCH_MAPS | `js/audit54.js` ll. 40-41 (a card, not a figure) |
| Nobody else. The quarry map has no moving person at all. | | the audit, l. 157 |

**The engine to extend, not a second one:** `js/life60.js`. Transient npcs with schedules, paths by BFS, jobs drawn as small pose changes (`JOBS`, exported), barks, a private xorshift stream (never `Math.random`, ll. 43-44), `opts.gone` and `opts.down`, the switch `GFX.life` (not a preset switch). `LIFE60.variant(src, dst, hue, sat, lit)` recolours cloth and keeps skin through `FACES124.skin` (ll. 50-66). `LIFE60.add(mapId, …)` **replaces** a place's roster (l. 342), so the clearing's roster cannot simply be added to. And `stage()` never removes a walker whose key has left the roster (ll. 183-195). §4.6 says what follows.

Deco poses: `js/anim.js` `animDeco` (ll. 251-270) runs inside `render` from `animFrame` (ll. 379-395, wrapped l. 415). It resets `animSY/animLift/animSkew` each frame and sets them for trees, hanging things, fire, lamps and cores. Both renderers read `animSprite`, `animSY` and `animLift` (`js/engine.js` ll. 906, 917; `js/r3d21.js` ll. 1655, 1660, 1748).

**Lines in the game that the book contradicts** (mended in 127): `js/life74-smallplaces.js` l. 181 (work) "The pumps, mostly. Twelve men on them…" and l. 182 (bark) "Nine hours on the pumps." The men at the pumps are Hollows, "Catalogue labor" (MS 1777, 1779). The Phase 125 design (l. 34) already ruled "no men at the pumps by name for the quarry hand".

---

## 2. What the books give, and what the game must never do

### 2.1 Catalogue Clerk

**Senses.**
- The serial: "the serial stamped in the bronze beside it in the Office's blocky numerals … **WG-41,005.**" (MS 4828-4832, on the Aegis; Sable reads it).
- Tags: "each tied with a paper tag on a string. … The tag was written in a fine clerk's hand, the kind of hand they teach at a Catalogue desk: **WG-41,004.**" (MS 2694-2698).
- "She knew that mark the way a clerk knows any mark she has read eleven times." (MS 4185.)
- The form: "*Form 9: Intake. The subject is to be asked three questions and no more. Name. Age. Trade.*" (MS 4075.)
- The numbers run in the forty thousands for the Kestrel's stock: "The tags run in the forty-one thousands" (MS 4285). Canon entries: Corwin Aye 39,802 (MS 4556); Ivo Renn 40,101 (MS 4510); Bettis Renn 40,102 (MS 5020); Mirren Salk 40,991 (MS 4560); Ketter Dell 41,009 and the Aldritch brothers 41,012-41,013 (MS 4510); 41,004, 41,006, 41,007 tags (MS 2698-2700); 41,005 the Aegis (MS 4832).
- The Oakhaven garrison is fed Office cores: "Consignee: Oakhaven Works, Carillon garrison" (MS 2564); "the Legions' cores burn out at a rate of eleven a month per garrison" (MS 4944).

**Does.** Copies, and keeps records. "A clerk walking the line every twenty minutes telling everyone, pleasantly, what would be asked. Name. Age. Trade. A second clerk at the door of the first room to repeat it." (MS 4868.) The Office "keeps everything" (MS 5120).

**Pays.** A clerk has no Bound Ledger, so no name of her own is taken (the Ledger's "weight for weight" is Sable's, Brief §5.2, MS 4125). In play the cost is being heard: "They keep everything … She can hear it all back like reading a ledger" (MS 1751).

**Never, in this game.**
- Be Veil-sworn, or carry a Bound Ledger (SB 42, 334 via the Brief; the 24 Nov ruling).
- Read a proctor his surrendered name. That is Sable's moment: "Emory Wain… the clerk was me" (MS 4411). Proctors give up "the name and the family" (MS 4411), so the Clerk's plate on a proctor is blank, and the act is never offered on one.
- Read the Aegis's serial (Sable, MS 4828). The Aegis is a boss, and the act never touches bosses.
- Give a Hollow its name back (Sable's price, SB 395 via the Brief).
- Walk in at the Malting's front (Sable, MS 4918). Be Quist's pupil (MS 4924). Use Registry Square, form F/3 or the Concordance (Brief §5.6).

### 2.2 Flambeau Penitent (127b)

**Senses: the order of the Church.**
- The choir: "thirty … in white, walking four abreast with gorgets of gold at their throats … the breath passed down the line" (MS 2263).
- "On either side of them walked the Flambeaux." "Tall men and women in robes the red of banked coals, hooded, their faces in shadow, each carrying a fire-stave: a staff of black iron as tall as a man, topped with an iron cage, and in every cage a fist-sized lump of amber Aether-Glass, burning. … white-gold and smokeless" (MS 2265-2267).
- Intent: "whenever one drifted nearer, a Flambeau on that side raised his stave, and the white-gold fire in its cage flared" (MS 2271). At rest: "The Flambeaux had grounded their staves at the four corners of the square" (MS 2329).
- The head: "at the head of the procession, alone, in red, swinging a great brass censer on a chain, walked the Inquisitor" (MS 2275). The herald: "in white and gold … the High Patriarch's great sunburst seal hanging from it on a ribbon" (MS 2303). The sisters: "Church women in grey with gold at their collars" (MS 2836).
- "The Pure Note walked where it liked." (MS 2273.)

**Does / pays.** Knows the rubric and the order, says none of it (`js/data.js` l. 49). The game's own boots line already has it: "He blessed her with two fingers, as the rubric has it" (`js/boots125.js` l. 187; MS 3110). The cost is being seen by the wrong people: the town on the bank, and the Factor on the Greenhall steps beside the Governor (MS 2293).

**Never.** Be Ignatius Crane or Lucan Ostrel; hold a rank; carry the censer, which is the Inquisitor's alone (MS 2275); be of the Dawning; light the Hollow (MS 2311); defect or sign a proclamation (Crane's and Severin's arcs, Brief §6.6); sing the Pure Note aloud; be recognised or spoken to by Crane in new dialogue (a book character speaking).

### 2.3 Quarry-Hand

**Senses.** "the sound rock makes before it goes … how to read a face for the line it will split on" (`js/data.js` l. 59, the game's own approved bio). The quarry "a stepped bowl of grey stone … from which the Reach had cut its millstones and its chapel steps and the lintels" (MS 1711).

**Does.** Carries: "Heavy. But a man could carry it." (MS 1833, the coil.) Is one of a workforce: "carters and quarrymen" (MS 1382); "the quarry-hands at the mast" (MS 1394); the day shift "on the third terrace" (MS 3294).

**Pays.** The bells count everyone: "Nobody gets away with anything on her terraces." (MS 1751.) The works call losses "attrition" (MS 1159).

**Never.** Work the pumps (MS 1777). Be a foreman or the bore-master (MS 3116). Be of the summer's lost crew (MS 1747). Be known to the shift by long years, since the works are two years old (MS 1711; SB 190 via the Brief). Be Tobiah. Climb the service ladder before the Greening scene (MS 3358). Revisit the quarry after the Rite (Brief §7.6).

### 2.4 The quarry at work in Harvestmonth 419

Day 1 is 6 Harvestmonth (SB 635, via the Brief).

| What | Book |
|---|---|
| The gate: "the clerk in the gatehouse looked at it, and at him, and for a long moment at the felt sleeve, and pulled the lever. Two Legionnaires stood on either side of the gate with their bells tilted to the sky" | MS 1707 |
| The bowl, the headframe at its bottom; "the cable-drums. The tanker bays. The glass-channels cut into the stone. The gantries, and the long low sheds of the depots, and a censer-platform"; lit "from below — a green-gold light coming up out of the shaft"; "Above it all … the mooring mast, and at the mast rode the little smuggler's ship" | MS 1711-1715 |
| Dress: "Consortium drab, with a junior's single green bar"; a clerk "in Consortium drab with ink on his cuffs and a tally-book under his arm" | MS 1723, 2598 |
| "The night-shift office was a plank shed against the foot of the headframe" | MS 1741 |
| The Factor "walks the Legion every morning before the day shift, with her lenses" | MS 1751, 1847 |
| The cage: "The cage went down on its cable in the dark" | MS 1767 |
| **The pumps, 400 ft down:** "There were men at the pumps. A dozen of them, in grey smocks, working the long iron handles in pairs, up and down, with a rhythm so perfect it looked like clockwork. None of them looked up when the cage arrived. None of them looked at anything." "Catalogue labor … They don't need rest." | MS 1777, 1779; again on the Rite day, MS 2972 |
| **Under the mast:** "Nobody in the Oakhaven works had looked up at a mooring mast all week. They had a Rite to build and a Church to feed and a bore four days from the casing" | MS 2576 |
| Both shifts, Rite day: "The night shift and the day shift had both been kept on, and they stood along the rails in their drab with their caps off" | MS 2944 |
| The Greening: "The day shift was running up the quarry road" | MS 3386 |

**Hours.** The books give two shifts and no clock hours. "Before the day shift" is the Factor's walk; the night shift is at work in the middle watch (MS 1707, 1847). The game's six o'clock change is `js/life74-smallplaces.js`'s own [PROPOSED], kept.

---

## 3. Each calling's sight and act

All three register with `CALLINGS126.register`, in `js/callings127.js` (`window.CALLINGS127`). The mechanism is unchanged: when it shows (the Options row), the fade, the occlusion (`visible`, `visiblePt`), the access rules (reduce motion, no flashes, high contrast, colour-blind: shape carries meaning), and the dim over the hands. Colours below are [PROPOSED] where the books give none.

**A small pixel font** [PROPOSED] lives in `js/callings127.js`: 3×5 glyphs for 0-9, A-Z, `-` and `,`, as bit rows drawn with `g.px`, and a `g2.text(x, y, s, col, a)` helper. It is code-drawn, crisp on the 3D view's device-resolution HUD layer, and has no `fillText`. A name and a serial are data, not translated.

### 3.1 Catalogue Clerk: the stamps (built in 127)

**The sight** (radius 6):

| Mark | On | Drawn | From |
|---|---|---|---|
| `stamp` | every live `legionnaire` (not `transient`, not a boss) | A small bronze plate beside the grille: rect top + 24%, offset right by 14% of its width. It is 5×3 px of `#b08a48` with a dark `#140f08` rim. Within 3 cells the serial is legible in the pixel font in pale gold `#f0dca0`, e.g. `WG-34,417`. Beyond 3, the plate alone with three dots. | MS 4828 (the stamp "beside" the grille); MS 2698 (WG-) |
| `name` | a live Legionnaire whose `name` is in `G.ledger` | Its first name in capitals above the bell (rect top − 7 px), pale gold, with a dark 1-px shadow. The "names lit on bells" of the row. | the row; `js/data.js` l. 40 |
| `blank` | every live `proctor` (and `pressman`, `def.press`) | The same plate at the mask (rect top + 20%), with no number: one struck line across it. | MS 4411 (the name and the family surrendered) |

**The serial** [PROPOSED]: `'WG-' + n`, where `n = 30000 + floor(hashStr(e.name) * 9000)`, so in 30,000-38,999. That lies below every canon number (39,802 and up, §2.1), so no bell can wear a canon person's entry. `hashStr` is `js/callings126.js` l. 44's, exported or copied. Tamsin Reed gets one by the same rule. Book support for Whisper-Grove stock in the Oakhaven garrison: MS 2564, 4285, 4944. The exact prefix of the garrison's older cores is the game's choice.

**The act: "Copy it off the bronze"** [PROPOSED].
- **Offered when:** the calling is `archivist`; not in a boot; the picked thing is a live `legionnaire` within 1.3 that is not transient, not a boss, not named Tamsin Reed (Depot Three keeps `js/tamsin52.js`'s card, where the Clerk already has "Read her name"), and not in `chase`. Its name is not yet in `G.ledger`. And `!echoWaits(e)`.
- **The card, "The stamp":** the line E gave before, verbatim (`js/game.js` l. 1450, so nothing is lost), then the stamp line (§5, A4). Two choices:
  - **"Copy it into your book":** `G.ledger.push({ name: e.name, where: G.map.name, day: G.day })`; `p127_copied` + 1; `AUDIT54.log('stamp')`; `firstAct('archivist', A10)`; message A7. The Legionnaire's `state`, `hp` and position are untouched, and `G.noise` is held across the card.
  - **"Step back":** nothing.
- **Cost:** the bell heard you. Its Factor reads it back at the next morning walk (A11), and her store goes up a step (`js/audit54.js` l. 126). The Rite's eye penalty also grows by a step (`ritePenalty`, l. 127): the same cost as every other thing the bells hear. No fragment, no voice (a clerk's copy-book costs nothing of yourself).
- **Again on the same bell:** the act stands aside and the old murmur line plays.
- **What it is for:** the Clerk can bring Umber her three names (`js/data.js` ll. 540-552) without breaking a single bell. Others must kill one or listen at the crates. Every name copied is one more "kept" for the endings that read the ledger (`js/game.js` ll. 1638, 1892; `js/ash50.js` ll. 420, 521).
- **With the sight hidden:** once a map, aimed at a bell it could copy, the hint A9.

**What else listens on E at a Legionnaire, and how they sit together:**
- `js/game.js` l. 1450, the murmur line: included in the card's text.
- `js/dreams.js` ll. 444-452, the place's first bell echo: the act stands aside while `echoWaits(e)` (export it from `js/callings126.js`), so the echo plays first and the card comes from the next E.
- `js/callings126.js` blade act: Glass-Hand only. `js/tamsin52.js`: Tamsin is excluded.

**First landing: the quarry's bells and Umber** (Part One, from day 1). The quarry has Gethin Coote in the barracks and the fillers' pool names (`js/maps.js` ll. 657, 659-666). It is Vosk's line, so the cost lands. The two candidates in the row (the Malting queue, the Bell Yard boards) exist, but come later; they are the second landings (§3.4).

### 3.2 Quarry-Hand: sound and unsound (built in 127)

**The sight** (radius 8):

| Mark | On | Drawn | From |
|---|---|---|---|
| `timber` | the scaffolds (`G.map._p12r`, `k === 'scaff'`, not fallen; quarry and Root-vault) | Grain lines down the two legs in pale wood `#c8a870`. On the sprung leg (the one nearer you, so the frame falls away, as `knockScaff` does, `js/rigging12.js` ll. 378-383) a jagged split of 4 px in amber `#e0a040`. A short arrow on the floor in the fall's direction (`toView` of two world points), not the Corsair's dithered patch. | `js/data.js` l. 59 |
| `seam` | `t_glassrock` wall faces within 3.5 that face the camera (at most 6, nearest first; the quarry and the Root-vault have them, `js/maps.js` ll. 627, 693) | Across the face, from z 0.15 to 0.85, a crack polyline of 5 points hashed from the cell (`h3(x, y, k)`). It is faint glass-green `#7fd0a0` at alpha 0.35 on an ordinary face; bright, unbroken and with a tick at each end on a `resonant` cell. Drawn through `toView`, with a 0.02 offset off the face, and `visiblePt`. | the bio; `js/upgrades.js` l. 666 |
| `load` | plain `crates` decos in the quarry map | A small iron shoulder-hook glyph (5 px, `#9a9aa0`) over the stack: you could shoulder this. | [PROPOSED] |

**Act 1: "Shoulder it"** (first landing: the quarry).
- **Offered when:** the calling is `quarry`; `G.mapId === 'quarry'`; the picked thing is a `crates` deco with no `use` within 1.6; you are not already carrying; not in a boot; no live enemy in `chase` within 10.
- **The card "A load"** (Q4): "Shoulder it, and walk like you are paid to" or "Leave it." The stack is never moved or hidden: you take one from it [PROPOSED]. So no saved entity changes (decos are saved by index with x, y, `js/game.js` l. 2576).
- **While carrying** (`st.carry`, not saved): the crate's near corner and slats are drawn on the HUD layer at the upper left of the view, in code (both views; §4.4's pattern). And **the cover**: `disguiseProtects` is wrapped (`js/game.js` l. 534, already rebound by `js/phase1-native.js` l. 163; `js/callings127.js` loads later, so its wrapper is outermost):
  ```
  disguiseProtects = e => _dp(e) || shiftCover(e)
  shiftCover(e): st.carry && G.mapId === 'quarry' && calling() === 'quarry' && synodInspector(e)
                 && e.state !== 'chase' && !(e.investigation && e.investigation.source === 'body')
  ```
  `enemyUpdate` then lets them be, exactly as for the robes (l. 565). Tamsin Reed's card still opens at three paces: it is `js/tamsin52.js`'s own trigger, not her eyes. The cover holds only in the quarry map.
- **It ends** when you put it down (E again, Q8), run (speed over 1.15 × `2.6 + Speed/60`, `js/game.js` l. 2284), strike (`G.attack.t > 0`), sing anything but the murmur, are hurt (`G.hurtT > 0`), take up a body (`G.dragBody`), reach noise 4, leave the map, or carry for 120 s (Q10). For ending by force, Q9.
- **Cost:** the first time while carrying that a Legionnaire within `AUDIT54.EARSHOT` has a clear line to you, `AUDIT54.log('shift')`. The Factor reads Q13 at the walk; prices and the Rite penalty go up a step. `p127_carried` + 1; `firstAct('quarry', Q12)`.
- **What it is for:** a Quarry-Hand, who has no pistol and few pellets, can walk the workings by day to the store, the barracks or Depot Three without a fight. That is the audit's "taken for one of the shift". With the quarry at work on, the walkers are beside you. A shift man spoken to by a Quarry-Hand says Q16 first (a `talk` wrapper on ids `p60_q127_*`).
- **What else listens on E at the quarry's crates:** only `interact`'s label message (`js/game.js` l. 1451). The other crates wrappers are all for `use: 'crates'` (the mast-ladder, `js/game.js` l. 1513, `js/cargo56.js` l. 184, `js/touches71.js` l. 198) or air93's hold (`js/air93.js` l. 294), none on the quarry map.

**Act 2: "Split it on its line"** (systemic; the delves).
- **Offered when:** E with no entity picked, as Quarry-Hand, `Engine.pickWall(1.8)` is a cell with `resonant === true`. The wall pick needs `js/callings127.js`'s own `interact` wrapper: if `tryActs` did not take it, and before the original.
- **Run:** `checkResonantWall(0)`, which opens `resonant` cells only (`js/upgrades.js` ll. 697-698) and gets `js/gates.js`'s dust. Then message Q14. Ordinary `t_glassrock` (the quarry's walls) is never opened by this. The label of every such seam already says "a heavy blow will crack it"; the Quarry-Hand is the one for whom it is true.

**The pumps** (the row's second landing) are in 127b (§3.4).

### 3.3 Flambeau Penitent: rank and intent (designed here, built in 127b)

**The sight** (radius 10), on the Church's figures as staged today:

| Mark | On (keys that exist) | Drawn | From |
|---|---|---|---|
| `rank` | the Inquisitor: `_p55 'crane'`, `'crane2'` (`js/church55.js` ll. 90, 173), `_r43 'crane'` (`js/rite43.js` l. 407), npc `ignatius` (`js/maps.js` l. 410) | Over the head a single red-gold pip `#e8b048`, ringed: he walks alone. The censer's arc dotted under the hand when `cens` is near. | MS 2275 |
| `rank` | the herald `'herald'` | A small sunburst seal on a ribbon, white-gold `#fff0c0` | MS 2303 |
| `rank` | the choir `ch00`-`ch33` | A gold gorget dot at the throat `#e8c860` | MS 2263 |
| `rank` | the sisters `_r43 'sis0'`, `'sis1'` | A gold collar tick on grey | MS 2836 |
| `stave` + `hood` | the Flambeaux `fl0w`…`fl2e` (both modules) | The cage's flame (3 px white-gold flicker over amber), with a thin iron line down to the ground when grounded (the column stopped, `CHURCH55.state().head >= STOP_Y`), or carried high with a ring when it flares. The hood's eye-line: a dim 6-px tick along `e.facing`, which turns amber for 4 s when the hood has turned to you (`p55_heard` just set, or a `r43_strikes` rise). | MS 2265-2271, 2329 |

**Act 1, at the gate (the first landing): "Fall in behind the fire."**
- `js/church55.js` `begin()` (ll. 136-139) gets a third choice as Penitent (P2), through a hook `CALLINGS127.gateChoice(go)` (null for anyone else). Choosing it sets `p127_tail = 1` and puts you at the gate road just inside (ROAD_X + 0.9, 2.0), facing south. Then `go()`, unchanged.
- While the column walks (`tickColumn`, ll. 112-128), your place is the point a pace behind the last row, `(ROAD_X, head − 6.8)`, once its y > 1.5. While you are within 1.6 of it, the LOUD rule (l. 125) does not catch you: "unchallenged for a while". Stray beyond 2.5, strike or sing, and the old rule runs: TX.heard, `p55_heard`, `AUDIT54.log('gate')`. `p127_tail` becomes 2 (you lost your place).
- At the square, before the warrant card, line P5 plays and you are set down at the edge of the crowd (21.0, 18.0). The warrant, the Legionnaires, the chapel and the well-house are untouched.
- **Cost:** the Factor stood on the Greenhall steps (MS 2293): `AUDIT54.log('column')` (BITS 1024 [PROPOSED]; line P6). Harrow saw you go by (P5).
- Nothing in the book's scene changes. The stranger in the column is beneath the Church's notice: "The Pure Note walked where it liked" (MS 2273).

**Act 2, the procession** (systemic, in the Rite): in `js/rite43.js` `onSong` (l. 576), the first strike for a Penitent is answered (P7). `r43_strikes` does not rise, once per game (`p127_stave`). The second loud song counts as now.

**Act 3, under the lid:** `js/touches75.js` l. 96 `lidRest()` gets `&& !(typeof CALLINGS127 === 'object' && CALLINGS127.lidSpared())`, which is true for the Penitent. Rests in town are whole, with line P8 once (`p127_lid`). It is a rule of the calling, like the Cantor's under-hum, not a stat.

**What else listens there:** at the gate only `church55`'s own card and tick (the hook adds, never replaces). In `onSong`, only `rite43`. `lidRest` is read by the two rest wrappers in `touches75` (ll. 186, 203).

### 3.4 The second landings (127b)

- **Clerk at the Malting queue: "Relieve him on the line"** (the row's "believed by a clerk"). The line clerk is `LIFE60` walker `p60_q_clerk` (`js/malting61.js` ll. 244-246). E on him as Clerk (an act; a talk is still offered) opens a card (C1). Choosing it sets `p127_relief = 1`. His `away` becomes `!!F().p61_noticed || F().p127_relief === 1`, so he walks to the front door. While he is away, `tickYard` (l. 278) skips `pendingHeard` and the empty-bench count. After 90 s of play he comes back (`p127_relief = 2`). If four or more are told, he counts, and C2 plays: "Sent on to transit," he believes you, and the yard is never noticed this visit. It is option (c), "[PROPOSED as play]" (l. 18), so no canon changes; Sable is in the clerks' hall in every case. MS 4075, 4868, 4944.
- **Clerk in the Bell Yard and the Cloister (sight only):** `board` marks on `p31_board` decos, with the household's entry number where the book gives one (renn 40,101; aye 39,802; salk 40,991; MS 4510, 4556, 4560) and no number for the rest. `tapes` on the Cloister cloaks (`js/maps.js` l. 889): nine red collar ticks and one collar with holes (`js/data.js` ll. 648-651).
- **Quarry-Hand at the pumps** (`js/rite43.js` l. 531): `R.unhook = { e, t: UNHOOK_SECS * (calling === 'quarry' ? 0.6 : 1) }` with line R1. You take the handle's stroke on your own arm, so the hold is shorter and there may be one more name in the sixty seconds. The eight are still left (the book).

---

## 4. The quarry at work (built in 127)

`js/quarrywork127.js` (`window.QUARRYWORK127`). Everything it stages is transient, non-solid and never saved. Positions come from the maps' own named rooms, so the seeded dungeon is not touched.

### 4.1 Who, where, when

**A. The workings (`quarry` map), through LIFE60** (`LIFE60.add('quarry', roster, opts)` after `buildAllMaps`; the roster is built from `m.named` and `m.entrance`):

| Key | Who | Hours present | Doing | From |
|---|---|---|---|---|
| `q127_dayA` | a quarryman, day shift (`p60_man_drab`) | 6.7 → 17.4 | `carry` shuttle: the entrance crates ↔ the depot's loading terrace foot | MS 1715 (depots), 3294 |
| `q127_dayB` | the same (`p60_man_drab2`) | 6.8 → 17.4 | `reach` at the shaft room's lever, then `hammer` at the scaffold at (18.5, 19.4) from 11 to 13 | MS 1715 (cable-drums, gantries) |
| `q127_dayC` | the same | 6.9 → 17.5 | `rake`: spoil in the store and the corridor east of it | MS 1831 (tailings) |
| `q127_nightA` | a quarryman, night shift | 18.4 → 6.0 | `carry`: the entrance ↔ the store | MS 1725, 1847 |
| `q127_nightB` | the same | 18.5 → 6.0 | `watch` at the pump hall door, facing the pumps | MS 1741 |

Outside those hours each is "home" at the ladder (`m.spawn`). So the shift comes down the headframe ladder and walks to work, and the change at six can be seen from either side: on the rim (life74's existing walkers go in at the headframe, `js/life74-smallplaces.js` ll. 174-177) and below (these come out of the ladder). Names and French are reused from life74 ("A quarryman, day shift", "A quarryman, night shift"); they are the same men. Greets and barks: life74's own where they fit (`cl_dayB`, `cl_nightA`, `cl_nightB`), plus W5-W7 (§5).

**B. The pumps, as decos of the module's own** (not LIFE60: no paths, and the clockwork needs a shared phase):
- **The quarry's pump hall** (the game's own pump floor): at each of the three `pump` decos (`js/maps.js` l. 637), two Hollows in grey (sprite `hollow`, as `js/rite43.js` l. 423 uses) on either side of a long iron handle. That is 6 men. The two Hollow npcs of the map (`js/maps.js` ll. 638-639; one is Umber's "at the pumps") keep their places.
- **The Root-vault casing:** the book's dozen. At each of the four pumps (`js/maps.js` l. 699) two on the handle; at three of them a third standing ready to change, at rite43's third slot `[0, 0.8]` (`js/rite43.js` l. 421). That is 11, and the map's own "Hollow at the pumps" (l. 701) makes twelve (MS 1777). [PROPOSED: the third man of each set changes places with one on the handle every 40 strokes; reduce motion: no change.]
- **The handles:** a code-drawn sprite `p127_handle` (24×6 px: an iron bar `#5a5a60` with a lighter top edge and a pivot post). One transient deco per pump, set between the pair, `solid: false`, `nopick: true`.
- **The clockwork** (presentation only, from `ANIM.T`, inside `animDeco`): a wrapper on `animDeco` (`js/anim.js` l. 251) for decos with `_q127`. Handle: `animLift = 0.06 · sin(2π·T/1.8)`, the same phase for every pump in the room ("a rhythm so perfect it looked like clockwork", MS 1777). Men: `animSY = 1 + 0.035 · s` and `animLift = 0.02 · s`, where s is the sine and the two of a pair are in antiphase (one up, one down: "in pairs, up and down"). Reduce motion: everything at rest. No flashes: no change.
- E on a pump man or a handle: the card `TX.lookPump` / `TX.lookPumpHooked`, `js/rite43.js`'s existing strings ("A man at the pumps" / "Grey smock, both hands on the handle, up and down. You do not look at a pump."), so no new text and existing French.

**C. The rim, under the mast** (the clearing): one figure of the module's own, **the clerk at the headframe** (`p60_man_drab`, a transient deco at (22.3, 5.4), facing west down the track, day and night, slight `watch` sway). He is not a LIFE60 walker, so `LIFE60.add('clearing', …)` is never called a second time (it would replace life74's roster, l. 334). His look card: W8. MS 1707, 2598. Book picture of the rim: the shift going in, the clerk watching the track, the Kestrel at the mast above, and nobody looking up (MS 2576).

**D. The mend:** `js/life74-smallplaces.js` l. 181 and l. 182 get W9 and W10 (§5). French in `tools/i18n/p74-smallplaces.tsv` ll. 64-65.

**The figures' art.** Townsfolk-like, so as `js/life60.js` draws its walkers: `LIFE60.variant('townsman', 'p60_man_drab', 75, 0.35, 0.78)` and `LIFE60.variant('townsman', 'p60_man_drab2', 60, 0.28, 0.7)` [PROPOSED: Consortium drab, a dull olive-grey]. The `p60_man` prefix keeps `npcDef`'s base figure `townsman` (`js/life60.js` l. 174), and `FACES124.skin` keeps the skin and the face (l. 63). The Hollows use the existing `hollow` sprite. No enemies are added, so no five-sprite sets are needed.

### 4.2 Both views

Walkers and decos are ordinary entities: both renderers draw them from `G.ents` and fill their `_screen`. The poses go through `animSprite` / `animSY` / `animLift`, which both read (§1.5). The handle sprite is added with `Engine.addSprite`, as LIFE60's props are (`js/life60.js` l. 69), and both views take it. Nothing is drawn by a CPU post hook (they do not run under R3D, 126D §1.5).

### 4.3 During the quarry's scenes and fights

| Scene | What they do |
|---|---|
| Any live enemy in `chase` in the map (a fight; Tamsin52 stage 1) | `opts.down` true: every walker walks home to the ladder and goes in (LIFE60's DOWN, l. 165). The pump men and handles keep working (Hollows "only wander" otherwise, MS 1779; nobody stops them). |
| The Factor's walk card, tobiah57's book and kit cards, the epigraph sheet near a pump (`js/epigraphs73.js` l. 61, offset (0.9, 0.9) from the pump: our men stand at ±0.55 / +0.45, so they do not overlap; the builder checks) | nothing changes |
| From `rite_started`, `greening`, `escaped`, `part3` or `part4` | `opts.gone`: no walkers, and the module stages no pump men, handles or rim clerk (both shifts are on the rails, MS 2944; then the Greening). `js/rite43.js` stages its own twelve in the Root-vault from its stage 2, ll. 417-428. `js/touches72.js`'s Greening Legionnaires at the quarry gate are untouched. |
| `js/gates.js`'s cave-in (after `bore_broken`, so after the Greening) | gone already |
| `js/heist16.js` Depot Three | its own map (`p16h_depot3`): untouched |

They never block (`solid: false`). They are never enemies: `kind` npc or deco, so no swing finds them (`js/game.js` attack picks enemies). The Quarry-Hand's cover never reads them, and no calling's sight marks them.

### 4.4 The switch

- `GFX.quarryWork`, pushed into `GFX.FX`, with `PRESETS.keep('quarryWork')`. Off in Original; per-frame, so in `LOW_OFF` (`js/presets.js` l. 15) and `cheapOff` (`test/presets.test.js` l. 46): off in Low; on in Medium and above. `GFX.plain()` turns it off with the rest.
- Options row "The quarry at work" (`gfx-quarryWork127`), shown/hidden, added in `renderAccessibilityMenu` as `js/callings126.js` ll. 856-872 adds its own.
- **Off:** `opts.gone` returns true (no walker staged in the quarry; LIFE60's tick returns at once, `js/life60.js` l. 334), and the module stages nothing and draws nothing. So every map's entity list is what it was (check 4). Turned off in play: the module's decos are spliced out, and `LIFE60.stage(G.map)` removes the walkers.
- **Random numbers:** none in the module. LIFE60's own private stream jitters a walker's spot on a snap (ll. 207-208). That is not `Math.random`, and it is consumed only when the switch is on.

### 4.5 The cost

Per frame in the quarry: 5 walkers' LIFE60 tick (a BFS only at a stop change), about 9 extra sprites in the pump hall when in view, and the `animDeco` arithmetic. Estimate 0.2-0.35 ms at 1x. With the Clerk's or the Quarry-Hand's sight (126R measured 0.23-0.59 ms for 12 to 13 marks) the phase stays under **1.0 ms** a frame at 1x in a 12-enemy quarry scene (check 30). `QUARRYWORK127.stats` keeps `staged`, `tickMs`, `animMs`.

### 4.6 One engine change (two lines), for the switch

`js/life60.js` `stage()` (ll. 183-195): before staging, remove any `_life` entity whose key is not in `P.byKey`. The quarry places are new, so it is not needed for them. It is the guard the module's "turned off in play" path relies on if a later phase extends a roster, and LIFE60's own contract wants it. If the builder finds it unneeded once built, it is left out and the record says so.

---

## 5. All new in-game text (English)

French in `tools/i18n/p127-callings.tsv` and `tools/i18n/p127-quarrywork.tsv`, using the glossary (Commis du Catalogue, Main-de-Verre, Étroit, Confins); mended lines in their modules' own pair files (`p74-smallplaces.tsv`, `p54-audit.tsv`), as 126R found the suites read them. **No line is voiced.** None is a book character speaking: the Factor's walk lines are left unvoiced like every `AUDIT54.TX.heard` line (none is in `js/voice-lines.js`). The one recording owed is the renamed bell's death name (§6.2).

**Catalogue Clerk (127)**
- A1 (first sight) "You stand still and read the room the way the Office taught you to read a page: beside every grille, a number stamped in the bronze." [PROPOSED; after MS 4828]
- A2 "Copy it off the bronze" [PROPOSED]
- A3 "The stamp" [PROPOSED]
- A4 "Beside the grille, where the core sits, a serial is stamped into the bronze in the Office's blocky numerals: {0}. You know the run. You filled in the forms for numbers like it, and the voice inside has just told you the rest." ("where the core sits … the serial stamped in the bronze beside it in the Office's blocky numerals", MS 4828; the rest [PROPOSED]). The card shows the existing `js/game.js` l. 1450 line before it.
- A5 "Copy it into your book" [PROPOSED]; A6 "Step back" (existing, `CALLINGS126.TX.back`)
- A7 "You write it small, in a clerk's hand: the number, the name, the place and the day. The bell does not move. It does not need to." (the hand: after MS 2698; "The bell does not move. It does not need to." is `js/audit54.js` l. 51's; the rest [PROPOSED])
- A9 (hint, sight hidden) "E: Copy it off the bronze" [PROPOSED]
- A10 (journal) "I read the Legion the way I was taught to read a docket: the number in the bronze, and the name the voice inside gives up. I copy them into my own book. The bells hear me do it." [PROPOSED]
- A11 (`AUDIT54.TX.heard.stamp`) "Somebody stood at one of my Legionnaires and read its stamp the way a clerk reads a docket, and wrote something down." [PROPOSED]

**Quarry-Hand (127)**
- Q1 (first sight) "You stand still and look the way you were taught to look at a face of stone: where it is sound, where it is sprung, and the line it will split on." [PROPOSED; after `js/data.js` l. 59]
- Q2 "Shoulder it" [PROPOSED]; Q3 "A load" [PROPOSED]
- Q4 "Crates for the depot, stacked where they were left. A hand with a load on his shoulder is a hand at work, and nobody in the workings looks twice at a hand at work." [PROPOSED]
- Q5 "Shoulder it, and walk like you are paid to" [PROPOSED]; Q6 "Leave it." (existing, e.g. `js/church55.js` l. 46)
- Q7 "You get it onto your shoulder the way you did a thousand times down the Flume. It is lighter than a lintel." [PROPOSED; after `js/data.js` l. 59, MS 1711]
- Q8 "You set it down by the drums. Somebody will move it, or nobody will." [PROPOSED]
- Q9 "You drop the load. Anyone watching has stopped taking you for one of the shift." [PROPOSED]
- Q10 "You have walked that crate the length of the workings. A load with nowhere to go stops being work." [PROPOSED]
- Q11 (hint) "E: Shoulder it" [PROPOSED]
- Q12 (journal) "In the workings a hand with a load on his shoulder is a hand at work, and the Legion lets him by. The bells still count him." [PROPOSED]
- Q13 (`AUDIT54.TX.heard.shift`) "A hand who is not on my roster carried a crate the length of my gallery. My Legionnaires counted the crates afterward. There were as many as before." [PROPOSED]
- Q14 "You find the line in the face, set your feet, and hit it once. It splits where you knew it would." [PROPOSED]; Q15 "Split it on its line" [PROPOSED]
- Q16 (a shift man, to a Quarry-Hand) "He looks at your hands, and at your boots, and nods, as if you had been on the next terrace yesterday." [PROPOSED; "the third terrace", MS 3294]

**The quarry at work (127)**
- W1 "The quarry at work" [PROPOSED]; W2 "the shifts, the pumps and the men at them, between the scenes" [PROPOSED]; W3 "shown" [PROPOSED]; W4 "hidden" (existing, `CALLINGS126.TX.optOff`)
- W5 (greet, day A below) "Down at six, up at the Listening Hour. In between, the drums and the spoil, and the bore in your teeth." [PROPOSED; life74's hours]
- W6 (bark) "A quarryman, low: \"Mind the channels. There's glass in them.\"" [PROPOSED; "the glass-channels cut into the stone", MS 1715]
- W7 (bark, night) "A quarryman of the night shift, low: \"Lit all night. It's never dark down here.\"" [after life74's own `cl_nightA` greet, l. 190]
- W8 title "The clerk at the headframe" / text "Consortium drab, ink on his cuffs, a tally-book on the trestle and a lever at his hand. He looks at everyone who comes up the track, at their disc, and for a long moment at their hands. Nobody up here looks at the mast." [PROPOSED; MS 1707, 2598, 2576]
- W9 (replaces `js/life74-smallplaces.js` l. 181) "\"The cable-drums, mostly, and the spoil. The pumps are the Office's men, and they don't talk. The bore's in your teeth the whole nine hours, and you get home and your supper tastes of glass.\"" [PROPOSED; MS 1715, 1777-1779; the last clause is the old line's]
- W10 (replaces l. 182) "A quarryman, low: \"Nine hours on the drums.\"" [PROPOSED]
- Pump men and handles: existing `js/rite43.js` ll. 207-208 strings; no new text.

**Flambeau Penitent (127b)**
- P1 (first sight) "You stand still and see them the way you were taught to: who walks first, who carries, and where every hood is turned." [PROPOSED]
- P2 "Fall in behind the fire, eyes down, as you did for eleven years" [PROPOSED; `js/data.js` l. 50]
- P3 "You go down to the road and wait in the gate's shadow. The choir passes, and the Flambeaux either side of it, and you step in a pace behind the last stave, eyes on the road, as a bearer walks. Nobody turns. The Pure Note walks where it likes, and you walk inside it." [after MS 2273; the rest PROPOSED]
- P5 "At the square you step out of the line and into the crowd before the herald unrolls the warrant. Nobody in red looks round. Old Harrow, at the gatehouse, saw you go by, and does not say anything at all." [PROPOSED]
- P6 (`AUDIT54.TX.heard.column`) "A stranger walked into Oakhaven behind the Inquisitor's fire, at a bearer's pace, eyes down. The Church did not notice. I did." [PROPOSED]
- P7 "A stave of glass-fire turns toward you. You know what it means, and you answer it as a bearer does: eyes down, palms open, a half-step back into the line. The stave turns back to the road." [first sentence `js/rite43.js` l. 97; the rest PROPOSED]
- P8 "You have slept under the Pure Note in a dozen parishes. You sleep under it now." [PROPOSED]
- P9 (journal) "I know the Church from inside: who walks first, who carries, what a stave turned toward you means. For a while I can walk among them and not be looked at." [PROPOSED]

**Clerk and Quarry-Hand, second landings (127b)**
- C1 title "Relieve him on the line" / body "You fall in beside him and say it the Office's way: Form Nine, the line every twenty minutes, name, age, trade, and a second clerk at the door. He looks at your hands, which have ink in the right places, and goes in for his tea." [PROPOSED; MS 4075, 4868]
- C2 "The clerk comes back from the front door and counts the benches. \"Sent on to transit,\" you tell him, \"per the warrant.\" He believes you. He writes it down." [PROPOSED; "the transit warrant", MS 4944]
- C3 (Bell Yard board, appended) "Entry {0}, in the Whisper-Grove run." [PROPOSED; numbers MS 4510, 4556, 4560]
- R1 (the pumps) "You take the handle's stroke on your own arm, so it does not pull him back." [PROPOSED]

The test checks every one of these is in `CALLINGS127.TEXTS` or `QUARRYWORK127.TEXTS` (or its module's `TEXTS`) with a French line, and that none contains "Archivist of the Veil", "Dissonant Blade" or "Consecrated".

---

## 6. The build plan (127; 127b follows the same shape)

### 6.1 Files the builder owns

- `js/callings127.js`: registers `archivist` and `quarry` (and in 127b `penitent`). `window.CALLINGS127 = { TEXTS, TX, FLAGS, validate, serialOf, carrying, shiftCover, stats, (127b: gateChoice, lidSpared, answerStave, reliefChoice) }`.
- `js/quarrywork127.js`: §4. `window.QUARRYWORK127 = { TEXTS, TX, FLAG, on, roster, staged, stats }`.
- `test/callings127.test.js`: Playwright, in the shape of `test/callings126.test.js` (the same `T` helpers, its section runner, the MS reader for book-quoted lines).
- `tools/i18n/p127-callings.tsv`, `tools/i18n/p127-quarrywork.tsv`.
- `tools/dev/shots127.sh` and `.js` (after `tools/dev/shots126.*`).
- `story/Game Layer/Phase 127 - The callings, part two.md` (the record), and an entry in Vol VIII, the README and `ROADMAP.md`.

### 6.2 Existing files to edit, exactly where

| File | Where | Change |
|---|---|---|
| `index.html` | after l. 319 (`callings126.js`), before l. 320 | `<script src="js/callings127.js?v=1"></script>` then `<script src="js/quarrywork127.js?v=1"></script>`. `mast123.js` stays last. |
| `js/callings126.js` | l. 803 | `FIRST[id]` → `(FIRST[id] \|\| (reg && reg.lines && reg.lines.first))` |
| `js/callings126.js` | l. 394 | `if ((isBell(e) \|\| isPress(e)) && echoWaits(e)) return false;` (the proctor echo, §0) |
| `js/callings126.js` | api, ll. 876-880 | export `echoWaits, firstAct, hashStr, h3, bitOf` |
| `test/callings126.test.js` | ll. 127-129 | check 1: `ids().slice(0, 3)` is the three, the dummy is last, and unregistering it gives back the list before. Add check 7b (a Glass-Hand's first E at a proctor, with an unheard echo, queues the echo). Comment naming Phase 127. |
| `js/presets.js` | l. 15 `LOW_OFF` | add `'quarryWork'` |
| `test/presets.test.js` | l. 46 `cheapOff` | add `'quarryWork'` |
| `js/audit54.js` | l. 38 `BITS`; `TX.heard` ll. 57-66 | `stamp: 256, shift: 512` (127b adds `column: 1024`); A11, Q13. If any check pins the number of BITS keys, teach it. |
| `tools/i18n/p54-audit.tsv` | append | A11, Q13 |
| `js/life74-smallplaces.js` | ll. 181, 182 | W9, W10 |
| `tools/i18n/p74-smallplaces.tsv` | ll. 64-65 | their French |
| `js/life60.js` | `stage()`, ll. 183-195 | §4.6 (two lines), only if needed |
| `js/maps.js` | l. 705 | `{ name: 'Mirren Salk' }` → `{ name: 'Cass Yelland' }` |
| `js/voice-lines.js` / `tools/voices/` | the core_voice set (cf. `"core.death.mirren-salk"`, `js/voice-lines.js` ll. 2171-2179) | render `core.death.cass-yelland` with the Kokoro pipeline (`tools/voices/build.py`), as the other bell names are. If it cannot run here, the death name plays unvoiced and the record says so. Leave Mirren Salk's own clip; it is still her name (the crates). |

In 127b: `js/church55.js` (ll. 137-139 the third choice; l. 125 the tail rule), `js/rite43.js` (l. 576 the answered stave; l. 531 the pumps), `js/touches75.js` (l. 96), `js/malting61.js` (l. 246 `away`; l. 281 the skip), `js/grove31.js` (`useBoard` body, l. 320, the C3 append). Each through a three-line hook that is null for any other calling, as 126 did in `js/grafters67.js` and `js/cargo56.js`.

Everything else is a wrapper: `disguiseProtects`, `interact` (walls), `talk` (Q16), `render` (the carried crate), `restoreGame` (validate; the rename mend), `loadMap` (clear `st.carry`), `renderAccessibilityMenu` (W1 row), `animDeco`, `buildAllMaps` (the LIFE60 rosters).

### 6.3 Flags and saves

| Flag | Range | Meaning |
|---|---|---|
| `p127_copied` | 0..99 | bells copied off the bronze |
| `p127_carried` | 0..99 | loads shouldered |
| `p127_split` | 0..9 | seams split |
| (127b) `p127_tail` 0..2, `p127_stave` 0..1, `p127_lid` 0..1, `p127_relief` 0..2 | | |

- First sights and first acts use `p126_seen` / `p126_did` bits 8 and 32 (16 in 127b). No new flag.
- `validate(G.flags)` on every load (wrapping `restoreGame`, as `js/callings126.js` l. 854): anything not a small integer in range becomes 0.
- Not saved: `st.carry` and its timer, the cover, the hint per map, the sight's fade, every walker, pump man, handle and the rim clerk. A save while carrying loads empty-handed.
- **The rename on old saves:** after `restoreGame`, any `G.maps.rootvault` entity with `kind === 'enemy' && type === 'legionnaire' && name === 'Mirren Salk'` is renamed Cass Yelland (`name` is saved per entity, `js/game.js` l. 2576). A ledger entry "Mirren Salk, The Root-vault" from an old kill stays as written: it is that player's history.
- No migration; nothing in setup, hydrate, validate or the rename reads `Math.random`.

### 6.4 First failing checks (written first, seen red)

`test/callings127.test.js`, numbered:

1. `CALLINGS126.ids()` includes `archivist` and `quarry` after the three; `test/callings126` check 1 (taught) is green.
2. First sight: a Clerk standing still among the quarry's bells gets A1 once, and `p126_seen & 8` is set; a Quarry-Hand by a scaffold gets Q1 and bit 32.
3. With `callingSight` off, a Clerk and a Quarry-Hand standing still in the quarry make frames whose hashes equal the run with `CALLINGS126.draw` stubbed out, in the classic view and under R3D.
4. With `quarryWork` off: the entity lists of `quarry`, `rootvault` and `clearing` (kind, id, sprite, x, y, hidden) deep-equal a page with `js/quarrywork127.js` blocked, after loadMap and 300 steps at 10:00 and at 22:00. Frame hashes are equal in both views, and `Math.random` is called the same number of times (spy).
5. `GFX.FX` has `quarryWork`; after `PRESETS.apply` it is false in `original` and `low`, true in `medium`, `high`, `ultra`; `PRESETS.keep` stores it; the row `gfx-quarryWork127` toggles it.
6. Neither new file contains `Math.random` or `Engine.render(`; `js/game.js` is unchanged (its `Math.random` count as `test/strangers125` counts it).
7. Loading the p123 fixture save with both modules draws zero extra `Math.random` calls, and every `p127_*` flag reads 0; `p127_copied = 'x'`, `p127_carried = 900`, `p127_split = -1` all read 0 after `restoreGame`.
8. Clerk sight: each live Legionnaire within 6 and in view has a `stamp` rec, with `serialOf(e)` the same across two page loads. None is drawn for one behind a wall (depth probe), and none for a Glass-Hand, Cantor or Corsair.
9. Every serial over the NAMES_POOL and the map names is `WG-3x,xxx`, in 30,000-38,999, and none equals a canon number (§2.1).
10. Copy it: E at Gethin Coote (idle, 1.0 away) opens "The stamp", whose body starts with the old murmur line (`js/game.js` l. 1450). "Copy it into your book" adds `{ name: 'Gethin Coote' }` to `G.ledger`. Its `state`, `hp`, x and y are unchanged, `G.noise` is no higher than before + 0.05, `p127_copied` is 1, and `AUDIT54.logged() & 256`. A second E gives the old murmur line, not the card.
11. The dreams echo: in a place whose core echo is unheard, the Clerk's first E at a bell queues the echo (`js/dreams.js`) and opens no card; the second E opens the card.
12. Never offered: at Tamsin Reed (`js/tamsin52.js`'s card opens), at a proctor (old line), at the Aegis or any boss, at a transient figure, at a Legionnaire in `chase`, in a boot.
13. Names lit: after the copy, a `name` rec with text `GETHIN` exists for that bell; a bell whose name is not in the ledger has none; proctors get `blank`.
14. The morning walk (next day, 06:00-09:00, in the quarry) shows A11, and `priceMult()` is one step higher.
15. Quarry-Hand sight: each scaffold within 8 has a `timber` rec, whose fall arrow points away from the camera; `t_glassrock` faces within 3.5 give at most 6 `seam` recs; the quarry's crates give `load`; none of these for the other callings.
16. Shoulder it: as Quarry-Hand at the entrance crates, E then Q5 sets `carrying()`. Walking past a placed idle Legionnaire at 3 cells with a clear line for 3 s leaves it `idle`; the same walk as a Glass-Hand (no load) makes it `chase`. `AUDIT54.logged() & 512` is set, and the crates' entity count and positions are unchanged.
17. The cover ends: running, a strike, a loud song, noise 4, being hurt, taking a body, leaving the map, and 120 s each end `carrying()` (Q9 or Q10). The next look of the Legionnaire is a chase.
18. `disguiseProtects(e)` for a Glass-Hand, a Cantor and a Corsair (robed and not, over a set of enemies in each state) deep-equals the result with `js/callings127.js` blocked.
19. Tamsin Reed's three-pace card still opens while carrying.
20. The carried crate's HUD drawing appears only while carrying: frames hash equal to the stubbed run when not carrying, in both views.
21. Split: in a procedural delve's resonant cell, a Quarry-Hand's E at 1.6 empties the cell with Q14. A Cantor's E there changes nothing. A Quarry-Hand's E at an ordinary `t_glassrock` wall in the quarry changes nothing.
22. The quarry at work, at 10:00 in the quarry: `q127_dayA..C` visible and the night men hidden; at 22:00 the reverse; at 06:20 the night men walking to the ladder and none of the day men out yet. Six pump men and three handles in the pump hall: a handle's `animLift` differs between two `animFrame`s 0.45 s of `ANIM.T` apart; under reduce motion it does not.
23. Stand-down: an enemy set to `chase` sends every walker home within 12 s; when it is dead or idle they come back to the hour's stop.
24. Gone: with `rite_started` (and separately `greening`), no walker, pump man, handle or rim clerk is in any of the three maps.
25. The Root-vault casing has eleven `_q127` pump men plus the map's own Hollow; none sits in a solid cell; at `js/rite43.js` stage ≥ 1 there are none.
26. Not in the way: no staged thing is `solid`; the player walks straight through a walker's cell; a swing at a walker does no damage and no crime.
27. life74: `LIFE74` TEXTS no longer contain "on the pumps" or "Twelve men on them"; W9 and W10 have French in `p74-smallplaces.tsv`.
28. The rename: `G.maps.rootvault` has no Legionnaire named Mirren Salk, and has one named Cass Yelland; a save with the old name loads renamed; the crates card still puts Mirren Salk in the ledger; `test/canon32` is green.
29. (in `test/callings126.test.js` as 7b) A Glass-Hand's first E at a proctor, with the place's echo unheard, queues the echo and does not lock the arm; the second E locks it.
30. The budget: `CALLINGS126.stats.ms` plus the module's own frame time (render with `quarryWork` on, minus off, mean over 120 frames) is under 1.0 ms. This is a Clerk standing still in the quarry with 12 enemies placed in view, the walkers and pump hall on screen, Medium, 1x, both views when WebGL2 is there. `Engine.render` runs once per frame (count over 60).
31. Every string in `CALLINGS127.TEXTS` and `QUARRYWORK127.TEXTS`, and the mended and new audit lines, has French in its pair file. None says "Archivist of the Veil", "Dissonant Blade" or "Consecrated". The §5 lines marked from the book are found at their MS lines (verbatim, allowing person and tense where §5 says so).
32. `index.html`: `callings127.js` after `callings126.js`, `quarrywork127.js` after `callings127.js` and after `life74-smallplaces.js`, and `mast123.js` still the last script tag.
33. **Every other calling unchanged:** for Glass-Hand, Cantor and Corsair, a scripted run in the quarry (E at a Legionnaire, at the crates, at a scaffold; a walk past the barracks) gives the same messages, cards and enemy states as a page with `js/callings127.js` blocked. A Clerk's E at the crates and a Quarry-Hand's E at a bell give the old lines.

### 6.5 Suites to run after

`callings127`, `callings126` (taught), `presets` (taught), `audit54`, `life60`, `life74`, `smalllife`, `dreams`, `tamsin52`, `rigging12`, `heist16`, `mast123`, `gates`, `epigraphs73`, `songcraft12`, `greening14`, `greening44`, `rite43`, `boots125`, `canon32`, `r2canon27`, `cargo56`, `church55`, `malting61`, `r5grove31`, `touches75`, `hud11`, `dread`, `cover105`, `sprites21`, `pixelhands110`, `pixelhands111`, `strangers125`, `own124`, `text121`, `story-i18n`, `voices`, `voice-acting`, `law`, `foundation`, `phase1-integration`, `desktop`. Alone: `r3d21` (it picks entities in the quarry and the clearing, and its seeded trace runs in the Deep Woods), `light21`, `gpu18`, `fold113`, `deepsky113`, `visual`. Then all 232 suites once on the final commit, one runner at a time (126R: two runners gave false reds; `net19` was already failing on that machine). Then `tools/i18n/coverage.js`.

### 6.6 Pictures to take

Medium, 1x, `screenshots/p127-*.jpg` (JPEG q 85) through `tools/dev/browser.sh`, each scene in a page of its own (126R's lesson):

| Picture | View | What |
|---|---|---|
| `clerk-stamps-classic`, `clerk-stamps-3d` | both | the barracks: Gethin Coote's stamp legible, a farther bell's plate only, one bell behind a wall not marked |
| `clerk-card` | either | "The stamp" card |
| `clerk-name-3d` | 3D | a copied bell with its name lit; a proctor's blank plate |
| `quarry-timber-classic`, `quarry-timber-3d` | both | the scaffold at (18.5, 19.4): the sprung leg and the fall arrow |
| `quarry-seams-3d` | 3D | glass-rock faces in the quarry, faint lines; and a delve's resonant seam, bright |
| `quarry-shoulder-classic`, `quarry-shoulder-3d` | both | carrying: the crate on the shoulder, walking past an idle Legionnaire |
| `work-day-classic`, `work-day-3d` | both | 10:00 in the workings: the day shift at the drums and the spoil |
| `work-night-classic`, `work-night-3d` | both | 22:00: the night shift, the pump hall door |
| `work-pumps-3d` | 3D | the pump hall: three handles mid-stroke, the pairs in antiphase |
| `work-rootvault-3d` | 3D | the casing: the dozen at the pumps |
| `work-rim-0620-3d` | 3D | the rim at 06:20: the day shift going in at the headframe, the clerk, the mast and the Kestrel above |
| `off-classic`, `off-3d` | both | `work-day` with `quarryWork` off, beside the on shot |

### 6.7 Size

One builder, one phase: about 650 lines in `js/callings127.js` (two callings and the font), about 380 in `js/quarrywork127.js`, about 25 lines across ten existing files, 33 checks, about 35 strings with French, 19 pictures, and one voice clip. That is about Phase 126's size. 127b is about half of it: about 300 lines, 5 hooks, about 15 checks, 8 pictures.

### 6.8 Moved to 127b

The Flambeau Penitent (§3.3); the Clerk at the Malting, in the Bell Yard and the Cloister (§3.4); the Quarry-Hand at the pumps (§3.4). The same mechanism serves them. They are cut because their maps are the Church's and the Office's, not the quarry's, and one builder cannot also carry their scenes' tests in this phase.

---

## 7. Questions for the owner

1. **The headframe's wheel.** In the book the cage goes down on its cable (MS 1767). The game's headframe and its sheave are static geometry in the 3D view (`js/eaves78.js` ll. 901-912). Turning the wheel when the shift changes would mean making that part of the mesh move, in the 3D view only. Do you want it as a later piece? It is not in 127.

Decided without asking, in keeping with the books and "a good game with a good story":
- The cut by place (127 the quarry, 127b the Church and the Office), so the visual heart comes first.
- The Clerk's first landing is the quarry's bells, not the Malting, so a Clerk has something on day 1.
- No ladders with men on them. The book's quarry has a cage, terraces and steps, and the game's ladder is a portal.
- The Root-vault Legionnaire named Mirren Salk is renamed, because the book has her core in the Kestrel's hold.
- Life74's quarrymen no longer work the pumps: the book gives them to the Hollows.
- The Quarry-Hand's cover lets the workings be walked by day, at the cost of the Factor's walk, her prices and the Rite's eye.
