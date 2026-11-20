# Phase 103: the answers anyone can give, voiced

> **Replaced in Phase 104** (owner, 19 Nov: "give every character their own voices"): the voice groups below are gone; each person now says the shared answers in their own casting. See `Phase 104 - Every character's own voice for the shared answers.md`.

19 November 2026. Branch `p103-voices`. Built by Opus 5.5. The owner, 19 Nov: "Yes make the answers anyone can give should be voiced. Leave the French voices out for now."

## What changed in the game
- **The shared answers are spoken.** When you ask someone about a topic they have no answer of their own for (Oakhaven, the Hedge, the Narrow, Kaelen Vance, the Rite and the rest: 27 topics, each with a plain answer and an informed one), the answer now plays. So do the gossips' rumours ("I couldn't say. But I'll tell you what I heard: ..."), the three refusals a blunt tone can draw ("No."), and the three blessings a polite answer can end with ("Mind how you go."), which play after the answer, own or shared.
- **In the person's own voice, as near as can be.** Recording every shared answer in each of 160 people's exact voices would be about 29 hours of speech and roughly 500 MB. Instead everyone is in a **voice group**: one for each Kokoro voice anyone is cast in, so a person's shared answers come in the same voice as their own lines. What is not kept is their own pitch and treatment (an old man's waver, a rough throat): the group speaks plainly, with a little room. Three groups are different:
  - **children** (Pim, Kit Farrant, Linnet, the treble, the Cay's child) answer in a child's voice;
  - **the Hollows and the whispering old** (the sexton, the mourner, the shutters and the broom, Halder Wick, Auld Bessa) answer in breath, a man's or a woman's;
  - **Kaelen Vance, the Aegis and Registrar-General Quist** keep their own voice for these too: no group sounds like a glass arm, a chord, or a voice that reads.
- **A recording plays only for the whole answer.** A shared line never plays off part of something else (a direction that happens to start "No." plays nothing).
- **The silent stay silent** (Lyra after the Grove, Mags signing, General Ward), and so do the paintings and the cat. French play stays unvoiced, as ruled.
- Options are unchanged: Options > Graphics & access > Voices.

## Size
**1,818 recordings, about 283 minutes of speech, 82 MB.** The voices folder went from 32 MB to 114 MB, and the offline download (everything the game keeps for play without a connection) from 81 MB to 163 MB. That is the cost of the choice below; with only nine groups it would have been about 40 MB, but some 60 people (Lyra, Vane, Hetty, Aldric, Sable among them) would have answered in a different voice from their own lines.

## How it is made
1. `node tools/voices/dump-dialogue.js` (with the game served) now also writes `tools/voices/shared.json`: the shared topics and rumours from the running game, and each person's tier and gossip flag in `dialogue.json`.
2. `python3 tools/voices/shared.py` puts everyone who speaks in a group (`voices/groups.json`) and writes each group's lines into `voices/script.json` (kind `shared`). A group records only what its people can be heard to say: only the informed answers if every member is informed; the rumours only if a gossip is in it.
3. `python3 tools/voices/build.py --model DIR` renders them. New: `--worker` renders only (no manifest, no pruning), so two can run side by side on different `--only` lists; a plain run then writes `js/voice-lines.js`, now with `VOICE_GROUPS` (who answers in which group).
4. `js/voice-acting.js` plays a shared answer when the whole answer matches a recording in the person's group, and a blessing on the end after it.

## The groups
| Group | Voice | People | Recordings | Who |
|---|---|---:|---:|---|
| `shared_af_aoede` | American woman (`af_aoede`) | 5 | 60 (2.6 MB) | A trooper of the Watch; Hesper; Moll Fletch; Sister Liviana |
| `shared_af_bella` | American woman (`af_bella`) | 3 | 60 (2.8 MB) | A scavenger of the line; Ilse Brennan; Prue Lettice |
| `shared_af_heart` | American woman (`af_heart`) | 4 | 60 (2.7 MB) | Lyra Ashgrove; Nessa Tolliver; Oona Salt; Sister Honoria |
| `shared_af_jessica` | American woman (`af_jessica`) | 6 | 60 (2.3 MB) | A trooper of the Watch; Agnes Tull; Ines Tarn; Market herb-seller; Raft-wife; Tamar Farrant |
| `shared_af_kore` | American woman (`af_kore`) | 3 | 33 (1.9 MB) | Mags Tennant; Sister Ottavia |
| `shared_af_nicole` | American woman (`af_nicole`) | 6 | 60 (4.3 MB) | A net-wife on the fifth landing; A night-hummer; Brenna Corliss; Perpetua Lisle; Sable |
| `shared_af_nova` | American woman (`af_nova`) | 3 | 60 (2.4 MB) | Dessa Quill; Madge Tallow; Mother Ysolde Carrow |
| `shared_af_sarah` | American woman (`af_sarah`) | 3 | 83 (3.8 MB) | Lissa Merrow; Oakhaven goodwife; Odile Quayle |
| `shared_am_adam` | American man (`am_adam`) | 3 | 83 (3.7 MB) | A trooper of the Watch; Oakhaven orchardman; Steward Merrin Oake |
| `shared_am_echo` | American man (`am_echo`) | 2 | 60 (2.4 MB) | Brother Marcellin; Gil Wade |
| `shared_am_eric` | American man (`am_eric`) | 1 | 33 (1.6 MB) | Brother Albinus |
| `shared_am_fenrir` | American man (`am_fenrir`) | 4 | 60 (2.7 MB) | Anselm Dray; Gideon Thrale of the Bellwether; One-Oh-Six; Sergeant Vause |
| `shared_am_liam` | American man (`am_liam`) | 3 | 60 (2.4 MB) | A Flambeau of the winch; Abel Sedge; Wharf hand |
| `shared_am_michael` | American man (`am_michael`) | 5 | 83 (4.3 MB) | Brother Quintin; Deacon of the Pure Note; Ninety-Four; One of the Umbral folk; Winchmaster Bardo |
| `shared_am_onyx` | American man (`am_onyx`) | 4 | 60 (2.4 MB) | A deck-hand of the Yard; Abner Fenning; Kerrow |
| `shared_am_puck` | American man (`am_puck`) | 6 | 60 (2.5 MB) | Captain Vane of the Drift-Kestrel; Fenwick Sloe; Reeds-Miner Tomas |
| `shared_am_santa` | American man (`am_santa`) | 4 | 60 (2.8 MB) | Corvin Ash; Herald of the Pure Note; Joss Feveril; Marl Dunning |
| `shared_bf_alice` | British woman (`bf_alice`) | 3 | 60 (2.6 MB) | Flume fisher-wife; Hetty Bram of the Boar & Dulcimer; Umber |
| `shared_bf_emma` | British woman (`bf_emma`) | 6 | 60 (2.5 MB) | Abbess Coriel; Bettany; Ennis Crowle; Marrit Pell; Sister Clemence; Sister Prisca |
| `shared_bf_isabella` | British woman (`bf_isabella`) | 7 | 60 (2.5 MB) | Ada Pellow; Bethan Marl; Dunna Sedge; Factor Adela Vosk; Marrin Tace; Mother Hurst; Tansy Quill |
| `shared_bf_lily` | British woman (`bf_lily`) | 9 | 60 (2.6 MB) | Brenna Loft; Fifty-One; Nell Carder; Oddments-seller; Orla Hale; Sister Domitia; The woman under the black canvas; Ysolde Marrow |
| `shared_bm_daniel` | British man (`bm_daniel`) | 13 | 60 (2.4 MB) | Absalom Rudd; Barnaby Haft; Garrow Finch; Godwin Pettigrew; Market tinker; Nineteen; One of the mast-crew; Oswin Marl; Reeve Alder Mossbrook; Surgeon-Grafter Anselm Rooke; Tobit Dree; Two-Eleven; Two-Oh-Seven |
| `shared_bm_fable` | British man (`bm_fable`) | 18 | 60 (2.5 MB) | A trooper of the Watch; Ambrose Vettle; Brother Galen; Eighty-Eight; Hob Wendle; Ignatius Crane; Junior Engineer Tobiah Marsh; Market provisioner; Marlow Quain; Mr. Dunmore; Orrin Pale; The Cantor; The Quartermaster; The roster-corporal; Tobiah Marsh |
| `shared_bm_george` | British man (`bm_george`) | 6 | 60 (2.9 MB) | A Synod herald; Anselm Fenn; Governor Aldric Vance; Hollis Teel; Pennick; The Tallyman |
| `shared_bm_lewis` | British man (`bm_lewis`) | 8 | 60 (3.0 MB) | Bastien Corvo; Brother Fabian; Corporal One-Forty-Two; Jem Cotter; Jory Fenn; Old Harrow; Old Tam; Sim Fletch |
| `shared_breath_f` | Breath, a woman | 4 | 60 (2.7 MB) | A Hollow at a window; A Hollow mourner; A Hollow with a basket; Auld Bessa |
| `shared_breath_m` | Breath, a man (Hollows, the whispering old) | 7 | 60 (2.6 MB) | A Hollow among the shelves; A Hollow at the shutters; A Hollow sexton; A Hollow with a broom; A watcher by the bunks; Halder Wick; The lamplighter |
| `shared_child` | Children | 7 | 60 (2.4 MB) | A child; A child on the Cay; Kit Farrant; Linnet; Pim Carder; The treble |
| `aegis` | Their own voice | 3 | 60 (2.6 MB) | The Aegis; The Aegis Sentinel |
| `kaelen` | Their own voice | 3 | 33 (2.0 MB) | Kaelen Vance |
| `quist` | Their own voice | 1 | 30 (1.4 MB) | Registrar-General Quist |

## For the owner
- Any group's voice can be changed, or a person moved to another group, and only that group re-rendered.
- If a person's shared answers should carry their own pitch and treatment exactly, that person can be given their own set (about 2 MB and 15 minutes of rendering each), as Kaelen, the Aegis and Quist have.

## Verification
- `test/voice-acting.test.js` (new checks): every speaking person has a voice group, of the right sex for their portrait; every shared answer a person can be heard to give is recorded in their group; a silent person has none; in play, Two-Eleven's shared answer plays his group's recording and read-aloud skips it; a blessed answer plays the answer and then the blessing in the same voice; a blunt "No." plays; an answer that merely contains shared words plays nothing; Pim answers as a child, the sexton in breath, Kaelen in his own voice, Lyra after the Grove not at all. Passes.
- Also run and passing: `voices`, `companion-talk`, `parish`, `ripples`, `pwa18`, `story-i18n`, and every other suite that touches voices (`bell69`, `canon32`, `cantabile17`, `cutter68`, `grafters67`, `greening44`, `herald66`, `longnight17`, `r5hollow30`, `rift100`, `r2canon27`, `rope45`, `rite43`, `touches71`, `touches72`, `touches75`, `touches76`, `thread70`, `cinematic24`).
- Found on the way: **Bettis Renn** (the Hollow with a basket, Ivo's wife) had been cast with a man's voice since her lines were first recorded. She now has a woman's, and her four lines were re-rendered.
