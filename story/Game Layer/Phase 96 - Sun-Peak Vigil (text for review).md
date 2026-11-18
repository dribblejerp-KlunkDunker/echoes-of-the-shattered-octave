# Phase 96: the Dawning Heights, part four: Sun-Peak Vigil (text for review)

*Written 16 Nov 2026 by team B, under the owner's approval of Phases 89 and 90 (14 Nov). Code: `js/vigil96.js`. Test: `test/vigil96.test.js`. French: `tools/i18n/p96-vigil.tsv`. Every line is new and [PROPOSED] unless a book or bible is named.*

## The book changed the plan

No book names the Vigil. It stands only in the Series Bible (its name, :204), in Vol II (:91, :93, :100, :112) and in the Master Reference (its place). Vol III takes away the ground that Vol II built it on:

- Vol III:22 re-labels the "Choral Orthodoxy" as the Reach's Cantor craft. The Vigil is no longer "the old faith". It is given no doctrine at all: it is a house of twelve clergy who keep a bell.
- Vol III:18 strikes the Under-Choirs, the only thing Vol I and II put "beneath the Sun-Altar". So Vol II's "They know what is under the Altar" and "thirty-eight years" are cut, and so is Phase 90's sealed under-stair.
- The plan's "Light's lullaby" (Phase 89 Q15) is cut. No book has a lullaby of the Light, and keepers who go down a stair on the Longest Night are Book Four's reveal (Book Four Part One:2055-2057; Vol V:198-201). The Vigil says nothing of keepers, stairs or the Longest Night.
- The Rite Coriel watched is the canon one: "three hundred sunrises at the Dawning Spire" (Series Bible:184), not Vol I's struck Rite of 388.
- No cloud deck in game text. Snow on the peaks (Book Two Part Two:523, "snow on their summits").
- The place is in Harvestmonth 419. Nobody here knows of the Church's return to the Altar or the Restoration (both Ashfall, Book Two Part Two:699-707).
- Commander's rulings, 16 Nov: the twelve include Coriel; the eleven names stand; the yard is "the tower yard" (not "the Bell Yard", a Whisper-Grove street).

## What was built

