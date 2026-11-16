# Phase 92: the Dawning Heights, part one: the Umbral Tiers (text for review)

*Written 15 Nov 2026, under the owner's approval of Phase 89 and Phase 90 (14 Nov) and his answers to Phase 91 (15 Nov). Code: `js/heights92.js`. Every line below is new and [PROPOSED] unless the books say it; the French is in `tools/i18n/p92-heights.tsv`.*

## What was built

- **The way there.** The Kestrel's map table offers "Fly south to Sol-Luminary" once the hop is allowed (the new number-three tank, and Book One done: Phase 89's ruling). Thirty hours [PROPOSED]; she moors broadside at the Keel Docks, and her ladder takes you aboard again; the table flies her home to either mooring (thirty hours) [PROPOSED].
- **The Umbral Tiers** (Phase 90's "city's heart"): one map, 160 by 226 cells, a cell a step and a half, cut from the Cymatic City Engine's own 528 Hz plan of Sol-Luminary by `tools/maps/tiers92.py`. North is up the mountain's face; the walkways climb about thirteen units from the docks to the black wall. The figure's streets and rings are the walkways, its bold nodal lines the chain-walks, its buildings the hanging houses (black windows, each with a scratched sign: a bird, a sun, a name), and everything else is the gulf, with nothing under it for two thousand feet. The ceiling is the city above: dark.
- **The rooms,** as Phase 90 drew them: the Keel Docks (the way in; winch-boats hung over the gulf); the dock lamp; the first ladders (north-east); the chain-walks (the hazard, west across the face); the cobbler's, fourth tier (a lamp); the black market (black canvas; the only mirror, under a cloth); the hanging square (the keeper; slung on four chains, its edges open); the bell-gallery stair (a lamp, under the black wall); the iron door (seen, not entered); the seventh chain's goods-cage (the shortcut).
- **The dangers.** The Bleach: fixed patches below the line, near the wall, that eat at you while you stand in them (and twice as fast in the Lamplighter's glass-fire). The chain-walks jerk every thirteen seconds, with a creak first: walk on through it and it throws you sideways; stand still and you hold on. Off the chain-walks' sides, and off the hanging square's edges, is the drop; anywhere else the gulf is fenced by the walkways' own edges. Fall and you die, and your Piece is left at the last place you stood.
- **The Souls rules from the start:** three shade-lamps (a lantern under a black tin hood on an iron post). Resting brings back the bleach-hounds, hounds and swarms; the Lamplighter only after a week. Die in the Tiers and you wake by the last of its lamps you lit. A Piece in the Heights rings at 528 Hz (the owner's answer to Phase 91's question 1).
- **The keeper,** the Lamplighter of the Seventh Chain (Phase 89 [PROPOSED]): a Flambeau in a white robe gone grey with soot, a lantern of amber glass on a pole. When he hunts you he splashes glass-fire where you stand, every five and a half seconds. Put down, he leaves his hood (head) and a lump of amber glass (a valuable), once (Phase 90 rule 5).
- **The people** (the Umbral folk [PROPOSED]), in the Narrow: Mother Ysolde Carrow, harbour-master; Anselm Dray, cobbler of the fourth tier (sells chain-walk boots); the woman under the black canvas (sells the shade-cloak, the scavenger's cloth-pole and the mirror); Joss Feveril of the seventh chain (tells you about the goods-cage); and six more of the Umbral folk on the walkways.
- **The gear,** a fifteenth set, the Umbral Tiers: the Lamplighter's Hood, Chain-Walk Boots, the Umbral Shade-Cloak and the Scavenger's Cloth-Pole, each with its own look and picture. Three pieces: quieter on the planks. All four: the Bleach eats at you half as fast.
- **What walks there:** five bleach-hounds near the line (Phase 89 [PROPOSED]: Dissonance Hounds bleached white; the hound's own picture, whitened), three hounds lower down, three swarms on the chain-walks.

## For the owner

*Answered 15 Nov 2026: "1 yes the 30 hour works. the new names are good. 3 is good." So the thirty-hour flight and its tank stand, Ysolde Carrow, Anselm Dray and Joss Feveril keep their names, and the Tiers' customs stay with who speaks them. Question 4 (the cloth-pole) had no separate answer and stands as recommended.*

1. The flight is thirty hours each way, and needs the number-three tank, like the hop. *Recommend: keep; the far countries should feel far.*
2. The Umbral folk's names (Ysolde Carrow, Anselm Dray, Joss Feveril) and the woman under the canvas left unnamed. *Recommend: keep.*
3. "Casts" turned to praise in the Tiers (Phase 89 [PROPOSED], approved) is spoken by the cobbler; "shade-right" by the harbour-master; the black window by the woman under the canvas. *No ruling needed unless you want it changed.*
4. The Scavenger's Cloth-Pole is a weapon now; in the White Mile (a later phase) it will also show where the light is too strong, as Phase 89 planned. *Recommend: keep.*

## Owed to the owner later

- Phase 91's question 4 (a trophy and realm gear for the Reach's two keepers): to be raised again when the Heights' four keepers are all built ("remind me of 4 later when it is time", 15 Nov). One of the four, the Lamplighter, is built now.

## Matched to Book Two ch. 9 (15 Nov, after the rulings)

Reading the book for the flying-combat plan turned up four things the first build had wrong. All four now follow Book Two, Part Two, ch. 9:

1. **The Keel Docks are eleven iron cradles** hung on chains below the lowest tier, over two thousand feet of air. The first build had a plank dock with four winch-boats. The Kestrel now lies in the fourth cradle from the end. A Church packet (the white sun-disc on its envelope) and two battered freighters lie in three of the others; their pictures are the Kestrel's own picture, recoloured. The winch-boats moved to the docks' two ends.
2. **The harbourmaster comes down veiled:** a black hat and veil, black gloves, and a black lantern shuttered to a slit. Two pole-men with iron hooks stand in her shadow. Her greeting is now "Name. Cargo." The book has her say exactly that, and the first build had an invented line.
3. **Her custom (canon):** she takes any mirror into a black velvet bag the first time you come near her with one, and gives it back when you climb the Kestrel's ladder ("returned when you leave the chains"). Her new topic, "Glass", is her line from the book, word for word. Flag `p92_bag` (0 or 1).
4. **Brenna Corliss** (canon) keeps her chandlery in a hanging house on the second tier, under a sign that says ROPE, painted black on black. Her lamp is turned down to a slit. The right half of her face is white. She sells black cloth by the bolt (`p92_blackcloth`, 4 sovereigns), bandages and tonic. Her three topics are the morning it let go (the book's words), black cloth, and the Free Captains (Oona Salt's letter, from the book).

Brenna's other greetings and shop lines, and the cloth's description, are [PROPOSED]. Test: three new checks in `test/heights92.test.js` (23 in all). Pictures: `screenshots/p92/p92-cradles.jpg`, `p92-veil.jpg`, `p92-brenna.jpg`.

| English | French |
|---|---|
| An iron cradle, hung on chains below the lowest tier over two thousand feet of air, big enough to take a skyship's gondola. It swings. | Un berceau de fer, pendu à des chaînes sous le dernier étage, au-dessus de deux mille pieds de vide, assez grand pour recevoir la nacelle d'un navire du ciel. Il se balance. |
| A Church packet in its cradle, with the white sun-disc on its envelope. Nobody on the docks looks at it. | Un paquebot de l'Église dans son berceau, le disque solaire blanc sur son enveloppe. Personne sur les quais ne le regarde. |
| A battered freighter in its cradle, its envelope patched as often as the Kestrel's. | Un cargo cabossé dans son berceau, son enveloppe rapiécée aussi souvent que celle du Kestrel. |
| A sign over the door: ROPE, painted black on black, so you have to know it is there to read it. | Une enseigne au-dessus de la porte : CORDE, peinte noir sur noir, si bien qu'il faut savoir qu'elle est là pour la lire. |
| The harbourmaster holds out a gloved hand. "Glass." She takes your mirror into a black velvet bag without looking at it. "A reflection is a second light. The Light is jealous. It will be returned when you leave the chains." | La capitaine du port tend une main gantée. « Le verre. » Elle prend votre miroir dans un sac de velours noir sans le regarder. « Un reflet est une seconde lumière. La Lumière est jalouse. On vous le rendra quand vous quitterez les chaînes. » |
| At the foot of the ladder the harbourmaster gives back your mirror out of the black velvet bag, still without looking at it. | Au pied de l'échelle, la capitaine du port vous rend votre miroir, tiré du sac de velours noir, toujours sans le regarder. |
| A Bolt of Black Cloth | Un rouleau de drap noir |
| Black cloth, sold by the bolt in the Umbral Tiers. You wind it round your head and face until only your eyes show, and round your hands, and go up toward the light. | Du drap noir, vendu au rouleau dans les Étages Ombraux. On s'en enroule la tête et le visage jusqu'à ne laisser voir que les yeux, et les mains, et l'on monte vers la lumière. |
| Brenna Corliss, the Free Captains' woman in the Keel Docks | Brenna Corliss, la femme des Capitaines libres aux Quais de Quille |
| Name. Cargo. Quietly: we speak in the Narrow here. | Nom. Cargaison. Doucement : ici, on parle dans l'Étroit. |
| Glass | Le verre |
| Your mirrors. Your sextant. Your shaving-glasses, your hand-mirrors, any lens that shows a face. A reflection is a second light. The Light is jealous. They'll be returned when you leave the chains. | Vos miroirs. Votre sextant. Vos miroirs à raser, vos miroirs à main, toute lentille qui montre un visage. Un reflet est une seconde lumière. La Lumière est jalouse. On vous les rendra quand vous quitterez les chaînes. |
| Come in under the lamp. Not that side. This side. | Entrez sous la lampe. Pas de ce côté. De ce côté-ci. |
| Rope, cloth, tar. What do you need? | Corde, drap, goudron. Qu'est-ce qu'il vous faut ? |
| Quieter. The whole tier can hear a Coast voice. | Plus bas. Tout l'étage entend une voix de la Côte. |
| The morning | Le matin |
| I was on the fourth tier, at a window, on the morning it let go. Facing south. I turned my head. Most people didn't have time to turn their heads. | J'étais au quatrième étage, à une fenêtre, le matin où ça a lâché. Tournée vers le sud. J'ai tourné la tête. La plupart des gens n'ont pas eu le temps de tourner la tête. |
| Black cloth | Le drap noir |
| The Tiers sell it by the bolt. Wind it round your face till only your eyes show, and your hands, before you go anywhere near the line. | Les Étages le vendent au rouleau. Enroulez-le autour du visage jusqu'à ne laisser voir que les yeux, et des mains, avant d'approcher de la ligne. |
| The Free Captains | Les Capitaines libres |
| I keep the Free Captains' business in the Keel Docks. A letter from Oona Salt gets you through my door. Without one, you are buying rope. | Je tiens les affaires des Capitaines libres aux Quais de Quille. Une lettre d'Oona Salt vous fait passer ma porte. Sans elle, vous achetez de la corde. |
| Rope, cloth, tar, and what the Free Captains leave with me. | Corde, drap, goudron, et ce que les Capitaines libres me laissent. |
| Then you are not buying rope today. | Alors vous n'achetez pas de corde aujourd'hui. |
| Wind it tight. | Serrez bien. |
| Keep the right side of your face to the dark. | Gardez le côté droit du visage tourné vers l'ombre. |

## The new lines

| English | French |
|---|---|
| Sol-Luminary: the Umbral Tiers [PROPOSED] | Sol-Luminary : les Étages Ombraux |
| Fly south to Sol-Luminary, in the Dawning Heights. [PROPOSED] | Voler vers le sud jusqu'à Sol-Luminary, dans les Hauteurs de l'Aube. |
| Thirty hours south, the peaks come up pale as teeth, and above them, hanging from the mountain's face on nine chains, Sol-Luminary. Pennick brings her in under the city to the Keel Docks, where the winch-boats come up through the cloud. [PROPOSED] | Trente heures plus au sud, les pics surgissent, pâles comme des dents, et au-dessus d'eux, suspendue au flanc de la montagne par neuf chaînes, Sol-Luminary. Pennick l'amène sous la ville jusqu'aux Quais de Quille, où les bateaux-treuils remontent à travers les nuages. |
| You climb down onto the Keel Docks. The planks move under you. The whole city moves. Nobody here speaks above the Narrow. [PROPOSED] | Vous descendez sur les Quais de Quille. Les planches bougent sous vos pieds. Toute la ville bouge. Ici, personne ne parle plus haut que l'Étroit. |
| the Keel Docks, under Sol-Luminary [PROPOSED] | les Quais de Quille, sous Sol-Luminary |
| The Kestrel's ladder, hanging at the dock. Climb aboard [PROPOSED] | L'échelle de la Crécerelle, pendue au quai. Monter à bord |
| The Keel Docks. The winch-boats come up through the cloud deck here, and the ladders go up from here into the city. [PROPOSED] | Les Quais de Quille. Les bateaux-treuils remontent ici à travers la couche de nuages, et c'est d'ici que les échelles montent dans la ville. |
| A winch-boat, hung on its rope over the gulf. The cloud is a long way down. [PROPOSED] | Un bateau-treuil, pendu à sa corde au-dessus du gouffre. Les nuages sont très loin en dessous. |
| Iron rungs in black stone, going up through the hanging houses: in by one window, out by another. [PROPOSED] | Des barreaux de fer dans la pierre noire, qui montent à travers les maisons suspendues : on entre par une fenêtre, on sort par une autre. |
| A hanging house. Its windows are painted black on the inside, and somebody has scratched a small sign in the paint, so the house can be told at dusk. [PROPOSED] | Une maison suspendue. Ses fenêtres sont peintes en noir à l'intérieur, et quelqu'un a gratté un petit signe dans la peinture, pour qu'on reconnaisse la maison au crépuscule. |
| A chain-walk's stanchion. The chain under it hums. [PROPOSED] | Un montant de passerelle à chaînes. La chaîne en dessous bourdonne. |
| The chain-walks: planks slung on chains over two thousand feet of air. When the chains jerk, hold still. [PROPOSED] | Les passerelles à chaînes : des planches suspendues à des chaînes au-dessus de six cents mètres de vide. Quand les chaînes tressautent, ne bougez plus. |
| One of the four chains the square hangs from. It goes up into the dark. [PROPOSED] | L'une des quatre chaînes auxquelles pend la place. Elle monte dans le noir. |
| A stall under black canvas. [PROPOSED] | Un étal sous une toile noire. |
| Something flat and square under a black cloth. Nobody looks at it. [PROPOSED] | Quelque chose de plat et de carré sous un tissu noir. Personne ne le regarde. |
| A cobbler's bench, and boots for the chain-walks, soled with tarred rope. [PROPOSED] | Un établi de cordonnier, et des bottes pour les passerelles, semelées de corde goudronnée. |
| The Basilica's black wall. It runs along the line: above it, the Bleach; below it, the Tiers. [PROPOSED] | Le mur noir de la Basilique. Il court le long de la ligne : au-dessus, la Blancheur ; en dessous, les Étages. |
| The iron door: man-high, studded, in the middle of the black wall. The line. It does not open, and nobody here would open it. [PROPOSED] | La porte de fer : haute comme un homme, cloutée, au milieu du mur noir. La ligne. Elle ne s'ouvre pas, et personne ici ne l'ouvrirait. |
| The iron door in the black wall [PROPOSED] | La porte de fer dans le mur noir |
| The bell-gallery stair, under the black wall. The Basilica's bell is somewhere above, on the other side of the line. [PROPOSED] | L'escalier de la galerie des cloches, sous le mur noir. La cloche de la Basilique est quelque part au-dessus, de l'autre côté de la ligne. |
| A shade-lamp: a lantern under a black hood, so it lights the planks and nothing else. [PROPOSED] | Une lampe d'ombre : une lanterne sous une capuche noire, qui n'éclaire que les planches. |
| A patch of the Bleach, below the line: the light has got in here, and the planks are white as bone. [PROPOSED] | Une tache de Blancheur, sous la ligne : la lumière est entrée ici, et les planches sont blanches comme l'os. |
| A shade-lamp on an iron post, unlit: a hood of black tin over the glass. Stand by it to light it. [PROPOSED] | Une lampe d'ombre sur un poteau de fer, éteinte : une capuche de fer-blanc noir sur le verre. Tenez-vous près d'elle pour l'allumer. |
| A shade-lamp on an iron post, burning under its black hood. Use it to rest. [PROPOSED] | Une lampe d'ombre sur un poteau de fer, qui brûle sous sa capuche noire. Utilisez-la pour vous reposer. |
| The dock lamp [PROPOSED] | La lampe du quai |
| The cobbler's, fourth tier [PROPOSED] | Chez le cordonnier, quatrième étage |
| The bell-gallery stair [PROPOSED] | L'escalier de la galerie des cloches |
| The seventh chain's goods-cage, pinned at the top. Knock the pin out [PROPOSED] | La cage à marchandises de la septième chaîne, goupillée en haut. Faire sauter la goupille |
| The seventh chain's goods-cage. Ride it down to the Keel Docks [PROPOSED] | La cage à marchandises de la septième chaîne. La prendre pour descendre aux Quais de Quille |
| A goods-cage, winched up out of reach. Its chain goes up into the dark, toward the seventh anchor-house. [PROPOSED] | Une cage à marchandises, hissée hors de portée. Sa chaîne monte dans le noir, vers la septième maison d'ancrage. |
| The seventh chain's goods-cage. Ride it up to the bell-gallery stair [PROPOSED] | La cage à marchandises de la septième chaîne. La prendre pour monter à l'escalier de la galerie des cloches |
| You knock the pin out. The cage drops, and you drop with it, the chain screaming through its sheave, down past every tier you climbed, and it stops a foot above the Keel Docks with a jerk that nearly throws you out. It will ride both ways now. [PROPOSED] | Vous faites sauter la goupille. La cage tombe, et vous tombez avec elle, la chaîne hurlant dans sa poulie, en passant devant chaque étage que vous avez gravi, et elle s'arrête à un pied au-dessus des Quais de Quille avec une secousse qui manque de vous éjecter. Elle fera désormais le trajet dans les deux sens. |
| The cage takes you down the seventh chain to the Keel Docks. [PROPOSED] | La cage vous descend le long de la septième chaîne jusqu'aux Quais de Quille. |
| The cage takes you up the seventh chain to the bell-gallery stair. [PROPOSED] | La cage vous monte le long de la septième chaîne jusqu'à l'escalier de la galerie des cloches. |
| The light is on you, and it eats. Get back into the shade. [PROPOSED] | La lumière est sur vous, et elle ronge. Retournez dans l'ombre. |
| The chains creak, all at once. Hold still. [PROPOSED] | Les chaînes grincent, toutes à la fois. Ne bougez plus. |
| The chain-walk jerks under you and throws you sideways. [PROPOSED] | La passerelle tressaute sous vous et vous projette de côté. |
| The chain-walk jerks. You hold still, and it does not throw you. [PROPOSED] | La passerelle tressaute. Vous ne bougez pas, et elle ne vous projette pas. |
| the gulf [PROPOSED] | le gouffre |
| He swings his lantern, and white fire splashes where you stood. The light comes in after it. [PROPOSED] | Il balance sa lanterne, et un feu blanc éclabousse l'endroit où vous vous teniez. La lumière entre à sa suite. |
| The Lamplighter of the Seventh Chain [PROPOSED] | L'Allumeur de la Septième Chaîne |
| A Flambeau who stayed below the line when his chapter went up, and has been correcting the Tiers for seven years. He carries glass-fire into the dark, and where it burns, the Bleach follows. [PROPOSED] | Un Flambeau resté sous la ligne quand son chapitre est monté, et qui corrige les Étages depuis sept ans. Il porte le feu de verre dans le noir, et là où il brûle, la Blancheur suit. |
| The Lamplighter goes down on the hanging square, and his lantern goes out. The dark comes back in over the planks like water. [PROPOSED] | L'Allumeur s'effondre sur la place suspendue, et sa lanterne s'éteint. Le noir revient sur les planches comme de l'eau. |
| Bleach-Hound [PROPOSED] | Molosse blanchi |
| A Dissonance Hound whose wrong notes have been bleached white. It hunts the edge of the light. [PROPOSED] | Un Molosse de Dissonance dont les fausses notes ont été blanchies. Il chasse au bord de la lumière. |
| Lamplighter's Hood [PROPOSED] | Capuche de l'Allumeur |
| A Flambeau's white hood, blacked with seven years of soot from the inside out. It still smells of amber glass burning. [PROPOSED] | La capuche blanche d'un Flambeau, noircie de l'intérieur par sept ans de suie. Elle sent encore le verre d'ambre qui brûle. |
| Lump of Amber Glass [PROPOSED] | Morceau de verre d'ambre |
| Amber glass from the Lamplighter's lantern: glass-fire's food. The Church pays for it, and asks where you got it. [PROPOSED] | Du verre d'ambre tiré de la lanterne de l'Allumeur : la nourriture du feu de verre. L'Église le paie, et demande où vous l'avez trouvé. |
| Chain-Walk Boots [PROPOSED] | Bottes de passerelle |
| Soft black boots soled with tarred rope, for planks that move. The cobbler of the fourth tier makes them; you hear nothing when you walk in them. [PROPOSED] | Des bottes noires et souples, semelées de corde goudronnée, pour les planches qui bougent. Le cordonnier du quatrième étage les fabrique ; on n'entend rien quand on marche avec. |
| Umbral Shade-Cloak [PROPOSED] | Cape d'ombre ombrale |
| A long black cloak cut wide, to lend its shade to whoever walks behind you. A small sun is scratched into the lining, for the house it came from. [PROPOSED] | Une longue cape noire taillée large, pour prêter son ombre à qui marche derrière vous. Un petit soleil est gratté dans la doublure, pour la maison d'où elle vient. |
| A Mirror, under a Cloth [PROPOSED] | Un miroir, sous un tissu |
| A hand-mirror wrapped in black cloth and tied. Mirrors are illegal in the Tiers. You have not looked in it. [PROPOSED] | Un miroir à main enveloppé de tissu noir et noué. Les miroirs sont illégaux dans les Étages. Vous n'y avez pas regardé. |
| Mother Ysolde Carrow, harbour-master [PROPOSED] | Mère Ysolde Carrow, capitaine du port |
| Anselm Dray, cobbler of the fourth tier [PROPOSED] | Anselm Dray, cordonnier du quatrième étage |
| The woman under the black canvas [PROPOSED] | La femme sous la toile noire |
| Joss Feveril, of the seventh chain [PROPOSED] | Joss Feveril, de la septième chaîne |
| One of the Umbral folk [PROPOSED] | Quelqu'un du peuple ombral |
| Light keep you true, stranger. Quietly, now: we speak in the Narrow here. [PROPOSED] | Que la Lumière vous garde juste, étranger. Doucement : ici, on parle dans l'Étroit. |
| You came up on that airship. Keep your voice down and your feet in the shade. [PROPOSED] | Vous êtes monté avec ce dirigeable. Gardez la voix basse et les pieds dans l'ombre. |
| Speak like that again and the whole dock will look at you. Nobody here looks at anybody. [PROPOSED] | Parlez encore comme ça et tout le quai vous regardera. Ici, personne ne regarde personne. |
| The Keel Docks [PROPOSED] | Les Quais de Quille |
| The winch-boats come up through the cloud from the valley farms. The ladders go up from here. Everything the city eats comes past me, and I count it. [PROPOSED] | Les bateaux-treuils remontent à travers les nuages depuis les fermes de la vallée. Les échelles partent d'ici. Tout ce que mange la ville passe devant moi, et je le compte. |
| The line [PROPOSED] | La ligne |
| Up the face, where the black wall is. Above it, the Bleach. Below it, us. Seven years we have lived on the undersides, and we are good at it. [PROPOSED] | En haut de la paroi, là où est le mur noir. Au-dessus, la Blancheur. En dessous, nous. Sept ans que nous vivons sous la ville, et nous y sommes doués. |
| Shade-right [PROPOSED] | Le droit d'ombre |
| The one ahead owns their shadow and lends it. Step out of somebody's shade without a word and you have insulted them. Give your shade to a stranger and you have done the finest thing you can do here. [PROPOSED] | Celui qui marche devant possède son ombre et la prête. Sortez de l'ombre de quelqu'un sans un mot et vous l'avez insulté. Donnez votre ombre à un étranger et vous avez fait la plus belle chose qu'on puisse faire ici. |
| The lamp [PROPOSED] | La lampe |
| The shade-lamp at my door. Sit by it when you come back down, and you will be whole again. Everybody comes back down. [PROPOSED] | La lampe d'ombre à ma porte. Asseyez-vous près d'elle quand vous redescendrez, et vous serez de nouveau entier. Tout le monde redescend. |
| Light keep you true. Sit, if you want boots. Rope soles. The planks move. [PROPOSED] | Que la Lumière vous garde juste. Asseyez-vous, si vous voulez des bottes. Semelles de corde. Les planches bougent. |
| Boots? You walk like somebody from flat country. [PROPOSED] | Des bottes ? Vous marchez comme quelqu'un du plat pays. |
| Mind your feet in my shop and mind your voice on my tier. [PROPOSED] | Surveillez vos pieds dans ma boutique et votre voix sur mon étage. |
| The chain-walks [PROPOSED] | Les passerelles à chaînes |
| When the chains jerk, stand still. The ones who keep walking go over. I mend boots for the ones who stand still. [PROPOSED] | Quand les chaînes tressautent, ne bougez plus. Ceux qui continuent de marcher passent par-dessus bord. Je répare les bottes de ceux qui restent immobiles. |
| The Lamplighter [PROPOSED] | L'Allumeur |
| He was a Flambeau. When his chapter went up the Pilgrim Chain he stayed below. Now he walks the Tiers with glass-fire, correcting us, he says. Where he burns, the light comes down after. [PROPOSED] | C'était un Flambeau. Quand son chapitre est monté par la Chaîne des Pèlerins, il est resté en bas. Maintenant il arpente les Étages avec le feu de verre, pour nous corriger, dit-il. Là où il brûle, la lumière descend ensuite. |
| Casts [PROPOSED] | Porter ombre |
| Up there it was an insult: "he casts", a thing with a shadow, provincial. Down here it is the best thing you can say of a person. Somebody who casts is somebody you can stand behind. [PROPOSED] | Là-haut, c'était une insulte : « il porte ombre », une chose qui a une ombre, provinciale. Ici, c'est ce qu'on peut dire de mieux de quelqu'un. Quelqu'un qui porte ombre, c'est quelqu'un derrière qui on peut se tenir. |
| Under the canvas, quick. What do you need that you cannot buy in the light? [PROPOSED] | Sous la toile, vite. De quoi avez-vous besoin que vous ne pouvez pas acheter à la lumière ? |
| Looking, or buying? [PROPOSED] | Vous regardez, ou vous achetez ? |
| Loud. Go and be loud somewhere else. [PROPOSED] | Bruyant. Allez faire du bruit ailleurs. |
| The mirror [PROPOSED] | Le miroir |
| The only one in the Tiers, and it stays under the cloth. Mirrors are illegal. Mirrors are what the Bleach shines from, up on the Walks. You want it, you buy it covered, and you never take the cloth off down here. [PROPOSED] | Le seul des Étages, et il reste sous le tissu. Les miroirs sont illégaux. C'est des miroirs que brille la Blancheur, là-haut sur les Promenades. Vous le voulez, vous l'achetez couvert, et vous n'enlevez jamais le tissu ici. |
| The black window [PROPOSED] | La fenêtre noire |
| Every window painted black on the inside, and every family scratches one sign in the paint. A bird, a name, a sun. At dusk the scratch-light tells you whose house it is. [PROPOSED] | Chaque fenêtre est peinte en noir à l'intérieur, et chaque famille gratte un signe dans la peinture. Un oiseau, un nom, un soleil. Au crépuscule, la lumière des grattures vous dit à qui est la maison. |
| Light keep you true. Seventh chain. Mind the walk. [PROPOSED] | Que la Lumière vous garde juste. Septième chaîne. Attention à la passerelle. |
| Crew. Seventh chain. [PROPOSED] | Équipe. Septième chaîne. |
| Talk like that on a chain-walk and the chain will answer you. [PROPOSED] | Parlez comme ça sur une passerelle et la chaîne vous répondra. |
| Counting the chains [PROPOSED] | Compter les chaînes |
| Children learn the nine links by name before they learn their letters. The chain you are on decides which way you run when one jerks. [PROPOSED] | Les enfants apprennent le nom des neuf maillons avant leurs lettres. La chaîne sur laquelle vous êtes décide de quel côté vous courez quand l'une tressaute. |
| The notched link [PROPOSED] | Le maillon entaillé |
| Every crewman wears one. A notch for every man you lost. One in nine of us, Bardo says. He keeps a tally of nineteen in his winch housing. [PROPOSED] | Chaque homme d'équipe en porte un. Une entaille pour chaque homme perdu. Un sur neuf d'entre nous, dit Bardo. Il garde un décompte de dix-neuf dans le carter de son treuil. |
| The goods-cage [PROPOSED] | La cage à marchandises |
| The seventh chain's cage runs from the anchor-house down past the bell-gallery to the docks. Somebody pinned it up top, years back. Knock the pin out from up there and it comes down. [PROPOSED] | La cage de la septième chaîne descend de la maison d'ancrage, passe devant la galerie des cloches et va jusqu'aux quais. Quelqu'un l'a goupillée là-haut, il y a des années. Faites sauter la goupille d'en haut et elle descend. |
| Light keep you true. [PROPOSED] | Que la Lumière vous garde juste. |
| Shh. [PROPOSED] | Chut. |
| Quiet. Please. [PROPOSED] | Silence. S'il vous plaît. |
| The Bleach [PROPOSED] | La Blancheur |
| We do not go above the line. Some go up for what the noble houses left, with a black cloth on a pole. Not all come down. [PROPOSED] | Nous n'allons pas au-dessus de la ligne. Certains montent chercher ce qu'ont laissé les maisons nobles, avec un tissu noir au bout d'une perche. Tous ne redescendent pas. |
| Rope soles, black uppers, no nails. You will not hear yourself. [PROPOSED] | Semelles de corde, tiges noires, pas de clous. Vous ne vous entendrez pas marcher. |
| Come back when you have the coin. The boots will keep. [PROPOSED] | Revenez quand vous aurez l'argent. Les bottes attendront. |
| Stand still when the chains jerk. [PROPOSED] | Ne bougez plus quand les chaînes tressautent. |
| Mind the walk. [PROPOSED] | Attention à la passerelle. |
| Quick, under the canvas. Everything here is something the Church does not like. [PROPOSED] | Vite, sous la toile. Tout ce qui est ici, l'Église ne l'aime pas. |
| Then you are only looking. Look somewhere else. [PROPOSED] | Alors vous ne faites que regarder. Regardez ailleurs. |
| Never take the cloth off down here. [PROPOSED] | N'enlevez jamais le tissu ici. |
| You did not buy it from me. [PROPOSED] | Ce n'est pas à moi que vous l'avez acheté. |
| Scavenger's Cloth-Pole [PROPOSED] | Perche à tissu de récupérateur |
| An ash pole with a crossbar at its head and a black cloth hung from it. The scavengers carry them up into the Bleach: where the cloth vanishes, the light is too strong to go in. It also keeps a hound at a pole's length. [PROPOSED] | Une perche de frêne avec une traverse à son sommet et un tissu noir qui y pend. Les récupérateurs l'emportent dans la Blancheur : là où le tissu disparaît, la lumière est trop forte pour y entrer. Elle tient aussi un molosse à une perche de distance. |
| The Umbral Tiers [PROPOSED] | Les Étages Ombraux |
| quieter on the planks [PROPOSED] | plus silencieux sur les planches |
| the Bleach eats at you half as fast [PROPOSED] | la Blancheur vous ronge deux fois moins vite |
