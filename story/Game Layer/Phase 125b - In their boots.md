# Phase 125b: in their boots (record)

24 November 2026. Built from `Phase 125b - In their boots (design, for the builder).md` (the design), on branch `p125b-boots`. **MS** = Book One's full manuscript, by line.

## What a player sees now

Six moments of Book One are played in the hero's own boots. The player does only what the hero did, well or badly. A slip is the grey Echo the game already had: its card says "That is not how it went." [PROPOSED] and the book's own line, "Again" starts the beat over, and after two slips on one beat it plays itself. A slip never changes what happens. Every caption is the book's narration, verbatim, read from the manuscript by the test.

| Moment | Hero | The player's two inputs | Slips (book line) |
|---|---|---|---|
| The needle (ch. 10) | Kaelen | hold the use key to pinch with the glass thumb, let go to drive; four presses for the pegs | the pinch held over 1.6 s: "He did it fast, because slow would look wrong." (3086); a move while Crane crouches: "Kaelen did not move." (3096) |
| The Hold, part one | Lyra | hold 174 for 22 s (Hold the Pitch, no number shown) | leaving the band: "…the last thing a Cantor does is stop." (3220) |
| The eight bolts | Kaelen | walk the collar walk; kneel at the plate (the bolts take 51 s by themselves, Tobiah calling five times); the one sentence | none (MS 3186: "nobody stopped him") |
| The Hold, part two | Lyra | 174 through the lock (6 s); the falling fifth, 174 116 174 116 (9 s) | leaving the band before the cue |
| One to Ten (ch. 12) | Vane | take the axe at Five; cut at Ten | no take by Five's end (3752); a cut before Ten (3772-3774); no cut by Ten + 2.5 s, back to Nine (3770) |
| The three names (ch. 16) | Sable | one press for each entry; keep the eyes up | the look more than 12° down under the 3D view, 7° in the classic view (which can look only 9.4° down): "she did not look at it." (4554) |
| The coda (ch. 23) | Lyra | walk to the spot between the willows; hold the Song key until the coda is sung | a step of 1.3 off the spot (6028); letting go of the song: "'I know,' said Lyra, and kept singing." (6076) |

The playable Hold, "Head at one span" to the end of the fifth, is about two and a half minutes of game time (ruling a). Kaelen and the Aegis strike at the coda; the after card is MS 6130-6154 with one button.

**The calling lines** (ruling g, all [PROPOSED], unvoiced) show before the step in and after the step out, only for the matching calling: Glass-Hand at the needle and the bolts, Cantor at the Hold and the coda, Corsair at One to Ten, Catalogue Clerk at the names, Flambeau Penitent at the needle, Quarry-Hand at the bolts.

**The switch** "Hands in a hero's boots: the hero's own / yours" (`GFX.heroHands`, Options; off in Original, on in the other presets). On: the hero's look (Kaelen's glass arm and felt sleeve, Lyra's white wool, Vane's coat, Sable's one bare hand; skin from each portrait [PROPOSED]), Vane's Boarding Axe from Five, the code-drawn props (needle and copper wire, tuning key, spanner, coil, the Ledger seen only by looking down), Kaelen's hashed tremor at the needle. Off: the traveller's own hands and no props. Outside a boot the frame is the same either way (checked by hash).

Pictures (Medium preset, 3D view, sculpted hands; `tools/dev/shots125b.sh`): `screenshots/p125b-needle.jpg`, `-hold.jpg`, `-bolts.jpg`, `-rope.jpg` (Seven), `-rope-ten.jpg`, `-names.jpg`, `-names-slip.jpg`, `-coda.jpg` ("Ten feet"), `-frame.jpg` (frame 1 before and after the fix), `-off.jpg` (the switch off).

## What was removed, and why

