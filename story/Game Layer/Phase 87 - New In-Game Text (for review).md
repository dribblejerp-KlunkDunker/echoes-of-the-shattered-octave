# Phase 87: New In-Game Text (for review)

Gear, matching sets and the first-person view, from the design the owner approved on 14 Nov ("1 yes, 2 is a yes, yes, yes, 5 is a yes, the glass arm does look better yes, 7 isa yes"). Built in the order ruled. Steps (a) to (e) are done.

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

## (c) The fifty-two new pieces (done 14 Nov)

Code: `js/items87.js` (the pieces, their pack pictures), `js/gearlook21.js` (what each looks like), `js/card21.js` (the character card, the partner and the ghost), `js/body21.js` and `js/fp87.js` (first person), `js/gear87.js` (the set-specials). French: `tools/i18n/p87-items.tsv`. Test: `test/gear87.test.js`.

- **Every set is whole.** Fourteen capes (cloaks, a tippet, a half-cloak, a pennon, rain-capes, a tarpaulin, a boat-cloak, a plaid, a red-deer pelt), nine head pieces, five body pieces, eleven pairs of gloves or bracers, nine of boots, four shields. The names and lines are in the table below.
- **Each has its own look,** from the world: Fenning's scraper-mark, the weavers' thorn border, the clerk's silver tassel, the dead queen's brooch, the bell's inscription in verdigris, the Office's silver mesh, the stave of a hymn, the Corps' brass valve, the Consortium stencil, salt-green buttons, the chalk-and-peat check, the barrow's spiral, the lengthsman's lantern-hook, the red deer's tines. On the card: new builders for heads (bandana, biretta, sallet, cowl, mesh hood, goggles, wide-awake, tarred hat, antler crown), capes, body forms, hands (mitts, fingerless cuffs, vambraces, coils, wraps, long cuffs), feet (sandals, buckles, clogs, steel toes, turned-down tops, sabatons) and shields (the targe's tacks, the bell-shield's inscription, the pavise's planks, the barrow shield's ribs). In the pack: a pixel picture each. In first person: the pavise and the round shields, bare arms under the hide tunic, bare fingers in the cuffs and coils.
- **The set-specials now act** where they say. Nine of the set lines were reworded so they say only what the game does (the old wording promised things the game has no rule for: blocks never cost fatigue, there is no fall damage, enemies never follow you between places):

| Set | Was | Now |
|---|---|---|
| Hush (full) | silent on soft ground; enemies hear you at half the distance | enemies hear you at half the distance |
| Registry (three) | Synod clerks take you for one of their own | Synod patrols take you for a clerk, as the robes do |
| Registry (full) | Proctors at a distance pass you by | an inspection takes twice as long |
| Arsenal (full) | blocks with the kite shield cost no fatigue | a blow blocked with the kite shield does a quarter of its harm |
| Proctors (full) | the Office column passes you by | inspections never begin: the Office column passes you by |
| Free Captains (full) | ranged weapons reload a third faster; no fall damage from a ship's height | ranged weapons reload a third faster |
| Drovers (full) | the pony rides 10% faster; hounds come at you one at a time | the pony rides 10% faster; hounds hear you at half the distance |
| Barrow-Wardens (full) | woolwights and the barrow's dead do not follow you past its door | woolwights and the barrow's dead strike you for a third less |
| Flume (full) | the punt and wading cost no fatigue; the surge does not knock you down | the Dry Flume's surge does not sweep you off your feet; fatigue comes back 20% faster |

