# Phase 85: New In-Game Text (for review)

The big places between, from the world plan the owner approved on 13 Nov ("approve all"). Built one place at a time: the Dry Flume, the Antler Galleries, the Sunk Lanes with Cross Pool, and the Deep Grove. Gear: two pieces in each of the first two; on the owner's word (14 Nov, "lets stick with 4 new pieces of gear") two each in the last two.

## 1. The Dry Flume (14 Nov)

Code: `js/dryflume85.js`. Test: `test/dryflume85.test.js` (19 checks). French: `tools/i18n/p85-dryflume.tsv`.

The place, its rooms, its keeper, its gear and every line below are **[PROPOSED]** under the approved plan ("before the Flume was grown, it was built"; question 7 approved with the older stone conduit).

### What was built

- **The way in:** an arch of dressed stone set in a grassed bank on the Stride's valley floor, under the Flume's line and clear of the road and the brook. A wheel is cut on the keystone.
- **Seven rooms, walked in order.** The **adit** (worn steps, an iron rail in lead). The **conduit** (a brick-lined stone channel, bone dry, the living Flume's root hanging through the roof and lit green from inside; hush-moths come to it). The **settling tanks** (three, stepped, wet silt, two fret-crawlers lying flat in it). The **wheel-pit** (an iron wheel twice a man's height, stopped in a flooded pit; a ledge round it; a lesser strongbox on the west ledge). The **sump** (black water and a causeway through it). The **pump-hall** (iron columns, iron galleries, the engine's beam stopped at the top of a stroke, the root's great fall lighting it). The **stair up** to the grating under the Pound Stair's bottom pound.
- **No lamps.** The root is the only light. The roof is higher here than in other dungeons, so the wheel and the beam have room.
- **Traps of the place.** A **sluice-gate** hangs over the pit's ledge on a worn chain. Walk under it and it comes down (8 damage, and a great deal of noise). Use it first and you wedge it with old oak.
- **The wonder: the sump floods.** About every forty-nine seconds (more often in rain) the Flume above "draws a breath". The sump climbs for five seconds, then fills from the floor to the roof for about fourteen, then drains. The causeway goes under. Anyone on it is thrown onto the nearer steps (6 damage). You wait on the steps and cross between surges.
- **The keeper: the Standing Note.** A mire-drone grown two hundred years in the dark, the size of a cart, under the beam. Its one note is the note the engine made when it ran. It has 150 health and hits for 7 to 14. Two hush-moths hang about the root-light near it.
- **The gear,** on the engine-man's bench behind it: the **Lengthsman's Hook** (an iron boat-hook on an ash pole, reach 2.3 against a sword's 1.4; what it hits it pulls towards you) and **Sluice-Boots** (armour 2, quieter than bare feet, and silent in water: in shallows or water they take a further 0.6 off your noise). A strongbox of the best kind beside them. That makes 44 strongboxes in the game.
- **The back door.** The grating in the Pound Stair's bottom pound (Phase 83) is bolted from below. At the top of the stair, use the bolts to slide them back. After that, when the pound stands empty after a surge, you can climb out through the grating, and the grating takes you back down from above. When water stands on it, it will not lift.

### Fixed on the way

- **The Howe's Bearer's Gloves could never be worn.** They had no armour entry, so nothing could put them on. They have one now.
- **Standing near a mire-drone in the 3D view** laid a pale box over the middle of the picture. The "despair" rim copied the old flat picture, which the 3D view no longer draws to. Under the 3D view the rim is now only the dark vignette.

### Readings for the owner

1. **The keeper is a mire-drone grown large.** It is not a new creature. That fits "mire-drones in the sump" and the Reach's law that growth never stops. *Recommend: keep.*
2. **The surge comes on a steady beat** while you are in the Dry Flume, faster in rain. It is not tied to the surges on the Pound Stair above, which only come in rain. *Recommend: keep; a dungeon you could only cross in fine weather would be a wall.* **Owner, 14 Nov: "the flooding stays on a steady beat. that is fine."**
3. **The keeper's name, "the Standing Note",** and the two pieces of gear's names: **[PROPOSED]**, change any.

### The lines

| English | French |
|---|---|
| The Dry Flume | La Flume Sèche |
| An arch in the bank under the Flume, built of dressed stone, with a wheel cut in the keystone. Steps go down into the dark, and the air that comes up is dry. | Une arche dans le talus sous la Flume, en pierre de taille, une roue gravée sur la clef. Des marches descendent dans le noir, et l'air qui remonte est sec. |
| The Dry Flume | La Flume Sèche |
| Up to the Stride | Remonter vers l'Enjambée |
| The adit. Stone steps worn hollow, and an iron rail sunk in lead beside them. Somebody built this, and built it to last. | La galerie d'accès. Des marches de pierre creusées par l'usure, et une rampe de fer scellée au plomb à côté. Quelqu'un a bâti ceci, et l'a bâti pour durer. |
| The conduit: a channel of stone twice the height of a man, lined with brick, bone dry. Before the Flume was grown, it was built, and this is what carried the water. | Le conduit : un canal de pierre deux fois haut comme un homme, doublé de brique, sec comme un os. Avant que la Flume ne soit cultivée, elle fut bâtie, et c'est ceci qui portait l'eau. |
| The living Flume's root, come down through the roof. It hangs in the dark like a vein, and it is lit from inside, green. | La racine de la Flume vivante, descendue à travers la voûte. Elle pend dans le noir comme une veine, éclairée de l'intérieur, verte. |
| The settling tanks, three of them, stepped down. The silt in the bottom is still wet. There is a tide-mark on the walls at the height of your chin. | Les bassins de décantation, trois, en gradins. La vase au fond est encore humide. Il y a une ligne de crue sur les murs à hauteur de votre menton. |
| The wheel-pit. The wheel is iron and twice the height of a man, and it stopped with one bucket at the top. | La fosse de la roue. La roue est en fer, deux fois haute comme un homme, et elle s'est arrêtée avec un godet tout en haut. |
| A sluice-gate hung in its frame over the walk, on a chain worn thin. Use it to wedge the frame. | Une vanne suspendue dans son cadre au-dessus du passage, à une chaîne usée. Utilisez-la pour caler le cadre. |
| The chain goes. The sluice-gate comes down on the walk and catches your shoulder on the way. | La chaîne cède. La vanne s'abat sur le passage et vous heurte l'épaule au passage. |
| You drive a wedge of old oak into the frame. The gate will not come down now. | Vous enfoncez une cale de vieux chêne dans le cadre. La vanne ne tombera plus. |
| The sluice-gate, wedged in its frame. | La vanne, calée dans son cadre. |
| The sluice-gate, lying across the walk where it fell. | La vanne, couchée en travers du passage là où elle est tombée. |
| The sump. The water is black and very still, and the walls are wet all the way to the roof. | Le puisard. L'eau est noire et très calme, et les murs sont mouillés jusqu'à la voûte. |
| A causeway through the sump, a stride wide. Wait on the steps until the water has gone down, then cross before it comes again. | Une chaussée à travers le puisard, large d'une enjambée. Attendez sur les marches que l'eau soit redescendue, puis traversez avant qu'elle ne revienne. |
| Somewhere above, the Flume draws a breath. The water in the sump begins to climb. | Quelque part au-dessus, la Flume prend son souffle. L'eau du puisard commence à monter. |
| The sump fills from the floor to the roof. | Le puisard se remplit du sol à la voûte. |
| The water takes your feet and throws you onto the steps. | L'eau vous fauche les pieds et vous jette sur les marches. |
| The water goes back down the walls, and the causeway comes up out of it, streaming. | L'eau redescend le long des murs, et la chaussée en ressort, ruisselante. |
| The pump-hall. Iron galleries on iron columns, two tiers of them, and in the middle the engine's beam, as long as a barn and still. | La salle des pompes. Des galeries de fer sur des colonnes de fer, sur deux niveaux, et au milieu le balancier de la machine, long comme une grange et immobile. |
| The engine's beam, iron, on its column. It stopped at the top of a stroke and has stood there for two hundred years. | Le balancier de la machine, en fer, sur sa colonne. Il s'est arrêté en haut de sa course et s'y tient depuis deux cents ans. |
| An iron gallery, rusted lace. The steps up to it are gone. | Une galerie de fer, une dentelle rouillée. Les marches qui y menaient ont disparu. |
| The Standing Note | La Note Tenue |
| Under the beam lies a mire-drone grown two hundred years in the dark, the size of a cart. Its one note is the note the engine made when it ran, and the iron galleries ring with it. | Sous le balancier gît un bourdon du bourbier qui a grandi deux cents ans dans le noir, de la taille d'une charrette. Son unique note est celle que faisait la machine quand elle tournait, et les galeries de fer en résonnent. |
| The engine-man's bench, and what he left on it. | L'établi du machiniste, et ce qu'il y a laissé. |
| Lengthsman's Hook | Gaffe de l'éclusier |
| A boat-hook on an ash pole, iron at the working end. It reaches further than a sword, and what it reaches it pulls towards you. | Une gaffe sur une hampe de frêne, ferrée au bout. Elle porte plus loin qu'une épée, et ce qu'elle atteint, elle le tire vers vous. |
| Sluice-Boots | Bottes de vanne |
| Thigh-high and tarred, with felt soles under the leather. In water they make no sound at all. | Montant à mi-cuisse et goudronnées, avec des semelles de feutre sous le cuir. Dans l'eau, elles ne font aucun bruit. |
| The stair up. A draught comes down it that smells of open air and wet stone. | L'escalier qui monte. Un courant d'air en descend, qui sent le grand air et la pierre mouillée. |
| The grating overhead, bolted from below with two iron bolts. Use them to slide them back. | La grille au-dessus, verrouillée par en dessous de deux verrous de fer. Utilisez-les pour les tirer. |
| You slide the bolts back. The grating lifts an inch and settles. Above it is the bottom pound of the Stair. | Vous tirez les verrous. La grille se soulève d'un pouce et retombe. Au-dessus, c'est le dernier bief de l'Escalier. |
| Climb up through the grating | Monter par la grille |
| Water stands on the grating. It will not lift until the pound is empty. | L'eau recouvre la grille. Elle ne se soulèvera pas tant que le bief n'est pas vide. |
| The grating in the empty pound. You unbolted it from below. Steps go down into the Dry Flume. | La grille dans le bief vide. Vous l'avez déverrouillée par en dessous. Des marches descendent dans la Flume Sèche. |
| You lift the grating and go down the steps into the Dry Flume. | Vous soulevez la grille et descendez les marches dans la Flume Sèche. |
| The Dry Flume: under the Stride is the old stone conduit that carried the water before the Flume was grown. The grating in the Pound Stair's bottom pound is its back door, and I have unbolted it. | La Flume Sèche : sous l'Enjambée se trouve l'ancien conduit de pierre qui portait l'eau avant que la Flume ne soit cultivée. La grille du dernier bief de l'Escalier des Biefs est sa porte de derrière, et je l'ai déverrouillée. |

## 2. The Antler Galleries (14 Nov)

Code: `js/antler85.js`. Test: `test/antler85.test.js` (14 checks). French: `tools/i18n/p85-antler.tsv`.

Everything here is **[PROPOSED]** under the approved plan ("in the Reach, the antler picks that were left in the galleries grew").

### What was built

- **The way down:** the open hollow on the drove road (Phase 83). Use its mouth and you go down notches cut in the chalk.
- **The galleries:** low passages of white chalk running out from the shaft's foot on every side and branching, the walls covered in pick-strokes, with dead ends and an old face at the far end. Antler picks lie where they were put down. Near the shaft they are only picks. Further out they have taken root and are putting up new tines.
- **The Hush.** Both levels are still enough for the Hush, like the siphoned places: stand still and it leans in.
- **Light is the way through.** You come down with your lamp dark. Each niche holds a tallow-cup. Use one and it fills your lamp and lights them both; a lit niche stays lit. A full lamp burns for a minute and a half, warns you when it is low, and goes out. While it burns, stillness creeps in at half the rate.
- **What lives there:** swarms in numbers in the dead ends and the old face, hush-moths about the niches, a lesser strongbox at the old face.
- **The deep,** down a second shaft by a ladder of lashed poles. **The white forest:** antler grown from the floor to the roof, on and on, with a winding way through it. The antler gives a little light of its own, so the forest shows white in the dark. It is the only white place in the game. **The floorstone:** the seam of black flint along the foot of the wall. **The den:** the deepest gallery.
- **The keeper: the Flint-Back.** A fret-crawler grown white in the chalk, as long as a boat, with flint grown into the ridges of its shell. It has 130 health and hits for 6 to 12. It is painted in its own colours in every pose.
- **The gear:** the **Antler Pick** (lying at the forest's heart; it breaks armour) and the **Floorstone Knife** (by the floorstone; very quiet, very fast, glass-sharp). A strongbox of the best kind in the den. That makes 46 strongboxes in the game.

### Readings for the owner

1. **The keeper is a fret-crawler grown large and white,** as the Standing Note is a mire-drone grown large. *Recommend: keep; the plan only said "something denned in the deepest gallery".*
2. **The lamp is not an item in the pack.** It is the light you carry in these galleries only; the niches fill it. *Recommend: keep, so nothing new has to be carried, bought or lost.*
3. **The galleries' roof is a little higher than a person** (about one and a third), not as low as a real flint-mine's. Lower than that, the 3D view puts the roof on your eyes. *Recommend: keep.*
4. **Names:** the Flint-Back, the Antler Pick, the Floorstone Knife: **[PROPOSED]**, change any. ("Floorstone" is the real miners' name for the best flint seam at Grime's Graves.)

### The lines

| English | French |
|---|---|
| The Antler Galleries | Les Galeries de Bois-de-Cerf |
| The Antler Galleries: the deep | Les Galeries de Bois-de-Cerf : les profondeurs |
| The open hollow's mouth. Notches cut in the chalk go down it like a ladder. | La bouche du creux ouvert. Des encoches taillées dans la craie y descendent comme une échelle. |
| You go down the notches into the chalk. | Vous descendez les encoches dans la craie. |
| Up the notches to the Hollows | Remonter les encoches vers les Creux |
| Up the ladder to the galleries | Remonter l'échelle vers les galeries |
| A second shaft, and a ladder of lashed poles going down it | Un second puits, et une échelle de perches liées qui y descend |
| The shaft's foot. Galleries go out from it on every side, low, white, the walls marked all over with the strokes of picks. | Le pied du puits. Des galeries en partent de tous côtés, basses, blanches, les murs couverts de coups de pic. |
| A gallery, cut low. You go stooping. Every stroke in the chalk is the width of a tine. | Une galerie, taillée bas. Vous avancez courbé. Chaque coup dans la craie a la largeur d'un andouiller. |
| An antler pick, lying where it was put down. It has been lying here a very long time. | Un pic en bois de cerf, posé là où on l'a laissé. Il est là depuis très longtemps. |
| An antler pick that has taken root. Its tines have gone into the floor, and new tines are coming up out of the old. | Un pic en bois de cerf qui a pris racine. Ses andouillers sont entrés dans le sol, et de nouveaux andouillers sortent des anciens. |
| A niche cut in the wall, and a cup of chalk in it with tallow and a wick. Use it to fill your lamp and light it. | Une niche taillée dans le mur, et dedans une coupe de craie avec du suif et une mèche. Utilisez-la pour remplir votre lampe et l'allumer. |
| A niche, its tallow-cup burning. Use it to fill your lamp. | Une niche, sa coupe de suif allumée. Utilisez-la pour remplir votre lampe. |
| You fill your lamp from the cup and light them both. The chalk throws the light a long way. | Vous remplissez votre lampe à la coupe et les allumez toutes deux. La craie renvoie la lumière très loin. |
| You fill your lamp from the cup. | Vous remplissez votre lampe à la coupe. |
| Your lamp is burning low. Find a niche. | Votre lampe baisse. Trouvez une niche. |
| Your lamp goes out. The dark here is very still, and stillness is the Hush's. | Votre lampe s'éteint. L'obscurité ici est très immobile, et l'immobilité appartient au Silence. |
| The old face, where the first of them stopped digging. The floor is a litter of chalk and broken tine. | Le vieux front de taille, là où le premier d'entre eux a cessé de creuser. Le sol est jonché de craie et d'andouillers brisés. |
| The white forest. The picks they left grew, and kept growing: antler from the floor to the roof, branching, white on white, as far as the light goes. | La forêt blanche. Les pics qu'ils ont laissés ont poussé, et poussent encore : du bois de cerf du sol à la voûte, ramifié, blanc sur blanc, aussi loin que porte la lumière. |
| Antler, grown from a pick. It is warm to the touch, and it is still growing. | Du bois de cerf, poussé d'un pic. Il est tiède au toucher, et il pousse encore. |
| The floorstone: the seam of black flint they dug all this to reach, a band of it along the foot of the wall like a line of ink. | La pierre de fond : le filon de silex noir qu'ils ont creusé tout cela pour atteindre, une bande au pied du mur comme un trait d'encre. |
| The deepest gallery. Something has lain here so long that the floor is worn to its shape. | La galerie la plus profonde. Quelque chose est resté couché ici si longtemps que le sol a pris sa forme. |
| The Flint-Back | Dos-de-Silex |
| A fret-crawler grown white in the chalk, as long as a boat, flint grown into the ridges of its shell. It is lying in the deepest gallery as if it were part of the floor. | Un rampant à frettes devenu blanc dans la craie, long comme une barque, du silex poussé dans les crêtes de sa carapace. Il est couché dans la galerie la plus profonde comme s'il faisait partie du sol. |
| Antler Pick | Pic en bois de cerf |
| A red-deer antler, the brow tine left long for a point and the rest cut away, the beam worn smooth by a hand that was gone before anyone wrote anything down. It breaks armour. | Un bois de cerf élaphe, l'andouiller d'œil laissé long pour faire une pointe et le reste coupé, le merrain poli par une main disparue avant que personne n'écrive quoi que ce soit. Il brise les armures. |
| Floorstone Knife | Couteau de pierre de fond |
| Black flint from the floorstone, knapped to an edge you could shave with. It makes almost no sound, and it is very sharp. | Du silex noir de la pierre de fond, taillé jusqu'à un fil à se raser. Il ne fait presque aucun bruit, et il est très tranchant. |
| The Antler Galleries: under the open hollow on the drove road, an old flint-mine. The antler picks they left grew. The deep galleries are a white forest, and something lies in the deepest. | Les Galeries de Bois-de-Cerf : sous le creux ouvert du chemin de transhumance, une ancienne mine de silex. Les pics en bois de cerf qu'ils ont laissés ont poussé. Les galeries profondes sont une forêt blanche, et quelque chose gît dans la plus profonde. |

## 3. The Sunk Lanes, the punt, and Cross Pool (14 Nov)

Code: `js/lanes85.js`. Test: `test/lanes85.test.js` (16 checks). French: `tools/i18n/p85-lanes.tsv`.

Everything here is **[PROPOSED]** under the approved plan (road 2 and big place 3).

### What was built

- **The Sunk Lanes,** one short stretch now between Stillwater Landing and the Low Rings: old cobbles a hand under the water, then boards laid from roof to roof (you walk the ridges of drowned roofs), then a hedge-bank, bending round deep pools. Drones lie at the pools' edges.
- **The punt-woman** keeps her punt at a stage on the Lanes. A sovereign hires it for the Lanes and Cross Pool. Use the punt to get in. Press X, or use any mooring stage, to get out on dry ground. In the punt you go over deep water and shallows and nowhere else. A drowned shop-front out in the deep holds a strongbox you can only reach by punt.
- **Cross Pool,** the old town, west of the Low Rings through a new gate. The market cross stands under clear green water in the middle of a drowned square, with kerbs and doorsteps around it. **After dark the water is lit from beneath** and the whole street shows. A board walk runs round the square. The cashbox the looters left "for being too heavy" lies on the cross's bottom step, with the Market-Warden's Buckler; both are reached only by punt.
- **The corn loft** (dry, a strongbox), **the weavers' garrets** (six doors along one long board, a tuned reed over each, each a step higher than the last; one hook bare), and **the Ladder's Foot** (the grown-shut water-gate; the first time you stand there you hear Oakhaven over the Hedge).
- **Her task:** she gives you a child's reed when you hire the punt. Hang it on the bare hook, and she gives you the **Punt-Pole** (reach 2.5, it pushes what it hits away) and 4 sovereigns.
- **On a still, clear night** the water drops and the kerb-tops of the old street come up as stepping stones to **the kerb house**, alone in its own pool (a strongbox). By day, or in any weather, they are under.
- **In storm** the water rises, two more drones come out on each map, and the danger is 2.
- Strongboxes: four new (the shop-front, the cashbox, the corn loft, the kerb house), 50 in the game.

### Readings for the owner

1. **The Low Rings were not rebuilt three times larger.** The existing Low Rings map stays as it was, so nothing in it (the chandler's, the counting-house, the hidden household's loft) moves, and Cross Pool is the old town grown on to its west side. Together they are about the size the plan asked for. *Recommend: keep.*
2. **The two salvagers stand on the weavers' board** and answer when spoken to; they do not walk a day's round yet. *Recommend: give them a round in the polish pass.*
3. **The punt is not one boat that follows you.** There is one at the Lanes stage and one at the Cross Pool stage, and the sovereign hires both. *Recommend: keep.*
4. **"The boards float loose" in storm** is not built. The water rising is shown by the drones and the danger. *Recommend: keep it this way; loose boards would cut the only dry way.*

### The lines

| English | French |
|---|---|
| The Sunk Lanes | Les Ruelles noyées |
| The Low Rings: Cross Pool | Les Anneaux bas : la Mare-à-la-Croix |
| On to Stillwater Landing | Continuer vers l'Embarcadère de Stillwater |
| On to the Low Rings | Continuer vers les Anneaux bas |
| West, by the boards, to Cross Pool | À l'ouest, par les planches, vers la Mare-à-la-Croix |
| East, to the Low Rings | À l'est, vers les Anneaux bas |
| The Sunk Lanes. It is not a road but a way: a causeway, then boards from roof to roof, then a bank of hedge. The pools on either side are deeper than they look. | Les Ruelles noyées. Ce n'est pas une route mais un passage : une chaussée, puis des planches de toit en toit, puis un talus de haie. Les mares de chaque côté sont plus profondes qu'elles n'en ont l'air. |
| The causeway: old cobbles, a hand under the water in places. Keep to the middle. | La chaussée : de vieux pavés, à une main sous l'eau par endroits. Restez au milieu. |
| Boards laid from roof to roof. Under them, the street. Under the street, nobody knows. | Des planches posées de toit en toit. Dessous, la rue. Sous la rue, personne ne sait. |
| A hedge-bank, planted on the old lane wall. The only dry thing for a long way. | Un talus de haie, planté sur le vieux mur de la ruelle. La seule chose sèche à des lieues. |
| The punt-woman | La passeuse |
| "A sovereign and she's yours, while you're in the Lanes and the Pool. Use her to get in, and get out at any stage or bank. And while you're poling about: I fished this up. A child's reed. It wants hanging back over its own door. The weavers' row, in the Pool. One hook's bare." | "Un souverain et elle est à vous, tant que vous êtes dans les Ruelles et la Mare. Montez-y pour partir, descendez à n'importe quel ponton ou talus. Et pendant que vous godillez : j'ai repêché ça. Le roseau d'un enfant. Il faut le raccrocher au-dessus de sa propre porte. La rangée des tisserands, dans la Mare. Il y a un crochet nu." |
| "A sovereign for the punt. I don't do credit. The water doesn't either." | "Un souverain pour la barque. Je ne fais pas crédit. L'eau non plus." |
| "The weavers' row, in the Pool. One hook bare. You'll hear which." | "La rangée des tisserands, dans la Mare. Un crochet nu. Vous entendrez lequel." |
| "Back where it belongs. Here: my old pole. It's too long for me now, and it pushes as well as it ever did." | "Revenu là où il doit être. Tenez : ma vieille perche. Elle est trop longue pour moi maintenant, et elle repousse aussi bien qu'avant." |
| "Mind the pools. They look like puddles until they don't." | "Méfiez-vous des mares. Elles ont l'air de flaques jusqu'au moment où elles n'en sont plus." |
| She gives you the reed. It is cut short and tuned, and somebody has scratched a mark on it. | Elle vous donne le roseau. Il est coupé court et accordé, et quelqu'un y a gravé une marque. |
| A punt, flat and black with tar, and a pole across it | Une barque à fond plat, plate et noire de goudron, une perche posée en travers |
| It is the punt-woman's. Ask her. | Elle est à la passeuse. Demandez-lui. |
| You step down into the punt and take up the pole. | Vous descendez dans la barque et prenez la perche. |
| You step out and make the punt fast. | Vous descendez et amarrez la barque. |
| There is nowhere to step out here. | Il n'y a nulle part où descendre ici. |
| A mooring stage: a few planks on posts | Un ponton d'amarrage : quelques planches sur des pieux |
| Cross Pool. The market cross stands under the water in the middle of it, with the whole square round it, kerb and step and gutter, as plain as through glass. | La Mare-à-la-Croix. La croix du marché se dresse sous l'eau au milieu, avec toute la place autour, bordure, marche et caniveau, aussi nets qu'à travers une vitre. |
| The market cross, under the water. The steps round its foot are green, and something heavy lies on the bottom one. | La croix du marché, sous l'eau. Les marches à son pied sont vertes, et quelque chose de lourd repose sur la plus basse. |
| Under the water, the old street: a kerb, a doorstep, a boot-scraper. | Sous l'eau, la vieille rue : une bordure, un seuil, un décrottoir. |
| After dark the water is lit from underneath, green, and the whole drowned street shows under the boards. | Après la tombée de la nuit, l'eau s'éclaire par en dessous, verte, et toute la rue noyée apparaît sous les planches. |
| The corn loft | Le grenier à grain |
| The corn loft. Sacks gone to dust, a winnowing fan on the wall, the floor dry. | Le grenier à grain. Des sacs tombés en poussière, un van au mur, le plancher sec. |
| The weavers' garrets, all along one long board. Every door has a reed over it, each for a child born behind it. | Les mansardes des tisserands, le long d'une seule longue planche. Chaque porte a un roseau au-dessus, chacun pour un enfant né derrière. |
| A tuned reed over a door. It sounds when you touch it. | Un roseau accordé au-dessus d'une porte. Il sonne quand on le touche. |
| A bare hook over a door, where a reed was. | Un crochet nu au-dessus d'une porte, là où il y avait un roseau. |
| You hang the reed on the bare hook. It sounds its note, and the row is whole: each door a step higher than the last. | Vous accrochez le roseau au crochet nu. Il sonne sa note, et la rangée est entière : chaque porte un degré plus haut que la précédente. |
| The child's reed, back over its own door. | Le roseau de l'enfant, de nouveau au-dessus de sa propre porte. |
| A garret door, swollen shut. | Une porte de mansarde, gonflée et coincée. |
| The Ladder's Foot. A water-gate grown shut, the wood gone into itself like a healed wound. Oakhaven is on the other side. | Le Pied de l'Échelle. Une porte d'eau fermée par la croissance, le bois refermé sur lui-même comme une plaie guérie. Oakhaven est de l'autre côté. |
| Over the Hedge, close: a cart on cobbles, somebody calling a name, a door. Oakhaven, a wall's width away, and no way through. | Par-dessus la Haie, tout près : une charrette sur les pavés, quelqu'un qui appelle un nom, une porte. Oakhaven, à l'épaisseur d'un mur, et aucun passage. |
| The kerb-tops of the old street, just under the water. | Le haut des bordures de la vieille rue, juste sous l'eau. |
| The Flume's note has dropped tonight, and the water with it. The kerb-tops stand out of the pool like stepping stones. | La note de la Flume a baissé cette nuit, et l'eau avec elle. Le haut des bordures sort de la mare comme des pierres de gué. |
| A house in the middle of the pool. Its door is only reachable when the water is down. | Une maison au milieu de la mare. On ne peut atteindre sa porte que lorsque l'eau est basse. |
| The water is up in the storm, and the drones have come out of the lanes. | L'eau est haute dans la tempête, et les bourdons sont sortis des ruelles. |
| A salvager | Un récupérateur |
| The other salvager | L'autre récupérateur |
| "We're working. You're not. Go and not work somewhere else." | "On travaille. Pas vous. Allez ne pas travailler ailleurs." |
| "Lead off the garret roofs, brass off the doors. What the water left." | "Le plomb des toits des mansardes, le cuivre des portes. Ce que l'eau a laissé." |
| "The cross? There's a box on the bottom step nobody's lifted. Too heavy. You'd want a punt and a back." | "La croix ? Il y a une caisse sur la dernière marche que personne n'a soulevée. Trop lourde. Il vous faudrait une barque et du dos." |
| "Mind the boat." | "Attention au bateau." |
| Punt-Pole | Perche de passeuse |
| Twelve feet of ash, shod with iron at the foot. It reaches further than a spear, and what it reaches it pushes away. | Douze pieds de frêne, ferrés au pied. Elle porte plus loin qu'une lance, et ce qu'elle atteint, elle le repousse. |
| Market-Warden's Buckler | Rondache du garde du marché |
| A round of brass from the market cross, stamped with the weights and measures. It turns a blow, and it rings when it does. | Un rond de laiton de la croix du marché, frappé des poids et mesures. Il détourne un coup, et il sonne quand il le fait. |
| The cashbox the looters left: iron-bound, and far too heavy | La caisse que les pillards ont laissée : cerclée de fer, et bien trop lourde |
| The Sunk Lanes and Cross Pool: the Low Rings go on west into the old town, drowned. The punt-woman hires her punt for a sovereign. | Les Ruelles noyées et la Mare-à-la-Croix : les Anneaux bas continuent à l'ouest dans la vieille ville, noyée. La passeuse loue sa barque un souverain. |
| The punt-woman fished up a child's reed. It belongs over a door on the weavers' row in Cross Pool, where one hook is bare. | La passeuse a repêché le roseau d'un enfant. Il va au-dessus d'une porte de la rangée des tisserands, à la Mare-à-la-Croix, où un crochet est nu. |
| A plank on a post. STILLWATER, east. Under it, in tar: the causeway is the dry way. | Une planche sur un pieu. STILLWATER, à l'est. Dessous, au goudron : la chaussée est le chemin sec. |
| A plank on a post. THE LOW RINGS. Under it, in tar: keep off the pools. | Une planche sur un pieu. LES ANNEAUX BAS. Dessous, au goudron : évitez les mares. |
| A plank on a post. CROSS POOL, by the boards. Somebody has added: and the cross. | Une planche sur un pieu. LA MARE-À-LA-CROIX, par les planches. Quelqu'un a ajouté : et la croix. |
| A plank on a post. THE LOW RINGS, east. STILLWATER beyond. | Une planche sur un pieu. LES ANNEAUX BAS, à l'est. STILLWATER au-delà. |

## 4. The Deep Grove (14 Nov)

Code: `js/grove85.js`. Test: `test/grove85.test.js` (11 checks). French: `tools/i18n/p85-grove.tsv`.

Everything here is **[PROPOSED]** under the approved plan (big place 4). The plan asked for it last and to be cut if it is not a pleasure: that is your call once you have walked it.

### What was built

- **The gap:** in the north side of Greenroot Wood (the third stretch of the Greenroot road), between two boulders furred green, with a post whose arm has been broken off.
- **The glades:** four glades in a wood of old oaks and dwarf oaks growing out of mossy boulders, the wood too thick to pass. Each glade has three ways on. **One way sounds lower than the others.** Take it and the wood lets you further in; three low notes bring you to the Stool. Take any other way and you come out at the gap you went in by. Which way is low, and which glades you walk, comes from the hour and how many times you have come in: the same for every player, never chance.
- **Every note has a caption** ("a low note, under hearing" or "a thinner note, higher"), so the way can be found without sound.
- **The Stool:** a ring of old trunks round a hollow. Stand in the hollow and you hear what is under the roots: "not in any key the Octave uses". Nothing opens.
- **Nobody is there and nothing attacks.** After dark, about twenty seconds in, the silent circle closes round you; when you come out, hounds are waiting at the gap.
- **To find:** four carters' marks, one in each glade, dated the Reach way, by what was growing (Vol VII: "the Reach dates by what is growing"), some of them impossible. The two pieces of gear: the **Carter's Oilskin** (body armour 3, quieter) folded on a boulder, and the **Fallen Iron-Bough** (iron, blunt: it bites the Quiet) at the Stool's foot.

### Readings for the owner

1. **A wrong way puts you straight back outside,** as the plan says, even from the third glade. That is strict. *Recommend: keep it strict, because the notes and their captions make the right way findable.*
2. **The wood's edge is drawn as trees, not walls.** The ground under them is simply closed to walking.

### The lines

| English | French |
|---|---|
| The Deep Grove | Le Bosquet profond |
| A gap in the north side of the wood, between two boulders furred green. The trees beyond are older than these. | Une trouée dans le flanc nord du bois, entre deux rochers couverts de mousse. Les arbres au-delà sont plus vieux que ceux-ci. |
| Into the Deep Grove | Dans le Bosquet profond |
| Out to Greenroot Wood | Sortir vers le bois de Greenroot |
| The wood closes behind you. The path you came in by is not there when you look round. | Le bois se referme derrière vous. Le chemin par lequel vous êtes entré n'est plus là quand vous vous retournez. |
| A glade. Oaks no higher than a man grow out of the boulders, every branch furred with moss. Three ways go on. | Une clairière. Des chênes pas plus hauts qu'un homme poussent hors des rochers, chaque branche fourrée de mousse. Trois chemins continuent. |
| A way on, between the trees | Un chemin qui continue, entre les arbres |
| [a low note, under hearing, from this way] | [une note grave, sous l'audible, venant de ce chemin] |
| [a thinner note, higher, from this way] | [une note plus mince, plus aiguë, venant de ce chemin] |
| The note is lower here. The wood lets you further in. | La note est plus grave ici. Le bois vous laisse aller plus loin. |
| You walk by eye, and the wood lets you out where you came in. | Vous marchez à vue, et le bois vous laisse sortir par où vous êtes entré. |
| The Stool: the oldest tree, a ring of trunks round a hollow where one trunk used to be, a thousand years ago or more. | La Souche : l'arbre le plus vieux, un cercle de troncs autour d'un creux où se dressait un tronc, il y a mille ans ou plus. |
| You stand in the hollow of the Stool. Under the roots something is sending, slow and patient, and it is not in any key the Octave uses. Nothing opens. Nothing asks you in. | Vous vous tenez dans le creux de la Souche. Sous les racines, quelque chose émet, lent et patient, et ce n'est dans aucune tonalité de l'Octave. Rien ne s'ouvre. Rien ne vous invite à entrer. |
| Cut in the bark: three notches, and IN AT ELDER-FLOWER. Under it: OUT AT ELDER-FLOWER. The same flower, or a year on; it does not say. | Gravé dans l'écorce : trois encoches, et ENTRÉ À LA FLEUR DE SUREAU. Dessous : SORTI À LA FLEUR DE SUREAU. La même fleur, ou un an plus tard ; ça ne le dit pas. |
| Cut in a boulder: TWO OF US IN AT HAYMAKING. Under it, one name, and OUT THE DAY BEFORE. | Gravé dans un rocher : DEUX DE NOUS ENTRÉS AUX FOINS. Dessous, un seul nom, et SORTI LA VEILLE. |
| Cut in the bark, deep and careful: IN AT FIRST FROST. Nothing under it. | Gravé dans l'écorce, profond et soigneux : ENTRÉ AUX PREMIÈRES GELÉES. Rien dessous. |
| A carter's mark, a wheel with a nail through it, and IN WHEN THE SLOES WERE RIPE, OUT WHEN THEY WERE RIPE. | Une marque de charretier, une roue traversée d'un clou, et ENTRÉ QUAND LES PRUNELLES ÉTAIENT MÛRES, SORTI QUAND ELLES ÉTAIENT MÛRES. |
| The iron-boughs go quiet round you. Not all at once: a ring of quiet, widening, and you can hear it close. Everything for a long way off knows where you are now. | Les bois-de-fer se taisent autour de vous. Pas d'un coup : un anneau de silence, qui s'élargit, et vous pouvez l'entendre se refermer. Tout ce qui est loin à la ronde sait maintenant où vous êtes. |
| Something is waiting at the gap. The circle called it. | Quelque chose attend à la trouée. Le cercle l'a appelé. |
| Carter's Oilskin | Ciré de charretier |
| A long coat of oiled canvas, folded on a boulder and left. It keeps the rain off and the noise in. | Un long manteau de toile huilée, plié sur un rocher et laissé là. Il garde la pluie dehors et le bruit dedans. |
| Fallen Iron-Bough | Branche de bois-de-fer tombée |
| A bough of iron-oak, fallen from the Stool and as hard as its name. Iron bites the Quiet, and this is the oldest iron in the Reach. | Une branche de chêne-de-fer, tombée de la Souche et aussi dure que son nom. Le fer mord le Calme, et c'est le plus vieux fer des Confins. |
| The Deep Grove: off the north side of Greenroot Wood. The path is not the same way twice. Follow the lower note, and it leads in, to the oldest tree. | Le Bosquet profond : au nord du bois de Greenroot. Le chemin n'est jamais deux fois le même. Suivez la note la plus grave, et il mène à l'intérieur, jusqu'au plus vieil arbre. |
| A post by the gap, its arm broken off. Nobody has cut a name on what is left. | Un poteau près de la trouée, son bras cassé. Personne n'a gravé de nom sur ce qui reste. |
| A post, furred green, with no arm at all. The way out is behind you, or it was. | Un poteau, fourré de vert, sans aucun bras. La sortie est derrière vous, ou elle l'était. |
