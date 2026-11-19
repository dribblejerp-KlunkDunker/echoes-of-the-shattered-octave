# Phase 102: every person's own dialogue, voiced (for review)

18 to 19 November 2026. Branch `p101-voices`. Built by Opus 5.5 (the owner, 18 Nov: "ill let opus do it for now and then use fable later on to do any touch ups"). The owner, 18 Nov: "any time there is dialogue it should be read aloud in the best possible voices available", then "continue using Kokoro for now".

## What changed in the game
- **Every person's own words are spoken.** All 170 people's greetings and topic answers are recorded, not only the greetings and barks the game had: **1,138 lines** in all, 663 of them new (about 90 minutes of speech). A topic answer plays when it appears in the conversation. The shared answers anyone gives (the `TOPICS` table) stay unvoiced.
- **Kokoro, rendered ahead of time.** Kokoro runs on the build machine; the game ships the recordings as small MP3 files and plays them. Nothing runs in the player's browser, so it works the same on a phone and in the desktop app. The voices folder went from 12 MB to 32 MB; the offline download from 59 MB to 81 MB.
- **Stage directions are not read** ("She does not stop singing.", "He looks you up and down the way a sexton measures."). Where narration and quoted speech are mixed, only the quotes are spoken.
- **Silent people stay silent,** except General Ward: her iron-cant is said aloud by Ninety-Four, as in Book Three, so her greeting plays in his voice.
- **A person's own line plays only in a conversation with them**, never off a stray message that happens to contain the same words.
- Options are unchanged: Options > Graphics & access > Voices (Voiced, Voiced + read aloud, Grunts, Off). French play is unchanged: the recordings are English, so a French line plays no recording.

