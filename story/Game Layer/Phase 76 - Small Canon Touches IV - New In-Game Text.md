# Phase 76 — Small Canon Touches IV: New In-Game Text

*Recorded 11 Nov 2026 from the game's translation file (`tools/i18n/p76-touches.tsv`). ROADMAP R9 #25, the fourth batch of the Story Brainstorm's twenty small canon touches (g, i, l, p), in `js/touches76.js`. Every line from the book is the manuscript's, put into the present tense where the game reads in the present. Each touch needed one small design decision; those, and the few connecting words the book does not give, are marked [PROPOSED]. Nothing is voiced: none of these lines is spoken aloud by a book character (Kaelen says nothing at the clamps; the Veil's rules are the Precept, given as narration).*

## What is new, in short

- **g. Kaelen's charcoal clamps** (Book One ch. 2, ll. 602–606). Four clamps stand by Kaelen's hut in the clearing in Part One, until the Rite. Use one and the card is the book's account of the craft: the careful dome, "to keep a thing burning without letting it burn", the good clamp that breathes, the one that goes quiet before it pops "like a knuckle", and "the finest ear for failure of any student in forty years. It was meant as praise." Once you have met Kaelen you can **walk the clamps** for a day. The breathing clamps hiss, each from where it stands. One goes quiet: turf it before it pops and it is saved. Turf one that is still breathing and it dies ("Too little and it died"). Leave the quiet one and it pops and flares: "A heap of ash, and a lost week." Three rounds, then your share of the charcoal money. Failure only costs the clamp, never an Echo. Kaelen says nothing; the book gives him no words about it.
  - [PROPOSED] the job: he lets you walk them for a day, for a share of the charcoal money; three rounds; a clamp goes quiet 3, 4.5 and 6 seconds into each round and pops 8 seconds later; 3 sovereigns for each clamp saved, "left on the gatepost, the way the town leaves his" (ch. 2 l. 652: the town "left the coin on the gatepost"); once a game day. Leaving the clearing ends the day and pays for what was saved.
  - [PROPOSED] where: (8.6, 19.4), (10.6, 20.2), (12.4, 20.6) and (14.6, 17.8), between the hut and its hearth.
  - [PROPOSED] for players who cannot hear it: with sound captions on, the quiet clamp is named ("[The third clamp has gone quiet]").
- **i. Pim's whistle as a tool** (ch. 6, ll. 2013–2025 and 2125–2229). Lyra taught Pim the falling fifth, "Two notes, like a bird that knows only one thing to say. … you whistle that. Only that. And I'll whistle it back. Then you'll know it's me." Once you have whistled it with Lyra in the water-meadow (`js/meadow49.js`, the whistle duel), the Song-book (Tab) offers **The falling fifth, whistled**: two notes, no voice spent, a little noise. In fog (the weather's mist, outdoors), your companion answers from where they are, so you know the way: "Two notes, down, from your left, some way off: Lyra, whistling it back."
  - **The mimic rule.** Use it outside the Hedge once (any map that is not the town inside it) and from then on, in fog, the Wearer answers too, from somewhere else: "And from behind you, far off, softly, it whistles. Two notes. The Root, and down. It got the interval exactly right." (l. 2229). And at the Cloister porch (`js/grove.js`, ch. 20, "Seven times"), after the boy's whistle with too much air in it, it whistles yours: "Then your whistle, the one you blew outside the Hedge: two notes, the Root, and down. It got the interval exactly right." None of it once the Wearer is dead.
  - [PROPOSED] Learning it from the meadow duel, not from a lesson: the book's whistle is "ours", Lyra's and Pim's, and the traveller only ever whistles it beside her in front of the thing that learns it.
  - [PROPOSED] Kaelen cannot whistle it (the book never has him), so when he is the companion his glass hand rings once instead.
  - [PROPOSED] The bearing is told in eight directions and three distances (close by, under 3 cells; some way off, under 9; far off). The Wearer's answer comes from the opposite side to your companion's, about 8 cells off, or from behind you on your right when you are alone. A companion told to keep quiet does not answer.
- **l. Consecrated** (ch. 2, ll. 650–652). "On Chapel-days, when the chapel-reader's sermons came round to the Consecrated and the blessing of the glass, some of them looked toward the North Gate with a kind of nervous piety." A sermon sat to its end (`js/synod15.js`: the Chapel's three sermon days are the game's Chapel-days) now closes with that line. And in Oakhaven's lanes, a glassed traveller beside a Synod soldier gets the ward-sign twice (l. 650: "Two girls at the well made the ward-sign, fingers to lips and fingers to ear, and then, because he was walking beside a Synod soldier, made it again, faster."). The witness is `js/narrow28.js`'s: a townsperson in sight, facing you.
  - [PROPOSED] Beside = within two paces of any Legionnaire figure; once a game day; Part One only; Oakhaven's open lanes only. The game seldom walks a Legionnaire through the lanes (Dawnday's two who cross to Lyra, the Rite's column), so it is rare, as in the book it is a single walk.
