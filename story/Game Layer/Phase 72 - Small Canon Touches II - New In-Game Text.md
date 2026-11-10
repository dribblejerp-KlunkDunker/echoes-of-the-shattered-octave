# Phase 72 — Small Canon Touches II: New In-Game Text

*Recorded 10 Nov 2026 from the game's translation file (`tools/i18n/p72-touches.tsv`). ROADMAP R9 #25, the second five of the Story Brainstorm's twenty small canon touches (b, h, j, m, s), in `js/touches72.js`. Every line is the manuscript's, put into the present tense where the game reads in the present; placements and the few connecting words the book does not give are marked [PROPOSED]. Nothing is voiced: none of these lines is spoken by a book character.*

## What is new, in short

- **b. *Apples in the Rain*, off-key on the fourth bar** (Book One ch. 1, l. 436). The game's own "A voice beyond the Hedge" card at the tannery culvert (`js/game.js`, the `hedge_voice` trigger) now ends as the book's Hedge-voice does: *"And after it, softly, humming: the first bars of "Apples in the Rain." The old orchard working-song. Off-key on the fourth bar. Always the fourth bar."* The three choices are unchanged. [PROPOSED] The place: the book has it at Weavers' Cross, to Lyra; the culvert is where the game's Hedge speaks to you. The Wearer's set already sings it (`js/grove.js`, "Seven times"). Not voiced: a hum is not a spoken line.
- **h. The hound's bed** (ch. 2, l. 612). *"When he dropped a pebble into the middle of it, the pebble struck the earth and made no sound at all."* A skipping stone that lands in the game's hound's bed in the clearing (`js/maps.js`, 17.5, 24.5) makes no sound: no listener turns, no clatter plays, no ripple is drawn, and the message is the book's. Anywhere else the stone clatters as before. [PROPOSED] The bed's reach for a landing stone (1.2 cells, "a rough oval a little longer than a big dog"). Bottles are unchanged: the book drops a pebble.
- **j. Legionnaires with grass through their feet** (ch. 11, l. 3386). While the Greening runs, four passive Legionnaires stand at the quarry's gate (the headframe door), a tuft of grass at each one's feet. Looking at them gives the whole line: *"…because nobody had told them to do anything else."* `js/greening44.js`'s card already gives the first half. The book puts them at the quarry gate only, so the greened town gets none. [PROPOSED] Their places: two either side of the door, a pace and a half in, facing into the quarry.
- **m. "Colours were brighter once"** (ch. 1, l. 294). *"Everyone over thirty said the same thing, if you got them talking late enough."* A townsperson's "Any news?" after 21:00 can now be the book's reds, made first-person. The game's own "Red was redder when I was a girl" line stays. The Church's answer is in the Synod Gazette: *"would come right again with prayer."* [PROPOSED] Late is 21:00 to 04:00. Any patron can say it, since the game keeps no ages. The Gazette prints it in two Part One issues where the sheet has room (`js/rumours.js` allows two to four items): the quarry roster issue until Marsh is commended, and the Hedge issue until the fault there is resolved.
- **s. Hetty Bram's eyebrows** (ch. 4, ll. 1372–1386). The board says NO TOASTS, and Hetty "communicated almost entirely with her eyebrows". In her dialogue at the Boar, **Buy a drink** is the book's whole conversation: an eyebrow each, a leather mug of the dark Reach ale without being asked, your coin. Then *"Silently. No toasts."* The lines are shown in italics: told, not said. You say nothing. [PROPOSED] The button and its price (one sovereign, the game's smallest coin; her greeting's "a copper" has no coin in the game). It is offered only in the Boar, before the Greening, and not without a coin.

## Skipped, with reasons

