// ============================================================
//  gearlook21 — Phase 21 (team BODY owns this file): ONE source of truth for "what the player looks like in this gear".
//
//  CONTRACT (stable; v1). Read-only data + pure functions. No drawing, no DOM, no G.* writes, no Math.random.
//  Loaded after js/max20.js and before js/body21.js (BODY: first-person arms, hands, weapons, shield, legs and boots) and
//  js/card21.js (CARD: the character card / paper doll, and the likeness offered to js/partner19.js and js/ghost18.js).
//
//    GEARLOOK21.VERSION              1
//    GEARLOOK21.ARMOR[id]            appearance of every armour piece in js/data.js ARMOR (head, body, hands, feet, shield)
//    GEARLOOK21.WEAPONS[id]          appearance of every weapon in WEAPONS (js/data.js, js/upgrades.js, js/arms12.js)
//    GEARLOOK21.BARE[slot]           what shows when a slot is empty (bare head, a linen shirt, bare hands, plain shoes)
//    GEARLOOK21.FACES[1..6]          skin and hair per character-creation face (img/face_N.jpg)
//    GEARLOOK21.CALLINGS[classId]    calling colours: coat (the undershirt/trousers when no armour), accent (cloak, sash)
//    GEARLOOK21.GLASS                the Aether-Glass arm (cyan, faintly warm, faintly wet-looking; Light-glass hums 528)
//    GEARLOOK21.MATERIALS[m]         per material: how it reads (sheen 0..1, pattern, outline colour, sound word)
//    GEARLOOK21.of(player?)          -> LOOK, the resolved likeness of a player (defaults to G.player). Never throws.
//    GEARLOOK21.key(player?)         -> string that changes exactly when the visible likeness changes (cache key)
//    GEARLOOK21.ramp(rgb, n?)        -> n shades dark..light of a colour (pixel-art ramp, hue-shifted: cool shadows, warm lights)
//    GEARLOOK21.css(rgb, a?)         -> 'rgb(...)' / 'rgba(...)'
//    GEARLOOK21.ghostLook(player?)   -> { cls, face, wpn, arm } in js/ghost18.js lookNow()'s encoding (for partner/ghost)
//    GEARLOOK21.all()                -> { armor: [ids], weapons: [ids] } every id this table covers (tests check coverage)
//
//  LOOK (all colours are [r,g,b] 0..255; every sub-object is a frozen table entry or null — never save text):
//    { v: 1, face: 1..6, skin: [rgb], skinShade: [rgb], hair: { col, style }, calling: { id, coat, accent },
//      glassArm: bool,            // the player's LEFT arm is Aether-Glass past the elbow (p.glassed; the Dissonant Blade)
//      head, body, hands, feet,   // ARMOR entries (or the BARE entry for an empty slot; .bare = true)
//      shield,                    // ARMOR entry or null; shieldStowed: true when a two-handed weapon puts it on the back
//      cape,                      // ARMOR entry or null (Phase 87: the sixth slot, worn over the back)
//      shieldStowed: bool,
//      weapon,                    // WEAPONS entry of the readied weapon (bare hands when none)
//      offhand,                   // WEAPONS entry of the Phase 12 off-hand blade (dual wield) or null
//      twoHanded: bool,           // the readied weapon is held in both hands
//      key: string }              // same as key(player)
//
//  ARMOR entry: { id, slot, name, material, shape, pattern, col: { base, shade, light, dark, trim }, len?, notes }
//    slot      'head' | 'body' | 'hands' | 'feet' | 'shield' | 'cape' (Phase 87)
//    form      Phase 87: the piece's own silhouette inside its shape (bandana, sallet, cassock, mitts, sandals, pavise, plaid...);
//              a painter that does not know a form draws the shape
//    material  'leather' | 'hushwool' | 'iron' | 'bellbronze' | 'oilcloth' | 'quilt' | 'canvas' | 'mail' | 'felt' | 'wood' | 'linen' | 'skin'
//    shape     the silhouette, per slot:
//      head:   'bare' | 'cap' (close skullcap) | 'hood' (cowl to the shoulders) | 'kettle' (broad brim) | 'bellhelm' (bell dome, eye slit)
//      body:   'shirt' | 'robe' (to the ankles, wide sleeves, stole) | 'gambeson' (mid-thigh, quilted sleeves) | 'jerkin'
//              (sleeveless leather over a linen shirt, leather bracers) | 'longcoat' (to the calf) | 'brigandine' (riveted
//              canvas, to the hip) | 'hauberk' (mail to the knee and wrist) | 'cuirass' (bell-cast plate over mail sleeves,
//              plated arms: couters and vambraces, tassets over the hips)
//      hands:  'bare' | 'gloves' | 'gauntlets'
//      feet:   'shoes' | 'softboots' (ankle, wrapped) | 'hobnails' (mid-calf, studded soles) | 'greaves' (shin-plates over knee boots)
//      shield: 'buckler' (round, fist-sized, a boss) | 'kite' (long, painted face)
//      cape:   'cape' (len: 0 over the shoulders only .. 1 to the ankles; form says which: cloak, tippet, pennon, plaid, pelt...)
//    pattern   'none' | 'quilt' | 'mail' | 'rivets' | 'plates' | 'weave' | 'studs' | 'stole' | 'grain'
//    len       body only: hem height as a fraction of leg length below the hip (0 = at the hip, 1 = to the ankle)
//    sleeve    body only: { material, col, cuff } what the forearm shows; bracer: true when a bracer/vambrace covers it
//    face      shield only: { field, figure, rim, boss } the painted face colours
//    size      shield only, in hand-widths (1 hand-width ~ 9 cm): buckler `radius` (half its diameter: 1.67 = a 30 cm
//              buckler, "fist-sized"); kite `width` x `height` (6.7 x 10 = about 60 x 90 cm); `cm` gives the same in
//              centimetres { w, h } for both (the buckler's w = h = its diameter)
//  WEAPONS entry: { id, name, kind, grip, material, len, col: { blade, edge, grip, guard, head }, img, notes }
//    kind      'fists' | 'glassarm' | 'sword' | 'longsword' | 'greatsword' | 'knife' | 'dirk' | 'throwing' | 'axe' | 'mace' |
//              'hammer' | 'maul' | 'spear' | 'glaive' | 'pistol' | 'crossbow' | Phase 87: 'sling' | 'carbine' | 'handbow' | 'harpoon' | 'bow'
//    grip      'none' | 'one' | 'two' | 'innate'   (two = both hands on the haft or stock)
//    len       overall length in hand-widths (a hand-width ~ 9 cm): knife 3, sword 8, longsword 11, spear 22
//    img       the existing first-person painting in Engine.images (fp_*), so BODY can keep it and CARD can read its tones
//
//  Rules: colours are muted and earthy (the game's palette); metal is never pure grey (iron leans blue, bell-bronze leans
//  gold-green); [PROPOSED] marks a visual detail invented here (not in the bibles). The table only DESCRIBES gear:
//  changing gear stays the game's business (equipArmor, p.weapon). Unknown ids fall back to a neutral entry.
// ============================================================
'use strict';