- **p. The Veil's three rules** (ch. 15, l. 4167). [PROPOSED UI] Each Ledger entry (K) has a margin: no note, a plain note ("Entered: the Kestrel's hold, Massday."), or a comforting one ("Died bravely."). Once Sable is with you (`sable_joined`), a comforting note gets what she did to her own margin note in the book: "Sable reads it over your shoulder, and draws a line through it." and the Precept of the Silent Veil, in the book's words: "The Veil keeps three rules. Write what happened. Write who it happened to. Do not comfort yourself in the margin." After the first time, only "Sable draws a line through it." The struck note stays in the Ledger, struck. Before Sable, a comfort stands.
  - [PROPOSED] the three choices, and the wording of the two notes (the plain one is the entry's own place and day; "Died bravely." is the Brainstorm's example made to fit every entry, man, woman or child).

## Skipped, with reasons

None of the four was skipped. Two things were kept smaller than the Brainstorm's sketch:

- **l, "walking with a Legionnaire".** The game has no Legionnaire escort through the lanes, and adding one would be a new scene. The ward-sign is wired to whatever Legionnaire stands beside you, so it is rare.
- **i, "locates her … in fog".** Only Part Four has companions (`js/party.js`), so the answer is heard there. Elsewhere in fog only the Wearer answers.

## [PROPOSED] choices

1. g: the clamps' places; the day's job (three rounds, the timings, 3 sovereigns a clamp saved, paid "on the gatepost"); once a game day; Part One until the Rite; the job only after `kaelen_met`; captions name the quiet clamp.
2. g: "He lets you walk them for a day, for a share of the charcoal money." Kaelen's action, not his words.
3. i: the whistle is learned in the meadow duel (`p49_whistle`); it lives in the Song-book; Kaelen's answer is the glass ringing; the bearing words and distances; the Wearer's answer from the opposite side; the porch line.
4. i: "outside the Hedge" is any map but the town inside it (`js/game.js` `LAW_MAPS`).
5. l: the line closes every sermon sat to its end; the twice-made sign is within two paces of a Legionnaire, once a game day, Part One, Oakhaven's lanes.
6. p: the margin's three choices and the two notes' words; Sable strikes a comforting note (her action in the book, to her own note); her card once, then a short line.

## Every line

Source: `tools/i18n/p76-touches.tsv` (52 lines).

