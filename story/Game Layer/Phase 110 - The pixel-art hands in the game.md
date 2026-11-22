# Phase 110: the pixel-art hands, in the game

The owner, 21 November 2026, on Phase 109's three options: **"lets use the pixel art in the game for now but I do want to eventually use the sculpted lit by the world"**.

**Nothing was added to the world.** This changes how the player's own hands and what they hold are drawn. Damage, timing, swings and Songs are exactly as before.

## What was done

Everywhere you see your own hands, they are now the pixel-art hands the owner chose. They are drawn at a three-pixel grain, with small colour ramps, outlines on the shadow side, and the glass arm's azure planes. This covers:
- **Every weapon in the hand.** Each weapon's own picture (Phase 87: every weapon has its own look) is turned into pixel art in its own colours, and a pixel hand closes on its grip:
  - two-handed and pole weapons get both hands;
  - the pistol, slings, crossbows, carbine, harpoon gun and hornbow are held as before.
- **The fists.** Bare, gloved and glass. Each glove and gauntlet keeps its own colours and form: leather, cloth, mail, plate vambraces, fingerless cuffs, coils, long cuffs, mitts, wraps, rivets and trim.
- **The glass arm**, on the left, raised and at rest. Only its bright planes and rim glow.
- **The Song's open hands.**
- **The off hand at rest.**
- **The climb:** two pixel fists on the rung, where there were plain rectangles.

A pole weapon's left forearm used to stop at the edge of its picture, in the middle of the screen. It now runs off the bottom of the screen.

**The switch:** Options, "Pixel hands". It is off in the Original preset and on in every other. Off gives Phase 98's hands exactly as they were.

Code:
- `js/pixelhands110.js`, built from Phase 109's option 3 (`tools/hands109/hands109x.js`, which stays as it was).
- `js/fp87.js`: a `noHands` option that paints a weapon without its hand and says where each hand grips. The default picture is unchanged.
- `js/fp-hands.js`: the climb.

French: `tools/i18n/p110-hands.tsv`.

Picture: `screenshots/p110-hands.jpg`. In reading order:
- the sword, the fists, the glass arm, the Song;
- a hammer, a glaive, a spear, a pistol, a crossbow;
- a mail gauntlet, a fingerless glove, the climb.

## Still to do (for the touch-up pass)
- **The arm behind a shield** is still the old picture (it is drawn inside `js/body21.js`).
- **By day the glass looks lighter than on the review sheet.** The 3D view's daylight brightens every first-person picture, the old ones too, so the glass reads a lighter azure. During a Song the old glow tint whitens it further.
- **The owner's aim:** the sculpted hands, lit by the world (`tools/hands109/hands109s.js`), replace these in the end.

## Verification
- New: `test/pixelhands110.test.js` (8 checks):
  - every weapon and pose builds, with the same size and fields as before;
  - hands at the grip;
  - the same on two builds, and no random numbers;
  - a glove's colours show;
  - switch off gives the old picture exactly;
  - the Options row, the presets, French, and no page errors.
- Also passing: body21, fp-hands, gear87, owed98, presets, pwa18, story-i18n, visual, hands109x, and the frame-sensitive suites listed in the pull request.
