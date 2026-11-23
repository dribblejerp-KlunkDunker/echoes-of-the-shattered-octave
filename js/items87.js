// ============================================================
//  items87 — Phase 87 (c): the new pieces of the fourteen sets, made in code (data, pack pictures, French). Each piece
//  has its own look from the world of the Shattered Octave (owner, 14 Nov: "I do want each weapon to have its own cool and
//  unique look that represents the world that the shattered octave resides in"). Its card and first-person looks are in
//  js/gearlook21.js and js/fp87.js. Loads before js/gear87.js, so the starting kits find what it makes.
//  Every name, number and line here is [PROPOSED] under the approved design.
// ============================================================
'use strict';

const ITEMS87 = (function () {
  const TEXTS = [], S = (t) => { TEXTS.push(t); return t; };
  const TX = {
    sledgeName: S('Night-Shift Sledge'),
    sledgeDesc: S('A quarry-hand\'s sledge from the Oakhaven works: a stone-splitter\'s head on a short ash haft, a brass Consortium tag nailed on with a number that is not yours, and a red rag at the neck so it can be found in the dark.'),
  };
  // ---------------------------------------------------------------- armour: the fifty-two new pieces, set by set
  // [id, slot, name, ar, noise, value, description]
  const A = (id, slot, name, ar, noise, value, desc) => [id, slot, S(name), ar, noise, value, S(desc)];
  const PIECES = [
    // Tanner's Row (Oakhaven)
    A('a_p87_tan_cape', 'cape', 'Tanner\'s Shoulder-Cape', 1, 0, 18, 'Oiled hide cut short at the waist, with Jabez Barker\'s scraper-mark burned in at the throat and a bone toggle. Rain runs off it like off a roof.'),
    A('a_p87_tan_shield', 'shield', 'Barker\'s Hide Targe', 2, 0.1, 22, 'A round board faced with three layers of boiled hide, laced at the rim with rawhide and set with brass tacks in a spiral. Light enough to forget you carry it.'),
    // the Hedge-weavers' Hush (the Hedge)
    A('a_p87_hush_mitts', 'hands', 'Hush-Cloth Mitts', 1, -0.2, 14, 'Felted Hedge wool, the fingers split for a knife and a sling-cord. Your hands make no sound against anything.'),
    A('a_p87_hush_cloak', 'cape', 'Hedge-Weaver\'s Cloak', 0, -0.3, 40, 'Packed wool to the calf, bordered with the weavers\' thorn pattern. The hood is deep enough to sleep in.'),
    // the Synod Registry (Fortis)
    A('a_p87_reg_biretta', 'head', 'Registry Biretta', 1, 0, 22, 'A square grey cap with three ridges and a silver tassel. Inside the band, in another clerk\'s hand, a number that was never yours.'),
    A('a_p87_reg_cuffs', 'hands', 'Clerk\'s Ink-Cuffs', 1, -0.1, 12, 'Fingerless black kid and oilcloth sleeve-guards, stained with lamp-black, with a silver RECONCILIATION pin. Clerks nod to them.'),
    A('a_p87_reg_shoes', 'feet', 'Registry Buckle-Shoes', 1, -0.1, 16, 'Black low shoes with square silver buckles and felted soles for the long corridors. They make a person look expected.'),
    A('a_p87_reg_cape', 'cape', 'Registry Tippet', 0, 0, 24, 'A clerk\'s short grey shoulder-cape, edged with silver braid and fastened with a small silver seal.'),
    // the Synod Arsenal (Fortis)
    A('a_p87_ars_sallet', 'head', 'Arsenal Sallet', 4, 0.4, 38, 'Synod steel with a long tail over the neck and a visor that lifts. An arsenal stamp, a number, and an oxblood plume-tube with no plume.'),
    A('a_p87_ars_cape', 'cape', 'Arsenal Half-Cloak', 1, 0.1, 30, 'Oxblood wool worn on the left shoulder, pinned with a steel brooch of the dead queen\'s head.'),
    // the Carillon Legion
    A('a_p87_leg_vambraces', 'hands', 'Carillon Vambraces', 3, 0.4, 34, 'Bell-bronze over leaded gloves. A line of the bell\'s inscription runs round each one: half a name, with verdigris in the letters.'),
    A('a_p87_leg_sabatons', 'feet', 'Carillon Sabatons', 3, 0.6, 34, 'Bronze foot-plates over lead-soled boots. Every legionnaire wears lead. On stone they toll.'),
    A('a_p87_leg_pennon', 'cape', 'Legion Bell-Pennon', 0, 0.2, 36, 'A narrow banner of faded verdigris cloth hung from the shoulders, a dead name stitched down it and a small bronze bell sewn to the tail.'),
    A('a_p87_leg_shield', 'shield', 'Carillon Bell-Shield', 4, 0.6, 48, 'The lip of a cracked bell, cut flat and hammered round. The inscription still runs about the rim. Struck, it answers.'),
    // the Office's Proctors
    A('a_p87_pro_hood', 'head', 'Proctor\'s Mesh Hood', 2, -0.1, 30, 'Grey oilcloth, with silver mesh over the face. Nobody looking at it sees who is inside, which is the point.'),
    A('a_p87_pro_coat', 'body', 'Proctor\'s Oilcloth', 4, -0.2, 46, 'The long grey coat of the Catalogue field staff, with a felted collar and covered buttons, so a proctor can stand an hour and make no sound.'),
    A('a_p87_pro_gloves', 'hands', 'Proctor\'s Felted Gloves', 1, -0.3, 22, 'Grey gloves felted on the palm, so a rod does not slip and a fork does not ring until it is meant to.'),
    A('a_p87_pro_boots', 'feet', 'Proctor\'s Field Boots', 2, -0.3, 26, 'Grey oilcloth to the knee on felt soles. They stand still for an hour without a creak.'),
    A('a_p87_pro_cape', 'cape', 'Proctor\'s Rain-Cape', 1, -0.1, 28, 'Grey oilcloth to the hip. Inside, painted in white, a Catalogue index number.'),
    // the Cantors (Oakhaven and the Howe)
    A('a_p87_can_cowl', 'head', 'Cantor\'s Cowl', 1, -0.1, 20, 'Soft plum wool folded to the shoulders and left open about the ears, so they are free to listen. A brass fork-pin holds it at the throat.'),
    A('a_p87_can_cassock', 'body', 'Cantor\'s Cassock', 2, -0.2, 36, 'Dusty plum to the ankle, a row of small horn buttons, and the staves of a hymn stitched round the hem in cream.'),
    A('a_p87_can_sandals', 'feet', 'Pilgrim\'s Sandals', 1, -0.3, 10, 'Leather sandals over grey wool socks. The road to the Howe is walked, not ridden.'),
    A('a_p87_can_mantle', 'cape', 'Cantor\'s Choir-Mantle', 0, -0.1, 34, 'A cream shoulder-mantle with the five lines of a stave stitched round the hem in plum. A choir wears them so the back row can find its place.'),
    // the Siphon Corps (Cinderhold)
    A('a_p87_sip_goggles', 'head', 'Siphoner\'s Smoked Goggles', 2, 0, 28, 'A scorched leather skullcap with smoked-glass goggles in brass cups, pushed up on the brow until the furnace door opens.'),
    A('a_p87_sip_apron', 'body', 'Furnace-Apron', 5, 0.2, 44, 'Heavy scorched hide to the shin, a brass pressure-badge on the bib. The Corps wears them rolled-sleeved and sweating.'),
    A('a_p87_sip_gauntlets', 'hands', 'Siphoner\'s Heat-Gauntlets', 2, 0.1, 30, 'Quilted hide to the elbow, scorched black at the fingertips. You can hold a hot valve-wheel long enough to turn it.'),
    A('a_p87_sip_boots', 'feet', 'Cinder-Boots', 2, 0.3, 24, 'Thick wooden soles for standing on hot plate, and brass toecaps for a dropped spanner.'),
    A('a_p87_sip_cape', 'cape', 'Siphoner\'s Ash-Cape', 1, 0, 26, 'Waxed canvas the colour of cold ash, scorched at the hem, fastened with a brass valve-wheel.'),
    // the Consortium Works (Oakhaven's quarry)
    A('a_p87_wks_gauntlets', 'hands', 'Rigger\'s Gauntlets', 2, 0.3, 26, 'Company canvas with riveted leather palms, and a brass tag stamped with somebody else\'s number.'),
    A('a_p87_wks_boots', 'feet', 'Quarry-Hand\'s Steel-Toes', 2, 0.4, 18, 'Hobnails with iron toecaps, white with stone dust that never quite brushes off.'),
    A('a_p87_wks_cape', 'cape', 'Works Tarpaulin', 1, 0.2, 16, 'A square of company tarpaulin tied at the throat with cord. CONSORTIUM is stencilled across it in faded red, upside down.'),
    A('a_p87_wks_pavise', 'shield', 'Works Pavise', 5, 0.6, 40, 'Pit-prop planks bound with strap iron, a stencilled serial, and a brass sighting slot to look through. You could hide a pony behind it.'),
    // the Free Captains
    A('a_p87_cap_bandana', 'head', 'Corsair\'s Red Bandana', 0, -0.1, 8, 'A sea-faded red headscarf knotted at the back, with a brass ring through one corner.'),
    A('a_p87_cap_coat', 'body', 'Free Captain\'s Long Coat', 4, 0.1, 50, 'Faded sea-blue to the knee, deep turned-back cuffs, and brass buttons going green with salt.'),
    A('a_p87_cap_gloves', 'hands', 'Deckhand\'s Tarred Gloves', 1, 0, 10, 'Tarred canvas, rope-burned pale across the palm. They smell of every harbour on the coast.'),
    A('a_p87_cap_boots', 'feet', 'Sea Boots', 2, 0.1, 20, 'Salt-cracked leather to the knee, the tops turned down in a wide cuff.'),
    A('a_p87_cap_cape', 'cape', 'Captain\'s Boat-Cloak', 1, 0, 34, 'A heavy navy cloak lined in red, thrown back over one shoulder, with a silver bosun\'s whistle on a chain.'),
    // the Drovers (the Farrant downs)
    A('a_p87_dro_hat', 'head', 'Drover\'s Wide-Awake', 1, 0, 12, 'Brown felt gone the shape of the rain, a tally-cord and a sprig of chalk heather in the band.'),
    A('a_p87_dro_mittens', 'hands', 'Fleece Mittens', 1, -0.1, 10, 'Undyed Farrant fleece, the thumb sewn open for the crook.'),
    A('a_p87_dro_plaid', 'cape', 'Drover\'s Plaid', 1, -0.1, 24, 'A long plaid checked in chalk and peat, wrapped over the left shoulder and belted. It is a blanket at night.'),
    // the Barrow-wardens
    A('a_p87_bar_bracers', 'hands', 'Barrow-Warden\'s Bracers', 2, 0.2, 40, 'Bronze arm-rings coiled from the wrist to the elbow, green with age. They came out of a grave, and they are cold.'),
    A('a_p87_bar_greaves', 'feet', 'Barrow-Warden\'s Greaves', 3, 0.4, 44, 'Bronze shin-guards with spiral bosses at the knee, over wrapped wool leggings.'),
    A('a_p87_bar_cloak', 'cape', 'Grave-Wool Cloak', 0, -0.3, 46, 'Earth-grey wool from the Old Fleece, to the ankle, with a bronze ring-brooch as big as a hand.'),
    A('a_p87_bar_shield', 'shield', 'Barrow Round-Shield', 3, 0.3, 52, 'Bronze over wood in rings of ribs and studs, the boss hollow. Whoever carried it last was buried with it.'),
    // the Flume (the lengthsmen)
    A('a_p87_flu_cap', 'head', 'Lengthsman\'s Tarred Hat', 1, 0, 12, 'Low in the crown, with a long back flap to carry the rain off the neck.'),
    A('a_p87_flu_gloves', 'hands', 'Sluice-Keeper\'s Gauntlets', 2, 0, 22, 'Tarred leather to the forearm, with an iron sluice-key on a thong at the wrist.'),
    A('a_p87_flu_cape', 'cape', 'Lengthsman\'s Oilskin', 1, 0, 24, 'A yellow-ochre oilskin shoulder-cape with an iron lantern-hook at the shoulder. Seen a long way off along a cut.'),
    // the Old Reach (the Deep Grove and the Antler Galleries)
    A('a_p87_old_crown', 'head', 'Antler Crown', 1, 0, 40, 'A band of plaited lime-bark set with two short red-deer tines. In the Galleries it was worn by whoever went in first.'),
    A('a_p87_old_hide', 'body', 'Reach-Hide Tunic', 4, -0.3, 42, 'Deer-hide laced down the sides with sinew, the hair left on at the shoulders. It moves like a skin, because it was one.'),
    A('a_p87_old_wraps', 'hands', 'Bark-Cord Wraps', 1, -0.2, 14, 'Hands and wrists wound with strips of lime-bark cord, the fingertips left bare to feel the knap of a flint.'),
    A('a_p87_old_shoes', 'feet', 'Reach Turnshoes', 1, -0.3, 14, 'Soft one-piece hide shoes gathered at the ankle with a thong, moss stuffed in the heel.'),
    A('a_p87_old_pelt', 'cape', 'Red-Deer Pelt', 1, -0.2, 32, 'A red deer\'s hide over the shoulders, fur out, the forelegs knotted at the chest.'),
  ];
  const ARMOR87 = {};
  for (const [id, slot, name, ar, noise, value, desc] of PIECES) ARMOR87[id] = { name, slot, ar, noise, value, desc };
  // ---------------------------------------------------------------- weapons
  const WEAPONS87 = {
    // the Quarry-Hand's own (owner, 14 Nov: "make a lighter quarry sledge"): one hand, quicker and lighter than the Great-Maul
    p87_sledge: { name: TX.sledgeName, img: 'fp_mace', dmg: [6, 13], reach: 1.25, noise: 2.4, speed: 0.62, type: 'iron', blunt: true, value: 28, desc: TX.sledgeDesc },
    // Phase 87 (d): the six ranged weapons of the sets, with their own shot. Stones are dumb iron to the Cacophony and good
    // inside a Quiet; the carbine fires glass shot like the pistol; quarrels, harpoons and arrows fly as bolts do
    p87_feltsling: { name: S('Felted Sling'), img: 'fp_pistol', dmg: [4, 9], reach: 8, noise: 0.4, speed: 0.85, type: 'iron', blunt: true, ranged: true, ammo: 'stones', value: 18,
      desc: S('A Hedge-weaver\'s sling, pouch and cords all felted wool. It makes no sound in the swing, and the stone makes very little when it lands. Uses sling stones.') },
    p87_sling: { name: S('Shepherd\'s Sling'), img: 'fp_pistol', dmg: [5, 11], reach: 9, noise: 1.0, speed: 0.9, type: 'iron', blunt: true, ranged: true, ammo: 'stones', value: 14,
      desc: S('Plaited Farrant fleece and a leather pouch. A drover can put a chalk-flint past a ewe\'s ear to turn her at forty paces. Uses sling stones.') },
    p87_carbine: { name: S('Office Carbine'), img: 'fp_crossbow', center: true, dmg: [12, 22], reach: 12, noise: 5.2, speed: 1.3, type: 'shot', ranged: true, ammo: 'pellets', twoHanded: true, value: 85,
      desc: S('A proctor\'s long gun: oilcloth wound on the stock, a blued barrel, and for a front sight a little brass fork tuned to 741. Glass shot. Two hands, so no shield.') },
    p87_handbow: { name: S('Works Hand-Crossbow'), img: 'fp_crossbow', dmg: [6, 12], reach: 8, noise: 1.1, speed: 1.0, type: 'bolt', ranged: true, ammo: 'quarrels', value: 40,
      desc: S('A short steel prod on a pit-prop stock, spanned with one pull, with a brass tag that says it belongs to the Consortium. Uses quarrels.') },
    p87_harpoon: { name: S('Harpoon Gun'), img: 'fp_crossbow', center: true, dmg: [14, 26], reach: 9, noise: 3.0, speed: 1.8, type: 'bolt', ranged: true, ammo: 'harpoons', twoHanded: true, value: 90,
      desc: S('A fat bronze tube that throws a barbed iron head on a tarred line. Made for whatever swims under the Rust Coast piers. Slow to load. Two hands, so no shield.') },
    p87_hornbow: { name: S('Hornbow'), img: 'fp_crossbow', center: true, dmg: [7, 15], reach: 13, noise: 0.8, speed: 1.05, type: 'bolt', ranged: true, ammo: 'arrows', twoHanded: true, value: 60,
      desc: S('A short bow of horn and sinew on yew, recurved, from the Antler Galleries. Flint-headed arrows. Two hands, so no shield.') },
  };
  // their shot, sold and found by the bundle
  const AMMO87 = {
    stones: { name: S('Sling Stones (×8)'), sprite: 'loot', use: 'ammo', ammo: 'stones', n: 8, value: 1, desc: S('Round river stones and chalk-flints, picked for the pouch.') },
    quarrels: { name: S('Quarrels (×8)'), sprite: 'loot', use: 'ammo', ammo: 'quarrels', n: 8, value: 5, desc: S('Short iron bolts for a hand-crossbow, Works issue.') },
    harpoons: { name: S('Harpoons (×3)'), sprite: 'loot', use: 'ammo', ammo: 'harpoons', n: 3, value: 9, desc: S('Barbed iron heads on tarred line, for the harpoon gun.') },
    arrows: { name: S('Flint Arrows (×10)'), sprite: 'loot', use: 'ammo', ammo: 'arrows', n: 10, value: 6, desc: S('Birch shafts, goose fletching, knapped flint heads.') },
  };
  const AMMO_TX = {
    stones: { none: S('No sling stones. Any river has them; a drover will sell you a pouchful.'), load: S('You fill the pouch-bag with stones.') },
    quarrels: { none: S('No quarrels. The Works stores have them, if you can get in.'), load: S('You load your quarrels.') },
    harpoons: { none: S('No harpoons. A Free Captain\'s chandler sells them.'), load: S('You coil the harpoon lines.') },
    arrows: { none: S('No arrows. The Reach-folk fletch them; so can a patient hand.'), load: S('You fill your quiver with arrows.') },
  };
  function register() {
    if (typeof WEAPONS === 'undefined' || typeof ITEMS === 'undefined') return;
    if (typeof ARMOR !== 'undefined') for (const id in ARMOR87) {
      if (!ARMOR[id]) ARMOR[id] = Object.assign({}, ARMOR87[id]);
      if (!ITEMS[id]) ITEMS[id] = Object.assign({ sprite: 'gear', armor: true }, ARMOR87[id]);
    }
    for (const id in AMMO87) if (!ITEMS[id]) ITEMS[id] = Object.assign({}, AMMO87[id]);
    for (const id in WEAPONS87) {
      if (!WEAPONS[id]) WEAPONS[id] = Object.assign({}, WEAPONS87[id]);
      if (!ITEMS['w_' + id]) ITEMS['w_' + id] = { name: WEAPONS87[id].name, sprite: 'gear', weapon: id, value: WEAPONS87[id].value, desc: WEAPONS87[id].desc };
    }
    icons();
  }
  // ---------------------------------------------------------------- the armour's pack pictures (24 by 24, by hand)
  // One drawing per piece, each with its own mark of where it comes from: Barker's scraper-mark, the weavers' thorn
  // border, the clerk's silver tassel, the dead queen's brooch, the bell's inscription, the Office's mesh, the stave
  // of a hymn, the Corps' brass valve, the Consortium stencil, the salt-green buttons, the chalk-and-peat check, the
  // barrow's spiral, the lengthsman's lantern-hook, the red deer's tines.
  function armourIcons() {
    const P = ICONS.PIX;
    const garment = (L, bot, sl) => { const s = sl || 14; L.poly([8, 4, 16, 4, 20, 6, 22, s, 19, s + 1, 17, 10, 17.5, bot, 6.5, bot, 7, 10, 5, s + 1, 2, s, 4, 6]); return L.cut().poly([10, 3.6, 14, 3.6, 12, 7]).add(); };
    const boot = (L, x, top) => L.rect(x, top, 5, 17 - top).rect(x, 15, 9, 4).px(x + 9, 17, x + 9, 18);
    const glove = (L, x) => L.rect(x, 9, 6, 8).rect(x, 4, 1, 6).rect(x + 2, 3, 1, 6).rect(x + 4, 4, 1, 6).rect(x + 5, 6, 1, 4).rect(x - 1, 10, 1, 4).rect(x, 17, 6, 4);
    const mitt = (L, x) => L.ell(x + 3, 8.5, 3.2, 5).rect(x, 8, 6, 9).rect(x - 1, 10, 1, 4).rect(x, 17, 6, 4);
    const capeBack = (L, bot, wide) => { const w = wide || 0; return L.poly([9, 3, 15, 3, 18 + w * 0.3, 6, 20.5 + w, bot, 3.5 - w, bot, 6 - w * 0.3, 6]); };
    const shoulders = (L, bot) => L.poly([9, 4, 15, 4, 21, 8, 22.5, bot, 1.5, bot, 3, 8]).cut().poly([10.5, 4, 13.5, 4, 12, 7]).add();
    const set = (id, fn) => { if (!Object.prototype.hasOwnProperty.call(P, id)) P[id] = fn; };

    // ---- Tanner's Row
    set('a_p87_tan_cape', (d) => {   // a short oiled-hide cape, the scraper-mark burned at the throat, a bone toggle
      shoulders(d.layer('#74482a', { shiny: 1 }), 16);
      d.layer('#4e2e1a').rect(3, 15, 18, 2);
      d.layer('#e4d6b4').rect(10, 7, 4, 2);
      d.mark('#2a1a10', 11, 10, 12, 11, 13, 10);
    });
    set('a_p87_tan_shield', (d) => {   // the hide targe: brass tacks in a spiral, rawhide lacing round the rim
      d.layer('#94683e').ell(12, 12, 10, 10);
      d.layer('#d6c4a0').ell(12, 12, 10, 10).cut().ell(12, 12, 8.8, 8.8).add();
      d.layer('#c9a040', { shiny: 1 }).ell(12, 12, 2.4, 2.4);
      d.mark('#e8c868', 12, 7, 16, 9, 17, 13, 15, 16, 11, 17, 8, 15, 7, 11, 9, 8, 12, 4, 19, 8, 20, 14, 17, 19, 11, 20, 5, 17, 4, 10);
      d.mark('#5a3a20', 4, 6, 6, 4, 18, 4, 20, 6, 20, 18, 18, 20, 6, 20, 4, 18);
    });
    // ---- the Hedge-weavers' Hush
    set('a_p87_hush_mitts', (d) => {   // felted Hedge-wool mitts, the fingers split in two
      mitt(d.layer('#3c5a54'), 3); mitt(d.layer('#4c6e66'), 14);
      d.layer('#2a403c', { shade: 'flat', sep: false }).rect(6, 4, 1, 5).rect(17, 4, 1, 5);
      d.layer('#6e8e84').rect(3, 17, 6, 1).rect(14, 17, 6, 1);
    });
    set('a_p87_hush_cloak', (d) => {   // packed wool to the calf, the weavers' thorn border, the hood thrown back
      capeBack(d.layer('#32483f'), 22, 1);
      d.layer('#3e584e').ell(12, 5.5, 4.5, 3.2);
      d.layer('#7a6a46').rect(3, 20, 18, 2);
      d.mark('#b8a06a', 4, 20, 6, 21, 8, 20, 10, 21, 12, 20, 14, 21, 16, 20, 18, 21, 20, 20);
    });
    // ---- the Synod Registry
    set('a_p87_reg_biretta', (d) => {   // a square grey cap, three ridges, a silver tassel
      d.layer('#767e82').rect(4, 10, 16, 9);
      d.layer('#8c9498').poly([4, 10, 7, 6, 12, 5, 17, 6, 20, 10]);
      d.layer('#5c6266').rect(11, 5, 2, 6).rect(5, 8, 2, 3).rect(17, 8, 2, 3);
      d.layer('#d8d8c8', { shiny: 1 }).ell(12, 4, 2, 2).rect(11, 1, 2, 2);
      d.layer('#4a5054').rect(4, 17, 16, 2);
    });
    set('a_p87_reg_cuffs', (d) => {   // fingerless black kid on oilcloth sleeve-guards, a silver pin
      const g = (x) => { const L = d.layer('#3a3a40'); L.rect(x, 7, 6, 10).rect(x - 1, 10, 1, 4); L.tone(1, x + 1, 7, x + 3, 7); return L; };
      g(4); g(14);
      d.layer('#c99272').rect(4, 4, 6, 3).rect(14, 4, 6, 3);
      d.layer('#5c5e64', { shiny: 1 }).rect(3, 17, 8, 5).rect(13, 17, 8, 5);
      d.mark('#e8e8dc', 7, 19, 17, 19);
    });
    set('a_p87_reg_shoes', (d) => {   // black low shoes, square silver buckles
      const sh = (x) => d.layer('#2c2a30', { shiny: 1 }).rect(x, 12, 5, 5).rect(x, 15, 9, 4).px(x + 9, 17, x + 9, 18);
      sh(2); sh(12);
      d.layer('#d6d6c6', { shiny: 1 }).rect(5, 14, 3, 3).rect(15, 14, 3, 3);
      d.mark('#2c2a30', 6, 15, 16, 15);
      d.layer('#8a8a90').rect(2, 19, 10, 1).rect(12, 19, 10, 1);
    });
    set('a_p87_reg_cape', (d) => {   // a grey tippet edged in silver braid, a small silver seal
      shoulders(d.layer('#7a8082'), 15);
      d.layer('#d4d4c4', { shiny: 1 }).rect(2, 14, 20, 2);
      d.layer('#e0e0d0', { shiny: 1 }).ell(12, 9, 1.8, 1.8);
    });
    // ---- the Synod Arsenal
    set('a_p87_ars_sallet', (d) => {   // a long tail over the neck, the visor lifted, an oxblood plume-tube
      d.layer('#9aa2aa', { shiny: 1 }).poly([5, 15, 6, 8, 10, 4, 15, 4, 19, 8, 21, 14, 23, 19, 17, 17, 5, 17]);
      d.layer('#6c747c').rect(4, 11, 13, 3);
      d.layer('#1e1a1a', { shade: 'flat', sep: false }).rect(6, 12, 9, 1);
      d.layer('#7a3028').rect(17, 1, 2, 4);
      d.mark('#f4f6f6', 9, 6, 10, 5); d.mark('#4a5058', 8, 16, 11, 16, 14, 16);
    });
    set('a_p87_ars_cape', (d) => {   // an oxblood half-cloak, the dead queen's head on a steel brooch
      d.layer('#6a2a26').poly([4, 4, 12, 3, 16, 7, 18, 21, 4, 21, 2, 8]);
      d.layer('#4c1c1a').poly([12, 3, 16, 7, 18, 21, 15, 21, 13, 8]);
      d.layer('#b8c0c4', { shiny: 1 }).ell(7, 7, 2.6, 2.6);
      d.mark('#e6dcc0', 7, 6, 7, 7, 8, 7, 7, 8); d.mark('#d8aa50', 6, 5, 8, 5);
    });
    // ---- the Carillon Legion
    set('a_p87_leg_vambraces', (d) => {   // bell-bronze vambraces over leaded gloves, the inscription in verdigris
      const v = (x) => { d.layer('#b28640', { shiny: 1 }).rect(x, 4, 6, 12); d.layer('#5c6268').rect(x, 16, 6, 5).rect(x - 1, 17, 1, 3); };
      v(4); v(14);
      d.mark('#5c8a72', 5, 8, 7, 8, 9, 8, 15, 8, 17, 8, 19, 8, 6, 11, 8, 11, 16, 11, 18, 11);
      d.mark('#f2d890', 5, 5, 15, 5);
    });
    set('a_p87_leg_sabatons', (d) => {   // bronze foot-plates in lames over lead soles
      boot(d.layer('#a8803e', { shiny: 1 }), 3, 6); boot(d.layer('#b88e48', { shiny: 1 }), 11, 7);
      d.layer('#6a4a20').rect(3, 10, 5, 1).rect(3, 13, 5, 1).rect(8, 15, 1, 4).rect(11, 11, 5, 1).rect(11, 14, 5, 1).rect(16, 15, 1, 4);
      d.layer('#585c62').rect(3, 19, 10, 2).rect(11, 19, 10, 2);
    });
    set('a_p87_leg_pennon', (d) => {   // a narrow verdigris banner, a dead name stitched down it, a bronze bell at the tail
      d.layer('#9a7838', { shiny: 1 }).rect(4, 2, 16, 2);
      d.layer('#4e7a64').poly([9, 4, 15, 4, 15, 20, 12, 17, 9, 20]);
      d.mark('#c8d8c8', 12, 6, 12, 7, 11, 9, 12, 10, 13, 12, 12, 13, 12, 15);
      d.layer('#c99a48', { shiny: 1 }).poly([10, 19, 14, 19, 15, 22, 9, 22]);
    });
    set('a_p87_leg_shield', (d) => {   // a cracked bell's lip hammered round, the inscription running about the rim
      d.layer('#b08440', { shiny: 1 }).ell(12, 12, 10, 10);
      d.layer('#86642e').ell(12, 12, 10, 10).cut().ell(12, 12, 8.8, 8.8).add();
      d.layer('#d8b46a', { shiny: 1 }).ell(12, 12, 3, 3);
      d.mark('#5c8a72', 9, 4, 11, 4, 14, 4, 17, 6, 19, 9, 20, 12, 19, 16, 16, 19, 12, 20, 8, 19, 5, 16, 4, 12, 5, 8, 7, 5);
      d.mark('#2a1c10', 15, 15, 16, 16, 17, 16, 18, 17);
    });
    // ---- the Office's Proctors
    set('a_p87_pro_hood', (d) => {   // grey oilcloth, silver mesh over the face
      d.layer('#6e7476').poly([12, 2, 17, 4, 19.5, 10, 20, 17, 21.5, 21, 2.5, 21, 4, 17, 4.5, 10, 7, 4]);
      const m = d.layer('#b8c0c6', { shiny: 1, sep: false }).ell(12, 12.5, 4.4, 5.6);
      for (let y = 7; y < 19; y++) for (let x = 7; x < 17; x++) if (((x + y) & 1) === 0) m.tone(1, x, y);
      d.layer('#6e7476').rect(6, 18, 12, 3);
    });
    set('a_p87_pro_coat', (d) => {   // the field staff's long grey oilcloth, a felted collar, covered buttons
      garment(d.layer('#6c7274', { shiny: 1 }), 22, 19);
      d.layer('#545a5c').poly([8, 4, 16, 4, 15, 7, 12, 9, 9, 7]);
      d.layer('#4a5052').rect(12, 8, 1, 14);
    });
    set('a_p87_pro_gloves', (d) => {   // grey gloves felted on the palm
      glove(d.layer('#62666a'), 4); glove(d.layer('#74787c'), 13);
      d.layer('#46484c', { shade: 'flat', sep: false }).rect(5, 11, 4, 4).rect(14, 11, 4, 4);
    });
    set('a_p87_pro_boots', (d) => {   // grey oilcloth to the knee, felt soles
      boot(d.layer('#5c6266', { shiny: 1 }), 3, 2); boot(d.layer('#6c7276', { shiny: 1 }), 11, 3);
      d.layer('#8a8478').rect(3, 19, 10, 1).rect(11, 19, 10, 1);
      d.layer('#4a5054').rect(3, 2, 5, 1).rect(11, 3, 5, 1);
    });
    set('a_p87_pro_cape', (d) => {   // grey oilcloth to the hip, an index number painted inside in white
      shoulders(d.layer('#6a7072', { shiny: 1 }), 21);
      d.layer('#ecece4', { shade: 'flat' }).rect(9, 14, 1, 4).rect(11, 14, 2, 1).rect(12, 15, 1, 1).rect(11, 16, 1, 2).rect(14, 14, 2, 4);
    });
    // ---- the Cantors
    set('a_p87_can_cowl', (d) => {   // soft plum wool folded to the shoulders, the ears free, a brass fork-pin
      d.layer('#5e4a64').poly([12, 4, 17, 6, 18.5, 11, 22, 20, 2, 20, 5.5, 11, 7, 6]);
      d.layer('#2a2028', { shade: 'flat', sep: false }).ell(12, 12, 4.4, 5.2);
      d.layer('#6e5876').rect(3, 17, 18, 4);
      d.layer('#c8a040', { shiny: 1 }).rect(11, 16, 1, 3).rect(13, 16, 1, 3).rect(11, 19, 3, 1);
    });
    set('a_p87_can_cassock', (d) => {   // dusty plum to the ankle, horn buttons, the stave of a hymn round the hem
      garment(d.layer('#5c4862'), 22, 19);
      for (let y = 6; y < 20; y += 2) d.mark('#d8ccb0', 12, y);
      d.layer('#4a3a50').rect(7, 18, 10, 4);
      d.mark('#e0d4b8', 7, 18, 8, 18, 9, 18, 10, 18, 11, 18, 13, 18, 14, 18, 15, 18, 16, 18, 7, 20, 8, 20, 9, 20, 10, 20, 11, 20, 13, 20, 14, 20, 15, 20, 16, 20, 9, 19, 14, 21);
    });
    set('a_p87_can_sandals', (d) => {   // leather sandals over grey wool socks
      boot(d.layer('#9a948c'), 3, 9); boot(d.layer('#aaa49a'), 11, 10);
      d.layer('#7e5a36').rect(3, 19, 10, 1).rect(11, 19, 10, 1).rect(3, 15, 6, 1).rect(11, 15, 6, 1).rect(6, 17, 6, 1).rect(14, 17, 6, 1).rect(3, 12, 5, 1).rect(11, 13, 5, 1);
    });
    set('a_p87_can_mantle', (d) => {   // a cream choir-mantle, the five lines of a stave in plum round the hem
      shoulders(d.layer('#cec2aa'), 17);
      for (const y of [12, 13.5, 15]) d.layer('#5e4a64', { shade: 'flat', sep: false }).rect(2, Math.round(y), 20, 1);
      d.mark('#3a2c40', 6, 12, 9, 14, 14, 13, 18, 15);
    });
    // ---- the Siphon Corps
    set('a_p87_sip_goggles', (d) => {   // a scorched leather skullcap, smoked goggles in brass cups pushed up
      const c = d.layer('#583a28').ell(12, 14, 7.5, 7).cut().rect(0, 14, 24, 10).add().rect(5, 13, 14, 3);
      c.tone(3, 9, 9, 10, 8);
      d.layer('#3a281c').rect(4, 10, 16, 2);
      d.layer('#c99a48', { shiny: 1 }).ell(8.5, 10.5, 3, 3).ell(15.5, 10.5, 3, 3);
      d.layer('#2a3032', { shiny: 1, sep: false }).ell(8.5, 10.5, 1.8, 1.8).ell(15.5, 10.5, 1.8, 1.8);
      d.mark('#a8c8cc', 8, 10, 15, 10);
    });
    set('a_p87_sip_apron', (d) => {   // scorched hide to the shin, a brass pressure-badge on the bib
      d.layer('#5a3c28', { shiny: 1 }).poly([8, 3, 16, 3, 16, 9, 19, 10, 19, 22, 5, 22, 5, 10, 8, 9]);
      d.layer('#2a1e16', { sep: false }).poly([5, 19, 7, 18, 9, 20, 12, 18, 15, 20, 17, 18, 19, 19, 19, 22, 5, 22]);
      d.layer('#c99a48', { shiny: 1 }).ell(12, 6.5, 2.2, 2.2);
      d.mark('#3a2a1c', 12, 6, 12, 5);
      d.layer('#3a281c').rect(4, 10, 16, 1);
    });
    set('a_p87_sip_gauntlets', (d) => {   // quilted hide to the elbow, scorched black at the fingertips
      const g = (x) => { const L = glove(d.layer('#7c603e'), x); L.rect(x - 1, 17, 8, 5); for (let y = 12; y < 22; y += 3) for (let i = x - 1; i < x + 7; i++) L.tone(1, i, y); return L; };
      g(4); g(14);
      d.layer('#241c18', { sep: false }).rect(4, 3, 1, 2).rect(6, 2, 1, 2).rect(8, 3, 1, 2).rect(14, 3, 1, 2).rect(16, 2, 1, 2).rect(18, 3, 1, 2);
    });
    set('a_p87_sip_boots', (d) => {   // thick wooden soles for hot plate, brass toecaps
      boot(d.layer('#463428'), 3, 6); boot(d.layer('#56402e'), 11, 7);
      d.layer('#8a6438').rect(3, 19, 10, 3).rect(11, 19, 10, 3);
      d.layer('#c99a48', { shiny: 1 }).rect(9, 16, 3, 3).rect(17, 16, 3, 3);
    });
    set('a_p87_sip_cape', (d) => {   // waxed canvas the colour of cold ash, scorched at the hem, a brass valve-wheel
      shoulders(d.layer('#44423e'), 19);
      d.layer('#22201e', { sep: false }).poly([2, 17, 5, 16, 8, 18, 11, 16, 14, 18, 17, 16, 20, 17, 22, 16, 22, 19, 2, 19]);
      d.layer('#c99a48', { shiny: 1 }).ell(12, 8, 2.4, 2.4).cut().ell(12, 8, 1, 1).add();
    });
    // ---- the Consortium Works
    set('a_p87_wks_gauntlets', (d) => {   // company canvas, riveted leather palms, a brass tag
      glove(d.layer('#76694a'), 4); glove(d.layer('#86795a'), 13);
      d.layer('#5a3a24').rect(4, 10, 6, 5).rect(13, 10, 6, 5);
      d.mark('#e0d4a6', 5, 11, 8, 11, 5, 14, 8, 14, 14, 11, 17, 11, 14, 14, 17, 14);
      d.layer('#c9a448', { shiny: 1 }).rect(15, 18, 3, 2);
    });
    set('a_p87_wks_boots', (d) => {   // hobnails with iron toecaps, white with stone dust
      boot(d.layer('#6a6056', { shiny: 1 }), 3, 4); boot(d.layer('#7a7064', { shiny: 1 }), 11, 5);
      d.layer('#8c949a', { shiny: 1 }).rect(9, 15, 3, 4).rect(17, 15, 3, 4);
      d.layer('#34302c').rect(3, 19, 10, 2).rect(11, 19, 10, 2);
      d.mark('#d9dde0', 4, 20, 6, 20, 8, 20, 10, 20, 12, 20, 14, 20, 16, 20, 18, 20);
      d.mark('#e8e4da', 4, 9, 6, 12, 13, 10, 14, 13, 5, 16, 13, 17);
    });
    set('a_p87_wks_cape', (d) => {   // company tarpaulin tied with cord, CONSORTIUM stencilled upside down
      d.layer('#706c4e').poly([5, 4, 19, 4, 20, 21, 4, 21]);
      d.layer('#a8a088').rect(10, 3, 4, 2);
      d.layer('#963a2c', { shade: 'flat', sep: false }).rect(6, 11, 2, 3).rect(9, 11, 2, 3).rect(12, 11, 1, 3).rect(14, 11, 2, 3).rect(17, 11, 1, 3);
      d.mark('#706c4e', 6, 12, 10, 12, 15, 12);
    });
    set('a_p87_wks_pavise', (d) => {   // pit-prop planks bound with strap iron, a red serial, a sighting slot
      d.layer('#84684a').rect(5, 2, 14, 20);
      d.layer('#5c4a36', { shade: 'flat', sep: false }).rect(9, 2, 1, 20).rect(14, 2, 1, 20);
      d.layer('#5c6266', { shiny: 1 }).rect(5, 5, 14, 2).rect(5, 17, 14, 2);
      d.layer('#1e1a16', { shade: 'flat', sep: false }).rect(10, 3, 4, 1);
      d.mark('#a83a2c', 7, 10, 8, 10, 10, 10, 11, 10, 12, 11, 15, 10, 16, 10, 17, 11, 7, 12, 11, 12, 16, 12);
    });
    // ---- the Free Captains
    set('a_p87_cap_bandana', (d) => {   // a sea-faded red headscarf knotted behind, a brass ring through one corner
      d.layer('#9c3a2c').ell(11, 13, 7.5, 7).cut().rect(0, 14, 24, 10).add().rect(4, 13, 14, 2);
      d.layer('#7c2c22').ell(19, 13, 2.4, 2.2).poly([19, 14, 23, 21, 20, 21]).poly([18, 14, 17, 21, 15, 20]);
      d.layer('#c9a448', { shiny: 1 }).ell(21.5, 20.5, 1.4, 1.4).cut().ell(21.5, 20.5, 0.5, 0.5).add();
      d.mark('#d07a60', 7, 8, 8, 7);
    });
    set('a_p87_cap_coat', (d) => {   // faded sea-blue, deep turned-back cuffs, brass buttons going green
      garment(d.layer('#36506a'), 22, 18);
      d.layer('#2a3e54').rect(1, 16, 5, 3).rect(18, 16, 5, 3);
      for (const y of [8, 11, 14, 17, 20]) d.mark('#c9a448', 10, y, 14, y);
      d.mark('#6a9a7a', 10, 14, 14, 17);
    });
    set('a_p87_cap_gloves', (d) => {   // tarred deck-canvas, rope-burned pale across the palm
      glove(d.layer('#36322e', { shiny: 1 }), 4); glove(d.layer('#46403a', { shiny: 1 }), 13);
      d.layer('#9a7c54', { sep: false }).rect(4, 12, 6, 1).rect(13, 13, 6, 1);
    });
    set('a_p87_cap_boots', (d) => {   // salt-cracked sea boots to the knee, the tops turned down in a cuff
      boot(d.layer('#3e2c20', { shiny: 1 }), 3, 4); boot(d.layer('#4c3626', { shiny: 1 }), 11, 5);
      d.layer('#7c6046').rect(2, 2, 7, 4).rect(10, 3, 7, 4);
      d.mark('#d0d4cc', 5, 10, 6, 11, 13, 12, 14, 9);
    });
    set('a_p87_cap_cape', (d) => {   // a heavy navy boat-cloak, lined in red, a silver bosun's whistle
      capeBack(d.layer('#2a3450'), 22, 1);
      d.layer('#963a2c').poly([16, 5, 20, 7, 21.5, 22, 18, 22]);
      d.layer('#d4d8da', { shiny: 1 }).rect(7, 10, 4, 2).px(11, 11);
      d.mark('#a8acae', 8, 6, 8, 7, 8, 8, 8, 9);
    });
    // ---- the Drovers
    set('a_p87_dro_hat', (d) => {   // brown felt gone the shape of the rain, a tally-cord and chalk heather in the band
      d.layer('#5c4c3a').poly([7, 14, 8, 6, 12, 4.5, 16, 6, 17, 14]);
      d.layer('#4a3c2e').poly([1, 16, 5, 13, 19, 13, 23, 16, 19, 17.5, 5, 17.5]);
      d.layer('#c4baa0').rect(7, 12, 10, 2);
      d.mark('#9a6e8a', 15, 9, 16, 10, 16, 8); d.mark('#6a8a4a', 15, 11);
      d.mark('#7a6a54', 11, 6, 12, 7, 13, 6);
    });
    set('a_p87_dro_mittens', (d) => {   // undyed Farrant fleece, the thumb sewn open
      mitt(d.layer('#d6ccb4'), 3); mitt(d.layer('#e2d8c2'), 14);
      d.layer('#a89c80', { shade: 'flat', sep: false }).px(2, 11, 2, 12, 13, 11, 13, 12);
      d.mark('#b8ac90', 4, 9, 6, 12, 15, 10, 17, 13, 5, 15, 18, 15);
    });
    set('a_p87_dro_plaid', (d) => {   // a long plaid checked in chalk and peat, belted
      const L = d.layer('#c8bea0').poly([3, 3, 21, 3, 21, 22, 3, 22]);
      for (let y = 3; y < 22; y++) for (let x = 3; x < 21; x++) { const a = (x % 6) < 2, b = (y % 6) < 2; if (a && b) L.tone(0, x, y); else if (a || b) L.tone(1, x, y); }
      d.layer('#4a3624').rect(3, 14, 18, 2);
      d.layer('#c9a448', { shiny: 1 }).rect(11, 14, 2, 2);
    });
    // ---- the Barrow-wardens
    set('a_p87_bar_bracers', (d) => {   // bronze arm-rings coiled wrist to elbow, green with age
      const c = (x) => { const L = d.layer('#a08850', { shiny: 1 }).rect(x, 3, 7, 18); for (let y = 4; y < 21; y += 2) L.tone(1, x, y, x + 1, y, x + 2, y, x + 3, y, x + 4, y, x + 5, y, x + 6, y); return L; };
      c(3); c(14);
      d.mark('#5c9a7c', 4, 7, 6, 7, 8, 9, 15, 13, 17, 13, 19, 15, 5, 17, 16, 5);
    });
    set('a_p87_bar_greaves', (d) => {   // bronze shin-guards, a spiral boss at the knee, wrapped leggings
      boot(d.layer('#6e6454'), 3, 5); boot(d.layer('#7a705e'), 11, 6);
      d.layer('#9a8450', { shiny: 1 }).rect(3, 5, 5, 10).rect(11, 6, 5, 10);
      d.layer('#c8ae6a', { shiny: 1 }).ell(5.5, 5.5, 2.4, 2.4).ell(13.5, 6.5, 2.4, 2.4);
      d.mark('#6a5428', 5, 5, 6, 6, 13, 6, 14, 7); d.mark('#5c9a7c', 4, 11, 12, 13);
    });
    set('a_p87_bar_cloak', (d) => {   // earth-grey grave-wool to the ankle, a bronze ring-brooch as big as a hand
      capeBack(d.layer('#5e5a54'), 22, 1.5);
      d.layer('#b08c48', { shiny: 1 }).ell(8, 8, 3.4, 3.4).cut().ell(8, 8, 2, 2).add();
      d.layer('#8a6e38').rect(9, 4, 1, 9);
    });
    set('a_p87_bar_shield', (d) => {   // bronze in rings of ribs and studs, the boss hollow, green with age
      d.layer('#8e7a48', { shiny: 1 }).ell(12, 12, 10, 10);
      const r = d.layer('#b49a5e', { shiny: 1 }).ell(12, 12, 8, 8).cut().ell(12, 12, 7, 7).add().ell(12, 12, 5, 5).cut().ell(12, 12, 4, 4).add();
      r.tone(3, 6, 8, 8, 6);
      d.layer('#c8ae6a', { shiny: 1 }).ell(12, 12, 2.4, 2.4);
      d.mark('#d8c486', 12, 3, 18, 6, 21, 12, 18, 18, 12, 21, 6, 18, 3, 12, 6, 6);
      d.mark('#5c9a7c', 15, 15, 16, 15, 7, 9, 17, 8, 8, 16);
    });
    // ---- the Flume
    set('a_p87_flu_cap', (d) => {   // a lengthsman's tarred hat, low crown, a long back flap
      d.layer('#3e3a32', { shiny: 1 }).ell(11, 12, 7, 6).cut().rect(0, 12, 24, 12).add().rect(4, 11, 14, 3);
      d.layer('#4a453a', { shiny: 1 }).poly([15, 11, 21, 12, 22, 20, 17, 19, 15, 14]);
      d.layer('#2e2a24').poly([1, 13, 5, 12, 5, 15, 2, 15]);
      d.layer('#b08a3c').rect(4, 12, 12, 1);
    });
    set('a_p87_flu_gloves', (d) => {   // tarred leather to the forearm, an iron sluice-key on a thong
      const g = (x) => glove(d.layer('#3e362c', { shiny: 1 }), x).rect(x - 1, 17, 8, 5);
      g(4); g(14);
      d.layer('#787c7e', { shiny: 1 }).rect(10, 18, 3, 1).rect(12, 17, 1, 3).ell(10, 18.5, 1.2, 1.2);
    });
    set('a_p87_flu_cape', (d) => {   // a yellow-ochre oilskin shoulder-cape, an iron lantern-hook
      shoulders(d.layer('#b08a3c', { shiny: 1 }), 19);
      d.layer('#5a5650', { shiny: 1 }).rect(19, 3, 1, 5).rect(20, 2, 2, 1).rect(21, 3, 1, 2);
      d.layer('#7c6028').rect(11, 6, 2, 13);
    });
    // ---- the Old Reach
    set('a_p87_old_crown', (d) => {   // plaited lime-bark, two short red-deer tines
      d.layer('#6c5238').rect(4, 14, 16, 4);
      d.mark('#4a3826', 5, 15, 7, 16, 9, 15, 11, 16, 13, 15, 15, 16, 17, 15, 19, 16);
      d.layer('#e0d4b8').thick([6, 14, 5, 9, 3, 4], 0.9).thick([5, 9, 8, 6], 0.6).thick([18, 14, 19, 9, 21, 4], 0.9).thick([19, 9, 16, 6], 0.6);
    });
    set('a_p87_old_hide', (d) => {   // deer-hide laced with sinew, the hair left on at the shoulders, no sleeves
      d.layer('#966c46').poly([7, 4, 17, 4, 18.5, 8, 18, 21, 6, 21, 5.5, 8]).cut().poly([10, 3.6, 14, 3.6, 12, 7]).add();
      d.layer('#6c4a2e').poly([3, 6, 8, 3.5, 9, 8, 6, 10.5, 3, 10]).poly([21, 6, 16, 3.5, 15, 8, 18, 10.5, 21, 10]);
      d.mark('#a87a50', 4, 7, 6, 6, 5, 9, 20, 7, 18, 6, 19, 9);
      d.mark('#d8b888', 6, 12, 7, 14, 6, 16, 7, 18, 18, 12, 17, 14, 18, 16, 17, 18);
      d.layer('#7a5636').rect(6, 19, 12, 2);
    });
    set('a_p87_old_wraps', (d) => {   // hands wound with lime-bark cord, the fingertips bare
      const w = (x) => { const L = d.layer('#a89268').rect(x, 7, 6, 14).rect(x - 1, 10, 1, 4); for (let y = 8; y < 21; y += 2) L.tone(1, x + (y % 4 ? 0 : 3), y, x + (y % 4 ? 1 : 4), y, x + (y % 4 ? 2 : 5), y); return L; };
      w(4); w(14);
      d.layer('#c99272').rect(4, 4, 1, 3).rect(6, 3, 1, 4).rect(8, 4, 1, 3).rect(14, 4, 1, 3).rect(16, 3, 1, 4).rect(18, 4, 1, 3);
    });
    set('a_p87_old_shoes', (d) => {   // soft one-piece hide shoes gathered at the ankle with a thong, moss in the heel
      const s2 = (x, col) => d.layer(col).rect(x, 11, 5, 6).ell(x + 5, 16.5, 4.6, 2.6).rect(x, 15, 5, 4);
      s2(2, '#7e5c3e'); s2(12, '#8c6846');
      d.layer('#4a3420').rect(2, 12, 5, 1).rect(12, 12, 5, 1).px(7, 13, 17, 13);
      d.mark('#6a8a3e', 2, 10, 3, 10, 12, 10, 13, 10);
      d.mark('#b08a62', 4, 15, 8, 16, 14, 15, 18, 16);
    });
    set('a_p87_old_pelt', (d) => {   // a red deer's hide over the shoulders, fur out, the forelegs knotted at the chest
      d.layer('#8c5a36').poly([4, 5, 9, 3, 15, 3, 20, 5, 22, 13, 19, 21, 15, 19, 12, 22, 9, 19, 5, 21, 2, 13]);
      d.layer('#e0d0b0').ell(12, 6, 3, 2);
      d.layer('#6c4228').thick([7, 5, 10, 10, 12, 11], 1).thick([17, 5, 14, 10, 12, 11], 1);
      d.mark('#b07a4c', 5, 10, 7, 14, 17, 9, 19, 14, 9, 17, 15, 16);
    });
  }
  // ---------------------------------------------------------------- pack pictures (24 by 24, pixel by pixel)
  function icons() {
    try { if (typeof ICONS !== 'undefined' && ICONS.PIX) armourIcons(); } catch (e) { /* the pack shows them without a picture */ }
    try {
      if (typeof ICONS === 'undefined' || !ICONS.PIX || Object.prototype.hasOwnProperty.call(ICONS.PIX, 'weapon:p87_sledge')) return;
      const sledge = (d) => { d.tilt(12, 12);
        d.layer('#8a6440').rrect(-1.5, -4, 3, 17);                                   // the ash haft
        d.layer('#c8a040', { shiny: 1, sep: false }).rect(-1.5, 4, 3, 2);            // the brass Consortium tag
        d.layer('#b03a2a', { sep: false }).rect(-2, -5, 4, 2);                       // the red rag at the neck
        d.layer('#5a5e62', { shiny: 1 }).rect(-7, -11, 11, 6).path([4, -11, 7, -8, 4, -5]);   // the head: a flat face, a wedge peen
        d.layer('#e8e4da', { shade: 'flat', sep: false }).px(-5, -9, -3, -9, -1, -9); // chalk tallies
      };
      ICONS.PIX['weapon:p87_sledge'] = sledge; ICONS.PIX.w_p87_sledge = sledge;
      // Phase 87 (d): the ranged weapons and their shot
      const W = (id, fn) => { ICONS.PIX['weapon:' + id] = fn; ICONS.PIX['w_' + id] = fn; };
      const sling = (cord, pouch, stone, plait) => (d) => {   // two cords from a finger-loop to a pouch with its stone
        d.layer(cord).thick([4, 21, 6, 13, 10, 7], 0.7).thick([7, 22, 11, 15, 14, 8], 0.7);
        d.layer(pouch).ell(13, 6.5, 5, 3.4);
        d.layer(stone, { shiny: 1 }).ell(13, 5.5, 2.4, 2.2);
        d.layer(cord).ell(5, 21, 1.8, 1.8).cut().ell(5, 21, 0.7, 0.7).add();
        if (plait) d.mark('#8a7a5a', 5, 17, 6, 14, 8, 11, 9, 19, 11, 16, 12, 13);
      };
      W('p87_feltsling', sling('#3a5650', '#4c6e66', '#8a8680', false));
      W('p87_sling', sling('#d6ccb0', '#7a5434', '#d8d4c4', true));
      W('p87_carbine', (d) => { d.tilt(12, 12);
        d.layer('#5c6266').rrect(-2.6, 1, 5.2, 11);                                   // the oilcloth-wound stock
        d.layer('#3a4048', { shiny: 1 }).rrect(-1.1, -12, 2.2, 14);                    // the blued barrel
        d.layer('#c8a040', { shiny: 1 }).rrect(-1.6, -6, 3.2, 1).rrect(-1.6, -1, 3.2, 1).rrect(-1.5, -14, 0.9, 2.4).rrect(0.6, -14, 0.9, 2.4);   // bands, the fork sight
        d.layer('#6a7076').rrect(-1.8, 1.5, 3.6, 3);
        d.mark('#bfe8f0', 12, 3); });
      W('p87_handbow', (d) => { d.tilt(12, 13);
        d.layer('#76603e').rrect(-1.4, -6, 2.8, 16);                                    // the pit-prop stock
        d.layer('#8a9096', { shiny: 1 }).rpoly([-9, -3, 0, -7, 9, -3, 9, -1.8, 0, -5.6, -9, -1.8]);   // the steel prod
        d.layer('#d8ceb0', { sep: false }).rpoly([-8.6, -2.4, 0, 1.5, 8.6, -2.4, 8.6, -2, 0, 2, -8.6, -2]);
        d.layer('#c8a448', { shiny: 1 }).rrect(1.6, 3, 2.4, 2.4);                       // the brass tag
        d.layer('#b8bcc0').rrect(-0.5, -10, 1, 6); });
      W('p87_harpoon', (d) => { d.tilt(12, 12);
        d.layer('#96784a', { shiny: 1 }).rrect(-2.4, -6, 4.8, 15);                      // the bronze tube
        d.layer('#c8a048').rrect(-2.8, -5, 5.6, 1.2).rrect(-2.8, 5, 5.6, 1.2);
        d.layer('#a0a4a8', { shiny: 1 }).rrect(-0.6, -12, 1.2, 7).rpoly([0, -15, -2.6, -10.5, 2.6, -10.5]);   // the barbed head
        d.layer('#b09c70').ell(18, 15, 2.6, 2.6).cut().ell(18, 15, 1, 1).add();          // the rope drum
        d.mark('#5c9a7c', 9, 15); });
      W('p87_hornbow', (d) => {   // a recurved horn bow, its string, a flint-headed arrow
        d.layer('#6a4a2e').thick([5, 2, 4, 5, 6, 9, 8, 12, 6, 15, 4, 19, 5, 22], 0.9);
        d.layer('#e0d4b8', { sep: false }).px(5, 2, 4, 3, 5, 22, 4, 21);
        d.layer('#d8ceb0', { sep: false }).line(5, 2, 5, 22);
        d.layer('#9a7a50').line(4, 12, 20, 12);
        d.layer('#3a3a40', { shiny: 1 }).poly([19, 10, 23, 12, 19, 14]);
        d.layer('#c84a32').px(4, 11, 5, 11, 4, 13, 5, 13); });
      const P = ICONS.PIX;
      P.stones = (d) => { d.layer('#8a867e', { shiny: 1 }).ell(8, 15, 4, 3.4).ell(15, 16, 3.6, 3); d.layer('#d8d4c4', { shiny: 1 }).ell(12, 10, 3.4, 3); d.layer('#6a6660').ell(17, 10, 2.6, 2.2); };
      P.quarrels = (d) => { d.tilt(12, 12); for (const x of [-3, 0, 3]) { d.layer('#7a6a4c').rrect(x - 0.5, -6, 1, 13); d.layer('#9aa0a6', { shiny: 1 }).rpoly([x, -10, x - 1.4, -6, x + 1.4, -6]); } d.layer('#c8a448').rrect(-4.5, 3, 9, 1.2); };
      P.harpoons = (d) => { d.tilt(12, 12); for (const x of [-3, 2]) { d.layer('#8a8e92', { shiny: 1 }).rrect(x - 0.6, -7, 1.2, 14).rpoly([x, -11, x - 2.2, -7, x + 2.2, -7]); } d.layer('#b09c70').thick([4, 20, 9, 18, 14, 20, 19, 18], 0.7); };
      P.arrows = (d) => { d.tilt(12, 12); for (const x of [-3, 0, 3]) { d.layer('#a08060').rrect(x - 0.4, -8, 0.8, 16); d.layer('#3a3a40', { shiny: 1 }).rpoly([x, -11, x - 1.3, -8, x + 1.3, -8]); d.layer(x === 0 ? '#c84a32' : '#e0d4b8').rrect(x - 1, 5, 2, 3); } };
    } catch (e) { /* the pack shows it without a picture */ }
  }
  // ---------------------------------------------------------------- (e) where everything is found [PROPOSED]
  // The design (ruled 14 Nov, question 7): each set at home, sold in its town's shops (the cheaper pieces), carried by
  // its people (dropped by its fighters), and the best pieces in the big places (the deepest strongboxes, tier 3).
  const WHERE = {
    shops: {
      hob: ['a_p87_tan_cape', 'a_p87_tan_shield', 'a_p87_reg_cuffs', 'a_p87_reg_shoes'],               // Barker's tannery (he sells the Registry's robes)
      tam: ['a_p87_hush_mitts', 'w_p87_feltsling', 'stones'],                                          // the Hedge-weavers' stall
      vane: ['a_p87_cap_bandana', 'a_p87_cap_gloves', 'a_p87_cap_boots', 'harpoons'],                  // Captain Vane, the Boar & Dulcimer
      vosk: ['a_p87_wks_gauntlets', 'a_p87_wks_boots', 'a_p87_wks_cape', 'w_p87_handbow', 'quarrels'], // the Consortium's factor
      orrin: ['a_p87_can_cowl', 'a_p87_can_sandals'],                                                   // the sexton's crypt-store, by the Cantors' chapel
      p16f_madge: ['a_p87_flu_cap', 'a_p87_flu_gloves', 'w_p87_sling', 'stones'],                       // the Flume
      p17c_sloe: ['a_p87_cap_cape', 'harpoons'],                                                        // Port Cantabile
    },
    drops: {
      legionnaire: [['a_p87_leg_vambraces', 5], ['a_p87_leg_sabatons', 3], ['a_p87_ars_sallet', 3], ['a_p87_leg_pennon', 2]],
      proctor: [['a_p87_pro_gloves', 6], ['a_p87_pro_boots', 4], ['a_p87_pro_hood', 3], ['a_p87_pro_cape', 3]],
      marine: [['a_p87_pro_coat', 4], ['w_p87_carbine', 2], ['pellets', 6]],
      golem: [['a_p87_sip_goggles', 4], ['a_p87_sip_gauntlets', 4], ['a_p87_sip_boots', 3]],
      quiet: [['a_p87_hush_cloak', 4]],
      hushwarden: [['a_p87_hush_cloak', 6], ['stones', 8]],
      outrider: [['a_p87_ars_cape', 4], ['quarrels', 8]],
      p22_woolwight: [['a_p87_bar_bracers', 8], ['a_p87_dro_mittens', 6]],
      p22_oldfleece: [['a_p87_bar_cloak', 60]],
    },
    caches: {
      1: [['stones', 6], ['a_p87_dro_mittens', 5], ['a_p87_cap_bandana', 4], ['a_p87_old_wraps', 3], ['quarrels', 4], ['arrows', 3]],
      2: [['a_p87_dro_hat', 5], ['a_p87_dro_plaid', 4], ['a_p87_sip_apron', 3], ['a_p87_flu_cape', 4], ['a_p87_old_shoes', 4], ['w_p87_sling', 4], ['harpoons', 3], ['arrows', 4]],
      3: [['a_p87_leg_shield', 3], ['a_p87_wks_pavise', 3], ['a_p87_bar_greaves', 3], ['a_p87_bar_shield', 3], ['a_p87_old_crown', 2], ['a_p87_old_hide', 3], ['a_p87_old_pelt', 3],
        ['w_p87_hornbow', 2], ['w_p87_harpoon', 2], ['a_p87_sip_cape', 3], ['a_p87_reg_biretta', 3], ['a_p87_reg_cape', 3], ['a_p87_ars_cape', 2], ['a_p87_can_cassock', 3], ['a_p87_can_mantle', 3],
        ['a_p87_cap_coat', 3], ['a_p87_pro_coat', 2], ['w_p87_carbine', 1], ['w_p87_feltsling', 2]],
    },
  };
  function place() {
    const ok = (id) => typeof ITEMS !== 'undefined' && !!ITEMS[id];
    if (typeof NPCS !== 'undefined') for (const n in WHERE.shops) { const npc = NPCS[n]; if (!npc || !Array.isArray(npc.shop)) continue; for (const id of WHERE.shops[n]) if (ok(id) && !npc.shop.some((q) => q.item === id)) npc.shop.push({ item: id }); }
    if (typeof LOOT !== 'undefined') for (const t in WHERE.drops) { const L = LOOT[t]; if (!L || !Array.isArray(L.table)) continue; for (const [id, w] of WHERE.drops[t]) if (ok(id) && !L.table.some((q) => q[0] === id)) L.table.push([id, w]); }
    if (typeof CACHE !== 'undefined') for (const k in WHERE.caches) { const C2 = CACHE[k]; if (!C2 || !Array.isArray(C2.table)) continue; for (const [id, w] of WHERE.caches[k]) if (ok(id) && !C2.table.some((q) => q[0] === id)) C2.table.push([id, w]); }
  }
  // ---------------------------------------------------------------- the new shot: its own words and sounds
  // (the game's attack() and useItem() know glass shot and bolts; these say the right thing for stones, quarrels,
  // harpoons and arrows, and a sling whirs instead of firing)
  function wire() {
    // modules that add their people and loot later (on their first map) are caught when a map loads
    if (typeof loadMap === 'function') { const _lm = loadMap; loadMap = function () { const r = _lm.apply(this, arguments); try { place(); } catch (e) { /* */ } return r; }; }
    if (typeof attack === 'function') {
      const _at = attack;
      attack = function () {
        let k = null; try { const w = currentWeapon(); k = w && w.ammo; } catch (e) { k = null; }
        if (!k || !AMMO_TX[k] || !G.player || G.attack.t > 0 || G.song.t > 0) return _at.apply(this, arguments);
        if (!((G.player[k] || 0) > 0)) { msg(AMMO_TX[k].none, 'bad'); return undefined; }
        const sfx = typeof Audio_ !== 'undefined' && Audio_.sfx, keep = sfx && sfx.shot;
        try { if (sfx && keep) sfx.shot = (k === 'stones' ? sfx.swing : sfx.bow) || keep; } catch (e) { /* the old sound */ }
        try { return _at.apply(this, arguments); } finally { try { if (sfx && keep) sfx.shot = keep; } catch (e) { /* */ } }
      };
    }
    if (typeof useItem === 'function') {
      const _ui = useItem;
      useItem = function (slot) {
        const it = slot && typeof ITEMS !== 'undefined' ? ITEMS[slot.id] : null;
        if (it && it.use === 'ammo' && AMMO_TX[it.ammo] && G.player) {
          const p = G.player; p[it.ammo] = (p[it.ammo] || 0) + it.n; G.take(slot.id); msg(AMMO_TX[it.ammo].load, 'good');
          try { renderInventory(); } catch (e) { /* no panel */ }
          return undefined;
        }
        return _ui.apply(this, arguments);
      };
    }
  }
  register();
  try { place(); } catch (e) { /* found nowhere new */ }
  wire();
  return { TX, TEXTS, WEAPONS87, ARMOR87, AMMO87, AMMO_TX, WHERE, register, place };
})();
if (typeof window !== 'undefined') window.ITEMS87 = ITEMS87;
