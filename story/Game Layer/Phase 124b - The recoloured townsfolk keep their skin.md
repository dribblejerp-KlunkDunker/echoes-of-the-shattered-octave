# Phase 124b: the recoloured townsfolk keep their skin

Found by the Phase 124 portrait trial: the packman's figure (sprite `p60_man_a`) had blue skin with orange patches, and
Oona Salt was the townswoman tinted blue-grey, face and all. That was in the game. This phase fixes it for every
recoloured figure, behind a switch.

## 1. Survey: every place a painted figure is recoloured

| Maker | Sprites | Source painting | How it tints |
|---|---|---|---|
| `js/life60.js` `variant()` (lines 50-64, called at 101-106) | 6: `p60_man_a/b/c`, `p60_wom_a/b/c` (the road-walkers; the packman is `p60_man_a`) | townsman, townswoman | HSL: every pixel's hue replaced, saturation and lightness scaled. It already had a skin guard (hue 8-42, saturation 0.18-0.75, lightness 0.42-0.86), but shaded skin falls outside that guard, so faces went blue or green with orange patches |
| `js/life62-whispergrove.js` 36-39 and `js/malting61.js` 164 (through `LIFE60.variant`) | 4: `p62_hollow_a/b/c`, `p61_clerk` | hollow, townsman | as above |
| `js/cantabile17.js` `COATS` (884-888), `tintSprite` (527) | 12: `p17c_teague, oona, bessa, teel, sloe, tace, dunmore, hesper, quain, wife, hand, child` | townsman, townswoman, hob | multiplies R, G, B over the whole figure (for example Oona [0.7, 0.8, 1.15]) |
| `js/flume16.js` `COATS` (505), `tintSprite` (283) | 5: `p16f_dockman, dockwoman, cutter, keeper, rafter` | townsman, townswoman, hob | multiply |
| `js/longnight17.js` `COATS` (566), `tintSprite` (362) | 3: `ln17_marl, tansy, jory` | hob, townswoman, townsman | multiply |
| `js/sheepwalk22.js` `tinted()` (626-640) | 4: `p22_tamar, kit, gideon, absalom` | townswoman, townsman | multiply (rounded) |
| `js/calendar11.js` stall-keepers (167-179, made at 236-244) | 5: `p11c_vendor_herb, larder, tinker, odds, fish` | townswoman, townsman | multiply |
| `js/kestrel16.js` `paintPennick` (976-992) | 1: `p16k_pennick` | townsman | multiply [0.7, 0.86, 1.04], then goggles drawn on |

**Not people, or not a colour change of a whole painting** (left alone): `js/rift100.js` 592 (the Stray, a Carillon
Legionnaire construct greyed with powder); `js/heights92.js` (ships, the bleach-hound); `js/antler85.js` (the
Flint-Back); `js/nerves13.js` (a torch); `js/trees83.js` (trees); `js/longnight17.js` 383-392 (the Hollow foe's lean
poses, a change of shape); `js/folk14.js` `variant` (sway, seat and hood, changes of shape); `js/greening44.js`
(`townswoman.green.punched`, a Greening stage, not a tint).

**Pennick is never made in a started game.** `paintPennick` runs once at script load (`js/kestrel16.js` 1444), before
the townsman's painting exists, and it is not called again. It now goes through the same helper (one line, guarded), so
if it is ever made later it keeps its skin, but there is nothing to see or test today. It is left as found and noted here.

Total: 39 recolours made in a started game. **36 go through the helper.** The three Hollows (`p62_hollow_a/b/c`, from
`js/life62-whispergrove.js` through `LIFE60.variant`) are left out. Their colour is a state of the whole person, faded
and grey-blue, not dyed cloth, so they stay exactly as their maker makes them, switch on or off (the helper skips any
recolour of the `hollow` painting). No other recolour in the survey is spectral, drowned, frozen, faded or dead: the
Cantabile, Flume, Long Night, Sheepwalk, market and road people are all living people in dyed clothes.

## 2. What changed

- `js/faces124.js` (the stub, now the helper): `FACES124.skin(srcSprite, data, name)`. Each maker calls it once, between
  making its recoloured pixels and adding the sprite (one guarded line in each of `life60, cantabile17, flume16,
  longnight17, sheepwalk22, calendar11, kestrel16`). The maker's own pixels are kept in a copy; with the switch on, the
  kept-skin version is written into the same array, so turning the switch swaps them in place.