**The owner's answer (14 Nov):** "blocking should cost fatigue, there needs to be fall damage, enemies should follow." So three of those lines go back to the first wording, and Phase 88 makes them true: blocking now costs fatigue (and the Arsenal's kite shield in full costs none); the game's own fall damage stays (it was already there: drops over 0.9 hurt) and the Free Captains in full land a ship's height free; enemies now follow you through doors (and the barrow's dead do not, for the Wardens in full). The Arsenal, Free Captains and Barrow-Wardens rows above are back to the "Was" wording.

## (d) The ranged weapons and their shot (done 14 Nov)

- **Six new ranged weapons:** the Felted Sling (Hush), the Shepherd's Sling (Drovers), the Office Carbine (Proctors; glass shot, two hands), the Works Hand-Crossbow (Works; one hand), the Harpoon Gun (Free Captains; two hands, slow), the Hornbow (Old Reach; two hands).
- **Their shot:** Sling Stones (x8), Quarrels (x8), Harpoons (x3), Flint Arrows (x10); each with its own "none left" and "loaded" line, and the sling whirs instead of firing.
- **First person:** every ranged weapon now has its own picture painted in code (the pistol and crossbow too): the one-handed ones held up like a blade, the two-handed ones held out in front with both hands, centred where the crossbow was. The throwing knives keep their picture (owner: "4 is fine for now"). **Owed from (d), paid in Phase 98 (17 Nov):** new pictures for the bare hands and the glass arm's pose, painted in code; the glass arm is raised on the left, where that arm is.

## (e) Where everything is found (done 14 Nov) [PROPOSED]

- **Shops at home:** Fenning (the tanner's cape and targe, the Registry's cuffs and shoes), Old Tam, the night-hummer, who sells the Hush-cloth (the Hush mitts, the felted sling, stones), Captain Vane (bandana, deck gloves, sea boots, harpoons), Factor Adela Vosk (the Works gauntlets, steel-toes, tarpaulin, hand-crossbow, quarrels), Orrin the sexton (the Cantor's cowl and sandals), Madge Tallow, the Flume's fence (the tarred hat, sluice gauntlets, shepherd's sling, stones), Fenwick Sloe, the Port Cantabile chandler (the boat-cloak, harpoons).
- **Carried by their people:** legionnaires (vambraces, sabatons, the sallet, the pennon), proctors (gloves, boots, hood, rain-cape), the Office's cutter-men (the oilcloth coat, the carbine), golems (the Corps' goggles, gauntlets and boots), Quiets and hush-wardens (the Hedge cloak), outriders (the half-cloak), woolwights (bracers, fleece mittens), the Old Fleece (the grave-wool cloak).
- **The best pieces in the big places** (the deepest strongboxes): the bell-shield, the pavise, the barrow greaves and shield, the antler crown, hide and pelt, the hornbow and harpoon gun, the ash-cape, the biretta and tippet, the cassock and choir-mantle, the captain's coat, the Proctor's oilcloth, the carbine.

## Readings, and the owner's answers (14 Nov)

1. **The Quilted Gambeson** is Tanner's Row's other body piece: the jerkin or the gambeson counts. *Owner: "the quilted gambeson works."*
2. **Starting kits.** *Owner: "each new game should start with that characters weapon of choice as well as the clothing/armor they normally wear."* Each calling now starts in its own set's clothes, with its own weapon. Pieces not made yet are stood in for by the old kit's piece for that slot until (c) makes them:

| Calling | Set | Starting clothes | Starting weapons |
|---|---|---|---|
| Dissonant Blade (a former bore-engineer) | The Siphon Corps | Siphoner's Smoked Goggles, Furnace-Apron, Siphoner's Heat-Gauntlets, Cinder-Boots | Short Sword, and the glass arm |
| Cantor | The Cantors | Cantor's Cowl, Cantor's Cassock, Pilgrim's Sandals, Cantor's Choir-Mantle | none: the Songs (and the glass-shot pistol, as before) |
| Corsair | The Free Captains | Corsair's Red Bandana, Free Captain's Long Coat, Deckhand's Tarred Gloves, Sea Boots, Corsair Buckler | Boarding Axe, Glass-Shot Pistol |
| Archivist of the Veil | Hedge-weavers' Hush (into the mist) | Hush-Cloth Hood, Quilted Gambeson, Hush-Cloth Mitts, Soft Boots | Throwing Knives (six), Glass-Shot Pistol |
| Flambeau Penitent | none (the Flambeaux have no set) | Iron Kettle Helm, Quilted Gambeson | Bell-Bronze Mace (the Flambeaux cast it), bare hands |
| Quarry-Hand | The Consortium Works | Iron Kettle Helm, Tanner's Leather Jerkin, Rigger's Gauntlets, Quarry-Hand's Steel-Toes | the Night-Shift Sledge |

   *Owner: "make a lighter quarry sledge. Remember I do want each weapon to have its own cool and unique look that represents the world that the shattered octave resides in."* The Quarry-Hand now starts with the **Night-Shift Sledge** (one hand, 6 to 13, quicker than the Great-Maul): a stone-splitter's head with chalk tallies on it, a red rag knotted at the neck so it can be found in the dark, and a brass Consortium tag nailed to the ash haft with a number that is not yours. It joins the Consortium Works set. The Great-Maul is still sold by Factor Vosk.
3. **Bonuses for the five sets the design table gave no example for** are in the lines below. *Owner: "3 is good."*
4. **Throwing knives** keep their shared picture until (d). *Owner: "4 is fine for now."*

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
| enemies hear you at half the distance | les ennemis vous entendent à moitié moins loin |
| Synod Registry | Le Registre du Synode |
| Synod patrols take you for a clerk, as the robes do | les patrouilles du Synode vous prennent pour un clerc, comme avec la robe |
| an inspection takes twice as long | une inspection dure deux fois plus longtemps |
| Synod Arsenal | L'Arsenal du Synode |
| +2 armour | +2 d'armure |
| blocks with the kite shield cost no fatigue | parer avec le bouclier en amande ne coûte aucune fatigue |
| Carillon Legion | La Légion du Carillon |
| hits that land on you ring: the Cacophony near you takes 3 | les coups qui vous touchent sonnent : la Cacophonie proche subit 3 dégâts |
| The Office's Proctors | Les Procureurs de l'Office |
| Proctors at a distance take you for one of their own | les Procureurs, de loin, vous prennent pour l'un des leurs |
| inspections never begin: the Office column passes you by | aucune inspection ne commence : la colonne de l'Office vous laisse passer |
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
| the pony rides 10% faster; hounds hear you at half the distance | le poney va 10 % plus vite ; les chiens vous entendent à moitié moins loin |
| The Barrow-Wardens | Les Gardiens des tertres |
| +1 armour; the barrow's dead are slower to wake | +1 d'armure ; les morts du tertre s'éveillent plus lentement |
| woolwights and the barrow's dead do not follow you past its door | les Laineux et les morts du tertre ne vous suivent pas au-delà de sa porte |
| The Flume and the Lanes | La Flume et les Ruelles |
| quieter on boards and in water | plus discret sur les planches et dans l'eau |
| the Dry Flume's surge does not sweep you off your feet; fatigue comes back 20% faster | la crue de la Flume Sèche ne vous emporte pas ; la fatigue revient 20 % plus vite |
| The Old Reach | Le Vieux Pays |
| iron-bough and flint hit 15% harder | le bois-de-fer et le silex frappent 15 % plus fort |
| the Deep Grove's ways are always the low note | les chemins du Bosquet profond sont toujours la note basse |
| Night-Shift Sledge | Masse de l'équipe de nuit |
| A quarry-hand's sledge from the Oakhaven works: a stone-splitter's head on a short ash haft, a brass Consortium tag nailed on with a number that is not yours, and a red rag at the neck so it can be found in the dark. | La masse d'un ouvrier des carrières d'Oakhaven : une tête de fendeur de pierre sur un court manche de frêne, une plaque de laiton du Consortium clouée dessus avec un numéro qui n'est pas le vôtre, et un chiffon rouge noué au col pour la retrouver dans le noir. |
| Tanner's Shoulder-Cape | Pèlerine de tanneur |
| Oiled hide cut short at the waist, with Abner Fenning's scraper-mark burned in at the throat and a bone toggle. Rain runs off it like off a roof. | Du cuir huilé coupé court à la taille, la marque de racloir d'Abner Fenning brûlée au col et un bouton d'os. La pluie y glisse comme sur un toit. |
| Fenning's Hide Targe | Targe de cuir de Fenning |
| A round board faced with three layers of boiled hide, laced at the rim with rawhide and set with brass tacks in a spiral. Light enough to forget you carry it. | Une planche ronde couverte de trois couches de cuir bouilli, lacée de cuir cru au bord et cloutée de laiton en spirale. Assez légère pour oublier qu'on la porte. |
| Hush-Cloth Mitts | Mitaines de drap-silence |
| Felted Hedge wool, the fingers split for a knife and a sling-cord. Your hands make no sound against anything. | De la laine feutrée de la Haie, les doigts fendus pour un couteau et une corde de fronde. Vos mains ne font de bruit contre rien. |
| Hedge-Weaver's Cloak | Cape de tisserand de la Haie |
| Packed wool to the calf, bordered with the weavers' thorn pattern. The hood is deep enough to sleep in. | De la laine tassée jusqu'au mollet, bordée du motif d'épines des tisserands. La capuche est assez profonde pour y dormir. |
| Registry Biretta | Barrette du Registre |
| A square grey cap with three ridges and a silver tassel. Inside the band, in another clerk's hand, a number that was never yours. | Un bonnet carré gris à trois cornes et à houppe d'argent. Dans le bandeau, d'une autre main de greffier, un numéro qui n'a jamais été le vôtre. |
| Clerk's Ink-Cuffs | Manchettes d'encre de greffier |
| Fingerless black kid and oilcloth sleeve-guards, stained with lamp-black, with a silver RECONCILIATION pin. Clerks nod to them. | Des mitaines de chevreau noir et des manchettes de toile cirée tachées de noir de fumée, avec une épingle d'argent RÉCONCILIATION. Les greffiers les saluent d'un signe de tête. |
| Registry Buckle-Shoes | Souliers à boucle du Registre |
| Black low shoes with square silver buckles and felted soles for the long corridors. They make a person look expected. | Des souliers bas et noirs à boucles carrées d'argent, aux semelles feutrées pour les longs couloirs. Ils donnent l'air d'être attendu. |
| Registry Tippet | Camail du Registre |
| A clerk's short grey shoulder-cape, edged with silver braid and fastened with a small silver seal. | La courte pèlerine grise d'un greffier, bordée de galon d'argent et fermée par un petit sceau d'argent. |
| Arsenal Sallet | Salade de l'Arsenal |
| Synod steel with a long tail over the neck and a visor that lifts. An arsenal stamp, a number, and an oxblood plume-tube with no plume. | De l'acier du Synode, une longue queue sur la nuque et une visière qui se relève. Un poinçon d'arsenal, un numéro, et un porte-plumet sang-de-bœuf sans plumet. |
| Arsenal Half-Cloak | Demi-manteau de l'Arsenal |
| Oxblood wool worn on the left shoulder, pinned with a steel brooch of the dead queen's head. | De la laine sang-de-bœuf portée sur l'épaule gauche, épinglée d'une broche d'acier à la tête de la reine morte. |
| Carillon Vambraces | Canons d'avant-bras du Carillon |
| Bell-bronze over leaded gloves. A line of the bell's inscription runs round each one: half a name, with verdigris in the letters. | Du bronze de cloche sur des gants plombés. Une ligne de l'inscription de la cloche court autour de chacun : la moitié d'un nom, du vert-de-gris dans les lettres. |
| Carillon Sabatons | Solerets du Carillon |
| Bronze foot-plates over lead-soled boots. Every legionnaire wears lead. On stone they toll. | Des plaques de bronze sur des bottes à semelle de plomb. Tout légionnaire porte du plomb. Sur la pierre, elles sonnent le glas. |
| Legion Bell-Pennon | Flamme à cloche de la Légion |
| A narrow banner of faded verdigris cloth hung from the shoulders, a dead name stitched down it and a small bronze bell sewn to the tail. | Une étroite bannière de drap vert-de-gris délavé pendue aux épaules, un nom mort brodé sur sa longueur et une petite cloche de bronze cousue à la queue. |
| Carillon Bell-Shield | Bouclier-cloche du Carillon |
| The lip of a cracked bell, cut flat and hammered round. The inscription still runs about the rim. Struck, it answers. | La lèvre d'une cloche fêlée, découpée à plat et martelée en rond. L'inscription court encore autour du bord. Frappé, il répond. |
| Proctor's Mesh Hood | Cagoule à maille de Procureur |
| Grey oilcloth, with silver mesh over the face. Nobody looking at it sees who is inside, which is the point. | De la toile cirée grise, une maille d'argent sur le visage. Personne ne voit qui est dedans, et c'est bien le but. |
| Proctor's Oilcloth | Toile cirée de Procureur |
| The long grey coat of the Catalogue field staff, with a felted collar and covered buttons, so a proctor can stand an hour and make no sound. | Le long manteau gris des agents de terrain du Catalogue, au col feutré et aux boutons couverts, pour qu'un Procureur puisse rester une heure debout sans un bruit. |
| Proctor's Felted Gloves | Gants feutrés de Procureur |
| Grey gloves felted on the palm, so a rod does not slip and a fork does not ring until it is meant to. | Des gants gris feutrés à la paume, pour qu'une verge ne glisse pas et qu'une fourche ne sonne pas avant l'heure. |
| Proctor's Field Boots | Bottes de terrain de Procureur |
| Grey oilcloth to the knee on felt soles. They stand still for an hour without a creak. | De la toile cirée grise jusqu'au genou sur des semelles de feutre. Elles restent immobiles une heure sans un craquement. |
| Proctor's Rain-Cape | Cape de pluie de Procureur |
| Grey oilcloth to the hip. Inside, painted in white, a Catalogue index number. | De la toile cirée grise jusqu'à la hanche. À l'intérieur, peint en blanc, un numéro d'index du Catalogue. |
| Cantor's Cowl | Capuchon de Chantre |
| Soft plum wool folded to the shoulders and left open about the ears, so they are free to listen. A brass fork-pin holds it at the throat. | De la douce laine prune repliée sur les épaules et ouverte autour des oreilles, pour qu'elles restent libres d'écouter. Une épingle-diapason de laiton le tient au col. |
| Cantor's Cassock | Soutane de Chantre |
| Dusty plum to the ankle, a row of small horn buttons, and the staves of a hymn stitched round the hem in cream. | Prune poussiéreux jusqu'à la cheville, une rangée de petits boutons de corne, et les portées d'un hymne brodées en crème autour de l'ourlet. |
| Pilgrim's Sandals | Sandales de pèlerin |
| Leather sandals over grey wool socks. The road to the Howe is walked, not ridden. | Des sandales de cuir sur des chaussettes de laine grise. La route du Tertre se fait à pied, pas à cheval. |
| Cantor's Choir-Mantle | Mantelet de chœur de Chantre |
| A cream shoulder-mantle with the five lines of a stave stitched round the hem in plum. A choir wears them so the back row can find its place. | Un mantelet crème aux cinq lignes d'une portée brodées en prune autour de l'ourlet. Un chœur les porte pour que le dernier rang retrouve sa place. |
| Siphoner's Smoked Goggles | Lunettes fumées de siphonneur |
| A scorched leather skullcap with smoked-glass goggles in brass cups, pushed up on the brow until the furnace door opens. | Une calotte de cuir roussi avec des lunettes de verre fumé dans des coupelles de laiton, relevées sur le front jusqu'à ce que la porte du four s'ouvre. |
| Furnace-Apron | Tablier de fournaise |
| Heavy scorched hide to the shin, a brass pressure-badge on the bib. The Corps wears them rolled-sleeved and sweating. | Un lourd cuir roussi jusqu'au tibia, un insigne de pression en laiton sur la bavette. Le Corps les porte manches retroussées et en sueur. |
| Siphoner's Heat-Gauntlets | Gantelets de chaleur de siphonneur |
| Quilted hide to the elbow, scorched black at the fingertips. You can hold a hot valve-wheel long enough to turn it. | Du cuir matelassé jusqu'au coude, noirci au bout des doigts. On peut tenir un volant de vanne brûlant assez longtemps pour le tourner. |
| Cinder-Boots | Bottes de cendre |
| Thick wooden soles for standing on hot plate, and brass toecaps for a dropped spanner. | D'épaisses semelles de bois pour se tenir sur la tôle chaude, et des embouts de laiton pour une clé qui tombe. |
| Siphoner's Ash-Cape | Cape de cendre de siphonneur |
| Waxed canvas the colour of cold ash, scorched at the hem, fastened with a brass valve-wheel. | De la toile cirée couleur de cendre froide, roussie à l'ourlet, fermée par un volant de vanne en laiton. |
| Rigger's Gauntlets | Gantelets de gréeur |
| Company canvas with riveted leather palms, and a brass tag stamped with somebody else's number. | De la toile de la compagnie aux paumes de cuir rivetées, et une plaque de laiton frappée du numéro de quelqu'un d'autre. |
| Quarry-Hand's Steel-Toes | Coqués de carrier |
| Hobnails with iron toecaps, white with stone dust that never quite brushes off. | Des souliers cloutés à embouts de fer, blancs d'une poussière de pierre qui ne part jamais tout à fait. |
| Works Tarpaulin | Bâche des Ateliers |
| A square of company tarpaulin tied at the throat with cord. CONSORTIUM is stencilled across it in faded red, upside down. | Un carré de bâche de la compagnie noué au col par une cordelette. CONSORTIUM y est peint au pochoir en rouge passé, à l'envers. |
| Works Pavise | Pavois des Ateliers |
| Pit-prop planks bound with strap iron, a stencilled serial, and a brass sighting slot to look through. You could hide a pony behind it. | Des planches d'étai cerclées de feuillard, un matricule au pochoir et une fente de visée en laiton. On pourrait cacher un poney derrière. |
| Corsair's Red Bandana | Bandana rouge de corsaire |
| A sea-faded red headscarf knotted at the back, with a brass ring through one corner. | Un foulard rouge délavé par la mer noué derrière la tête, un anneau de laiton passé dans un coin. |
| Free Captain's Long Coat | Long manteau de Capitaine libre |
| Faded sea-blue to the knee, deep turned-back cuffs, and brass buttons going green with salt. | Bleu de mer délavé jusqu'au genou, de larges parements retournés et des boutons de laiton qui verdissent au sel. |
| Deckhand's Tarred Gloves | Gants goudronnés de matelot |
| Tarred canvas, rope-burned pale across the palm. They smell of every harbour on the coast. | De la toile goudronnée, pâlie à la paume par les brûlures de cordage. Ils sentent tous les ports de la côte. |
| Sea Boots | Bottes de mer |
| Salt-cracked leather to the knee, the tops turned down in a wide cuff. | Du cuir craquelé par le sel jusqu'au genou, le haut rabattu en un large revers. |
| Captain's Boat-Cloak | Manteau de bord de capitaine |
| A heavy navy cloak lined in red, thrown back over one shoulder, with a silver bosun's whistle on a chain. | Un lourd manteau bleu marine doublé de rouge, rejeté sur une épaule, avec un sifflet de maître d'équipage en argent au bout d'une chaîne. |
| Drover's Wide-Awake | Chapeau de bouvier |
| Brown felt gone the shape of the rain, a tally-cord and a sprig of chalk heather in the band. | Du feutre brun qui a pris la forme de la pluie, une cordelette de compte et un brin de bruyère de craie dans le ruban. |
| Fleece Mittens | Moufles de toison |
| Undyed Farrant fleece, the thumb sewn open for the crook. | De la toison de Farrant non teinte, le pouce laissé ouvert pour la houlette. |
| Drover's Plaid | Plaid de bouvier |
| A long plaid checked in chalk and peat, wrapped over the left shoulder and belted. It is a blanket at night. | Un long plaid à carreaux couleur craie et tourbe, drapé sur l'épaule gauche et ceinturé. La nuit, c'est une couverture. |
| Barrow-Warden's Bracers | Brassards de gardien des tertres |
| Bronze arm-rings coiled from the wrist to the elbow, green with age. They came out of a grave, and they are cold. | Des anneaux de bronze enroulés du poignet au coude, verdis par l'âge. Ils sortent d'une tombe, et ils sont froids. |
| Barrow-Warden's Greaves | Jambières de gardien des tertres |
| Bronze shin-guards with spiral bosses at the knee, over wrapped wool leggings. | Des protège-tibias de bronze à bosses spiralées au genou, sur des bandes molletières de laine. |
| Grave-Wool Cloak | Manteau de laine funéraire |
| Earth-grey wool from the Old Fleece, to the ankle, with a bronze ring-brooch as big as a hand. | De la laine gris-terre de la Vieille Toison, jusqu'à la cheville, avec une broche annulaire de bronze grande comme une main. |
| Barrow Round-Shield | Bouclier rond des tertres |
| Bronze over wood in rings of ribs and studs, the boss hollow. Whoever carried it last was buried with it. | Du bronze sur du bois en anneaux de nervures et de clous, l'umbo creux. Le dernier à l'avoir porté a été enterré avec. |
| Lengthsman's Tarred Hat | Chapeau goudronné d'éclusier |
| Low in the crown, with a long back flap to carry the rain off the neck. | Bas de calotte, avec un long rabat arrière pour écarter la pluie de la nuque. |
| Sluice-Keeper's Gauntlets | Gantelets d'éclusier |
| Tarred leather to the forearm, with an iron sluice-key on a thong at the wrist. | Du cuir goudronné jusqu'à l'avant-bras, avec une clé d'écluse en fer pendue à une lanière au poignet. |
| Lengthsman's Oilskin | Ciré d'éclusier |
| A yellow-ochre oilskin shoulder-cape with an iron lantern-hook at the shoulder. Seen a long way off along a cut. | Une pèlerine cirée jaune ocre avec un crochet de lanterne en fer à l'épaule. On la voit de loin le long d'un canal. |
| Antler Crown | Couronne de bois de cerf |
| A band of plaited lime-bark set with two short red-deer tines. In the Galleries it was worn by whoever went in first. | Un bandeau d'écorce de tilleul tressée serti de deux courts andouillers de cerf. Dans les Galeries, le portait celui qui entrait le premier. |
| Reach-Hide Tunic | Tunique de peau des Confins |
| Deer-hide laced down the sides with sinew, the hair left on at the shoulders. It moves like a skin, because it was one. | Du cuir de cerf lacé de tendons sur les côtés, le poil laissé aux épaules. Elle bouge comme une peau, parce qu'elle en était une. |
| Bark-Cord Wraps | Bandes de cordelette d'écorce |
| Hands and wrists wound with strips of lime-bark cord, the fingertips left bare to feel the knap of a flint. | Les mains et les poignets enroulés de bandes de cordelette d'écorce de tilleul, le bout des doigts nu pour sentir la taille d'un silex. |
| Reach Turnshoes | Chaussons retournés des Confins |
| Soft one-piece hide shoes gathered at the ankle with a thong, moss stuffed in the heel. | De souples chaussons de cuir d'une seule pièce, froncés à la cheville par une lanière, de la mousse au talon. |
| Red-Deer Pelt | Peau de cerf |
| A red deer's hide over the shoulders, fur out, the forelegs knotted at the chest. | La peau d'un cerf sur les épaules, poil dehors, les pattes avant nouées sur la poitrine. |
| Felted Sling | Fronde feutrée |
| A Hedge-weaver's sling, pouch and cords all felted wool. It makes no sound in the swing, and the stone makes very little when it lands. Uses sling stones. | La fronde d'un tisserand de la Haie, poche et cordons tout en laine feutrée. Elle ne fait aucun bruit quand elle tourne, et la pierre en fait très peu en touchant. Tire des pierres de fronde. |
| Shepherd's Sling | Fronde de berger |
| Plaited Farrant fleece and a leather pouch. A drover can put a chalk-flint past a ewe's ear to turn her at forty paces. Uses sling stones. | De la toison de Farrant tressée et une poche de cuir. Un bouvier sait faire passer un silex de craie au ras de l'oreille d'une brebis pour la faire tourner à quarante pas. Tire des pierres de fronde. |
| Office Carbine | Carabine de l'Office |
| A proctor's long gun: oilcloth wound on the stock, a blued barrel, and for a front sight a little brass fork tuned to 741. Glass shot. Two hands, so no shield. | Le long fusil d'un Procureur : de la toile cirée enroulée sur la crosse, un canon bleui, et pour guidon une petite fourche de laiton accordée sur 741. Grenaille de verre. À deux mains, donc pas de bouclier. |
| Works Hand-Crossbow | Arbalète de poing des Ateliers |
| A short steel prod on a pit-prop stock, spanned with one pull, with a brass tag that says it belongs to the Consortium. Uses quarrels. | Un court arc d'acier sur un fût de bois d'étai, armé d'une seule traction, avec une plaque de laiton qui dit qu'elle appartient au Consortium. Tire des carreaux. |
| Harpoon Gun | Fusil harpon |
| A fat bronze tube that throws a barbed iron head on a tarred line. Made for whatever swims under the Rust Coast piers. Slow to load. Two hands, so no shield. | Un gros tube de bronze qui lance une tête de fer barbelée au bout d'une ligne goudronnée. Fait pour ce qui nage sous les jetées de la Côte de Rouille. Lent à recharger. À deux mains, donc pas de bouclier. |
| Hornbow | Arc de corne |
| A short bow of horn and sinew on yew, recurved, from the Antler Galleries. Flint-headed arrows. Two hands, so no shield. | Un arc court de corne et de tendon sur de l'if, recourbé, venu des Galeries de Bois-de-Cerf. Flèches à pointe de silex. À deux mains, donc pas de bouclier. |
| Sling Stones (×8) | Pierres de fronde (×8) |
| Round river stones and chalk-flints, picked for the pouch. | Des galets ronds de rivière et des silex de craie, choisis pour la poche. |
| Quarrels (×8) | Carreaux (×8) |
| Short iron bolts for a hand-crossbow, Works issue. | De courts carreaux de fer pour arbalète de poing, fournis par les Ateliers. |
| Harpoons (×3) | Harpons (×3) |
| Barbed iron heads on tarred line, for the harpoon gun. | Des têtes de fer barbelées sur ligne goudronnée, pour le fusil harpon. |
| Flint Arrows (×10) | Flèches de silex (×10) |
| Birch shafts, goose fletching, knapped flint heads. | Des fûts de bouleau, un empennage d'oie, des pointes de silex taillé. |
| No sling stones. Any river has them; a drover will sell you a pouchful. | Plus de pierres de fronde. N'importe quelle rivière en a ; un bouvier vous en vendra une poche pleine. |
| You fill the pouch-bag with stones. | Vous remplissez la bourse de pierres. |
| No quarrels. The Works stores have them, if you can get in. | Plus de carreaux. Les magasins des Ateliers en ont, si vous pouvez y entrer. |
| You load your quarrels. | Vous chargez vos carreaux. |
| No harpoons. A Free Captain's chandler sells them. | Plus de harpons. L'avitailleur d'un Capitaine libre en vend. |
| You coil the harpoon lines. | Vous lovez les lignes des harpons. |
| No arrows. The Reach-folk fletch them; so can a patient hand. | Plus de flèches. Les gens des Confins les empennent ; une main patiente le peut aussi. |
| You fill your quiver with arrows. | Vous remplissez votre carquois de flèches. |
