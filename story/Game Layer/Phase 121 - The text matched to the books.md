# Phase 121: the text matched to the books

*Written 23 Nov 2026. Branch `p121-text`. The owner: "Match any inconsistency to match the book" (28 Oct); "match the game to the books" (23 Nov); "come up with new names for 4" (23 Nov); proposals accepted in advance so long as they make sense. The first item of the audit of 23 Nov (sections 3.2 and 3.3), the names of `Rulings of 23 Nov 2026.md`, and the texture budget.*

Nothing new was added to the world. Words, four names and one number changed. In each line only the wrong fact changed; ids, flags, item ids, sprite and portrait keys, quest steps and rewards are as they were. Every changed line has its French in `tools/i18n/p121-text.tsv`. The check is `test/text121.test.js`, written and committed first, failing.

## A. Weekdays the world does not have

The Series Bible's Canon Ledger: "No weekdays". The week is the eight Anchor-days (Vol VII). The days chosen are **[PROPOSED]**.

| Where | It said | It says now | Why this day |
|---|---|---|---|
| The Hollow's loop (`js/maps.js`, `js/life62-whispergrove.js`, `js/deep16.js`, the ledger page) | "the bread's for Thursday" | "the bread's for Hearthday" | Hearthday is the day of the hearth-stone (Vol VII); bread is a hearth thing. |
| Bryony Wick's letter (`js/data.js`) | "Tom and Wat are to sing on Thursday" | "on Memoryday" | The boys sing for the dead at the Cloister; Memoryday is the day a name is said aloud. |
| Halder Wick's dresser (`js/grove.js`) | "no Thursday marked on anything" | "no Memoryday marked on anything" | It answers the letter. |

The word Thursday is now nowhere in the game's text. (`grove.js` had no bread line; the third bread line is the ledger in `deep16.js`.)

## B. Old contradictions (Vol VIII, Part V)

| # | Where | It said | It says now | The book |
|---|---|---|---|---|
| 4 | Harrow, "The Hedge" (`js/data.js`) | "I've stood this gate eleven years." | "I've kept a gate in this town eleven years, and this one since they planted the Hedge." | The Hedge and its gate are from 417 (Series Bible; Vol V; P6 page 11: "The gate is shut at dusk. Harrow keeps the key.") [PROPOSED wording] |
| 4 | The rumour of the North Gate (`js/rumours.js`) | "Eleven years he has kept it shut at night" | "Eleven years he has kept a gate in this town, and this one shut at night since the Hedge went in" | the same |
| 4 | Harrow's quiet-feet lesson (`js/ledger15.js`) | "I have kept this gate eleven years on quiet feet." | "I have kept a gate in this town eleven years on quiet feet, and this one since the Hedge." | the same (it says HE kept THIS gate) |
| 5 | Vane on the road (`js/companion-talk.js`) | "I carried twelve crates for two years" | "I carried crates for two years, twelve to a run" | Book One ch. 4: twelve crates is this one consignment; ch. 13: "Thirteen hundred-odd crates' worth" in two years; "twelve crates to a load, eleven loads". |
| 6 | Kaelen on the road (`js/companion-talk.js`) | "Nobody came to the hut in four years" | "in seven years" | Book One: "a charcoal-burner's hut every morning for seven years"; "nobody in Oakhaven had done for him in seven years". |
| 7 | A rumour (`js/rumours.js`) | "green-gold at the wrist" | "pale blue at the wrist" | Book One: "a faint green warmth rising through the pale blue ... up the wrist"; Books Three and Four: "cyan, lit". The rest of the rumour stays. |
| 8 | Part Three's card (`js/grove.js`) | "forgot themselves in one night in 416" | "in a few days in 416" | Book One ch. 14: Halder "taken on the second day", the Renns "on the fourth day"; Sable wrote the names "in eleven days". |
| 8 | Whisper-Grove, the plain answer (`js/data.js`, TOPICS) | "forgot themselves in one night" | "forgot themselves in a few days" | the same |
| 8 | The shroud in Whisper-Grove (`js/grove.js`) | "forgot themselves in one night" | "forgot themselves in a few days" | the same; a third line with the same wrong fact, not in the design's list, changed with the other two |
| 9 | The epilogue, the coda sung against the choir (`js/epilogue.js`) | "It cost her what was left of her voice. She talks in chalk now, in capitals, and makes every word earn its place on the wall." | "It cost her most of what was left of her voice. She spends the rest sparingly now, low and seldom, and makes every word earn its place." | Book One ch. 24: "In the end it was Lyra who answered the herald ... and said, in that torn and carrying voice"; Vol VII: her voice goes in Book Two. The other Lyra variants of that slot agree (a ruin, not nothing; hums under her breath). |
| 10 | Ada Pellow, "Oakhaven" (`js/sidequests.js`) | "Seventy years in one street." | "Seventy years in one parish." | Book One: "the Pellow farm, out past where the Hedge runs now". |
| 11 | Ada Pellow, and Old Tam (`js/sidequests.js`) | "nine winters" (twice) | "two winters" | Book One: Tam "had been a night-hummer since the first autumn of the Hedge", 417. `test/sidequests.test.js` pinned "Nine winters": its expected words changed with the line. |
| 12 | The Tarrows' house (`js/house13.js`) | "three weeks gone"; "nobody has answered it for weeks"; the hearth "has been for weeks" | "two years gone"; "for two years"; "for two years" | Oakhaven has been shut in behind the Hedge since 417. "The last cart before the gate was barred" now reads as two years ago, which the book allows. Maud's "Back by the first frost" stays as written. Steps, flags and rewards unchanged. |
| 13 | The Kestrel's repairs (`js/kestrel16.js`) | "a fifth less gold" (twice), "a fifth off the gold" | "a fifth less in sovereigns" (twice), "a fifth off the sovereigns" | The world's coin is the sovereign (Book One: "Four hundred and eighty sovereigns against the Kestrel"). The design named two lines; there were three, all changed. |
| 14 | "traveler" (`js/books.js`, 26 lines of the Cantabile serial; `js/upgrades.js`, the first title) | "traveler" | "traveller" | Books Two to Four are British; the game is. No changed line quotes Book One. An old save's title "Traveler on the Greenroot Road" is respelled when it loads. |