- **The traveller-sings coda** (`coda_by_you`): the slate's "IT IS TWO VOICES. YOU KNOW THE TUNE…" and "Sing it yourself", the traveller past the last lamp, `lb_you_sang`, the Mausoleum's slate card ("Sing it yourself"). Her voice comes back at the fire before the coda (MS 5966-5970); the ring now needs it. An old save without it waits at the Unended Office: "She writes: **NOT WITHOUT MY VOICE.**" [PROPOSED].
- **The traveller's strike** on the ring Wearer: the strike is Kaelen's and the Aegis's (6028 "She looked at Kaelen", 6098). A blow on the ring Wearer does nothing.
- **The failing ring** ("It goes away. It will come back in a week"): it changed what happens; `ringAbort` is now `ringReset`, a quiet reset used by loads and the migration only.
- **"Say something" / "No."** given to the traveller: Kaelen's (6142-6148). `ring_sat_no`, `ring_sat_kind` go.
- **"Two years of Kaelen Vance talking to an empty hut"** and the traveller's own voice in the burst: the burst is the book's list (6102-6118); the nights are Lyra's.
- **The bright six-note phrase** (523-784 Hz): the coda is "the long low close that goes under the floor" (6044): one low note falling (138, 116, 98 Hz) [PROPOSED].
- **Crane seeing the needle** (the eyeline, `needleSeen`, `echoNeedle`, the HUD, `ignatius.rite.notch` and its recording): he is "satisfied" and "pleased" (3098, 3110).
- **The lenses Echo** and humming beside the stool: "nobody stopped him" (3186); the Factor turns the Golems only after the coil (3248-3250). `AUDIT54.ritePenalty` stays as a function, unread by the Rite.
- **Holding the drum at Ten** and its Echo: nothing lets the line stay (3772-3774). `TX.echo` stays so an old save's `r45_echo` ending still reads.
- **The tideline line** for a glassed traveller (Kaelen's measure from ch. 24, MS 6176, and Vaelen in the glass, 5228): now "Your glass is past the elbow now. You have stopped measuring it." / "Your glass is past the wrist and still climbing, and you keep it wrapped." [PROPOSED].
- **Ada Pellow's "Seventy years"**: she is fifty-one (3544): "Fifty-one years, and nearly all of them in this parish…" [PROPOSED], re-voiced with Kokoro.

## The first-frame fault (ruling d)

Probed first, as the design asked: staging the tavern from Oakhaven under the 3D view, frame 1 differed and frames 2 on matched with the sculpted hands; the pixel hands matched throughout. The cause is the design's: the body pass draws the record `drawHUD` made the frame before, and the sculpted canvas is lit when it is flushed. Fixed with a stamp on each record (bumped by `loadMap`, `restoreGame` and `BODY21.invalidate()`): when the record the pass is about to draw was made under an older stamp, `render()` has `drawHUD` record the first-person pictures once before the scene is drawn (`BODY21.staleRecord()`), once per map change and never in steady play. (The builder's first mend drew the whole frame a second time; that was found wrong at integration, see below.) `test/cover105.test.js` l. 106 is back to one frame.

## Old saves

On every load the `p125b_*` flags are validated (anything not a small integer in range is 0). Once per save: `coda_by_you` with `coda_done` is deleted, and `lyra_voice`, `kaelen_dw_done`, `kaelen_told_now` set (`p125b_cv = 1`); `coda_by_you` without it resets the ring quietly; `ring_struck 'you'` becomes `'kaelen'`; `ring_sat_*` go. A mid-ring save of any kind resets the ring, keeping the lamps. A save at `r43` 3 or 4, `r45` 5, `p53` 9, or made inside a boot loads at that moment's start, and a save made inside a boot holds the traveller's own place.

## Where the design was wrong about the code (and what was done)

- `GEARLOOK21` is a frozen object, so `of` cannot be wrapped from outside: `js/gearlook21.js` gained `setLookHook` (one hook, default none).
- The climb's two-fists pose is drawn inside `drawHUD` while the frame is recorded; `js/body21.js` gained `setExtra` so the boots draw the stool and rail grips there. The needle's and the names' "open" hands are approximated by the default hand pictures (the needle in the right hand; Sable's one hand as a fist on the lid).
- `REEDS.holdPitch` printed "Held n%": `js/reedcraft.js` gained `noScore` (default unchanged), so no number shows in a boot.
- The grey of an Echo was set on the first canvas only, which under the 3D view is not the picture: `RITE43.grey` now greys every canvas.
- The Narrow's stillness bit the hero standing still at stage 5 (the Rite's own keep-alive runs only at stages 3 and 4): in a boot the stillness timer is held at zero and the traveller's health held (design 5.2, "damage to the player is off").
- The menu's Save is not blocked: a save made inside a boot is made safe instead (the traveller's place and `p125b_at`, restarting the moment on load).
- The ring plan card is the game's present-tense retelling, so it reads "She looks at Kaelen." (design 4b, check 2); MS 6028 has "She looked at Kaelen."
- The design's picture "Vane's hands on the rail at Seven" cannot be: he took the axe at Five (3752), so at Seven the axe is in his hand.

## Voices

