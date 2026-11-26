# Phase 126: the callings, part one (design, for the builder)

25 November 2026. Glass-Hand (id `blade`), Cantor (`cantor`), Corsair (`corsair`). Read-only design; nothing in the repo was changed.

**Abbreviations.** **MS** = `story/Books/Book One - The Silenced Province/Book One - The Silenced Province (full manuscript).md`, by line. **SB** = `story/World Bibles/Series Bible (canon).md`, by line. **Brief** = `story/Game Layer/Phase 125 - lore brief, the six callings.md`. Every MS and SB line cited below I re-read for this design. Code lines are from the main checkout as it stands (branch `p124e-faces`, level with main, head `684e43da`). **[PROPOSED]** marks everything invented here.

**The rule this whole design keeps.** At a canon set-piece the traveller cannot change what happens (Phase 125 design §3; the 125b record). So a calling's act "matters" in one of two ways. It can change how a book scene feels to play without changing what happens in it. Or it can make a real difference in the traveller's own play: the systems, the side content, the game's own scenes. Each calling below gets one of each.

---

## 0. The short version

- **One mechanism, two parts, in `js/callings126.js`.** A *sight* that comes up by itself when you stand still, drawn over the world on the HUD layer. It is anchored to each thing's on-screen rect (`e._screen`), which both renderers fill, so it is the same code and the same picture in the classic view and the 3D view. An *act*: the use key (E) on the right thing does your calling's verb. Phase 127 registers the other three callings in the same table.
- **Glass-Hand.** *Sees:* the pale lilac core inside every Legionnaire's bell; the brass hand-press at a proctor's belt; Vosk's green lenses. *Does:* takes a Legionnaire by the bell. The glass drinks the alarm, the voice inside comes out clear, and the tideline climbs 3. Afterwards the hand rings full, and the bells that hear it tell Vosk at her morning walk. *First landing:* the quarry's Legionnaires and Vosk's walk (Part One).
- **Cantor.** *Sees:* who is humming and how true: the night-hummers, Old Tam, Bettany, the hush-lamps' reed-whistles, the youngest student, Lyra's breath with no voice in it, the choir's unbroken line and the Pure Note's lid. *Does:* hums under the Narrow (the Cantor's murmur stays above the Hush and below everything else), and hums the tending note into someone's hands. *First landing:* Hob Wendle's step on the Grafters' round (Rootday, day 1).
- **Corsair.** *Sees:* loads and lines: the Kestrel riding heavy at her mast line, the chains and lashings of the chandeliers and scaffolds with the patch where each will fall, and on an air93 flight the grapnel chains, the unlashed hold and the four tanks, sound or sour or weeping. *Does:* works a deck with the hands. On cargo night it signs to Mags in Rust Coast hand-cant (once, to save a bad round). On an air93 flight it slips a grapnel hook by hand: slowly and silently, where the axe is quick and loud. *First landing:* cargo night (Part One).
- **Cut honestly.** The row cannot all be built by one builder. The second landings move to **126b**: the proctors' presses as a scene of their own (the clearing, the Malting), the cores in crates, the Conservatory as an act, the cutter and Grab the Line for the Corsair, and climbing. See §6.9.

---

## 1. What exists today

### 1.1 Shared

| What | Where |
|---|---|
| The six callings, their numbers, songs and gear lists | `js/data.js` ll. 10-64 (`CLASSES`): blade `glass: true`, weapons `['sword','glass']`, songs `['murmur']`; cantor voice 40, songs `['murmur','tending','fifth','root']`; corsair pellets 12, songs `['murmur']` |
| Starting kits (these override the gear above) | `js/gear87.js` ll. 107-110 (`KITS`): blade the Siphon set with sword and glass; cantor the cantor set with hands and pistol; corsair the captains' set with axe and pistol |
| Skill bumps at creation | `js/upgrades.js` ll. 366-368 |
| The suggestion quiz | `js/origins.js` l. 54 on (`QUESTIONS`), l. 111 (`REASONS`) |
| The calling lines around the boots moments (unvoiced) | `js/boots125.js` ll. 176-189 (`CALLING`), l. 191 `callingOf()` |
| The audit's finding | Audit, section 7 (l. 108): "The callings play alike… The Blade has the glass arm, noticed about twenty times. The Cantor has four Songs and three small touches… The Corsair has an eight-in-a-hundred better dodge and nothing else." Its table (ll. 116-121) and the landings (l. 125) are the roadmap row's source. |

### 1.2 Glass-Hand (`blade`)

| Today | Where |
|---|---|
| Starts glassed at 42 ("Set" on the sheet) | `js/game.js` l. 148; stage names l. 1880 |
| Hounds and Cacophony keep off the glassed (while not locked) | `js/game.js` l. 586; `js/hunters13.js` l. 253; `js/longnight17.js` l. 819 |
| A hand-press strike locks the arm for 8 s | `js/game.js` l. 609 (`d.press && p.glassed` → `G.glassLock = 8`) |
| Glass drinks a broken Cacophony: +4 hp, tideline +3, Heartglass at 100 | `js/game.js` l. 635 |
| A locked arm cannot strike | `js/game.js` l. 715 |
| The glass bar on the HUD (`#6fd6e0`) | `js/game.js` l. 2441 |
| "Take it by the bell", **at Tamsin Reed only** (Depot Three): +3, at most 99 | `js/tamsin52.js` ll. 9-11, 60, 136, 155 (`GLASS = 3`, l. 47) |
| Other places that notice the glass | `js/tobiah57.js` l. 64; `js/herald66.js` l. 304; `js/church55.js` l. 180; `js/coda.js` l. 116; `js/grove.js` ll. 140, 314; `js/stores113.js` l. 310; `js/pumps58.js` l. 72; `js/game.js` l. 1662 |
| **A collision found** | `js/pumps58.js` l. 33 (`voiceGlass`, used at l. 72): the Arbiter speaks "in" the glassed traveller's own arm. Phase 125 ruled that the traveller's glass is raw seam glass, not Dawning glass. The party line is for "two pieces cut from the same Spire" (SB 160). Fixed in this phase (§6.2). |

### 1.3 Cantor

| Today | Where |
|---|---|
| Murmur: noise floor 2.6 for 4 s (every calling) | `js/game.js` ll. 320, 768; key N l. 2233 |
| Four Songs | `js/data.js` ll. 208-212 |
| The clay jar: the tending note hummed into yourself (noise 0.9, mends 20, not while hunted); the root-hair after a large mending | `js/touches75.js` ll. 14-26, 44, 117, 149 |
| Hold the Pitch (the shared minigame); the youngest student at the Conservatory | `js/reedcraft.js`; `js/conservatory59.js` ll. 72-73, 143, 181 (`p59_lesson`) |
| Night-hummers at three crossings, 19:00 to dawn; the lamplighter; hush-lamps | `js/narrow28.js` ll. 146-147, 182 (`isLamp`), 405-427 |
| The Grafters' round: Hob's choices, beside Lyra or with the Grafters | `js/grafters67.js` ll. 77, 152-153 (`HOB_CHOICES`, `HOB_DID`), 304-311 (`hobCard`) |
| Lyra tends you as a companion | `js/party.js` ll. 276-283 |

### 1.4 Corsair

| Today | Where |
|---|---|
| +0.08 dodge | `js/game.js` l. 604 |
| The calling line at One to Ten | `js/boots125.js` l. 186 |
| The Kestrel at the mast on the rim, turning on her line; the line drawn by a CPU post hook | `js/mast123.js` ll. 9-25, 256-257; `js/smalllife.js` ll. 612-626, 705-722, 770 |
| Cargo night: three rounds of talk, twice wrong and Vane takes over | `js/cargo56.js` ll. 5-11, 118-135 |
| The air flights: stations (crates: lash or throw over; tank cradle; the chains: "cut a grapnel: three blows, each one loud"); the weights; the horn | `js/air93.js` ll. 25-31, 165-182 (`B`, `WEIGHT`), 495-518 (`hook`, `cutChain`) |
| Chandeliers and scaffolds that part and fall | `js/rigging12.js` ll. 91-103 (`CHANDS`, `SCAFFS`), 369-388 (`cutChand`, `knockScaff`), 905-913 (exported) |

### 1.5 How the world is drawn (where a sight can go)

| What | Where | Use here |
|---|---|---|
| Both renderers fill `e._screen` (the rect in logical 320×150 px, with its depth) for every drawn entity, "for HUD overlays" | `js/engine.js` l. 945; `js/r3d21.js` ll. 55, 1605, 1769-1778 (they agree by contract) | **the anchor** |
| `Engine.depthAt(lx, ly)`, wrapped under R3D (read back one frame late) | `js/r3d21.js` ll. 95-97, 1967 | occlusion, as `js/hud11.js` ll. 170-178 does |
| Drawing on `Engine.ctx` after `render` works the same under R3D (gpu18's HUD layer) | `js/r3d21.js` ll. 9-10; `js/hud11.js` ll. 271-290, 374-379 | **the canvas** |
| CPU sky and post hooks do **not** run under R3D | `js/r3d21.js` ll. 12-13; `js/engine.js` ll. 37-44 | why the sight is not a post hook |
| `R3D.project(x, y, zGame)` gives logical px; the CPU's own projection math | `js/r3d21.js` l. 1969; `js/smalllife.js` ll. 705-711; `js/telegraphs.js` l. 202 | for world points that are not entities (the mast line, a fall patch) |
| R3D passes (cover105, light21) | `js/cover105.js` l. 252; `js/light21.js` ll. 1108, 1173, 1299, 1392-1394 | not used (§3.4) |
| Deep sky, a sky hook and a light21 texel fetch | `js/deepsky113.js` ll. 9-15, 569 | not used |
| `window.R11DRESSERS` | **does not exist.** There is no `DRESSERS` anywhere in `js/` or the root bundles (grep). | — |
| Presets: `PRESETS.keep(flag)` (off in Original); `LOW_OFF`; the test's `cheapOff` | `js/presets.js` ll. 15-16, 87, 327-335; `test/presets.test.js` l. 46 | the switch |
| A second `Engine.render` in a frame breaks the 3D read-back and the seeded trace | Phase 125b record, "Found and mended at integration" | the overlay only draws inside the existing `render` |

---

## 2. What the books give, and what the game must never do

### 2.1 Glass-Hand

**Senses.**
- "It heard everything. That was what the glass did." (MS 580.)
- The bell beside him: "his shoulder was glass, and so he heard what was inside the bell much more clearly than he wanted to." Then the voice: "*—the blue jug, Mam. Not the white—*" (MS 654-662).
- The hold of the Kestrel "said what it always said: a low overlapping murmur, like a crowded room heard through a floor" (MS 1313). The cores are "spheres of pale lilac glass, each the size of a small apple" (MS 2694). The cracked one has "a milky fog inside it" (MS 1875).

**Does.**
- "He laid his glass hand flat against the side of the bronze, the way you lay a hand on a struck bell to stop it ringing … and felt the glass drink it … afterward the arm rang low and full, like a mouth closing on something. The bell made no sound at all." (MS 1855-1857.)
- The physics rule: "the glass arm drinks what it breaks and the tideline climbs for it" (SB 87, SB 160).

**Pays.**
- The tideline climbs (SB 87). "*The tideline*, he thought, distantly. *That will have cost me.*" (MS 3266.)
- "It was no good for fine work anymore" (MS 608).
- A hand-press is "brass, about the size of a hand, shaped like a squat two-tined fork with a glass ampoule seated between the tines". Struck, it sounds "a clean bright seven hundred and forty-one … and every piece of glass within thirty feet answered it", and the arm "locked rigid" (MS 4335-4345; SB 160: "a hand-press at 741 … locks it rigid").

**Heard in turn.**
- Vosk's lenses "were not glass but Aether-Glass, pale green and faintly luminous" (MS 704). "Through those lenses, pitch was color, and the arm would be burning like a lamp." (MS 712.) She looked at him "a moment longer than was comfortable" (MS 765).
- Vane "could hear him too: a thin, high, sweet ringing" (MS 1394).
- Crane: "I can hear it from here" (MS 2341).

**Never, in this game.**
- Hear Vaelen or the Choristers. SB 160 says "the glassed begin to hear the Choristers", and the party line is for glass cut from the same Spire. The traveller's glass is seam glass (Phase 125 design §2).
- Be called Consecrated, or be wanted at the collar (MS 2343-2345, 2387).
- Drink a Golem or the bore. The Golem at the Rite is Kaelen's (MS 3264).
- Be treated by the hounds as kin. The book says only that they "would not go near the hut" (MS 484).
- Take Tamsin Reed by the bell through this phase's act. Depot Three keeps `js/tamsin52.js`'s own card.
- Be killed by the act alone: it caps the tideline at 99, as `js/tamsin52.js` l. 155 does.

### 2.2 Cantor

**Senses.**
- The lamps "began its thin reed-whistle as it caught … a soft high breathing"; the night-hummers "sit at every crossing through the dark and hum under their breath" (MS 412).
- Old Tam "could not reach any note above the middle of the stave" (MS 1989).
- Bettany "had a voice like a saw in a knot, hummed the tending note over him, badly, in the Narrow" (MS 3956).
- Lyra with no voice "breathed the Root note, soundless, only air in the shape of the note" (MS 977).
- The Pure Note: "the breath passed down the line from voice to voice so that the note never broke" (MS 2263). It "settled over Oakhaven like a lid" (MS 2323).
- The town "hummed its own, in the Narrow" under it (MS 2932-2936).
- The tanks "hummed a low, contented chord" or "a chord with a sour note in it" (MS 1321). The Corsair uses this one too.

**Does.**
- The jar is "for when you wanted a sound to go *into* a body instead of into the air" (MS 250).
- With Pim: "In the Narrow. Into the hollow of her own cupped hands, so the sound would go into his." (MS 368.)
- "The Root note was for bringing things *on*: births and seedlings and wounds that needed closing" (MS 364).
- Sings the dead down: "sung the Tanner twins into the ground" (MS 512).

**Pays.**
- "She had spent it. Before dawn … She had spent every note she had on Pim Carder's fingers … *Every mending borrows.*" (MS 1037-1039.)
- "She could not hum to him. She had nothing to hum with." (MS 977.)

**Never.**
- Be Oakhaven's Cantor, or be chosen for the Hold (MS 2307-2311).
- Sing aloud in the open. That is the Church's alone (SB 246).
- Sing growth back with the falling fifth. That is Tobin's margin note, in Lyra's hands (MS 364).
- Sing Orla down ("you'll sing me down … Proper", to Lyra, MS 1051, 1977).
- Know the Cantors' Secret (Brief §3.6). Sing the coda (125b).
- Hum through the cutter's ten heartbeats under its horn. "a man on that horn could hear a cough on a deck" (`js/cutter68.js` l. 94, from ch. 21).

### 2.3 Corsair

**Senses.**
- The Kestrel "turning slowly on her line"; "four lift-tanks slung beneath her keel glowed the faint cobalt of drift-glass" (MS 1321).
- "a ship that flew nothing at all from a Consortium mast was either a Consortium secret or a smuggler" (MS 674).
- The hold's crates are stencilled "HANDLE IN SILENCE" (MS 1313).

**Does.**
- Mags "spoke Rust Coast hand-cant" and "read lips in three languages" (MS 1327). She reads a captain's hands: "She had been watching his hands on the wheel for nine years." (MS 5588.)

**Pays.** Fear of the dark that calls "in your mother's voice"; the Free Captains pay "double for deaf bosuns" (MS 1327). In play: time and exposure. A hook slipped by hand is slow, and a deck under a cutter is no place to stand still.

**Never.**
- Be of the Kestrel's crew, or know the *Wave-Cutter*'s story (Phase 125 design §2).
- Cut or hold Vane's lines: the rope at Ten (125b), or the cutter's grapnel. "Don't cut it." The cutter makes cutting an Echo (`js/cutter68.js` ll. 22-23), so the slip is **not** offered there.
- Use the Articles, the Mole-bell or vox-bottles as set pieces (Brief §4.6).
- Say Vane's "Annet. You're going home." (`js/cargo56.js` "Say it yourself", l. 79). That choice is an older collision of the same kind 125b removed. It is noted as a question (§7), not changed here.

---

## 3. The shared mechanism [PROPOSED]

### 3.1 The table

```
CALLINGS126.register(id, {
  radius,                          // cells: how far the sight reaches
  targets(add) { ... },            // called every 0.25 s: add({ e, kind, k }) or add({ pt: [x, y, z], kind, k })
  draw: { kind: (g, t, fade) => {} },   // one function per mark kind; g = the glyph kit (3.3)
  acts: [{ verb, can(e), run(e) }],     // tried in order on E (3.5)
  lines: { key: text },            // the calling's one-off lines
})
```

Phase 126 registers `blade`, `cantor` and `corsair`. Phase 127 registers `archivist`, `penitent` and `quarry` with no change to the mechanism. A test registers a dummy fourth calling to prove the door is open.

### 3.2 When the sight shows: standing still, not a key

The sight fades in when you have stood still for 0.6 s (the stillness test of `js/hud11.js` and `js/dread.js`: speed under 0.35; murmuring does not count as moving). It takes 0.4 s to fade in and 0.25 s to fade out once you move. Why:

1. **The books.** The glass "heard everything" and "never switched off" (MS 580, 608), but a man listens when he stops. The night-hummers are heard by sitting with them. A load is read by looking.
2. **The Narrow pays for it.** Standing still in siphoned country brings the Hush (`js/game.js` l. 324). So the Glass-Hand and the Corsair pay to look in the quarry and the Root-vault. The Cantor is the only one who can listen there for long, because the Cantor hums under (§4.2). That is the cost and the calling difference together, at no extra rule.
3. **No key, every device.** Every letter key is already taken (`js/rigging12.js` l. 826 says so; Q turns, J holds the fork). The owner's playtest is on the phone. Stillness works on keyboard, pad and touch with no new button.
4. A one-time hint (§5) tells each calling the first time its sight has something to show.

The sight is suppressed when `G.state !== 'play'`, inside a hero's boots (`BOOTS125.active()`: the hero's senses are not the traveller's), in photo mode and cinematics (the same tests `js/hud11.js` uses), and in a co-op guest's game.

### 3.3 How it is drawn, in both views

- **On the HUD layer, after the frame.** One wrapper on `render`, the way `js/hud11.js` ll. 374-379 does it: the original first, then `draw()` on `Engine.ctx`, clipped to the view `(0, 0, VW, VIEW_H)`. It never calls `Engine.render` again.
- **Anchored to `e._screen`.** Both renderers fill it, and agree by contract. So a mark sits on the thing in the classic view and in the 3D view, through free look and pitch.
- **World points that are not entities** (the mast head, a fall patch, the lid's elevation) go through one helper, `toView(x, y, z)`. Under R3D it uses `R3D.project`. In the classic view it uses the CPU's own math (`js/smalllife.js` l. 705), with the camera values copied once a frame by a read-only `Engine.addPostHook` (classic only; it draws nothing).
- **Hidden behind walls.** Three depth probes against `Engine.depthAt`, as `js/hud11.js` `visible()` does. The mark is hidden only if all three are covered.
- **The glyph kit, in code.** `dot`, `ring`, `fork` (the press), `lens`, `thread` (a hum), `line` (a rope with strain ticks), `plumb` (a weight with 1 to 4 bars), `patch` (a dithered ellipse on the floor), `tank`. Each is drawn in logical pixels with 1-px rects and a 4×4 ordered dither. Under R3D the HUD layer is at device resolution, so the marks stay crisp pixel-art.
- **No random numbers.** Phases and breath gaps come from a hash of the entity's id or name, e.g. `h3(x, y, s)` as in `js/cover105.js` l. 30.
- **Access.** Reduce motion stops every wave and pulse. No flashes draws pulses at their mean. Under high contrast and the colour-blind switch, the shape carries the meaning (a ring with a dot, a fork, a thread's amplitude, fray ticks), never the colour alone.
- **Over the hands.** The marks are drawn over the first-person hands in both views, at alpha 0.85 at most. The 3D view draws the hands in GL, under the HUD layer, so this is the only way that is the same in both views. A mark whose anchor falls inside the hands' lower-centre rect is dimmed to 0.4.

### 3.4 Why not an R3D pass

A GL pass (with lit, bloomed glows) would need a second implementation for the classic view, since CPU post hooks do not run under R3D. It would add a texture unit and a new risk to `r3d21`'s read-back. A HUD overlay is one code path, reads nothing back but `depthAt`, and costs a fraction of a millisecond. A lit 3D version of the glows can come later if the owner wants it (§7).

### 3.5 The act: the use key

- `interact` (`js/game.js` l. 1443) is wrapped. Before the original runs, the picked thing (`Engine.pick(G.ents, USE_RANGE)`) is offered to the calling's `acts` in order. The first whose `can(e)` is true runs instead, as a small card that always has a way back ("Step back" / "Let go").
- Key, pad and touch all reach `interact`; the builder checks the pad and touch paths call it.
- Cards inside existing scenes (Hob's step, the cargo-night round) are added by a three-line hook in that scene's own file (§6.2). Those scenes build their choice lists themselves.
- **The act is play, not a visual effect.** It works with the sight switched off, in every preset, Original included. With the sight off, the act's prompt is a one-time message line, the first time you aim at such a thing on a map: "E: Take it by the bell".

### 3.6 The switch

- `GFX.callingSight`, pushed into `GFX.FX`, with `PRESETS.keep('callingSight')`. Off in Original; on in Medium and above.
- It is per-frame, so it is added to `LOW_OFF` (`js/presets.js` l. 15) and to `cheapOff` (`test/presets.test.js` l. 46): off in Low.
- Options row "Your calling's sight", `shown` / `hidden`, id `gfx-callingSight126`. It is added in `renderAccessibilityMenu` the way `js/boots125.js` ll. 785-800 adds its row.
- Off, `draw()` returns before touching the canvas. The frame hashes equal a run without the module (check 3).

### 3.7 Cost

Targets are gathered every 0.25 s: one pass over `G.ents`, within the radius, sorted, at most 16. Drawing is at most 16 marks of 10 to 80 rects each, and 3 depth probes each.

Estimate: under 0.4 ms a frame at 1x in a 12-enemy quarry scene. `CALLINGS126.stats.ms` keeps a running mean (`performance.now` round `draw`, as `js/hud11.js` keeps `stats`). Check 22 fails above 1.0 ms. Nothing is allocated per frame: the target list and glyph buffers are reused.

---

## 4. Each calling

### 4.1 Glass-Hand: the bells

**The sight** (radius 6 cells):

| Mark | On | Drawn | From |
|---|---|---|---|
| `core` | every live `legionnaire` (`js/data.js` l. 219) | A pale lilac sphere seen through the bronze, at the bell (rect top + 14% of its height), about a fifth of the rect's width: `rgb(200,172,236)` with a milky centre `rgb(236,230,246)`. It pulses slowly, hashed per name; nearer bells are brighter. Faint ring lines round it, "a low overlapping murmur". | MS 1875, 2694, 654, 1313 |
| `press` | every live `proctor` and `pressman` (`press: true`, `js/data.js` ll. 223, 816) | A small brass two-tined fork at the belt (rect top + 58%), with the ampoule between the tines glinting blue-white `rgb(150,200,255)`. The glint quickens inside 30 ft (about 3 cells [PROPOSED scale]), "your hand knows the pitch". | MS 4335-4339; the blue-white is `js/telegraphs.js` l. 41's for 741 |
| `lens` | Vosk (`npc 'vosk'`, `js/maps.js` l. 387, and wherever she stands) | Two small round pale-green discs at the eyes `rgb(176,232,176)`, faintly luminous. Brighter while your hand rings (§4.1 *heard in turn*). | MS 704, 712, 765 |
| (none on proctors' bells) | — | Proctors are men in the book ("his jaw hanging visibly wrong", MS 4331). The game gives them `core: true` for Read the Name; that belongs to Phase 127's Clerk, not to the hand. | — |

**The act: "Take it by the bell"** (the existing string, `js/tamsin52.js` l. 57, so its French is reused).

- **Offered when:** you are glassed; `G.glassLock <= 0`; not in a boot; the picked thing is a live `legionnaire` within 1.3 that is not a boss, not `transient` (scene figures), and not named Tamsin Reed. Passive guards count. Killing one is still a crime where it already is.
- **Card 1, "By the bell":** the drink (text G4). Then the voice inside, clear: `coreMurmur(e)` (`js/game.js` l. 1684) in G5. Two choices:
  - **"Put your fist through the grille"** (existing string, `js/tamsin52.js`): `killEnemy(e, false)`. Its own name-and-ledger lines run, as for any core kill. Then G7. Noise is not raised: `G.noise` is held at its value before the card. No other enemy's state changes.
  - **"Let go":** `e.stun = max(e.stun, 3)`, then G8.
- **Cost:**
  - `p.glass = min(99, p.glass + 3)` when the bell is drunk, whichever choice follows. This is `js/tamsin52.js`'s +3 and cap. It never kills you by itself, but at 99 the next Cacophony you break is Heartglass (`js/game.js` l. 635).
  - The hand rings full for 60 s of play [PROPOSED] (`ringT`, not saved).
- **Heard in turn.** While `ringT > 0`:
  - Any live `legionnaire` within `AUDIT54.EARSHOT` (7) with a clear line to you logs `'hand'`: `AUDIT54.log('hand')`, Part One only, once. Vosk's next morning walk (06:00 to 09:00, `js/audit54.js` ll. 111-121) reads it back, line A1. Her store goes up a step (`priceMult`, l. 124): the same cost as every other thing the bells hear.
  - If Vosk is in view, the `lens` mark is bright, and once a game (`p126_vosk`) the message line G13 runs.
- **On a proctor** (the same verb, same reach): not drunk. The press comes off his belt first: G9, then `G.glassLock = 8` (`js/game.js` l. 609's number) and the press sound. The proctor is not stunned. Book: MS 4335-4345, SB 160.
- **Locked:** the verb is not offered. Pressing E gives the existing line "Your glass arm is locked rigid, ringing flat." (`js/game.js` l. 715.)

**First landing: the quarry's Legionnaires, and Vosk's walk the next morning** (Part One, from day 1).

| Candidate (roadmap) | Exists? | Verdict |
|---|---|---|
| Vosk's lenses | Yes: Vosk's NPC (`js/maps.js` l. 387); her morning walk over `oakhaven`, `clearing`, `quarry`, `greenhall` (`js/audit54.js` l. 40). | **Chosen**, as the *heard in turn* half. |
| The proctors' presses | Yes: proctors in the clearing at (30.5, 16.5) and (32.5, 24.5) (`js/maps.js` l. 770), Whisper-Grove, the Malting press room (l. 931), the cutter, air93. | Its sight and its rule (the press locks the hand) are in 126. A scene built on it moves to 126b. |

Why the quarry:

- It is open in Part One with no pass. Only the Root-vault's shaft gate wants one (`js/maps.js` l. 652).
- It is full of Legionnaires: Gethin Coote in the barracks, Mirren Salk in the gallery, and those of the rooms (ll. 657, 705, 662, 710).
- It is Vosk's own line, and it is siphoned, so standing still to listen brings the Hush.

The full shape: you listen at a gallery corner, see the cores, and take one by the bell. The hand rings, the gallery's other bell hears it, and in the morning the Factor reads it to you. The Glass-Hand is what the audit asked for: "a tuning fork with a clock on it".

### 4.2 Cantor: who is humming

**The sight** (radius 9 cells): a *thread* rises from the mouth (rect top + 18%), 8 to 18 logical px, as a thin wavering vertical line.

- **Amplitude is how untrue the note is.** Height is pitch (low is short).
- **It breaks for breath** every 4 to 7 s, hashed per person. A person's hum breaks for breath; the Church's does not (MS 2263).
- **Colours:**
  - People's hums: a low warm amber `rgb(214,160,92)`, "a low warm ugly homely note" (MS 2936).
  - Reed-whistles: thin silver `rgb(210,214,226)`, "thin reed-whistle … soft high breathing" (MS 412).
  - The Pure Note: white-gold `rgb(255,236,180)`.

All three colours are [PROPOSED]; the books give no colour to a sound.

| Who | Where in the game | Drawn | From |
|---|---|---|---|
| Night-hummers | `npc 'n28_hummer'`, three crossings in Oakhaven, 19:00 to 07:00 (`js/narrow28.js` ll. 146-147, 422) | amber, steady to fairly true (hash 0.75 to 0.9) | MS 412 |
| Old Tam | `npc 'tam'` (`js/maps.js` l. 338) | amber, short (never above the middle of the stave), true | MS 1989 |
| Bettany | `npc 'bettany'` (`js/maps.js` l. 337) | amber, wide wobble (0.35) | MS 3956 |
| Lit hush-lamps | `isLamp` decos (`js/narrow28.js` l. 182); dark ones show nothing | silver, high, very true, never breaking: a reed does not breathe. **This is the use:** a quiet lamp is a door left open to the Hush. | MS 412; `js/data.js` l. 294 |
| The youngest student | deco `use: 'p59_youngest'` (`js/conservatory59.js` l. 143) | amber, wavering and stopping, "trying a note and stopping". Steady once `p59_lesson` is 1. | `js/conservatory59.js` ll. 73, 97 |
| Lyra, while she has no voice (`!G.flags.lyra_voice`) | `npc 'lyra'` | no thread: a small breath puff only, "air in the shape of the note" | MS 977 |
| The choir on the road (Dawnday) | `js/church55.js` column figures `ch00` to `ch33` (l. 91) | one white-gold line joining the singers' mouths, never breaking | MS 2263 |
| The Pure Note over Oakhaven | outdoors in Oakhaven while `church_come && !rite_started && !greening` (`js/church55.js` l. 193) | a flat white-gold band across the sky at 25° elevation, drawn only where the view shows sky, "like a lid" | MS 2323; `js/touches75.js` c |

**The act**, in two parts, both play:

1. **Hum under the Narrow (N, the murmur key).**
   - As Cantor, the murmur is "under". `castSong('murmur')` adds 0.3 noise, not 0.9 [PROPOSED]. For 4 s the noise floor is 1.7, not 2.6: above the Hush's 1.5 (`js/game.js` l. 324), below everything that listens.
   - How, without editing `game.js`: `updateNarrow` is wrapped. Before the original, if the hum is under, `G.noise = max(G.noise, 1.7)`, and `G.murmurT` is held at 0 for that call only, then put back. So `js/hud11.js` and `js/dread.js` still see a murmur, and the original's Hush test sees 1.7 − 1.4·dt > 1.5.
   - **Not under** where a listening horn listens. During `js/cutter68.js` stage 4 and while `js/air93.js` has a live horn, the Cantor's murmur is the ordinary one. A man on the horn "could hear a cough on a deck".
   - From: the game's own Cantor history ("how to hold a note under your breath where the hounds cannot hear it", `js/data.js` l. 23, Phase 125a) and the night-hummers (MS 412).
   - Why it matters: the Cantor can stand still and listen in the quarry and the Root-vault without the Hush, which no other calling can do.
2. **Hum the tending note into their hands.** E on the party companion (`js/party.js`) when they are hurt.
   - 8 voice, noise +0.9, mends 14 (the Tending Note's number, `js/data.js` l. 209).
   - Not while anything is hunting you (the jar's rule, `js/touches75.js` f). Not on yourself (the jar does that).
   - Short of voice: line C5, "You have nothing left to hum with." (after MS 977, 1037).
   - From MS 250 and 368.

**First landing: Hob Wendle's step, the Grafters' round** (Rootday, game day 1, 08:00 to 14:00; `js/grafters67.js` stage 2).

| Candidate | Exists? | Verdict |
|---|---|---|
| The Grafters' round | Yes, played house by house (`js/grafters67.js`). | **Chosen.** The book has a cantor who has spent her voice standing beside a man under the hush-saw: "She could not hum to him. She had nothing to hum with." (MS 977.) A stranger of the same trade who still has a voice is the one person who could. That changes nothing that happens: Hob is still cut, and "He'll walk." It is the trade, played. |
| The Conservatory | Yes (`js/conservatory59.js`); its lesson is open to every calling through Hold the Pitch. | Its sight is in 126 (the student's thread); an act of its own moves to 126b. |

At Hob's step, with `way` `lyra` or `grafters` and voice ≥ 8, the Hob card gets one more choice:

- **"Hum the Root note into his hands, low."** 8 voice, `p67_hob = 'hum'`. The result text is HOB_DID.hum (C7). Then the book's `hobEnd`, unchanged. Hob's later lines and the journals are unchanged.
- Other callings see exactly the old list. With less than 8 voice the choice is not there.
- At Orla Hale's chair the Cantor reads one line (C8) and does nothing. It is not you she is asking (MS 1051).

### 4.3 Corsair: loads and lines

**The sight** (radius 10 cells; a hand reads a deck by eye):

| Mark | On | Drawn | From |
|---|---|---|---|
| `line` + `plumb` | **The Kestrel at her mast** (clearing; `SMALLLIFE.isMoored()`, `js/smalllife.js` l. 616) | Along the mooring line from the mast head (`MAST.top`, l. 612) to her bow (`shipPose`), a hemp line `rgb(150,138,108)` (the colour of `js/smalllife.js` l. 721's rope) with amber strain ticks, bar-taut. Under her keel, a 3-bar plumb: riding heavy, until cargo night has thrown the long gun over (`p56` ≥ 2). Her four tanks as cobalt dots `rgb(92,128,230)`; one carries a sour flicker on odd game days [PROPOSED]. | MS 1321, 672-674 |
| `line` + `patch` | **Chandeliers and scaffolds** (`RIGGING.CHANDS`, `SCAFFS`: the quarry (18.5, 19.4) and (36.5, 13.5), the Root-vault, the Mausoleum, the Malting, the Cloister, the Greenroot chapel) | The chain or lashings marked where they will part (red-amber fray ticks). The floor patch where it will land as a dithered ellipse (for a scaffold, on the side away from you, as `knockScaff` falls). **The use:** lure foes under it before you strike. | `js/rigging12.js` ll. 91-103, 378-387 |
| `line` | **air93: the grapnel chains** (`_p93 'chain_*'`, `js/air93.js` l. 501) | taut from rail or envelope up out of view; fray ticks on the one bitten deepest (fewest `_blows` left) | `js/air93.js` |
| `ring` | **air93: the hold** (the crates station) while `!R.lashed` | small knock-rings on the crates: what rings | `js/air93.js` ll. 217-218 |
| `plumb` | **air93: what can go over** (water, spares, salvage) | 1 to 3 bars from `WEIGHT` (salvage 0.3, water 0.25, spares 0.15) | `js/air93.js` l. 182 |
| `tank` | **air93: the four tanks** (the cradle station) | cobalt steady (sound), cobalt with a flicker (sour), a slow cobalt vapour drifting off (weeping) | MS 1321; `js/air93.js` l. 116 |

**The act: a deck-hand's hands.**

1. **"Slip it by hand"** (air93, a grapnel chain).
   - The first time E is used on a chain in a flight as Corsair, a card offers **"Cut it"** (the old three blows, loud) or **"Slip it by hand"** (K3). The choice holds for that flight.
   - Slipping is standing at the chain for 5 s [PROPOSED] (`PACK_S` is 6, `js/air93.js` l. 176), the same "Stay with it" shape as lashing (l. 98). Moving away cancels it (K6).
   - Done, the chain goes as `cutChain`'s last blow does (`R.chains` filtered, entity dropped, the `chainsCut` line when it is the last). But it adds `R.spike` +0.1 once, where every axe blow adds +0.6 (l. 510). The horn hears an axe; it does not hear hands.
   - **The cost:** 5 s standing at the rail while proctors are coming down the line.
   - Never offered on the cutter's own line (`js/cutter68.js` stage 6, "Don't cut it").
2. **Hand-cant to Mags** (cargo night). See the landing below.

**First landing: cargo night** (Driftday, game day 6, from 19:00; `js/cargo56.js`).

| Candidate | Exists? | Verdict |
|---|---|---|
| Cargo night | Yes, as cards (the Kestrel is not boardable before the escape, `js/kestrel16.js` l. 14). | **Chosen**, for the act. It is Part One, the roadmap names it, and the trade has a book-true thing to do there. |
| The cutter | Yes (`js/cutter68.js`, ch. 21): a walkable deck, but every beat canon. | Its sights (the four loads over the side; the grapnel line) move to 126b. The systemic act lands on air93's courier-cutter, "the Office courier-cutter … met in a new place" (`js/air93.js` l. 15). |

At cargo night, in any round of the stall (`nextRound`, `js/cargo56.js` l. 124), as Corsair, once a night, a fourth choice:

- **"Sign it to Mags, behind his back"** (K8). It counts as a good round (`C.count += STEP`) without using a topic, with line K9.
- Why: Mags reads hands, and Rust Coast hand-cant is the deck's own speech (MS 1327, 5588). The stall is the game's own play, not the book's (it is marked [PROPOSED as play] in `js/cargo56.js` l. 8).
- Others keep the three topics.

### 4.4 Nobody loses anything

| Landing | Without the calling |
|---|---|
| The quarry and Vosk's walk | fight, sneak or go round, as now; Vosk's walk only reads what was logged |
| Hob's step | the five old choices, the same card text |
| Cargo night | the same three rounds; twice wrong and Vane takes over, as now |
| air93 chains | the axe, three blows, as now |
| Every sight | art only; nothing is found or opened by a sight |

---

## 5. All new in-game text (English)

The French goes in `tools/i18n/p126-callings.tsv`, using the glossary (Main-de-Verre, Étroit, Confins, chanteur de nuit). **No line is voiced.** Each is a message, a card or a button in the traveller's own play, as the 125b calling lines are; none is a book character speaking. So no Kokoro recordings are needed.

**Shared (Options)**
- S1 "Your calling's sight" [PROPOSED]
- S2 "stand still, and see what your trade sees" [PROPOSED]
- S3 "shown" / S4 "hidden" [PROPOSED]

**Glass-Hand**
- G1 (first sight) "You stand still, and your wrapped hand starts to ring: faint and high, at every bell near you. Inside each one, somebody is talking." [PROPOSED; after MS 580, 654]
- G2 "Take it by the bell" (existing, `js/tamsin52.js` l. 57)
- G3 "By the bell" [PROPOSED]
- G4 "You lay your glass hand flat against the side of the bronze, the way you lay a hand on a struck bell to stop it ringing, and feel the bell try to sound. The glass drinks it. The note goes into your hand and up your arm and is gone, and the arm rings low and full, like a mouth closing on something. The bell makes no sound at all." (MS 1855-1857, put into the second person and the present tense)
- G5 "Through the glass, the voice inside is very clear: <i>{0}</i>" [PROPOSED; after MS 654]
- G6 "Put your fist through the grille" (existing, `js/tamsin52.js`)
- G7 "Something smooth and cold the size of an apple cracks under your knuckles like ice under a boot." (existing, the end of `js/tamsin52.js` l. 60; MS 1875 "a sphere of pale lilac glass the size of an apple")
- G8 "Let go" / "You take your hand away. The bell stands where it is, ringing at nothing, for a breath or two." [PROPOSED]
- G9 "His hand is already at his belt. Brass, the size of a hand, two tines and a glass ampoule between them: a hand-press. He strikes it, and every piece of glass near you answers, your own with it. Your arm locks rigid, ringing flat." (MS 4335-4339, 4345; the last sentence is `js/game.js` l. 609's)
- G10 "Your hand rings on, low and full. Anyone who hears glass can hear it now." [PROPOSED]
- G11 (act hint, sight off) "E: Take it by the bell" [PROPOSED]
- G12 (journal) "My hand hears the bells. Laid flat on one, it drinks the alarm, and the voice inside comes out clear. The tideline climbs for it, and anyone who hears glass hears me afterward." [PROPOSED]
- G13 "The Factor's green lenses rest on your sleeve a moment longer than is comfortable. Through them, pitch is colour, and your hand must be burning like a lamp." (MS 712, 765)
- A1 (`AUDIT54.TX.heard.hand`) "A wrapped hand, laid flat on one of my bells. It rang afterward, low and full, and my Legionnaires heard it ring." [PROPOSED]
- P1 (`js/pumps58.js` `voiceGlass`, replaced) "Halfway down the archive steps your arm goes cold to the shoulder, and goes on ringing to itself. It is not your glass anything is speaking through. Ahead of you Kaelen has stopped with his glass hand flat on the wall, and gone grey." [PROPOSED]. After it, `voiceKaelen`'s second sentence plays as for everyone ("When it is over he tells you what it said…").

**Cantor**
- C1 (first sight) "You stand still and listen, the way you were taught: under the street, everyone who is humming, and how true." [PROPOSED]
- C2 (first under-hum) "You hold the note under your breath, where the hounds cannot hear it and the Hush cannot find it." (the Cantor history, `js/data.js` l. 23, Phase 125a)
- C3 "Hum the tending note into their hands" [PROPOSED]
- C4 "You take their hands in yours and hum the tending note into them, in the Narrow, so the sound goes into the hands and not the air." (after MS 368, 250)
- C5 "You have nothing left to hum with." (after MS 977, 1037)
- C6 "Hum the Root note into his hands, low" [PROPOSED]
- C7 (HOB_DID.hum) "You take his big hands in yours and hum the Root note into them, low, in the Narrow: the note for wounds that need closing. Lyra, at his other ear, breathes it with you without a sound. He holds on. Afterward you have less voice than you came with. Every mending borrows." (MS 364, 977, 1039; the rest [PROPOSED])
- C8 (at Orla) "You still have the voice she spent on Pim before dawn. You do not use it. It is not you Mother Hale is asking." [PROPOSED; after MS 1037, 1051]
- C9 (journal) "I hum under the Narrow, low enough that the hounds cannot hear it and the Hush cannot find me. Into someone's hands, it mends." [PROPOSED]

**Corsair**
- K1 (first sight) "You stand and look the way a hand looks at a deck: what is heavy, what is lashed, and which line is carrying more than it should." [PROPOSED]
- K2 (first sight of the Kestrel) "She flies no colours, she is riding heavy for a ship with nothing to declare, and her line is bar-taut. Whatever is in her hold, it is not feathers." [PROPOSED; after MS 674, 1321]
- K3 "Slip it by hand" / K4 "Cut it" [PROPOSED]
- K5 "You get your hands on the hook where it has bitten and work it, a link at a time. No axe, no noise. Stay with it." [PROPOSED; the shape of `js/air93.js` l. 98]
- K6 "You let go of the hook, and it bites again." [PROPOSED]
- K7 "The hook comes free and goes up its line with nothing on it." [PROPOSED]
- K8 "Sign it to Mags, behind his back" [PROPOSED]
- K9 "Your hands say it in Rust Coast cant while your mouth says something else. At the hatch Mags reads them, and does not nod, and the sail-locker door closes very softly." [PROPOSED; after MS 1327; "a cupboard door closes very softly" is `js/cargo56.js` l. 49's]
- K10 (journal) "On a deck I can see what she is carrying and which line is about to part. A hook can be slipped by hand, slowly, without a sound." [PROPOSED]

The test checks every one of these is in `CALLINGS126.TEXTS` (or its scene's `TEXTS`) and has a French line. It also checks none says "Dissonant Blade" or "Archivist of the Veil" or names a hero as "you".

---

## 6. The build plan

### 6.1 Files the builder owns

- `js/callings126.js`: the module (§3, §4). `window.CALLINGS126 = { register, ids, TEXTS, TX, FLAGS, validate, stats, sense, lastDrawn, toView, acts, hobChoice, orlaLine, cargoChoice, slip }`.
- `test/callings126.test.js`: Playwright, in the pattern of `test/boots125.test.js`. It reads the MS lines that §5 marks as from the book.
- `tools/i18n/p126-callings.tsv`: merged into `locales/` the way `p125b-boots.tsv` was.
- `tools/dev/shots126.sh` and `.js`: the pictures (§6.7), after `tools/dev/shots125b.*`.
- `story/Game Layer/Phase 126 - The callings, part one.md`: the record. Also an entry in Vol VIII, the README and `ROADMAP.md`, as every phase.

### 6.2 Existing files to edit, exactly where

| File | Where | Change |
|---|---|---|
| `index.html` | after l. 318 (`boots125.js`), before l. 319 | `<script src="js/callings126.js?v=1"></script>`. `mast123.js` stays the last tag. |
| `js/presets.js` | l. 16, `LOW_OFF` | add `'callingSight'` |
| `test/presets.test.js` | l. 46, `cheapOff` | add `'callingSight'` |
| `js/audit54.js` | l. 38 `BITS`; `TX.heard` ll. 57-65 | `hand: 128`; `heard.hand` = A1. `test/audit54` is taught: BITS has 8 keys. |
| `js/grafters67.js` | l. 152 / l. 307 (`hobCard`) | The choices become `HOB_CHOICES[w].concat(hook())`, where `hook = () => (typeof CALLINGS126 === 'object' && CALLINGS126.hobChoice ? CALLINGS126.hobChoice(w) : [])` returns `[['hum', C6]]` or `[]`. `HOB_DID.hum = C7`. In `orlaCard`, append `CALLINGS126.orlaLine()` (C8 or '') after `orla2`. `p67_hob` takes `'hum'` wherever it is read. |
| `js/cargo56.js` | l. 128 (`nextRound`) | After `opts` is built: `const x = typeof CALLINGS126 === 'object' && CALLINGS126.cargoChoice ? CALLINGS126.cargoChoice(C, () => { C.count += STEP; say(K9, '', 4500); nextRound(); }) : null; if (x) opts.push(x)`. The order array gets the new index last. `C.signed` is set by the module; it is transient, once per stall. |
| `js/air93.js` | none needed | `AIR93` already exports `B`, `R` and `cutChain` (l. 645-647). The chain's `use` is reached through `useDeco`, which air93 wraps at l. 620 (`useOwn`, l. 592). `callings126.js` loads later, so its own `useDeco` wrapper is the outer one: for `p93_chain` as Corsair it shows K3/K4 first, and on "Cut it" it passes the call down unchanged. |
| `js/pumps58.js` | l. 33 (`voiceGlass`) and l. 72 | `voiceGlass` becomes P1, followed by `voiceKaelen`'s report sentence, so the Arbiter never speaks in the traveller's seam glass. French in `tools/i18n/p126-callings.tsv`. Any test that pins the old `voiceGlass` text (grep `test/` for it) is taught. |

Nothing else is edited. Everything else is a wrapper: `render`, `update`, `interact`, `useDeco`, `castSong`, `updateNarrow`, `restoreGame`, `renderAccessibilityMenu`, and `loadMap` to clear the target cache.

### 6.3 Flags and saves

| Flag | Range | Meaning |
|---|---|---|
| `p126_seen` | 0..63 | bit per calling (`gearlook21`'s `CLASS_ORDER` index): the first-sight line shown |
| `p126_did` | 0..63 | bit per calling: the first act's journal line written |
| `p126_bells` | 0..99 | bells taken by the hand |
| `p126_vosk` | 0..1 | G13 said |
| `p126_slips` | 0..99 | hooks slipped by hand |

- On every load, `validate(G.flags)` (as `js/boots125.js` l. 661): anything not an integer in range becomes 0.
- Not saved: `ringT`, the sight's fade, the target cache, `C.signed`, a slip in progress. A save mid-slip loads with the hook still in.
- No migration: an old save simply starts with zeros. The p123 fixture save loads, plays a minute, and saves with the five flags at 0 and nothing else changed (check 19).
- Nothing in setup, hydrate or validate reads `Math.random`.

### 6.4 First failing checks (written first, seen red)

1. `CALLINGS126` exists; `ids()` is `['blade','cantor','corsair']`; `register('dummy', {...})` adds a fourth that the sight then draws (Phase 127's door).
2. `GFX.FX` has `callingSight`; after `PRESETS.apply` it is false in `original` and `low`, true in `medium`, `high`, `ultra`; `PRESETS.keep` stores it; the Options row `gfx-callingSight126` toggles it.
3. With the switch off, a Glass-Hand standing still for 3 s among the quarry's Legionnaires makes frames whose hashes equal those of the same run with `CALLINGS126.draw` stubbed out, in the classic view and under R3D.
4. `sense()` is 0 while walking, reaches 1 within 1.1 s of standing still, and is back to 0 within 0.3 s of moving. `Math.random` is called zero times by the module over 300 frames of sense on (spy).
5. Glass-Hand in the quarry: `lastDrawn()` holds a `core` for each live Legionnaire within 6 and in view, none for one behind a wall (depth probe), and none for any other calling.
6. A proctor in the clearing at (30.5, 16.5) gets a `press` mark; a Legionnaire does not; Vosk in the Greenhall gets a `lens`.
7. Take it by the bell: E at a quarry Legionnaire (not Tamsin) opens the card. "Put your fist…" leaves it dead, its name in `G.ledger`, `p.glass` +3, `p126_bells` 1, `G.noise` no higher than before + 0.05, and every other enemy's `state` unchanged.
8. At `p.glass` 98 the act leaves it at 99, not 101; the player is alive.
9. On a proctor the same E gives G9, `G.glassLock` 8, the proctor alive and not stunned. With `G.glassLock > 0` the card is not offered. At Tamsin Reed, `js/tamsin52.js`'s card opens instead. As Cantor, E on a Legionnaire gives the old murmur line (`js/game.js` l. 1450).
10. Heard in turn: a second Legionnaire within 7 with a clear line, inside 60 s, makes `AUDIT54.logged() & 128`. The next morning walk's card contains A1, and `priceMult()` is one step higher.
11. Cantor at 20:00 in Oakhaven: threads on the three night-hummers. Bettany's amplitude is more than 2× a hummer's. Old Tam's height is under every hummer's. Lyra with `lyra_voice` false has a breath mark and no thread. A dark hush-lamp has none, a lit one has one.
12. Hum under: a Cantor murmuring while still for 20 s in the quarry keeps `G.stillT` at 0 and `G.noise` ≤ 1.75, and `G.murmurT > 0` is still seen by `js/hud11.js`. A Glass-Hand doing the same gets the old 2.6. In `js/cutter68.js` stage 4, the Cantor's murmur gives ≥ 2.5.
13. Hob: in `js/grafters67.js` stage 2, way `lyra`, as Cantor with voice 40, the Hob card has six choices with C6 last. Taking it costs 8 voice, sets `p67_hob` to `'hum'`, and shows C7 then `hobEnd`. As Corsair the list deep-equals the old five. As Cantor with voice 5 it is the old five.
14. Orla: as Cantor `orlaCard`'s body contains C8; as any other calling it is byte-for-byte the old body.
15. Tend: the Kaelen companion at 10 of 30 hp, the Cantor at reach, nothing chasing: E offers C3; taking it gives him +14, the player −8 voice, noise +0.9 (± 0.05). With a hound in chase within 10 it is not offered.
16. Corsair at the rim: with the Kestrel moored, `lastDrawn()` has the mast `line` and the keel `plumb`. With `MAST123.cut()` true it has neither.
17. Corsair in the quarry: each scaffold within 10 has a `line` and a `patch`; the patch centre is on the far side of the scaffold from the camera.
18. Cargo night as Corsair: round one has four choices, the fourth K8. Taking it raises Mags's count by `STEP` and shows K9; it is not offered again that night. As Glass-Hand each round has three.
19. air93 as Corsair, hooked: E on a chain gives K3/K4. Slip, standing 5 s, removes the chain with `R.spike` up by 0.1 in all. Walking off at 3 s gives K6 and the chain stays. Cut keeps the three blows. No slip is offered on `js/cutter68.js`'s stage-6 line.
20. Flags: `p126_bells = 'x'`, `p126_seen = 900`, `p126_vosk = -1` all read 0 after `restoreGame`. The p123 fixture save loads and plays with no change but zeros (snapshot diff).
21. The Arbiter in the archive (`js/pumps58.js`) as Glass-Hand shows P1 and not the old `voiceGlass`. As anyone else it is unchanged.
22. Budget: `stats.ms` mean < 1.0 over 120 frames, Glass-Hand still in the quarry with 12 enemies placed in view, at 1x, both views when WebGL2 is there.
23. With the sight on, `Engine.render` runs once per animation frame (count over 60 frames).
24. `index.html`: `callings126.js` comes after `boots125.js`, and `mast123.js` is still the last script tag.
25. Every string in `CALLINGS126.TEXTS` and the new scene strings has a French line in `tools/i18n/p126-callings.tsv`. None contains "Dissonant Blade", "Archivist of the Veil" or "Consecrated". The §5 lines marked from the book are found at their MS lines (`verbatim`, as `test/boots125.test.js` does, allowing for person and tense where §5 says so).

### 6.5 Suites to run after

`callings126`, `presets`, `boots125`, `tamsin52`, `audit54`, `grafters67`, `cargo56`, `air93`, `rigging12`, `r3narrow28`, `cutter68`, `rope45`, `kestrel16`, `mast123`, `smalllife`, `r5conservatory59`, `church55`, `touches75`, `party` (through `companions`/`companion-talk`), `hud11`, `dread`, `r3d21` (the seeded trace: the module reads only), `cover105`, `fold113`, `body21`, `hands122`, `sculpted112`, `pixelhands110`, `pixelhands111`, `strangers125`, `text121`, `story-i18n`, `voices`, `voice-acting`, `sidequests`, `law`, `foundation`, `phase1-integration`. Then all 228 suites once on the final commit, one runner at a time (125b's record: two runners at once gave false reds). Then `tools/i18n/coverage.js`.

### 6.6 Old-save and rule notes for the builder

- The act's kill runs through `killEnemy(e, false)`. Every wrapper on it (law, ledger, audit) sees an ordinary kill.
- `G.noise` is held across the card the way `js/tamsin52.js` `quietly` does (l. 152).
- Everything the module stages is `transient`, or is not an entity at all. No saved entity list changes.

### 6.7 Pictures to take

Medium preset, 1x. `screenshots/p126-*.jpg` through `tools/dev/browser.sh`.

| Picture | View | What |
|---|---|---|
| `glass-cores-classic`, `glass-cores-3d` | both | the quarry gallery: two Legionnaires' cores through the bronze, one bell hidden behind the gallery wall |
| `glass-press-classic`, `glass-press-3d` | both | the clearing: the two proctors' presses |
| `glass-vosk-3d` | 3D | Vosk's lenses lit, the hand ringing |
| `glass-bell-card` | either | the By the bell card |
| `cantor-night-classic`, `cantor-night-3d` | both | Oakhaven at 20:00 by a crossing: the hummer's thread, two lit lamps' silver whistles, one dark lamp |
| `cantor-lid-3d` | 3D | the square under the Pure Note's lid, looking up |
| `cantor-choir-classic` | classic | the choir's unbroken line on the road (Dawnday) |
| `cantor-hob-card` | either | Hob's card with C6 |
| `corsair-mast-classic`, `corsair-mast-3d` | both | the rim: the Kestrel's line bar-taut and her keel plumb |
| `corsair-scaffold-classic`, `corsair-scaffold-3d` | both | the quarry scaffold, its lashings and fall patch |
| `corsair-air93-3d` | 3D | an air93 deck, hooked: chains, unlashed-hold rings, a weeping tank |
| `off` | both | the quarry shot with the switch off, beside the on shot |

### 6.8 Size

One Opus builder, one phase. About 1,000 lines in the module, ~25 lines across seven files (`index.html`, `js/presets.js`, `test/presets.test.js`, `js/audit54.js`, `js/grafters67.js`, `js/cargo56.js`, `js/pumps58.js`), 25 checks, ~45 strings with French, 17 pictures. No art beyond the glyph kit, no voices, no maps.

### 6.9 Moved to 126b (and why)

The same mechanism serves all of these. They are cut because one builder cannot also carry their scenes and their tests in one phase.

- **The proctors' presses as a scene** (the clearing's two proctors hunting Sable; the Malting's press room): the sight and the lock rule are in 126.
- **Cores in crates** (`js/kestrel16.js` ll. 823-825; `js/cutter68.js` `pack0..2`): the glass hearing the hold (MS 1313). A listen there that tells you which crate to pack first.
- **The Conservatory as an act**: humming under the youngest student's note.
- **The Corsair at the cutter** (the four loads over the side and the grapnel line: sight only, since every beat is canon) and **at Grab the Line** (the drum's beat visible on the line).
- **Climbing** (the row's "climbs"): the mast, or the Kestrel's rigging. It needs height and map work of its own.
- **Crane hearing the hand** from Dawnday (MS 2341).
- A lit 3D version of the glows (an R3D emissive pass), if the owner wants it (§7).

---

## 7. Questions for the owner

1. **The sight comes when you stand still.** Is that right for you, or do you want it on all the time? Standing still keeps the screen clear when you are moving and fighting. It works on the phone with no new button, and in the quarry it costs you the Hush, which is the book's own rule. "All the time" would be a second choice on the same Options row.
2. **"Say it yourself"** on cargo night (`js/cargo56.js` l. 79) gives the traveller Vane's "Annet. You're going home." It is the same kind of line Phase 125b took away from the traveller. May it go? (Not changed here.)

Decided without asking, in keeping with the books and his "a good game with a good story":

- The Corsair's act lands in Part One as hand-cant, because the cutter is all canon. Its systemic use waits for air93.
- The Glass-Hand may take any Legionnaire by the bell, at a real cost: the tideline, the morning walk and the store's prices.
- The Arbiter no longer speaks in the traveller's seam glass (SB 160).
- The sights are drawn on the HUD layer rather than as a GL pass: one path, the same in both views, under a millisecond.
