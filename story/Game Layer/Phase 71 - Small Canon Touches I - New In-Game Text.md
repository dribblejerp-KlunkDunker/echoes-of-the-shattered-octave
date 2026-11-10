# Phase 71 — Small Canon Touches I: New In-Game Text

*Recorded 10 Nov 2026 from the game's translation file (`tools/i18n/p71-touches.tsv`). ROADMAP R9 #25, the first five of the Story Brainstorm's twenty small canon touches (a, k, n, o, q), in `js/touches71.js`. Every line is the manuscript's, put into the present tense where the game reads in the present; placements and the few connecting words the book does not give are marked [PROPOSED].*

## What is new, in short

- **a. Hymn 9's real words** (Book One ch. 19, l. 4790). When the Aegis Sentinel is sung down, the hymn is heard: Sable sings *"Hold us in the little light — hold us in the little light until the morning comes—"*, flat and cracked and far too low, in the wrong key (voiced, `sable.hymn9.sung`). Sung by you off the board, the same words [PROPOSED: the book has only Sable sing it]. The Wearer's lure at the Cloister porch already had the words (`js/grove.js` porchVoice, ch. 20, ll. 5424 and 5438); nothing changed there.
- **k. "Dissonant: self-inflicted. No further action."** (ch. 5, l. 1622). The Synod Gazette prints the clerk's line for Davin Hale, word for word, once he is gone (`davin_gone`). [PROPOSED] It prints as an entry from the district register, and the same formula follows for Old Tam after his walk in the meadow (`p49_tam`) and for Ada Pellow after she goes into the Hedge (the Greening's `g44_gate` 3, kept as `p71_ada`). The book gives Tam no surname ("Tam — (no surname. ASK.)", l. 4053), so the register has none: "surname not recorded". The book gives Ada's name but no trade, so the register has none.
- **n. The dead Queen's decree** (ch. 1, ll. 320–322). A decree pasted on the well-house, read like the game's other documents (the Office style; kind "Decree"): BY ROYAL ASSENT, a seal of pale green glass, *Maelis, by the Grace of the Pure Note, Queen of the Reach*; dead a hundred and forty years; "Her signature is very steady." [PROPOSED] The place: the corner of the square where `js/church55.js` and `js/rite43.js` already put the well-house. The renewal: a new sheet goes up each day at dawn, and the paste is wet until noon. Only in Part One. The decree's own wording is not in the book and is not shown.
- **o. "Forty-eight."** (ch. 5, ll. 1675–1687). Up the Kestrel's mast-ladder at night, the crates card ends with Vane at the bottom of the ladder with the lantern and the blue bottle: "Forty-eight," he tells the dark, the way he does most nights (voiced, `vane.hold.fortyeight`). [PROPOSED] Night is 22:00 to 04:00, Part One, before the Rite; cargo night (`js/cargo56.js`) keeps its own scenes.
- **q. OK-114, twice painted over** (ch. 15, l. 4181). A painted plank at the bow rail of the Kestrel's deck (`js/kestrel16.js`). From further than 1.6 cells it is only the ghost of a mark; up close it reads OK-114. With Sable aboard, the book's line: she knows that mark the way a clerk knows any mark she has read eleven times. [PROPOSED] The place (the book sees the mark from the Moot-house steps; the deck is where the game lets you get close to the bow), the reach, and the far line ("You would have to lean out over the bow rail to read it").

## [PROPOSED] choices

1. Hymn 9 sung by the player uses the same two lines (the book has only Sable sing it).
2. The Gazette prints the clerk's formula as "Entered in the district register:"; Tam and Ada get the same formula (the book writes it only for Davin). Tam has no surname; Ada has no trade. The lines are printed only while the district is Oakhaven: once you have left on the Kestrel (No. 38, "reclassified as woodland"), they stop.
3. The decree stands at the corner of the square by the well-house (28.4, 21.6); a new sheet at dawn each day, wet until noon; Part One only; its body text is not shown.
4. Vane is in the hold from 22:00 to 04:00 on any night of Part One before the Rite, except the two cargo-night scenes.
5. The registry mark is read at the bow rail of the deck, legible within 1.6 cells; the far line is new.

## Voices

| id | speaker | line | source |
|---|---|---|---|
| `sable.hymn9.sung` | sable | Hold us in the little light — hold us in the little light until the morning comes— (sung, flat and low) | ch. 19, l. 4790 |
| `vane.hold.fortyeight` | vane | Forty-eight. | ch. 5, l. 1685 |

## Every line

