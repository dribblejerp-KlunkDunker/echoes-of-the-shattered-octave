# Phase 124c: Faces of their own, the first three, and the way in for the rest

24 November 2026. By the owner's ruling of 24 Nov (3:46 pm): everyone who borrows the townsman's or the townswoman's portrait gets a painted face of their own, made with a picture-making tool in the style of the first twenty-eight (the all-art-in-code rule set aside for portraits only). This phase puts the first three in and builds the way in for the rest: **each later portrait is one file and one table row.**

| Person | NPC id(s) | Portrait |
|---|---|---|
| Old Marrable, the Fold's lamp-teller | `p113f_marrable` (js/fold113.js) | `img/p_own_marrable.jpg` |
| Trooper 132 of the Null-Watch | the figure `p100_tr_b`, worn by `p100_tr_b` (js/rift100.js, the Halls and the Wall) and `p113_trooper` (js/tip113.js, the tip) | `img/p_own_watch132.jpg` |
| The Tallyman of the White Mile | `p97_tallyman` (js/whitemile97.js) | `img/p_own_tallyman.jpg` |

Pictures: `screenshots/p124-own.jpg` (the talk window on each, switch on; Old Marrable with it off; the five pictures at twice size). Made by `tools/dev/own124-shots.js`.

## The survey: every place a portrait reaches the screen

Read before anything was changed (`grep -n "img/p_\|\.portrait" js/*.js`, and every reader of `.port img`).

| Place | What it does | Changed? |
|---|---|---|
| js/game.js `renderDialogue` (l. 1737) | the talk window: `img/p_<n.portrait>.jpg` | **Yes**, asks `FACES124.portrait(n)` |
| js/portraits.js `pick` and `apply` | mood faces (Phase 5, Phase 20 FOLK): only for the twenty story portraits in `MAJOR`; `ensure` builds `img/p_<id>.jpg` for those ids only | **Yes**, `pick` and `apply` read the portrait shown (`FACES124.portrait`), so an own portrait is never looked up as a story face. For everyone else it is the same id as before |
| js/companion-talk.js `setMood` (l. 665) and the Talk panel (l. 677) | the companions' Talk panel and its moods | **Yes**, through `FACES124.portrait(P)` (companions have painted portraits; nothing changes for them) |
| js/party.js (l. 334) | the party bar's companion faces | **Yes**, through `FACES124.portrait(C)` (as above: no change) |
| js/flourish11.js (l. 447) | reads the talk window's `<img>` for an animation; builds no path | No |
| js/reader97.js (l. 168) | reading aloud: `name|portrait` is a key for a new speaker, not a path | No (the key still changes per person) |
| js/mods.js (l. 191, 511) | a mod's NPC names a portrait from the allowed list | No (a mod's person is not in OWN) |
| js/partner19.js (l. 946), js/game.js (l. 1854), js/card21.js | the traveller's own face (`img/face_N.jpg`) | No (not a portrait of a person met) |
| NPC makers that set `portrait:` (js/life60.js l. 175, js/vigil96.js, js/rift100.js `npc()`, js/calendar11.js, js/longnight17.js, and the rest) | the entry's portrait name | No: the entries are untouched, so with the switch off everything is as before |

## How it works

`js/faces124.js`, Phase 124c section:

