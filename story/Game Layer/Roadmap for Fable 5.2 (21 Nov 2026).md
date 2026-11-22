# Roadmap for Fable 5.2 (21 November 2026)

The owner, 21 Nov 2026: "when this session is complete I need you to give me a prompt for the next session using fable 5.2 on these next objectives and any others that will benefit from fable. put it into a road map and give it phases". His standing preference: everything that needs Fable 5.2 is done first, before work another model can do.

Where the game stands (end of Phase 110, 21 Nov):
- **The Reach** is built, roads and big places included.
- **The Dawning Heights** are built: the Umbral Tiers, the Anchorage, the Pilgrim Chain and the Altar, the White Mile, the school, the black square, the Vigil, the Chalk Cliffs, and all four keepers.
- **The Continental Rift** has part one: Null-Watch, the Wall and the Talking Halls.
- **The look:** Phases 105 to 108 (ground cover, the visual sweep, sharp figures, ceilings, beeches, natural edges, every town raised).
- **The hands:** Phase 109 built three options, and the owner chose pixel art for now and the sculpted hands lit by the world in the end. Phase 110 put the pixel hands in the game.

## Part A: Fable 5.2 (in this order)

Fable 5.2 goes where the judgement is the work: art that must look finished, places read from the books, writing in the books' voice, designs for the owner's ruling.

