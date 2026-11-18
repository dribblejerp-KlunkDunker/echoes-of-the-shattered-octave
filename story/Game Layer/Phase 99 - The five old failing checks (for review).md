# Phase 99: the five old failing checks (for review)

*Written 18 Nov 2026. The owner, 18 Nov: "lets fix the old 5 failing checks. if nothing needs to be merged lets move on." Branch `p99-checks`, on top of Phase 98. Built by the Commander alone. Nothing new was added to the world in this phase: no place, person, item or line of story. One line the player reads changed (the save-file limit, section 6), with its French in `tools/i18n/p99-checks.tsv`.*

Five of the game's test suites had been failing on `main` since before Phase 96: `logmap`, `smalllife`, `sprites21`, `sync19` and `net19`. Each was traced to its cause. Four of the five were real faults in the game, not in the checks. None was skipped, loosened to pass, or switched off. Running every suite afterwards found three more that I had missed in Phase 98 (sections 6 to 8).

## What each one was

### 1. `logmap` (the logbook's sketches)
**The fault.** The logbook draws a small sketch beside every journal entry, and a check reads every place in the code that writes an entry to make sure each has a sketch. One place, in the air fights (Phase 93), chose between its three entries in the same breath as writing one, in a form the check could not read, so the check stopped at its first step and never ran the rest.
**The fix.** The air fight now chooses its entry first and then writes it (`js/air93.js`). The three entries, and what the player reads, are the same.
**The check also learned** that the newer painted sketches are kept as picture files, not written into the page; it had been measuring them as if they were written in.
Result: 13 of 13.

### 2. `smalllife` (crows, rats, the moored ship)
**The fault, a real one.** A saved game must be the same whether the "small life" option is on or off. It was not. The ships at the Dawning Heights' docks (Phase 92) and the Drift-Kestrel moored at Sun-Peak Vigil (Phase 96) were only put into the world when the small-life pictures happened to be loaded. With the option off, those places had fewer things in them, so a save made one way did not match a save made the other.
**The fix.** The ships are always put in their places (`js/heights92.js`, `js/vigil96.js`). The option still decides only what it should: whether the small creatures are about.
Result: all pass.

### 3. `sprites21` (the picture sheets the graphics card draws from)
**The fault.** The game packs every figure and prop onto large sheets. The check allowed eight sheets. The game has grown past that honestly: 929 pictures, which cannot fit on eight sheets however they are packed.
**The fix.** Tighter packing, so the same pictures now take 11 sheets where they took 12 (`js/sprites21.js`). The check now says what actually matters: the pictures fit inside the limit of 16 sheets and none is thrown out to make room.
**A second finding.** The check also said pictures were being re-sent to the graphics card over and over. They were not: it was counting the first few seconds, when walking figures' frames are sent once each (39, then 4, then 12, then 1, then none). The check now waits until that has finished and then allows next to nothing.
Result: 9 of 9.

### 4. `sync19` (two players in one world)
Three real faults, found one behind another.

