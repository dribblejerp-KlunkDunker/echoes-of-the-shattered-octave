// ============================================================
//  heights92 — Phase 92: the Dawning Heights, part one. Sol-Luminary's heart: the Umbral Tiers, from the Keel Docks
//  up to the iron door in the Basilica's black wall (Phase 89 plan and Phase 90 layout, approved by the owner 14 Nov:
//  "you have my approval for all now you may proceed"). Built with the Souls rules from the start (js/souls91.js).
//
//  CANON (Book Two, Vol III, the Series Bible; Phase 89 "II. The Dawning Heights"): Sol-Luminary hangs from the face of
//  Mount Lumina on nine great links over two thousand feet of dark air; walkways run between the houses on chains. Since
//  the Fracture (412) the upper tiers are the Bleach, where light eats; the survivors live on the undersides, the Umbral
//  Tiers, where shadow is shelter. Windows are painted black; mirrors are illegal; nobody speaks above the Narrow; below
//  the line it is "as dark as the inside of a hat". The Keel Docks are at the bottom, and ladders go up from them through
//  the hanging houses. The Basilica of the Pure Note: a great black wall along the line, and in it an iron door,
//  man-high, studded. The seventh anchor-house. Greeting: "Light keep you true."
//
//  THE PLACE (one map, p92_tiers, 160 x 226 cells, a cell a step and a half; cut by tools/maps/tiers92.py from the Cymatic
//  City Engine's own 528 Hz plan of the city, js/heights92_grid.js): north is up the mountain's face. The streets and
//  rings of the figure are the walkways, its bold nodal lines the chain-walks, its buildings the hanging houses, and
//  everything else is the gulf, with the cloud deck far below. The walkways climb with the face, about thirteen units
//  from the docks to the wall. Rooms, as Phase 90 drew them:
//    1 the Keel Docks (the way in): Book Two ch. 9's eleven iron cradles hung on chains below the lowest tier, each to
//      take a skyship's gondola; the Kestrel lies in the fourth from the end, a Church packet with the white sun-disc and
//      two battered freighters in three others; the harbourmaster comes down a ladder in a black veil and takes every
//      mirror and lens into a black velvet bag, "returned when you leave the chains" (canon)
//                                                              2 the dock lamp (a shade-lamp at the harbour-master's door)
//    3 the first ladders (north-east from the docks)             4 the chain-walks (the hazard: they jerk, and you can fall)
//    5 the cobbler's, fourth tier (a lamp)                       6 the black market (black canvas; the only mirror)
//    7 the hanging square (the keeper, the Lamplighter of the Seventh Chain; slung on four chains, its edges open)
//    8 the bell-gallery stair (a lamp, under the black wall)     9 the iron door (seen, not entered: the Rite is Book Two's)
//   10 the seventh chain's goods-cage (the shortcut: knock its pin out at the top and it drops to the docks; then it rides)
//  THE DANGER: light. Patches of the Bleach below the line, and the Lamplighter's glass-fire, eat at you while you stand in
//  them; the safe way is the way through shadow. The chain-walks jerk on the chains' beat (a creak first): walk on through
//  one and it throws you; stand still and you hold on. Fall into the gulf and you die, and your Piece is left at the last
//  place you stood. What walks there: bleach-hounds (Phase 89 [PROPOSED]), Cacophony hounds, swarms.
//  THE PEOPLE (the Umbral folk, speaking in the Narrow): the harbourmaster (canon: veiled, two pole-men in her shadow, a bell
//  with a felt clapper; named Mother Ysolde Carrow here [PROPOSED, approved 15 Nov]); Brenna Corliss (canon: the Free
//  Captains' woman, a chandlery on the second tier under a ROPE sign painted black on black, the right half of her face
//  white since the morning of the Fracture; she sells black cloth by the bolt); Anselm Dray, the cobbler of the fourth
//  tier; the woman under the black canvas; Joss Feveril of the seventh chain. The rest of their words are [PROPOSED].
//  THE WAY THERE: the Kestrel's map table, once the hop is allowed (the new number-three tank, and Book One done): "Fly
//  south to Sol-Luminary" (thirty hours [PROPOSED]); her ladder hangs at the Keel Docks; the table flies her home.
//  THE GEAR (realm look, Phase 90 rule 5): the Lamplighter drops his soot-black hood (head) and a lump of amber glass (a
//  valuable), once; the cobbler sells chain-walk boots (feet); the woman under the canvas a shade-cloak (cape).
//  Flags (small ints): p92_cage (the goods-cage's pin knocked out), p92_bag (the harbourmaster holds your mirror), p92_kdrop (the keeper's gear given), p92_seen (bits:
//  what has been said once), p92k (the day the keeper was put down: the Souls rules' week). Lamps: SOULS91 group 'h'.
//  Everything not in the books is [PROPOSED]. Nothing visual uses random numbers.
// ============================================================
'use strict';

