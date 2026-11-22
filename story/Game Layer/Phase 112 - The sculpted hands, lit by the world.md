# Phase 112: the sculpted hands, lit by the world

The second phase of the Fable 5.2 roadmap of 21 November 2026. The owner's aim (21 Nov): "I do want to eventually use the sculpted lit by the world". The roadmap's list: Phase 109's sculpted option brought to a finished standard (a real bare fist, the glass luminous as approved, every weapon gripped, the swings and the Song as moving joints, the game's own light fed in each frame), and put in the game as an Options choice with the pixel hands still the default.

**Nothing was added to the world.** This is a second way of drawing the player's own hands. Damage, timing, swings and Songs are exactly as before.

## The choice

Options, Graphics: **Hands: In pixels / Sculpted**. It starts on "In pixels" in every preset, and no preset changes it. The player's choice is kept across launches. "Sculpted" works in the 3D view. The classic view keeps the pixel hands, as the roadmap says.

French: Mains: En pixels / Sculptées (`tools/i18n/p112-sculpted.tsv`).

## The pictures

- `screenshots/p112-hands.jpg`: four poses (a blade in hand, the bare fist, the glass arm, open hands for a Song). Each row shows the option chosen in Phase 109, the pixel hands as they are now, and the sculpted hands in the game by day, by night, and by a street lamp at night.
- `screenshots/p112-kinds.jpg`: every weapon kind in the sculpted hands, mail gauntlets, two swings caught mid-way, a lamp at night, the arm behind a kite shield and behind a buckler, and a climb gloved and bare.
- `screenshots/p112-swing.gif`: a short clip: a sword slash, a spear thrust and a Song, frame by frame.

## What was done

1. **The sculpted hands are a part of the game** (`js/sculpted112.js`). They are Phase 109's jointed hands: a palm, fingers of three joints each, a thumb, a wrist with its bones, a forearm, a glove's cuff, a wool sleeve. Each pose is built once and kept.
2. **They stand exactly where the pixel hands stand.** The game already poses every first-person picture (where it is, how it turns through a swing, how it sinks when put away). The sculpted hands take that same pose, so every weapon is gripped where its pixel hand grips it, and the weapon itself is the same painted weapon, with the fingers closed round it in front and the palm behind.
3. **Every weapon kind is held**: knife, sword, longsword, axe, mace, spear, bell-glaive and maul (both hands where the weapon needs them), the glass blade, pistol, sling, crossbow and hornbow. Also the bare fists, the glass arm raised, the resting glass fist at the left, and the open hands of a Song.
4. **They are lit by the world, each frame.** The sun's or the moon's own colour and where it stands as you face it; the sky's light and the ground's; lamps near you as a warm light from the side; a Song as a light between the open hands, in the Song's own colour. By night they darken to the night's blue; by a street lamp the glove warms to brown again.
5. **The glass arm keeps its approved deep azure by day.** In the game's warm daylight it first came out a dull grey-teal. The glass now takes the light's brightness more than its colour, and gives a little light of its own. On its own picture the glass's middle colour went from about (65, 104, 137) to (66, 113, 165) by day. The planes that catch the light flash half as hard as Phase 109's did: in the game's light and through its bloom they had stood white.
6. **The wrist is a joint, and it works.** Through a slash it cocks back as the blow starts and snaps through as it lands (13 degrees each way), then comes to rest. A thrust straightens it; a blow from above bends it. The hand stays on the weapon and the forearm moves. The first centimetres of the forearm go part of the way with the hand, so the joint bends and does not break. Under a Song the open hands tip back as it rises.
7. **The fingers open through a Song.** As a Song gathers, the open hands start half curled, as a hand at rest, open in two steps, and ease again as it ends.
8. **The arm behind a shield is sculpted too.** The forearm comes up behind the shield's face and the fingers hook over its rim. The shield's own painted face is drawn in the same picture as the arm, so the arm is truly behind it and the fingers truly before it. It is the left arm, so with the glass arm it is glass.
9. **A climb's two fists are sculpted**, each closed on its rung, over the ladder.
10. **The locked glass arm is washed pale** while it is locked, as the pixel one is.
11. **The bare fist.** Phase 109's was pale and splayed. In the game it is a closed fist in the traveller's own skin colour, lit by the world, at the pixel fist's size and place. See "Known" below for what it still lacks.

## Known, and for the owner to judge

- **The bare fist is better than Phase 109's but is still the plainest of the hands.** Its fingers have no drawn creases at the joints and the nails are plain. It reads as a fist; it is not yet as finished as the gloved hand. Judge it on row 2 of `screenshots/p112-hands.jpg`.
- **The sleeve is wide in a climb.** The forearm hangs toward you there, and the wool sleeve fills more of the view than the pixel arm did.
- **The first time a pose is shown it is built, and that takes a moment.** Measured here, in a browser drawing in software with no graphics card: about 0.2 seconds for the first gripping hand, about 0.05 seconds for each pose after. Each pose is built once and kept. The cost of drawing each frame could not be measured meaningfully in software; it needs the check on a low-end laptop and a phone that the roadmap already lists as the owner's.
- **The fingers do not move through a swing**, only the wrist. In a swing the hand is closed on the weapon, so there is little for them to do.
- **The hands' own shadows on themselves are made for a light from the upper left.** The colour and strength of the light follow the world each frame; the soft shadow one finger casts on the next does not turn with the sun.
- **The classic view** keeps the pixel hands whichever is chosen (the roadmap's own ruling).
- With the glass arm raised, a leftward slash still carries the arm out of the left of the view (Phase 88's rule, as with the pixel hands).

## Canon and rulings kept

- The glass arm is the left arm. At rest it does not blaze green. Its approved colour is deep azure (14 Nov).
- Nothing visual uses random numbers: the test counts none while the hands are posed, built and drawn.
- Nothing is [PROPOSED]: no name, date, custom or balance number was invented.

## For the owner to rule

- **When "Sculpted" becomes the default in the 3D view.** Until then the pixel hands are what every player sees unless they choose otherwise.

## The work, for the next session

- `js/sculpted112.js`: the model (from `tools/hands109/hands109s.js`), the renderer (its own WebGL canvas, laid over the 3D view once a frame by `js/body21.js`), the Options row. `place(kind, id, look, t, anim)` takes a picture the game has posed; `card(canvas, t)` a painted picture in the same space; `flush(light)` draws the frame.
- `js/pixelhands110.js` `poses(kind, id, look)`: where each hand is on its picture, for a weapon (`'w'`), the hands alone (`'h'`), a climb (`'c'`) and the arm behind a shield (`'o'`).
- `js/body21.js`: `sculpt`, `sculptAnim` (the wrist and the fingers through a swing and a Song), `sculptLight` (the world's light), the shield arm in `drawShield`, `sculptClimb` and `sculptClimbEnd`.
- `js/fp-hands.js`: the climb gives its fists to the sculpted hands when they are chosen.
- Test: `test/sculpted112.test.js` (10 checks; run alone, it draws in WebGL).
- Tools: `tools/dev/shots112.sh` takes every picture; `tools/dev/sheets112.py` makes the sheets and the clip.