- **t. Kaelen's stile story** (ch. 7, l. 2465). Skipped. The book's scene (Kaelen at Lyra's table the night of the warrant) is not played in the game. The martyr line already exists three times as Lyra's: `js/data.js` (her "says" and her own topic), `js/party.js:74` (voiced, `js/voice-lines.js`), and `js/companion-talk.js:266`. Two of these have her telling it to her father. Moving it to Kaelen's stile would mean rewriting that existing (and voiced) text. Flagged for the canon sweep instead.
- **b, the Tobin's-journal part.** Not done. The twelve pages in `js/tobin.js` are the game's own [PROPOSED] prose, and the book gives Tobin no words about the song. A page about it would be invented.
- **b, the Wearer's voice set.** Already in the game (`js/grove.js`, "Seven times", in text). A hum cannot be rendered as a spoken Kokoro line.
- **m, the rumour.** Partly in the game already (`js/rumours.js` a_colour). This batch adds the book's words alongside it and does not change it.

Taken in place of t: **h** (the hound's bed). Not taken: c (it asks for shorter rests, which is a design decision), e (where and when townsfolk lift a palm is a design decision), l (the glassed player and the Legionnaire is design), p (marked [PROPOSED UI] in the brainstorm).

## [PROPOSED] choices

1. b: the hum is added to the game's own Hedge-voice card at the tannery culvert, after the voice's words (the book has it at Weavers' Cross, to Lyra).
2. h: a stone landing within 1.2 cells of the hound's bed's centre is silent.
3. j: four Legionnaires, two each side of the headframe door, only while the Greening's escape runs (`greening`, not `escaped`, `part3` or `part4`).
4. m: the late rumour is said from 21:00 to 04:00 by any patron, in the first person. The Gazette line appears in the quarry roster issue (until `tobiah_met`) and the Hedge issue (until `wearer_dead`), phrased "The Church says…".
5. s: "Buy a drink" in Hetty's dialogue, one sovereign, at the Boar before the Greening.

## Every line

Source: `tools/i18n/p72-touches.tsv` (10 lines).

| # | English | French |
|---|---|---|
| 1 | And after it, softly, humming: the first bars of "Apples in the Rain." The old orchard working-song. Off-key on the fourth bar. Always the fourth bar. | Et après, doucement, quelqu'un fredonne : les premières mesures de « Pommes sous la pluie ». La vieille chanson de travail des vergers. Faux à la quatrième mesure. Toujours la quatrième mesure. |
| 2 | The pebble strikes the earth and makes no sound at all. | Le caillou frappe la terre et ne fait aucun bruit. |
| 3 | The Legionnaires at the gate | Les Légionnaires à la grille |
| 4 | Four of them stand at the gate exactly where they were posted, bells lifted, with grass coming up through their pewter feet, because nobody has told them to do anything else. | Quatre d'entre eux se tiennent à la grille, exactement là où on les a postés, cloches levées, l'herbe poussant à travers leurs pieds d'étain, parce que personne ne leur a dit de faire autre chose. |
| 5 | Colours were brighter once. The leaves of the iron-oaks turned red in the autumns when I was a child, a red red, a red like a shout. Now they turn a kind of rust-pink, like a stain that has been scrubbed. And the sun at noon was a thing you could not look at. | Les couleurs étaient plus vives, autrefois. Les feuilles des chênes de fer devenaient rouges, les automnes de mon enfance, un rouge rouge, un rouge comme un cri. Maintenant elles virent à une sorte de rose rouille, comme une tache qu'on a frottée. Et le soleil de midi, on ne pouvait pas le regarder. |
| 6 | The Church says it is the Cascade: that all things have gone a quarter-tone flat since the Spire of Dawning broke, and will come right again with prayer. | L'Église dit que c'est la Cascade : que toutes choses ont baissé d'un quart de ton depuis que la Flèche de l'Aube s'est brisée, et qu'elles reviendront justes par la prière. |
| 7 | Buy a drink | Payer à boire |
| 8 | You have no coin. | Vous n'avez pas une pièce. |
| 9 | She raises one eyebrow at you, and you raise one back, and she draws you a leather mug of the dark Reach ale without being asked and puts it on the bar and takes your coin, and that is the whole of the conversation. | Elle lève un sourcil vers vous, vous en levez un en retour, et elle vous tire une chope de cuir de la bière brune des Confins sans qu'on le lui demande, la pose sur le comptoir et prend votre pièce, et c'est là toute la conversation. |
| 10 | You drink. Silently. No toasts. | Vous buvez. En silence. Pas de toasts. |
