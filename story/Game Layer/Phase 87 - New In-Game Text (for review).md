# Phase 87: New In-Game Text (for review)

Gear, matching sets and the first-person view, from the design the owner approved on 14 Nov ("1 yes, 2 is a yes, yes, yes, 5 is a yes, the glass arm does look better yes, 7 isa yes"). Built in the order ruled. This record grows as each step is done.

Every name, number and line below is **[PROPOSED]** under the approved design.

## (a) The first-person view (done 14 Nov)

Code: `js/fp87.js` (the painter), `js/body21.js` (asks it first). Test: `test/gear87.test.js`.

- Every melee weapon (24 of them) has its own first-person picture, painted in code from its gear-look entry and a shape of its own: blade (straight, tapering, leaf, broad, flint, shears), guard (cross, bar, disc, ring, basket), pommel (wheel, disc, ball, cap, ring), and for hafted weapons the head (bearded axe, flanged mace, the iron-bough's mossed knot, a bell-ringer's hammer, the antler pick, the foundry maul with its gauge, the quarry sledge, the tuning fork, the glaive, the crook, the iron shoe of a staff or pole, the boat-hook).
- The hand round the grip wears your gloves (leather with seams, mail gauntlets with rings and plates, or your bare hand), and your sleeve runs out of the bottom of the view. Two-handers are held in both hands; the left is glass if your arm is.
- Twice the old pictures' detail and about 1.45 times their size, held more upright, as in the owner's picture. The brightest parts (edges, the lit flat, glass) keep a little light of their own, so steel still catches the light under the scene's shading.
- The glass arm: deeper azure, its facets kept, a quarter of its old glow.
- The Old Cantor's Staff, the Punt-Pole and the Lengthsman's Hook are two-handed.

## (b) The cape slot and the sets (done 14 Nov)

Code: `js/gear87.js`. French: `tools/i18n/p87-gear.tsv`.

- **A sixth slot, the cape,** after the shield. Old saves load with it empty. The capes themselves come in (c).
- **Fourteen sets,** as in the design table. Three pieces of one set (the readied weapon counts as one) give the small bonus; every armour piece of the set with one of its weapons readied gives the full bonus on top. A piece not in the game yet does not count until it is.
- **The inventory** lists the sets you are wearing, how many pieces of each, and both bonuses (lit when they are on). Each piece's line names its set.
- **Bonuses that work now:** armour, noise, fatigue back faster, fatigue on the roads, swing speed, the voice a Song costs. The set-special ones (the Office column passing you by, the pony faster, the Deep Grove's low note and the rest) come with each set's pieces in (c).

## Readings for the owner

1. **The Quilted Gambeson** was in no set in the design table. It is now Tanner's Row's other body piece: the jerkin or the gambeson counts.
2. **A new game starts with three pieces of Tanner's Row** (the jerkin, the gloves, the short sword), so every new traveller has its +1 armour from the start.
3. **Bonuses for the five sets the design table gave no example for** (Synod Registry, the Siphon Corps, the Consortium Works, the Barrow-Wardens, the Flume and the Lanes) are in the lines below.
4. **Throwing knives** keep their shared picture (a fan of three) and come with the ranged weapons in (d), with the bare hands and the glass arm's own pose.

## The lines

| English | French |
|---|---|
| Cape | Cape |
| Matching sets | Ensembles assortis |
| {0}: {1} of {2} | {0} : {1} sur {2} |
| three pieces: | trois pièces : |
| the full set: | l'ensemble complet : |
| Nothing worn of any set. | Aucune pièce d'ensemble portée. |
| of {0} | de {0} |
| Tanner's Row | La Rangée des Tanneurs |
| +1 armour | +1 d'armure |
| fatigue comes back 20% faster | la fatigue revient 20 % plus vite |
| Hedge-weavers' Hush | Le Silence des tisserands de la Haie |
| footsteps 20% quieter | des pas 20 % plus discrets |
| silent on soft ground; enemies hear you at half the distance | silencieux sur sol meuble ; les ennemis vous entendent à moitié moins loin |
| Synod Registry | Le Registre du Synode |
| Synod clerks take you for one of their own | les clercs du Synode vous prennent pour l'un des leurs |
| Proctors at a distance pass you by | les Procureurs, de loin, vous laissent passer |
| Synod Arsenal | L'Arsenal du Synode |
| +2 armour | +2 d'armure |
| blocks with the kite shield cost no fatigue | parer avec le bouclier en amande ne coûte aucune fatigue |
| Carillon Legion | La Légion du Carillon |
| hits that land on you ring: the Cacophony near you takes 3 | les coups qui vous touchent sonnent : la Cacophonie proche subit 3 dégâts |
| The Office's Proctors | Les Procureurs de l'Office |
| Proctors at a distance take you for one of their own | les Procureurs, de loin, vous prennent pour l'un des leurs |
| the Office column passes you by | la colonne de l'Office vous laisse passer |
| The Cantors | Les Chantres |
| Songs cost 10% less voice | les Chants coûtent 10 % de voix en moins |
| Songs last a third longer | les Chants durent un tiers plus longtemps |
| The Siphon Corps | Le Corps des Siphons |
| +1 armour; fire and steam hurt you less | +1 d'armure ; le feu et la vapeur vous blessent moins |
| your blows crack golems open faster | vos coups fendent les golems plus vite |
| The Consortium Works | Les Ateliers du Consortium |
| heavy work tires you a quarter less | le gros ouvrage vous fatigue un quart de moins |
| The Free Captains | Les Capitaines libres |
| swings 10% faster | des coups 10 % plus rapides |
| ranged weapons reload a third faster; no fall damage from a ship's height | les armes à distance se rechargent un tiers plus vite ; pas de dégâts de chute de la hauteur d'un navire |
| The Drovers | Les Bouviers |
| fatigue 15% slower on the roads | la fatigue vient 15 % plus lentement sur les routes |
| the pony rides 10% faster; hounds come at you one at a time | le poney va 10 % plus vite ; les chiens vous attaquent un par un |
| The Barrow-Wardens | Les Gardiens des tertres |
| +1 armour; the barrow's dead are slower to wake | +1 d'armure ; les morts du tertre s'éveillent plus lentement |
| woolwights and the barrow's dead do not follow you past its door | les Laineux et les morts du tertre ne vous suivent pas au-delà de sa porte |
| The Flume and the Lanes | La Flume et les Ruelles |
| quieter on boards and in water | plus discret sur les planches et dans l'eau |
| the punt and wading cost no fatigue; the surge does not knock you down | la barque et le gué ne coûtent aucune fatigue ; la crue ne vous renverse pas |
| The Old Reach | Le Vieux Pays |
| iron-bough and flint hit 15% harder | le bois-de-fer et le silex frappent 15 % plus fort |
| the Deep Grove's ways are always the low note | les chemins du Bosquet profond sont toujours la note basse |