**Left alone, as the design says:**
- The mooring mast "on the east side of the square" (`js/game.js`). The words are true of the game's map; the book has it north, over the quarry. Moving it is a map change, not a text change.
- The tanner's twins as a story (Pim's is the book's only culvert lure). Only their surname changes (C below).
- Harrow's "I have hung it eleven years running" (`js/festivals12.js`, the Last Sheaf). It is about the Sheaf, which could have been hung on the old North Gate before the Hedge; it does not say he kept this gate. Vol VIII B23 lists it beside the others: the owner can strike it.
- The other "eleven years" in the game (a Cantor's slate in `conservatory59.js`, the likenesses' histories in `data.js`, the Library) are about other things.

**Seen and not changed (outside the design, for the owner):**
- The Wearer's burst: "two years of Kaelen talking to himself in an empty hut" (`js/coda.js`). Kaelen was in the hut seven years. It may mean the two years it listened. Not changed.
- The Dirge (`js/data.js`): "A Cacophony made of three hundred years of eaten funeral songs". The Dirges are the Mausoleum's lesser things, not the choir; the design changed only the choir's own text. Not changed.
- In the coda scene itself Lyra still writes "THAT'S IT" in chalk (`js/coda.js`), before the epilogue. The design's item was the epilogue; not changed.

## C. The new names [PROPOSED] (Rulings of 23 Nov 2026)

