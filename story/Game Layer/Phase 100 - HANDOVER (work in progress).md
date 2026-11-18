# Phase 100, the Continental Rift, part one: handover (work in progress)

Branch `p100-rift` (from `main` fbd98c8). Written 18 Nov 2026 in case the session is cut off. Delete this file when the phase ships.

## Done and pushed
- `js/rift100.js`, `js/rift100_grid.js`, `tools/maps/wall100.py`: two maps (`p100_wall`, `p100_halls`), the Souls lamps (group `m`), the Kestrel's far flight, the talk rule on the wall, the Stray in Magazine Four, the battery rail, the people. The canon it rests on is in the header of `js/rift100.js`.
- The nineteenth gear set (`watch`) in `js/gear87.js`; looks in `js/gearlook21.js`; first-person paintings in `js/fp87.js` (`spike` blade, `kegmallet` head); voices in `js/voices.js`.
- French: `tools/i18n/p100-rift.tsv` (284 lines), merged; `sw.js` regenerated.
- Pictures: `screenshots/p100/`.
- Both maps build with no page errors and every room is reachable (probe run 18 Nov).

## Still to do
1. `test/rift100.test.js` (not written): maps build; reachability by bfs; three lamps in group `m`; the chain turns you back without a subject; the Murmur says the subject's next line; quiet, the bell's rescue near a manned battery, Relieved on the Seven-to-Nine stretch, talk saving you, death at the parapet; the hall swallows noise; roster, footlocker, felt rack; the Stray's cycle, the gap, wrong and right answers, stand-down, leavings once, cannot be put down by blows; the shot refusal; the rail's three stops; gear looks unique; voices authored; hostile flags.
2. Run `gear87`, `look10`, `voices`, `souls91`, `paintfolk76`, `logmap`, `places97`, `bearings82b`, `pwa18`, `story-i18n`, `sprites21`, `origins`, then every suite. `gear87` now expects 19 sets.
3. Records: `story/Game Layer/Phase 100 - The Continental Rift, part one (text for review).md`; Vol VIII section ("last: Phase 100"); README section with the pictures; ROADMAP; the Project doc.
4. Pull request `p100-rift` into `main`. The owner said (18 Nov) to complete pull requests, so merge it once every suite is green.

## For the owner to decide (all [PROPOSED])
- The Kestrel moors in the mooring-yard under the wall (Book Three) and not at the west gate (the Phase 90 layout); the west gate is the far end.
- The flight is 48 hours.
- The battery rail has a third stop, at the mooring-yard.
- Visitors need a subject from the talk-roster before Two-Eleven lets them up the wall stair; "keep talking" is the Murmur (N).
- Tower Eight is unmanned, so Seven to Nine has no bell.
- The Stray is not killed: the fourth line of its lullaby stands it down. The lullaby's four lines.
- Troopers are known by rota-number. The names of the set and its five pieces. The numbers in `B` (seconds of quiet, the bell's reach).
- The Rift side of the wall-walk has a shin-high lead coping, not a parapet, so the lip can be seen over it.

## The eleven old pull requests (plan accepted by the owner, 18 Nov; for Opus 5.5 at high effort, after Phase 100)
One pull request at a time. Bring the branch up to today's `main`, settle the conflicts, run every suite, then merge. Never skip a failing test.
1. Bring up to date and merge: #105 (Phase 66 small places), #118 (Phase 75 canon touches), then #45, #41, #40. For #40 (a co-op fix), first check that Phase 99's two-player work (`js/sync19.js`, `js/net19.js`) has not already replaced it.
2. Check first, then merge or close: #44 (Phase 21 ground), #36 (Phase 15 work), #39 (World Bible Vols I and II dates). They are 365 to 605 commits behind `main`; only the absence of their files from `main` has been checked, not their contents. Book canon wins over the bibles.
3. The owner's to decide, not to be merged without his word: #88 (Book Four, Part Two, chapters 5 to 8: a draft; merging makes it manuscript) and #48 (the Phase 23 living-figures pilot).
4. Close without merging: #23 (`main` into the old `phase10-picks` branch; nothing to gain).
