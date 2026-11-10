# Overnight plan, 10–11 November 2026

A queue of work that can run without the owner's input. Each item is built from the manuscript, so no canon ruling is needed. Each one ships as its own pull request and merges when its tests pass. Anything that needs the owner is listed at the end and left alone.

## Standing rules for the night

- **Book accurate.** Every scene follows Book One's text. Play may add how the traveller takes part, but never changes what happens in the book, and no book character speaks words the book does not give them. A failure the book does not contain is an Echo (shown grey, then the moment again).
- **When the book is silent or contradicts itself,** take the reading that keeps later chapters true, mark it [PROPOSED] in the text record, and list it in the morning report. Never block on it.
- **Every pull request carries:**
  - its tests: a new test file for the scene, plus the full suite;
  - French pairs for every new line;
  - recorded voices for new dialogue, using the Kokoro pipeline;
  - a text record in `story/Game Layer/`, a Vol VIII entry, and updates to PLAYTEST.md and the ROADMAP tick;
  - at least one screenshot, which is looked at before it is sent.
- **Skills used each time:** code review on the diff before the PR is marked ready; bug diagnosis for any test that fails; merge-conflict resolution when `main` has moved.
- **Git:** you are the author on every commit, and Claude (noreply@anthropic.com) is the committer. Nothing is force-pushed to `main`. A PR merges only when GitHub's checks are green and the full local suite has nothing new red. A failure that already exists on `main` is compared against `main` and noted on the PR, not hidden.
- **Stop rules:** stop an item and skip to the next if:
  - it needs a decision only the owner can make;
  - it would delete or rewrite existing content;
  - it fails three rounds of fixes.

  Note each skip for the morning.

## The queue, in order

0. **Land the test-fixes PR.** The 16 tests broken on `main`, the hay-barn as the fourth building that can burn, and the two text lines brought back to the book. It merges once the full 156-file run is clean.
1. **R9 #21: the herald and the temptation, with Echoes** (ch. 24, "Heartglass"). Effort S–M. The herald's offer and the glass's argument, played. Refusing is canon; accepting is an Echo.
2. **R9 #22: the Grafters' Rootday round** (ch. 3, "Burl"). Effort M. The white wagon's round of the Hollow, door to door with the register. The traveller watches or walks with Lyra, and the round ends as the book has it.
3. **R9 #20: the cutter chase on deck** (ch. 21, "Ten Heartbeats"). Effort M–L. The Office cutter hunting by sound and the ten heartbeats. Built on the existing deck (`js/kestrel16.js`) and the rope scene's helpers.
4. **R9 #23: the Prologue, "The Cracked Bell", as an extra.** Effort M. Played from the title menu's extras, word for word from the prologue.
5. **R9 #24: Echo I, played** ("The Thread Where She Answered"). Effort M. Also an extra, framed as an Echo, as the book frames it.
6. **R9 #25: the small canon touches.** Effort S each. Batched, five to a PR. Taken from the brainstorm's gap list, choosing only the touches the manuscript states outright.
7. **R6: Book One's unused epigraphs as documents in the world.** Effort M. The 24 chapter epigraphs placed where the book says they come from, read like the library's books, using the book's own words:
   - the Grafting Office handbook;
   - K. Vance on calibration;
   - Catalogue Circular 12;
   - the crates' bill of lading;
   - the Warrant of Purification;
   - the Rubric of the Rite;
   - and the others.
8. **R10 W4: the small places come to life.** Effort M. The Flume landing, the Lowrings, the Bell Yard, the Hollow and the clearing, using the `life60` engine and its gate: every stop reachable, every hour covered, streets empty at night as canon says.
9. **R10 W5: interiors.** Effort M–L. People at work inside the houses, shops, the Boar, the chapel and the Greenhall, again using `life60` and its gate.

The queue is longer than one night on purpose. Whatever is not reached stays in this order for the next run.

## Left for the owner (not touched overnight)

- **R7:** the human playtest on real hardware, the performance check on a low-end laptop and a phone, the store copy, and the credits and licences review.
- **R8:** French for the library's books (they are English drafts until signed off), the revision pass on the weaker books, and the second wave of books.
- **R5 #8:** the Deep Grove (optional, highest risk).
- **Canon questions still open:** Tam Sowerby (Brainstorm §5 #24), Leaffall (#23), and the rest of the Vol VIII open list.
- **The R6 items that are design rather than book:**
  - "NPCs notice your calling";
  - the Listen verb;
  - dialect and feast talk;
  - recurring voices.

## How it keeps running

- An hourly scheduled check-in resumes this plan in the same session.
- Each check-in takes the next unfinished item, or babysits an open PR to green.
- When the queue is empty, or at 15:00 UTC on 10 November (07:00 US Pacific, about ten hours after the plan starts), the check-ins stop and the morning report goes to the owner. The report lists:
  - what merged, with links;
  - what was skipped and why;
  - every [PROPOSED] choice made in the night;
  - the screenshots.
