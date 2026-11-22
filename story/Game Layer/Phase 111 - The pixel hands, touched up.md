# Phase 111: the pixel hands, touched up

The first phase of the Fable 5.2 roadmap of 21 November 2026. The roadmap's own list: the arm behind a shield in pixel art; the glass arm's approved deep azure held by day; the hands' own Song light; the broad flat palm and thumb pad, and the blotchy glove wear; every swing, the lowering and raising, the Song and the climb, frame by frame; and, optionally, the night tinting the hands.

**Nothing was added to the world.** This changes how the player's own hands are drawn. Damage, timing, swings and Songs are exactly as before. There is no new text in the game, so there is no French to add, and nothing is [PROPOSED].

## The pictures

- `screenshots/p111-hands.jpg`: the four poses (a blade in hand, the bare fist, the glass arm, open hands for a Song). Each row shows the approved column 3 of `screenshots/p109-options.jpg`, the game before this phase, and the game now by day and by night.
- `screenshots/p111-kinds.jpg`: every weapon kind, the arm behind a buckler and behind the kite shield, the climb, mail gauntlets, two swings caught mid-way, the shield by night, and the hands by a lamp at night.
- `screenshots/p111-before-after.jpg`: the shield arm, a swing and a Song, before and now.

## What was done

1. **The arm behind a shield is pixel art.** It was the last smooth-shaded arm left. The forearm now comes up from below the view behind the shield, through its middle, and the four fingers hook over the rim where the arm's line meets it. It is the left arm, so with the glass arm it is glass. It grows and shrinks with the shield as the shield is raised. (`PIXELHANDS110.offArm`, drawn by `js/body21.js`; the rim is read from each shield's own picture, so it holds for every shape.)
2. **The glass arm is its approved deep azure by day in the 3D view.** Two things had turned it pale. The 3D view's daylight is brighter than white, and it multiplied every first-person picture. And the glass's bright edges were marked to bloom at full strength, which laid a pale haze over the whole arm. Now a pixel picture is never drawn brighter than it was painted, and its glints bloom at a tenth. Measured on the screen against the painting: the glass was 47 too red and 37 too green; it is now 13 and 5. The gloves had gone orange for the same reason and are leather brown again.
3. **By night the hands darken, and warm by a lamp** (the roadmap's optional item). In the 3D view a pixel picture takes the light where you stand: full light leaves it as painted; as the light falls it darkens in the light's own cast, cool at night and warm by a lamp, and never below half, so the hands can always be read. The classic view already did this.
4. **A Song lights the hands with a light of their own.** The old glow added the Song's colour over the whole picture, which turned the glass white and the glove yellow. Now each picture of the open hands knows which of its pixels face the light between the hands, in three steps, and the Song's colour is laid on those and nowhere else.
5. **The arm runs on past its picture.** Each picture ended at the edge of its canvas, so through a swing, when the picture turns and travels, the forearm ended in the air. The forearm and sleeve are now built on a wider sheet and drawn past the picture's edge, out of the view.
6. **The palm and the thumb's pad.** They were one broad flat plane. The thumb's pad and the heel of the hand are now forms of their own, with the crease where the pad stands over the palm, two creases across the wrist and its two tendons.
7. **The glove's wear.** Leather's lightest tone lay on the back of the hand and the wrist in blots; it now shows only where the leather faces the light squarely. The scuffs on the knuckles are a few pixels and a checker, not discs.
8. **A cloth sleeve's folds are drawn.** They were a ripple in the surface, which along a sleeve seen at length broke its light into a row of pale ovals. The sleeve is now lit as the plain round it is, and each fold is a dark crease with a light ridge beside it.
9. **Frame by frame.** Seven frames of a slash, seven of an overhead blow, four of a thrust, the fists and the glass arm punching, three of the lowering, two of the climb, a Song by day and by night, each looked at in the 3D view. What it found is items 5 and 8, and the rounded ends of the sleeve's parts standing out of it as pale discs (they are left open now).

## Known, and left as it is

- With the glass arm raised, a leftward slash carries the arm out of the left of the view. That is Phase 88's rule (a drag swings the way it goes), on `main` before this phase too.
- The 3D view's colour grade still acts on the hands as it does on the world: on the screen the glass's blue is about 25 lower than painted. The hands sit in the world's light; they are not pasted over it.
- The shields' own faces are not pixel art (they are not hands, arms or weapons). The pixel arm beside them is at the same grain as the other hands.

## Switches

No new switch. All of this is part of "Pixel hands" (Phase 110; off in the Original preset). With it off, the game draws the Phase 98 hands and the old shield arm exactly as before; the tests check this.

## Tests

- `test/pixelhands110.test.js`, extended (12 checks, 4 of them new): the arm past its picture and to the edge of the view mid-swing; the shield arm in pixel art, fingers over the rim, glass on the left, off with the switch; the Song light in steps, on what faces it, laid over and not added; the glove not blotched and the palm formed.
- `test/pixelhands111.test.js`, new, run alone (it draws in WebGL): in the 3D view the glass is its painted azure by day and the glove its painted brown; by night darker and never below a third; a Song's light is laid over the hands and the glass stays blue.
- Both were run against `main` as it was before this phase: 3 of the 3D view's 4 checks fail there (the fourth is "no page errors"), and the new classic checks fail there.

## Tools

`tools/dev/hands111.js` (your own hands as the game draws them, any scene), `tools/dev/px111.js` (the pixel hands alone, no game loaded), `tools/dev/sheets111.py` (the review sheets). See `tools/dev/README.md`.

## For the owner

- **The nod** for the touched-up hands, from the two sheets.
- Still open from before: when the sculpted hands become the default (Phase 112 next); the Phase 107 inspect lines and natural edges; each town's proportions and the later places' roofs (Phase 108, Phase 116).