| Was | Now | Where | Kept |
|---|---|---|---|
| Umber, the Library's old scribe (410, c. 290) | **Smalt** | The two books in `tools/library/books/a_history.json` and `e_faith.json` (the bylines, "Mine is Smalt.", "Copied fair by the scribe styled Smalt"), the cross-reference notes in `g_grove.json`; `js/library26-books.js` rebuilt with `node tools/library/build.js` | The Reach's runaway scribe stays **Umber** (`js/data.js`, `couriers.js`, `game.js`, `rumours.js`). |
| Linnet, the hush-gift child | **Pipit** | `js/data.js`, `wilds.js`, `epilogue.js`, `portraits.js` | **Linnet Tarrow** (`js/house13.js`, her Counting-Beads) keeps her name. Ids, sprite and portrait keys stay `wren`; the flag stays `wren_saved`. |
| Abner Fenning, the tanner; Ned and Wyn Fenning | **Jabez Barker**; **Ned and Wyn Barker**; "the Barker twins"; his letters signed "J. Barker" | every line that named them (21 files, with the code's comments) | Ids and flags stay (`hob`, `hob_told`, `twins_named`, `a_p87_tan_*`). |
| The Requiem; the Requiem's Chord-Plate | **the Unended Office**; **the Unended Office's Chord-Plate** | `js/data.js` (the enemy's name, Lyra's journal line), `coda.js`, `epilogue.js`, `hearth15.js`, `score.js` (the boss theme's name), comments; the voice script's speaker card | Ids, flags and item ids stay (`requiem`, `requiem_done`, `lyra_requiem`, `p15_t_requiem`, `boss_requiem`). |

The choir's own text: "three hundred years of funeral offices" is now "eleven hundred years" (Vol V: "The Veil kept its house in the deep Woods for eleven hundred years"), in four lines (`coda.js` twice, `coda.js` ending, `epilogue.js`). The sexton's "register of interments ... three hundred years of it" (`coda.js`) is another thing and stays.

The logbook files journal entries by their first words. The new entries begin "The Unended Office:"; `js/logmap.js` now knows those words and still knows "The Requiem:", so an old save's entry keeps its sketch.

Tests whose expected words were the old names, changed with the lines: `canon32` (Pipit; Jabez Barker; "The Unended Office: in the choir"; "against the Unended Office"), `festivals12` (Ned Barker), `rite43` (Jabez Barker at the kerb), `logmap` (a sample journal line now says Pipit).

French: Smalt, Pipit, Jabez Barker, « l'Office inachevé » (« L'Office inachevé », « La Plaque d'accord de l'Office inachevé »); Hearthday Âtredi, Memoryday Mémoiredi, as `p11-calendar.tsv`. The Library's books and three help texts had no French before and have none now.

## D. The texture budget

The cap on the textures the game draws for itself (`js/decals.js`, `CAP_BYTES`) is raised from 512 KB to **768 KB (786,432 B)**, under the owner's standing acceptance (the Rulings of 23 Nov, afternoon, item 1). The comment table now says what is true: 12 decals 196,608 B, 1 grain 16,384 B, 8 ceilings 131,072 B, so 344,064 B; with the 11 painted tiles (180,224 B), 524,288 B, exactly the old cap, which is why `painted20` had been failing. `js/painted20.js`'s comment says the same.

`test/painted20.test.js` now reads the cap from `DECALS.capBytes` (no number of its own), and also checks the cap is no more than 768 KB. `test/surfaces.test.js` pinned 512 KB for the decals alone; it now checks the decals' budget is under `DECALS.capBytes` and the cap is no more than 768 KB. It stays a tripwire: if the art grows past 768 KB, both fail.

## The voices

Re-made with Kokoro (kokoro-onnx 0.6.1, `kokoro-v1.0.int8.onnx` and `voices-v1.0.bin` from the model-files-v1.0 release, kept outside the repo), through `tools/voices/build.py`, English only. **Every changed line that had a recording has one again; none was lost.** 126 recordings were made:

- Harrow, "The Hedge" (the gate he has kept): 1.
- Sim at the tannery, "Jabez is outside. He likes the air.": 1.
- Ada Pellow, "Seventy years in one parish.": 1.
- The two tanner rumours ("Jabez Barker on Tannery Row oils his leather"; "The Barker twins went down the culvert"), in the three gossips' voices (p92_folk, townsman, townswoman): 6.
- The plain answer about Whisper-Grove ("forgot themselves in a few days"), in the voice of every person who gives it (Phase 104: each in their own voice): 117.

The three old recordings whose lines are gone (`harrow.t.69795e`, `p29_sim.g.380638`, `p9_ada.t.d7698d`) were removed by the build; the rumour and Whisper-Grove recordings keep their ids and were rendered over. The voice script's card for the choir now reads "The Unended Office", eleven hundred years (its lines are sung and have no recording). The names in `tools/voices/dialogue.json` (Jabez Barker, Pipit) changed with the game. None of the other changed lines (the companions' road talk, the epilogue, the house, the cards) had a recording.

How the dialogue was re-dumped: `tools/voices/dump-dialogue.js` against the running game also found two Phase 113 people (the trooper of the Watch, Old Marrable) and one new topic (p100_qm, "Work") that had never been voiced. Recording them would add to the world's voices, which this phase does not do, so `dialogue.json` takes only the changed lines of the people it already had; those three wait for a phase of their own.

## The suites, on the final code (port 4221, through `tools/dev/browser.sh`)

text121 63 of 63 (it failed 57 of 63 when committed first); story-i18n 17; voices 14; voice-acting 4; sidequests 29; painted20 6 (it had been failing on `main`: the tiles and decals came to exactly the old cap); surfaces 3; logmap 13; owntopics96 5; books 6; pwa18 89; desktop 73; canon32 43; r2canon27 25; rite43 37; hearth15 27; epilogue 154; companion-talk 124; life62 16; origins 25; and festivals12, house13, kestrel16, deep16, ledger15, songcraft12 all exit 0 (they print "ok" lines rather than counts). All pass.

r4thin29 fails one check ("the Downs as built keeps no people or uses"). It fails the same way on `main` before this phase (run there on its own); nothing here touches it.