const HEIGHTS92 = (function () {
  const PI = Math.PI;
  const TEXTS = [], S = (t) => { TEXTS.push(t); return t; };
  const warned = {}, warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; if (typeof console !== 'undefined') console.warn('heights92: ' + k, e); } };
  const TX = {
    name: S('Sol-Luminary: the Umbral Tiers'),
    // the Kestrel
    fly: S('Fly south to Sol-Luminary, in the Dawning Heights.'),
    arrive: S('Thirty hours south, the peaks come up pale as teeth, and above them, hanging from the mountain\'s face on nine chains, Sol-Luminary. Pennick brings her in under the city to the Keel Docks, where the winch-boats come up through the cloud.'),
    down: S('You climb down onto the Keel Docks. The planks move under you. The whole city moves. Nobody here speaks above the Narrow.'),
    toLabel: S('the Keel Docks, under Sol-Luminary'),
    ladder: S('The Kestrel\'s ladder, hanging at the dock. Climb aboard'),
    // the places
    docks: S('The Keel Docks. The winch-boats come up through the cloud deck here, and the ladders go up from here into the city.'),
    winchboat: S('A winch-boat, hung on its rope over the gulf. The cloud is a long way down.'),
    cradle: S('An iron cradle, hung on chains below the lowest tier over two thousand feet of air, big enough to take a skyship\'s gondola. It swings.'),
    packet: S('A Church packet in its cradle, with the white sun-disc on its envelope. Nobody on the docks looks at it.'),
    freighter: S('A battered freighter in its cradle, its envelope patched as often as the Kestrel\'s.'),
    rope: S('A sign over the door: ROPE, painted black on black, so you have to know it is there to read it.'),
    bagTaken: S('The harbourmaster holds out a gloved hand. "Glass." She takes your mirror into a black velvet bag without looking at it. "A reflection is a second light. The Light is jealous. It will be returned when you leave the chains."'),
    bagBack: S('At the foot of the ladder the harbourmaster gives back your mirror out of the black velvet bag, still without looking at it.'),
    blackcloth: S('A Bolt of Black Cloth'), blackclothDesc: S('Black cloth, sold by the bolt in the Umbral Tiers. You wind it round your head and face until only your eyes show, and round your hands, and go up toward the light.'),
    brenna: S('Brenna Corliss, the Free Captains\' woman in the Keel Docks'),
    ladders: S('Iron rungs in black stone, going up through the hanging houses: in by one window, out by another.'),
    house: S('A hanging house. Its windows are painted black on the inside, and somebody has scratched a small sign in the paint, so the house can be told at dusk.'),
    chainpost: S('A chain-walk\'s stanchion. The chain under it hums.'),
    chainwalk: S('The chain-walks: planks slung on chains over two thousand feet of air. When the chains jerk, hold still.'),
    bigChain: S('One of the four chains the square hangs from. It goes up into the dark.'),
    stall: S('A stall under black canvas.'),
    mirror: S('Something flat and square under a black cloth. Nobody looks at it.'),
    bench: S('A cobbler\'s bench, and boots for the chain-walks, soled with tarred rope.'),
    wall: S('The Basilica\'s black wall. It runs along the line: above it, the Bleach; below it, the Tiers.'),
    ironDoor: S('The iron door: man-high, studded, in the middle of the black wall. The line. It does not open, and nobody here would open it.'),
    ironDoorLabel: S('The iron door in the black wall'),
    bellStair: S('The bell-gallery stair, under the black wall. The Basilica\'s bell is somewhere above, on the other side of the line.'),
    streetlamp: S('A shade-lamp: a lantern under a black hood, so it lights the planks and nothing else.'),
    bleachPatch: S('A patch of the Bleach, below the line: the light has got in here, and the planks are white as bone.'),
    // the Souls lamps: shade-lamps
    lampLabel: S('A shade-lamp on an iron post, unlit: a hood of black tin over the glass. Stand by it to light it.'),
    lampLit: S('A shade-lamp on an iron post, burning under its black hood. Use it to rest.'),
    lampDock: S('The dock lamp'), lampCobbler: S('The cobbler\'s, fourth tier'), lampBell: S('The bell-gallery stair'),
    // the shortcut
    cageTop: S('The seventh chain\'s goods-cage, pinned at the top. Knock the pin out'),
    cageTopOpen: S('The seventh chain\'s goods-cage. Ride it down to the Keel Docks'),
    cageBottom: S('A goods-cage, winched up out of reach. Its chain goes up into the dark, toward the seventh anchor-house.'),
    cageBottomOpen: S('The seventh chain\'s goods-cage. Ride it up to the bell-gallery stair'),
    cageDrop: S('You knock the pin out. The cage drops, and you drop with it, the chain screaming through its sheave, down past every tier you climbed, and it stops a foot above the Keel Docks with a jerk that nearly throws you out. It will ride both ways now.'),
    cageDown: S('The cage takes you down the seventh chain to the Keel Docks.'),
    cageUp: S('The cage takes you up the seventh chain to the bell-gallery stair.'),
    // the dangers
    bleach: S('The light is on you, and it eats. Get back into the shade.'),
    creak: S('The chains creak, all at once. Hold still.'),
    jerked: S('The chain-walk jerks under you and throws you sideways.'),
    held: S('The chain-walk jerks. You hold still, and it does not throw you.'),
    gulf: S('the gulf'),
    glassfire: S('He swings his lantern, and white fire splashes where you stood. The light comes in after it.'),
    keeperName: S('The Lamplighter of the Seventh Chain'),
    keeperDesc: S('A Flambeau who stayed below the line when his chapter went up, and has been correcting the Tiers for seven years. He carries glass-fire into the dark, and where it burns, the Bleach follows.'),
    keeperDown: S('The Lamplighter goes down on the hanging square, and his lantern goes out. The dark comes back in over the planks like water.'),
    houndName: S('Bleach-Hound'),
    houndDesc: S('A Dissonance Hound whose wrong notes have been bleached white. It hunts the edge of the light.'),
    // the gear
    hood: S('Lamplighter\'s Hood'), hoodDesc: S('A Flambeau\'s white hood, blacked with seven years of soot from the inside out. It still smells of amber glass burning.'),
    amber: S('Lump of Amber Glass'), amberDesc: S('Amber glass from the Lamplighter\'s lantern: glass-fire\'s food. The Church pays for it, and asks where you got it.'),
    boots: S('Chain-Walk Boots'), bootsDesc: S('Soft black boots soled with tarred rope, for planks that move. The cobbler of the fourth tier makes them; you hear nothing when you walk in them.'),
    cloak: S('Umbral Shade-Cloak'), cloakDesc: S('A long black cloak cut wide, to lend its shade to whoever walks behind you. A small sun is scratched into the lining, for the house it came from.'),
    pole: S('Scavenger\'s Cloth-Pole'), poleDesc: S('An ash pole with a crossbar at its head and a black cloth hung from it. The scavengers carry them up into the Bleach: where the cloth vanishes, the light is too strong to go in. It also keeps a hound at a pole\'s length.'),
    mirrorItem: S('A Mirror, under a Cloth'), mirrorDesc: S('A hand-mirror wrapped in black cloth and tied. Mirrors are illegal in the Tiers. You have not looked in it.'),
    // the people
    ysolde: S('Mother Ysolde Carrow, harbour-master'), anselm: S('Anselm Dray, cobbler of the fourth tier'), canvas: S('The woman under the black canvas'), joss: S('Joss Feveril, of the seventh chain'), folk: S('One of the Umbral folk'),
  };
  // what they say: the Narrow (Phase 89: the Umbral folk; "Light keep you true"; "casts" turned to praise) [PROPOSED]
  const SAY = {
    ysolde: {
      greet: { polite: S('Name. Cargo. Quietly: we speak in the Narrow here.'), normal: S('You came up on that airship. Keep your voice down and your feet in the shade.'), blunt: S('Speak like that again and the whole dock will look at you. Nobody here looks at anybody.') },
      topics: {
        [S('The Keel Docks')]: S('The winch-boats come up through the cloud from the valley farms. The ladders go up from here. Everything the city eats comes past me, and I count it.'),
        [S('The line')]: S('Up the face, where the black wall is. Above it, the Bleach. Below it, us. Seven years we have lived on the undersides, and we are good at it.'),
        [S('Shade-right')]: S('The one ahead owns their shadow and lends it. Step out of somebody\'s shade without a word and you have insulted them. Give your shade to a stranger and you have done the finest thing you can do here.'),
        [S('The lamp')]: S('The shade-lamp at my door. Sit by it when you come back down, and you will be whole again. Everybody comes back down.'),
        [S('Glass')]: S('Your mirrors. Your sextant. Your shaving-glasses, your hand-mirrors, any lens that shows a face. A reflection is a second light. The Light is jealous. They\'ll be returned when you leave the chains.'),
      },
    },
    brenna: {
      greet: { polite: S('Come in under the lamp. Not that side. This side.'), normal: S('Rope, cloth, tar. What do you need?'), blunt: S('Quieter. The whole tier can hear a Coast voice.') },
      topics: {
        [S('The morning')]: S('I was on the fourth tier, at a window, on the morning it let go. Facing south. I turned my head. Most people didn\'t have time to turn their heads.'),
        [S('Black cloth')]: S('The Tiers sell it by the bolt. Wind it round your face till only your eyes show, and your hands, before you go anywhere near the line.'),
        [S('The Free Captains')]: S('I keep the Free Captains\' business in the Keel Docks. A letter from Oona Salt gets you through my door. Without one, you are buying rope.'),
      },
    },
    anselm: {
      greet: { polite: S('Light keep you true. Sit, if you want boots. Rope soles. The planks move.'), normal: S('Boots? You walk like somebody from flat country.'), blunt: S('Mind your feet in my shop and mind your voice on my tier.') },
      topics: {
        [S('The chain-walks')]: S('When the chains jerk, stand still. The ones who keep walking go over. I mend boots for the ones who stand still.'),
        [S('The Lamplighter')]: S('He was a Flambeau. When his chapter went up the Pilgrim Chain he stayed below. Now he walks the Tiers with glass-fire, correcting us, he says. Where he burns, the light comes down after.'),
        [S('Casts')]: S('Up there it was an insult: "he casts", a thing with a shadow, provincial. Down here it is the best thing you can say of a person. Somebody who casts is somebody you can stand behind.'),
      },
    },
    canvas: {
      greet: { polite: S('Under the canvas, quick. What do you need that you cannot buy in the light?'), normal: S('Looking, or buying?'), blunt: S('Loud. Go and be loud somewhere else.') },
      topics: {
        [S('The mirror')]: S('The only one in the Tiers, and it stays under the cloth. Mirrors are illegal. Mirrors are what the Bleach shines from, up on the Walks. You want it, you buy it covered, and you never take the cloth off down here.'),
        [S('The black window')]: S('Every window painted black on the inside, and every family scratches one sign in the paint. A bird, a name, a sun. At dusk the scratch-light tells you whose house it is.'),
      },
    },
    joss: {
      greet: { polite: S('Light keep you true. Seventh chain. Mind the walk.'), normal: S('Crew. Seventh chain.'), blunt: S('Talk like that on a chain-walk and the chain will answer you.') },
      topics: {
        [S('Counting the chains')]: S('Children learn the nine links by name before they learn their letters. The chain you are on decides which way you run when one jerks.'),
        [S('The notched link')]: S('Every crewman wears one. A notch for every man you lost. One in nine of us, Bardo says. He keeps a tally of nineteen in his winch housing.'),
        [S('The goods-cage')]: S('The seventh chain\'s cage runs from the anchor-house down past the bell-gallery to the docks. Somebody pinned it up top, years back. Knock the pin out from up there and it comes down.'),
      },
    },
    folk: {
      greet: { polite: S('Light keep you true.'), normal: S('Shh.'), blunt: S('Quiet. Please.') },
      topics: { [S('The Bleach')]: S('We do not go above the line. Some go up for what the noble houses left, with a black cloth on a pole. Not all come down.') },
    },
  };

  // ---------------------------------------------------------------- the place
  const MAP = 'p92_tiers';
  const G0 = typeof HEIGHTS92_GRID !== 'undefined' ? HEIGHTS92_GRID : null;
  const W = G0 ? G0.w : 160, H = G0 ? G0.h : 226;
  const DOCK_Y = 207, RISE = 0.064, GULF_Z = -60;     // the face climbs ~13 units from the docks to the wall
  const WALL_ROWS = 6;                                 // the black wall along the top: the line
  const hv = (vy) => Math.max(0, DOCK_Y - vy) * RISE;  // the walkways' height at a row of cell corners
  const lvlAt = (j) => (hv(j) + hv(j + 1)) / 2;
  // floors (index 2 is the engine's "you cannot walk here")
  const PLANK = 0, STONE = 1, GULF = 2, FALL = 3, BLEACH = 4, CHAIN = 5, DOCK = 6;
  const FLOORS = ['t_p92_plank', 't_p92_stone', 't_p92_cloud', 't_p92_cloud', 't_p92_bleach', 't_p92_chainwalk', 't_p92_dock'];
  // where the rooms are (cells)
  const P = {
    dock: [80, 214], arrive: [70.5, 216.6], dockLamp: [64.5, 211.6], ysolde: [72.6, 214.6], kestrel: [70.1, 219.55], brenna: [98.5, 203.6],
    pin8: [138, 126], pin7: [22, 126], cobbler: [22.5, 124.2], cobblerLamp: [26.5, 122.6], anselm: [20.6, 127.4],
    market: [84, 150], canvas: [84.5, 148.6], joss: [134.6, 129.4],
    square: [74, 27, 87, 37], keeper: [80.5, 31.5],
    bell: [70, 6, 92, 19], bellLamp: [76.5, 12.4], ironDoor: [80, WALL_ROWS - 1],
    cageTop: [90.6, 12.0], cageBottom: [96.6, 211.0],
  };
  const ROUTES = {   // carved walkways (cells): the first ladders, the chain-walks, the climb to the square, the waist
    ladders: [[86, 207], [100, 192], [114, 172], [128, 150], [138, 128]],
    chainwalk: [[138, 126], [112, 123], [82, 127], [52, 123], [22, 126]],
    toSquare: [[22, 122], [30, 100], [42, 78], [58, 56], [72, 38]],
    market: [[100, 192], [92, 172], [84, 152]],
    waist: [[84, 148], [82, 120], [80, 90], [80, 66], [80, 38]],
    bell: [[80, 27], [80, 19]],
  };
  const BLEACH_SPOTS = [[64, 22, 3.2], [98, 42, 2.6], [52, 58, 2.4], [110, 20, 3.0], [70, 70, 2.0], [120, 34, 2.4]];

  // ---------------------------------------------------------------- the pictures (code only, fixed patterns)
  const h2 = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
    // a Church packet and two freighters, from the Kestrel's own picture: the packet's envelope tawny with the white sun-disc (Book Two ch. 9),
    // the freighters darker and patched (fixed changes of colour, nothing random)
  function shipArt() {
    if (typeof Engine === 'undefined' || !Engine.sprites || !Engine.addSprite) return;
    try {
      const kp = Engine.sprites.kestrel_m2;
      if (kp && !Engine.sprites.p92_packet) {
        const recol = (fn) => { const d = new Uint32Array(kp.data.length); for (let i = 0; i < d.length; i++) { const v = kp.data[i], a = v >>> 24; if (!a) continue; const r = v & 255, g = (v >> 8) & 255, b = (v >> 16) & 255, yy = (i / kp.w) | 0, xx = i % kp.w; const o = fn(r, g, b, xx, yy); d[i] = (a << 24) | (o[2] << 16) | (o[1] << 8) | o[0]; } return Object.assign({}, kp, { data: d }); };
        const top = kp.h * 0.62;
        Engine.addSprite('p92_packet', recol((r, g, b, xx, yy) => { if (yy > top) return [r, g, b]; const l = (r + g + b) / 3, dx = xx - kp.w / 2, dy = yy - top * 0.5; const dd = dx * dx + dy * dy; if (dd < 49) return [250, 250, 244]; if (dd < 81) return [200, 160, 70]; return [Math.min(255, 120 + l * 0.45) | 0, Math.min(255, 104 + l * 0.42) | 0, Math.min(255, 76 + l * 0.35) | 0]; }));
        Engine.addSprite('p92_freighter', recol((r, g, b, xx, yy) => { const k = 0.7 + 0.15 * ((((xx >> 3) + (yy >> 3)) & 1)); return [(r * k * 0.9) | 0, (g * k * 0.85) | 0, (b * k * 0.8) | 0]; }));
      }
    } catch (e) { warnOnce('packet', e); }
  }
  function art() {
    if (typeof Engine === 'undefined' || !Engine.addSprite || typeof document === 'undefined') return;
    const canvas = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true }); fn(x, w, h); return x; };
    const add = (name, w, h, hs, fn, glowTest, meta) => {
      if (Engine.sprites[name]) return; const x = canvas(w, h, fn);
      Engine.addSprite(name, Object.assign({ w, h, hs, cx: 0.5, dy: 0, data: new Uint32Array(x.getImageData(0, 0, w, h).data.buffer.slice(0)) }, meta || {}));
      if (glowTest && Engine.setEmissive) { const px = x.getImageData(0, 0, w, h).data, mask = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) mask[i] = glowTest(px[i * 4], px[i * 4 + 1], px[i * 4 + 2], px[i * 4 + 3]) ? 1 : 0; Engine.setEmissive(name, mask); }
    };
    const tex = (name, fn) => { if (Engine.textures && Engine.textures[name]) return; const x = canvas(64, 64, fn); try { Engine.addTexture(name, new Uint32Array(x.getImageData(0, 0, 64, 64).data.buffer.slice(0))); } catch (e) { warnOnce('tex ' + name, e); } };
    const px = (x, c, i, j, w, h) => { x.fillStyle = c; x.fillRect(i, j, w || 1, h || 1); };
    // ---- textures
    if (Engine.addTexture) {
      // tarred planks with iron straps
      tex('t_p92_plank', (x) => {
        for (let r = 0; r < 4; r++) { const b = 34 + (h2(r, 1) * 10 | 0); px(x, `rgb(${b + 8},${b + 2},${b - 4})`, 0, r * 16, 64, 16); px(x, '#120e0c', 0, r * 16, 64, 1);
          for (let k = 0; k < 9; k++) px(x, `rgba(${70 + (h2(r, k) * 30 | 0)},${60 + (h2(k, r) * 20 | 0)},48,0.5)`, (h2(r * 9 + k, 3) * 60) | 0, r * 16 + 3 + (h2(k, r * 5) * 10 | 0), 4 + (h2(k, 2) * 8 | 0), 1);
          px(x, '#0c0a08', ((h2(r, 7) * 40) | 0) + 10, r * 16 + 1, 1, 15); }
        for (const xx of [6, 56]) { px(x, '#2a2c30', xx, 0, 3, 64); for (let y = 4; y < 64; y += 16) px(x, '#5a5e64', xx + 1, y, 1, 1); }
      });
      tex('t_p92_dock', (x) => {
        for (let r = 0; r < 8; r++) { const b = 46 + (h2(r, 4) * 12 | 0); px(x, `rgb(${b},${b - 6},${b - 14})`, 0, r * 8, 64, 8); px(x, '#16120e', 0, r * 8, 64, 1); px(x, '#1c1712', (h2(r, 9) * 56) | 0, r * 8, 1, 8); }
        for (let i = 0; i < 30; i++) px(x, 'rgba(200,190,170,0.18)', (h2(i, 13) * 64) | 0, (h2(i, 17) * 64) | 0, 2, 1);   // salt and gull-lime
      });
      tex('t_p92_stone', (x) => {
        px(x, '#2a2a2e', 0, 0, 64, 64);
        for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) { const o = (r % 2) * 10, b = 40 + (h2(r, k) * 14 | 0); px(x, `rgb(${b},${b},${b + 4})`, (k * 22 + o) % 64 + 1, r * 16 + 1, 20, 14); }
        for (let i = 0; i < 40; i++) px(x, 'rgba(0,0,0,0.35)', (h2(i, 3) * 64) | 0, (h2(i, 5) * 64) | 0, 1, 1);
      });
      tex('t_p92_chainwalk', (x) => {
        for (let c = 0; c < 8; c++) { const b = 38 + (h2(c, 2) * 10 | 0); px(x, `rgb(${b + 6},${b},${b - 6})`, c * 8, 0, 8, 64); px(x, '#0e0b09', c * 8, 0, 1, 64); }
        for (let y = 0; y < 64; y += 10) { px(x, '#3c4046', 1, y, 4, 7); px(x, '#1a1c20', 2, y + 2, 2, 3); px(x, '#3c4046', 59, y + 5, 4, 7); px(x, '#1a1c20', 60, y + 7, 2, 3); }   // the chain at each edge
      });
      // the cloud deck, far down in the dark: soft billows, a little blue
      tex('t_p92_cloud', (x) => {
        for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const v = 0.5 + 0.25 * Math.sin(i * 0.2 + Math.sin(j * 0.15) * 2) + 0.25 * Math.sin(j * 0.26 + i * 0.05), b = 70 + v * 60; px(x, `rgb(${b | 0},${(b + 4) | 0},${(b + 16) | 0})`, i, j); }
      });
      tex('t_p92_bleach', (x) => {
        px(x, '#f2efe6', 0, 0, 64, 64);
        for (let r = 0; r < 4; r++) px(x, '#e2ded2', 0, r * 16, 64, 1);
        for (let i = 0; i < 30; i++) px(x, 'rgba(255,255,255,0.8)', (h2(i, 7) * 64) | 0, (h2(i, 11) * 64) | 0, 3, 1);
      });
      // a hanging house: black clapboard, a black window with a small scratched sign (a bird, a name, a sun), by its row
      for (let v = 0; v < 3; v++) tex('t_p92_house' + v, (x) => {
        for (let r = 0; r < 8; r++) { const b = 20 + (h2(r, v) * 8 | 0); px(x, `rgb(${b + 4},${b + 2},${b})`, 0, r * 8, 64, 8); px(x, '#08070a', 0, r * 8 + 7, 64, 1); }
        px(x, '#3a3026', 18, 14, 28, 26); px(x, '#050506', 20, 16, 24, 22);   // the frame and the black pane
        px(x, '#3a3026', 31, 16, 2, 22); px(x, '#3a3026', 20, 26, 24, 2);
        const sc = 'rgba(214,196,150,0.85)';
        if (v === 0) { for (let k = 0; k < 6; k++) px(x, sc, 24 + k, 20 + Math.abs(k - 2), 1, 1); for (let k = 0; k < 6; k++) px(x, sc, 29 + k, 22 - Math.abs(k - 3), 1, 1); }   // a bird
        else if (v === 1) { x.strokeStyle = sc; x.lineWidth = 1; x.beginPath(); x.arc(38, 21, 3, 0, PI * 2); x.stroke(); for (let k = 0; k < 8; k++) px(x, sc, 38 + Math.round(Math.cos(k * PI / 4) * 5), 21 + Math.round(Math.sin(k * PI / 4) * 5)); }   // a sun
        else { for (let k = 0; k < 4; k++) px(x, sc, 22 + k * 3, 30, 2, 1); px(x, sc, 22, 31, 1, 3); px(x, sc, 34, 31, 1, 3); }   // a name, a few strokes
        px(x, '#2a2420', 12, 50, 40, 3);   // a sill
      });
      // the walkway's side, as seen from across a gap: its pale edge-beam, a hand of dark timber, and then nothing but the
      // haze the gulf is full of (the colour of the fog, so a gap reads as a gap)
      tex('t_p92_under', (x) => {
        px(x, '#9a8462', 0, 0, 64, 3); px(x, '#4a3e2e', 0, 3, 64, 2); px(x, '#1e1814', 0, 5, 64, 6);
        for (let y = 11; y < 64; y++) { const k = Math.min(1, (y - 11) / 14), r = 30 + (72 - 30) * k, g = 24 + (82 - 24) * k, b = 20 + (112 - 20) * k; px(x, `rgb(${r | 0},${g | 0},${b | 0})`, 0, y, 64, 1); }
        for (let y = 12; y < 40; y += 7) px(x, 'rgba(20,22,30,0.5)', 30, y, 3, 5);   // a chain hanging under it, into the haze
      });
      tex('t_p92_blackwall', (x) => {
        px(x, '#101014', 0, 0, 64, 64);
        for (let r = 0; r < 4; r++) for (let k = 0; k < 2; k++) { const o = (r % 2) * 16, b = 30 + (h2(r, k + 9) * 10 | 0); px(x, `rgb(${b},${b},${b + 6})`, (k * 32 + o) % 64 + 1, r * 16 + 1, 30, 14); px(x, `rgb(${b + 10},${b + 10},${b + 16})`, (k * 32 + o) % 64 + 1, r * 16 + 1, 30, 1); }
        for (let i = 0; i < 16; i++) px(x, 'rgba(255,255,255,0.06)', (h2(i, 3) * 64) | 0, (h2(i, 9) * 64) | 0, 1, 8);
      });
      tex('t_p92_irondoor', (x) => {
        px(x, '#0c0c0e', 0, 0, 64, 64);
        px(x, '#1c1d20', 12, 4, 40, 60); px(x, '#26282c', 14, 6, 36, 58);
        for (let j = 0; j < 6; j++) for (let i = 0; i < 5; i++) { px(x, '#4a4d52', 17 + i * 7, 10 + j * 9, 2, 2); px(x, '#0a0a0c', 18 + i * 7, 11 + j * 9, 1, 1); }   // the studs
        px(x, '#3a3c40', 44, 34, 3, 6);
      });
      tex('t_p92_rock', (x) => {
        for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const v = h2(i >> 2, j >> 2) * 0.5 + h2(i, j) * 0.15, b = 60 + v * 50; px(x, `rgb(${b | 0},${(b - 2) | 0},${(b - 6) | 0})`, i, j); }
      });
      tex('t_p92_cagewall', (x) => {
        px(x, '#0c0c0e', 0, 0, 64, 64); for (let i = 0; i < 64; i += 8) px(x, '#3a3c40', i, 0, 2, 64); for (let j = 0; j < 64; j += 16) px(x, '#3a3c40', 0, j, 64, 2);
      });
    }
    // ---- sprites
    // a shade-lamp on an iron post: a lantern under a black tin hood, so it throws its light down only
    const shade = (x, lit, W0, H0) => {
      px(x, '#1a1a1c', W0 / 2 - 2, 30, 4, H0 - 30); px(x, '#2c2c30', W0 / 2 - 1, 32, 1, H0 - 34);
      px(x, '#1a1a1c', W0 / 2 - 8, H0 - 5, 16, 5);
      px(x, '#1a1a1c', W0 / 2, 26, 14, 3); px(x, '#1a1a1c', W0 / 2 + 11, 26, 3, 8);
      const cx = W0 / 2 + 12, top = 34;
      x.fillStyle = '#060607'; x.beginPath(); x.moveTo(cx - 11, top + 6); x.lineTo(cx - 4, top - 4); x.lineTo(cx + 4, top - 4); x.lineTo(cx + 11, top + 6); x.closePath(); x.fill();   // the hood
      px(x, lit ? '#f3c070' : '#3c362c', cx - 5, top + 6, 10, 12); if (lit) { px(x, '#fff0c8', cx - 2, top + 9, 4, 7); }
      px(x, '#141416', cx - 6, top + 18, 12, 2); for (const d of [-5, 3]) px(x, '#141416', cx + d, top + 6, 2, 12);
      if (lit) for (let k = 0; k < 10; k++) px(x, `rgba(240,190,110,${(0.22 - k * 0.02).toFixed(2)})`, cx - 6 - k, top + 20 + k * 2, 12 + k * 2, 2);   // the light falling, not rising
    };
    add('p92_shadelamp', 48, 120, 1.55, (x) => shade(x, false, 48, 120));
    add('p92_shadelamplit', 48, 120, 1.55, (x) => shade(x, true, 48, 120), (r, g, b, a) => a > 200 && r > 230 && g > 170);
    // a street shade-lamp: hung on a short chain from a bracket, hooded
    add('p92_streetlamp', 32, 90, 1.25, (x) => {
      px(x, '#1a1a1c', 14, 18, 3, 72); px(x, '#1a1a1c', 14, 18, 12, 3); for (let y = 21; y < 30; y += 3) px(x, '#3a3c40', 24, y, 2, 2);
      x.fillStyle = '#060607'; x.beginPath(); x.moveTo(17, 36); x.lineTo(22, 29); x.lineTo(28, 29); x.lineTo(32, 36); x.closePath(); x.fill();
      px(x, '#eab868', 20, 36, 10, 8); px(x, '#fff0c8', 23, 37, 4, 6);
      for (let k = 0; k < 6; k++) px(x, `rgba(240,190,110,${(0.16 - k * 0.02).toFixed(2)})`, 19 - k, 45 + k * 2, 12 + k * 2, 2);
    }, (r, g, b, a) => a > 200 && r > 225 && g > 170);
    add('p92_chainpost', 20, 60, 0.75, (x) => {
      px(x, '#26282c', 8, 6, 4, 54); px(x, '#3c4046', 9, 6, 1, 52); px(x, '#3c4046', 6, 4, 8, 4);
      for (let k = 0; k < 4; k++) { px(x, '#4a4e54', k * 5, 10 + Math.round(Math.sin(k) * 2), 4, 3); }
    });
    add('p92_bigchain', 40, 200, 4.2, (x) => {
      for (let y = 0; y < 200; y += 14) { const odd = (y / 14) % 2; px(x, '#2a2c30', odd ? 16 : 10, y, odd ? 8 : 20, 14); px(x, '#0a0a0c', odd ? 18 : 14, y + 3, odd ? 4 : 12, 8); px(x, '#4a4e54', odd ? 16 : 10, y, 2, 14); }
    });
    add('p92_winchboat', 80, 90, 1.6, (x) => {
      px(x, '#6a5a44', 39, 0, 2, 40);   // the rope
      px(x, '#2a2018', 30, 34, 20, 4);  // the spreader
      for (const d of [-1, 1]) { x.strokeStyle = '#5a4c3a'; x.beginPath(); x.moveTo(40, 36); x.lineTo(40 + d * 30, 56); x.stroke(); }
      x.fillStyle = '#3a2a1e'; x.beginPath(); x.moveTo(6, 56); x.lineTo(74, 56); x.lineTo(64, 76); x.lineTo(16, 76); x.closePath(); x.fill();
      px(x, '#4e3a2a', 6, 56, 68, 4); px(x, '#24180f', 16, 72, 48, 4);
      for (let i = 0; i < 3; i++) px(x, '#5a4a34', 20 + i * 14, 50, 10, 6);   // sacks of barley
    });
    add('p92_cage', 56, 130, 2.0, (x) => {
      px(x, '#2a2c30', 26, 0, 4, 30);
      px(x, '#1c1d20', 6, 30, 44, 4); px(x, '#1c1d20', 6, 124, 44, 6);
      for (let i = 6; i <= 48; i += 7) px(x, '#3a3c42', i, 30, 2, 96);
      for (let y = 60; y < 124; y += 30) px(x, '#2a2c30', 6, y, 44, 2);
      px(x, '#8a7a5a', 24, 26, 8, 3);   // the pin
    });
    add('p92_stall', 90, 100, 1.6, (x) => {
      x.fillStyle = '#0a0a0c'; x.beginPath(); x.moveTo(0, 30); x.lineTo(45, 6); x.lineTo(90, 30); x.lineTo(90, 40); x.lineTo(0, 40); x.closePath(); x.fill();
      for (const xx of [6, 82]) px(x, '#2a2018', xx, 38, 3, 62);
      px(x, '#3a2a1e', 4, 66, 82, 6); px(x, '#22180f', 6, 72, 78, 28);
      for (let i = 0; i < 6; i++) px(x, ['#5a4a34', '#3a3a40', '#6a5434'][i % 3], 10 + i * 12, 58, 9, 8);
    });
    add('p92_mirrorcloth', 30, 40, 0.5, (x) => {
      px(x, '#2a2018', 4, 30, 22, 10);
      x.fillStyle = '#060607'; x.beginPath(); x.moveTo(6, 30); x.lineTo(9, 4); x.lineTo(21, 4); x.lineTo(24, 30); x.closePath(); x.fill();
      px(x, '#1a1a1e', 10, 8, 10, 1); px(x, '#5a4a34', 8, 18, 14, 2);   // the tie
    });
    add('p92_bench', 70, 60, 0.9, (x) => {
      px(x, '#3a2a1e', 2, 30, 66, 6); for (const xx of [6, 60]) px(x, '#2a1e14', xx, 36, 4, 24);
      for (let i = 0; i < 4; i++) { px(x, '#141214', 8 + i * 15, 12, 10, 18); px(x, '#5a4a34', 8 + i * 15, 28, 11, 3); }   // boots, rope soles
    });
    // the Umbral folk: black hooded coats and shawls, pale faces kept down; each has its own cut
    const folk = (x, o) => {
      const cx = 32;
      x.fillStyle = o.coat; x.beginPath(); x.moveTo(cx - 16, 158); x.lineTo(cx - 12, 52); x.lineTo(cx + 12, 52); x.lineTo(cx + 16, 158); x.closePath(); x.fill();
      px(x, o.trim, cx - 1, 56, 2, 100);
      if (o.belt) px(x, o.belt, cx - 13, 92, 26, 4);
      if (o.link) { px(x, '#6a6e74', cx - 4, 70, 8, 6); px(x, '#1a1a1e', cx - 2, 72, 4, 2); for (let k = 0; k < o.link; k++) px(x, '#1a1a1e', cx - 4 + k * 2, 70, 1, 1); }   // the notched link
      px(x, o.coat, cx - 20, 58, 7, 54); px(x, o.coat, cx + 13, 58, 7, 54);   // sleeves
      px(x, o.skin, cx - 19, 110, 5, 6); px(x, o.skin, cx + 14, 110, 5, 6);
      px(x, o.skin, cx - 7, 30, 14, 18); px(x, '#1a1416', cx - 4, 37, 2, 2); px(x, '#1a1416', cx + 2, 37, 2, 2);   // the face, pale, eyes down
      px(x, '#5a4040', cx - 2, 43, 4, 1);
      x.fillStyle = o.hood; x.beginPath(); x.moveTo(cx - 12, 54); x.lineTo(cx - 11, 26); x.quadraticCurveTo(cx, 12, cx + 11, 26); x.lineTo(cx + 12, 54); x.lineTo(cx + 7, 50); x.lineTo(cx + 8, 30); x.quadraticCurveTo(cx, 22, cx - 8, 30); x.lineTo(cx - 7, 50); x.closePath(); x.fill();
      if (o.shawl) { px(x, o.shawl, cx - 15, 52, 30, 10); }
      px(x, '#0a0808', cx - 14, 152, 10, 6); px(x, '#0a0808', cx + 4, 152, 10, 6);
    };
    add('p92_folk_a', 64, 160, undefined, (x) => folk(x, { coat: '#16151a', hood: '#0e0d12', trim: '#2a2830', skin: '#d8ccc0' }));
    add('p92_folk_b', 64, 160, undefined, (x) => folk(x, { coat: '#1c1820', hood: '#100e14', trim: '#3a2e30', skin: '#e2d6cc', shawl: '#2a2228' }));
    add('p92_folk_c', 64, 160, undefined, (x) => folk(x, { coat: '#22201c', hood: '#141210', trim: '#3a342a', skin: '#c8b8a6', belt: '#6a5a40', link: 3 }));
    add('p92_folk_d', 64, 160, undefined, (x) => folk(x, { coat: '#18161c', hood: '#0c0b10', trim: '#4a3a24', skin: '#d4c6b8', belt: '#3a2a1e' }));
    // the harbourmaster: a black hat, a black veil fine as a fishing net to her collarbones, black gloves, a black lantern
    // with its shutters closed to a slit (Book Two ch. 9)
    add('p92_veiled', 64, 160, undefined, (x) => {
      folk(x, { coat: '#121116', hood: '#121116', trim: '#1e1c22', skin: '#d8cec4' });
      px(x, '#0a0a0c', 14, 22, 36, 5); px(x, '#0a0a0c', 20, 12, 24, 11);   // the hat
      for (let y = 27; y < 58; y++) for (let i = 18; i < 46; i++) if (((i + y) & 1) === 0) px(x, 'rgba(8,8,10,0.85)', i, y);   // the veil, a net
      px(x, '#0a0a0c', 10, 108, 8, 8); px(x, '#0a0a0c', 46, 108, 8, 8);   // black gloves
      px(x, '#141416', 48, 112, 10, 14); px(x, '#e8b860', 52, 116, 2, 6);   // the lantern, shuttered to a slit
    });
    // Brenna Corliss: a coast face, sixty and weathered, the right half white (her right is the picture's left)
    add('p92_brenna', 64, 160, undefined, (x) => {
      folk(x, { coat: '#2a2622', hood: '#1a1816', trim: '#5a4a34', skin: '#b89c80', belt: '#6a5a40' });
      px(x, '#f4f2ec', 25, 30, 7, 18); px(x, '#e8e8e8', 27, 37, 2, 2);   // the white half, and the milk-white eye
    });
    add('p92_poleman', 64, 170, undefined, (x) => {
      folk(x, { coat: '#141318', hood: '#0e0d12', trim: '#24222a', skin: '#d0c4b8' });
      px(x, '#3a2a18', 54, 0, 3, 168); px(x, '#3a3c40', 50, 0, 8, 3); px(x, '#3a3c40', 50, 0, 3, 8);   // a long pole with an iron hook
    });
    add('p92_cradle', 80, 110, 2.2, (x) => {
      for (const cx of [10, 70]) for (let y = 0; y < 50; y += 6) { px(x, '#5a5e66', cx, y, 4, 5); px(x, '#1a1a1e', cx + 1, y + 1, 2, 3); }
      x.strokeStyle = '#4e525a'; x.lineWidth = 3; x.beginPath(); x.moveTo(8, 50); x.quadraticCurveTo(40, 120, 72, 50); x.stroke();
      for (let i = 0; i < 7; i++) { x.beginPath(); x.moveTo(12 + i * 9.3, 52); x.lineTo(20 + i * 6.6, 92); x.stroke(); }
      x.lineWidth = 4; x.beginPath(); x.moveTo(6, 50); x.lineTo(74, 50); x.stroke();
    });

    // the Lamplighter: a Flambeau's white robe gone grey to the knee, the hood blacked with soot, and on a pole the lantern
    add('p92_lamplighter', 96, 176, undefined, (x) => {
      const cx = 40;
      x.fillStyle = '#b8b0a0'; x.beginPath(); x.moveTo(cx - 20, 174); x.lineTo(cx - 14, 58); x.lineTo(cx + 14, 58); x.lineTo(cx + 20, 174); x.closePath(); x.fill();
      for (let y = 120; y < 174; y += 3) px(x, `rgba(40,36,32,${((y - 120) / 70).toFixed(2)})`, cx - 20, y, 40, 3);   // soot to the knee
      px(x, '#d8c890', cx - 2, 62, 4, 60);   // a gold stole
      px(x, '#c8a040', cx - 6, 72, 12, 3);
      px(x, '#b8b0a0', cx - 24, 64, 8, 56); px(x, '#b8b0a0', cx + 16, 64, 8, 50);
      px(x, '#d8c8b8', cx - 7, 36, 14, 20); px(x, '#2a1a10', cx - 4, 44, 2, 2); px(x, '#2a1a10', cx + 2, 44, 2, 2);
      x.fillStyle = '#18161a'; x.beginPath(); x.moveTo(cx - 13, 60); x.lineTo(cx - 12, 30); x.quadraticCurveTo(cx, 14, cx + 12, 30); x.lineTo(cx + 13, 60); x.lineTo(cx + 8, 56); x.lineTo(cx + 9, 36); x.quadraticCurveTo(cx, 26, cx - 9, 36); x.lineTo(cx - 8, 56); x.closePath(); x.fill();
      // the pole and the lantern of amber glass, burning white-gold
      px(x, '#3a2a18', cx + 22, 20, 3, 154);
      px(x, '#2a2018', cx + 22, 18, 22, 3); px(x, '#2a2018', cx + 41, 18, 2, 10);
      px(x, '#1a1a1c', cx + 34, 28, 18, 3); px(x, '#1a1a1c', cx + 34, 52, 18, 3);
      px(x, '#f6d47a', cx + 35, 31, 16, 21); px(x, '#fff8e0', cx + 39, 34, 8, 15);
      for (const d of [0, 7, 14]) px(x, '#1a1a1c', cx + 35 + d, 31, 2, 21);
    }, (r, g, b, a) => a > 200 && r > 240 && g > 200);
    // white fire on the planks
    add('p92_glassfire', 48, 40, 0.55, (x) => {
      for (let i = 0; i < 48; i++) { const hgt = 6 + Math.abs(Math.sin(i * 0.7)) * 22 + h2(i, 3) * 8; for (let y = 0; y < hgt; y++) { const k = y / hgt; px(x, k < 0.5 ? '#fffbea' : k < 0.8 ? '#f8e2a0' : '#e8b860', i, 39 - y); } }
    }, (r, g, b, a) => a > 0 && r > 230);
    // the Bleach, seen over the top of the black wall: a dither of white light (whole pixels, thinning upward)
    add('p92_overline', 128, 64, 3.0, (x) => {
      for (let y = 0; y < 64; y++) for (let i = 0; i < 128; i++) { const k = Math.pow(y / 63, 3), e = Math.min(1, Math.min(i, 127 - i) / 24), n = h2(i, y); if (n < k * (0.35 + 0.65 * e)) px(x, k > 0.6 ? '#fffdf4' : k > 0.3 ? '#efeadc' : '#cfcac0', i, y); }
    }, (r, g, b, a) => a > 0);
    // a bleach-hound: the hound, bleached (from its own picture, the same pixels, whitened)
    try {
      const hd = Engine.sprites.hound;
      if (hd && !Engine.sprites.p92_bleachhound) {
        const src = hd.data, d = new Uint32Array(src.length);
        for (let i = 0; i < src.length; i++) { const v = src[i], a = v >>> 24; if (!a) { d[i] = 0; continue; } const r = v & 255, g = (v >> 8) & 255, b = (v >> 16) & 255, l = (r * 0.3 + g * 0.59 + b * 0.11); const n = Math.min(255, 150 + l * 0.45) | 0; d[i] = (a << 24) | (Math.min(255, n + 6) << 16) | (n << 8) | Math.max(0, n - 8); }
        Engine.addSprite('p92_bleachhound', Object.assign({}, hd, { data: d }));
      }
    } catch (e) { warnOnce('hound', e); }
  }

  // ---------------------------------------------------------------- the defs: foes, gear, people
  const KEEPER_DEF = { name: TX.keeperName, sprite: 'p92_lamplighter', hp: 170, dmg: [6, 12], speed: 1.2, reach: 1.35, scale: 1.15, xp: 260, desc: TX.keeperDesc };
  const HOUND_DEF = { name: TX.houndName, sprite: 'p92_bleachhound', hp: 22, dmg: [3, 8], speed: 2.4, reach: 1.0, cacophony: true, noiseLure: true, scale: 0.8, xp: 16, desc: TX.houndDesc };
  const ARMOR_DEFS = {
    a_p92_lamphood: { name: TX.hood, slot: 'head', ar: 2, noise: -0.1, value: 48, desc: TX.hoodDesc },
    a_p92_chainboots: { name: TX.boots, slot: 'feet', ar: 1, noise: -0.3, value: 30, desc: TX.bootsDesc },
    a_p92_shadecloak: { name: TX.cloak, slot: 'cape', ar: 1, noise: -0.1, value: 36, desc: TX.cloakDesc },
  };
  const POLE_DEF = { name: TX.pole, img: 'fp_spear', dmg: [2, 7], reach: 2.4, noise: 0.6, speed: 0.7, type: 'iron', blunt: true, twoHanded: true, value: 22, desc: TX.poleDesc };
  function defs() {
    if (typeof WEAPONS !== 'undefined' && !WEAPONS.p92_clothpole) WEAPONS.p92_clothpole = Object.assign({}, POLE_DEF);
    if (typeof ENEMIES !== 'undefined') { if (!ENEMIES.p92_lamplighter) ENEMIES.p92_lamplighter = Object.assign({}, KEEPER_DEF); if (!ENEMIES.p92_bleachhound) ENEMIES.p92_bleachhound = Object.assign({}, HOUND_DEF); }
    if (typeof LOOT !== 'undefined' && !LOOT.p92_bleachhound) LOOT.p92_bleachhound = { chance: 0.3, table: [['sovereigns', 50], ['v_scrap', 30], ['honey', 20]] };
    if (typeof ARMOR !== 'undefined') for (const k in ARMOR_DEFS) if (!ARMOR[k]) ARMOR[k] = Object.assign({}, ARMOR_DEFS[k]);
    if (typeof ITEMS !== 'undefined') {
      for (const k in ARMOR_DEFS) if (!ITEMS[k]) ITEMS[k] = Object.assign({ sprite: 'gear', armor: true }, ARMOR_DEFS[k]);
      if (!ITEMS.w_p92_clothpole) ITEMS.w_p92_clothpole = { name: TX.pole, sprite: 'gear', weapon: 'p92_clothpole', value: 22, desc: TX.poleDesc };
      if (!ITEMS.p92_blackcloth) ITEMS.p92_blackcloth = { name: TX.blackcloth, sprite: 'loot', value: 4, desc: TX.blackclothDesc };
      if (!ITEMS.v_p92_amber) ITEMS.v_p92_amber = { name: TX.amber, sprite: 'gear', valuable: true, value: 70, desc: TX.amberDesc };
      if (!ITEMS.v_p92_mirror) ITEMS.v_p92_mirror = { name: TX.mirrorItem, sprite: 'gear', valuable: true, value: 40, desc: TX.mirrorDesc };
    }
    // their pictures in the pack (each its own: the realm's look)
    try { if (typeof ICONS !== 'undefined' && ICONS.PIX && !Object.prototype.hasOwnProperty.call(ICONS.PIX, 'a_p92_lamphood')) {
      ICONS.PIX.a_p92_lamphood = (d) => {   // a white hood blacked with soot from the inside, a gold thread at the brow
        d.layer('#a8a294').rrect(5, 3, 14, 16); d.layer('#2a2624').rrect(8, 7, 8, 11); d.layer('#c8a050', { shiny: 1 }).rect(7, 6, 10, 1); d.layer('#5a5650').rect(5, 16, 14, 3);
      };
      ICONS.PIX.a_p92_chainboots = (d) => {   // soft black boots, tarred rope soles
        const b = (x) => { d.layer('#1c1a1c').rect(x, 4, 5, 13).rect(x, 14, 8, 4); d.layer('#7a6446').rect(x, 18, 8, 2); for (let i = 0; i < 4; i++) d.layer('#4a3c2a').rect(x + i * 2, 18, 1, 2); };
        b(3); b(13);
      };
      ICONS.PIX.a_p92_shadecloak = (d) => {   // a long black cloak, a small sun scratched in the lining
        d.layer('#16141a').rrect(4, 3, 16, 19); d.layer('#2a2830').rect(11, 3, 2, 19); d.layer('#c8b88a').rect(15, 8, 2, 2).rect(14, 9, 4, 0.6).rect(15.5, 7, 0.6, 4);
      };
      ICONS.PIX.v_p92_amber = (d) => { d.layer('#c88a30', { shiny: 1 }).rrect(6, 7, 12, 10); d.layer('#f4c868', { shiny: 1 }).rrect(8, 9, 5, 4); d.mark('#fff4d0', 16, 8); };
      const pole = (d) => { d.tilt(12, 12); d.layer('#7a5e40').rrect(-1, -10, 2, 22); d.layer('#46484c', { shiny: 1 }).rect(-6, -12, 12, 1.6); d.layer('#141218').rect(-5.5, -10.5, 11, 9); };
      ICONS.PIX['weapon:p92_clothpole'] = pole; ICONS.PIX.w_p92_clothpole = pole;
      ICONS.PIX.v_p92_mirror = (d) => { d.layer('#0c0c10').rrect(5, 4, 14, 16); d.layer('#6a5434').rect(5, 11, 14, 2); };
    } } catch (e) { warnOnce('icons', e); }
    if (typeof NPCS !== 'undefined') {
      const npc = (id, name, sprite, portrait, extra) => { if (!NPCS[id]) NPCS[id] = Object.assign({ name, sprite, portrait, tier: 'low', greet: SAY[id.slice(4)].greet, topics: SAY[id.slice(4)].topics }, extra || {}); };
      npc('p92_ysolde', TX.ysolde, 'p92_veiled', 'townswoman');
      npc('p92_brenna', TX.brenna, 'p92_brenna', 'bettany', { shop: [{ item: 'p92_blackcloth', price: 4 }, { item: 'bandage', price: 4 }, { item: 'tonic', price: 5 }], markup: 1.0, shopTalk: { hello: S('Rope, cloth, tar, and what the Free Captains leave with me.'), broke: S('Then you are not buying rope today.'), thanks: [S('Wind it tight.'), S('Keep the right side of your face to the dark.')] } });
      npc('p92_anselm', TX.anselm, 'p92_folk_a', 'hob', { shop: [{ item: 'a_p92_chainboots' }, { item: 'tonic', price: 5 }], markup: 1.0, shopTalk: { hello: S('Rope soles, black uppers, no nails. You will not hear yourself.'), broke: S('Come back when you have the coin. The boots will keep.'), thanks: [S('Stand still when the chains jerk.'), S('Mind the walk.')] } });
      npc('p92_canvas', TX.canvas, 'p92_folk_b', 'townswoman', { shop: [{ item: 'a_p92_shadecloak' }, { item: 'w_p92_clothpole' }, { item: 'v_p92_mirror', price: 60 }, { item: 'honey', price: 5 }, { item: 'pellets', price: 4 }], markup: 1.1, shopTalk: { hello: S('Quick, under the canvas. Everything here is something the Church does not like.'), broke: S('Then you are only looking. Look somewhere else.'), thanks: [S('Never take the cloth off down here.'), S('You did not buy it from me.')] } });
      npc('p92_joss', TX.joss, 'p92_folk_c', 'townsman');
      npc('p92_folk', TX.folk, 'p92_folk_d', 'townsman', { rumour: true });
    }
  }

  // ---------------------------------------------------------------- the lamps (the Souls rules: group 'h')
  let LAMPS = [];
  function lamps() {
    if (LAMPS.length || typeof SOULS91 === 'undefined' || !SOULS91.register) return;
    const base = { sprite: 'p92_shadelamp', litSprite: 'p92_shadelamplit', label: TX.lampLabel, litLabel: TX.lampLit, lightCol: [240, 186, 110] };
    LAMPS = SOULS91.register('h', { maps: [MAP], revive: [MAP], keeper: (e) => e._p92 === 'keeper', kflag: 'p92k', note: 528 }, [
      Object.assign({ map: MAP, x: P.dockLamp[0], y: P.dockLamp[1], wx: P.dockLamp[0] + 1.2, wy: P.dockLamp[1] + 1.4, dir: -PI / 2, name: TX.lampDock }, base),
      Object.assign({ map: MAP, x: P.cobblerLamp[0], y: P.cobblerLamp[1], wx: P.cobblerLamp[0] - 1.2, wy: P.cobblerLamp[1] + 1.2, dir: -PI / 2, name: TX.lampCobbler }, base),
      Object.assign({ map: MAP, x: P.bellLamp[0], y: P.bellLamp[1], wx: P.bellLamp[0] + 1.4, wy: P.bellLamp[1] + 1.4, dir: PI / 2, name: TX.lampBell }, base),
    ]);
  }

  // ---------------------------------------------------------------- building the Tiers
  function decode() {
    const out = new Array(H);
    for (let j = 0; j < H; j++) {
      const r = G0 && G0.rows[j] ? G0.rows[j] : ''; let s = '';
      for (let i = 0; i < r.length;) { let n = 0; while (i < r.length && r[i] >= '0' && r[i] <= '9') n = n * 10 + (r.charCodeAt(i++) - 48); s += r[i++].repeat(n || 1); }
      out[j] = (s + '.'.repeat(W)).slice(0, W);
    }
    return out;
  }
  // a thick polyline of cells, with a callback for each
  function polyCells(pts, half, fn) {
    for (let k = 0; k + 1 < pts.length; k++) {
      const [ax, ay] = pts[k], [bx, by] = pts[k + 1], n = Math.ceil(Math.hypot(bx - ax, by - ay) * 2);
      for (let t = 0; t <= n; t++) { const x = ax + (bx - ax) * t / n, y = ay + (by - ay) * t / n;
        for (let dy = -half; dy <= half; dy++) for (let dx = -half; dx <= half; dx++) fn(Math.round(x + dx), Math.round(y + dy)); }
    }
  }
  // the nearest standing place: a walkway cell (never the drop), clear of what stands there already
  const snap = (m, x, y) => {
    const ok = (px, py) => { const i = px | 0, j = py | 0; if (i < 1 || j < 1 || i >= m.w - 1 || j >= m.h - 1) return false; const k = j * m.w + i; if (!m.smooth || !m.smooth[k] || m.get(i, j)) return false; return !m.entities.some((e) => e.solid && Math.hypot(e.x - px, e.y - py) < 0.7); };
    if (ok(x, y)) return [x, y];
    for (let r = 0.5; r <= 8; r += 0.5) for (let a = 0; a < 16; a++) { const px = x + Math.cos(a / 16 * PI * 2) * r, py = y + Math.sin(a / 16 * PI * 2) * r; if (ok(px, py)) return [px, py]; }
    return [x, y];
  };
  function build() {
    const grid = decode();
    const m = new GameMap(MAP, TX.name, W, H, { floor: 't_p92_plank', ceil: null, floorTextures: FLOORS, fogDist: 30, fogColor: [30, 34, 50], ambient: 0.16, music: 'inside', danger: 2,
      spawn: { x: P.arrive[0], y: P.arrive[1], dir: -PI / 2 } });
    const N = W * H, kind = new Uint8Array(N);   // 0 gulf, 1 walk, 2 house, 3 wall, 4 chain-walk, 5 dock
    const at = (i, j) => (i < 0 || j < 0 || i >= W || j >= H) ? -1 : j * W + i;
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const c = grid[j][i], k = j * W + i;
      kind[k] = c === ',' || c === '=' ? 1 : c === '#' ? 4 : c === 'H' ? 2 : c === 'r' ? 3 : 0;
    }
    // the rooms and the ways carved into the figure
    const walk = (x, y, k2) => { const k = at(x, y); if (k >= 0 && x > 0 && x < W - 1 && y > WALL_ROWS && y < H - 1) kind[k] = k2 || (kind[k] === 4 ? 4 : 1); };
    for (const key of ['ladders', 'toSquare', 'market', 'waist', 'bell']) polyCells(ROUTES[key], 1, (x, y) => walk(x, y));
    polyCells(ROUTES.chainwalk, 1, (x, y) => walk(x, y, 4));
    // the chain-walks' sides are open: what lies either side of them is the drop itself
    const fallCells = new Uint8Array(N);
    polyCells(ROUTES.chainwalk, 3, (x, y) => { const k = at(x, y); if (k >= 0 && kind[k] === 0) fallCells[k] = 1; });
    // the docks: a broad apron of planks at the bottom; the gulf below it
    for (let j = 205; j <= 219; j++) for (let i = 50; i <= 110; i++) kind[at(i, j)] = 5;
    for (let j = 220; j < H; j++) for (let i = 0; i < W; i++) kind[at(i, j)] = 0;
    // the harbour-master's house at the dock's west end
    for (let j = 205; j <= 209; j++) for (let i = 62; i <= 68; i++) kind[at(i, j)] = 2;
    // the cobbler's terrace and the market's
    for (let j = 120; j <= 130; j++) for (let i = 14; i <= 30; i++) if (kind[at(i, j)] !== 4) kind[at(i, j)] = 1;
    for (let j = 144; j <= 156; j++) for (let i = 76; i <= 94; i++) kind[at(i, j)] = 1;
    // the hanging square: a platform slung on four chains, the drop open all round it
    const [sx0, sy0, sx1, sy1] = P.square;
    for (let j = sy0 - 3; j <= sy1 + 3; j++) for (let i = sx0 - 3; i <= sx1 + 3; i++) { const k = at(i, j); if (k < 0) continue; kind[k] = 0; fallCells[k] = 1; }
    for (let j = sy0; j <= sy1; j++) for (let i = sx0; i <= sx1; i++) kind[at(i, j)] = 1;
    for (const [x0, y0, x1, y1] of [[79, sy1 + 1, 81, sy1 + 3], [sx0 - 3, 31, sx0 - 1, 33], [79, sy0 - 3, 81, sy0 - 1]]) for (let j = y0; j <= y1; j++) for (let i = x0; i <= x1; i++) kind[at(i, j)] = 1;   // the three ways onto it
    polyCells([[sx0 - 3, 32], [62, 40], [58, 56]], 1, (x, y) => walk(x, y));
    // the bell-gallery stair, under the black wall
    const [bx0, by0, bx1, by1] = P.bell;
    for (let j = by0; j <= by1; j++) for (let i = bx0; i <= bx1; i++) kind[at(i, j)] = 1;
    // the black wall along the line, and the rock beyond the city's rim
    for (let j = 0; j < WALL_ROWS; j++) for (let i = 0; i < W; i++) kind[at(i, j)] = 3;
    for (let i = 0; i < W; i++) { kind[at(i, H - 1)] = 0; }
    // ---- cells, levels, floors
    const V = m.ensureVerts(), L = m.ensureLvls(), W1 = W + 1;
    for (let vy = 0; vy <= H; vy++) for (let vx = 0; vx <= W; vx++) V[vy * W1 + vx] = hv(vy);
    m.setSide(0, 0, W - 1, H - 1, 't_p92_under');
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const k = j * W + i, t = kind[k], lv = lvlAt(j);
      if (t === 1 || t === 4 || t === 5) { m.smooth[k] = 1; L[k] = lv; m.setFloor(i, j, t === 4 ? CHAIN : t === 5 ? DOCK : (h2(i >> 3, j >> 3) < 0.3 ? STONE : PLANK)); continue; }
      m.smooth[k] = 0;
      if (t === 0) { L[k] = GULF_Z; m.setFloor(i, j, fallCells[k] ? FALL : GULF); continue; }
      if (t === 2) { L[k] = GULF_Z; m.block(i, j, 't_p92_house' + ((i * 7 + j * 3) % 3), lv + 1.9 + h2(i >> 1, j >> 1) * 1.4); continue; }
      if (t === 3) { if (j < WALL_ROWS) { L[k] = lv; m.block(i, j, 't_p92_blackwall', lvlAt(WALL_ROWS) + 5.2); } else { L[k] = GULF_Z; m.block(i, j, 't_p92_rock', lv + 4); } }
    }
    // the edges of the map: rock on the sides (the city goes on beyond them, out of this place)
    for (let j = WALL_ROWS; j < H - 1; j++) for (const i of [0, W - 1]) { if (j > 200) continue; m.smooth[j * W + i] = 0; L[j * W + i] = GULF_Z; m.block(i, j, 't_p92_house' + (j % 3), lvlAt(j) + 3); }
    // the Bleach below the line: fixed patches near the wall
    const bleach = new Uint8Array(N);
    for (const [cx, cy, r] of BLEACH_SPOTS) for (let j = Math.floor(cy - r); j <= Math.ceil(cy + r); j++) for (let i = Math.floor(cx - r); i <= Math.ceil(cx + r); i++) { const k = at(i, j); if (k >= 0 && m.smooth[k] && Math.hypot(i + 0.5 - cx, j + 0.5 - cy) <= r) { bleach[k] = 1; m.setFloor(i, j, BLEACH); } }
    m._p92 = { kind, bleach, fallCells };
    // ---- the iron door (seen, not entered)
    m.set(P.ironDoor[0], P.ironDoor[1], DOOR({ tex: 't_p92_irondoor', label: TX.ironDoorLabel, locked: 'p92_never', lockMsg: TX.ironDoor }));
    m.setLvl(P.ironDoor[0], P.ironDoor[1], lvlAt(P.ironDoor[1]));
    // ---- the Kestrel's ladder, the winch-boats, the docks
    m.deco('ladder', P.kestrel[0], P.kestrel[1], { radius: 0.2, scale: 1.5, solid: false, use: 'p92_kestrel', label: TX.ladder });
    // the eleven cradles below the dock's edge (Book Two ch. 9): the Kestrel in the fourth from the west end; a Church packet
    // and two freighters in three of the others; the rest empty and swinging
    for (let k = 0; k < 11; k++) {
      const x = 54.5 + k * 5.2;
      m.add({ kind: 'deco', sprite: 'p92_cradle', x, y: 221.0, scale: 2.3, solid: false, radius: 0.05, yOff: GULF_Z + 1.8, label: TX.cradle, _decor: true });
      shipArt();
      const ship = k === 2 ? ['p92_freighter', TX.freighter] : k === 7 ? ['p92_packet', TX.packet] : k === 9 ? ['p92_freighter', TX.freighter] : null;
      if (ship && Engine.sprites && Engine.sprites[ship[0]]) m.add({ kind: 'deco', sprite: ship[0], x, y: 222.4, scale: 4.6, solid: false, radius: 0.05, yOff: GULF_Z + 1.4, label: ship[1], _decor: true });
    }
    // the Kestrel herself, moored broadside under the dock's edge, her envelope standing above the planks (her cell's
    // floor is the gulf's, so she is lifted back up to the docks)
    m.add({ kind: 'deco', sprite: 'kestrel_m2', x: P.kestrel[0], y: 222.6, scale: 5.0, solid: false, radius: 0.05, yOff: GULF_Z + 1.4, label: TX.ladder, _decor: true, _p92: 'kestrel' });
    for (const x of [51.5, 109.5]) m.deco('p92_winchboat', x, 220.6, { radius: 0.2, scale: 1.3, solid: false, yOff: GULF_Z + 0.6, label: TX.winchboat });   // hung over the gulf at the docks' ends
    m.deco('sign', 84.6, 206.2, { radius: 0.15, scale: 0.8, solid: false, label: TX.docks });
    // ---- the lamps (Souls), the goods-cage
    lamps();
    if (typeof SOULS91 !== 'undefined' && SOULS91.lampEnt) for (const L0 of LAMPS) m.add(SOULS91.lampEnt(L0));
    m.deco('p92_cage', P.cageTop[0], P.cageTop[1], { radius: 0.4, scale: 1, solid: true, use: 'p92_cage', _p92: 'cageTop', label: TX.cageTop });
    m.deco('p92_cage', P.cageBottom[0], P.cageBottom[1], { radius: 0.4, scale: 1, solid: true, use: 'p92_cage', _p92: 'cageBottom', label: TX.cageBottom });
    // ---- the hanging square's four chains, the market, the cobbler's
    for (const [x, y] of [[sx0 + 0.6, sy0 + 0.6], [sx1 + 0.4, sy0 + 0.6], [sx0 + 0.6, sy1 + 0.4], [sx1 + 0.4, sy1 + 0.4]]) m.deco('p92_bigchain', x, y, { radius: 0.3, scale: 1, solid: true, label: TX.bigChain });
    m.deco('p92_stall', 82.5, 147.2, { radius: 0.6, scale: 1, solid: true, label: TX.stall });
    m.deco('p92_mirrorcloth', 86.4, 147.6, { radius: 0.15, scale: 1, solid: false, label: TX.mirror });
    m.deco('p92_stall', 90.5, 152.2, { radius: 0.6, scale: 1, solid: true, label: TX.stall });
    m.deco('p92_bench', 18.6, 123.0, { radius: 0.4, scale: 1, solid: true, label: TX.bench });
    m.deco('sign', 80.5, 18.4, { radius: 0.15, scale: 0.8, solid: false, label: TX.bellStair });
    for (let i = 2; i < W - 2; i += 3) m.add({ kind: 'deco', sprite: 'p92_overline', x: i + 0.5, y: WALL_ROWS + 0.04, scale: 1, solid: false, radius: 0.05, yOff: -5.0, glow: 0, label: TX.wall, _decor: true });
    m.deco('sign', 81.6, P.ironDoor[1] + 1.4, { radius: 0.15, scale: 0.7, solid: false, label: TX.wall });
    // ---- shade-lamps along the ways, chain-posts along the chain-walks (every so many cells, fixed)
    const lampAt = (x, y) => { const k = at(x | 0, y | 0); if (k < 0 || !m.smooth[k] || bleach[k]) return; if (m.entities.some((e) => Math.hypot(e.x - x, e.y - y) < 4)) return; m.deco('p92_streetlamp', x, y, { radius: 0.12, scale: 1, solid: false, glow: 0.7, lightCol: [235, 170, 100], label: TX.streetlamp, _p92: 'streetlamp' }); };
    for (const key of ['ladders', 'toSquare', 'market', 'waist']) { const pts = ROUTES[key]; for (let k = 0; k + 1 < pts.length; k++) for (let t = 0.25; t < 1; t += 0.5) lampAt(pts[k][0] + (pts[k + 1][0] - pts[k][0]) * t + 1.6, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * t + 0.5); }
    for (const [x, y] of [[60, 210], [100, 210], [80, 206], [24, 128], [88, 152], [80, 16], [74, 26], [87, 38]]) lampAt(x + 0.5, y + 0.5);
    { const pts = ROUTES.chainwalk; for (let k = 0; k + 1 < pts.length; k++) for (let t = 0; t < 1; t += 0.2) { const x = pts[k][0] + (pts[k + 1][0] - pts[k][0]) * t, y = pts[k][1] + (pts[k + 1][1] - pts[k][1]) * t; for (const d of [-1.45, 1.45]) m.deco('p92_chainpost', x + 0.5, y + 0.5 + d, { radius: 0.08, scale: 1, solid: false, label: TX.chainwalk }); } }
    // ---- the people
    const who = (id, x, y, face, extra) => { const [px, py] = snap(m, x, y); return m.npc(id, px, py, Object.assign({ facing: face || 0 }, extra || {})); };
    who('p92_ysolde', P.ysolde[0], P.ysolde[1], PI / 2);
    for (const [dx, dy] of [[-0.8, -1.0], [0.8, -1.0]]) { const [px, py] = snap(m, P.ysolde[0] + dx, P.ysolde[1] + dy); m.deco('p92_poleman', px, py, { radius: 0.3, scale: 1, solid: true, label: TX.folk, facing: PI / 2 }); }   // her two pole-men, in her shadow
    who('p92_brenna', P.brenna[0], P.brenna[1], PI / 2);
    m.deco('sign', P.brenna[0] + 1.2, P.brenna[1] - 0.6, { radius: 0.15, scale: 0.8, solid: false, label: TX.rope });
    { const [lx, ly] = snap(m, P.brenna[0] - 0.9, P.brenna[1] - 0.5); m.deco('p92_streetlamp', lx, ly, { radius: 0.12, scale: 0.8, solid: false, glow: 0.1, lightCol: [120, 86, 50], label: TX.rope }); }   // her shuttered lamp, turned to a slit
    who('p92_anselm', P.anselm[0], P.anselm[1], 0);
    who('p92_canvas', P.canvas[0], P.canvas[1], PI / 2);
    who('p92_joss', P.joss[0], P.joss[1], PI);
    for (const [x, y, f] of [[88.5, 212.5, PI], [96.5, 209.5, -PI / 2], [104.5, 190.5, PI / 2], [79.5, 152.5, 0], [24.5, 129.5, -PI / 2], [83.5, 96.5, PI / 2]]) who('p92_folk', x, y, f, { wander: true });
    // ---- what walks there
    const foe = (type, x, y, o) => { const [px, py] = snap(m, x, y); return m.enemy(type, px, py, o); };
    foe('p92_lamplighter', P.keeper[0], P.keeper[1], { _p92: 'keeper', facing: PI / 2 });
    for (const [x, y] of [[60.5, 40.5], [100.5, 46.5], [64.5, 16.5], [110.5, 62.5], [50.5, 72.5]]) foe('p92_bleachhound', x, y);
    for (const [x, y] of [[100.5, 124.5], [60.5, 124.5], [38.5, 125.5]]) foe('mites', x, y);
    for (const [x, y] of [[120.5, 160.5], [70.5, 100.5], [92.5, 82.5]]) foe('hound', x, y);
    m.baseCount = m.entities.length;
    return m;
  }

  // ---------------------------------------------------------------- joined into the world
  function join(maps) {
    if (!maps || maps[MAP] || !G0 || typeof GameMap === 'undefined') return false;
    defs(); art();
    maps[MAP] = build();
    return true;
  }
  function wireKestrel() {
    if (typeof KESTREL16 === 'undefined' || !KESTREL16.addFar) return;
    KESTREL16.addFar({ id: MAP, name: TX.fly, arrive: TX.arrive, down: TX.down, toLabel: TX.toLabel, hours: 30,
      landing: () => ({ map: MAP, x: P.arrive[0], y: P.arrive[1] - 0.6, dir: -PI / 2 }) });
  }

  // ---------------------------------------------------------------- the dangers, every frame
  const f = () => G.flags;
  const fint = (k, max) => { const v = Number(f()[k]); return Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : 0; };
  const say = (t, cls, ms) => { try { msg(t, cls || '', ms || 6000); } catch (e) { /* quiet */ } };
  const once = (bit, t, cls, ms) => { const s = fint('p92_seen', 1023); if (s & (1 << bit)) return false; f().p92_seen = s | (1 << bit); say(t, cls, ms); return true; };
  const patches = [];   // glass-fire on the planks: { x, y, r, t, ent }
  let clock = 0, lastSafe = null, burnAcc = 0, jerkPhase = -1, keeperCool = 0;
  const JERK = 13, CREAK = 1.4;
  const here = () => typeof G !== 'undefined' && G.map && G.mapId === MAP && G.map.id === MAP;
  const cellK = (x, y) => (y | 0) * W + (x | 0);
  function inBleach(x, y) {
    const d = G.map._p92; if (d && d.bleach[cellK(x, y)]) return 1;
    for (const q of patches) if (Math.hypot(q.x - x, q.y - y) < q.r) return 1.5;
    return 0;
  }
  function onChainWalk(x, y) { const d = G.map._p92; return !!(d && d.kind[cellK(x, y)] === 4); }
  function addPatch(x, y) {
    const ent = { kind: 'deco', sprite: 'p92_glassfire', x, y, scale: 1.4, solid: false, radius: 0.05, transient: true, _decor: true, glow: 1, lightCol: [255, 240, 200], label: TX.bleachPatch };
    G.ents.push(ent); patches.push({ x, y, r: 1.4, t: 6, ent });
  }
  function clearPatches() { for (const q of patches) { const i = G.ents.indexOf(q.ent); if (i >= 0) G.ents.splice(i, 1); } patches.length = 0; }
  function tick(dt) {
    if (!here() || G.state !== 'play' || !G.player || G.dead) return;
    clock += dt;
    const p = G.player, c = Engine.cam, d = G.map._p92; if (!d) return;
    const k = cellK(c.x, c.y), standing = p.fallFrom == null && m_smooth(k);
    if (standing) lastSafe = { x: c.x, y: c.y, dir: c.dir };
    // the harbourmaster takes any glass that shows a face, at the foot of the ladder (Book Two ch. 9)
    if (!fint('p92_bag', 1) && G.has && G.has('v_p92_mirror') && Math.hypot(c.x - P.ysolde[0], c.y - P.ysolde[1]) < 2.4) { G.take('v_p92_mirror'); f().p92_bag = 1; say(TX.bagTaken, '', 9000); }
    // the gulf: you fell; the Piece stays where you last stood
    if (!m_smooth(k) && typeof p.feet === 'number' && p.feet < lvlAt(c.y | 0) - 2.5) {
      if (lastSafe) { c.x = lastSafe.x; c.y = lastSafe.y; }
      p.hp = 0; die(TX.gulf); return;
    }
    // the Bleach: it eats while you stand in it
    const b = inBleach(c.x, c.y);
    if (b) {
      burnAcc += dt * 4 * b * (typeof GEAR87 === 'object' && GEAR87.special('shade') ? 0.5 : 1);   // the Umbral set, in full: half
      if (burnAcc >= 1) { const n = Math.floor(burnAcc); burnAcc -= n; p.hp -= n; G.hurtT = 0.12; if (p.hp <= 0) { die(TX.bleachPatch); return; } }
      try { fx('p92-white', 220); } catch (e) { /* no overlay */ }
      once(0, TX.bleach, 'bad', 5000);
    } else burnAcc = 0;
    // glass-fire burns out
    for (let i = patches.length - 1; i >= 0; i--) { const q = patches[i]; q.t -= dt; q.ent.glow = 0.6 + 0.4 * Math.sin(clock * 9 + i); if (q.t <= 0) { const j = G.ents.indexOf(q.ent); if (j >= 0) G.ents.splice(j, 1); patches.splice(i, 1); } }
    // the chain-walks jerk on the chains' beat
    const ph = clock % JERK, onWalk = onChainWalk(c.x, c.y);
    if (onWalk && ph > JERK - CREAK && jerkPhase !== 1) { jerkPhase = 1; once(1, TX.creak, 'warn', 4000); try { Audio_.sfx.door(); } catch (e) { /* */ } }
    if (ph < JERK - CREAK && jerkPhase === 1) {
      jerkPhase = 0;
      if (onWalk) {
        const moving = G.keys && (G.keys.w || G.keys.s || G.keys.a || G.keys.d || G.keys.arrowup || G.keys.arrowdown);
        if (moving) { const side = h2(Math.floor(clock / JERK), 5) < 0.5 ? -1 : 1, ny = c.y + side * 1.1; if (typeof playerMove === 'function') playerMove(c, 0, ny - c.y); say(TX.jerked, 'bad', 3500); try { Audio_.sfx.hurt(); } catch (e) { /* */ } }
        else say(TX.held, '', 3000);
      }
    }
    // the keeper: glass-fire at where you stand
    const kp = G.ents.find((e) => e && e._p92 === 'keeper');
    if (kp && !kp.dead && kp.state === 'chase' && Math.hypot(kp.x - c.x, kp.y - c.y) < 10) {
      keeperCool -= dt;
      if (keeperCool <= 0) { keeperCool = 5.5; addPatch(c.x, c.y); once(2, TX.glassfire, 'bad', 6000); }
    } else keeperCool = Math.min(keeperCool, 2);
    if (kp) { kp.glow = kp.dead ? 0 : 0.4; kp.lightCol = [255, 214, 150]; }
    // the keeper's gear, once
    if (kp && kp.dead && !fint('p92_kdrop', 1)) {
      f().p92_kdrop = 1; clearPatches();
      for (const [id, dx] of [['a_p92_lamphood', -0.4], ['v_p92_amber', 0.4]]) { const it = ITEMS[id]; G.ents.push(hydrate({ kind: 'item', item: id, sprite: it.sprite || 'gear', x: kp.x + dx, y: kp.y, scale: 0.35, yOff: 0, solid: false })); }
      say(TX.keeperDown, 'good', 7000);
    }
  }
  const m_smooth = (k) => !!(G.map.smooth && G.map.smooth[k]);

  // ---------------------------------------------------------------- using things
  function useOwn(e) {
    if (!e || typeof e.use !== 'string' || !/^p92_/.test(e.use) || !here()) return false;
    if (e.use === 'p92_kestrel') {
      if (fint('p92_bag', 1) === 1) { f().p92_bag = 0; G.give('v_p92_mirror', 1); say(TX.bagBack, '', 6000); }
      if (typeof KESTREL16 !== 'undefined' && KESTREL16.board) KESTREL16.board(); return true;
    }
    if (e.use === 'p92_cage') {
      const open = fint('p92_cage', 1) === 1;
      if (e._p92 === 'cageTop') {
        if (!open) { f().p92_cage = 1; rideTo('bottom'); say(TX.cageDrop, 'good', 9000); try { Audio_.sfx.door(); } catch (er) { /* */ } }
        else { rideTo('bottom'); say(TX.cageDown, '', 4000); }
      } else if (!open) say(TX.cageBottom, '', 5000);
      else { rideTo('top'); say(TX.cageUp, '', 4000); }
      sync(); return true;
    }
    return false;
  }
  function rideTo(end) {
    const c = Engine.cam, t = end === 'top' ? [P.cageTop[0] - 1.3, P.cageTop[1] + 1.0, PI / 2] : [P.cageBottom[0] - 1.3, P.cageBottom[1] + 1.0, -PI / 2];
    c.x = t[0]; c.y = t[1]; c.dir = t[2]; if (G.player) { G.player.feet = G.map.groundAt(c.x, c.y); G.player.fallFrom = null; G.player.fallV = 0; }
  }
  function sync() {
    if (!here()) return;
    const open = fint('p92_cage', 1) === 1;
    for (const e of G.ents) if (e && e._p92 === 'cageTop') e.label = open ? TX.cageTopOpen : TX.cageTop; else if (e && e._p92 === 'cageBottom') e.label = open ? TX.cageBottomOpen : TX.cageBottom;
  }

  // ---------------------------------------------------------------- wiring
  function wire() {
    defs(); art();
    if (typeof document !== 'undefined' && document.head && !document.getElementById('p92-style')) { const st = document.createElement('style'); st.id = 'p92-style'; st.textContent = '#fx.p92-white { background: rgba(255, 252, 236, 0.22); }'; document.head.appendChild(st); }
    if (typeof buildAllMaps === 'function') { const _b = buildAllMaps; buildAllMaps = function () { const maps = _b.apply(this, arguments); try { join(maps); } catch (e) { warnOnce('build', e); } return maps; }; }
    if (typeof useDeco === 'function') { const _ud = useDeco; useDeco = function (e) { try { if (useOwn(e)) return undefined; } catch (err) { warnOnce('use', err); } return _ud.apply(this, arguments); }; }
    if (typeof loadMap === 'function') { const _l = loadMap; loadMap = function () { const r = _l.apply(this, arguments); try { patches.length = 0; lastSafe = null; burnAcc = 0; sync(); } catch (e) { warnOnce('load', e); } return r; }; }
    if (typeof update === 'function') { const _u = update; update = function (dt) { const r = _u.apply(this, arguments); try { tick(Number(dt) || 0); } catch (e) { warnOnce('tick', e); } return r; }; }
    wireKestrel();
  }
  wire();

  return { TX, SAY, TEXTS, MAP, W, H, P, ROUTES, FLOORS, KEEPER_DEF, HOUND_DEF, ARMOR_DEFS, lvlAt, hv, build, join, decode, tick, useOwn, sync, inBleach, onChainWalk,
    lamps: () => LAMPS, patches: () => patches, addPatch, clearPatches, JERK, CREAK, clock: () => clock, setClock: (v) => { clock = v; }, lastSafe: () => lastSafe };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = HEIGHTS92;
if (typeof window !== 'undefined') window.HEIGHTS92 = HEIGHTS92;