Source: `tools/i18n/p71-touches.tsv` (24 lines).

| # | English | French |
|---|---|---|
| 1 | Sable sings it: "Hold us in the little light — hold us in the little light until the morning comes—" It is terrible. It comes out flat and cracked and far too low, in the wrong key, in a voice that has been reading aloud and nothing else for three years. | Sable le chante : « Tiens-nous dans la petite lumière — tiens-nous dans la petite lumière jusqu’à ce que vienne le matin— » C’est terrible. Cela sort faux et fêlé et bien trop bas, dans le mauvais ton, d’une voix qui n’a fait que lire à haute voix depuis trois ans. |
| 2 | You sing it off the board: "Hold us in the little light — hold us in the little light until the morning comes—" | Vous le chantez d’après le tableau : « Tiens-nous dans la petite lumière — tiens-nous dans la petite lumière jusqu’à ce que vienne le matin— » |
| 3 | Entered in the district register: Hale, D. Carter. Dissonant: self-inflicted. No further action. | Inscrit au registre du district : Hale, D. Charretier. Dissonant : auto-infligé. Aucune suite. |
| 4 | Entered in the district register: Tam, surname not recorded. Dissonant: self-inflicted. No further action. | Inscrit au registre du district : Tam, nom de famille non consigné. Dissonant : auto-infligé. Aucune suite. |
| 5 | Entered in the district register: Pellow, A. Dissonant: self-inflicted. No further action. | Inscrit au registre du district : Pellow, A. Dissonant : auto-infligé. Aucune suite. |
| 6 | A decree on the wall of the well-house | Un décret sur le mur de la maison du puits |
| 7 | The decree on the well-house | Le décret de la maison du puits |
| 8 | Decree | Décret |
| 9 | A new decree has gone up over the old ones, the paste still wet. | Un nouveau décret a été collé par-dessus les anciens, la colle encore humide. |
| 10 | A new decree has gone up over the old ones. | Un nouveau décret a été collé par-dessus les anciens. |
| 11 | BY ROYAL ASSENT | PAR ASSENTIMENT ROYAL |
| 12 | BY ROYAL ASSENT, it begins, as they all do, above a seal of pale green glass pressed with a queen's profile. | PAR ASSENTIMENT ROYAL, commence-t-il, comme tous, au-dessus d’un sceau de verre vert pâle frappé d’un profil de reine. |
| 13 | Maelis, by the Grace of the Pure Note, Queen of the Reach. | Maelis, par la Grâce de la Note pure, Reine des Confins. |
| 14 | The Synod's decrees always come with her seal and her signature. Queen Maelis has been dead for a hundred and forty years. | Les décrets du Synode portent toujours son sceau et sa signature. La reine Maelis est morte depuis cent quarante ans. |
| 15 | Her signature is very steady. People say that is because her hand no longer shakes. People say a great many things, very quietly. | Sa signature est très assurée. On dit que c’est parce que sa main ne tremble plus. On dit beaucoup de choses, très bas. |
| 16 | Leave it. | Laissez-le. |
| 17 | At the bottom of the ladder Captain Vane sits with the lantern, turning a small blue bottle over in his hands, among the murmuring crates.<br><br>"Forty-eight," he tells the dark, the way he does most nights.<br><br>The dark, as usual, has nothing to say to that. | Au pied de l’échelle, le capitaine Vane est assis avec la lanterne et retourne entre ses mains une petite bouteille bleue, parmi les caisses qui murmurent.<br><br>« Quarante-huit », dit-il au noir, comme presque tous les soirs.<br><br>Le noir, comme d’habitude, n’a rien à répondre à cela. |
| 18 | The bow | La proue |
| 19 | The Kestrel's bow | La proue de la Crécerelle |
| 20 | On her bow, under two coats of paint that were put on to cover the last name and then the one before it, is the ghost of a registry mark. | Sur sa proue, sous deux couches de peinture passées pour couvrir le dernier nom puis celui d’avant, il y a le fantôme d’une marque d’immatriculation. |
| 21 | From here it is only a ghost. You would have to lean out over the bow rail to read it. | D’ici, ce n’est qu’un fantôme. Il faudrait vous pencher par-dessus le bastingage de la proue pour la lire. |
| 22 | OK-114. | OK-114. |
| 23 | Sable knows that mark the way a clerk knows any mark she has read eleven times. | Sable connaît cette marque comme une greffière connaît toute marque qu’elle a lue onze fois. |
| 24 | Step back from the rail. | Reculer du bastingage. |
