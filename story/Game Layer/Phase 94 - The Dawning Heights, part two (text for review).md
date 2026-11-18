# Phase 94: the Dawning Heights, part two: the Anchorage (text for review)

*Written 15 Nov 2026 on Fable 5.2, under the owner's approval of Phases 89 and 90 (14 Nov) and his word "go forth". Code: `js/anchorage94.js`. Every line is new and [PROPOSED] unless a book or bible is named; the French is in `tools/i18n/p94-anchorage.tsv`.*

## The book changed the plan

Phase 89 drew the Anchorage as shafts cut into Mount Lumina, with a cavern under the city. Reading Book Two for this build showed that cannot be, and the book wins:

- Sol-Luminary is "a great inverted cone" hung from the Spire's flank "over a gulf of nothing". There is no rock under it.
- "The nine were the city's bones. They came down from rings in the Spire's flank at their long slants and took hold of the city's rim."
- Each chain comes through the iron ring in its anchor-house floor, "going on down through the floor into the city's frame".
- The anchor-houses stand on the rim, at the top of the city, in the Bleach. The seventh is the Church's, with a winch and two Flambeaux.

So the Anchorage is now **the inside of the city's frame**: the Chain-Yards (Vol II: "where the sky-chains are maintained by crews on three-month contracts and a 1-in-9 mortality rate"), worked from underneath since the Fracture took the rim. All nine of Phase 90's rooms are kept and moved into the frame. The player never goes above the line.

## What was built

