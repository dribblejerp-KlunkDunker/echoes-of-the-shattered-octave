# Phase 99: the five old failing checks (for review)

*Written 18 Nov 2026. The owner, 18 Nov: "lets fix the old 5 failing checks. if nothing needs to be merged lets move on." Branch `p99-checks`, on top of Phase 98. Built by the Commander alone. Nothing new was added to the world in this phase: no place, person, item or line of story. No words the player reads were added or changed, so there is no new French.*

Five of the game's test suites had been failing on `main` since before Phase 96: `logmap`, `smalllife`, `sprites21`, `sync19` and `net19`. Each was traced to its cause. Four of the five were real faults in the game, not in the checks. None was skipped, loosened to pass, or switched off.

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

Three new checks: the host does not drop a newcomer who is busy building; a connection that drops comes back by itself; and the guest is standing where they were.
Result: 53 of 53.

### 5. `net19` (the connection itself, over the internet's own channel)
**The fault.** The same as 4(c). This suite joins a phone to a host over a real peer-to-peer link with a short limit, and the phone's silence while it built the world made the host drop it in the middle of the check.
**The fix.** The same 15 seconds. No change to the suite.
Result: 52 of 52. On `main`, the same suite still fails in the same three places, which is how the cause was confirmed.

## What a player will notice
- Joining a friend's game no longer stutters into "connection lost" and back again on a slow device.
- A hiccup in the connection no longer pulls the guest back to the host.
- The guest sees one moored ship and one set of banners.
- Being a guest leaves your own save untouched.

## The owner's rulings recorded with this phase (18 Nov)
- **"the compass is good."** The compass points at people who have quests, as built in Phase 97. Giving each step of every quest its own place to point at is not wanted now. Phase 97's question 3 is closed.
- **"remind me later about everything that is mine to decide."** The open list is kept and repeated in each report until answered. It stands at the end of this record.

## Verification
VERIFY_PLACEHOLDER

## Still the owner's to decide (carried forward)
1. **Recorded voices for every line, or the device's voice** (Phase 97). Recorded lines do not slow the game: each is fetched the first time it is spoken and kept. What grows is size: 12 MB of voices today, about 250 MB if all 9,800 lines were recorded.
2. **The reader's keys**: F2, F3 or `[`, F4 or `]` (Phase 97).
3. **Shall the other towns' houses be raised like Oakhaven's?** (Phase 97)
4. **The White Mile** (Phase 97): its [PROPOSED] list and five questions: the Tallyman's count (nine, or fourteen); the white house cannot be climbed; nobody there by day; the light can still kill after the Unison's blow; the rest as listed in that record.
5. **The glass arm on the left, and the straight punch** (Phase 98).
6. **Four names** (Phase 98): the Chalk-White Shell-Plate, the Ridge-Flint, the Standing Note's Reed, the Beam-Key; and that the keepers leave weapons, not worn pieces.
7. **Pegs by the hearth for keepers' trophies** (Phase 98).
8. **Merging**: pull requests #130, then #131, then #132, then this phase's, in that order.