- **Two maps.** `p96_vigil` (open sky, 56 by 48) and `p96_cell` (the Abbess's cell, roofed, its own map).
- **The way in: the Kestrel.** One far entry, `p96_vigil` ("Fly to Sun-Peak Vigil, on the peaks of the Dawning Heights.", 30 hours). She sets you down on the snow shelf at (28.5, 44.0); she is moored there with her ladder at (33.6, 43.8) to go aboard. No door is set in any other team's map.
- **The gate and the gate-bell.** The gate at (28, 38) is shut ("Shut. There is a bell on a post by the gate.") until you ring the small bell on its post at (30.4, 39.5). Then Brother Fabian says "Light keep you true. Come in." and the gate opens (`p96b_gate`). It stays open on later visits.
- **The cloister of twelve.** A flagged walk two cells wide round a snow garth, with white pillars every three cells. Twelve cell doors, six a side: eleven are "not yours to open"; the west door at (15, 19) is the Abbess's.
- **The Abbess's cell.** Plaster walls, boards, a cot, a desk with a shut book and a tallow lamp, a small window on the white peaks. **Abbess Coriel** (Vol II:100) sits there. The door leads back to the cloister walk at (16.6, 19.5).
- **The dusk-bell tower.** A round tower, its dark bronze bell in a bell-cote at the top, readable from the garth. Sister Ottavia stands inside by the rope. Using the rope: "Sister Ottavia: That is ours to ring." Nothing else happens.
- **The tower yard and the postern.** Flags, a low parapet over the drop. The postern at (34, 1) leads to the Chalk Cliffs (`CLIFFS96.P.arrive`, facing north, down the face); if the Cliffs module is missing it is "Barred."
- **The dusk bell** (Vol II:93). `VIGIL96.bell(tod)` is the contract with `js/cliffs96.js`: day from tod 0.25, twelve strokes from tod 0.75, one every 1/360 of a day (6 real seconds), then dark until dawn. Worked from `G.tod` only. In the Vigil each stroke sounds, the bell swings, and the first stroke of each dusk says "The dusk bell. Sister Ottavia rings it."
- **Coriel's help** ("completely, instantly, at any cost to herself"). "Ask for her help" restores health, voice and stamina, clears bleeding, deafness, hush, fear, injuries and a locked glass arm, and fills hunger when journey needs are on. Once a game day (`p96b_help` = day + 1). Asked again: "Tomorrow. I have nothing left today." For the rest of that day her greeting is "Sit. I will sit too."
- **Thanks refused** ("will not accept thanks"). "Thank her" gets one of three refusals in turn (`p96b_thank`, to 99). Nothing is given; nothing changes.
- **The people.** Twelve clergy: Coriel and eleven (Brother Fabian at the gate, Sister Ottavia at the rope, Sister Domitia the infirmarian, and Albinus, Honoria, Marcellin, Prisca, Quintin, Liviana, Clemence and Galen about the walk, the garth and the yard). Fabian, Ottavia and Domitia have two topics each; the others one or two from a small pool chosen by a hash of their place in the list. Their topics show as buttons under what they say (the game's own "Tell me about" list shows only the shared topics).
- **No foes, no lamp, no items.** A place of people and talk.
- **The look.** Warm rough white stone with grey mortar, blue-white snow, pale grey flags, undyed habits (oatmeal and grey, light but not white), a dark bronze bell. All drawn in code with hashed noise.
- **Flags:** `p96b_gate`, `p96b_help`, `p96b_thank`, `p96b_seen` (bits: first sight, cloister, first stroke, tower yard).

Test: `test/vigil96.test.js`, 20 checks, all pass.

## For the owner

1. **The Vigil has no doctrine.** A house of twelve clergy who keep a bell. *Recommend: keep; Vol III leaves it nothing else.*
2. **The under-stair, the lullaby and "thirty-eight years" are cut.** *Recommend: keep cut.*
3. **The twelve include Coriel** (Commander's ruling). *Recommend: keep.*
4. **The eleven names** (Fabian, Ottavia, Domitia, Albinus, Honoria, Marcellin, Prisca, Quintin, Liviana, Clemence, Galen), grepped clear of story/ and js/. *Change any.*
5. **The dusk bell's numbers:** twelve strokes from the engine's sunset (tod 0.75), one every four game minutes. Vol VII gives only Frostmonth's dusk hour; game text says only "at dusk". *Recommend: keep.*
6. **Coriel's help once a game day, whole.** *Recommend: keep.*
7. **From the tower she could see the Spire.** Invented, to give "watched the Rite" a place. *Recommend: keep.*
8. **The gate-bell, the cloister of twelve, the cell, the tower and the postern** are Phase 90's rooms, kept. The rope is Ottavia's, never the player's. *Recommend: keep.*
9. **The Kestrel's menu line** reads "Fly to Sun-Peak Vigil, on the peaks of the Dawning Heights." (a sentence, like the Tiers' entry). *Recommend: keep.*

## The new lines

Lines marked canon or "rests on" are backed by the line named (quoted in team B's LORE-vigil.md). All others are [PROPOSED].

| English | French | Source |
|---|---|---|
| A cell of the house | Une cellule de la maison | [PROPOSED] |
| A cell of the house. It is not yours to open. | Une cellule de la maison. Ce n'est pas à vous de l'ouvrir. | [PROPOSED] |
| A cot with one grey blanket. | Un lit étroit avec une seule couverture grise. | [PROPOSED] |
| A house of clergy on a mountain, with a bell. That is all it has been, in my time. | Une maison de religieux sur une montagne, avec une cloche. C'est tout ce qu'elle a été, de mon temps. | [PROPOSED] |
| A low parapet. Below it the mountain falls away to the chalk cliffs. | Un parapet bas. En dessous, la montagne plonge jusqu'aux falaises de craie. | [PROPOSED] |
| A pillar of the walk, white stone, worn smooth at the height of a hand. | Un pilier de la galerie, de pierre blanche, poli à hauteur de main. | [PROPOSED] |
| A plain desk. A book lies shut on it, and a tallow lamp burns beside it. | Un bureau tout simple. Un livre fermé est posé dessus, et une lampe de suif brûle à côté. | [PROPOSED] |
| A small bronze bell on a post by the gate, with a rope. Ring it | Une petite cloche de bronze sur un poteau près de la porte, avec une corde. La sonner | [PROPOSED] |
| A small window. Through it, the white peaks, and the sky over them. | Une petite fenêtre. Au travers, les sommets blancs, et le ciel au-dessus. | [PROPOSED] |
| A tallow lamp, burned low. | Une lampe de suif, presque consumée. | [PROPOSED] |
| A white wall on the mountainside, a gate in it, and a bell tower above. A small bell hangs on a post by the gate. | Un mur blanc à flanc de montagne, une porte dans ce mur, et un clocher au-dessus. Une petite cloche pend à un poteau près de la porte. | [PROPOSED] |
| Abbess Coriel | L'Abbesse Coriel | canon: Vol II:100 |
| Ask for her help | Lui demander son aide | [PROPOSED] |
| Barred. | Barrée. | [PROPOSED] |
| Brother Albinus | Frère Albinus | [PROPOSED] |
| Brother Fabian | Frère Fabian | [PROPOSED] |
| Brother Fabian: Light keep you true. Come in. | Frère Fabian : Que la Lumière vous garde juste. Entrez. | [PROPOSED]; the greeting is Vol II:97 |
| Brother Galen | Frère Galen | [PROPOSED] |
| Brother Marcellin | Frère Marcellin | [PROPOSED] |
| Brother Quintin | Frère Quintin | [PROPOSED] |
| Coriel. I am the Abbess of this house. There are twelve of us left. I am the oldest. | Coriel. Je suis l'Abbesse de cette maison. Nous ne sommes plus que douze. Je suis la plus vieille. | rests on Vol II:91 ("Twelve clergy left") and :100 (f, 80s); "the oldest" [PROPOSED] |
| Do not thank me. | Ne me remerciez pas. | rests on Vol II:100 ("will not accept thanks") |
| Fly to Sun-Peak Vigil, on the peaks of the Dawning Heights. | Voler jusqu'à la Veille du Pic-Soleil, sur les sommets des Hauteurs de l'Aube. | [PROPOSED] |
| I keep the infirmary. Chilblains, mostly, and the old cough. Up here the cold is the only enemy you can see. | Je tiens l'infirmerie. Des engelures, surtout, et la vieille toux. Ici, le froid est le seul ennemi qu'on voie. | [PROPOSED] |
| I watched it. From the tower you can see the Spire, on a clear morning. Three hundred sunrises I stood up there and watched, and I did nothing. That is all there is to say about it. | Je l'ai regardé. Du haut de la tour, on voit la Flèche, par un matin clair. Trois cents levers de soleil, je suis restée là-haut à regarder, et je n'ai rien fait. C'est tout ce qu'il y a à en dire. | rests on Vol II:100 ("Watched the Rite and did nothing") and Series Bible:184 ("three hundred sunrises at the Dawning Spire"); the view from the tower [PROPOSED] |
| It does not go off the peaks, not even at the end of summer. We melt it for water. | Elle ne quitte jamais les sommets, pas même à la fin de l'été. Nous la faisons fondre pour avoir de l'eau. | [PROPOSED] |
| It is mine to ring. My hands know the weight of it, and the bell knows my hands. | C'est à moi de la sonner. Mes mains connaissent son poids, et la cloche connaît mes mains. | [PROPOSED] |
| Light keep you true, all the same. | Que la Lumière vous garde juste, tout de même. | [PROPOSED]; the greeting is Vol II:97 |
| Light keep you true. Are you hurt? Then go to the Abbess, not to me. | Que la Lumière vous garde juste. Vous êtes blessé ? Alors allez voir l'Abbesse, pas moi. | [PROPOSED]; the greeting is Vol II:97 |
| Light keep you true. Come in, and shut the door. The cold gets into everything. | Que la Lumière vous garde juste. Entrez, et fermez la porte. Le froid se glisse partout. | [PROPOSED]; the greeting is Vol II:97 |
| Light keep you true. Do not lean on the parapet. | Que la Lumière vous garde juste. Ne vous penchez pas sur le parapet. | [PROPOSED]; the greeting is Vol II:97 |
| Light keep you true. Do not touch the rope. | Que la Lumière vous garde juste. Ne touchez pas à la corde. | [PROPOSED]; the greeting is Vol II:97 |
| Light keep you true. Mind the ice on the step. | Que la Lumière vous garde juste. Attention à la glace sur la marche. | [PROPOSED]; the greeting is Vol II:97 |
| Light keep you true. Shut the gate behind you, when you go. | Que la Lumière vous garde juste. Fermez la porte derrière vous, en partant. | [PROPOSED]; the greeting is Vol II:97 |
| Light keep you true. Sit, if you like. There is only the cot. | Que la Lumière vous garde juste. Asseyez-vous, si vous voulez. Il n'y a que le lit. | [PROPOSED]; the greeting is Vol II:97 |
| Light keep you true. Speak softly. The Abbess is resting. | Que la Lumière vous garde juste. Parlez doucement. L'Abbesse se repose. | [PROPOSED]; the greeting is Vol II:97 |
| Light keep you true. The wind is from the south today. | Que la Lumière vous garde juste. Le vent vient du sud aujourd'hui. | [PROPOSED]; the greeting is Vol II:97 |
| Light keep you true. Walk on the flags. The garth is deep. | Que la Lumière vous garde juste. Marchez sur les dalles. La neige du préau est profonde. | [PROPOSED]; the greeting is Vol II:97 |
| Light keep you true. Watch the sky. It changes fast up here. | Que la Lumière vous garde juste. Surveillez le ciel. Il change vite, ici. | [PROPOSED]; the greeting is Vol II:97 |
| Light keep you true. We are not used to new faces. | Que la Lumière vous garde juste. Nous n'avons pas l'habitude des nouveaux visages. | [PROPOSED]; the greeting is Vol II:97 |
| Light keep you true. You came up a long way to see snow. | Que la Lumière vous garde juste. Vous êtes monté bien loin pour voir de la neige. | [PROPOSED]; the greeting is Vol II:97 |
| No. Keep your thanks for someone who has earned them. | Non. Gardez vos remerciements pour quelqu'un qui les a mérités. | rests on Vol II:100 |
| On a clear morning you can see it from the tower, a white needle a long way off. You can see the crack in it. We do not look at it much. | Par un matin clair, on la voit de la tour, une aiguille blanche très loin. On voit la fissure. Nous ne la regardons pas beaucoup. | [PROPOSED] |
| Ring the bell on the post and somebody comes. Most of the winter nobody rings it at all. | Sonnez la cloche sur le poteau, et quelqu'un vient. Presque tout l'hiver, personne ne la sonne. | [PROPOSED] |
| She does not ask what is wrong. She sits you on the cot and sees to every hurt you have, and gives you her own bread and her own water. It is done before you can say no. | Elle ne demande pas ce qui ne va pas. Elle vous assoit sur le lit, soigne chacune de vos blessures, et vous donne son propre pain et sa propre eau. C'est fait avant que vous puissiez dire non. | rests on Vol II:100 ("completely, instantly, at any cost to herself") |
| She gives away what she needs. I scold her for it, and she does it again the next day. | Elle donne ce dont elle a besoin. Je la gronde pour ça, et elle recommence le lendemain. | [PROPOSED] |
| She was here before any of us. She does not sleep much, and she will not be thanked. | Elle était là avant nous tous. Elle dort peu, et elle ne veut pas qu'on la remercie. | [PROPOSED] |
| Shut. There is a bell on a post by the gate. | Fermée. Il y a une cloche sur un poteau près de la porte. | [PROPOSED] |
| Sister Clemence | Sœur Clemence | [PROPOSED] |
| Sister Domitia | Sœur Domitia | [PROPOSED] |
| Sister Honoria | Sœur Honoria | [PROPOSED] |
| Sister Liviana | Sœur Liviana | [PROPOSED] |
| Sister Ottavia | Sœur Ottavia | [PROPOSED] |
| Sister Ottavia rings it at dusk. Whatever comes up the cliffs stops while it rings. | Sœur Ottavia la sonne au crépuscule. Ce qui monte les falaises s'arrête tant qu'elle sonne. | [PROPOSED] |
| Sister Ottavia: That is ours to ring. | Sœur Ottavia : C'est à nous de la sonner. | [PROPOSED] |
| Sister Prisca | Sœur Prisca | [PROPOSED] |
| Sit. I will sit too. | Asseyez-vous. Je vais m'asseoir aussi. | [PROPOSED] |
| Something comes up the cliffs every night, out of the dark below. The bell holds it while it rings. If you go down by the postern, be up before the last stroke. | Quelque chose monte les falaises chaque nuit, sorti du noir d'en bas. La cloche le retient tant qu'elle sonne. Si vous descendez par la poterne, soyez remonté avant le dernier coup. | [PROPOSED] |
| Sun-Peak Vigil | La Veille du Pic-Soleil | canon: Series Bible:204; Vol II:91 |
| Sun-Peak Vigil: the Abbess's cell | La Veille du Pic-Soleil : la cellule de l'Abbesse | [PROPOSED] |
| Thank her | La remercier | [PROPOSED] |
| The Abbess | L'Abbesse | [PROPOSED] |
| The Abbess's cell | La cellule de l'Abbesse | [PROPOSED] |
| The bell | La cloche | [PROPOSED] |
| The bell rope, with a wool grip worn dark by hands. | La corde de la cloche, avec une poignée de laine noircie par les mains. | [PROPOSED] |
| The cliffs | Les falaises | [PROPOSED] |
| The cloister. A walk round a square of snow, and twelve doors. | Le cloître. Une galerie autour d'un carré de neige, et douze portes. | [PROPOSED] |
| The door, back out to the cloister | La porte, pour ressortir dans le cloître | [PROPOSED] |
| The dusk bell | La cloche du crépuscule | [PROPOSED] |
| The dusk bell, at the top of the tower. Dark bronze. | La cloche du crépuscule, au sommet de la tour. Du bronze sombre. | [PROPOSED] |
| The dusk bell. Sister Ottavia rings it. | La cloche du crépuscule. Sœur Ottavia la sonne. | [PROPOSED] |
| The dusk-bell tower. The bell hangs at the top, dark bronze. A rope comes down inside. | La tour de la cloche du crépuscule. La cloche est suspendue au sommet, de bronze sombre. Une corde descend à l'intérieur. | [PROPOSED] |
| The gate | La porte | [PROPOSED] |
| The gate of Sun-Peak Vigil | La porte de la Veille du Pic-Soleil | [PROPOSED] |
| The gate stands open. | La porte est ouverte. | [PROPOSED] |
| The infirmary | L'infirmerie | [PROPOSED] |
| The Kestrel's ladder, hanging over the snow. Climb aboard | L'échelle de la Crécerelle, pendue au-dessus de la neige. Monter à bord | [PROPOSED] |
| The Kestrel, moored on the shelf, her envelope stiff with frost. | La Crécerelle, amarrée sur la corniche, son enveloppe raidie par le givre. | [PROPOSED] |
| The postern, down to the chalk cliffs | La poterne, pour descendre aux falaises de craie | [PROPOSED] |
| The Rite | Le Rite | [PROPOSED] |
| The rope | La corde | [PROPOSED] |
| The small bell on its post. The gate is open. | La petite cloche sur son poteau. La porte est ouverte. | [PROPOSED] |
| The snow | La neige | [PROPOSED] |
| the snow shelf below Sun-Peak Vigil | la corniche de neige sous la Veille du Pic-Soleil | [PROPOSED] |
| The Spire | La Flèche | [PROPOSED] |
| The tower yard. Past the parapet the mountain falls away. | La cour de la tour. Passé le parapet, la montagne plonge. | [PROPOSED] |
| The twelve | Les douze | [PROPOSED] |
| There is nothing to thank me for. Go and do some good with it. | Il n'y a pas de quoi me remercier. Allez donc en faire quelque chose de bon. | rests on Vol II:100 |
| Thirty hours south, over the white peaks, the Kestrel comes down on a shelf of snow below a white wall and a bell tower. | Trente heures plus au sud, par-dessus les sommets blancs, la Crécerelle se pose sur une corniche de neige, sous un mur blanc et un clocher. | [PROPOSED] |
| This house | Cette maison | [PROPOSED] |
| Tomorrow. I have nothing left today. | Demain. Il ne me reste plus rien aujourd'hui. | [PROPOSED] |
| Twelve of us. There were more once. Nobody comes up the mountain to join now. | Nous sommes douze. Autrefois, nous étions plus nombreux. Plus personne ne monte la montagne pour nous rejoindre. | [PROPOSED] |
| Twelve strokes at dusk. While it rings, whatever comes up the cliffs lets go of the rock. When it stops, it does not. | Douze coups au crépuscule. Tant qu'elle sonne, ce qui monte les falaises lâche la roche. Quand elle se tait, non. | [PROPOSED] |
| Visitors | Les visiteurs | [PROPOSED] |
| We do not get many. A ship on the shelf is a thing we talk about for a month. | Nous n'en avons pas beaucoup. Un navire sur la corniche, on en parle pendant un mois. | [PROPOSED] |
| We ring it at dusk. It is the only thing that works. | Nous la sonnons au crépuscule. C'est la seule chose qui marche. | canon: Vol II:93 ("The Vigil rings a bell at dusk and the bell is the only thing that works") |
| Who she is | Qui elle est | [PROPOSED] |
| You are loud for a mountain. Light keep you true, all the same. | Vous êtes bien bruyant pour une montagne. Que la Lumière vous garde juste, tout de même. | [PROPOSED]; the greeting is Vol II:97 |
| You climb down onto the snow. It is very cold, and very quiet. Above you, a white wall, a gate, and a bell tower. | Vous descendez sur la neige. Il fait très froid, et tout est très calme. Au-dessus de vous, un mur blanc, une porte et un clocher. | [PROPOSED] |
