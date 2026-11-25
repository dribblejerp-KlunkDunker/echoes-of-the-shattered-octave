# Phase 125b: in their boots (design, for the builder)

24 November 2026. Design lead's file. Nothing in the repo was changed to make it. Built from `story/Game Layer/Phase 125 - Who the traveller is, and in their boots (design, for ruling).md` (the plan, §3 and §5), the moments brief, the 125a record and the Rulings of 24 Nov, and checked line by line against the manuscript.

**MS** = `story/Books/Book One - The Silenced Province/Book One - The Silenced Province (full manuscript).md`. Every MS line below was read for this design unless it says "(brief)". Code lines are as they stand on `main` at `eeb23d2a`.

**Where the book and the plan differ, the book wins. It wins in seven places:**

1. **Vane cuts with the axe, not a knife.** The plan's "the line and the knife" is wrong: "Vane took the axe out of Mags's hands" (MS 3752), and "He stood at the rail with the axe still in his hand" (3798).
2. **Lyra does walk out past the last lamp.** The plan says she must never "leave the ring past the last lamp", but "She walked out past the last lamp at the second hour and stood in the moss between two silver willows" (6040). What she must not do is walk *further out*: "it will do everything it can to make me walk further out" (6028), and the Wearer says "Come out of the lamps, lark" (6084).
3. **The strike at the coda is Kaelen's.** In the book Lyra says "You get one strike" while "She looked at Kaelen" (6028), and Kaelen and the Aegis strike (6098). The game rewrote this as "She looks at you" (`js/coda.js` l. 302) and gives the traveller the blow (`ringShield`, l. 330). That comes out along with the traveller-sings coda.
4. **"Say something" / "No." is Kaelen's exchange, not the traveller's** (6142-6148). `ringAfter` (l. 397-408) hands his "No" to the traveller. It comes out too.
5. **The coda is "the long low close that goes under the floor"** (6044). The game plays a bright rising six-note phrase for it (523-784 Hz; `js/coda.js` l. 72 and l. 360). The book gives no notes, but it does say long and low, so the high phrase goes.
6. **The Hold is meant to last four hours, and what is on the page is minutes** (ruling (a) below).
7. **The Factor never catches Kaelen at the plate.** "nobody stopped him" (3186), and her "step away from the drum" comes only after the coil is seated (3248-3250). The Rite's lenses Echo (`boltsLost`, l. 163) is the same kind of invention as Crane seeing the needle, and it goes with it.

---

## 1. What exists today

### 1.1 The six moments in the code