* `FACES124.OWN`: NPC id (or a figure's sprite id, where several NPC ids are one person) to the file stem.
* `FACES124.portrait(npcOrId)`: the portrait name to show. The person's own if the switch is on and a row serves them; otherwise exactly the entry's `portrait`.
* `FACES124.servedBy(npcOrId)`: which row serves a person, or null. A row serves only someone whose entry borrows `townsman` or `townswoman` (never the townsman and townswoman themselves): the twenty-eight paintings and the people who have them cannot be touched by a row, typo or not. The NPC id is tried first, then the figure's sprite id.
* Switch `GFX.ownFaces`, Options > Graphics & access, **"Faces of their own"**, the row right after "Recoloured people keep their skin". On by default; off in Original (`PRESETS.keep`, as 124b). Off, every talk window is byte for byte what it was (tested over the whole NPCS table).
* Mood faces: an own portrait has none, like any minor portrait (`PORTRAITS.pick` gives null for all four entries even with a frightened line and Blunt; the same line gives Lyra her afraid face).
* French for the row: `tools/i18n/p124-own.tsv`. The three pictures are in the offline list (`sw.js`).

## How to add a portrait (two minutes)

1. Save the picture as **`img/p_own_<name>.jpg`**, a JPEG **96 by 96** pixels (the first twenty-eight's size), `<name>` in lower case letters, digits or `_` (for example `img/p_own_oona.jpg`).
2. Add **one row** to `OWN` in `js/faces124.js`: the person's NPC id from the list below, then the stem: `p17c_oona: 'own_oona',   // Oona Salt, the Harbour-Queen (js/cantabile17.js)`. Where one person has several NPC ids that wear one figure (Hesper `p17c_hesper` and `p17c_hesper2`, Marlow Quain, trooper 132), key the row by the figure's sprite id instead. Never key by a sprite many different people wear (`townsman`, `townswoman`, `hollow`, `p16f_dockman`, `p96v_cleric_f`, `p17c_child`...): give each such person their own NPC-id row.
3. Bump `js/faces124.js?v=` in `index.html`, run `node tools/pwa/precache.js` (puts the picture in the offline list), then the test: `PORT=4227 tools/dev/runsuites.sh /tmp/out own124`. It fails loudly on a row naming nobody, a missing file, a wrong size, a row that serves no borrower, or any other person's portrait changing; and it prints who still borrows.

## Who still borrows

**The count: 254 NPC entries, not 76.** The "seventy-nine" of the audit and the rulings is the number of source lines that write `portrait: 'townsman'` or `portrait: 'townswoman'` outright (40 and 39; `test/own124.test.js` prints it: 79). In the running game, with every map entered once, **258** NPC entries showed one of the two borrowed faces before this phase (101 the townswoman's less the townswoman herself, 159 the townsman's less himself): one source line can make many people (js/vigil96.js makes twelve clerics from two lines, js/life60.js makes every road- and town-walker from one rule, js/rift100.js gives the Watch their portrait through a helper and is not in the 79 at all). Three of the 79 lines are now served (Marrable, the trooper at the tip, the Tallyman), and four entries (with `p100_tr_b`). The test pins 258 and checks that those still borrowing are 258 less those served.

Some entries are one person (Orrin Pale is `orrin`, `p16h_orrin` and `p29_sexton`; Hesper, Marlow Quain each twice; the four `p60_q_*` "from Oakhaven" are Oakhaven walkers seen again in the queue at the Yard). Some never open a talk window at all: `cat`, `lamplighter` and `bettis` are sent to their own handlers by js/game.js `talk()`; the Hollows (`hollow` figures) speak a line in the message bar if their id is `hollow`, but the named Hollow entries below do open the talk window.

**How their portrait is chosen today**, for those not written out by hand:

* **js/life60.js** (every `p60_*`: the walkers of Oakhaven, the clearing, Whispergrove, Flume, Cantabile, the Hollow, Bellyard, the Yard queue and the roads, placed on arrival at their map by the hour): `p.portrait || (/wom|child/.test(p.sprite) ? 'townswoman' : 'townsman')`: a woman's or **any child's** figure gives the townswoman's face, boys included (`p60_tullboy`, `p60_wicker`, `p60_ld_boy`, `p60_sluice` are boys with her face); every other figure, the Hollows and the Office clerks included, the townsman's.
* **js/vigil96.js** (the twelve `p96v_*` clerics of the Vigil): by the file's `FEMALE` table, sisters the townswoman's, brothers the townsman's; they share two figures (`p96v_cleric_f`, `p96v_cleric_m`), so each needs an NPC-id row.
* **js/rift100.js** (the Watch at the Rift, `p100_*`): its `npc(id, key, name, sprite, portrait)` helper, the portrait written per person in its call.
* **js/calendar11.js** (`p11c_*`, the market stall-keepers, on market days only): `portrait: v.sprite`, the painting their recoloured figure was made from.
* **js/festivals12.js** (`p12_*`, on feast days), **js/narrow28.js** (`n28_*`, at night), **js/thin29.js** (`p29_*`, by the hour), **js/longnight17.js** (the keepers, `K.portrait`): written per person, placed when their time comes.

The full list, from the test's own output (`still borrows:` lines), with where each is met (the maps whose entities name them, every map entered once on a new game at Nullday afternoon; "not on any map at start" means placed later by a story step, a day or an hour):

| # | NPC id | Name | Borrows | Figure (sprite) | Where met |
|---|---|---|---|---|---|
| 1 | `umber` | Umber, a runaway of the Veil | townswoman | `sable` | clearing |
| 2 | `orrin` | Orrin Pale, sexton | townsman | `townsman` | Oakhaven chapel, placed by js/chapel27.js (Book One person, js/data.js) |
| 3 | `cat` | A cat | townsman | `cat` | whispergrove, p16k_kestrel_deck, p16k_kestrel_below |
| 4 | `lamplighter` | The lamplighter | townsman | `hollow` | whispergrove, p16k_kestrel_deck, p16k_kestrel_below |
| 5 | `bettis` | A Hollow with a basket | townswoman | `hollow` | malting |
| 6 | `sexton` | A Hollow sexton | townsman | `sexton` | deepwoods |
| 7 | `mourner` | A Hollow mourner | townswoman | `mourner` | deepwoods |
| 8 | `moor_bookseller` | Bastien Corvo, pedlar of Cantabile broadsheets | townsman | `townsman` | tavern |
| 9 | `p9_ada` | Ada Pellow, widow of Cooper's Row | townswoman | `townswoman` | oakhaven |
| 10 | `p9_tomas` | Reeds-Miner Tomas, timber-cutter | townsman | `townsman` | clearing |
| 11 | `p11_dicer` | Garrow Finch | townsman | `townsman` | tavern |
| 12 | `p11c_herb` | Market herb-seller | townswoman | `townswoman` | Oakhaven market, on market days (js/calendar11.js stalls) |
| 13 | `p11c_larder` | Market provisioner | townsman | `townsman` | Oakhaven market, on market days |
| 14 | `p11c_tinker` | Market tinker | townsman | `townsman` | Oakhaven market, on market days |
| 15 | `p11c_odds` | Oddments-seller | townswoman | `townswoman` | Oakhaven market, on market days |
| 16 | `p11c_fish` | Flume fisher-wife | townswoman | `townswoman` | Oakhaven market, on market days |
| 17 | `p12_baker` | Brenna Loft, baker | townswoman | `townswoman` | Oakhaven, on feast days (js/festivals12.js) |
| 18 | `p12_dunna` | Dunna Sedge, sheaf-binder | townswoman | `townswoman` | on the harvest feast (js/festivals12.js) |
| 19 | `p13h_wenna` | Bethan Marl, neighbour to the Tarrows | townswoman | `townswoman` | oakhaven |
| 20 | `p15l_clerk` | Anselm Fenn, Consortium clerk | townsman | `townsman` | greenhall |
| 21 | `p15l_veil` | Oswin Marl, Veil ledger-keeper | townsman | `townsman` | placed by js/ledger15.js (a trainer) |
| 22 | `p15_dealer` | Nessa Tolliver | townswoman | `townswoman` | tavern |
| 23 | `p16f_pellam` | Tobit Dree, lockkeeper | townsman | `p16f_keeper` | flume_landing |
| 24 | `p16f_madge` | Madge Tallow, fence | townswoman | `p16f_dockwoman` | flume_landing |
| 25 | `p16f_orrin` | Barnaby Haft, Timber Compact cutter | townsman | `p16f_cutter` | flume_landing |
| 26 | `p16f_hand` | Wharf hand | townsman | `p16f_dockman` | flume_landing |
| 27 | `p16f_wife` | Raft-wife | townswoman | `p16f_rafter` | flume_landing |
| 28 | `p16h_dessa` | Dessa Quill, letter-writer | townswoman | `townswoman` | oakhaven |
| 29 | `p16h_orrin` | Orrin Pale, sexton | townsman | `townsman` | chapel |
| 30 | `p16h_steward` | Steward Merrin Oake, Timber Compact | townsman | `townsman` | clearing |
| 31 | `p16h_mossbrook` | Reeve Alder Mossbrook | townsman | `townsman` | greenhall |
| 32 | `p16h_ines` | Ines Tarn, night clerk | townswoman | `townswoman` | p16h_depot3 |
| 33 | `p16k_pennick` | Pennick, the Kestrel's engineer | townsman | `p16k_pennick` | the Kestrel (js/kestrel16.js, aboard) |
| 34 | `p17p_seraphina` | Seraphina | townsman | `p17p_seraphina` | the Prologue, the River Gate (js/prologue17.js) |
| 35 | `p17p_ignatius` | Ignatius Crane | townsman | `p17p_ignatius` | the Prologue (js/prologue17.js) |
| 36 | `p17p_solenne` | Solenne | townsman | `p17p_solenne` | the Prologue (js/prologue17.js) |
| 37 | `p17p_dorran` | Dorran Sedge | townsman | `p17p_dorran` | the Prologue, at the river gate (js/prologue17.js) |
| 38 | `p17c_teague` | Kerrow, Harbour office | townsman | `p17c_teague` | cantabile_office |
| 39 | `p17c_oona` | Oona Salt, the Harbour-Queen | townswoman | `p17c_oona` | cantabile_harbour |
| 40 | `p17c_bessa` | Auld Bessa, the last Reef-Reader | townswoman | `p17c_bessa` | cantabile_harbour |
| 41 | `p17c_teel` | Hollis Teel, Free Captain | townsman | `p17c_teel` | cantabile_harbour |
| 42 | `p17c_sloe` | Fenwick Sloe, chandler | townsman | `p17c_sloe` | cantabile_chandler |
| 43 | `p17c_tace` | Marrin Tace, widow | townswoman | `p17c_tace` | cantabile_widow |
| 44 | `p17c_dunmore` | Mr. Dunmore, Receiving Clerk | townsman | `p17c_dunmore` | cantabile_harbour |
| 45 | `p17c_hesper` | Hesper, of the four houses | townswoman | `p17c_hesper` | cantabile_harbour |
| 46 | `p17c_hesper2` | Hesper, of the four houses | townswoman | `p17c_hesper` | cantabile_cay |
| 47 | `p17c_quain` | Marlow Quain, pilot | townsman | `p17c_quain` | cantabile_harbour |
| 48 | `p17c_quain2` | Marlow Quain, pilot | townsman | `p17c_quain` | cantabile_cay |
| 49 | `p17c_mags` | Mags Tennant | townswoman | `mags` | cantabile_harbour |
| 50 | `p17c_wife` | A net-wife on the fifth landing | townswoman | `p17c_wife` | cantabile_harbour |
| 51 | `p17c_hand` | A deck-hand of the Yard | townsman | `p17c_hand` | cantabile_harbour |
| 52 | `p17c_child` | A child on the Cay | townswoman | `p17c_child` | cantabile_cay |
| 53 | `p17n_marl` | Marl Dunning, bass | townsman | `ln17_marl` | ln17_orchard, ln17_gallery |
| 54 | `p17n_tansy` | Tansy Quill, apprentice | townswoman | `ln17_tansy` | ln17_orchard, ln17_gallery |
| 55 | `p17n_jory` | Jory Fenn, lamplighter | townsman | `ln17_jory` | ln17_orchard, ln17_gallery |
| 56 | `p22_tamar` | Tamar Farrant, shepherd | townswoman | `p22_tamar` | p22_combe |
| 57 | `p22_gideon` | Gideon Thrale of the Bellwether | townsman | `p22_gideon` | p22_bellwether |
| 58 | `lib_ilse` | Ilse Brennan, Cantor-Master | townswoman | `townswoman` | lib_conservatory |
| 59 | `lib_odile` | Odile Quayle, book-runner | townswoman | `townswoman` | lib_bonded |
| 60 | `lib_shelver` | A Hollow among the shelves | townsman | `hollow` | lib_moot |
| 61 | `n28_lamplighter` | Godwin Pettigrew, lamplighter | townsman | `townsman` | Oakhaven at night (js/narrow28.js) |
| 62 | `n28_hummer` | A night-hummer | townswoman | `townswoman` | Oakhaven at night (js/narrow28.js) |
| 63 | `p29_agnes` | Agnes Tull, the baker's wife | townswoman | `townswoman` | p29_bakery |
| 64 | `p29_ambrose` | Ambrose Vettle, chandler | townsman | `townsman` | p29_chandler |
| 65 | `p29_hurst` | Mother Hurst | townswoman | `townswoman` | p29_farmhouse |
| 66 | `p29_jem` | Jem Cotter, shearer | townsman | `townsman` | p29_barn |
| 67 | `p29_abel` | Abel Sedge, turf-cutter | townsman | `townsman` | p20_downs |
| 68 | `p29_ennis` | Ennis Crowle, beekeeper | townswoman | `townswoman` | flume_road |
| 69 | `p29_sim` | Sim Fletch, tannery hand | townsman | `townsman` | tannery |
| 70 | `p29_moll` | Moll Fletch, tannery hand | townswoman | `townswoman` | tannery |
| 71 | `p29_gil` | Gil Wade, punt-poler | townsman | `p16f_dockman` | flume_lowrings |
| 72 | `p29_ysolde` | Ysolde Marrow, salvager | townswoman | `p16f_dockwoman` | flume_lowrings |
| 73 | `p29_corvin` | Corvin Ash, smuggler | townsman | `p16f_dockman` | flume_landing |
| 74 | `p29_prue` | Prue Lettice, broadsheet-seller | townswoman | `p16f_dockwoman` | flume_landing |
| 75 | `p29_sexton` | Orrin Pale, sexton | townsman | `sexton` | Oakhaven chapel yard, 5:30 to 8 (js/thin29.js, by the hour) |
| 76 | `p30_lissa` | Lissa Merrow | townswoman | `townswoman` | p30_hollow |
| 77 | `p30_hob` | Hob Wendle, field-hand | townsman | `townsman` | p30_hollow |
| 78 | `p31_twice` | A man against the wall | townsman | `p31_seated` | p31_bellyard |
| 79 | `p31_sweeper` | A Hollow with a broom | townsman | `hollow` | p31_bellyard |
| 80 | `p31_jugs` | A Hollow at a window | townswoman | `hollow` | p31_bellyard |
| 81 | `p31_shutters` | A Hollow at the shutters | townsman | `hollow` | p31_bellyard |
| 82 | `p46_marrit` | Marrit Pell, housekeeper to the Governor | townswoman | `townswoman` | p46_house |
| 83 | `p92_ysolde` | Mother Ysolde Carrow, harbour-master | townswoman | `p92_veiled` | p92_tiers |
| 84 | `p92_canvas` | The woman under the black canvas | townswoman | `p92_folk_b` | p92_tiers |
| 85 | `p92_joss` | Joss Feveril, of the seventh chain | townsman | `p92_folk_c` | p92_tiers |
| 86 | `p92_folk` | One of the Umbral folk | townsman | `p92_folk_d` | p92_tiers |
| 87 | `p94_bardo` | Winchmaster Bardo | townsman | `p94_bardo` | p94_anchorage |
| 88 | `p95_perpetua` | Perpetua Lisle | townswoman | `p95_perpetua` | p95_house |
| 89 | `p95_warden` | A Flambeau of the winch | townsman | `p95_flambeau` | p95_house |
| 90 | `p96v_coriel` | Abbess Coriel | townswoman | `p96v_coriel` | p96_cell |
| 91 | `p96v_fabian` | Brother Fabian | townsman | `p96v_cleric_m` | p96_vigil |
| 92 | `p96v_ottavia` | Sister Ottavia | townswoman | `p96v_cleric_f` | p96_vigil |
| 93 | `p96v_domitia` | Sister Domitia | townswoman | `p96v_cleric_f` | p96_vigil |
| 94 | `p96v_albinus` | Brother Albinus | townsman | `p96v_cleric_m` | p96_vigil |
| 95 | `p96v_honoria` | Sister Honoria | townswoman | `p96v_cleric_f` | p96_vigil |
| 96 | `p96v_marcellin` | Brother Marcellin | townsman | `p96v_cleric_m` | p96_vigil |
| 97 | `p96v_prisca` | Sister Prisca | townswoman | `p96v_cleric_f` | p96_vigil |
| 98 | `p96v_quintin` | Brother Quintin | townsman | `p96v_cleric_m` | p96_vigil |
| 99 | `p96v_liviana` | Sister Liviana | townswoman | `p96v_cleric_f` | p96_vigil |
| 100 | `p96v_clemence` | Sister Clemence | townswoman | `p96v_cleric_f` | p96_vigil |
| 101 | `p96v_galen` | Brother Galen | townsman | `p96v_cleric_m` | p96_vigil |
| 102 | `p96c_treble` | The treble | townsman | `p96c_treble` | p96_school |
| 103 | `p96c_cantor` | The Cantor | townsman | `p96c_cantor` | p96_school |
| 104 | `p97_scav` | A scavenger of the line | townswoman | `p97_scav` | p97_mile |
| 105 | `p100_ward` | General Theresa Ward | townswoman | `p100_ward` | p100_wall |
| 106 | `p100_94` | Ninety-Four, the General's voice | townsman | `p100_94` | p100_wall |
| 107 | `p100_19` | Nineteen | townsman | `p100_19` | p100_wall |
| 108 | `p100_88` | Eighty-Eight | townsman | `p100_88` | p100_wall |
| 109 | `p100_tr_a` | A trooper of the Watch | townsman | `p100_tr_a` | p100_halls, p100_wall |
| 110 | `p100_tr_c` | A trooper of the Watch | townswoman | `p100_tr_c` | p100_halls, p100_wall |
| 111 | `p100_tr_d` | A trooper of the Watch | townsman | `p100_tr_d` | p100_halls, p100_wall |
| 112 | `p100_mastcrew` | One of the mast-crew | townsman | `p100_mastcrew` | p100_wall |
| 113 | `p100_roster` | The roster-corporal | townsman | `p100_roster` | p100_halls |
| 114 | `p100_issue` | One-Oh-Six, at the issue-hatch | townsman | `p100_issue` | p100_halls |
| 115 | `p100_corp` | Corporal One-Forty-Two | townsman | `p100_corp` | p100_halls |
| 116 | `p100_51` | Fifty-One | townswoman | `p100_51` | p100_halls |
| 117 | `p100_207` | Two-Oh-Seven | townsman | `p100_207` | p100_halls |
| 118 | `p100_watcher` | A watcher by the bunks | townsman | `p100_watcher` | p100_halls |
| 119 | `p60_tullboy` | Tull's boy | townswoman | `p17c_child` | oakhaven |
| 120 | `p60_dyer` | The dyer's wife | townswoman | `townswoman` | oakhaven |
| 121 | `p60_washer` | A washerwoman | townswoman | `townswoman` | oakhaven |
| 122 | `p60_chandlerwife` | Vettle's wife, the chandler's | townswoman | `townswoman` | oakhaven |
| 123 | `p60_rowwife` | A goodwife of Cooper's Row | townswoman | `townswoman` | oakhaven |
| 124 | `p60_carpenter` | A carpenter | townsman | `townsman` | oakhaven |
| 125 | `p60_thatcher` | A thatcher | townsman | `townsman` | oakhaven |
| 126 | `p60_appleA` | An orchard hand | townswoman | `townswoman` | oakhaven |
| 127 | `p60_appleB` | An orchard man | townsman | `townsman` | oakhaven |
| 128 | `p60_woolman` | The wool-factor's man | townsman | `townsman` | oakhaven |
| 129 | `p60_fuller` | A fuller | townsman | `townsman` | oakhaven |
| 130 | `p60_hayman` | A hay-carter | townsman | `townsman` | oakhaven |
| 131 | `p60_kidA` | A child of Oakhaven | townswoman | `p17c_child` | oakhaven, cantabile_harbour |
| 132 | `p60_kidB` | A child of Oakhaven | townswoman | `p17c_child` | oakhaven, cantabile_harbour |
| 133 | `p60_kidC` | A child of Oakhaven | townswoman | `p17c_child` | oakhaven, cantabile_harbour |
| 134 | `p60_water` | A water-carrier | townsman | `townsman` | oakhaven, cantabile_harbour |
| 135 | `p60_oldman` | An old man | townsman | `townsman` | oakhaven |
| 136 | `p60_watchA` | A watchman of the North Gate | townsman | `townsman` | oakhaven |
| 137 | `p60_mother` | A young mother | townswoman | `townswoman` | oakhaven, whispergrove, p16k_kestrel_deck, p16k_kestrel_below |
| 138 | `p60_farmwife` | A farmer's wife from the clearing | townswoman | `townswoman` | oakhaven |
| 139 | `p60_gossipM` | A cooper's journeyman | townsman | `townsman` | oakhaven |
| 140 | `p60_fishgirl` | A girl selling reed-baskets | townswoman | `townswoman` | oakhaven |
| 141 | `p60_grafterwife` | A woman from the Hollow | townswoman | `townswoman` | oakhaven |
| 142 | `p60_watchB` | A watchman on the inner bank | townsman | `townsman` | oakhaven |
| 143 | `p60_wicker` | Vettle's lad, trimming the window-lamps | townswoman | `p17c_child` | oakhaven |
| 144 | `p60_drinkA` | A drinker at the Boar's door | townsman | `townsman` | oakhaven |
| 145 | `p60_drinkB` | A drinker at the Boar's door | townsman | `townsman` | oakhaven |
| 146 | `p60_cl_dayA` | A quarryman, day shift | townsman | `townsman` | clearing |
| 147 | `p60_cl_dayB` | A quarryman, day shift | townsman | `townsman` | clearing |
| 148 | `p60_cl_dayC` | A quarryman, day shift | townsman | `townsman` | clearing |
| 149 | `p60_cl_nightA` | A quarryman, night shift | townsman | `townsman` | clearing |
| 150 | `p60_cl_nightB` | A quarryman, night shift | townsman | `townsman` | clearing |
| 151 | `p60_cl_farmwife` | A farmer's wife from the clearing | townswoman | `townswoman` | clearing |
| 152 | `p60_cl_hedge` | A Hedge-mender | townsman | `townsman` | clearing |
| 153 | `p60_cl_stone` | A woman going out to the ring | townswoman | `townswoman` | clearing |
| 154 | `p60_coat` | A Hollow | townsman | `p62_hollow_a` | whispergrove, p16k_kestrel_deck, p16k_kestrel_below |
| 155 | `p60_argA` | A Hollow | townsman | `hollow` | whispergrove, p16k_kestrel_deck, p16k_kestrel_below |
| 156 | `p60_argB` | A Hollow | townsman | `p62_hollow_b` | whispergrove, p16k_kestrel_deck, p16k_kestrel_below |
| 157 | `p60_plate` | A Hollow | townsman | `p62_hollow_c` | whispergrove, p16k_kestrel_deck, p16k_kestrel_below |
| 158 | `p60_sweep` | A Hollow | townsman | `hollow` | whispergrove, p16k_kestrel_deck, p16k_kestrel_below |
| 159 | `p60_bucket` | A Hollow | townsman | `p62_hollow_a` | whispergrove, p16k_kestrel_deck, p16k_kestrel_below |
| 160 | `p60_stall` | A Hollow | townsman | `p62_hollow_b` | whispergrove, p16k_kestrel_deck, p16k_kestrel_below |
| 161 | `p60_baker` | A Hollow | townsman | `hollow` | whispergrove, p16k_kestrel_deck, p16k_kestrel_below |
| 162 | `p60_wash` | A Hollow | townsman | `p62_hollow_c` | whispergrove, p16k_kestrel_deck, p16k_kestrel_below |
| 163 | `p60_clock` | A Hollow | townsman | `p62_hollow_b` | whispergrove, p16k_kestrel_deck, p16k_kestrel_below |
| 164 | `p60_joiner` | A Hollow | townsman | `hollow` | whispergrove, p16k_kestrel_deck, p16k_kestrel_below |
| 165 | `p60_gather` | A Hollow | townsman | `p62_hollow_c` | whispergrove, p16k_kestrel_deck, p16k_kestrel_below |
| 166 | `p60_moot` | A Hollow | townsman | `p62_hollow_a` | whispergrove, p16k_kestrel_deck, p16k_kestrel_below |
| 167 | `p60_letter` | A Hollow | townsman | `p62_hollow_b` | whispergrove, p16k_kestrel_deck, p16k_kestrel_below |
| 168 | `p60_shawl` | A Hollow | townsman | `p62_hollow_c` | whispergrove, p16k_kestrel_deck, p16k_kestrel_below |
| 169 | `p60_rake` | A Hollow | townsman | `hollow` | whispergrove, p16k_kestrel_deck, p16k_kestrel_below |
| 170 | `p60_feeder` | An Office feeder | townsman | `p61_clerk` | whispergrove, p16k_kestrel_deck, p16k_kestrel_below |
| 171 | `p60_ld_barrel` | A wharf hand | townsman | `townsman` | flume_landing |
| 172 | `p60_ld_rope` | A wharf hand | townsman | `townsman` | flume_landing |
| 173 | `p60_ld_eel` | An eel-catcher | townswoman | `townswoman` | flume_landing |
| 174 | `p60_ld_hat` | A woman with a very small hat | townswoman | `townswoman` | flume_landing |
| 175 | `p60_ld_clerk` | The Reeve's clerk | townsman | `townsman` | flume_landing |
| 176 | `p60_ld_boy` | A boy who does not say who he works for | townswoman | `p17c_child` | flume_landing |
| 177 | `p60_ld_lamp` | A wharf hand with a taper | townsman | `p16f_dockman` | flume_landing |
| 178 | `p60_lr_salvage` | A salvager | townsman | `townsman` | flume_lowrings |
| 179 | `p60_lr_boards` | A woman on the boards | townswoman | `townswoman` | flume_lowrings |
| 180 | `p60_netA` | A net-mender | townswoman | `townswoman` | cantabile_harbour |
| 181 | `p60_netB` | A net-mender | townswoman | `p16f_dockwoman` | cantabile_harbour |
| 182 | `p60_fish` | A fishwife | townswoman | `townswoman` | cantabile_harbour |
| 183 | `p60_diverA` | A salvage diver | townsman | `p16f_dockman` | cantabile_harbour |
| 184 | `p60_diverB` | A salvage diver | townsman | `p17c_hand` | cantabile_harbour |
| 185 | `p60_rope` | A rope-coiler | townsman | `townsman` | cantabile_harbour |
| 186 | `p60_washgirl` | Hesper's eldest | townswoman | `townswoman` | cantabile_harbour |
| 187 | `p60_pilot` | A pilot | townsman | `townsman` | cantabile_harbour |
| 188 | `p60_capA` | A Free Captain | townsman | `townsman` | cantabile_harbour |
| 189 | `p60_capB` | A Free Captain | townsman | `p16f_dockman` | cantabile_harbour |
| 190 | `p60_sluice` | A boy with a bucket | townswoman | `p17c_child` | cantabile_harbour |
| 191 | `p60_caulk` | A caulker | townsman | `townsman` | cantabile_harbour |
| 192 | `p60_sail` | A sail-mender | townswoman | `townswoman` | cantabile_harbour |
| 193 | `p60_reader` | The Harbour's reader | townsman | `townsman` | cantabile_harbour |
| 194 | `p60_lamp` | The lamplighter | townsman | `townsman` | cantabile_harbour |
| 195 | `p60_watch` | The night watch on the Mole-head | townsman | `p16f_dockman` | cantabile_harbour |
| 196 | `p60_nightfish` | A man fishing off the Mole | townsman | `p17c_hand` | cantabile_harbour |
| 197 | `p60_hw_water` | A woman with a pail | townswoman | `townswoman` | p30_hollow |
| 198 | `p60_hw_air` | A woman airing blankets | townswoman | `townswoman` | p30_hollow |
| 199 | `p60_hw_turf` | A man with a barrow of turves | townsman | `townsman` | p30_hollow |
| 200 | `p60_hw_kidA` | A child of the Hollow | townswoman | `p17c_child` | p30_hollow |
| 201 | `p60_hw_kidB` | A child of the Hollow | townswoman | `p17c_child` | p30_hollow |
| 202 | `p60_hw_lamps` | A woman who keeps the lamps | townswoman | `townswoman` | p30_hollow |
| 203 | `p60_hw_wife` | A woman from the Hollow | townswoman | `townswoman` | p30_hollow |
| 204 | `p60_by_plank` | A Hollow | townsman | `p62_hollow_a` | p31_bellyard |
| 205 | `p60_by_horse` | A Hollow | townsman | `p62_hollow_b` | p31_bellyard |
| 206 | `p60_by_grease` | A Hollow | townsman | `p62_hollow_c` | p31_bellyard |
| 207 | `p60_by_rug` | A Hollow | townsman | `p62_hollow_a` | p31_bellyard |
| 208 | `p60_by_hoop` | A Hollow | townsman | `p62_hollow_b` | p31_bellyard |
| 209 | `p60_by_basket` | A Hollow | townsman | `p62_hollow_c` | p31_bellyard |
| 210 | `p60_by_knock` | A Hollow | townsman | `hollow` | p31_bellyard |
| 211 | `p60_q_ansel` | Ansel Hay | townsman | `townsman` | p61_yard |
| 212 | `p60_q_dyer` | The dyer's wife, from Oakhaven | townswoman | `townswoman` | p61_yard |
| 213 | `p60_q_hay` | The hay-carter, from Oakhaven | townsman | `townsman` | p61_yard |
| 214 | `p60_q_carter` | A carter from the Flume road | townsman | `townsman` | p61_yard |
| 215 | `p60_q_washer` | The washerwoman, from Oakhaven | townswoman | `townswoman` | p61_yard |
| 216 | `p60_q_vettle` | Vettle's wife, from Oakhaven | townswoman | `townswoman` | p61_yard |
| 217 | `p60_q_row` | A goodwife of Cooper's Row | townswoman | `townswoman` | p61_yard |
| 218 | `p60_q_cooper` | The cooper's journeyman, from Oakhaven | townsman | `townsman` | p61_yard |
| 219 | `p60_q_old` | An old man, from Oakhaven | townsman | `townsman` | p61_yard |
| 220 | `p60_q_mother` | A young mother, from Oakhaven | townswoman | `townswoman` | p61_yard |
| 221 | `p60_q_orchard` | An orchard man, from Oakhaven | townsman | `townsman` | p61_yard |
| 222 | `p60_q_fuller` | A fuller, from Oakhaven | townsman | `townsman` | p61_yard |
| 223 | `p60_q_x0` | A person of the Reach | townswoman | `townswoman` | p61_yard |
| 224 | `p60_q_x1` | A person of the Reach | townswoman | `townswoman` | p61_yard |
| 225 | `p60_q_x2` | A person of the Reach | townsman | `townsman` | p61_yard |
| 226 | `p60_q_x3` | A person of the Reach | townsman | `townsman` | p61_yard |
| 227 | `p60_q_x4` | A person of the Reach | townswoman | `townswoman` | p61_yard |
| 228 | `p60_q_x5` | A person of the Reach | townswoman | `townswoman` | p61_yard |
| 229 | `p60_q_x6` | A person of the Reach | townsman | `townsman` | p61_yard |
| 230 | `p60_q_x7` | A person of the Reach | townsman | `townsman` | p61_yard |
| 231 | `p60_q_clerk` | A clerk walking the line | townsman | `p61_clerk` | p61_yard |
| 232 | `p60_q_bettis` | A Hollow with a basket | townsman | `hollow` | p61_yard |
| 233 | `p60_q_ticket` | The man at the trestle | townsman | `p61_clerk` | p61_yard |
| 234 | `p60_rd_mender` | A road-mender | townsman | `townsman` | p79_greenroad |
| 235 | `p60_rd_drover` | A drover | townsman | `townsman` | p79_greenroad |
| 236 | `p60_rd_packman` | A packman | townsman | `townsman` | p79_greenroad, p79_road_w |
| 237 | `p60_rd_band_a` | A woman with a bundle | townswoman | `townswoman` | p79_greenroad, p79_road_w, p79_road_e |
| 238 | `p60_rd_band_b` | A man carrying a child's coat | townsman | `townsman` | p79_greenroad, p79_road_w, p79_road_e |
| 239 | `p60_rd_band_c` | An old man with a stick | townsman | `townsman` | p79_greenroad, p79_road_w, p79_road_e |
| 240 | `p60_rd_cutter` | A turf-cutter | townsman | `townsman` | p79_road_w |
| 241 | `p60_rd_antiq` | An antiquary | townswoman | `townswoman` | p79_road_e |
| 242 | `p60_rd_digger` | A digger | townsman | `townsman` | p79_road_e |
| 243 | `p60_fl_runner` | A broadsheet-runner | townswoman | `townswoman` | p83_stride |
| 244 | `p60_fl_gauger` | A Synod gauger | townsman | `townsman` | p83_stride |
| 245 | `p60_fl_length` | The lengthsman | townsman | `p16f_keeper` | p83_poundstair |
| 246 | `p60_fl_handa` | A raft-hand | townsman | `p16f_rafter` | p83_poundstair |
| 247 | `p60_fl_handb` | A raft-hand, older | townsman | `p16f_dockman` | p83_poundstair |
| 248 | `p60_dr_old` | An old woman, a drover's daughter | townswoman | `townswoman` | p83_wethers |
| 249 | `p60_dr_man` | A returner | townsman | `townsman` | p83_wethers |
| 250 | `p60_dr_wom` | A returner, his wife | townswoman | `townswoman` | p83_wethers |
| 251 | `p60_dr_boy` | A returner's boy | townsman | `townsman` | p83_wethers |
| 252 | `p60_dr_cut` | A furze-cutter | townsman | `townsman` | p83_wethers |
| 253 | `p60_cp_salv` | A salvager | townsman | `townsman` | p85_crosspool |
| 254 | `p60_cp_salv2` | The other salvager | townsman | `townsman` | p85_crosspool |

## Checks

`test/own124.test.js` (11 checks; written first and committed failing). Suites run on the final code are listed in the commit that closes the phase.