| # | English | French |
|---|---|---|
| 1 | The first clamp | La première meule |
| 2 | The second clamp | La deuxième meule |
| 3 | The third clamp | La troisième meule |
| 4 | The fourth clamp | La quatrième meule |
| 5 | [{0} has gone quiet] | [{0} s'est tue] |
| 6 | The charcoal clamps | Les meules à charbon |
| 7 | There are four clamps in the clearing, and Kaelen walks them in the half-light the way a shepherd walks a fold. | Il y a quatre meules dans la clairière, et Kaelen en fait le tour dans la demi-clarté comme un berger fait le tour d'un enclos. |
| 8 | A clamp is only a heap of cordwood built into a careful dome, packed round with turf and earth and lit from the center, so that it burns for days without ever catching fire. That is the whole art: to keep a thing burning without letting it burn. Too much air and it flares, and you have a heap of ash and a lost week. Too little and it dies. You manage it by listening. A good clamp breathes, a low steady hiss through the vent-holes. A clamp about to flare goes quiet first, and then pops — a small hollow crack, deep in the stack, like a knuckle. | Une meule n'est qu'un tas de bois de corde monté en dôme soigneux, garni tout autour de mottes et de terre et allumé par le centre, de sorte qu'elle brûle des jours sans jamais prendre feu. Tout l'art est là : garder une chose en train de brûler sans la laisser brûler. Trop d'air et elle s'embrase, et l'on a un tas de cendre et une semaine perdue. Trop peu et elle meurt. On la mène à l'oreille. Une bonne meule respire, un sifflement bas et régulier par les évents. Une meule sur le point de s'embraser se tait d'abord, puis claque — un petit craquement creux, au fond du tas, comme une jointure. |
| 9 | He is very good at it. He was told at the Conservatory that he had the finest ear for failure of any student in forty years. It was meant as praise. | Il y est très bon. On lui a dit au Conservatoire qu'il avait la plus fine oreille pour la défaillance de tous les élèves depuis quarante ans. C'était censé être un compliment. |
| 10 | He lets you walk them for a day, for a share of the charcoal money. Listen. When one goes quiet, turf it before it pops. Turf one that is still breathing, and it dies. | Il vous laisse en faire le tour pour une journée, contre une part de l'argent du charbon. Écoutez. Quand l'une se tait, couvrez-la de mottes avant qu'elle ne claque. Couvrez-en une qui respire encore, et elle meurt. |
| 11 | Walk the clamps | Faire le tour des meules |
| 12 | Leave it. | Laissez. |
| 13 | The clamps are walked for today. | On a fait le tour des meules pour aujourd'hui. |
| 14 | You walk the clamps and listen. | Vous faites le tour des meules et vous écoutez. |
| 15 | You kneel and pack turf over two of its vents and listen until the breathing slows. | Vous vous agenouillez, tassez des mottes sur deux de ses évents et écoutez jusqu'à ce que la respiration ralentisse. |
| 16 | Too little air, and it dies. | Trop peu d'air, et elle meurt. |
| 17 | Somewhere in the clamps, a small hollow crack, deep in the stack, like a knuckle. It flares. A heap of ash, and a lost week. | Quelque part parmi les meules, un petit craquement creux, au fond du tas, comme une jointure. Elle s'embrase. Un tas de cendre, et une semaine perdue. |
| 18 | This one is lost. | Celle-ci est perdue. |
| 19 | Your share of the charcoal money is left on the gatepost, the way the town leaves his: {0} sovereigns. | Votre part de l'argent du charbon est laissée sur le pilier du portail, comme la ville y laisse la sienne : {0} souverains. |
| 20 | No coin today. The clamps you lost are ash. | Pas une pièce aujourd'hui. Les meules que vous avez perdues sont de la cendre. |
| 21 | You leave the clamps to themselves. | Vous laissez les meules à elles-mêmes. |
| 22 | The falling fifth, whistled | La quinte descendante, sifflée |
| 23 | Two notes, the Root and down, like a bird that knows only one thing to say. No voice spent. In fog, whoever is with you whistles back. | Deux notes, la Racine et la descente, comme un oiseau qui ne sait dire qu'une seule chose. Aucune voix dépensée. Dans le brouillard, qui vous accompagne siffle en retour. |
| 24 | Whistle | Siffler |
| 25 | You whistle it, the falling fifth: the Root, and down. | Vous la sifflez, la quinte descendante : la Racine, et la descente. |
| 26 | Two notes, down, from {0}, {1}: Lyra, whistling it back. | Deux notes, descendantes, {0}, {1} : Lyra, qui la siffle en retour. |
| 27 | From {0}, {1}, glass rings once, faintly: Kaelen's hand, answering. | {0}, {1}, du verre tinte une fois, faiblement : la main de Kaelen, qui répond. |
| 28 | And from {0}, {1}, softly, it whistles. Two notes. The Root, and down. It got the interval exactly right. | Et {0}, {1}, doucement, cela siffle. Deux notes. La Racine, et la descente. L'intervalle était parfaitement juste. |
| 29 | Then your whistle, the one you blew outside the Hedge: two notes, the Root, and down. It got the interval exactly right. | Puis votre sifflement, celui que vous avez lancé hors de la Haie : deux notes, la Racine, et la descente. L'intervalle était parfaitement juste. |
| 30 | ahead | de devant |
| 31 | ahead on your right | de devant, sur votre droite |
| 32 | your right | de votre droite |
| 33 | behind you on your right | de derrière, sur votre droite |
| 34 | behind you | de derrière vous |
| 35 | behind you on your left | de derrière, sur votre gauche |
| 36 | your left | de votre gauche |
| 37 | ahead on your left | de devant, sur votre gauche |
| 38 | close by | tout près |
| 39 | some way off | à quelque distance |
| 40 | far off | au loin |
| 41 | The sermon comes round to the Consecrated and the blessing of the glass, and some of them look toward the North Gate with a kind of nervous piety. | Le sermon en vient aux Consacrés et à la bénédiction du verre, et certains regardent vers la porte Nord avec une sorte de piété inquiète. |
| 42 | {0} makes the ward-sign at you, fingers to lips and fingers to ear, and then, because you are walking beside a Synod soldier, makes it again, faster. | {0} vous fait le signe de garde, doigts aux lèvres et doigts à l'oreille, puis, parce que vous marchez à côté d'un soldat du Synode, le refait, plus vite. |
| 43 | A woman in a doorway makes the ward-sign at you, fingers to lips and fingers to ear, and then, because you are walking beside a Synod soldier, makes it again, faster. | Une femme, sur le pas d'une porte, vous fait le signe de garde, doigts aux lèvres et doigts à l'oreille, puis, parce que vous marchez à côté d'un soldat du Synode, le refait, plus vite. |
| 44 | A man across the lane makes the ward-sign at you, fingers to lips and fingers to ear, and then, because you are walking beside a Synod soldier, makes it again, faster. | Un homme, de l'autre côté de la ruelle, vous fait le signe de garde, doigts aux lèvres et doigts à l'oreille, puis, parce que vous marchez à côté d'un soldat du Synode, le refait, plus vite. |
| 45 | No note | Pas de note |
| 46 | Entered: {0}, {1}. | Inscrit : {0}, {1}. |
| 47 | Died bravely. | Une mort courageuse. |
| 48 | Margin note for {0} | Note de marge pour {0} |
| 49 | The margin | La marge |
| 50 | Sable reads it over your shoulder, and draws a line through it. | Sable la lit par-dessus votre épaule, et la barre d'un trait. |
| 51 | The Veil keeps three rules. Write what happened. Write who it happened to. Do not comfort yourself in the margin. | Le Voile tient trois règles. Écrire ce qui est arrivé. Écrire à qui c'est arrivé. Ne pas se consoler dans la marge. |
| 52 | Sable draws a line through it. | Sable la barre d'un trait. |