- **The way in.** A low iron door in the Tiers, by the top of the goods-cage under the bell-gallery stair, with a notched link stamped on it. A door leads back.
- **The winch-room** (the first lamp). The Sky-Dock winch, drawn from the book's words for an anchor-house winch: "A great iron drum the height of a man, with a brake-wheel on its side like a ship's wheel and a lever as long as an oar." **Winchmaster Bardo** is here, alive. Vol II: "Runs the tether-chains. Swears beautifully. Has lost nineteen men to jerking gravity tethers and keeps their tally cut into his winch housing." The tally is cut on the housing. He has five things to say and sells a harness.
- **The seventh bone.** You walk down the chain itself in its well, link by link, with a tallow lamp on every pin. The well is open on both sides, and a fall kills.
- **The wonder: the change.** The city sways and the bones take it one after another, so inside the frame the nine chains toll: one note every two seconds, in a bell-ringers' plain hunt on nine, worked out from the place's own clock and the same for everyone. A card at the top of the screen shows the row, with the seventh marked. When the seventh speaks, a link under you throws you down the chain (5 hurt) and a pin holds you.
- **The tolling gallery.** All nine bones come down through one floor as pillars of chain. Fret-crawlers on the walls.
- **The Glass-Grown** (a secret, through a gap behind the first bone). Seven of them, standing, faces turned up toward the Spire, each sounding 528. Vol II: "Human-shaped bells. They sound the pitch of whatever Anchor claimed them, continuously, and they are conscious." They are not foes. If you sing near them, every one turns its head toward you, and that is all they can do. A winchman's cap lies on the plate in front of one of them.
- **The third bone's landing** (the second lamp).
- **The keel-weights** (Phase 90's "bed-weights"). Blocks of Lumina's white stone as big as churches, hung on the bones' ends in the keel. The Brake-Lever leans in a corner. Shriek-motes and a fret-crawler.
- **The Winch-Deep** (the third lamp at its door). The nine bones come down into one iron ring, and the old capstan turns with nobody at the bars.
- **The keeper: the Nineteen** (Phase 89's "Bardo's Nineteen"). A Static Remnant (Vol II: "human-shaped voltage") cohered from the nineteen men Bardo lost. They are tied to the capstan and cannot leave its reach. Every eleven seconds the capstan creaks and they haul, and Vol II's tether jerk follows: "Everything on the walkway weighs four times normal for six seconds." For those six seconds a step is three tenths of a step, so the fight is to be out of their reach before they haul. 190 health; they hit for 7 to 13. Put down, they leave the Brake-Gloves and a link with nineteen notches, once.
- **The counterweight cage** (the shortcut). Its rope hangs slack in the winch-room until you free the brake at the bottom; then it rides both ways.
- **Bardo and the link.** If you stand by him with the notched link, he says nothing for once, and cuts one bar across all nineteen strokes. He does not take it.
- **The Souls rules.** Three shade-lamps (group i). The Nineteen come back after a week. A Piece here rings at 528.
- **The gear: a sixteenth set, the Chain-Yards.** Winchman's Cap (found), Brake-Gloves (the keeper's), Chain-Crew Harness (Bardo sells it), Brake-Lever (found). Three pieces: +1 armour. All four: a tether jerk weighs on you half as long. Each has its own look and picture.

Test: `test/anchorage94.test.js`, 17 checks. Pictures: `screenshots/p94/`.

## Phase 92 matched to the books again

The same reading turned up four more things in the Umbral Tiers. All are fixed in this phase:

1. **Flambeaux wear red.** Book One ch. 7: "robes the red of banked coals, hooded, their faces in shadow, each carrying a fire-stave: a staff of black iron as tall as a man, topped with an iron cage, and in every cage a fist-sized lump of amber Aether-Glass, burning." The Lamplighter had a white robe and a lantern on a pole. He is now in red with a fire-stave. His hood is red gone rust-black, and its description no longer speaks of soot: glass-fire burns "smokeless and without fuel".
2. **The Tiers and Flambeaux.** Brenna Corliss in Book Two: "The Tiers would pull the ladders up on Flambeaux." The cobbler's line about the Lamplighter now says so: the Tiers did pull the ladders up, and he was already down.
3. **The offerings on the line.** Book Two ch. 10: "A loaf of bread, black on the crust, half wrapped in a cloth. A tin cup with water in it. A candle-end, unlit, in a saucer. A child's drawing… a black shape with wings, and a sun crossed out. Three pears. A folded blanket, black." They now lie at the foot of the black wall. Brenna has two new topics in the book's words: the Wired, and the black angel.
4. **The Unison's note.** Book Two: "one high pure tone, sustained, endless"; "You stop hearing it after a year." A faint 528 Hz tone is now heard everywhere in the Tiers, clearest when you arrive and nearer the line. It fades to a third after about a minute, and a line of text says what it is.

## For the owner

**Ruled, 16 Nov 2026.** The owner: "I accept all, merge and proceed". All eight stand as built, Bardo's oaths included. Pull requests #125 to #129 (Phases 90 to 94) were merged into main the same day.

1. **The Anchorage is the city's frame, not shafts in the mountain.** *Recommend: keep; it is what Book Two allows.*
2. **Bardo's place.** Vol II calls him Sky-Dock Winchmaster. Here his winch is the one that hauls the goods-cage up from the docks, and he says he pinned the cage himself "after the nineteenth". *Recommend: keep.*
3. **The keel-weights** hang inside the keel "to keep the city's point down". That reason is invented. *Recommend: keep.*
4. **The change's numbers:** a stroke every 2 seconds; a thrown player takes 5. *Recommend: keep, and tune after you have walked it.*
5. **The Nineteen's numbers:** 190 health, a haul every 11 seconds, six seconds heavy (Vol II's figure), their reach 5.6 steps from the capstan. *Recommend: keep.*
6. **The Glass-Grown are never fought.** *Recommend: keep; Vol II says they are conscious.*
7. **The set's name and bonuses** (the Chain-Yards; +1 armour; the jerk half as long). *Recommend: keep.*
8. **Bardo's oaths.** Vol II says only that he "swears beautifully". His three greetings and the curse on whoever knocks his pin out are invented. *Change any.*

## Owed to the owner later

- Phase 91's question 4 (trophies and realm gear for the Reach's two keepers): to be raised when the Heights' four keepers are all built. Two of the four are built now: the Lamplighter and the Nineteen.

## The new lines

