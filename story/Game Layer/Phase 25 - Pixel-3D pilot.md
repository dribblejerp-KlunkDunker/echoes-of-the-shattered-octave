# Game — Phase 25 pilot: the pixel-3D set (for review)

*Written for review, Oct 2026. The code is `js/pixel3d.js`; the tools are `tools/art/pixel3d/`; the atlases `img/pixel3d/`.*

The owner asked for everything that makes sense in 3D to be **pixelated 3D**: real models, rendered to pixels. This pilot proves the pipeline on four pieces so the look can be judged before the rest is converted.

## How it works

Each model is scripted from primitives (boxes, cylinders, spheres, wedges) in world units, in a figure whose parts can be posed by name; Blender (the `bpy` module, run headless on the CPU) renders it from the five bearings the engine already uses (front, front-side, side, back-side, back; the engine mirrors the other three) in the five poses it animates (idle, two walk steps, wind-up, strike), 80 pixels to the world unit, under one sun and a flat ambient. Two renders per cell, lit and flat, are combined so each pixel is its material's own colour in one of five shade bands, with a one-pixel dark rim round the silhouette. One atlas per model; the runtime swaps the cell in for an entity's bearing and pose (or a prop's sprite under its name) when the switch is on. Nothing in saves, flags or the RNG changes.

## The pilot pieces

| Model | Replaces | Notes |
|---|---|---|
| Cacophony Hound | the painted hound and its Phase 20 views | low and long, ears back, red eyes; walk = diagonal legs; wind-up = haunches down; strike = the lunge, jaws wide |
| Catalogue Proctor | the Proctor's painted pilot views | grey robe to the ground, deep hood with the face in its dark, a ledger held to the chest, a stylus; strike = the stylus thrust |
| barrel, crate | the scenery props | one view each |

## No new text

One Options row: **Pixel-3D models** — *creatures, people and props as low-poly models rendered to pixels, lit the same from every side*. FR: Modèles pixel-3D / créatures, gens et objets en modèles low-poly rendus en pixels, éclairés pareil de tous côtés.

## Questions for sleeves

1. The pixel size: 80 to the world unit (a person 80 rows tall; the paintings are 160). Chunkier than the paintings on purpose; keep, or go finer (100, 120)?
2. Shading: flat bands without cast shadows (clean), or with Blender's cast shadows (more depth, a little noisier)?
3. The order: the bestiary first (every enemy turns), then the people, then props and trees?