Kokoro-82M through `tools/voices/build.py`, model files on this machine. Rendered: Ada's new line (`p9_ada.t.632e5c`; `p9_ada.t.6cd1da` removed); the design's new ids for the moments: `vane.manifest.goon`, `vane.manifest.third`, Sable's three entries (`sable.manifest.corwin`, `mirren`, `annet`, each split at commas into two to four recordings, because `test/voice-acting` allows 20 s a line) and `sable.manifest.iknow`, `lyra_ruined.ring.iknow`, `lyra_ruined.ring.twovoice`, `wearer.ring.lark`, `wearer.ring.waited` (her father's voice), `wearer.ring.come` (in Lyra's own whole voice, 6084). Removed: `ignatius.rite.notch`. Unvoiced, as the design has it: the calling lines, the step-in cards, the coda's after card.

## Tests

`test/boots125.test.js`, written first and seen red: **67 of 67** when built, 68 of 68 after integration (below). Taught (each with a comment): `rite43` (the needle and the Hold played in boots; the eyeline and lens checks become the boots' slips; the fallback card's voices open with "Closer, Engineer"; fewer strings), `rope45` (no holding the drum; no cut by Ten is the slip back to Nine), `canon32` (the ring in Lyra's boots; Kaelen strikes; no ring without her voice), `epilogue` (the `lb_you_sang` cases read Lyra's way), `audit54` (not in the design's list: its "read you three" is the moment the design moves into Sable's boots), `cover105` l. 106. Run green: boots125, rite43, rope45, audit54, canon32, epilogue, herald66, companion-talk, cutter68, cover105, hands122, sculpted112, pixelhands110, pixelhands111, body21, presets, voice-acting, voices, story-i18n, sidequests, bell69; `tools/i18n/coverage.js` 99.78% (none of its 12 missing strings is this phase's). **Red when built, not this phase's (taught at integration, below):** `strangers125`, one check ("the six names are nobody else in the books, the bibles or the game"): Phase 125a's own Vol VIII entry names the six strangers, and that test scans the bibles; it fails on the branch base too. `voices` failed on the base too (ASSETS.md did not list the Phase 124c/124d portraits); they are listed now.

## Owed

- Dedicated "open hand" poses for the needle and the names (approximated now).

## Found and mended at integration (the Commander, 24 Nov)

Every one of the 228 suites was run against the branch. Under two runners at once sixteen went red (one of them, `r3d21`, only because the batch's clock ran out on it); run alone, thirteen were green, and three were real (`fold113`, `r3d21`, `text121`):

- **The first-frame mend itself was wrong, and two older suites caught it.** The builder mended the fault by drawing the whole frame a second time. A second `Engine.render` is not draw-only:
  - `test/fold113` (the needle-stones' eyes): the 3D view's read-back (`depthAt`, `materialAt`; `js/r3d21.js`) made one read per task and collected only the read before the last; two renders in one task left one it never collected, every later frame skipped its read, and the read-back stood still for good after any map change. `boots125` check 19b was written first and seen red (a quarter turn must change `depthAt` along the middle row). The read-back now collects every read whose fence has passed, the older first.
  - `test/r3d21` (the seeded trace: 480 steps of play are the same with the 3D view on and off): every module that wraps `Engine.render` moves its own clock on each call, so the leaves of `js/windbells.js` fell a frame early with the 3D view on and took their random number a step early (first difference at step 69). Keeping the second draw out of the random stream did not mend it, because the clock had still moved.
  - **The mend now:** no second draw of the scene. On a stale frame `drawHUD` alone runs once before the scene, so the pass has this place's record, and `Math.random` is a fixed sequence of its own while it does. `boots125` 68 of 68 (check 19: frame 1 hashes equal to frame 2), `fold113` 45 of 45, `r3d21`'s trace green, `cover105`, `sculpted112`, `hands122`, `pixelhands110`, `pixelhands111`, `body21` green.
- **`test/text121` (Phase 121's text), taught.** It pinned Ada Pellow's "Seventy years in one parish" and its recording; it now pins the book's age and that no "Seventy" is left.
- **`test/strangers125`, taught.** Its scan for the six strangers' names read Vol VIII, the game's own layer, whose Phase 125a entry must name them. Vol VIII is left out of the scan; the books and the other bibles are not.
- **The traveller's lines that still spoke of the removed minigames, reworded** (`js/rite43.js`, French in `tools/i18n/p43-rite.tsv`; none is voiced). All three are the game's own words [PROPOSED]:
  - Kaelen: "On Hearthday walk with the column, and when I go to the drum, give them something else to look at. Eight bolts." is now "On Hearthday walk with the column. Eight bolts."
  - Lyra: "Your work is to stand where their eyes go." is now "Your work is to walk with us and be there after."
  - The journal: "My work is not to let them watch him." is now "My work is to walk with them."

## Codex on #165 (two findings, both real, both mended test-first as `boots125` 10b)

- **An entry that plays itself was cut off.** After two slips an entry of the three names was begun only when its fixed 12 to 15 s ran out, and the next entry then cut its reading short. It is now begun at once and lasts as long as its recordings (52 s for Corwin Aye's), the same as a played one.
- **The Ledger could not be reached in the classic view.** The classic view looks at most 40 rows down (9.4°), so the 12° line could never be crossed there: no slip and no Ledger, in the Original preset or with the 3D view off. The line is 7° in the classic view and 12° under the 3D view.