| Moment | Where it is played | What the player does today | Who does the hero's part |
|---|---|---|---|
| The needle (ch. 10) | `js/rite43.js` stage 3: `startNeedle` l. 472, `blocked` l. 476-484, `tickNeedle` l. 486-508; constants `NEEDLE_SECS = 12, NEEDLE_SEEN = 4` l. 280 | Stands in the line between Crane and Kaelen's glass hand for 12 s. If Crane "sees" for 4 s, an Echo (`needleSeen` l. 144, `echoNeedle` l. 146, voice `ignatius.rite.notch` l. 258) | Kaelen is an NPC figure (`stageVault` l. 417-451, `V.kaelenStool`) |
| The Hold (ch. 10) | stage 4: `tickHold` l. 510-535; Lyra's 174 drone l. 513 | Hums beside the stool so the Factor's lenses stay on the player (`holdGo` "Hum beside the stool." l. 152, `holdHint` l. 153) | Lyra, as an NPC |
| The eight bolts (ch. 10) | the same `tickHold`: `R.bolt` runs to `BOLT_SECS = 51`; lenses on the plate for `WATCH_LIMIT = 18` s is an Echo (`boltsLost` l. 163, `echoHold` l. 147, `voskTurns` l. 162) | Nothing at the drum | Kaelen at the drum (`R.kaelenAt = 'drum'` l. 501) |
| Sing it down (ch. 10) | `singDown` l. 536-550: `REEDS.holdPitch` on the curve 174, 116, 174, 116 over 9 s | Sings "a hand's width of voice under hers" (`fifthGood` l. 170; that phrase is the town's hum at the procession, MS 2930 (brief), not the Hold) | Lyra |
| One to Ten (ch. 12) | `js/rope45.js` stage 5: `startCount` l. 341, `tickCount` l. 351-360 (`TICK = 1.7` l. 192), `atTen` l. 361-371, `holdDrum` l. 372-375, `cut` l. 378; texts `c1`-`c10` l. 129-138; voices `vane.rope.n1`-`n10`, `kaelen.rope.doit` | Looks where they like (`countHint` l. 128). Holding the drum at Ten is an Echo (the Tide-Weaver's, `TX.echo`) | Vane |
| The three names (ch. 16) | `js/manifest53.js` `begin` l. 52-59, `read` l. 61-66; texts l. 39-49 (cut-down copies of MS 4556-4564) | Presses "…" through three cards while "standing with" Vane | Sable, in a card; no figure, no voice |
| The coda (ch. 23) | `js/coda.js` the ring: `RING` l. 280, `ringPlan` l. 295-303, `ringEnter` l. 304-315, `ringAbort` l. 316-326, `ringShield` l. 327-333, `ringTick` l. 335-374, `ringVoices` l. 375-385, `ringKill` l. 386-396, `ringAfter` l. 397-408; triggered from `js/data.js` `lyra_dw.quest` l. 973-1001 | Waits inside the lamps and strikes once (`ring_struck = 'you'`). **Or, if Lyra has no voice, sings the office past the last lamp (`coda_by_you`)** | Lyra (or the traveller) |

The Mausoleum's "Unended Office" (`codaTrigger` l. 248-271) is a second, game-made coda after the ring. It also has a traveller-sings branch (l. 265-269).

### 1.2 The grey slip already exists

`RITE43.echo(body, after, title, go)` (`js/rite43.js` l. 53-56, exported l. 755) sets `canvas.style.filter = 'grayscale(1) contrast(0.9)'`, shows a card titled "An Echo" with an "Again" button, and runs `after` when you press it. `rope45` already uses it (l. 366). `onLoad` clears the grey (l. 678). **Every slip in 125b uses this function. Do not build a second one.**

### 1.3 Hands and looks

- `GEARLOOK21.of(p)` (`js/gearlook21.js` l. 355-376) builds the LOOK that every first-person hand reads: skin from the face, `glassArm: !!p.glassed` (l. 368), sleeves from the body armour or the calling's coat, the readied weapon.
- `js/body21.js` draws the first-person pictures. Under the 3D view (R3D) it records each one into `REC` (`put2` l. 950-957) and the R3D `body` pass draws the record (`bodyPass` l. 1412-1447). With the switch on, the sculpted hands (`js/sculpted112.js`, `place` l. 919, `flush` l. 965-1040) are posed from `PIXELHANDS110.poses` (`js/pixelhands110.js` l. 932). There are three hand poses: `'fist'`, `'glassfist'` and `'open'`. There are also weapon grips (`'w'`, any `WEAPONS` id, including `axe`, the "Boarding Axe", `js/data.js` l. 163), the climb's two fists on a rung (`'c'`), and the arm behind a shield (`'o'`).
- The readied weapon comes from `currentWeapon()` (`js/game.js` l. 674).
- The switch for the sculpted hands is `GFX.sculptedHands` (Phase 122). New Options switches register with `GFX.FX.push(FLAG)` and `PRESETS.keep(FLAG)`, as `js/faces124.js` l. 24-28 does.

### 1.4 Flags and saves now

- Rite: `r43` (stage 0-7), `r43_echoes`, `r43_fifth`, `r43_fuse`, `r43_calls`, `r43_marched`, `bore_seated`.
- Rope: `r45` (stage 0-7), `r45_hold`, `r45_echo`, `r45_saw`, `r45_way`, `r45_cut`.
- Manifest: `p53` (9 means in progress, 1 means seen), `p53_deck`.
- Coda: `ring_set`, `ring_go`, `ring_back`, `ring_fight`, `ring_t`, `ring_sung`, `ring_w`, `ring_struck` ('you' | 'kaelen'), `ring_sat_no`, `ring_sat_kind`, `coda_go`, `coda_done`, `coda_fight`, `coda_t`, `coda_sung`, **`coda_by_you`**, `lyra_voice`, `lyra_dw_met`, `lyra_requiem`, `requiem_done`, `wearer_coda_dead`.
- `coda_by_you` is read by `js/coda.js` (l. 66, 68, 73, 119, 145, 258, 262, 265-269, 285-286, 300-302, 313, 323, 325, 338, 341, 347, 354-355, 361, 389-393, 399-402, 432-433), `js/data.js` l. 989-995, `js/epilogue.js` l. 101-102 (`lb_you_sang`), and by the tests `test/canon32.test.js` l. 242 and 280 and `test/epilogue.test.js` l. 65-66, 257, 310.
- Old saves are migrated by wrapping `restoreGame` inside a module. `js/mast123.js` l. 339-376 is the pattern (`migrate(old)`, a stamp flag written by a `snapshotGame` wrapper). `js/mast123.js` is the last script tag (`index.html` l. 318) and stays last.

### 1.5 Voices

- Recorded lines live in `voices/script.json` (hand entries, plus `auto` entries from Phase 102). They are rendered by `tools/voices/build.py` (Kokoro-82M through kokoro-onnx), which also writes `js/voice-lines.js` ("Generated … Do not edit by hand", its l. 1).
- An automatic line's id is the speaker plus a sha1 of its text (`tools/voices/extract.py` l. 85, `h(s, n=6)`). Change the text and the id changes; `build.py` renders only what is new and removes recordings whose line has gone (Phase 102 record, step 3).
- The Rite and the rope play their own hand-cast voices through `VO` tables (`js/rite43.js` l. 253-270, `js/rope45.js` l. 27-41).
- Hero voices that already exist: `kaelen.rite.slippage`, `kaelen.rite.spanner`, `kaelen.rite.holdon`, `kaelen.rite.singitdown`, `ignatius.rite.*`, `tobiah.rite.span/matching/call1/call2/whatsthat`, `vosk.rite.markit`, `lyra_fortunate.rite.fortunate`, `vane.rope.n1`-`n10`, `kaelen.rope.doit`, `wearer.coda.*`.
- Not voiced anywhere: Sable's three entries, Vane's "Go on, then", Lyra's ring lines ("I know.", "I know it's a two-voice part.").

---

## 2. What the book gives for each moment

Shared rules for every moment:

- **The caption is the book's own narration, verbatim, in the book's past tense and third person.** It runs as the player acts. The player is the hero; the words stay the book's.
- **On-screen text is only the lines marked B** (book, with line). Anything else is marked [PROPOSED] in §6.
- **No hero's thoughts appear unless the book gives them at that point.** The book never enters Lyra's head during the Hold. The Hold is told from Kaelen's side (3126-3140).
- **A slip is a grey Echo** (§1.2). Its card says "That is not how it went." [PROPOSED], then the book's own line for what the hero did. It **never** says what anyone else would have done, because the book never says. After "Again" the beat starts over from its own start. **After two slips on the same beat, the beat plays itself** [PROPOSED]: a slip never changes what happens, and a player who cannot do it is not stuck.

### 2.1 Kaelen: the needle (MS 3040-3110)

**Beats:**
1. The case: "the brass collar, and the four tuning pegs, and the ivory spool of copper wire, and the long silver needle curved like a new moon" (3040).
2. "'Engineer,' said Ignatius Crane." (3042). He kneels and picks up the needle; "They were shaking." (3044-3046).
3. Lyra "offered him her throat. *Get on with it.* He got on with it." (3068-3072).
4. "'Closer, Engineer,' said Ignatius Crane, from the catwalk. 'I must be able to see.'" (3074). Kaelen angles his shoulder; the glass hand goes "flat against the side of her neck, thumb along the line of the muscle … The glass was cold. She flinched and made herself still." (3076).
5. The collar goes on "to the second notch, which was one notch looser than it should have been" (3078).
6. "Kaelen put the needle in a fold of skin. He did it fast, because slow would look wrong: caught a pinch of skin … with the glass thumb, drove the needle through it, brought it out, and drew the copper wire after it with a little jerk" (3084-3086). "Lyra's whole body went rigid. Her hands closed on the edges of the stool until the knuckles went white." (3086).
7. "Blood came at once." (3088). "*Good*, Kaelen thought … *It has to bleed.*" (3090).
8. Knots at both eyelets; "set the pegs — one, two, three, four — turning each a half-turn" (3092).
9. "The Inquisitor came down the ladder from the catwalk." (3094). He looks from a foot away; "Kaelen did not move. He could hear his own arm ringing under the felt, high and fast." (3096).
10. "'Blood,' said Ignatius. … 'Good. It should bleed a little at the seating. The Foundry girls used to bleed for days.' … 'Speak, daughter.'" (3098). "'I. Am. Fortunate.' One hundred and seventy-four, all the way through. Not a hair off." (3104-3106).
11. "Kaelen had to put the heel of his right hand against the boards for a moment." (3108). "'She is,' said Ignatius Crane, pleased, and blessed her with two fingers, and went back up the ladder." (3110).

**Hands on screen:**
- The left glass hand, with the felt sleeve over the arm ("ringing under the felt", 3096; the sleeve laced at the shoulder, 646).
- The right hand bare, holding the needle. **Which hand holds the needle is not in the book** (3064 says only "in his fingers"); right is [PROPOSED].
- The tuning key at step 8 (3092).
- **The hands shake the whole time and cannot be steadied** (3046, 3062). Draw a hashed tremor that no input changes.

**Inputs (two):**
- (A) Hold the use key to pinch with the glass thumb; release it to drive the needle (step 6).
- (B) Four presses, one for each peg (step 8).
- Everything else plays: Crane's walk, his words, Lyra's line.

**Slips:**
- Holding the pinch longer than 1.6 s [PROPOSED] → grey, with "He did it fast, because slow would look wrong" (3086).
- Moving (any move key) while Crane is crouched a foot away (step 9) → grey, with "Kaelen did not move." (3096).

**Never:**
- Put the wire through her voice. No input aims anywhere but the fold of skin (3084; plan 2497 "SO DON'T THREAD IT").
- Steady his hands (3046).
- Know what Stage 9 is for. Nothing about the fuse appears here; he reads the margin "as a note about the machine" (3152).
- Any word between him and Lyra. She cannot speak, and he says nothing (3068, 3100).
- **Any line in which Crane sees the trick** (the book: he is "satisfied", 3098, and "pleased", 3110).

### 2.2 Lyra: the Hold (MS 3114-3140, 3216-3242)

**Beats, part one:**
1. "The Hold began at noon." (3114). Tobiah: "Head at one span! One span and holding!" (3116). Crane: "One note," … "One law. One hand." (3118). "The chain creaked." (3120).
2. "And Lyra Ashgrove … began to sing. One hundred and seventy-four. Clear, and hoarse, and absolutely steady." (3122-3124).
3. "The Root heard her in the first minute." (3128). Tobiah: "Pitch coming up … It's coming up to her, sir. It's — gods, look at it — it's matching." (3132). The Factor: "Mark it," (3134). "The lullaby stopped." (3136).
4. Then out to Kaelen's boots (§2.3).

**Beats, part two (back into her boots when the lock throws):**
5. "The lock threw." (3208). The drum screams; the crown snaps "with a crack that went through the chamber like a bell breaking" (3210).
6. Crane: "*The hold! … Hold the note! Daughter — hold the note!*" (3218). "the last thing a Cantor does is stop." (3220).
7. Kaelen: "LYRA! *SING IT DOWN!*" (3228).
8. "She let it fall." (3232). "the Root note sliding down a whole fifth, slow as a leaf coming off a branch … and then climbing, and falling again" (3234). *Down. Go back where you came from.* (3234).
9. The Root "let go of the question." (3240). "the lullaby start up again. Badly. Stumbling." (3242).

**Hands on screen:** the book does not describe them while she sings. [PROPOSED]: both hands on the edges of the stool, at the bottom of the view, as they were at the needle (3086). Sleeves are the white wool shift (3088, 3122).

**Inputs (two), both through `REEDS.holdPitch` (the pitch-holding minigame, up and down keys, `js/reedcraft.js` l. 268):**
- (A) Hold 174 from "Head at one span": a flat curve, 22 s in part one [PROPOSED] and 6 s in part two, through the lock.
- (B) At the cue, the fifth: the existing curve (`rite43` l. 541), which is down, up, down, as 3234 gives it.

**Slips:**
- Leaving the band before the cue (a holdPitch score under 0.5 for A) → grey, with "the last thing a Cantor does is stop." (3220).
- Falling before "SING IT DOWN" → grey, with the same line.

**Never:**
- Speak. There is no speech input. Her only words are at the needle, "I. Am. Fortunate." (3104).
- Break the note before the cue (3220).
- Show her thoughts (the brief's rule; 3126-3140 are Kaelen's).
- Show a pitch meter or score text on screen. The holdPitch band is the game's existing control and stays; no number is printed.

### 2.3 Kaelen: the eight bolts (MS 3126, 3138-3204)

**Beats:**
1. "Kaelen stood at the calibration rail with his toolbag at his feet" (3126). His thought, 3126 (the four hours as what lies *ahead*), and "She was not the hand that steadied the patient. She was the fuse." (3158-3160). This is where he understands it, so it belongs here and not in the needle.
2. "Kaelen picked up his toolbag and walked along the collar walk to the drum." (3172).
3. Tobiah: "Sir, the readings are perfect, they've never been—" (3176). Kaelen: "Slippage on the lock," … "I can hear it." (3178). "He could not … the lock was singing like a bell in tune." (3180). "Spanner. Sit on the rail there and call the pitch to me every ten seconds." (3184).
4. "The plate over the phase port had eight bolts. He had promised himself forty seconds and he took fifty-one … and nobody stopped him, because he was the supervising engineer, and he was doing what supervising engineers do." (3186).
5. "The plate came off. He laid it down quietly." (3188).
6. "He put his hand into his toolbag and took out the reverse-phase coil." (3192). Tobiah: "Sir, what's that?" (3194). "He had perhaps two seconds and one sentence." (3200). "You'll want to hold onto something." (3202). "And he seated the coil in the port." (3204).
7. Out to Lyra's boots (part two, §2.2 beat 5).

**Hands on screen:**
- The right hand with the spanner [PROPOSED]. The book does not say which hand works it; the glass hand is "no good for fine work" (608).
- The left glass hand on the drum's brass, laid flat with no turning.
- Then the coil in the right hand.

**Inputs (two):**
- (A) Walk the collar walk to the drum (movement). At the drum, kneel with one press; the eight bolts then come out in 51 s by themselves, with Tobiah calling the pitch at 10, 20, 30, 40 and 50 s (3184). There is no timer or bolt count on screen (the brief: "Not in the book").
- (B) When Tobiah asks "Sir, what's that?", one choice only: "You'll want to hold onto something." Choosing it seats the coil.

**Slips:** none. The book gives none at the bolts: "nobody stopped him" (3186). **The lenses Echo is removed** (§4c).

**Never:**
- Warn Tobiah beyond the one sentence (3200-3202).
- Show the Factor or the Golems acting before the coil is in (3248-3250).
- Name a bolt count or a time on screen except the book's own sentence at step 4.

### 2.4 Vane: One to Ten (MS 3716-3810)

**Beats:**
- "*Take her up*," Vane said. (3716). "She went sideways." (3720).
- "It happened the way it always happens: slowly, and then in about ten heartbeats." (3724). The rope snags (3728). "Everything after that was arithmetic." (3730). Pennick: "The drum — Captain, the drum's coming out of the *deck*—" (3732).
- The count, verbatim:
  - *One.* (3734) "Twenty-one people on the deck. Nine of them children. A boy in the hold with his ear against a crate." (3736).
  - *Two.* (3738), then 3740.
  - *Three.* (3742), then 3744: Mags "was not going to swing it without an order, because she never had."
  - *Four.* (3746) "The deck-beam under the drum went off like a musket." (3748).
  - *Five.* (3750) "Vane took the axe out of Mags's hands, because if it was going to be anyone it was going to be him." (3752).
  - *Six.* (3754), then 3756.
  - *Seven.* (3758) "Aldric Vance looked up." (3760), then 3762.
  - *Eight.* (3764), then 3766.
  - *Nine.* (3768) "'Do it,' said Kaelen." (3770).
  - *Ten.* (3772) "Vane cut the line." (3774).
- After: "She came up like a cork." (3778), 3780, "Vane kept his feet, because he had the rail." (3782), 3784, 3798, 3804, 3808-3810.

**Hands on screen:**
- Both hands on the rail ("leaning over the rail", 3710; "he had the rail", 3782). [PROPOSED]: use the climb's two-fists pose (`'c'`) as the grip on the rail.
- From Five, the Boarding Axe (`'w'`, `axe`).
- He keeps the axe in his hand after the cut "until Mags came and took it off him" (3798).

**Inputs (two):**
- (A) At Five, take the axe (one press within the Five beat).
- (B) At Ten, cut (one press).

**Slips:**
- No take by the end of Five → grey, with 3752, then back to Five.
- Cutting before Ten → grey, with "*Ten.* Vane cut the line." (3772-3774), then back to the number where it happened.
- No cut within 2.5 s of Ten [PROPOSED] → grey, then back to Nine with "'Do it,' said Kaelen." (3770). This is the existing back-to-Nine of `atTen` l. 365, now for Vane.

**Never:**
- Save the five. Nothing lets the line stay.
- Hesitate past Ten. The no-cut slip covers it.
- Laugh. After the cut, the Song or shout key shows only "Nothing came up at all." (3804).
- Name Vesper, the hulk or "forty-eight men". Book One gives only "Forty-eight" (1685, brief).

### 2.5 Sable: the three names (MS 4538-4572)

**Beats:**
1. Sable: "I want to do something for you …" (4538). "Read you three." (4542). Then 4546.
2. Vane: "'Go on, then,' he said." (4550). Step into her boots here.
3. "The Bound Ledger came round in front of her and opened itself, and she did not look at it." (4554).
4. Corwin Aye, the whole of 4556 (including "He was pressed in the second room because the first room had a queue." and "He carried in the second consignment, Captain. Your sixteen crates."). "She paused exactly long enough." "Vane did not move." (4558).
5. Mirren Salk, 4560. "Sable's voice stayed perfectly flat." "The lantern hissed." (4562).
6. Annet Sowerby, 4564, whole.
7. "Vane heard, from somewhere very close by, the sound of a man's breath going out of him and not coming back in. It was his own." (4566-4568). Vane: "She's in the third crate … He's asleep against that crate right now." (4570). Sable: "I know," … "Your engineer told me. It is why I came up the ladder." (4572). Step out; the existing "Filed" card follows.

**Hands on screen:**
- Her good hand flat on the lid of the third crate ("She put her good hand flat on the lid", 4518, just before; the book does not move it).
- The other arm held against her body (4480).
- **Which arm is broken is not in the book.** [PROPOSED]: the left is held, because the Ledger hangs "at her left elbow" (4482) and the book never shows her use the left hand.
- The Ledger is a code-drawn open book floating in front of her below the eye line (4554; "at the height of a writing-desk", 4089, brief). **It is seen only by looking down, and looking down is the slip.**

**Inputs (two):**
- (A) One press to read each entry. The order is fixed; no choice is offered.
- (B) Keep the eyes up: the look must stay above the Ledger.

**Slip:** the look dropping more than 12° below level [PROPOSED] during an entry → grey, with "she did not look at it." (4554), and the entry again.

**Never:**
- Read in any order but Corwin Aye, Mirren Salk, Annet Sowerby.
- Look down.
- Comfort ("it is not a kindness", 4538). Her voice "stayed perfectly flat" (4560).
- Touch a sphere (4508).
- **Pay a price.** The Ledger costs her nothing in this scene; the price comes at the press (brief, 5048). No fragment is spent.

### 2.6 Lyra: the coda (MS 6022-6152)

**Before her boots (a card, as now):** the plan (6024-6036), with **"She looked at Kaelen."** (6028), not "at you".

**Beats in her boots:**
1. "She walked out past the last lamp at the second hour and stood in the moss between two silver willows with her hands at her sides. And she sang her father's funeral." (6040-6042). "She sang it in a voice like a torn sheet, in the dark, badly, at full volume." (6048).
2. *Tobin Ashgrove of the orchard rows. Son of Mara. Cantor of Oakhaven.* (6050). "The wood went quiet." (6052).
3. *He sang the births. He sang the burials. He hummed off-key on the fourth bar and he never once learned better.* (6054). 6056.
4. *He went out into the yard so the hounds would follow him and not the house. He was fifty-six years old. He was afraid of ladders and nothing else.* (6058). "And somewhere out in the dark, perfectly in tune, her father's voice began to sing the second part." (6060).
5. 6066, "for eight bars Lyra Ashgrove and the thing that had eaten her father sang his funeral together in the dark."
6. "It came between the trunks at thirty feet" (6072). *"Lark," … "Oh, lark. You never sang it for me."* (6074). "'I know,' said Lyra, and kept singing." (6076). *"I waited."* (6078).
7. "Third part. The naming." She sings "her father's name into the dark four times" (6080). On screen: *Tobin Ashgrove.* four times. "Twenty feet. Fifteen." (6082).
8. *"Come out of the lamps, lark," … "I can't come in there. Come out to me and I'll sing the rest with you. You can't do the close on your own, you know you can't, it's a two-voice part—"* (6084). "Ten feet." (6088).
9. "'I know it's a two-voice part,' said Lyra Ashgrove. And she sang the coda alone." (6090-6092). **No words for the coda, on screen or in sound.**
10. "It came apart four feet in front of her." (6096). Kaelen and the Aegis strike (6098). The burst, 6102-6124: the five voices and her father, with "did not cover her ears" (6120) and *"Lark—"* (6124). "And then the clearing was quiet, and there was nothing in the moss in front of her at all." (6126).
11. Step out. The after card is 6130-6152, the book's words, one button.

**Hands on screen:** none. Her hands are "at her sides" (6040, 6120), so they are below the view. Looking down shows the legs view as it already does.

**Inputs (two):**
- (A) Walk from the last lamp to the spot between the willows (movement). Then stand.
- (B) Hold the Song key from the first line to the end of the coda.

**Slips:**
- Moving more than 1.3 from the spot (the existing `coda_by_you` radius, l. 338) → grey, with "it will do everything it can to make me walk further out" (6028). Back on the spot, at the start of the part.
- Releasing the song → grey, with "'I know,' said Lyra, and kept singing." (6076).
- **The old fail ("It goes away. It will come back in a week", `ringAbort`) is gone.** It changed what happens.

**Never:**
- Walk further out. The slip covers it.
- Stop singing.
- Cover her ears. There is no input for it; the hands stay down.
- **Strike.** The strike is Kaelen's and the Aegis's (6028, 6098).
- Forgive Kaelen on screen. The card says "did not forgive him either" (6152).
- Know her father's last act before the burst (6116).

**Sound:**
- The office is sung at about 138 Hz, from "two tones lower than it had been" (5970), on 174 [PROPOSED].
- The Wearer's line is a fifth below (6066), about 92 Hz [PROPOSED].
- The coda is one long low note falling slowly, from 6044's "long low close that goes under the floor" [PROPOSED]. No melody.

---

## 3. When each moment is played

The game already reaches every one of these events. No new way in is needed.

| Moment | Entry point (code) | Exit |
|---|---|---|
| Needle | `rite43` `startNeedle` (l. 472), reached from the `lullaby` card's button (l. 137). Step in at Crane's "Engineer" | After 3110. The existing `needleTitle` card is replaced by the boots, then the `hold` card |
| Hold, part one | the `hold` card's button (`holdGo`, l. 152) | "The lullaby stopped." Straight into the bolts |
| Bolts | inside the same stage 4 | Seating the coil. Then `setStage(5)` and `TX.lock` as now, shown as the step into Lyra's part two |
| Hold, part two and the fifth | `lockGo` (l. 167) → `singDown` (l. 536) | Then the `fifthTitle` card with the book's text (§6), then the Golems as now (stage 5 is the traveller's again) |
| One to Ten | `rope45` `startCount` (l. 341) after `lastLoad` | `cut()` (l. 378). The after card is the book's (§6), then `finish` |
| Three names | `manifest53` `begin` → the `three` card → "Stand with him" (l. 55) | 4572. Then the existing `filed` card |
| Coda | `ringEnter` (l. 304): when the traveller walks into the ring trigger after `ringPlan`, Lyra steps past the last lamp and the player is in her boots | The after card. `ringKill`'s bookkeeping (flags, journal, `codaCheckHerald`) runs as now |

**Where the traveller stands:**
- When stepping in, the traveller's camera (x, y, dir, pitch) is stored. When stepping out, it is restored.
- At the coda, the traveller is with the others, "back here where it can see that you are" (6024). The restore puts the camera at the camp side of the ring [PROPOSED].
- The hero's own figure is hidden while the player is in their boots, and shown again after: rite43's `kaelen` and `lyra` figures, Vane on the deck, the ring's `lyra_dw` (`ringLyra`).

**Stand down** (play as the code does today) for a co-op guest (`SYNC19.isGuest()`) and inside an extra (`EXTRAS17.inExtra()`), as `manifest53` already does.

---

## 4. The rulings on (a) to (g)

### (a) The Hold's length

**What the book says, for and against:**
- The Hold is planned and believed to last four hours: the Factor, "Four hours. The collar is removed afterward." (793); Aldric, "It's four hours." (827); Crane, "Four hours, not three hundred days." (2369); Rooke, "adequate for four hours" (2856); Kaelen at the rail, "she had four hours of it ahead of her" (3126).
- Kaelen himself does not believe the four hours: "It isn't four hours. I told you what it is." (2455), against Lyra's "Four hours." (2453).
- The four-hour Hold happens only in the untaken thread: "four hours and nineteen minutes" (6459).

**What is on the page:**
- "The Hold began at noon." (3114).
- "The Root heard her in the first minute." (3128).
- His understanding, the walk, and the bolts, "fifty-one" seconds (3186). The coil goes in and "The lock threw." (3208). The wire then comes out of her skin "easily" (3308).
- No sentence in 3114-3242 marks more time than that. On the page the Hold is a few minutes: one minute, a walk, and fifty-one seconds, cut short by the coil.

**One line in the book disagrees:** "she had held a wire in her throat for four hours" (5418, ch. 20). The wire went in before noon and came out after the lock (3308). Time does pass: "four hours behind and four hundred feet down" (3862) is the afternoon on the ship. So 5418 does not fit the Rite's own pages. The scene follows chapter 10.

**The rule:**
1. The four hours may appear only as what was planned or expected, in the speakers' own words: 793, 2369, and 3126 in Kaelen's boots.
2. No line says or implies that four hours have passed, or how long the wire was in.
3. The playable Hold is about two and a half minutes [PROPOSED]: 22 s of Lyra's note, then Kaelen's walk and the bolts' 51 s, then about 6 s through the lock and the 9 s fifth.
4. `rite43`'s `hold` text "with four hours ahead of her" (l. 151) is Kaelen's thought (3126). It moves to the start of Kaelen's segment and leaves Lyra's.

### (b) The traveller-sings coda

**Found:** every `coda_by_you` site in §1.4, plus the Mausoleum's slate card (`js/coda.js` l. 265-269: "Lyra is beside you in the choir door with her slate, and no voice … YOU KNOW THE TUNE", "Sing it yourself.") and `js/data.js` l. 990-993 ("IT IS TWO VOICES. YOU KNOW THE TUNE. I TAUGHT THE WHOLE REACH THE TUNE." and "Sing it yourself: stand past the last lamp tonight.").

**Removed:**
- `js/data.js` `lyra_dw.quest`:
  - In the `!voice` branch (l. 990-993), drop the last sentence ("Then: IT IS TWO VOICES …") and the "Sing it yourself" choice. Keep "I HAVE NO VOICE. I KNOW. … SOMETHING IS SITTING ON IT." and the choice "Not yet. Her voice first.".
  - At l. 989, drop the `coda_by_you` text.
  - At l. 995, drop `f.coda_by_you = false`.
- `js/coda.js`:
  - Every `coda_by_you` branch listed in §1.4. Each one keeps its Lyra half.
  - `ringShield`'s strike by the player (l. 330): any blow on the ring Wearer does nothing and shows no fail. The player is Lyra by then and has no blow.
  - `ringAbort` (l. 316-326) as a fail. It stays only as a quiet reset used by load and migration: no message, no journal.
  - "She looks at you." becomes "She looks at Kaelen." (l. 302; MS 6028).
  - `ringVoices` loses "Two years of Kaelen Vance talking to an empty hut" (l. 381). The Wearer ate "a Cantor and four others and two years of a woman's nights" (6102); the nights are Lyra's.
  - `ringVoices` also loses the traveller's own voice (l. 382), and `ringTick` loses the lure "in your own voice" (l. 356). The burst is the book's list, 6104-6118.
  - `ringKill`'s `ring_struck === 'you'` text (l. 389).
  - `ringAfter`'s choices (l. 399-407) become one card with 6130-6152 and one button.
  - `codaTick` and `codaShield` "with you" texts. The six-note phrase at l. 72 and l. 360 is replaced by the long low close (§2.6).
  - The Mausoleum's `begin(byYou)` and slate card (l. 257-269): the Unended Office begins only with Lyra's voice. Without it (an old save), Lyra writes "NOT WITHOUT MY VOICE." [PROPOSED] and the door waits.
- `js/epilogue.js`: drop `lb_you_sang` (l. 101-102).
- `codaEndingLines` (l. 432-433): drop the `coda_by_you` halves and the `ring_sat_no` sentence (that was Kaelen's "No").

**What replaces it:** Lyra's boots (§2.6). The ring can be set only once `lyra_voice` is true. That matches the book: her voice comes back at the fire when Kaelen tells her (5966-5970), before the coda. The game's way to it is unchanged: Kaelen's "Tell her. Everything. Out loud." (`js/data.js` l. 1008), or `folder_given` (`part4State`, l. 35).

**Old saves** (migration, §5.5):
- `coda_done && coda_by_you`: delete `coda_by_you`. Set `lyra_voice`, `kaelen_dw_done` and `kaelen_told_now` if they are unset (the book's order, 5930-5970). Set `p125b_cv = 1`. The ending and epilogue then read the book's way. No journal line is added; the old journal text stays as it was written.
- `coda_by_you && !coda_done`: quiet-reset the ring (`ring_set`, `ring_go`, `ring_fight`, `ring_sung`, `coda_go` false; `ring_t` and `ring_w` deleted), delete `coda_by_you`, then `ringSync()`. Lyra is at the fire again and needs her voice.
- `ring_fight` true in any save: quiet reset as above (keeping `ring_set`). The boots start again at the ring trigger.
- `ring_struck === 'you'` with `coda_done`: set it to `'kaelen'`.
- `ring_sat_no` and `ring_sat_kind`: delete them.
- `coda_fight && coda_by_you` (inside the Unended Office): delete `coda_by_you`. The fight goes on with Lyra.

### (c) Crane seeing the needle

**Found:**
- `js/rite43.js` header l. 13-15 ("if he does here, that is an Echo"), `needleHint` l. 138, `hudEye`/`hudBlocked`/`hudSees` l. 139-141, `needleSeen` l. 144, `echoNeedle` l. 146.
- `NEEDLE_SECS`/`NEEDLE_SEEN` l. 280, `blocked` l. 478-482, the `tickNeedle` watch and Echo l. 486-499, the HUD line l. 652.
- `VO.needleSeen` `ignatius.rite.notch` l. 258 (its recording, "Closer, Engineer. At the notch …", is in `voices/script.json` as a hand entry), and `VO.needleHint` l. 265.
- The export of `blocked` and `NEEDLE_SEEN` (l. 755-756).
- `test/rite43.test.js` l. 242-256 tests it.

**Removed:** all of the above. The book's "Closer, Engineer" (3074) stays as a caption in Kaelen's boots, keeping the `ignatius.rite.closer` voice. Delete the `ignatius.rite.notch` entry from `voices/script.json` and its MP3, then re-run `build.py` so `js/voice-lines.js` loses it.

**The lenses Echo goes for the same reason:**
- What goes: `holdGo`, `holdHint`, `hudLenses`/`hudOnYou`/`hudOnDrum`/`hudBolts`, `voskTurns`, `boltsLost`, `echoHold`, `WATCH_LIMIT`, the `onYou`/`watched` logic (l. 516-526), `VO.boltsLost`, and the `seq(['vosk.rite.stepaway'])` at l. 526. `vosk.rite.stepaway` stays in `VO.golems`, its true place after the coil (3250).
- `AUDIT54.ritePenalty` stays as a function (`test/audit54.test.js` l. 97 checks its value), but the Rite no longer reads it. In the book the Factor's eye changes nothing at the plate (3186). Update its header comment (`js/audit54.js` l. 18) to say so.
- `fifthGood` and `fifthPoor` (l. 170-171) are replaced by one book text (§6). `enoughYou` (l. 176), the traveller's own part with the Golems, stays.

### (d) The sculpted hands' first-frame fault

**Cause, from the code:**
1. `render()` draws the scene, then the HUD: `Engine.render(G.ents, G.tod); drawHUD();` (`js/game.js` l. 2508-2512).
2. Under R3D, first-person pictures are not painted in `drawHUD`. They are recorded into `REC`, and `R3B.last = REC` is set only at the end of `drawHUD` (`js/body21.js` l. 1318).
3. The scene's `body` pass, which runs inside `Engine.render`, draws `R3B.last` (`bodyPass.enabled`/`draw`, l. 1425-1427).
4. So every first-person picture under R3D is the previous frame's record.

In steady play that is invisible. At a map change, the first frame draws the record made on the old map: none at all if that frame made no record, or one made under the old map's light. Pixel pictures are shaded by the scene at draw time, so a stale pixel record still looks right. The sculpted canvas is lit inside `SCULPTED112.flush(sculptLight())` (l. 1317) for the frame it was recorded in, and it is re-uploaded as it stands (`texOf`, `cv.__live`, l. 1379-1383). So the sculpted hands are wrong or missing on frame one, and right from frame two. That matches Phase 122's probe.

**The same fault will hit 125b on every step in and out of a hero's boots on the same map:** the first frame would show the traveller's hands.

**Fix:**
1. `js/body21.js`:
   - Keep `R3B.stamp`, a counter bumped by a `loadMap` wrapper, a `restoreGame` wrapper and a new `BODY21.invalidate()`.
   - `REC` carries the stamp it was made under.
   - `bodyPass.draw` records `R3B.drewStamp = rec ? rec.stamp : -1` (and `-1` when `enabled()` is false).
   - New `BODY21.redrawNeeded()` is true when R3D is shown, a record was just made, and `R3B.drewStamp !== R3B.last.stamp`.
2. `js/game.js` `render()`, after `drawHUD();`: `if (typeof BODY21 === 'object' && BODY21 && BODY21.redrawNeeded && BODY21.redrawNeeded()) { Engine.render(G.ents, G.tod); drawHUD(); }`.
   - This is at most one extra frame, only at a map change, a load or a boots switch.
   - The HUD is drawn twice because R3D's frame clears the HUD layer (`GPU18.beginHud`, `js/gpu18.js` l. 712-717).
   - The builder confirms that a second `Engine.render` in the same frame writes nothing to `G` (it is draw-only), and that its `dt` is about 0.
3. `boots125` calls `BODY21.invalidate()` on every step in and every step out.

**Probe first:**
- The failing check: stage Oakhaven at noon, render 3 frames, stage the tavern, then compare `R3D.readPixels()` hashes after the first and second `render()`, with `GFX.sculptedHands = true` and the 3D renderer on. Today they differ; with the fix they are equal.
- Also check the same with the pixel hands, and in the classic view (where `redrawNeeded` must stay false).
- If the probe shows another cause, say so in the record before changing anything.

**Then:** in `test/cover105.test.js` l. 106, remove the second `S.frame();` and its comment, putting back the line as it was before `3d4df515`. Lines 83 and 115 have had two frames since Phase 105 (`d6251278`) and are left alone.

### (e) The tideline line

**Found:**
- `js/game.js` l. 1661 (the end of Part Two, after the rope): ``if (p.glassed) lines.push(`Your tideline is ${p.glass >= 70 ? 'past the collarbone, three inches from the throat' : 'four and a half fingers from the shoulder'}. ${p.glass >= 70 ? 'Six weeks, at the current rate.' : 'Eight weeks of slack, perhaps.'} Somewhere in the glass a hundred-and-forty-year-old man is listening to everything you say, and tonight, for the first time, his argument sounds to you like mercy.`);``
- The same measure at `js/grove.js` l. 314 (the end of Part Three).

**Whose facts these are:**
- "Four and a half fingers from the point of the shoulder puts the tideline past the collarbone, across the top of the chest, and three inches from the notch of the throat." (6176) is Kaelen's measure, and it is the measure of ch. 24, after the coda (6174). At the end of the rope he is at "Four at the casing" (6174).
- The tideline measured "from the point of his shoulder" is his daily habit (592).
- The man in the glass is Casimir Vaelen, who hears Kaelen "since the morning it set around your arm" (5228). He is "a hundred and forty years old" (6264). He is there because "two pieces of one Spire are one thing in two places" (5946). Kaelen learns it only in ch. 19 (5222-5228).
- So the line gives any glassed traveller Kaelen's measure from a later chapter, and a voice that only Dawning glass carries. The Glass-Hand's glass is raw seam glass in the hand and forearm (125a §2).

**Fix:** both lines become the stranger's own [PROPOSED]:
- `p.glass >= 70`: "Your glass is past the elbow now. You have stopped measuring it."
- otherwise: "Your glass is past the wrist and still climbing, and you keep it wrapped."
- No weeks, no Vaelen. French in the TSV.

### (f) Ada Pellow's age

**Found:**
- `js/sidequests.js` l. 111: `'Oakhaven': S('Seventy years in one parish. It was louder when I was a girl. Everything was.')`.
- Its recording `voices/p9_ada/p9_ada.t.6cd1da.mp3` (`js/voice-lines.js` l. 65205-65211, `auto: true`).
- French in `tools/i18n/p121-text.tsv` l. 58 and `p9-quests.tsv` l. 5.
- The book: "She was fifty-one years old." (MS 3544; `Chapters/11 The Greening.md` l. 198).

**New line [PROPOSED]:** "Fifty-one years, and nearly all of them in this parish. It was louder when I was a girl. Everything was."
- French: "Cinquante et un ans, et presque tous dans cette paroisse. C'était plus bruyant quand j'étais fille. Tout l'était."
- "nearly all" because the book does not say she was born there.

**The recording:** run the Phase 102 pipeline: `node tools/voices/dump-dialogue.js` with the game served, `python3 tools/voices/extract.py`, then `python3 tools/voices/build.py --model DIR`. The new text gets a new id (sha1). `build.py` renders it in `p9_ada`'s cast voice and removes `p9_ada.t.6cd1da`.

**If Kokoro and its model files are not on the build machine:** the old entry is still removed from `voices/script.json` and `js/voice-lines.js` is regenerated without it. The line ships unvoiced, and the record says it is owed. **A recording that says "Seventy" must not play under the new text.** `test/voice-acting` checks that each recording matches its line.

### (g) The calling lines

All are [PROPOSED]. Every player plays all six moments; these lines are added only for the matching calling. Each shows as a plain message (class `voice`, about 6 s), just before the step in and just after the step out. **None is voiced** (as 125a: no calling line is voiced).

| Calling (`js/data.js`) | Moment | Before | After |
|---|---|---|---|
| Glass-Hand (`blade`) | needle | "Near the glass channels your own wrapped hand rings, very faintly, the way it rang the night it took the seam. You keep it in your coat." | "You saw which thumb did the pinching. A glass hand is no good for fine work, and that one did the finest thing in the room." |
| Glass-Hand | bolts | "Through your wrapped hand the lock sounds clean to you: a bell in tune. You would not have called it slipping." | "The lock is out of tune now. Your hand tells you before your ears do, and then it will not stop telling you." |
| Cantor (`cantor`) | Hold | "One hundred and seventy-four. You have held it yourself at a bedside, for as long as a breath would let you. You listen for the place where hers will waver." | "It never wavered. Then down a whole fifth and back, in a torn voice. You could not have done it with a whole one." |
| Cantor | coda | "You were taught the office as every cantor is: five parts and one coda, and the close is two voices. You have never heard it sung without the second." | "She did the close alone. You did not know it could be done." |
| Corsair (`corsair`) | One to Ten | "You start counting, the way a hand counts on a deck in a blow. Not because it helps." | "Ten. You counted it with him. There are six feet of rope on the drum, and nobody coils it, and on any deck you ever worked nobody would ask why." |
| Catalogue Clerk (`archivist`) | three names | "You know the form for this: the entry, the name, the age, the trade, the day and the hour, and the last thing said at the door. She has no pen out." | "Three entries, and not one word of them written down. The Office has no form for reading an entry back to the man who carried it." |
| Flambeau Penitent (`penitent`) | needle | "You know the rubric before he reads it. Blessed is the single note. Blessed is the throat that holds it. You do not move your lips." | "He blessed her with two fingers, as the rubric has it. You have seen it done before, in a far parish, and the words were the same." |
| Quarry-Hand (`quarry`) | bolts | "The chains come down a notch and the grinding changes its note. You know what a bore sounds like when it is biting well. This is it biting well." | "You heard the crown go: the teeth snapping inside the wood like a bell breaking. Nobody who has worked a face forgets that sound." |

**Footing for each:**
- The clerk's fields: "the name and the age and the trade and any last thing the subject said that I could hear from the door" (4291).
- The rubric: 3036. The blessing: 3110. The penitent's Rite was "in a far parish" (125a; not the Dawning).
- "a bell in tune": 3180.
- "like a bell breaking": 3210.
- "five parts and one coda": 6046. The close is two voices: 6086.
- The rope: 3808-3810.
- The glass channels: 3214. Ringing: SB 160 via 125a. "no good for fine work": 608.

**Kept from the plan:** "the glassed hand hears the lock; the cantor hears how true the note is; the corsair counts with Vane; the clerk knows the form Sable is not filling in". The penitent and the quarry hand get one moment each, so every calling has at least one.

**None of these lets the traveller pre-empt anything.** Each is said before a book event as an observation of what is already there (the lock, the note, the rubric, the grinding), or after it.

---

## 5. The build plan

### 5.1 Files the builder owns (new)

- `js/boots125.js`: the module `BOOTS125`. Script tag after `js/faces124.js` and before `js/mast123.js` (`index.html` l. 309-318). **`js/mast123.js` stays last.**
- `test/boots125.test.js`: Playwright, in the style of `test/strangers125.test.js`.
- `tools/i18n/p125b-boots.tsv`: every new or changed line, "english<TAB>french". Merge with `tools/i18n/merge-pairs.js` as 125a did.
- `story/Game Layer/Phase 125b - In their boots.md`: the record.
- An entry in `story/World Bibles/Vol VIII - The Game Layer.md` (the owner's standing wish that every game update goes into Vol VIII).
- `tools/dev/shots125b.sh`, for the pictures.

### 5.2 `BOOTS125`: what it holds

- `MOMENTS`: `needle`, `hold`, `bolts`, `rope`, `names`, `coda`, ids 1-6. For each: the hero, the beats (caption text, timing, input, slip line, voice ids), the hero's LOOK, and the hand pose.
- `enter(id, opts)` and `exit()`:
  - Store the traveller's camera.
  - Hide or show the hero's figure.
  - `BODY21.invalidate()`.
  - Show the calling line.
  - Block attacks, Songs, the menu's Save and travel. The moment's input keys replace them.
  - Damage to the player is off.
- **The hero's hands** (behind the switch, §5.4): while a boot is active, wrap `GEARLOOK21.of` and `currentWeapon` so the look and the weapon are the hero's.

  | Hero | LOOK [PROPOSED where the book is silent] | Weapon |
  |---|---|---|
  | Kaelen | `glassArm: true`, felt sleeve (3096) | `hands` |
  | Lyra | bare hands, white wool sleeve (3088) | `hands` |
  | Vane | coat sleeve (1361, 1538: "his coat") | `hands`, then `axe` from Five |
  | Sable | one bare hand | `hands` |

  - Skin: the hero portrait's own tone [PROPOSED]. The books give no skin colours; use the tone of each hero's existing portrait art.
  - Poses:
    - needle: `'open'` lowered, without the Song's light;
    - Hold: `'c'` (two fists) set on the stool edges;
    - bolts: right `'fist'` plus the spanner prop, left `'glassfist'` laid on the brass;
    - rope: `'c'` on the rail, then `'w'` `axe`;
    - names: a single `'open'` hand flat;
    - coda: none.
- **Props**, drawn in code on the HUD layer by `boots125` (pixel grain, as `pixelhands110`; behind the switch): the needle and wire, the tuning key, the spanner, the coil, the floating Ledger. Hashed shapes only. The Ledger is drawn only when the look is below level.
- **Kaelen's tremor** at the needle: ±1 view pixel, from a hash of `Math.floor(t * 9)`, applied to the hands' transform. No `Math.random`.
- **The Hold and the fifth:** `REEDS.holdPitch`, with the curves of §2.2.
- **The coda:** reuse `ringTick`'s beats and its Wearer circling (l. 342-373), with Lyra's camera at `RING.bx, RING.by`.
- **Edits to the scene modules are narrow:**
  - `js/rite43.js`:
    - `startNeedle` calls `BOOTS125.enter('needle')` when present, and stage 3's tick is skipped while in boots.
    - The `hold` card's button calls `enter('hold')`, which chains to `bolts` and back to `hold` part two, then `singDown` with Lyra's text.
    - The removals of §4c.
    - `VO`: drop `needleSeen`, `needleHint`, `boltsLost`. Keep the rest for the captions.
  - `js/rope45.js`:
    - `startCount` calls `enter('rope')`. `tickCount` and `atTen` are driven by the boots' inputs.
    - `holdDrum` and the `r45_drum` use at stage 5 are removed.
    - `TX.echo` stays, so that `endEcho` still reads for saves that have `r45_echo`.
    - The `afterSaw`/`afterLooked` lines are not shown for new runs.
  - `js/manifest53.js`: the `three` card's button calls `enter('names')`. `read()` is skipped while in boots, and the `filed` card follows `exit`.
  - `js/coda.js`: the §4b removals. `ringEnter` calls `enter('coda')`.
  - `js/data.js`: the §4b edits to `lyra_dw.quest`.
  - `js/epilogue.js`: drop `lb_you_sang`.
  - `js/game.js` l. 1661 (§4e); `js/grove.js` l. 314 (§4e); `js/game.js` `render()` (§4d).
  - `js/body21.js`: the stamp (§4d).
  - `js/sidequests.js` l. 111 (§4f).
  - `js/audit54.js` l. 18: comment only.
- **Fallbacks:** if `BOOTS125` is absent or throws, each scene falls back to its card text, never to the removed mechanics.

### 5.3 Flags (prefix `p125b_`, small ints, validated on every load)

| Flag | Range | Meaning |
|---|---|---|
| `p125b_seen` | 0-63 | bit per moment played through (1 needle, 2 hold, 4 bolts, 8 rope, 16 names, 32 coda) |
| `p125b_slips` | 0-99 | slips taken, all moments (for the record and the test; no text reads it) |
| `p125b_at` | 0-6 | the moment the player is in (0 none); a save made inside a boot loads at that moment's start |
| `p125b_m` | 0-1 | the save has been migrated |
| `p125b_cv` | 0-1 | an old save in which the traveller sang the coda was converted |

Any value that is not an integer in range is set to 0 on load. These flags never reach the screen as text.

### 5.4 The Options switch

- `GFX.heroHands`, labelled "Hands in a hero's boots: the hero's own / yours" [PROPOSED]. French: "Mains dans la peau d'un héros : les siennes / les vôtres".
- Register it as `faces124` does (`GFX.FX.push`, `PRESETS.keep`). It is off in Original, as an unknown flag (`fxWanted`), and on in the other presets.
- **Off:** no LOOK or weapon override, no props, no tremor. The player sees their own hands while in a hero's boots.
- The boots themselves are story, not a visual effect, and play in every preset. The grey slip is the existing Echo and is not behind the switch, as today.
- With the switch off, anything outside a boot draws exactly as before: check a frame hash in a non-boots scene.

### 5.5 The save migration

- Wrap `restoreGame` in `boots125`. Within it: validate the flags (§5.3), then if `!p125b_m`, run §4b's coda rules, then set `p125b_m = 1`.
- A save with `r43` at 3 or 4, `r45` at 5, `p53` at 9, or `p125b_at > 0` lands in the moment's start on its map's `onLoad` (`rite43` l. 677 already restages; `boots125` enters).
- `snapshotGame` is wrapped so that a save made inside a boot writes the traveller's own camera, not the hero's.
- Because `js/mast123.js` loads after `boots125` and wraps `restoreGame` too, its wrapper is the outermost. That is as required.

### 5.6 The first failing checks (`test/boots125.test.js`, written before any code)

1. **Static:** no `needleSeen`, `echoNeedle`, `NEEDLE_SEEN`, `blocked(`, `hudEye`, `ignatius.rite.notch` in `js/`; no `boltsLost`, `WATCH_LIMIT`, `voskTurns` in `js/rite43.js`.
2. **Static:** `coda_by_you` appears in `js/` only in `boots125.js` (the migration). There is no `lb_you_sang`. `js/coda.js` contains "She looks at Kaelen." and not "She looks at you.".
3. `lyra_dw.quest` with `lyra_voice` false offers no choice that calls `ringPlan`, and no text containing "YOU KNOW THE TUNE".
4. Needle: from stage 2's lullaby card, the player is in Kaelen's boots.
   - `GEARLOOK21.of().glassArm === true`; the rite43 `kaelen` figure is hidden; Crane walks down, crouches and goes back up.
   - The captions equal MS 3044-3110's lines, read from the manuscript file by the test.
   - "I. Am. Fortunate." is shown; the stage becomes 4.
   - No card or message ever contains "sees" with Crane as its subject.
5. Needle slips: holding the pinch for 2 s gives a grey canvas filter and a card containing "slow would look wrong". After "Again", the same beat, with `r43` still 3. A move during Crane's look gives a slip containing "Kaelen did not move.". After two slips the beat plays itself.
6. Hold:
   - Lyra's boots start on "Head at one span!".
   - Releasing the note before the cue is a slip containing "the last thing a Cantor does is stop".
   - The fifth's curve is `[174, 116, 174, 116]` in that order.
   - No text in the Hold says or implies that hours have passed: regex over every boots and rite43 text, `/(hours (had|have) passed|for four hours|after four hours)/`.
7. Bolts:
   - Kaelen's boots after "The lullaby stopped."; the fuse lines (3158-3160) are shown here and not in the needle.
   - "Slippage on the lock" and "Spanner" are shown; Tobiah calls five times.
   - The plate comes off at 51 s ± 1 of game time.
   - The only choice at "Sir, what's that?" is "You'll want to hold onto something."
   - No "step away from the drum" text before `bore_seated`.
8. The whole playable Hold, from "Head at one span" to the end of the fifth with no slips, is under 4 minutes of game time.
9. One to Ten:
   - Vane's boots; the numerals *One* to *Ten* in order, with the book's verbatim captions.
   - Taking the axe at Five puts `axe` in `currentWeapon()` during the boot.
   - A cut before Ten is a slip; no cut by Ten + 2.5 s is a slip back to Nine with "'Do it,' said Kaelen.".
   - After the cut, the Song key shows "Nothing came up at all."
   - Aldric is in the ledger once. `r45` reaches 7.
10. Three names:
    - Sable's boots after "Go on, then".
    - The three entries are verbatim MS 4556, 4560 and 4564, in that order.
    - A pitch 15° below level during an entry is a slip containing "she did not look at it", and the same entry again.
    - No fragment is spent (`f.fragments` or the game's own count unchanged).
    - The `filed` card follows.
11. Coda:
    - The ring cannot be set without `lyra_voice`.
    - In Lyra's boots, moving 2 from the spot is a slip (grey) and not `ringAbort` (`ring_set` stays true, and no "the ring failed" journal).
    - Releasing the song is a slip.
    - `ring_struck === 'kaelen'`.
    - The burst text contains the five book voices and her father, and not "Two years of Kaelen" or "Your own voice".
    - No `Audio_.sfx.song` call at 523, 659 or 784 Hz (spy).
    - The after card contains "did not forgive him either" and has exactly one button.
12. Calling lines: for each of the six callings, the matching moments show their before and after lines, and the other moments show none. Each line has French.
13. Old save, `{ part4, coda_done, coda_by_you, ring_struck: 'you', lyra_voice: false }`: it loads, `coda_by_you` is gone, `lyra_voice` is true, `ring_struck` is 'kaelen', and `codaEndingLines()` and the epilogue read Lyra's way. `p125b_m = 1`, `p125b_cv = 1`.
14. Old save mid-ring with `coda_by_you`: the ring is reset, Lyra is at the fire, and there are no lamps.
15. Old saves at `r43 = 3`, `r43 = 4`, `r45 = 5`, `p53 = 9` each load into the start of their moment.
16. A save made inside a boot holds the traveller's camera and `p125b_at`. On load the moment restarts, and the traveller's camera is restored on exit.
17. Flags `p125b_*` set to strings, `<b>` markup, negatives or 1e9 are 0 after load, and nothing is injected.
18. `GFX.heroHands = false`: inside a boot, `GEARLOOK21.of()` is the traveller's look and no prop is drawn. Outside a boot, frame hashes are the same with the switch on or off. Off in Original, on in Medium.
19. First frame:
    - With `GFX.sculptedHands` and R3D on, the first `render()` after staging the tavern from outdoors hashes equal to the second.
    - The same after `BOOTS125.enter` on the same map.
    - In the classic view, `BODY21.redrawNeeded()` is never true.
20. `test/cover105.test.js` l. 106 runs with a single `S.frame()` and passes.
21. Tideline: the Part Two and Part Three endings for a glassed traveller contain neither "four and a half fingers" nor "hundred-and-forty".
22. Ada: the `Oakhaven` topic says "Fifty-one years"; `VOICE_LINES` has no text containing "Seventy years"; the French exists.
23. **Static:** no `Math.random` in `js/boots125.js`; `index.html`'s last script tag is `js/mast123.js`; every string in `BOOTS125.TEXTS` is in a TSV.

### 5.7 Suites to run after

`boots125`, `rite43`, `rope45`, `audit54`, `canon32`, `epilogue`, `herald66`, `companion-talk`, `cutter68`, `cover105`, `hands122`, `sculpted112`, `pixelhands110`, `pixelhands111`, `body21`, `presets`, `voice-acting`, `voices`, `story-i18n`, `strangers125`, `sidequests`, `bell69` (the stand-down scan), and `node tools/i18n/coverage.js`.

**Tests to teach** (each change written in the record):
- `rite43`: the needle and lens Echo checks become the boots' slips.
- `rope45`: `holdDrum`.
- `canon32` l. 242-280: the `byYou` case goes; the early strike is now Kaelen's.
- `epilogue` l. 65-66, 257, 310: the `lb_you_sang` cases go.

### 5.8 Pictures (one per moment)

Taken with `tools/dev/shots125b.sh` into `screenshots/p125b-<moment>.jpg`, Medium preset, 3D view, sculpted hands on:

1. **needle**: Kaelen's glass hand and the needle at the pinch, Crane on the catwalk.
2. **hold**: Lyra's hands on the stool, the bore's collar ten feet off, the holdPitch band.
3. **bolts**: the spanner at the plate, Tobiah on the rail.
4. **rope**: Vane's hands on the rail at *Seven* (Aldric looking up), and the axe at *Ten*.
5. **names**: the crate lid with Sable's good hand, Vane on his crate, eyes up (the Ledger not seen). A second frame shows the slip: grey, looking down at the Ledger.
6. **coda**: Lyra's view between the willows at "Ten feet", the Wearer at the lamps.

Plus one sheet of the first-frame fix (frame 1 before and after) and one of the switch off.

---

## 6. All new in-game text (English)

**B** = the book's words, verbatim, with the MS line. **P** = [PROPOSED]. The builder copies each B line from the MS at that line, and the test compares them.

### 6.1 Shared

| Text | |
|---|---|
| "In his boots" / "In her boots" (step-in card titles) | P |
| "That is not how it went." (the first sentence of every slip card) | P |
| "Again" (the slip button; already `TX.echoGo` in rite43) | existing |
| "Step back into your own boots." (the step-out button) | P |

### 6.2 Needle

| Text | |
|---|---|
| step-in card: "And Kaelen Vance came across the platform and knelt down on the boards in front of her stool and picked up the needle, and Lyra looked at his hands. They were shaking." | B 3044-3046 |
| button: "Kneel." | P |
| "She turned her head a little to the side, and lifted her chin, and offered him her throat. *Get on with it.* He got on with it." | B 3068-3072 (from "She turned"; the book's "She did the only thing left to her." is cut) |
| "'Closer, Engineer,' said Ignatius Crane, from the catwalk. 'I must be able to see.'" (voice `ignatius.rite.closer`) | B 3074 |
| "He held it flat against the side of her neck, thumb along the line of the muscle, the way the Tuning Men had done it. The glass was cold. She flinched and made herself still." | B 3076 |
| "He drew it to the second notch, which was one notch looser than it should have been, and buckled it there." | B 3078 |
| hint: "Hold to pinch. Let go to drive the needle." | P |
| "Kaelen put the needle in a fold of skin." | B 3084 |
| "Lyra's whole body went rigid. Her hands closed on the edges of the stool until the knuckles went white." | B 3086 |
| "Blood came at once." / "*Good*, Kaelen thought, with the sick clarity of a man doing arithmetic. *It has to bleed.*" | B 3088, 3090 |
| hint: "The pegs: one, two, three, four." | P (the numbers from 3092) |
| "He took the tuning key from the case and set the pegs — one, two, three, four — turning each a half-turn, and with every turn the wire tightened against the skin, and Lyra's eyes watered and did not close." | B 3092 |
| "The Inquisitor came down the ladder from the catwalk." / "Kaelen did not move. He could hear his own arm ringing under the felt, high and fast." | B 3094, 3096 |
| Crane's 3098 (voices `ignatius.rite.blood`, `ignatius.rite.speak`); "'I. Am. Fortunate.'" (`lyra_fortunate.rite.fortunate`); "One hundred and seventy-four, all the way through. Not a hair off." | B 3098, 3104, 3106 |
| "Kaelen had to put the heel of his right hand against the boards for a moment." / "'She is,' said Ignatius Crane, pleased, and blessed her with two fingers, and went back up the ladder." (`ignatius.rite.sheis`) | B 3108, 3110 |
| slip: "He did it fast, because slow would look wrong." | B 3086 |
| slip: "Kaelen did not move." | B 3096 |

### 6.3 Hold

| Text | |
|---|---|
| step-in card: "And Lyra Ashgrove, sitting on a stool on a platform four hundred feet under Oakhaven in a white shift with blood on the collar, began to sing." | B 3122 |
| button: "Sing." | P |
| "'Head at one span! One span and holding!'" (`tobiah.rite.span`); "'One note,' he said. 'One law. One hand.'" (`ignatius.open.onenote`); "The chain creaked." | B 3116, 3118, 3120 |
| "One hundred and seventy-four. Clear, and hoarse, and absolutely steady." | B 3124 |
| hint: "Hold one hundred and seventy-four." | P |
| "'Pitch coming up,' said Tobiah, at the gauges, delighted. 'It's coming up to her, sir. It's — gods, look at it — it's matching.'" (`tobiah.rite.matching`); "'Mark it,' said the Factor from the rail, and wrote in her own book." (`vosk.rite.markit`) | B 3132, 3134 |
| "The lullaby stopped." | B 3136 |
| part two, step-in: "The lock threw." | B 3208 |
| "On the catwalk, the Inquisitor was on his knees with the chain wrapped round his fist." / "'*The hold!*' he was shouting. '*Hold the note! Daughter — hold the note!*'" (`ignatius.rite.holdnote`) | B 3216, 3218 |
| "'LYRA! *SING IT DOWN!*'" (`kaelen.rite.singitdown`) | B 3228 |
| hint (existing `fifthHint`, kept minus "Follow her"): "The falling fifth: 174, and down a whole fifth to 116, slow as a leaf coming off a branch, and up, and down again." | existing, trimmed |
| result card (replaces `fifthGood`/`fifthPoor`): "She let it fall." + "He heard the moment the note bent: the Root note sliding down a whole fifth, slow as a leaf coming off a branch, in a torn hoarse voice with blood on the collar of her shift — and then climbing, and falling again, the small patient village trick out of the margin of a dead man's notebook. *Down. Go back where you came from.*" + "And then, very slowly, like a man who has stood up too fast and sits down again, it let go of the question." | B 3232, 3234, 3240 |
| slip: "Because the note *was* still going … because she was a Cantor and the last thing a Cantor does is stop." | B 3220 (cut as shown) |

### 6.4 Bolts

| Text | |
|---|---|
| step-in card: "Kaelen stood at the calibration rail with his toolbag at his feet and listened to her do it, and understood two things at once: that she was very good … and that she had four hours of it ahead of her with a torn throat and a wire through her skin, and that she would not stop, and that this was somehow worse." | B 3126 (the middle cut at "…") |
| "If the hold failed, the Sequence would not stop. The slippage — the whole shuddering harmonic recoil of a bore in a living casing — would go into the source. Into her." / "She was not the hand that steadied the patient." / "She was the fuse." | B 3156, 3158, 3160 |
| button: "Pick up the toolbag." | P |
| "Kaelen picked up his toolbag and walked along the collar walk to the drum." | B 3172 |
| "'Sir?' Tobiah, trotting after him. 'Sir, the readings are perfect, they've never been—'" | B 3176 |
| "'Slippage on the lock,' said Kaelen. 'I can hear it.'" (`kaelen.rite.slippage`) / "He could not, and the boy would know that he could not; the lock was singing like a bell in tune." / "'Yes, sir,' said Tobiah. 'What do you want?'" / "'Spanner. Sit on the rail there and call the pitch to me every ten seconds.'" (`kaelen.rite.spanner`) | B 3178, 3180 (first clause), 3182, 3184 |
| hint: "Kneel at the plate." | P |
| Tobiah's calls: the existing `pitchCall`, `pitchCall2` | existing (game's) |
| "The plate over the phase port had eight bolts. He had promised himself forty seconds and he took fifty-one … and nobody stopped him, because he was the supervising engineer, and he was doing what supervising engineers do." | B 3186 (cut) |
| "The plate came off. He laid it down quietly." | B 3188 |
| "He put his hand into his toolbag and took out the reverse-phase coil." / "'Sir,' said Tobiah. His voice had changed. 'Sir, what's that?'" (`tobiah.rite.whatsthat`) / "He had perhaps two seconds and one sentence." | B 3192, 3194, 3200 (last sentence) |
| the one choice: "You'll want to hold onto something." (`kaelen.rite.holdon`) | B 3202 |
| "And he seated the coil in the port." | B 3204 |

### 6.5 One to Ten

| Text | |
|---|---|
| step-in card: "*Take her up*," Vane said. … "She went sideways." | B 3716, 3720 |
| button: "The rail." | P |
| "It happened the way it always happens: slowly, and then in about ten heartbeats." / "The rope went into the branches. Then the rope snagged." / "Everything after that was arithmetic." / Pennick's line | B 3724, 3728, 3730 (first sentence), 3732 |
| *One.* to *Ten.*, each with its line as listed in §2.4 (voices `vane.rope.n1`-`n10`, `kaelen.rope.doit`) | B 3734-3774 |
| hint at Five: "Take the axe." | P |
| hint at Ten: "Cut." | P |
| after card: "She came up like a cork." + 3782 + 3784 + "Then there was nothing down there but leaves." + 3798 + 3808-3810 | B 3778, 3782, 3784, 3786, 3798, 3808, 3810 |
| the Song key after the cut: "Nothing came up at all." | B 3804 |
| slip (Five): "Vane took the axe out of Mags's hands, because if it was going to be anyone it was going to be him." | B 3752 |
| slip (early): "*Ten.* Vane cut the line." | B 3772-3774 |
| slip (late): "'Do it,' said Kaelen." | B 3770 |

### 6.6 Three names

| Text | |
|---|---|
| step-in card: "Vane sat on a crate in his own hold with an empty bottle in his hand and looked at a woman with a broken nose in the lantern-light." / "'Go on, then,' he said." (new voice `vane.manifest.goon` [P id]) | B 4548, 4550 |
| button: "Read." | P |
| "The Bound Ledger came round in front of her and opened itself, and she did not look at it." | B 4554 |
| Corwin Aye, all of 4556 (new voice `sable.manifest.corwin`), then "Vane did not move." | B 4556, 4558 |
| Mirren Salk, all of 4560 (`sable.manifest.mirren`), then "The lantern hissed." | B 4560, 4562 |
| Annet Sowerby, all of 4564 (`sable.manifest.annet`) | B 4564 |
| 4566-4568; Vane's 4570 (`vane.manifest.third`); Sable's 4572 (`sable.manifest.iknow`) | B 4566-4572 |
| hint: "Keep your eyes on him." | P |
| slip: "The Bound Ledger came round in front of her and opened itself, and she did not look at it." | B 4554 |

### 6.7 Coda

| Text | |
|---|---|
| `ringPlan` change: "She looked at Kaelen." | B 6028 |
| step-in card: "She walked out past the last lamp at the second hour and stood in the moss between two silver willows with her hands at her sides." / "And she sang her father's funeral." | B 6040, 6042 |
| button: "Sing." | P |
| "She sang it in a voice like a torn sheet, in the dark, badly, at full volume." | B 6048 |
| hint: "Stay where you are. Keep singing." | P (from the existing l. 313, minus its traveller wording) |
| the three lines, 6052, 6056, 6060, 6066, 6072 (to "rippling, and the voice came out of that."), the Wearer's 6074 and 6078 (existing `wearer` voices where the text matches; otherwise new `wearer.ring.*` [P ids]) | B 6050-6078 |
| "'I know,' said Lyra, and kept singing." (new voice `lyra_ruined.ring.iknow`) | B 6076 |
| "Third part. The naming." / *Tobin Ashgrove.* ×4 / "Twenty feet. Fifteen." | B 6080 (first sentence), the name from 6050, 6082 |
| the Wearer's 6084; "Ten feet." | B 6084, 6088 |
| "'I know it's a two-voice part,' said Lyra Ashgrove." (new voice `lyra_ruined.ring.twovoice`) / "And she sang the coda alone." | B 6090, 6092 |
| the burst: 6096, 6098, 6100, 6102, 6104-6112, 6114, 6116, 6118, 6120, 6122, 6124, 6126 | B |
| after card: 6130, 6132, 6134, 6138 (voiced `lyra_ruined` where the text matches), 6140, 6142-6148, 6150, 6152, 6154 | B |
| after button: "Step back into your own boots." | P (6.1) |
| slip (step): "'It'll circle, and it'll use voices, and it will do everything it can to make me walk further out.'" | B 6028 |
| slip (stop): "'I know,' said Lyra, and kept singing." | B 6076 |
| Mausoleum without her voice (old saves only): "She writes: <b>NOT WITHOUT MY VOICE.</b>" | P |

### 6.8 The fixes

| Text | |
|---|---|
| "Your glass is past the elbow now. You have stopped measuring it." | P (§4e) |
| "Your glass is past the wrist and still climbing, and you keep it wrapped." | P (§4e) |
| "Fifty-one years, and nearly all of them in this parish. It was louder when I was a girl. Everything was." | P, the age from B 3544 (§4f) |
| `lyra_dw.quest` without voice: "She writes: <b>I HAVE NO VOICE. I KNOW.</b> She looks at Kaelen across the fire, and then back at you. <b>SOMETHING IS SITTING ON IT.</b>" | existing (game's), trimmed |
| the Options row: "Hands in a hero's boots" / "the hero's own" / "yours" | P |

### 6.9 The calling lines

The 16 lines in §4g. All P, all unvoiced.

**French:** the builder writes every row above into `tools/i18n/p125b-boots.tsv`, using the glossary (`tools/i18n/glossary.fr.md`). Book lines are translated as the existing p43, p45 and p53 TSVs translate them; reuse their French where a line is already there.

**New voices:** the ids marked above. Hand entries go in `voices/script.json` in each speaker's existing cast voice (`sable`, `vane`, `lyra_ruined`, `wearer`), rendered by `build.py`. If Kokoro is not on the machine, these lines ship unvoiced and the record lists them as owed.

---

## 7. Open questions for the owner

**None needs him before the build.** Everything else is decided above in keeping with the books, under his rulings of 23 and 24 Nov ("if kept with lore I approve"; "a good game with a good story").

Three changes he will notice, to put in the record's summary rather than ask:

1. **The traveller no longer strikes the Wearer and no longer says "No" in the moss.** Both are Kaelen's in the book (6028, 6098, 6144). The player is Lyra for the whole of it instead.
2. **The ring can no longer fail and send you back "in a week".** A step out or a stopped song is a grey slip. The book's night happens once.
3. **The Rite's two minigames for the traveller go:** standing in Crane's eye-line, and humming to hold the Factor's lenses. Both were built on things the book does not have. The traveller's own part of the Rite is now the procession, the pumps and the Golems, as before.

Still open from earlier phases, unchanged by this one: Faces of their own (the portraits, at about nine a day), and whether to pay for Hugging Face PRO.