// the game's catalog, captured before this module's own tables shadow the name
const GAME_WEAPONS_REF = typeof WEAPONS !== 'undefined' ? WEAPONS : null;
const GEARLOOK21 = (() => {
  const F = (o) => Object.freeze(o);
  const GAME_W = GAME_WEAPONS_REF;
  const C = (base, shade, light, dark, trim) => F({ base, shade, light, dark: dark || shade.map((v) => Math.round(v * 0.6)), trim: trim || light });

  // ---- materials: how a surface reads -------------------------------------------------------------------------------
  const MATERIALS = F({
    skin: F({ sheen: 0.15, pattern: 'none', ink: [58, 34, 24] }),
    linen: F({ sheen: 0.05, pattern: 'weave', ink: [46, 36, 26] }),
    quilt: F({ sheen: 0.05, pattern: 'quilt', ink: [50, 38, 26] }),
    leather: F({ sheen: 0.35, pattern: 'grain', ink: [40, 24, 14] }),
    hushwool: F({ sheen: 0.0, pattern: 'weave', ink: [20, 30, 28] }),
    oilcloth: F({ sheen: 0.45, pattern: 'none', ink: [40, 44, 44] }),
    canvas: F({ sheen: 0.1, pattern: 'weave', ink: [40, 34, 24] }),
    felt: F({ sheen: 0.0, pattern: 'none', ink: [36, 28, 22] }),
    mail: F({ sheen: 0.7, pattern: 'mail', ink: [34, 38, 44] }),
    iron: F({ sheen: 0.8, pattern: 'none', ink: [30, 34, 40] }),
    bellbronze: F({ sheen: 0.85, pattern: 'none', ink: [52, 38, 18] }),
    wood: F({ sheen: 0.2, pattern: 'grain', ink: [40, 26, 14] }),
    glass: F({ sheen: 1.0, pattern: 'facets', ink: [24, 86, 98] }),
    steel: F({ sheen: 0.9, pattern: 'none', ink: [30, 34, 40] }),
  });

  // ---- the people: faces (skin, hair) and callings ----------------------------------------------------------------------
  // sampled by eye from img/face_1..6.jpg; hair style names match the portraits
  const FACES = F({
    1: F({ skin: [186, 140, 112], hair: [70, 54, 42], style: 'short' }),     // dark-haired man, often hooded
    2: F({ skin: [214, 160, 128], hair: [150, 64, 34], style: 'braids' }),   // red braids
    3: F({ skin: [178, 128, 96], hair: [212, 206, 196], style: 'beard' }),   // white beard and a sailor's cap
    4: F({ skin: [222, 186, 164], hair: [34, 30, 34], style: 'bob' }),       // black hair, hooded
    5: F({ skin: [176, 124, 94], hair: [60, 44, 36], style: 'bald' }),       // shaved head, a scar
    6: F({ skin: [214, 180, 160], hair: [196, 196, 204], style: 'long' }),   // long silver hair
  });
  // the same calling palettes js/partner19.js paints the co-op traveller with (coat, cloak/robe accent)
  const CALLINGS = F({
    blade: F({ coat: [92, 70, 52], accent: [104, 48, 40] }),       // leather, an oxblood cloak
    cantor: F({ coat: [70, 60, 74], accent: [96, 76, 100] }),      // dusty plum
    corsair: F({ coat: [56, 66, 84], accent: [118, 56, 44] }),     // faded sea coat, red sash
    archivist: F({ coat: [74, 76, 56], accent: [90, 94, 62] }),    // olive
    penitent: F({ coat: [92, 88, 82], accent: [112, 108, 98] }),   // ash grey
    quarry: F({ coat: [116, 92, 62], accent: [86, 64, 46] }),      // ochre canvas, umber
  });
  const CLASS_ORDER = ['blade', 'cantor', 'corsair', 'archivist', 'penitent', 'quarry'];
  // Light-glass: cyan, faintly warm, faintly wet-looking (LORE_P6)
  const GLASS = F({ base: [96, 200, 214], shade: [40, 120, 142], light: [196, 246, 244], dark: [22, 70, 86], glow: [140, 236, 240], hz: 528 });

  // ---- armour -----------------------------------------------------------------------------------------------------------
  const IRON = C([128, 138, 146], [78, 86, 98], [192, 200, 204], [40, 44, 54]);
  const BRONZE = C([170, 132, 70], [112, 84, 44], [226, 196, 128], [62, 44, 22], [92, 128, 104]);   // trim: verdigris
  const MAIL = C([138, 146, 150], [82, 90, 100], [200, 206, 206], [40, 44, 52]);
  const ARM = F({
    // head
    a_cap: F({ id: 'a_cap', slot: 'head', material: 'leather', shape: 'cap', pattern: 'grain', col: C([118, 80, 50], [80, 52, 32], [156, 112, 74]), notes: 'boiled leather skullcap, stitched seam over the crown' }),
    a_hood: F({ id: 'a_hood', slot: 'head', material: 'hushwool', shape: 'hood', pattern: 'weave', col: C([58, 82, 76], [36, 54, 50], [86, 112, 102]), notes: 'packed-wool hood falling onto the shoulders' }),
    a_p22_barrowhelm: F({ id: 'a_p22_barrowhelm', slot: 'head', material: 'bellbronze', shape: 'kettle', pattern: 'none', col: BRONZE, notes: 'a barrow-warden\'s bronze cap with cheek-guards, green with age [PROPOSED] (Phase 22b)' }),
    a_kettle: F({ id: 'a_kettle', slot: 'head', material: 'iron', shape: 'kettle', pattern: 'rivets', col: IRON, notes: 'broad-brimmed infantry helm' }),
    a_bellhelm: F({ id: 'a_bellhelm', slot: 'head', material: 'bellbronze', shape: 'bellhelm', pattern: 'none', col: BRONZE, notes: 'a Legion bell-helm, hollowed: bell dome, eye slit, a verdigris lip [PROPOSED]' }),
    // body
    a_synodrobe: F({ id: 'a_synodrobe', slot: 'body', material: 'oilcloth', shape: 'robe', pattern: 'stole', len: 1.0, col: C([132, 140, 138], [90, 96, 96], [176, 182, 176], null, [206, 206, 186]),
      sleeve: F({ material: 'oilcloth', col: [132, 140, 138], cuff: [206, 206, 186], wide: true }), notes: 'grey oilcloth, a silver registry stole (trim)' }),
    a_gambeson: F({ id: 'a_gambeson', slot: 'body', material: 'quilt', shape: 'gambeson', pattern: 'quilt', len: 0.35, col: C([164, 138, 98], [116, 94, 64], [204, 180, 136]),
      sleeve: F({ material: 'quilt', col: [164, 138, 98], cuff: [116, 94, 64] }), notes: 'quilted linen and wool, diamond stitching' }),
    a_jerkin: F({ id: 'a_jerkin', slot: 'body', material: 'leather', shape: 'jerkin', pattern: 'grain', len: 0.15, col: C([128, 84, 54], [86, 54, 34], [170, 120, 80]),
      sleeve: F({ material: 'linen', col: [176, 160, 132], cuff: [128, 84, 54], bracer: true, rolled: true }), notes: 'oiled leather, sleeveless over a linen shirt; leather bracers' }),
    a_hushcoat: F({ id: 'a_hushcoat', slot: 'body', material: 'hushwool', shape: 'longcoat', pattern: 'weave', len: 0.8, col: C([54, 78, 72], [34, 50, 48], [82, 108, 98]),
      sleeve: F({ material: 'hushwool', col: [54, 78, 72], cuff: [34, 50, 48] }), notes: 'long coat of the Hedge wool, to the calf' }),
    a_p22_shroud: F({ id: 'a_p22_shroud', slot: 'body', material: 'hushwool', shape: 'longcoat', pattern: 'weave', len: 0.9, col: C([106, 102, 94], [70, 66, 60], [140, 136, 126]),
      sleeve: F({ material: 'hushwool', col: [106, 102, 94], cuff: [70, 66, 60] }), notes: 'Hedge-wool torn from the Old Fleece, earth-grey, to the ankle [PROPOSED] (Phase 22b)' }),
    a_p22_mantle: F({ id: 'a_p22_mantle', slot: 'body', material: 'hushwool', shape: 'longcoat', pattern: 'weave', len: 0.6, col: C([206, 198, 174], [150, 142, 120], [232, 226, 206]),
      sleeve: F({ material: 'hushwool', col: [206, 198, 174], cuff: [150, 142, 120] }), notes: 'felted Farrant fleece, the colour of the chalk, to the knee [PROPOSED] (Phase 22)' }),
    a_brig: F({ id: 'a_brig', slot: 'body', material: 'canvas', shape: 'brigandine', pattern: 'rivets', len: 0.25, col: C([104, 92, 70], [70, 60, 44], [140, 126, 96], null, [196, 164, 92]),
      sleeve: F({ material: 'canvas', col: [104, 92, 70], cuff: [196, 164, 92], bracer: true }), notes: 'company canvas over riveted plates, brass rivets (trim), a stencilled serial [PROPOSED]' }),
    a_chain: F({ id: 'a_chain', slot: 'body', material: 'mail', shape: 'hauberk', pattern: 'mail', len: 0.5, col: MAIL,
      sleeve: F({ material: 'mail', col: MAIL.base, cuff: [82, 90, 100] }), notes: 'arsenal mail to the knee and the wrist' }),
    a_plate: F({ id: 'a_plate', slot: 'body', material: 'bellbronze', shape: 'cuirass', pattern: 'plates', len: 0.3, col: BRONZE,
      sleeve: F({ material: 'mail', col: MAIL.base, cuff: BRONZE.base, bracer: true, plated: true }), notes: 'a Legionnaire\'s bell-cast cuirass; couters and vambraces over mail sleeves; tassets' }),
    a_p85_coat: F({ id: 'a_p85_coat', slot: 'body', material: 'oilcloth', shape: 'longcoat', pattern: 'none', len: 0.85, col: C([112, 104, 74], [76, 70, 48], [150, 140, 104]),
      sleeve: F({ material: 'oilcloth', col: [112, 104, 74], cuff: [76, 70, 48] }), notes: 'a long coat of oiled canvas: the Carter\'s Oilskin, from the Deep Grove (Phase 85)' }),
    // hands
    a_gloves: F({ id: 'a_gloves', slot: 'hands', material: 'leather', shape: 'gloves', pattern: 'grain', col: C([112, 74, 46], [74, 46, 28], [150, 106, 70]), notes: 'work gloves, a cuff over the wrist' }),
    a_gauntlets: F({ id: 'a_gauntlets', slot: 'hands', material: 'mail', shape: 'gauntlets', pattern: 'mail', col: C([140, 148, 152], [84, 92, 102], [204, 208, 208], [40, 44, 52], [100, 70, 46]), notes: 'mail backs on leather palms (trim = the palm leather), a flared cuff' }),
    a_p79_gloves: F({ id: 'a_p79_gloves', slot: 'hands', material: 'leather', shape: 'gloves', pattern: 'grain', col: C([154, 150, 143], [104, 100, 94], [196, 192, 184]), notes: 'grey kid lined with hush-cloth: the Bearer\'s Gloves, from Singers\' Howe (Phase 79)' }),
    // feet
    a_p22_droverboots: F({ id: 'a_p22_droverboots', slot: 'feet', material: 'leather', shape: 'hobnails', pattern: 'grain', col: C([70, 50, 34], [46, 32, 20], [104, 78, 54]), notes: 'long greased drove-road boots [PROPOSED] (Phase 22b)' }),
    a_p85_boots: F({ id: 'a_p85_boots', slot: 'feet', material: 'leather', shape: 'hobnails', pattern: 'grain', col: C([46, 40, 34], [28, 24, 20], [74, 66, 56]), notes: 'thigh-high tarred waders, felt-soled: the Sluice-Boots, from the Dry Flume (Phase 85)' }),
    a_p92_chainboots: F({ id: 'a_p92_chainboots', slot: 'feet', material: 'felt', shape: 'softboots', pattern: 'none', col: C([30, 28, 30], [18, 16, 18], [52, 48, 52], null, [120, 100, 70]), notes: 'Chain-Walk Boots (Phase 92): soft black uppers soled with tarred rope (trim), no nails [PROPOSED]' }),
    a_softboots: F({ id: 'a_softboots', slot: 'feet', material: 'felt', shape: 'softboots', pattern: 'none', col: C([96, 82, 66], [64, 54, 42], [130, 114, 92]), notes: 'felt-soled, ankle-high, wrapped with a thong' }),
    a_hobnails: F({ id: 'a_hobnails', slot: 'feet', material: 'leather', shape: 'hobnails', pattern: 'studs', col: C([76, 54, 38], [50, 34, 22], [112, 82, 58], null, [176, 176, 168]), notes: 'mid-calf boots, iron studs round the sole (trim)' }),
    a_greaves: F({ id: 'a_greaves', slot: 'feet', material: 'iron', shape: 'greaves', pattern: 'plates', col: C([132, 142, 150], [80, 88, 100], [196, 204, 208], [40, 44, 54], [62, 44, 32]), notes: 'shin-plates over knee-high riding boots (trim = the boot leather)' }),
    // shields
    a_buckler: F({ id: 'a_buckler', slot: 'shield', material: 'iron', shape: 'buckler', pattern: 'none', col: IRON, radius: 1.67, cm: F({ w: 30, h: 30 }),
      face: F({ field: [118, 96, 72], figure: [150, 62, 48], rim: [104, 112, 120], boss: [176, 184, 188] }), notes: 'a fist-sized round deck shield: iron rim and boss on a leather-faced board, a corsair\'s red band [PROPOSED]' }),
    a_p85_buckler: F({ id: 'a_p85_buckler', slot: 'shield', material: 'bellbronze', shape: 'buckler', pattern: 'none', col: C([196, 158, 76], [140, 108, 48], [236, 206, 128]), radius: 1.67, cm: F({ w: 30, h: 30 }),
      face: F({ field: [186, 148, 70], figure: [120, 92, 44], rim: [214, 180, 100], boss: [236, 210, 140] }), notes: 'a round of brass from the market cross, stamped with the weights and measures: the Market-Warden\'s Buckler, from Cross Pool (Phase 85)' }),
    a_kite: F({ id: 'a_kite', slot: 'shield', material: 'wood', shape: 'kite', pattern: 'none', col: C([94, 60, 50], [62, 38, 32], [130, 88, 72]), width: 6.7, height: 10, cm: F({ w: 60, h: 90 }),
      face: F({ field: [94, 60, 50], figure: [210, 196, 166], rim: [176, 150, 98], boss: [200, 164, 80] }), notes: 'long and heavy, painted with the Synod\'s dead queen: a pale crowned figure on an oxblood field [PROPOSED: the colours]' }),
    // ---- Phase 87 (c): the new pieces of the fourteen sets. `form` is the piece's own silhouette inside its slot's
    // shape (the card and the first-person view draw it; anything that only knows the shape still draws the shape).
    // Every look here is [PROPOSED] under the approved Phase 87 design; the world's own colours and marks.
    // capes (the sixth slot): shape 'cape'; len = how far down the back (0 the shoulders, 1 the ankles)
    a_p87_tan_cape: F({ id: 'a_p87_tan_cape', slot: 'cape', material: 'leather', shape: 'cape', form: 'shoulder', pattern: 'grain', len: 0.12, col: C([112, 72, 42], [74, 46, 26], [152, 104, 66], null, [214, 200, 168]), notes: 'a short shoulder-cape of oiled hide, Fenning\'s scraper-mark burned in at the throat, a bone toggle (trim)' }),
    a_p87_hush_cloak: F({ id: 'a_p87_hush_cloak', slot: 'cape', material: 'hushwool', shape: 'cape', form: 'cloak', pattern: 'weave', len: 0.8, col: C([50, 72, 66], [30, 46, 42], [78, 102, 92], null, [118, 104, 70]), notes: 'packed Hedge wool to the calf, a woven border of the weavers\' thorn pattern (trim), a deep hood thrown back' }),
    a_p87_reg_cape: F({ id: 'a_p87_reg_cape', slot: 'cape', material: 'oilcloth', shape: 'cape', form: 'tippet', pattern: 'none', len: 0.0, col: C([122, 128, 128], [84, 90, 92], [166, 170, 168], null, [212, 212, 196]), notes: 'a clerk\'s tippet of grey oilcloth over the shoulders, silver braid at the edge, a small silver seal (trim)' }),
    a_p87_ars_cape: F({ id: 'a_p87_ars_cape', slot: 'cape', material: 'hushwool', shape: 'cape', form: 'halfcloak', pattern: 'weave', len: 0.45, col: C([104, 44, 40], [68, 28, 26], [140, 66, 58], null, [218, 206, 180]), notes: 'an oxblood half-cloak on the left shoulder, pinned with a steel brooch of the dead queen\'s head (trim: ivory)' }),
    a_p87_leg_pennon: F({ id: 'a_p87_leg_pennon', slot: 'cape', material: 'linen', shape: 'cape', form: 'pennon', pattern: 'none', len: 0.7, col: C([86, 120, 102], [56, 82, 68], [124, 156, 136], null, [190, 152, 78]), notes: 'a narrow verdigris banner from the shoulders, a dead name stitched down it, a small bronze bell at the tail (trim)' }),
    a_p87_pro_cape: F({ id: 'a_p87_pro_cape', slot: 'cape', material: 'oilcloth', shape: 'cape', form: 'raincape', pattern: 'none', len: 0.3, col: C([108, 114, 116], [72, 78, 82], [150, 156, 156], null, [228, 228, 220]), notes: 'grey oilcloth to the hip, the Catalogue index-number painted inside in white (trim)' }),
    a_p87_can_mantle: F({ id: 'a_p87_can_mantle', slot: 'cape', material: 'hushwool', shape: 'cape', form: 'mantle', pattern: 'stave', len: 0.08, col: C([206, 196, 176], [150, 140, 122], [232, 224, 206], null, [96, 74, 102]), notes: 'a cream choir-mantle over the shoulders, the five lines of a stave stitched round the hem in plum (trim)' }),
    a_p87_sip_cape: F({ id: 'a_p87_sip_cape', slot: 'cape', material: 'canvas', shape: 'cape', form: 'short', pattern: 'scorch', len: 0.22, col: C([66, 64, 62], [42, 40, 40], [98, 94, 90], null, [196, 158, 76]), notes: 'waxed canvas the colour of cold ash, scorched at the hem, a brass valve-wheel for a clasp (trim)' }),
    a_p87_wks_cape: F({ id: 'a_p87_wks_cape', slot: 'cape', material: 'canvas', shape: 'cape', form: 'tarp', pattern: 'stencil', len: 0.35, col: C([112, 108, 78], [76, 72, 50], [150, 146, 108], null, [150, 58, 44]), notes: 'a square of company tarpaulin tied at the throat with cord, CONSORTIUM stencilled across it in faded red (trim)' }),
    a_p87_cap_cape: F({ id: 'a_p87_cap_cape', slot: 'cape', material: 'hushwool', shape: 'cape', form: 'boatcloak', pattern: 'weave', len: 0.6, col: C([46, 56, 78], [28, 34, 50], [72, 84, 108], null, [150, 54, 44]), notes: 'a heavy navy boat-cloak lined in red (trim), thrown back over one shoulder, a silver bosun\'s whistle on a chain' }),
    a_p87_dro_plaid: F({ id: 'a_p87_dro_plaid', slot: 'cape', material: 'hushwool', shape: 'cape', form: 'plaid', pattern: 'check', len: 0.55, col: C([200, 190, 160], [146, 136, 110], [226, 218, 192], null, [96, 70, 48]), notes: 'a long chalk-and-peat checked plaid (trim: the peat brown), wrapped over the left shoulder and belted' }),
    a_p92_shadecloak: F({ id: 'a_p92_shadecloak', slot: 'cape', material: 'hushwool', shape: 'cape', form: 'cloak', pattern: 'none', len: 0.85, col: C([22, 20, 26], [12, 11, 15], [40, 38, 46], null, [200, 182, 136]), notes: 'the Umbral Shade-Cloak (Phase 92): black wool cut wide to lend its shade behind, a small sun scratched in the lining (trim) [PROPOSED]' }),
    a_p87_bar_cloak: F({ id: 'a_p87_bar_cloak', slot: 'cape', material: 'hushwool', shape: 'cape', form: 'cloak', pattern: 'weave', len: 0.9, col: C([96, 92, 84], [62, 60, 54], [128, 124, 114], null, [170, 136, 74]), notes: 'earth-grey grave-wool to the ankle, a bronze ring-brooch as big as a hand at the shoulder (trim)' }),
    a_p87_flu_cape: F({ id: 'a_p87_flu_cape', slot: 'cape', material: 'oilcloth', shape: 'cape', form: 'raincape', pattern: 'none', len: 0.28, col: C([176, 138, 60], [124, 94, 38], [212, 178, 98], null, [70, 66, 60]), notes: 'a yellow-ochre oilskin shoulder-cape, an iron lantern-hook at the shoulder (trim)' }),
    a_p87_old_pelt: F({ id: 'a_p87_old_pelt', slot: 'cape', material: 'skin', shape: 'cape', form: 'pelt', pattern: 'fur', len: 0.5, col: C([146, 92, 56], [100, 60, 34], [184, 132, 90], null, [228, 214, 186]), notes: 'a red deer\'s hide over the shoulders, fur out, the forelegs knotted at the chest; a pale throat-patch (trim)' }),
    // heads
    a_p87_reg_biretta: F({ id: 'a_p87_reg_biretta', slot: 'head', material: 'felt', shape: 'cap', form: 'biretta', pattern: 'none', col: C([112, 118, 120], [76, 80, 84], [152, 156, 156], null, [212, 212, 196]), notes: 'a square grey biretta, three ridges on the crown, a silver tassel (trim); the clerk\'s number inked in the band' }),
    a_p87_ars_sallet: F({ id: 'a_p87_ars_sallet', slot: 'head', material: 'steel', shape: 'kettle', form: 'sallet', pattern: 'rivets', col: C([150, 158, 166], [90, 98, 110], [210, 216, 220], [44, 48, 58], [104, 44, 40]), notes: 'Synod arsenal steel: a long tail over the neck, a raised visor, an oxblood plume-tube (trim), a stamped tag' }),
    a_p87_pro_hood: F({ id: 'a_p87_pro_hood', slot: 'head', material: 'oilcloth', shape: 'hood', form: 'mesh', pattern: 'none', col: C([110, 116, 118], [74, 80, 84], [150, 156, 156], null, [206, 212, 216]), notes: 'the Office\'s grey oilcloth hood with silver mesh over the face (trim): no one sees who is inside' }),
    a_p94_cap: F({ id: 'a_p94_cap', slot: 'head', material: 'leather', shape: 'cap', form: 'platecap', pattern: 'grain', col: C([74, 58, 42], [46, 36, 26], [108, 88, 66], null, [122, 126, 132]), notes: 'the Winchman\'s Cap (Phase 94): padded black-brown leather with an iron plate riveted over the crown (trim) [PROPOSED]' }),
    a_p94_gloves: F({ id: 'a_p94_gloves', slot: 'hands', material: 'leather', shape: 'gauntlets', form: 'brake', pattern: 'scale', col: C([46, 42, 38], [28, 26, 24], [72, 66, 60], [20, 20, 22], [138, 142, 148]), notes: 'Brake-Gloves (Phase 94): black leather, the palms faced with iron scale for the brake-wheel (trim) [PROPOSED]' }),
    a_p94_harness: F({ id: 'a_p94_harness', slot: 'body', material: 'leather', shape: 'jerkin', form: 'harness', pattern: 'straps', len: 0.1, col: C([30, 28, 26], [18, 16, 16], [52, 48, 44], null, [184, 188, 194]), notes: 'the Chain-Crew Harness (Phase 94): crossed black leather straps and iron rings (trim) worn bright, to clip a man to a link [PROPOSED]' }),
    a_p95_robe: F({ id: 'a_p95_robe', slot: 'body', material: 'linen', shape: 'robe', form: 'pilgrim', pattern: 'none', len: 1.0, col: C([236, 232, 222], [196, 192, 182], [250, 248, 240], null, [58, 54, 50]), notes: 'the Pilgrim\'s Robe (Phase 95): plain white linen to the ankle, a number stitched in black at the neck (trim) [PROPOSED]' }),
    a_p95_cowl: F({ id: 'a_p95_cowl', slot: 'head', material: 'linen', shape: 'hood', form: 'cowl', pattern: 'none', col: C([20, 18, 24], [8, 8, 10], [46, 44, 54], null, [70, 68, 80]), notes: 'the Bearer\'s Cowl (Phase 95): black silk, cut from the same bolt as the Church\'s canopies, with a sheen on the folds (trim) [PROPOSED]' }),
    a_p95_sandals: F({ id: 'a_p95_sandals', slot: 'feet', material: 'canvas', shape: 'shoes', form: 'sandals', pattern: 'none', col: C([224, 216, 196], [176, 168, 148], [244, 240, 228], null, [232, 228, 216]), notes: 'the Pilgrim\'s Sandals (Phase 95): rope soles and linen straps bleached white, over a white sock (trim) [PROPOSED]' }),
    a_p97_wrap: F({ id: 'a_p97_wrap', slot: 'head', material: 'linen', shape: 'hood', form: 'wound', pattern: 'weave', col: C([20, 18, 22], [8, 8, 10], [44, 42, 50], null, [184, 160, 140]), notes: 'the Scavenger\'s Wrap (Phase 97): black cloth wound round the head and face until only the eyes show (trim = the strip of skin at the eyes) (Book Two ch. 10) [PROPOSED]' }),
    a_p97_gloves: F({ id: 'a_p97_gloves', slot: 'hands', material: 'linen', shape: 'gloves', form: 'darned', pattern: 'weave', col: C([18, 17, 20], [8, 8, 10], [40, 38, 46], null, [236, 232, 222]), notes: 'the Scavenger\'s Gloves (Phase 97): black gloves, darned in black, one finger of the left once darned in white (trim) (Book Two ch. 10) [PROPOSED]' }),
    a_p97_coat: F({ id: 'a_p97_coat', slot: 'body', material: 'oilcloth', shape: 'longcoat', form: 'halfbone', pattern: 'none', len: 0.95, col: C([22, 20, 24], [10, 10, 12], [58, 54, 58], null, [128, 122, 116]), notes: 'the Scavenger\'s Coat (Phase 97): a long black coat with a hood-collar, one whole side gone the colour of bone and dyed back twice (trim = the bone still showing at the seams) [PROPOSED]' }),
    a_p100_coat: F({ id: 'a_p100_coat', slot: 'body', material: 'quilt', shape: 'longcoat', form: 'leaded', pattern: 'plates', len: 0.95, col: C([104, 108, 114], [68, 72, 78], [150, 154, 160], [34, 36, 42], [232, 230, 222]), notes: 'the Watch Coat (Phase 100): a long grey coat with dull lead plates sewn into it in rows, a white square of cloth on the breast for a rota-number (trim) (Book Three ch. 2)' }),
    a_p100_mitts: F({ id: 'a_p100_mitts', slot: 'hands', material: 'felt', shape: 'gloves', form: 'mitts', pattern: 'none', col: C([122, 126, 134], [82, 86, 94], [180, 184, 192], null, [150, 132, 110]), notes: 'the Wall Mitts (Phase 100): grey wool mitts with a palm of lead foil quilted in, the thumbs darned in brown (trim) [PROPOSED]' }),
    a_p100_felts: F({ id: 'a_p100_felts', slot: 'feet', material: 'felt', shape: 'softboots', form: 'felted', pattern: 'none', col: C([154, 150, 140], [110, 106, 98], [190, 186, 176], null, [70, 72, 78]), notes: 'the Powder-Felts (Phase 100): felt overshoes from the magazines, grey with powder (trim), no nail and no iron in them [PROPOSED]' }),
    a_p92_lamphood: F({ id: 'a_p92_lamphood', slot: 'head', material: 'linen', shape: 'hood', form: 'cowl', pattern: 'scorch', col: C([138, 42, 28], [44, 22, 20], [180, 70, 42], null, [90, 26, 18]), notes: 'the Lamplighter\'s Hood (Phase 92): a Flambeau\'s hood, the red of banked coals (Book One ch. 7), gone rust-black in seven years below the line [PROPOSED]' }),
    a_p87_can_cowl: F({ id: 'a_p87_can_cowl', slot: 'head', material: 'hushwool', shape: 'hood', form: 'cowl', pattern: 'weave', col: C([96, 76, 100], [64, 50, 68], [130, 108, 132], null, [196, 160, 80]), notes: 'a soft plum cowl folded to the shoulders, open about the ears so they are free to listen; a brass fork-pin (trim)' }),
    a_p87_sip_goggles: F({ id: 'a_p87_sip_goggles', slot: 'head', material: 'leather', shape: 'cap', form: 'goggles', pattern: 'grain', col: C([84, 58, 40], [56, 38, 26], [120, 88, 62], null, [196, 158, 76]), notes: 'a scorched leather skullcap, smoked-glass goggles in brass cups (trim) pushed up on the brow' }),
    a_p87_cap_bandana: F({ id: 'a_p87_cap_bandana', slot: 'head', material: 'linen', shape: 'cap', form: 'bandana', pattern: 'none', col: C([158, 58, 46], [108, 36, 30], [196, 96, 76], null, [200, 164, 84]), notes: 'a sea-faded red headscarf knotted at the back, a brass ring through one corner (trim)' }),
    a_p87_dro_hat: F({ id: 'a_p87_dro_hat', slot: 'head', material: 'felt', shape: 'kettle', form: 'widehat', pattern: 'none', col: C([92, 76, 58], [62, 50, 38], [128, 108, 84], null, [196, 186, 150]), notes: 'a drover\'s wide-awake: rain-shaped brown felt, a tally-cord and a sprig of chalk heather in the band (trim)' }),
    a_p87_flu_cap: F({ id: 'a_p87_flu_cap', slot: 'head', material: 'oilcloth', shape: 'cap', form: 'flapcap', pattern: 'none', col: C([66, 60, 50], [42, 38, 32], [98, 90, 76], null, [176, 138, 60]), notes: 'a lengthsman\'s tarred hat, low in the crown, a long back flap to carry the rain off the neck' }),
    a_p87_old_crown: F({ id: 'a_p87_old_crown', slot: 'head', material: 'wood', shape: 'cap', form: 'crown', pattern: 'grain', col: C([108, 82, 56], [72, 54, 36], [146, 116, 82], null, [226, 214, 190]), notes: 'a band of plaited lime-bark set with two short red-deer tines (trim), from the Antler Galleries' }),
    // bodies
    a_p87_pro_coat: F({ id: 'a_p87_pro_coat', slot: 'body', material: 'oilcloth', shape: 'longcoat', form: 'proctor', pattern: 'none', len: 0.75, col: C([106, 112, 114], [70, 76, 80], [146, 152, 152], null, [84, 88, 90]),
      sleeve: F({ material: 'oilcloth', col: [106, 112, 114], cuff: [84, 88, 90] }), notes: 'the Catalogue field staff\'s long grey oilcloth, a felted collar, the buttons covered so they never click' }),
    a_p87_can_cassock: F({ id: 'a_p87_can_cassock', slot: 'body', material: 'hushwool', shape: 'robe', form: 'cassock', pattern: 'stave', len: 0.95, col: C([92, 72, 98], [60, 46, 66], [126, 104, 130], null, [214, 200, 170]),
      sleeve: F({ material: 'hushwool', col: [92, 72, 98], cuff: [60, 46, 66] }), notes: 'dusty plum to the ankle, a row of small horn buttons, the staves of a hymn stitched round the hem in cream (trim)' }),
    a_p87_sip_apron: F({ id: 'a_p87_sip_apron', slot: 'body', material: 'leather', shape: 'jerkin', form: 'apron', pattern: 'grain', len: 0.62, col: C([88, 60, 42], [58, 38, 26], [124, 90, 64], null, [196, 158, 76]),
      sleeve: F({ material: 'linen', col: [164, 150, 128], cuff: [88, 60, 42], bracer: true, rolled: true }), notes: 'a heavy furnace-apron of scorched hide to the shin, a brass pressure-badge on the bib (trim); sleeves rolled' }),
    a_p87_cap_coat: F({ id: 'a_p87_cap_coat', slot: 'body', material: 'hushwool', shape: 'longcoat', form: 'captain', pattern: 'weave', len: 0.55, col: C([54, 76, 98], [34, 50, 66], [84, 108, 130], null, [190, 160, 84]),
      sleeve: F({ material: 'hushwool', col: [54, 76, 98], cuff: [190, 160, 84] }), notes: 'a faded sea-blue coat to the knee, deep turned-back cuffs, brass buttons going green with salt (trim)' }),
    a_p87_old_hide: F({ id: 'a_p87_old_hide', slot: 'body', material: 'leather', shape: 'jerkin', form: 'hide', pattern: 'fur', len: 0.3, col: C([150, 108, 70], [104, 72, 44], [188, 146, 102], null, [120, 88, 58]),
      sleeve: F({ material: 'skin', col: null, cuff: null, rolled: true }), notes: 'a deer-hide tunic laced down the sides with sinew, the hair left on at the shoulders; bare arms' }),
    // hands
    a_p87_hush_mitts: F({ id: 'a_p87_hush_mitts', slot: 'hands', material: 'hushwool', shape: 'gloves', form: 'mitts', pattern: 'weave', col: C([60, 86, 80], [38, 56, 52], [90, 116, 106]), notes: 'felted Hedge-wool mitts, the fingers split for a knife and a sling-cord' }),
    a_p87_reg_cuffs: F({ id: 'a_p87_reg_cuffs', slot: 'hands', material: 'leather', shape: 'gloves', form: 'cuffs', pattern: 'none', col: C([58, 58, 62], [38, 38, 42], [90, 90, 96], null, [212, 212, 196]), notes: 'fingerless black kid, oilcloth sleeve-guards stained with lamp-black, a silver RECONCILIATION pin (trim)' }),
    a_p87_leg_vambraces: F({ id: 'a_p87_leg_vambraces', slot: 'hands', material: 'bellbronze', shape: 'gauntlets', form: 'vambrace', pattern: 'plates', col: C([166, 128, 66], [110, 82, 42], [222, 192, 124], [60, 42, 20], [96, 130, 108]), notes: 'bell-bronze vambraces over leaded gloves, a line of the bell\'s inscription cast round each, verdigris in the letters (trim)' }),
    a_p87_pro_gloves: F({ id: 'a_p87_pro_gloves', slot: 'hands', material: 'felt', shape: 'gloves', form: 'felted', pattern: 'none', col: C([96, 100, 104], [64, 68, 72], [134, 138, 140], null, [70, 72, 74]), notes: 'grey gloves felted on the palm, so a rod does not slip and a fork does not ring' }),
    a_p87_sip_gauntlets: F({ id: 'a_p87_sip_gauntlets', slot: 'hands', material: 'leather', shape: 'gloves', form: 'longcuff', pattern: 'quilt', col: C([124, 96, 62], [84, 62, 38], [164, 132, 90], null, [40, 32, 28]), notes: 'quilted hide to the elbow, scorched black at the fingertips (trim)' }),
    a_p87_wks_gauntlets: F({ id: 'a_p87_wks_gauntlets', slot: 'hands', material: 'canvas', shape: 'gauntlets', form: 'rigger', pattern: 'rivets', col: C([118, 106, 76], [80, 70, 48], [156, 142, 104], null, [196, 164, 92]), notes: 'company canvas with riveted leather palms, a brass tag with somebody else\'s number (trim)' }),
    a_p87_cap_gloves: F({ id: 'a_p87_cap_gloves', slot: 'hands', material: 'canvas', shape: 'gloves', form: 'tarred', pattern: 'none', col: C([54, 50, 46], [34, 32, 30], [82, 76, 70], null, [150, 124, 84]), notes: 'tarred deck-canvas, rope-burned pale across the palm (trim)' }),
    a_p87_dro_mittens: F({ id: 'a_p87_dro_mittens', slot: 'hands', material: 'hushwool', shape: 'gloves', form: 'mitts', pattern: 'weave', col: C([214, 204, 180], [160, 150, 128], [236, 230, 212]), notes: 'undyed Farrant fleece, the thumb sewn open for the crook' }),
    a_p87_bar_bracers: F({ id: 'a_p87_bar_bracers', slot: 'hands', material: 'bellbronze', shape: 'gauntlets', form: 'coils', pattern: 'none', col: C([150, 128, 76], [100, 84, 48], [204, 182, 122], [56, 46, 24], [92, 138, 112]), notes: 'bronze arm-rings coiled from wrist to elbow over bare hands, green with age (trim) from a barrow grave' }),
    a_p87_flu_gloves: F({ id: 'a_p87_flu_gloves', slot: 'hands', material: 'leather', shape: 'gloves', form: 'longcuff', pattern: 'none', col: C([62, 54, 44], [40, 34, 28], [92, 82, 68], null, [118, 120, 120]), notes: 'tarred leather to the forearm, an iron sluice-key on a thong at the wrist (trim)' }),
    a_p87_old_wraps: F({ id: 'a_p87_old_wraps', slot: 'hands', material: 'linen', shape: 'gloves', form: 'wraps', pattern: 'weave', col: C([168, 146, 104], [118, 100, 68], [204, 184, 140]), notes: 'hands and wrists wound with strips of lime-bark cord, the fingertips bare' }),
    // feet
    a_p87_reg_shoes: F({ id: 'a_p87_reg_shoes', slot: 'feet', material: 'leather', shape: 'shoes', form: 'buckle', pattern: 'none', col: C([44, 42, 46], [28, 26, 30], [72, 70, 76], null, [212, 212, 196]), notes: 'black low shoes with square silver buckles (trim), felted soles for corridor work' }),
    a_p87_leg_sabatons: F({ id: 'a_p87_leg_sabatons', slot: 'feet', material: 'bellbronze', shape: 'greaves', form: 'sabatons', pattern: 'plates', col: C([160, 124, 64], [106, 80, 40], [216, 186, 118], [58, 40, 20], [70, 72, 76]), notes: 'bronze foot-plates and shin-lames over lead-soled boots (trim = the lead); they toll on stone' }),
    a_p87_pro_boots: F({ id: 'a_p87_pro_boots', slot: 'feet', material: 'oilcloth', shape: 'softboots', form: 'tall', pattern: 'none', col: C([92, 98, 102], [60, 66, 70], [130, 136, 138]), notes: 'grey oilcloth to the knee, felt-soled: they stand an hour without a creak' }),
    a_p87_can_sandals: F({ id: 'a_p87_can_sandals', slot: 'feet', material: 'leather', shape: 'shoes', form: 'sandals', pattern: 'none', col: C([130, 96, 62], [88, 62, 38], [170, 132, 92], null, [170, 160, 150]), notes: 'pilgrim\'s sandals over grey wool socks (trim): the road to the Howe is walked, not ridden' }),
    a_p87_sip_boots: F({ id: 'a_p87_sip_boots', slot: 'feet', material: 'leather', shape: 'hobnails', form: 'clog', pattern: 'none', col: C([70, 52, 40], [46, 34, 26], [102, 80, 62], null, [196, 158, 76]), notes: 'thick wooden soles for standing on hot plate, brass toecaps (trim)' }),
    a_p87_wks_boots: F({ id: 'a_p87_wks_boots', slot: 'feet', material: 'leather', shape: 'hobnails', form: 'steeltoe', pattern: 'studs', col: C([104, 96, 86], [70, 64, 56], [146, 138, 126], null, [120, 126, 130]), notes: 'hobnails with iron toecaps (trim), chalk-white with stone dust' }),
    a_p87_cap_boots: F({ id: 'a_p87_cap_boots', slot: 'feet', material: 'leather', shape: 'hobnails', form: 'topboot', pattern: 'grain', col: C([62, 44, 32], [40, 28, 20], [94, 70, 52], null, [124, 98, 70]), notes: 'salt-cracked sea boots to the knee, the tops turned down in a wide cuff (trim)' }),
    a_p87_bar_greaves: F({ id: 'a_p87_bar_greaves', slot: 'feet', material: 'bellbronze', shape: 'greaves', form: 'spiral', pattern: 'plates', col: C([146, 126, 76], [98, 82, 48], [198, 178, 120], [54, 44, 24], [110, 100, 84]), notes: 'bronze shin-guards with spiral bosses at the knee, over wrapped wool leggings (trim)' }),
    a_p87_old_shoes: F({ id: 'a_p87_old_shoes', slot: 'feet', material: 'leather', shape: 'softboots', form: 'turnshoe', pattern: 'fur', col: C([140, 104, 70], [96, 70, 46], [178, 142, 102]), notes: 'soft one-piece hide shoes gathered at the ankle with a thong, moss stuffed in the heel' }),
    // shields
    a_p87_tan_shield: F({ id: 'a_p87_tan_shield', slot: 'shield', material: 'leather', shape: 'buckler', form: 'targe', pattern: 'none', col: C([146, 108, 66], [100, 72, 42], [186, 146, 98]), radius: 2.4, cm: F({ w: 44, h: 44 }),
      face: F({ field: [146, 108, 66], figure: [200, 160, 70], rim: [214, 196, 160], boss: [200, 160, 70] }), notes: 'a hide targe: a board faced with three layers of boiled hide, laced with rawhide at the rim, brass tacks in a spiral' }),
    a_p87_leg_shield: F({ id: 'a_p87_leg_shield', slot: 'shield', material: 'bellbronze', shape: 'buckler', form: 'bellshield', pattern: 'none', col: BRONZE, radius: 3.0, cm: F({ w: 56, h: 56 }),
      face: F({ field: [172, 134, 70], figure: [92, 128, 104], rim: [134, 100, 52], boss: [214, 182, 110] }), notes: 'a cracked bell\'s lip, cut flat and hammered round: its inscription still runs about the rim, verdigris in the letters' }),
    a_p87_wks_pavise: F({ id: 'a_p87_wks_pavise', slot: 'shield', material: 'wood', shape: 'kite', form: 'pavise', pattern: 'none', col: C([132, 104, 70], [90, 70, 46], [170, 140, 100]), width: 6.0, height: 11, cm: F({ w: 54, h: 100 }),
      face: F({ field: [132, 104, 70], figure: [150, 58, 44], rim: [86, 90, 94], boss: [196, 164, 92] }), notes: 'pit-prop planks bound with strap iron (rim), a stencilled red serial, a brass sighting slot' }),
    a_p87_bar_shield: F({ id: 'a_p87_bar_shield', slot: 'shield', material: 'bellbronze', shape: 'buckler', form: 'ribbed', pattern: 'none', col: C([150, 128, 76], [100, 84, 48], [204, 182, 122]), radius: 2.8, cm: F({ w: 52, h: 52 }),
      face: F({ field: [138, 118, 70], figure: [92, 138, 112], rim: [164, 142, 86], boss: [196, 176, 116] }), notes: 'a barrow round-shield: bronze over wood in rings of ribs and studs, the boss hollow; green with age (figure)' }),
  });
  // empty slots
  const BARE = F({
    head: F({ id: null, bare: true, slot: 'head', material: 'skin', shape: 'bare', pattern: 'none', col: null }),
    body: F({ id: null, bare: true, slot: 'body', material: 'linen', shape: 'shirt', pattern: 'weave', len: 0.1, col: null,   // col: the calling's coat (see of())
      sleeve: F({ material: 'linen', col: null, cuff: null, rolled: true }) }),
    hands: F({ id: null, bare: true, slot: 'hands', material: 'skin', shape: 'bare', pattern: 'none', col: null }),
    feet: F({ id: null, bare: true, slot: 'feet', material: 'leather', shape: 'shoes', pattern: 'none', col: C([66, 50, 38], [44, 32, 24], [96, 74, 56]) }),
  });

  // ---- weapons ----------------------------------------------------------------------------------------------------------
  const W = (id, kind, grip, material, len, col, img, notes) => F({ id, kind, grip, material, len, col: F(col), img, notes: notes || '' });
  const STEEL = { blade: [168, 176, 184], edge: [226, 230, 232], grip: [92, 60, 38], guard: [120, 112, 100] };
  const WEP = F({
    hands: W('hands', 'fists', 'none', 'skin', 0, {}, 'fp_hands', 'bare fists'),
    glass: W('glass', 'glassarm', 'innate', 'glass', 0, { blade: GLASS.base, edge: GLASS.light }, 'fp_glass', 'the arm itself, glassed past the elbow'),
    sword: W('sword', 'sword', 'one', 'steel', 8, STEEL, 'fp_sword', 'Synod iron, a plain cross-guard'),
    knife: W('knife', 'knife', 'one', 'steel', 3.5, { blade: [160, 166, 172], edge: [220, 224, 226], grip: [104, 70, 42], guard: [80, 64, 48] }, 'fp_knife', 'a wool-carder\'s blade'),
    longsword: W('longsword', 'longsword', 'one', 'steel', 11, { blade: [176, 184, 192], edge: [232, 236, 238], grip: [70, 46, 32], guard: [142, 134, 122] }, 'fp_longsword', 'arsenal steel, long cross-guard'),
    axe: W('axe', 'axe', 'one', 'steel', 8, { blade: [150, 156, 160], edge: [214, 218, 220], grip: [110, 74, 44], head: [150, 156, 160] }, 'fp_axe', 'bearded head and a hatch spike'),
    mace: W('mace', 'mace', 'one', 'bellbronze', 7, { blade: [178, 146, 74], edge: [230, 204, 132], grip: [74, 70, 66], head: [178, 146, 74] }, 'fp_mace', 'flanged bell-bronze head on an iron haft'),
    tollhammer: W('tollhammer', 'hammer', 'one', 'bellbronze', 8, { blade: [168, 134, 66], edge: [224, 196, 124], grip: [96, 64, 40], head: [168, 134, 66] }, 'fp_mace', 'a bell-ringer\'s hammer, bell-bronze'),
    spear: W('spear', 'spear', 'two', 'bellbronze', 22, { blade: [176, 142, 72], edge: [228, 202, 130], grip: [124, 92, 58], head: [176, 142, 72] }, 'fp_spear', 'a bronze tuning fork on an ash shaft'),
    maul: W('maul', 'maul', 'two', 'steel', 12, { blade: [120, 126, 130], edge: [190, 194, 196], grip: [88, 92, 96], head: [120, 126, 130], guard: [196, 160, 80] }, 'fp_maul', 'a foundry hammer with a brass pressure gauge (guard)'),
    pistol: W('pistol', 'pistol', 'one', 'wood', 5, { blade: [70, 66, 64], edge: [180, 236, 244], grip: [104, 66, 40], guard: [190, 156, 84] }, 'fp_pistol', 'walnut stock, brass furniture, a glass pellet at the muzzle (edge)'),
    crossbow: W('crossbow', 'crossbow', 'two', 'wood', 9, { blade: [140, 146, 150], edge: [210, 206, 190], grip: [108, 70, 42], guard: [80, 84, 90] }, 'fp_crossbow', 'iron prod (blade), a wooden stock'),
    throwknife: W('throwknife', 'throwing', 'one', 'steel', 3, { blade: [160, 166, 172], edge: [220, 224, 226], grip: [70, 60, 52], guard: [70, 60, 52] }, 'fp_knife', 'balanced carder\'s blades, a fan of them in the off hand [PROPOSED]'),
    tobin_blade: W('tobin_blade', 'longsword', 'one', 'bellbronze', 11, { blade: [190, 156, 88], edge: [240, 220, 160], grip: [60, 44, 34], guard: [176, 140, 70] }, 'fp_longsword', 'Tobin\'s tuning-blade: bronze, ground to ring at 174'),
    vesper_hook: W('vesper_hook', 'axe', 'one', 'steel', 9, { blade: [132, 138, 146], edge: [214, 218, 222], grip: [66, 44, 30], head: [132, 138, 146], guard: [150, 62, 48] }, 'fp_axe', 'Vesper\'s deck-axe, a red-wrapped haft [PROPOSED]'),
    sable_dagger: W('sable_dagger', 'knife', 'one', 'glass', 3.5, { blade: [222, 214, 196], edge: [196, 168, 236], grip: [40, 34, 40], guard: [196, 168, 236] }, 'fp_knife', 'an ivory stylus-knife tipped with lilac glass'),
    p12_greatmaul: W('p12_greatmaul', 'maul', 'two', 'iron', 16, { blade: [106, 110, 116], edge: [170, 176, 180], grip: [150, 120, 84], head: [106, 110, 116], guard: [88, 90, 92] }, 'fp_maul', 'a quarry sledge, lead-weighted, an ash haft as long as a man'),
    p12_glassblade: W('p12_glassblade', 'greatsword', 'two', 'glass', 14, { blade: [150, 214, 222], edge: [214, 250, 248], grip: [58, 46, 40], guard: [130, 134, 140] }, 'fp_longsword', 'a corsair\'s two-handed blade, the edge ground from salvaged Aether-Glass'),
    p12_bellglaive: W('p12_bellglaive', 'glaive', 'two', 'bellbronze', 22, { blade: [180, 146, 76], edge: [232, 206, 134], grip: [120, 88, 56], head: [180, 146, 76] }, 'fp_spear', 'a curved bell-bronze blade on a six-foot shaft'),
    p22_crook: W('p22_crook', 'spear', 'two', 'wood', 22, { blade: [206, 190, 150], edge: [234, 222, 190], grip: [124, 92, 58], head: [206, 190, 150] }, 'fp_spear', 'an ash crook with a horn head [PROPOSED] (Phase 22b)'),
    p79_staff: W('p79_staff', 'spear', 'two', 'wood', 22, { blade: [150, 156, 160], edge: [208, 212, 214], grip: [124, 92, 58], head: [150, 156, 160] }, 'fp_spear', 'an ash staff shod with iron at both ends: the Old Cantor\'s Staff, from Singers\' Howe (Phase 79)'),
    p22_shears: W('p22_shears', 'knife', 'one', 'steel', 3.5, { blade: [170, 176, 180], edge: [226, 230, 232], grip: [110, 80, 50], guard: [110, 80, 50] }, 'fp_knife', 'sheep-shears, the bow filed sharp [PROPOSED] (Phase 22b)'),
    p22_leafblade: W('p22_leafblade', 'sword', 'one', 'bellbronze', 8, { blade: [186, 150, 80], edge: [236, 210, 140], grip: [90, 64, 40], guard: [160, 124, 60] }, 'fp_sword', 'a leaf-shaped bronze sword from a barrow grave [PROPOSED] (Phase 22b)'),
    p85_pole: W('p85_pole', 'spear', 'two', 'wood', 28, { blade: [96, 100, 104], edge: [150, 154, 158], grip: [176, 150, 110], head: [96, 100, 104] }, 'fp_spear', 'twelve feet of pale ash shod with iron: the Punt-Pole, from the Sunk Lanes (Phase 85)'),
    p94_lever: W('p94_lever', 'maul', 'two', 'iron', 19, { blade: [74, 78, 84], edge: [128, 132, 138], grip: [52, 54, 58], head: [96, 100, 106] }, 'fp_maul', 'the spare lever of an old winch: black iron as long as an oar, a square socket at its head: the Brake-Lever, from the Anchorage (Phase 94) [PROPOSED]'),
    p97_hook: W('p97_hook', 'spear', 'two', 'iron', 23, { blade: [84, 88, 96], edge: [150, 154, 162], grip: [34, 28, 24], head: [14, 14, 18] }, 'fp_spear', 'a scavenger\'s iron hook on a black ash pole, a rag of black cloth knotted under the iron, the pole notched end to end, five and a bar: the Tallyman\'s Hook, from the White Mile (Phase 97) [PROPOSED]'),
    p95_stave: W('p95_stave', 'maul', 'two', 'iron', 21, { blade: [30, 30, 34], edge: [84, 84, 92], grip: [24, 24, 28], head: [120, 92, 44] }, 'fp_maul', 'a Flambeau\'s fire-stave gone dark: black iron as tall as a man, an iron cage at its head, the lump of amber glass in it cold: the Dark Stave, from the Pilgrim Chain (Phase 95; Book One ch. 7) [PROPOSED]'),
    p92_clothpole: W('p92_clothpole', 'spear', 'two', 'wood', 24, { blade: [70, 72, 76], edge: [120, 124, 128], grip: [110, 84, 56], head: [70, 72, 76] }, 'fp_spear', 'a scavenger\'s ash pole with a black cloth on a crossbar at its head, for finding where the Bleach is too strong (Phase 92) [PROPOSED]'),
    p85_hook: W('p85_hook', 'glaive', 'two', 'iron', 22, { blade: [84, 88, 92], edge: [140, 146, 150], grip: [150, 120, 82], head: [84, 88, 92] }, 'fp_spear', 'a boat-hook on an ash pole: the Lengthsman\'s Hook, from the Dry Flume (Phase 85)'),
    p85_bough: W('p85_bough', 'mace', 'one', 'wood', 9, { blade: [58, 60, 56], edge: [96, 104, 84], grip: [72, 64, 50], head: [58, 60, 56] }, 'fp_mace', 'a limb of iron-bough, dark and mossed at the knot: the Fallen Iron-Bough, from the Deep Grove (Phase 85)'),
    p98_ridge: W('p98_ridge', 'axe', 'one', 'glass', 5, { blade: [34, 34, 40], edge: [132, 134, 146], grip: [232, 226, 210], head: [34, 34, 40] }, 'fp_axe', 'a ridge of black flint in a fist of white shell: the Ridge-Flint, left by the Flint-Back (Phase 91 question 4) [PROPOSED]'),
    p98_beamkey: W('p98_beamkey', 'mace', 'one', 'iron', 7, { blade: [92, 96, 104], edge: [196, 200, 208], grip: [80, 84, 92], head: [92, 96, 104] }, 'fp_mace', 'an engine-man\'s iron key for the beam\'s nuts, its jaw worn bright: the Beam-Key, left by the Standing Note (Phase 91 question 4) [PROPOSED]'),
    p100_spike: W('p100_spike', 'knife', 'one', 'iron', 3.5, { blade: [70, 74, 82], edge: [168, 172, 180], grip: [36, 30, 26], guard: [70, 74, 82] }, 'fp_knife', 'a splicing spike for tungsten cable: a foot of round iron tapering to a blunt point, a ring at the head, the grip bound in tarred cord: the Cable-Spike of Null-Watch (Phase 100) [PROPOSED]'),
    p100_mallet: W('p100_mallet', 'mace', 'one', 'bellbronze', 7, { blade: [150, 104, 74], edge: [112, 168, 140], grip: [186, 160, 118], head: [150, 104, 74] }, 'fp_mace', 'a keg-mallet: a barrel head of copper gone green at the ends on an ash handle with 4 cut into it, because copper strikes no spark: the Magazine Mallet, left by the squad of Magazine Four (Phase 100) [PROPOSED]'),
    p85_pick: W('p85_pick', 'hammer', 'one', 'wood', 7, { blade: [222, 210, 184], edge: [244, 236, 214], grip: [188, 170, 136], head: [222, 210, 184] }, 'fp_mace', 'a red-deer antler with the brow tine left long: the Antler Pick, from the Antler Galleries (Phase 85)'),
    p87_sledge: W('p87_sledge', 'hammer', 'one', 'iron', 7, { blade: [92, 96, 100], edge: [170, 174, 176], grip: [150, 112, 70], head: [92, 96, 100], guard: [200, 160, 64] }, 'fp_mace', 'a quarry-hand\'s sledge: a stone-splitter\'s head, a brass Consortium tag, a red rag at the neck: the Night-Shift Sledge (Phase 87)'),
    p85_knife: W('p85_knife', 'knife', 'one', 'glass', 3.5, { blade: [40, 40, 46], edge: [120, 122, 132], grip: [110, 84, 56], guard: [110, 84, 56] }, 'fp_knife', 'black flint knapped to an edge: the Floorstone Knife, from the Antler Galleries (Phase 85)'),
    // Phase 87 (d): the ranged weapons of the sets [PROPOSED] every look
    p87_feltsling: W('p87_feltsling', 'sling', 'one', 'hushwool', 6, { blade: [58, 84, 78], edge: [150, 146, 140], grip: [46, 66, 62], guard: [46, 66, 62], head: [58, 84, 78] }, 'fp_pistol', 'a sling of felted Hedge wool, the pouch and cords alike; it makes no sound in the swing'),
    p87_sling: W('p87_sling', 'sling', 'one', 'linen', 7, { blade: [120, 84, 52], edge: [214, 210, 196], grip: [214, 204, 176], guard: [214, 204, 176], head: [120, 84, 52] }, 'fp_pistol', 'a shepherd\'s sling: plaited Farrant fleece, a leather pouch, a chalk-flint stone'),
    p87_carbine: W('p87_carbine', 'carbine', 'two', 'iron', 12, { blade: [70, 76, 86], edge: [180, 236, 244], grip: [92, 98, 102], guard: [196, 160, 80], head: [70, 76, 86] }, 'fp_crossbow', 'the Office carbine: oilcloth wound on the stock, a blued barrel, a brass fork tuned to 741 for a front sight, a silver-mesh sling'),
    p87_handbow: W('p87_handbow', 'handbow', 'one', 'wood', 6, { blade: [130, 136, 142], edge: [210, 206, 190], grip: [118, 94, 62], guard: [196, 164, 92], head: [200, 166, 90] }, 'fp_crossbow', 'the Works hand-crossbow: a short steel prod on a pit-prop stock, a brass tag with a serial'),
    p87_harpoon: W('p87_harpoon', 'harpoon', 'two', 'bellbronze', 11, { blade: [100, 104, 110], edge: [210, 214, 216], grip: [96, 70, 46], guard: [190, 156, 84], head: [150, 120, 70] }, 'fp_crossbow', 'the Free Captains\' harpoon gun: a fat bronze tube, a barbed iron head, a drum of tarred rope'),
    p87_hornbow: W('p87_hornbow', 'bow', 'two', 'wood', 14, { blade: [46, 44, 50], edge: [120, 122, 132], grip: [104, 74, 46], guard: [104, 74, 46], head: [222, 210, 184] }, 'fp_crossbow', 'a short recurved bow of horn and sinew on yew, flint-headed arrows: the hornbow of the Old Reach'),
    p12_dirk: W('p12_dirk', 'dirk', 'one', 'steel', 4, { blade: [164, 170, 176], edge: [224, 228, 230], grip: [80, 56, 36], guard: [126, 118, 104] }, 'fp_knife', 'a stiff dirk with a basket hilt (guard)'),
  });
  const NEUTRAL_W = (id) => F(Object.assign({}, WEP.sword, { id, notes: 'unknown weapon: drawn as a sword' }));

  // ---- helpers ----------------------------------------------------------------------------------------------------------
  const own = (o, k) => typeof k === 'string' && Object.prototype.hasOwnProperty.call(o, k);
  const clamp8 = (v) => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v));
  function css(c, a) { if (!c) return 'transparent'; return a == null ? `rgb(${clamp8(c[0])},${clamp8(c[1])},${clamp8(c[2])})` : `rgba(${clamp8(c[0])},${clamp8(c[1])},${clamp8(c[2])},${a})`; }
  // a pixel-art ramp: shadows drift toward cool violet, lights toward warm cream
  function ramp(c, n) {
    n = n || 5; const out = [];
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0.5 : i / (n - 1), k = 0.45 + t * 0.85;
      let r = c[0] * k, g = c[1] * k, b = c[2] * k;
      if (t < 0.5) { const s = (0.5 - t) * 2 * 0.18; r = r * (1 - s) + 40 * s; g = g * (1 - s) + 34 * s; b = b * (1 - s) + 58 * s; }
      else { const s = (t - 0.5) * 2 * 0.12; r = r * (1 - s) + 255 * s; g = g * (1 - s) + 236 * s; b = b * (1 - s) + 196 * s; }
      out.push([clamp8(r), clamp8(g), clamp8(b)]);
    }
    return out;
  }
  const mul = (c, k) => [clamp8(c[0] * k), clamp8(c[1] * k), clamp8(c[2] * k)];

  function playerOf(p) { if (p) return p; try { return typeof G !== 'undefined' && G ? G.player : null; } catch (e) { return null; } }
  function armorId(p, slot) { const id = p && p.armor && p.armor[slot]; return own(ARM, id) && ARM[id].slot === slot ? id : null; }
  function weaponId(p) { const w = p && Array.isArray(p.weapons) ? p.weapons[p.weapon] : null; return typeof w === 'string' ? w : 'hands'; }
  function classId(p) { const c = p && p.cls; const id = c && typeof c === 'object' ? c.id : c; return own(CALLINGS, id) ? id : 'blade'; }
  function faceOf(p) { const f = p && p.face; return [1, 2, 3, 4, 5, 6].includes(f) ? f : 1; }
  function offhandId(p) {
    try {
      if (typeof ARMS12 === 'object' && ARMS12 && typeof ARMS12.dualActive === 'function' && p === (typeof G !== 'undefined' ? G.player : null) && ARMS12.dualActive()) {
        const o = ARMS12.offId(); return own(WEP, o) ? o : null;
      }
    } catch (e) { /* no off hand */ }
    return null;
  }
  function weaponEntry(id) { return own(WEP, id) ? WEP[id] : NEUTRAL_W(String(id).slice(0, 24)); }
  // the game's own catalog decides two-handedness (js/data.js twoHanded, as shieldBlocked() reads it); the table's grip is the fallback
  function twoHandedId(id) { try { const w = GAME_W && own(GAME_W, id) ? GAME_W[id] : null; if (w) return !!w.twoHanded; } catch (e) { /* fall back to the table */ } return own(WEP, id) && WEP[id].grip === 'two'; }

  function key(p) {
    p = playerOf(p); if (!p) return 'none';
    const off = offhandId(p);
    return [classId(p), faceOf(p), p.glassed ? 1 : 0, armorId(p, 'head'), armorId(p, 'body'), armorId(p, 'hands'), armorId(p, 'feet'), armorId(p, 'shield'), weaponId(p), off, twoHandedId(weaponId(p)) ? 2 : 1, armorId(p, 'cape')].join('|');
  }
  function of(p) {
    p = playerOf(p);
    const fc = FACES[faceOf(p)], cid = classId(p), call = CALLINGS[cid];
    const slot = (s) => { const id = armorId(p, s); return id ? ARM[id] : null; };
    let body = slot('body');
    if (!body) {   // the calling's own shirt and coat colours
      const cc = C(call.coat, mul(call.coat, 0.66), mul(call.coat, 1.3));
      body = F(Object.assign({}, BARE.body, { col: cc, sleeve: F({ material: 'linen', col: call.coat, cuff: mul(call.coat, 0.66), rolled: true }) }));
    }
    const wid = weaponId(p), wE = weaponEntry(wid), two = twoHandedId(wid), sh = slot('shield'), off = offhandId(p);
    return {
      v: 1, face: faceOf(p), skin: fc.skin, skinShade: mul(fc.skin, 0.72), hair: { col: fc.hair, style: fc.style },
      calling: { id: cid, coat: call.coat, accent: call.accent },
      glassArm: !!(p && p.glassed),
      head: slot('head') || BARE.head, body, hands: slot('hands') || BARE.hands, feet: slot('feet') || BARE.feet,
      shield: sh, shieldStowed: !!(sh && two), cape: slot('cape'),
      weapon: wE, offhand: off ? WEP[off] : null, twoHanded: two,
      key: key(p),
    };
  }
  // js/ghost18.js lookNow()'s compact encoding, from this table (so partner/ghost and the card agree)
  const GH_W = { hands: 0, sword: 1, knife: 2, dirk: 2, throwing: 2, longsword: 3, greatsword: 3, axe: 4, mace: 5, hammer: 5, maul: 5, spear: 6, glaive: 6, pistol: 7, crossbow: 8, glassarm: 9, fists: 0, sling: 7, carbine: 7, handbow: 8, harpoon: 8, bow: 8 };
  const GH_HEAD = { cap: 1, hood: 2, kettle: 3, bellhelm: 3 };   // Phase 87 forms keep their shape's code
  const GH_BODY = { robe: 1, gambeson: 1, longcoat: 1, jerkin: 2, brigandine: 2, hauberk: 2, cuirass: 2 };
  function ghostLook(p) {
    p = playerOf(p); const L = of(p);
    const arm = (GH_HEAD[L.head.shape] || 0) | ((L.body.bare ? 0 : GH_BODY[L.body.shape] || 0) << 2) | ((L.shield && !L.shieldStowed ? 1 : 0) << 4) | ((L.hands.bare ? 0 : 1) << 5);
    return { cls: Math.max(0, CLASS_ORDER.indexOf(L.calling.id)), face: L.face, wpn: GH_W[L.weapon.kind] != null ? GH_W[L.weapon.kind] : 1, arm };
  }
  function all() { return { armor: Object.keys(ARM), weapons: Object.keys(WEP) }; }

  return F({ VERSION: 1, ARMOR: ARM, WEAPONS: WEP, BARE, FACES, CALLINGS, CLASS_ORDER, GLASS, MATERIALS, of, key, ramp, css, ghostLook, all, mul });
})();
if (typeof window !== 'undefined') window.GEARLOOK21 = GEARLOOK21;