**(a) The guest saw two of some things.** A prop that sways on its own (the moored Kestrel on her rope, the wind's banners) is never in quite the same spot on two screens. The guest's game did not recognise the host's copy as the same thing, and drew both. Now, when there is exactly one such prop on each side, they are treated as one (`js/sync19.js`).

**(b) Visiting a friend's game wrote in your own save.** After leaving the host's world, the guest's own save had gained a mark for a place (the Boar & Dulcimer) that they had only stood in as a guest. The map's place-marks (Phase 97) now do nothing while you are a guest (`js/places97.js`). One more small change there: the place you are standing in is marked as soon as you arrive, not when its name next appears.

**(c) The host let go of a newcomer every time.** This was the cause of the check that failed "by chance". When a guest joins, their game builds the whole of the host's world, and for those seconds it sends nothing. Here that takes about 3 seconds; on a phone it will take longer. The host took that silence for a lost connection, dropped the guest, took them back a few seconds later, and put them back at the host's heels, wherever they had walked to in between. In ordinary play the limit is 4.5 seconds, so a slow phone would have met this on every join.
Two changes (`js/net19.js`, `js/sync19.js`):
- A newcomer is given 15 seconds to build the world before its silence counts for anything.
- A guest whose connection really does drop for a moment comes back **where they stood**, not beside the host again. (The place is kept for 90 seconds, and only for the same guest.)

The 15 seconds end early, at the newcomer's first step, so a connection that truly fails just after joining is still noticed in the ordinary time.

Four new checks: the host does not drop a newcomer who is busy building; that allowance ends with the newcomer's first step; a connection that drops comes back by itself; and the guest is standing where they were.
Result: 54 of 54.

### 5. `net19` (the connection itself, over the internet's own channel)
**The fault.** The same as 4(c). This suite joins a phone to a host over a real peer-to-peer link with a short limit, and the phone's silence while it built the world made the host drop it in the middle of the check.
**The fix.** The same 15 seconds. No change to the suite.
Result: 52 of 52. On `main`, the same suite still fails in the same three places, which is how the cause was confirmed.

## Three more, found by running everything afterwards

**I reported these wrongly in Phase 98.** I wrote then that every suite but the five was passing when run alone. Three more were not: `origins`, `motion10` and `ledger15`. Each fails the same way with Phase 98's own files put back, so none comes from this phase's work; two come from Phase 97's map marks and one from the world's growth. The mistake was in my report, and it is corrected here and in the roadmap.

### 6. `origins` (saving to a file and loading it back)
**The fault, a real one.** A save can be downloaded as a file and loaded back. The loader refuses any file over 512 KB. Where a browser can compress, the file is small and all is well. Where it cannot (older browsers), the game writes the save uncompressed, and with the world as large as it now is (99 places) that file is 559 KB. So on such a browser the game could not load a save it had just written.
**The fix.** The limit is 2 MB (`js/origins.js`), and the message says so, in English and French ("La limite est de 2 Mo."). A new check holds the game's own uncompressed save under half the limit, so this cannot creep up unseen again.
Result: 25 of 25.

### 7. `motion10` (the journey's picture on the travel chart)
**The fault.** Travelling by the chart with the moving picture must give exactly what travelling without it gives. Since Phase 97 it did not: the map's place-marks read the picture's caption as if it were hearsay, and announced "The North Gate is on your map now." in the middle of the journey, before you had arrived.
**The fix** (`js/places97.js`). A place you travel to by the chart is marked without a word: you chose it from a list, and you are standing in it. The travel chart is no longer read for place names at all; like the map, it is a list of places you can already go.
Result: 7 of 7.

### 8. `ledger15` (the map screen)
**The fault.** With a dozen places known, Phase 97's list under the map ("Marked on this map") pushed the "Clear marks" button and the line above it off the bottom of the panel, and cut its own last line in half.
**The fix** (`js/places97.js`). The list takes only the room that is left: whole lines, its heading on the first line, and it scrolls for the rest. Picture: `screenshots/p99/p99-map-panel.jpg`.
Result: all pass.

## What a player will notice
- Joining a friend's game no longer stutters into "connection lost" and back again on a slow device.
- A hiccup in the connection no longer pulls the guest back to the host.
- The guest sees one moored ship and one set of banners.
- Being a guest leaves your own save untouched.
- A downloaded save loads back on an older browser too.
- No "is on your map now" in the middle of a journey; the map screen's Clear marks button is always in view.

## The owner's rulings recorded with this phase (18 Nov)
- **"the compass is good."** The compass points at people who have quests, as built in Phase 97. Giving each step of every quest its own place to point at is not wanted now. Phase 97's question 3 is closed.
- **"remind me later about everything that is mine to decide."** The open list is kept and repeated in each report until answered. It stands at the end of this record.

## Verification
**Every suite was run** (200 of them, two at a time on a two-core machine, which is harder on the timing checks than running alone). 186 passed first time. The 14 that did not, each run again alone:

| Suite | What it was | Now, alone |
|---|---|---|
| `origins`, `motion10`, `ledger15` | Real faults, older than this phase (sections 6 to 8) | fixed: 25, 7, all |
| `together19` | A weak spot in the check itself: it compared two pages' pictures of a room without setting the animation clock, which counts real time since the page opened. A figure standing in the room was drawn in a different frame of its idle on the two pages about one run in two (a dozen pixels). The clock is now set before the pictures are taken. | 3 of 3, the same picture every time |
| `sync19`, `net19` | Timing checks under the load of two suites at once | 54 and 52 |
| `cinematic24`, `far14`, `couriers`, `screens`, `roads15`, `deep16`, `festivals12` | The known timing-sensitive ones, under load | all pass |
| `r3d21` | The long 3D suite ran out of time under load | 24 |

After the last change to the game's files, these were run again one at a time and pass: `logmap` 13, `smalllife`, `sprites21` 9 (three runs), `sync19` 54, `net19` 52, `together19` (three runs), `origins` 25, `motion10` 7, `ledger15`, `places97` 17, `compass97` 10, `reader97` 27, `bearings82b` 33, `screens` 60, `skies14` 51, `cantabile17` 40, `pwa18` 88, `r3d21` 24, `partner19` 19, `card21` 11, `story-i18n` 17.

**Two checks were made steadier without being made easier:**
- `sprites21` read one point on a figure to see that the graphics card had drawn it. That point could fall in the gap between two legs, depending on the stride. It now reads five points down the figure and needs two of them to show the figure.
- `logmap` compares the map screen's markup with the legend on and off. The list of places now sizes itself to the room left, so its height follows the legend; that one number is held out of the comparison.

**Not measured here:** frame time on a real graphics card, and two real devices on a real network. The two-player checks run two browser pages on one machine through a local relay or a local signalling stub.

## Still the owner's to decide (carried forward)
1. **Recorded voices for every line, or the device's voice** (Phase 97). Recorded lines do not slow the game: each is fetched the first time it is spoken and kept. What grows is size: 12 MB of voices today, about 250 MB if all 9,800 lines were recorded.
2. **The reader's keys**: F2, F3 or `[`, F4 or `]` (Phase 97).
3. **Shall the other towns' houses be raised like Oakhaven's?** (Phase 97)
4. **The White Mile** (Phase 97): its [PROPOSED] list and five questions: the Tallyman's count (nine, or fourteen); the white house cannot be climbed; nobody there by day; the light can still kill after the Unison's blow; the rest as listed in that record.
5. **The glass arm on the left, and the straight punch** (Phase 98).
6. **Four names** (Phase 98): the Chalk-White Shell-Plate, the Ridge-Flint, the Standing Note's Reed, the Beam-Key; and that the keepers leave weapons, not worn pieces.
7. **Pegs by the hearth for keepers' trophies** (Phase 98).
8. **Merging**: pull requests #130, then #131, then #132, then this phase's, in that order.