- The mask is measured once per source painting, keyed by its pixel array (a painting that arrives later replaces the
  sprite's pixels and is measured again):
  - **The face and hair** keep the painting's colours. **The kerchief or cap is dyed with the cloth.** In these
    paintings the kerchief and the cap have the same hue, saturation and lightness as the skin, so colour cannot separate
    them. The face's oval is measured on each source painting instead: townsman centre (30, 20), radii 8.5 by 7, from
    the cap's brim to the chin; townswoman (24.5, 16), radii 8.5 by 10.5, inside the kerchief, taking in the dark hair
    that frames her face; Hob (25.5, 12), radii 9 by 13, the whole head, since he is bald. Every pixel inside the oval is
    kept (face, brows, beard, hair). A source with no measured oval keeps the flesh and brown-hair tones of its head.
  - **Flesh** is measured from the lit middle of the face (the darkest quarter, which is brow, beard or hair, is left
    out): hue, saturation and lightness ranges.
  - **Below the neck**, flesh colour alone cannot tell these paintings' skin from their linen, brown wool and leather (a
    colour-only mask kept the trousers, boots, rolled sleeves and apron stains). So bare skin is only looked for where the
    figure's own rig (`PAINTFOLK.autorig`) puts it: the neck opening, and the forearms and hands (the lower part of each
    elbow-to-hand line, and round each hand). Clumps under four pixels are dropped.
  - **A grey-skinned figure** (the Hollow) keeps its head and neck only: its maker already leaves grey alone, and its grey
    rags match its grey skin.
  - The mask is grown by one pixel and smoothed (3 by 3), so no tinted fringe is left round a face or at a cuff.
- **Carried things.** The townswoman's clay jar keeps its clay in every recolour of her. It is masked once: the biggest
  clump of terracotta tones (hue about 22, saturation 0.26 or more) inside the box where it sits (22,32 to 54,78 in her
  painting), grown and smoothed like the rest. That is the only carried thing in the three source paintings that is
  plainly not cloth: the townsman's hands are empty, and Hob's pouches, belt and key are leather, so they take the tint.
  Leather aprons and belts take the tint, as before.
- **No spared specks.** `js/life60.js variant()` spared every flesh-coloured pixel by colour, which left orange specks of
  stain in the dyed cloth (the heather apron). It now also makes the tint with nothing spared and hands both to the
  helper. With the switch on, the cloth is that whole tint and the rig-placed mask does the sparing; with it off, the
  sprite is the old one, byte for byte. The other makers multiply the whole figure and never spared anything.
- **Switch:** `GFX.keepSkin`, Options > Graphics, "Recoloured people keep their skin" (small print: "townsfolk dressed in
  other colours keep their own faces, hands and hair"); on by default; off in Original, through `PRESETS.keep` (as
  `js/deepsky113.js` does). French in `tools/i18n/p124-skin.tsv`, merged. With it off, every recolour is byte for byte
  what its maker made (tested; Oona Salt also against the old multiply, computed independently). A moving painting
  (`PAINTFOLK`) made from a recolour is given its pixels again when the switch changes.
- `?v=` bumped on the eight files; `sw.js` rebuilt.

## 3. Cost

Measuring a source painting: about 8 ms each, three sources (townsman, townswoman, hob), about 25 ms in all, once
per session. Applying it to the 36 recolours: about 1 ms each, about 31 ms in all. Both happen when a maker runs (when
its place is built or entered), not at start-up.

## 4. Tests and pictures

- `test/skin124.test.js` (committed first, failing): every recolour of the survey is made and goes through the helper;
  with the switch on, every face pixel and every hand and forearm pixel of each recolour stays inside its source's flesh
  range; the cloth keeps its maker's tint exactly; off is byte for byte; Original off, High on; French present; no
  `Math.random`; the cost.
- Sheet: `screenshots/p124-skin.jpg`. Eight figures before and after, enlarged three times (the packman, Oona Salt,
  the bluest, the greenest, the darkest, Sloe from Hob, the Flume dock-woman, Gideon, and a Hollow left as made), and the packman's figure on the West Road and
  Oona Salt at Port Cantabile in the game, before and after.

Second round (the Commander's review): the Hollows left alone; headwear dyed; the jar's clay; no spared specks.
Checks for all four were committed first and failed, then passed (skin124: 12 of 12). The sheet now shows the Flume
dock-woman in place of the Hollow, and a small panel of a Hollow unchanged with the switch on.

## 5. What is left

- Pennick (above).
- The face ovals and the jar's box are measured by hand on three paintings. A new source painting needs its own (without
  one it falls back to flesh and brown-hair tones in the head, which keeps a kerchief whose colour is close to skin).
- A little of the townsman's linen collar at the neck opening stays undyed, because linen and skin share a tone there.
