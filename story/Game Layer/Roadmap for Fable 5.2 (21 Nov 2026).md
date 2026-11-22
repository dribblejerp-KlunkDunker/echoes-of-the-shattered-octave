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
| **111** | **The pixel hands, touched up.** The arm behind a shield in pixel art (`js/body21.js`, `offArmArt`). The glass arm by day reads lighter than the review sheet: the 3D view brightens every first-person picture, so hold the glass's approved deep azure. The Song's old additive tint whitens the hands: give the pixel hands their own Song light. The broad flat palm and thumb pad, and the blotchy glove wear. The hands through every swing, the lowering and raising, the Song and the climb, frame by frame. Optionally, the night tints the pixel ramps (the hands darker and warmer by a lamp). | A sheet beside column 3 of `screenshots/p109-options.jpg` that matches or beats it, by day and by night, with every weapon kind, the shield and the climb; `test/pixelhands110.test.js` extended; the owner's nod. |
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

## The owner's (no model can do these)
- A full playtest on real hardware, in English and French, and the two-player game over a real network.
- A performance check on a low-end laptop and a phone.

## Open decisions for the owner (as of 21 Nov)
- Phase 107: the wording of the hedgerow's and the wood's edge's inspect lines; which ten places got natural edges, and whether more should.
- Phase 108: each town's proportions; the later places' roofs (Phase 116 above).
- Phase 110: when the sculpted hands become the default (Phase 112 above).

## The prompt for the next session (Fable 5.2, high effort)

Paste this to start:

> You are working on my browser RPG "Echoes of the Shattered Octave", repo github.com/dribblejerp-KlunkDunker/echoes-of-the-shattered-octave (I wrote the books it is made from; they are in `story/`). You are on Fable 5.2, high effort. Read `ROADMAP.md` (start with "Fable 5.2 roadmap (21 Nov 2026)") and `story/Game Layer/Roadmap for Fable 5.2 (21 Nov 2026).md`, then the last three phase records in `story/Game Layer/` (Phases 108, 109, 110), then begin **Phase 111** and carry on through the Part A phases in order, one phase at a time, using the /octave-phase-cycle skill.
>
> My standing rules (none may be broken):
> - Book canon wins: the manuscripts beat the bibles; Vol III and III(b) beat Vol I and II; Vol VI is the manuscript's for the Rift. If something is canon in the books it must be kept in the game. Keep everything lore-bound. Read the books before designing any place (a lore brief quoting file and line). What the books do later is never done by the player; places are shown as of Harvestmonth 419. Inventions are marked [PROPOSED] for me.
> - All art is made in code. Nothing visual uses random numbers (hashed noise is fine). Every weapon and worn item has its own unique look. Each region has something of its own.
> - French for every new in-game line (`tools/i18n/p<N>-*.tsv`, then `node tools/i18n/merge-pairs.js tools/i18n/p*-*.tsv`). Run `node tools/pwa/precache.js` after any `?v=` change or French merge.
> - Every update goes into the game lore: `story/World Bibles/Vol VIII - The Game Layer.md`, in the same commit.
> - Visual effects get an Options switch, off in the Original preset (a returning player's preset is applied before late modules load: start a new switch with `PRESETS.startValue(flag)`). Every file in `js/` must be loaded by `index.html`.
> - A failing test first; the related suites run (`tools/dev/runsuites.sh OUTDIR suite...`, through the browser lock; the load-sensitive ones alone); pictures you have looked at, sent to me as you go; a record in `story/Game Layer/`; README with pictures; ROADMAP ticked; the record also in my claude.ai Project.
> - Commit and push everything. Open the pull request and merge it yourself through the REST API (`gh api repos/<owner>/<repo>/pulls ...`, merge with `gh api -X PUT .../pulls/<n>/merge -f merge_method=merge`; GraphQL is blocked). Wait for the Codex review first; fix real findings, answer the rest on their threads. Never force-push, never skip or disable a test.
> - Another session may be working on the same repo: fetch main before numbering a phase.
> - No sub-agents unless the phase cycle or I ask for them.
> - Keep the list of decisions that are mine and bring it up in every report. End every report with the model and effort the next step needs.
>
> Tools in the repo:
> - `tools/dev/dbg.js` and `tools/dev/dbg3d.js` (evaluate in the game).
> - `tools/dev/sweep106.js`: pictures of any place; `map@x,y,dir` stands somewhere, `FLAGS=a=0,b=1` sets switches, `R3D=1` uses the 3D view.
> - `tools/dev/hands109.js`: the hands review sheet over the game's own frame.
> - `tools/dev/closeup107.js` and `tools/dev/sprpng107.js`: close-ups and sprites.
> - Serve the working copy with `python3 -m http.server 4176 --bind 127.0.0.1` before any browser job.