## How it is made (for the next time lines change)
1. `node tools/voices/dump-dialogue.js` (with the game served) writes `tools/voices/dialogue.json`: every person's greetings and topic answers from the running game, and each voice profile from `js/voices.js`.
2. `python3 tools/voices/extract.py` adds their spoken lines to `voices/script.json` (marked `auto`; hand-written lines are never touched, and a line the hand-made script ruled unspoken stays out) and casts anyone without a hand entry into `tools/voices/cast_auto.json`.
3. `python3 tools/voices/build.py --model DIR` renders only what is new or changed, saving as it goes, and removes recordings whose line has gone.
One person, one voice: ids that share a name (Hesper, the sexton in three places, the Kestrel's crew met again in Phase 16) take the voice already cast for that name, a hand-cast one first. Casting rules: a woman's or man's voice from the person's portrait or painting, otherwise from their profile's pitch; a child's from about 280 Hz or a child's portrait; British or American by a hash of the id; pitch from the profile (a man is never pitched up past +1, which sounds strained); pace matched to the hand-cast lines (about 2.9 words a second); gravel, a bell, or a Hollow's whisper from the profile. A hand entry in `tools/voices/cast.py` always wins.

## For the owner: the casting
The 48 people cast by hand before (Harrow, Lyra, Kaelen, Hetty, Vane, Sable and the rest) keep their voices. These 122 were cast by the rules above. Any of them can be changed by name, and their lines re-rendered in minutes; say "give Two-Eleven a deeper voice" or "make Fifty-One British", for example. The voice ids are Kokoro's own; pitch is in semitones; speed 1 is Kokoro's natural pace.

| Person | id | Voice | Kokoro voice | Pitch | Speed | Treatment | Lines |
|---|---|---|---|---:|---:|---|---:|
| Ilse Brennan, Cantor-Master | `lib_ilse` | American woman | af_bella | +0 | 0.91 | - | 7 |
| Odile Quayle, book-runner | `lib_odile` | American woman | af_sarah | +0 | 0.91 | - | 6 |
| A Hollow among the shelves | `lib_shelver` | British man | bm_daniel | +1 | 0.86 | whisper | 4 |
| Bastien Corvo, pedlar of Cantabile broadsheets | `moor_bookseller` | British man | bm_lewis | +0 | 0.84 | - | 5 |
| A night-hummer | `n28_hummer` | American woman | af_nicole | +0 | 0.91 | - | 3 |
| Godwin Pettigrew, lamplighter | `n28_lamplighter` | British man | bm_daniel | +0 | 0.84 | - | 3 |
| Orrin Pale, sexton | `orrin` | British man | bm_fable | +0 | 0.84 | - | 2 |
| Nineteen | `p100_19` | British man | bm_daniel | -1 | 0.82 | gravel | 7 |
| Two-Oh-Seven | `p100_207` | British man | bm_daniel | +1 | 0.85 | - | 5 |
| Two-Eleven | `p100_211` | British man | bm_daniel | -3 | 0.78 | gravel | 8 |
| Fifty-One | `p100_51` | British woman | bf_lily | +0 | 0.91 | - | 5 |
| Eighty-Eight | `p100_88` | British man | bm_fable | +1 | 0.88 | - | 5 |
| Ninety-Four, the General's voice | `p100_94` | American man | am_michael | +1 | 0.86 | - | 14 |
| Corporal One-Forty-Two | `p100_corp` | British man | bm_lewis | +0 | 0.83 | - | 4 |
| One-Oh-Six, at the issue-hatch | `p100_issue` | American man | am_fenrir | -1 | 0.81 | - | 5 |
| One of the mast-crew | `p100_mastcrew` | British man | bm_daniel | +1 | 0.85 | - | 4 |
| The Quartermaster | `p100_qm` | British man | bm_fable | -2 | 0.8 | gravel | 6 |
| The roster-corporal | `p100_roster` | British man | bm_fable | +0 | 0.84 | - | 6 |
| A trooper of the Watch | `p100_tr_a` | British man | bm_fable | +0 | 0.84 | - | 4 |
| A trooper of the Watch | `p100_tr_b` | British man | bm_fable | +0 | 0.84 | - | 4 |
| A trooper of the Watch | `p100_tr_c` | British man | bm_fable | +0 | 0.84 | - | 4 |
| A trooper of the Watch | `p100_tr_d` | British man | bm_fable | +0 | 0.84 | - | 4 |
| A watcher by the bunks | `p100_watcher` | American man | am_michael | +1 | 0.84 | whisper | 4 |
| Garrow Finch | `p11_dicer` | British man | bm_daniel | +0 | 0.84 | - | 3 |
| Flume fisher-wife | `p11c_fish` | British woman | bf_alice | +0 | 0.91 | - | 3 |
| Market herb-seller | `p11c_herb` | American woman | af_jessica | +0 | 0.91 | - | 3 |
| Market provisioner | `p11c_larder` | British man | bm_fable | +0 | 0.84 | - | 3 |
| Oddments-seller | `p11c_odds` | British woman | bf_lily | +0 | 0.91 | - | 3 |
| Market tinker | `p11c_tinker` | British man | bm_daniel | +0 | 0.84 | - | 3 |
| Brenna Loft, baker | `p12_baker` | British woman | bf_lily | +0 | 0.91 | - | 5 |
| Dunna Sedge, sheaf-binder | `p12_dunna` | British woman | bf_isabella | +0 | 0.91 | - | 3 |
| Herald of the Pure Note | `p12_herald` | American man | am_santa | +0 | 0.84 | - | 4 |
| Bethan Marl, neighbour to the Tarrows | `p13h_wenna` | British woman | bf_isabella | +0 | 0.91 | - | 7 |
| Nessa Tolliver | `p15_dealer` | American woman | af_heart | +0 | 0.91 | - | 3 |
| Anselm Fenn, Consortium clerk | `p15l_clerk` | British man | bm_george | +0 | 0.84 | - | 3 |
| Oswin Marl, Veil ledger-keeper | `p15l_veil` | British man | bm_daniel | +0 | 0.84 | - | 3 |
| Deacon of the Pure Note | `p15s_preacher` | American man | am_michael | -1 | 0.83 | - | 5 |
| Wharf hand | `p16f_hand` | American man | am_liam | -1 | 0.83 | - | 3 |
| Madge Tallow, fence | `p16f_madge` | American woman | af_nova | -1 | 0.91 | - | 3 |
| Barnaby Haft, Timber Compact cutter | `p16f_orrin` | British man | bm_daniel | -2 | 0.82 | - | 3 |
| Tobit Dree, lockkeeper | `p16f_pellam` | British man | bm_daniel | +0 | 0.84 | - | 3 |
| Raft-wife | `p16f_wife` | American woman | af_jessica | +0 | 0.92 | - | 3 |
| Dessa Quill, letter-writer | `p16h_dessa` | American woman | af_nova | +0 | 0.91 | - | 3 |
| Ines Tarn, night clerk | `p16h_ines` | American woman | af_jessica | +0 | 0.91 | - | 3 |
| Reeve Alder Mossbrook | `p16h_mossbrook` | British man | bm_daniel | +0 | 0.84 | - | 3 |
| Orrin Pale, sexton | `p16h_orrin` | British man | bm_fable | +0 | 0.84 | - | 3 |
| Steward Merrin Oake, Timber Compact | `p16h_steward` | American man | am_adam | +0 | 0.84 | - | 3 |
| Sergeant Vause, Quarry Gate | `p16h_vause` | American man | am_fenrir | +1 | 0.9 | - | 3 |
| Abner Fenning, tanner | `p16k_hob` | American man | am_onyx | -1 | 0.92 | gravel | 5 |
| Mags Tennant, bosun | `p16k_mags` | American woman | af_kore | -1 | 0.92 | wood | 4 |
| Nell Carder, of the mill | `p16k_nell` | British woman | bf_lily | +1 | 1.0 | - | 5 |
| Pennick, the Kestrel's engineer | `p16k_pennick` | British man | bm_george | -1 | 0.82 | - | 5 |
| Captain Vane of the Drift-Kestrel | `p16k_vane` | American man | am_puck | -1 | 1.0 | - | 5 |
| Auld Bessa, the last Reef-Reader | `p17c_bessa` | American woman | af_aoede | +2 | 0.93 | whisper | 9 |
| A child on the Cay | `p17c_child` | child | af_sky | +2 | 0.96 | - | 9 |
| Mr. Dunmore, Receiving Clerk | `p17c_dunmore` | British man | bm_fable | +1 | 0.85 | - | 9 |
| A deck-hand of the Yard | `p17c_hand` | American man | am_onyx | -1 | 0.83 | - | 9 |
| Hesper, of the four houses | `p17c_hesper` | American woman | af_aoede | -3 | 0.8 | - | 9 |
| Hesper, of the four houses | `p17c_hesper2` | American woman | af_aoede | -3 | 0.8 | - | 9 |
| Oona Salt, the Harbour-Queen | `p17c_oona` | American woman | af_heart | -2 | 0.88 | - | 9 |
| Marlow Quain, pilot | `p17c_quain` | British man | bm_fable | -2 | 0.81 | - | 9 |
| Marlow Quain, pilot | `p17c_quain2` | British man | bm_fable | -2 | 0.81 | - | 9 |
| Fenwick Sloe, chandler | `p17c_sloe` | American man | am_puck | +0 | 0.84 | - | 9 |
| Marrin Tace, widow | `p17c_tace` | British woman | bf_isabella | +0 | 0.91 | - | 9 |
| Kerrow, Harbour office | `p17c_teague` | American man | am_onyx | -1 | 0.83 | - | 9 |
| Hollis Teel, Free Captain | `p17c_teel` | British man | bm_george | -1 | 0.82 | - | 9 |
| A net-wife on the fifth landing | `p17c_wife` | American woman | af_nicole | +0 | 0.92 | - | 9 |
| Jory Fenn, lamplighter | `p17n_jory` | British man | bm_lewis | +0 | 0.84 | - | 3 |
| Marl Dunning, bass | `p17n_marl` | American man | am_santa | -2 | 0.8 | - | 3 |
| Tansy Quill, apprentice | `p17n_tansy` | British woman | bf_isabella | +1 | 0.93 | - | 3 |
| Absalom Rudd, the old beacon-keeper | `p22_absalom` | British man | bm_daniel | -2 | 0.8 | - | 4 |
| Gideon Thrale of the Bellwether | `p22_gideon` | American man | am_fenrir | +0 | 0.82 | - | 4 |
| Kit Farrant, at the fold | `p22_kit` | child | af_nova | +2 | 0.96 | - | 3 |
| Kit Farrant | `p22_kitlost` | child | af_nova | +2 | 0.96 | - | 1 |
| Tamar Farrant, shepherd | `p22_tamar` | American woman | af_jessica | -1 | 0.88 | - | 5 |
| Abel Sedge, turf-cutter | `p29_abel` | American man | am_liam | -1 | 0.81 | - | 3 |
| Agnes Tull, the baker's wife | `p29_agnes` | American woman | af_jessica | +0 | 0.88 | - | 3 |
| Ambrose Vettle, chandler | `p29_ambrose` | British man | bm_fable | +0 | 0.83 | - | 3 |
| Corvin Ash, smuggler | `p29_corvin` | American man | am_santa | -1 | 0.82 | - | 3 |
| Ennis Crowle, beekeeper | `p29_ennis` | British woman | bf_emma | +0 | 0.87 | - | 3 |
| Gil Wade, punt-poler | `p29_gil` | American man | am_echo | +0 | 0.83 | - | 3 |
| Mother Hurst | `p29_hurst` | British woman | bf_isabella | -2 | 0.86 | - | 3 |
| Jem Cotter, shearer | `p29_jem` | British man | bm_lewis | -1 | 0.82 | - | 3 |
| Moll Fletch, tannery hand | `p29_moll` | American woman | af_aoede | +0 | 0.9 | - | 3 |
| Prue Lettice, broadsheet-seller | `p29_prue` | American woman | af_bella | +1 | 0.91 | - | 3 |
| Orrin Pale, sexton | `p29_sexton` | British man | bm_fable | +0 | 0.84 | - | 3 |
| Sim Fletch, tannery hand | `p29_sim` | British man | bm_lewis | +1 | 0.84 | - | 3 |
| Ysolde Marrow, salvager | `p29_ysolde` | British woman | bf_lily | -1 | 0.87 | - | 3 |
| Hob Wendle, field-hand | `p30_hob` | British man | bm_fable | -1 | 0.82 | - | 3 |
| Lissa Merrow | `p30_lissa` | American woman | af_sarah | +3 | 0.94 | - | 3 |
| A Hollow at a window | `p31_jugs` | British woman | bf_lily | -1 | 0.9 | whisper | 1 |
| A Hollow at the shutters | `p31_shutters` | British man | bm_fable | +1 | 0.85 | whisper | 1 |
| A Hollow with a broom | `p31_sweeper` | American man | am_michael | +1 | 0.88 | whisper | 1 |
| Marrit Pell, housekeeper to the Governor | `p46_marrit` | British woman | bf_emma | +0 | 0.87 | - | 5 |
| Anselm Dray, cobbler of the fourth tier | `p92_anselm` | American man | am_fenrir | -1 | 0.82 | - | 6 |
| Brenna Corliss, the Free Captains' woman in the Keel Docks | `p92_brenna` | American woman | af_nicole | -2 | 0.87 | - | 8 |
| The woman under the black canvas | `p92_canvas` | British woman | bf_lily | -3 | 0.85 | - | 5 |
| One of the Umbral folk | `p92_folk` | American man | am_michael | +1 | 0.86 | - | 4 |
| Joss Feveril, of the seventh chain | `p92_joss` | American man | am_santa | +0 | 0.85 | - | 6 |
| Mother Ysolde Carrow, harbour-master | `p92_ysolde` | American woman | af_nova | -1 | 0.88 | - | 8 |
| Winchmaster Bardo | `p94_bardo` | American man | am_michael | -2 | 0.79 | - | 8 |
| Perpetua Lisle | `p95_perpetua` | American woman | af_nicole | -2 | 0.87 | - | 9 |
| A Flambeau of the winch | `p95_warden` | American man | am_liam | -1 | 0.81 | - | 6 |
| The Cantor | `p96c_cantor` | British man | bm_fable | +1 | 0.86 | - | 6 |
| The treble | `p96c_treble` | child | af_nova | +2 | 0.96 | - | 5 |
| Brother Albinus | `p96v_albinus` | American man | am_eric | -1 | 0.81 | - | 4 |
| Sister Clemence | `p96v_clemence` | British woman | bf_emma | -1 | 0.87 | - | 4 |
| Abbess Coriel | `p96v_coriel` | British woman | bf_emma | -2 | 0.84 | - | 7 |
| Sister Domitia | `p96v_domitia` | British woman | bf_lily | +0 | 0.9 | - | 4 |
| Brother Fabian | `p96v_fabian` | British man | bm_lewis | +0 | 0.84 | - | 4 |
| Brother Galen | `p96v_galen` | British man | bm_fable | -2 | 0.8 | - | 3 |
| Sister Honoria | `p96v_honoria` | American woman | af_heart | +0 | 0.91 | - | 3 |
| Sister Liviana | `p96v_liviana` | American woman | af_aoede | +0 | 0.89 | - | 3 |
| Brother Marcellin | `p96v_marcellin` | American man | am_echo | +1 | 0.84 | - | 4 |
| Sister Ottavia | `p96v_ottavia` | American woman | af_kore | -1 | 0.88 | - | 4 |
| Sister Prisca | `p96v_prisca` | British woman | bf_emma | +1 | 0.92 | - | 3 |
| Brother Quintin | `p96v_quintin` | American man | am_michael | +1 | 0.85 | - | 4 |
| A scavenger of the line | `p97_scav` | American woman | af_bella | -2 | 0.87 | - | 7 |
| The Tallyman | `p97_tallyman` | British man | bm_george | +0 | 0.82 | - | 8 |
| Ada Pellow, widow of Cooper's Row | `p9_ada` | British woman | bf_isabella | +0 | 0.91 | - | 5 |
| Reeds-Miner Tomas, timber-cutter | `p9_tomas` | American man | am_puck | +0 | 0.84 | - | 5 |
| Umber, a runaway of the Veil | `umber` | British woman | bf_alice | +2 | 0.9 | - | 10 |

## Questions for the owner
1. Does any voice above feel wrong for its person? (A sample of Null-Watch was sent on 19 Nov: `tools/dev/out/null-watch-voices.mp3`.)
2. Should the shared answers (`TOPICS`, said by anyone) be voiced too? Recorded per speaker, they would add about 40 MB.
3. French: Kokoro has one French voice (`ff_siwis`). Voice French play with it for everyone, or leave French unvoiced until there is better?

## Verification
- `test/voice-acting`: every recording exists, decodes and matches its line; a topic answer plays its speaker's own recording, once; a shared answer plays nothing; the General's greeting is said by Ninety-Four; a stage direction plays nothing; a message with a person's words does not play them; Grunts and Off play no recordings. Passes, with `voices` and `reader97`.
- Every suite (201) with 19 Nov's `main` merged in: 188 passed two at a time; the other 13 pass alone (`sync19` failed twice alone at different timing checks, then passed 3 of 3, as `main` did).
- After merging (#145): people met under two ids no longer speak in two voices; 56 lines re-rendered.