| Phase | What | Done when |
| --- | --- | --- |
| **111** | **Done 22 Nov, waiting for the owner's nod** (record: `Phase 111 - The pixel hands, touched up.md`). **The pixel hands, touched up.** The arm behind a shield in pixel art (`js/body21.js`, `offArmArt`). The glass arm by day reads lighter than the review sheet: the 3D view brightens every first-person picture, so hold the glass's approved deep azure. The Song's old additive tint whitens the hands: give the pixel hands their own Song light. The broad flat palm and thumb pad, and the blotchy glove wear. The hands through every swing, the lowering and raising, the Song and the climb, frame by frame. Optionally, the night tints the pixel ramps (the hands darker and warmer by a lamp). | A sheet beside column 3 of `screenshots/p109-options.jpg` that matches or beats it, by day and by night, with every weapon kind, the shield and the climb; `test/pixelhands110.test.js` extended; the owner's nod. |
| **112** | **The sculpted hands, lit by the world: finished, shown, not yet the default.** The owner's aim (21 Nov: "I do want to eventually use the sculpted lit by the world"). `tools/hands109/hands109s.js` to finished standard: a real bare fist (Phase 109's weak point), the glass luminous as approved, every weapon gripped (use `FP87.paint(wid, look, { noHands: true })` and its `grips`, as Phase 110 does), the swings and the Song as moving joints, the game's own light fed in each frame. Into the game as an Options choice ("Hands: pixel / sculpted") with pixel still the default. | A sheet and a short clip: every weapon kind, by day, night and lamplight, beside the pixel hands; the owner rules when sculpted becomes the default in the 3D view (pixel stays for the classic view). |
| **113** | **The Continental Rift, part two: the Rift Wall and the Under-Shelves.** Lore brief first (every line in `story/Books/` and `story/World Bibles/` about them; Vol VI is the manuscript's for the Rift); what the books do there later is never done by the player; places as of Harvestmonth 419. If the book overturns the plan, hold and give the owner two or three designs. | Built, lore-bound, tested, French, pictures, Vol VIII; or a findings record if the book leaves nothing to build. |
| **114** | **The Rift, part three: Redoubt Zero and the Edge**, with their keepers and Souls lamps (Phase 91's rules). | As 113. |
| **115** | **The Rift, part four: the seven smaller places**, read by lore readers one place each (as Phase 96 did): built where the books allow, withdrawn with a findings record where they do not. | Every one built or withdrawn with its reason. |
| **116** | **Roofs for the later places.** Sun-Peak Vigil, Null-Watch and Cross Pool have no roofed houses to raise (Phase 108). Design their buildings' roofs from the books, a picture of each, then raise their houses as Phase 108 did. | The owner has chosen; built and pictured. |
| **117** | **The Middle Country, part one.** Lore briefs against the Phase 89 and 90 plans; its great city laid out by its frequency (the owner's Cymatic City Engine, as Sol-Luminary was); something of its own in its buildings (Phase 78's rule). Several phases; plan them at the start. | Its plan checked against the books and ruled; its first places built. |
| **118** | **Book One in play (R9).** The open set-pieces in ROADMAP's R9 list: the Madder birth on day 0, Ilse Brennan as the voiceless song-teacher, NPCs noticing your calling, paying the ledger off, an Echo card if you answered the Hedge, a "Listen" verb, the nine days counting, voices you cannot see, the Pure Note drone, dialect and feast talk. Writing in the books' voice. | Each one built or set aside with its reason. |
| **119** | **Pack weight and wear, and the far land** (the Daggerfall list's 3, 4 and 5): designs with numbers first, each with a switch, for the owner's ruling. | Ruled, then built. |
| **120** | **The Library's second wave.** Revise the weaker books (the owner's notes); new books toward 100 without padding (lives of canon minor figures, a Cantabile broadsheet run, children's books, a book for each festival); books that carry story (Hymn 9's words, the eight pump-men). | New books in, each with a voice and an ending; the owner reviews. |

## Part B: Opus 5.5 can do these (after, or between, Part A)
- French for the library's books, once the owner signs off the English.
- The remaining roads from the world plan with the road builder (`js/road79b.js`): the Cliff Walk, the Willow Walks and the Plaza of the Willows, the road to the Stump.
- A full run of every suite (two at a time; the load-sensitive ones alone), triaged; README, ROADMAP and release notes kept current.
- Release preparation (R7): store copy only from verified features, credits and licences checked, saves from earlier builds load.
- Tidy the ROADMAP's stale unticked lines (the Heights' "next" lines are done: Phases 95 to 98).

## Two sessions at once (added 21 Nov, evening)

The owner, 21 Nov: "I have another session going on this same repo can you find out what exactly its working on and add it to this roadmap so that everything works together well without a bunch of issues".

**The owner, 21 Nov, later: "I will leave that other projects alone for now lets just keep working on this one here".** So this section is kept for the day the two are brought together; decisions 4 to 7 below it are parked, and nothing here is owed until then.

### What the other session is doing

Found from GitHub and from the Project's chats on 21 Nov, about 9 pm:
- **It is the realistic-look session** (the chat "Project roadmap R5 and R9", last active 8:48 pm). It builds ROADMAP **R11, "match the benchmark pictures"**, with Three.js.
- **It does not work in this repo.** It works in the companion repo `Echoes-Of-The-Shattered-Octave-3D`, a copy of the game taken at commit `7f0bbf3` (8 Nov, pull request #104). This repo has no open pull request and no branch newer than Phase 110.
- **Its last finished piece** is R11 phase 4, which the owner merged into the 3D repo today (its pull request #7): the Hedge as geometry and the North Gate, the Long Mole as Book Two has it (blended with the Forge boats and lamps), water with reflections, and the link that jumps a started game to the square, the gate or the harbour.
- **What is next on its own plan:** R11 phase 5 (the townsfolk as 3D people with their daily rounds), then phase 6 (every map). Still open from earlier phases: real arms and their movement, the thorn face of the Hedge, Old Harrow drawn too dark, and the Forge models waiting for the owner's review.
- **What could not be seen:** anything it has not pushed yet, and its newest messages (they are not searchable yet). If the owner means a different session, this section needs redoing.

### Where the two meet

Since the copy was taken, this repo has changed 9,385 files (Phases 75 to 110) and the 3D repo 388 (nearly all new: Three.js, its models and textures, its own tests).

| What | The trouble | The rule |
| --- | --- | --- |
| Six files changed in both: `index.html`, `sw.js`, `locales/story/fr.json`, `README.md`, `ROADMAP.md`, `js/r3d21.js` | They will clash whenever the two are brought together. | `index.html`: keep the highest `?v=` of each, both sets of script tags. `sw.js` and `fr.json` are never merged by hand: run `node tools/i18n/merge-pairs.js tools/i18n/*.tsv`, then `node tools/pwa/precache.js`. `js/r3d21.js`: the 3D repo's change is 17 lines (the 3D view steps aside while the realistic one draws); carry them over as they are. |
| Game files only the 3D repo changed: `js/cantabile17.js`, `js/life64-cantabile.js`, `tools/i18n/p17-cantabile.tsv`, the Phase 17 text record, `tools/pwa/precache.js` | Port Cantabile's Long Mole was rebuilt to Book Two **in the pixel game too**, and the Mole-bell's line rewritten, but only in the 3D repo. This repo still has the old harbour. | Bring the Mole into this repo before anything else is built at Port Cantabile (see "Bring up" below). |
| The 3D repo's copy of the game is 35 phases old | It has no roads, no Dawning Heights, no Rift, no raised towns, no ground cover, no pixel hands. Anything R11 builds for "every map" or "the townsfolk" on that copy is built on a world that has moved. | Bring the 3D repo up to this repo's `main` before R11 phase 5, and again before phase 6. |
| Hands | There are now three sets: the pixel hands (Phases 110, 111), the sculpted hands (Phase 112), and the realistic look's own (`js/r11vm.js`). They do not clash in code: the realistic look turns the game's own hands off while it draws. | The owner rules which hands the realistic look uses in the end (decision 5 below). Neither session edits the other's hands. |
| The glass arm | Here: deep azure planes, dark seams, a bright rim, no green at rest (approved 14 Nov). In the 3D repo: sea-green glass with one moving green vein, "like a river under ice". Both quote the books. | The owner rules (decision 4 below). Until then each keeps its own. |
| Towns and roofs | Phase 108 raised every town to a table of proportions; Phase 116 gives the later places their roofs. The realistic look builds its own houses. | R11 reads `js/towns108.js` for each town's proportions, and builds the later places only after Phase 116. |
| People | R11 phase 5 makes the townsfolk 3D. Phases 102 to 104 gave them voices, Phase 107 sharper pictures, and Phase 118 adds people and lines. | R11 phase 5 takes its cast from this repo's `main` after it has been brought up; people added by Phase 118 are done in a second pass. |

### The rules for working side by side

1. **One repo each.** The realistic-look session pushes only to the 3D repo. Phases 111 to 120 and Part B push only to this repo.
2. **This repo is the game.** Maps, lines, lore, the books, French and the tests are changed here. The 3D repo owns only what begins with `r11` (`js/r11*.js`, `test/r11*`, `assets/r11/`), `vendor/three/`, `docs/graphics/` and `proof/`.
3. **A change to the game made in the 3D repo is brought here at once**, as its own small pull request, so the two copies never tell different stories.
4. **Lore goes into Vol VIII in this repo**, the realistic look's too.
5. **Nothing comes back from the 3D repo into this one except by a pull request the owner has seen pictures of.**
6. Each session fetches `main` before it names a branch, keeps to its own ports (this repo 4176; the 3D repo's teams 4211 and up), and never force-pushes.

### The order, with both in it

| When | Who | What |
| --- | --- | --- |
| Now | Realistic look | **Bring the 3D repo up to this repo's `main`** (Phase 110, or 111 once merged). Reconcile the six files by the rules above. Run its `r11` suites and this repo's `body21`, `fp-hands`, `pixelhands110`, `presets`, `pwa18`, `story-i18n`, `desktop`. |
| Now | This repo (Opus 5.5 can) | **Bring up the Long Mole:** the 3D repo's `js/cantabile17.js`, `js/life64-cantabile.js`, the `p17-cantabile.tsv` line and the Phase 17 record, with their checks, as one pull request. Then `bearings82b`, `cantabile`, `life64` and the French merge. This comes before the Cliff Walk in Part B. |
| After the 3D repo is up to date | Realistic look | R11 phase 5, the people, for the cast as it then stands. |
| After Phase 112 | Owner | Decision 5: the realistic look's hands. |
| After Phases 113 to 116 | Realistic look | Bring up again, then R11 phase 6 (every map), reading Phase 108's proportions and Phase 116's roofs. |
| After Phase 118 | Realistic look | The people Phase 118 added. |
| When R11's own gates are met | Owner | Whether and when the realistic look comes into this repo (decision 6). |

### A note to paste to the other session

> Another session is building Phases 111 to 120 in the main repo (`echoes-of-the-shattered-octave`). Read `story/Game Layer/Roadmap for Fable 5.2 (21 Nov 2026).md` there, the section "Two sessions at once", before you go on. In short: keep pushing only to the 3D repo; bring the 3D repo up to the main repo's `main` before you start R11 phase 5 (six files clash: `index.html`, `sw.js`, `locales/story/fr.json`, `README.md`, `ROADMAP.md`, `js/r3d21.js`; rebuild `fr.json` and `sw.js` with the tools, never by hand); do not change game files there again (the Long Mole in `js/cantabile17.js` is being brought into the main repo); leave the glass arm and the hands as they are until I rule; tell me what you are working on right now so it can be added to that section.

## The owner's (no model can do these)
- A full playtest on real hardware, in English and French, and the two-player game over a real network.
- A performance check on a low-end laptop and a phone.

## Open decisions for the owner (as of 21 Nov)
- Phase 107: the wording of the hedgerow's and the wood's edge's inspect lines; which ten places got natural edges, and whether more should.
- Phase 108: each town's proportions; the later places' roofs (Phase 116 above).
- Phase 110: when the sculpted hands become the default (Phase 112 above).
- Phase 111: the nod for the touched-up pixel hands (`screenshots/p111-hands.jpg`, `screenshots/p111-kinds.jpg`).
- **From "Two sessions at once" (parked by the owner on 21 Nov):**
  - 4. The glass arm: one look in both, or each its own? Here it is deep azure with no green at rest (approved 14 Nov); the realistic look has sea-green glass with one moving green vein.
  - 5. The realistic look's hands in the end: its own arms, or the sculpted hands of Phase 112 carried over (one set of poses for both)?
  - 6. When the realistic look comes into this repo, and whether the Pixel style stays the default until then.
  - 7. Is the realistic-look session the one you meant? If it is another, say which.

## The prompt for the next session (Fable 5.2, high effort)

Paste this to start:

> You are working on my browser RPG "Echoes of the Shattered Octave", repo github.com/dribblejerp-KlunkDunker/echoes-of-the-shattered-octave (I wrote the books it is made from; they are in `story/`). You are on Fable 5.2, high effort. Read `ROADMAP.md` (start with "Fable 5.2 roadmap (21 Nov 2026)") and `story/Game Layer/Roadmap for Fable 5.2 (21 Nov 2026).md`, then the last three phase records in `story/Game Layer/` (Phases 109, 110, 111), then begin **Phase 112** and carry on through the Part A phases in order, one phase at a time, using the /octave-phase-cycle skill.
>
> My standing rules (none may be broken):
> - Book canon wins: the manuscripts beat the bibles; Vol III and III(b) beat Vol I and II; Vol VI is the manuscript's for the Rift. If something is canon in the books it must be kept in the game. Keep everything lore-bound. Read the books before designing any place (a lore brief quoting file and line). What the books do later is never done by the player; places are shown as of Harvestmonth 419. Inventions are marked [PROPOSED] for me.
> - All art is made in code. Nothing visual uses random numbers (hashed noise is fine). Every weapon and worn item has its own unique look. Each region has something of its own.
> - French for every new in-game line (`tools/i18n/p<N>-*.tsv`, then `node tools/i18n/merge-pairs.js tools/i18n/p*-*.tsv`). Run `node tools/pwa/precache.js` after any `?v=` change or French merge.
> - Every update goes into the game lore: `story/World Bibles/Vol VIII - The Game Layer.md`, in the same commit.
> - Visual effects get an Options switch, off in the Original preset (start a new switch with `PRESETS.keep(flag)` so a player's choice is kept across launches). Every file in `js/` must be loaded by `index.html`.
> - A failing test first; the related suites run (`tools/dev/runsuites.sh OUTDIR suite...`, through the browser lock; the load-sensitive ones alone); pictures you have looked at, sent to me as you go; a record in `story/Game Layer/`; README with pictures; ROADMAP ticked; the record also in my claude.ai Project.
> - Commit and push everything. Open the pull request and merge it yourself through the REST API (`gh api repos/<owner>/<repo>/pulls ...`, merge with `gh api -X PUT .../pulls/<n>/merge -f merge_method=merge`; GraphQL is blocked). Wait for the Codex review first; fix real findings, answer the rest on their threads. Never force-push, never skip or disable a test.
> - Another session may be working on the same repo: fetch main before numbering a phase. A second session builds the realistic look (R11) in the 3D repo: read "Two sessions at once" in the roadmap and keep its rules (one repo each; this repo is the game; never merge `sw.js` or `fr.json` by hand).
> - No sub-agents unless the phase cycle or I ask for them.
> - Keep the list of decisions that are mine and bring it up in every report. End every report with the model and effort the next step needs.
>
> Tools in the repo:
> - `tools/dev/dbg.js` and `tools/dev/dbg3d.js` (evaluate in the game).
> - `tools/dev/sweep106.js`: pictures of any place; `map@x,y,dir` stands somewhere, `FLAGS=a=0,b=1` sets switches, `R3D=1` uses the 3D view.
> - `tools/dev/hands109.js`: the hands review sheet over the game's own frame.
> - `tools/dev/hands111.js`: your own hands as the game draws them, any weapon, shield, hour, swing, Song or climb (`CROP=1`, `R3D=0`, `EVAL=`); `tools/dev/px111.js`: the pixel hands alone, no game loaded; `tools/dev/sheets111.py`: the review sheets.
> - `tools/dev/closeup107.js` and `tools/dev/sprpng107.js`: close-ups and sprites.
> - Serve the working copy with `python3 -m http.server 4176 --bind 127.0.0.1` before any browser job.