| English | French |
|---|---|
| A Link with Nineteen Notches [PROPOSED] | Un maillon à dix-neuf entailles |
| A bone's end, made fast in the keel-ring. [PROPOSED] | Le bout d'un os, amarré dans l'anneau de quille. |
| A chain-crew's mark: an iron link small enough for a belt, with a notch filed in it for each crewmate lost. This one has nineteen. [PROPOSED] | La marque d'une équipe de chaîne : un maillon de fer assez petit pour une ceinture, avec une entaille limée pour chaque compagnon perdu. Celui-ci en a dix-neuf. |
| A gap between two ribs of the frame, wide enough for one person, turned sideways. [PROPOSED] | Un passage entre deux côtes de la charpente, assez large pour une personne, de profil. |
| A harness of black leather and iron rings, to clip a man to a link while he works on it. The rings are worn bright on the inside. [PROPOSED] | Un harnais de cuir noir et d'anneaux de fer, pour accrocher un homme à un maillon pendant qu'il y travaille. Les anneaux sont polis par l'usure à l'intérieur. |
| A keel-weight: a block of Lumina's own white stone as big as a church, hung on the end of a bone to keep the city's point down. It turns, very slowly. [PROPOSED] | Un poids de quille : un bloc de la pierre blanche de Lumina, grand comme une église, pendu au bout d'un os pour garder la pointe de la ville vers le bas. Il tourne, très lentement. |
| A low iron door in the city's frame, a notched link stamped on its plate. The Chain-Yards [PROPOSED] | Une porte de fer basse dans la charpente de la ville, un maillon entaillé frappé sur sa plaque. Les Chantiers des Chaînes |
| A padded leather cap with an iron plate over the crown, for a place where the ceiling moves. [PROPOSED] | Une calotte de cuir rembourrée, une plaque de fer sur le dessus, pour un endroit où le plafond bouge. |
| A pin of the seventh bone: the iron boss between two links. It does not jump when the chain speaks. [PROPOSED] | Un axe du septième os : la bosse de fer entre deux maillons. Il ne saute pas quand la chaîne parle. |
| A tallow lamp in an iron cage, hung on the pin. [PROPOSED] | Une lampe à suif dans une cage de fer, pendue à l'axe. |
| A winchman's cap, set down on the plate in front of one of them, the way you set a thing down for somebody. [PROPOSED] | Une calotte de treuilliste, posée sur la plaque devant l'un d'eux, comme on pose une chose pour quelqu'un. |
| A winchman's gloves, the palms faced with iron scale for the brake-wheel. Whoever wore them last gripped very hard. [PROPOSED] | Des gants de treuilliste, les paumes garnies d'écailles de fer pour la roue de frein. Celui qui les a portés en dernier serrait très fort. |
| An iron lever as long as an oar, leaning in the angle of a rib where somebody stood it and did not come back for it. [PROPOSED] | Un levier de fer long comme une rame, appuyé dans l'angle d'une côte, là où quelqu'un l'a dressé sans revenir le chercher. |
| Bardo looks at the link in your hand for a long time, and for once says nothing at all. Then he reaches up with his knife and cuts one bar across all nineteen strokes. [PROPOSED] | Bardo regarde longtemps le maillon dans votre main, et pour une fois ne dit rien du tout. Puis il lève son couteau et taille une barre en travers des dix-neuf traits. |
| Below the weights, in the keel, where the nine are made fast. The old capstan. Nobody has worked it since before my time, and it turns. I have nineteen strokes up here, and I have stood at the top of that stair and heard nineteen men hauling. I do not go down. [PROPOSED] | Sous les poids, dans la quille, là où les neuf sont amarrées. Le vieux cabestan. Personne ne l'a manœuvré depuis avant mon temps, et il tourne. J'ai dix-neuf traits ici, en haut, et je me suis tenu au sommet de cet escalier et j'ai entendu dix-neuf hommes haler. Je ne descends pas. |
| Brake-Gloves [PROPOSED] | Gants de frein |
| Brake-Lever [PROPOSED] | Levier de frein |
| Chain-Crew Harness [PROPOSED] | Harnais d'équipe de chaîne |
| Every one of them turns its head toward you. The note does not change. There is nothing else they can do. [PROPOSED] | Chacun d'eux tourne la tête vers vous. La note ne change pas. Ils ne peuvent rien faire d'autre. |
| Inside the city's frame. Iron ribs, black stone, and the nine chains coming down through it all like the bones they are. Somewhere below you, one of them speaks, and then another. [PROPOSED] | À l'intérieur de la charpente de la ville. Des côtes de fer, de la pierre noire, et les neuf chaînes qui descendent à travers tout cela comme les os qu'elles sont. Quelque part sous vous, l'une d'elles parle, puis une autre. |
| Light keep you true, and keep your boots off my brake. [PROPOSED] | Que la Lumière vous garde juste, et gardez vos bottes loin de mon frein. |
| Low-pitched, loud-footed, lamp-blind son of a slack link. Speak in the Narrow, or go up and shout at the Bleach. [PROPOSED] | Voix basse, pied lourd, aveuglé de lampe, fils de maillon lâche. Parlez dans l'Étroit, ou montez crier à la Blancheur. |
| Nineteen men lost to jerking tethers, cohered into one working shape of voltage. They haul on a chain that is already made fast, and they do not stop. [PROPOSED] | Dix-neuf hommes perdus aux à-coups des longes, réunis en une seule forme de voltage au travail. Ils halent une chaîne déjà amarrée, et ne s'arrêtent pas. |
| Nineteen men, to jerking tethers. I cut each one in the housing, where I have to look at it. I do not say their names in here. The chains know them. [PROPOSED] | Dix-neuf hommes, aux à-coups des longes. J'ai taillé chacun dans le carter, là où je suis forcé de le regarder. Je ne dis pas leurs noms ici. Les chaînes les connaissent. |
| Nineteen strokes cut into the winch housing, and now one long bar cut across all of them. [PROPOSED] | Dix-neuf traits taillés dans le carter du treuil, et maintenant une longue barre taillée en travers de tous. |
| Nineteen strokes cut into the winch housing, in fours with a bar across each four. They are cut where the man at the brake has to look at them. [PROPOSED] | Dix-neuf traits taillés dans le carter du treuil, par quatre, une barre en travers de chaque quatre. Ils sont taillés là où l'homme au frein est forcé de les regarder. |
| One of the Glass-Grown: a person gone to glass, standing, face turned up through the whole of the city toward the Spire. It sounds five hundred and twenty-eight, without a breath. [PROPOSED] | L'un des Vitrifiés : une personne devenue verre, debout, le visage levé à travers toute la ville vers la Flèche. Il sonne cinq cent vingt-huit, sans un souffle. |
| One of the nine, coming down through the roof and going on through the floor. Each link is as long as a ship's boat. [PROPOSED] | L'une des neuf, qui descend à travers le toit et continue à travers le sol. Chaque maillon est long comme un canot de navire. |
| Sol-Luminary: the Anchorage [PROPOSED] | Sol-Luminary : l'Ancrage |
| The Chain-Yards [PROPOSED] | Les Chantiers des Chaînes |
| The Nineteen [PROPOSED] | Les Dix-Neuf |
| The Nineteen stop hauling. The bars go round once more by themselves, and are still. On the nearest bar hang a pair of gloves and a notched link. [PROPOSED] | Les Dix-Neuf cessent de haler. Les barres font encore un tour toutes seules, puis s'immobilisent. À la barre la plus proche pendent une paire de gants et un maillon entaillé. |
| The Sky-Dock winch: a great iron drum the height of a man, a brake-wheel on its side like a ship's wheel, and a lever as long as an oar. [PROPOSED] | Le treuil du Quai du Ciel : un grand tambour de fer haut comme un homme, une roue de frein sur le côté comme une barre de navire, et un levier long comme une rame. |
| The Winch-Deep's door [PROPOSED] | La porte du Fond du Treuil |
| The Winch-Deep. The nine bones come down into one iron ring in the keel, and beside it stands the old capstan, turning, with nobody at the bars. [PROPOSED] | Le Fond du Treuil. Les neuf os descendent dans un seul anneau de fer dans la quille, et à côté se dresse le vieux cabestan, qui tourne, sans personne aux barres. |
| The bones [PROPOSED] | Les os |
| The cage takes you down the bone to the Winch-Deep. [PROPOSED] | La cage vous descend le long de l'os jusqu'au Fond du Treuil. |
| The cage takes you up the bone to the winch-room. [PROPOSED] | La cage vous monte le long de l'os jusqu'à la salle du treuil. |
| The capstan creaks. Get clear of its reach. [PROPOSED] | Le cabestan grince. Sortez de sa portée. |
| The change [PROPOSED] | Le carillon |
| The city sways, and the bones take it one after another, never two together. Count the row. When the seventh speaks, be standing on a pin. A link under a speaking chain will throw a man, and it does not care which. [PROPOSED] | La ville oscille, et les os l'encaissent l'un après l'autre, jamais deux ensemble. Comptez la rangée. Quand le septième parle, tenez-vous sur un axe. Un maillon sous une chaîne qui parle jette un homme, et peu lui importe lequel. |
| The counterweight cage's rope, hanging slack. The cage is down, and its brake is set from below. [PROPOSED] | La corde de la cage à contrepoids, qui pend, molle. La cage est en bas, et son frein est serré d'en bas. |
| The counterweight cage, its brake set. Free the brake and ride it up [PROPOSED] | La cage à contrepoids, son frein serré. Libérer le frein et monter avec |
| The counterweight cage. Ride it down to the Winch-Deep [PROPOSED] | La cage à contrepoids. La prendre pour descendre au Fond du Treuil |
| The counterweight cage. Ride it up to the winch-room [PROPOSED] | La cage à contrepoids. La prendre pour monter à la salle du treuil |
| The deep [PROPOSED] | Le fond |
| The iron door, back out to the bell-gallery stair [PROPOSED] | La porte de fer, pour ressortir vers l'escalier de la galerie des cloches |
| The keel-weights. White stone in the dark, hanging, each on its own bone. The floor between them is iron plate over nothing. [PROPOSED] | Les poids de quille. De la pierre blanche dans le noir, suspendue, chacune à son os. Le sol entre eux est une plaque de fer au-dessus du vide. |
| The nine chains toll one after another. When the seventh speaks, be standing on a pin, not a link. [PROPOSED] | Les neuf chaînes sonnent l'une après l'autre. Quand la septième parle, tenez-vous sur un axe, pas sur un maillon. |
| The nine come down out of the sky to the rim, through the rings, and on down through the frame to the keel. The city's bones. Since the light took the rim we cannot get at them from on top, so we keep them from underneath. [PROPOSED] | Les neuf descendent du ciel jusqu'au rebord, à travers les anneaux, puis à travers la charpente jusqu'à la quille. Les os de la ville. Depuis que la lumière a pris le rebord, on ne peut plus les atteindre par le dessus, alors on les entretient par en dessous. |
| The nineteen [PROPOSED] | Les dix-neuf |
| The old capstan. Its bars go round. The chain it hauls on was made fast four hundred years ago. [PROPOSED] | Le vieux cabestan. Ses barres tournent. La chaîne qu'il hale a été amarrée il y a quatre cents ans. |
| The seventh speaks, and the link under you jumps. It throws you down the chain. [PROPOSED] | Le septième parle, et le maillon sous vous saute. Il vous jette le long de la chaîne. |
| The seventh speaks. You are on a pin, and it only shakes you. [PROPOSED] | Le septième parle. Vous êtes sur un axe, et il ne fait que vous secouer. |
| The seventh's goods-cage. I pinned it up top myself, after the nineteenth, and may whoever knocks that pin out come back as a link on the wet side. [PROPOSED] | La cage à marchandises de la septième. Je l'ai goupillée là-haut moi-même, après le dix-neuvième, et que celui qui fera sauter cette goupille revienne en maillon du côté mouillé. |
| The spare lever of an old winch: black iron, as long as an oar, with a square socket at one end. It was made to stop a city moving. [PROPOSED] | Le levier de rechange d'un vieux treuil : du fer noir, long comme une rame, une douille carrée à un bout. Il a été fait pour empêcher une ville de bouger. |
| The third bone's landing [PROPOSED] | Le palier du troisième os |
| The third bone's landing: a shelf of iron plate round the chain, and a lamp. [PROPOSED] | Le palier du troisième os : une tablette de plaque de fer autour de la chaîne, et une lampe. |
| The tolling gallery. All nine bones come down through this one floor, and each speaks in its turn: nine notes, never two together. [PROPOSED] | La galerie du carillon. Les neuf os descendent tous à travers ce seul plancher, et chacun parle à son tour : neuf notes, jamais deux ensemble. |
| The winch-room [PROPOSED] | La salle du treuil |
| They haul. For a few seconds you weigh what four of you weigh. [PROPOSED] | Ils halent. Pendant quelques secondes, vous pesez ce que pèsent quatre comme vous. |
| They stand in the dark between the ribs, seven of them, facing up. Each one sounds the same high note. None of them has moved in a long time, and all of them are awake. [PROPOSED] | Ils se tiennent dans le noir entre les côtes, sept, le visage levé. Chacun sonne la même note haute. Aucun n'a bougé depuis longtemps, et tous sont éveillés. |
| Whose are you? Never mind. Touch nothing that has a handle. [PROPOSED] | À qui êtes-vous ? Peu importe. Ne touchez à rien qui ait une poignée. |
| Winchman's Cap [PROPOSED] | Calotte de treuilliste |
| Winchmaster Bardo (Vol II) | Bardo, maître treuilliste |
| You knock the brake off. A keel-weight goes down past you in the dark, and the cage goes up the bone like a bucket up a well, to the winch-room. It will ride both ways now. [PROPOSED] | Vous faites sauter le frein. Un poids de quille descend devant vous dans le noir, et la cage remonte le long de l'os comme un seau dans un puits, jusqu'à la salle du treuil. Elle fera désormais le trajet dans les deux sens. |
| a tether jerk weighs on you half as long [PROPOSED] | l'à-coup d'une longe vous pèse moitié moins longtemps |
| the chain's well [PROPOSED] | le puits de la chaîne |
| A harness, if you mean to go down the bone. Clip on at the pins. [PROPOSED] | Un harnais, si vous comptez descendre l'os. Accrochez-vous aux axes. |
| Then you go down unclipped, like a fool, like I did at your age. [PROPOSED] | Alors vous descendez sans attache, comme un imbécile, comme moi à votre âge. |
| Count the row. [PROPOSED] | Comptez la rangée. |
| Mind the seventh. [PROPOSED] | Gare au septième. |
