# Game — Phase 25: the pixel-3D set (for review)

*Written for review, Oct 2026. The code is `js/pixel3d.js`; the tool is `tools/art/pixel3d/voxelise.py`; the atlases `img/pixel3d/`.*

The owner asked for everything that makes sense in 3D to be **pixelated 3D**, and, after seeing a first pass of low-poly models built from primitives, said the point plainly: *keep the same pixelated graphics as before, just make it 3D.* So the model is the painting.

## How it works

Every painted sprite (the bestiary, the people, the scenery props) is extruded into a voxel model: each solid run of pixels on a row is treated as an elliptical section whose depth is a share of its width (fuller for round things, flatter for signs and grates), so each pixel becomes a column of voxels. The front faces carry the painting pixel for pixel; the back faces carry its mirror a shade darker; the sides carry the outline's own colours. Blender (the `bpy` module, headless on the CPU) renders the model at the painting's own density (its rows per world unit) from the five bearings the engine already uses (front, front-side, side, back-side, back; the engine mirrors the other three) in every pose it animates (idle, two walk steps, wind-up, strike), under one sun whose shading is held to gentle bands so the painting's colours stay its own. Seen head-on, the cell is the painting; turned, it is the same painting with real depth.

The Cacophony Hound is painted side-on and has no face to show head-on or from behind, so only its three turned views come from the extrusion; the head-on and back views stay with the hand-built art of Phase 20. Its lunge is painted head-on and turns through all eight.

One atlas per model, the cell table in `js/pixel3d.js`; the runtime swaps the cell in for an entity's bearing and pose (or a prop's sprite under its name) when the switch is on. Nothing in saves, flags or the RNG changes; off, the flat sprites draw byte for byte as before.

## What is baked

| Set | Count | Notes |
|---|---|---|
| the bestiary | 23 | every enemy with a painted sprite; the hound hybrid as above |
| the people | 26 | townsfolk, every named NPC, the companions |
| props | 33 | chests, beds, looms, presses, tombs, lamps, bells, signs, ladders, the barrel and crate of Phase 20b; one view each |

Kept painted on purpose: the trees (Phase 20b's painted variants), the swarms, the moth, A Quiet (an absence with smoke), the cat, the fire, decals, ground and skies, and the first-person hands and weapons, which never turn.

## No new text

One Options row: **Pixel-3D models** — *creatures, people and props as the paintings given depth: pixel models that turn, lit the same from every side*. FR: Modèles pixel-3D / créatures, gens et objets : les peintures avec de la profondeur, des modèles en pixels qui tournent, éclairés pareil de tous côtés.

## Questions for sleeves

1. The depth: people and bipeds are extruded to 0.6 of their width, round props fully. Thicker or thinner?
2. The back of a figure is the mirrored front, darkened; a hood or a cloak reads well, a face less so. Worth painting true backs for the named people later?
3. The hound switches between the extruded turned views and the hand-built head-on and back views. Keep, or paint a head-on hound so it can be extruded whole?
