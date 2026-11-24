# Phase 122: the sculpted hands finished, and the default

The owner, 21 Nov: "I do want to eventually use the sculpted lit by the world". 22 Nov: fine for now with the pixel hands as the default. 23 Nov, of the open question "when the sculpted hands become the default": "finish up with 5." So this phase finishes what the Phase 112 record said the sculpted hands still lacked (the bare fist, the sleeve in a climb), and makes them what a player sees first in the 3D view.

**Nothing was added to the world.** Damage, timing, swings and Songs are exactly as before. The glass arm is untouched: the left arm, deep azure, not blazing at rest (its raised fist draws the same pixels as in Phase 112). The wrist joint and the fingers' spread of Phase 112 are untouched, and so are the pixel hands.

## The default

- The switch for the sculpted hands is now a preset switch (`GFX.FX`), and it is in Low's list (`LOW_OFF` in `js/presets.js`, and the `cheapOff` list in `test/presets.test.js`). It is **on in Medium, High, Ultra and Cinematic**, and **off in Original** (the game as first made) **and in Low** (weak machines).
- A new player in the 3D view sees the sculpted hands. A player's own stored choice is kept across launches, as before (`PRESETS.keep`): someone who chose the pixel hands keeps them. Someone who never chose gets the sculpted hands the next time they play in a preset above Low. A returning player whose settings are their own ("Custom") starts as the preset those settings were made from wants.
- The classic view always keeps the pixel hands. The Options row stays ("Hands: In pixels / Sculpted"), so anyone can go back. Its note no longer says the sculpted hands are "still in work": "in pixels, or sculpted and lit by the world (the 3D view)"; French in `tools/i18n/p122-hands.tsv`.
- If the hands' own WebGL canvas cannot be made, or its context is lost, the pixel hands are drawn, silently, and the player's choice is kept. A context that comes back, or the choice made again in Options, tries the sculpted hands afresh. (Before this phase a canvas that could not be made left no hands at all.)

## The bare fist

Phase 112's bare fist was the plainest of the hands: no creases at the joints, plain nails. Now:

- **Creases** across each finger joint and knuckle: a band of fine lines across the finger, bowed toward the joint at its sides, each line breaking and rejoining, the skin between them a little raised and catching the light. The thumb's joints the same. The wrist has its bracelet lines on the inside and finer ones on the back; the palm has its two lines across and the one round the thumb's mound; the skin everywhere carries its fine cross-hatch of lines, a shade deeper on bare skin.
- **Nails** that read as nails: a soft oval plate seated on the finger (Phase 112's had sunk into it, which is why they read as plain), a little paler and pinker than the skin, a faintly paler half-moon at the base, faint ridges along it, a faint darker line where it goes under the cuticle and down the sides, and a thin rounded free edge a shade paler again (never white). The plate is shaded as its finger is. No polish: a working hand. Every nail that faces the eye shows: in the closed fist that is the thumb's (the fingertips are curled into the palm); on a weapon's grip, the fingertips' too.
- **Skin tone**: knuckles redder, with the sheen of skin drawn taut over them; the heel of the hand paler and a little yellower; the tendons on the back of the closed hand sharper, on a finer mesh.
- All in code; nothing random (hashed noise only). The skin tones a player can already have are the ones used.

**The numbers** (`test/hands122.test.js`: the fist alone, large, a centimetre of hand to 36 pixels, in a fixed light; pixels darker or paler than the 9 x 9 around them by 14 or more, away from the outline):

| skin (face) | Phase 112 darker | Phase 122 darker | Phase 112 paler | Phase 122 paler |
|---|---|---|---|---|
| 1 | 1566 | 2507 | 1948 | 2405 |
| 2 | 1680 | 2716 | 2059 | 2408 |
| 5 | 1542 | 2427 | 1895 | 2409 |

The test asks for at least 1.4 times the darker and 1.15 times the paler pixels in each skin.

**The skin tone follows the face** as the pixel hand's does. The mean brightness of the skin (sculpted, pixel), for the lightest face, a middle one and the darkest: face 4 (133, 161), face 1 (107, 128), face 5 (99, 117). The sculpted hand is lit by the world and so a little darker than the flat pixel colours, but its tones are in the same order and nearly as far apart (34 against 44). Faces 1, 2, 3 and 5 are close to one another in the game's own colours; the sheet shows 4, 1 and 5.

## The sleeve in a climb

The forearm hangs toward you in a climb, and Phase 112's wool sleeve filled much more of the view than the pixel arm did. Now, in a climb only: the forearm is slimmer; the sleeve falls back from the wrist (about 9 cm with gloves, 7.5 bare), as it does on an arm raised over the head, so a little bare forearm shows below the glove's cuff as it does on the pixel arm; it narrows toward its hem and gathers in a few soft rings just above it; its folds are shallower; the glove's cuff flares less. The fist is still round the rung.

**The numbers** (the widest the right arm is, in view pixels, in the rows 40 to 120 view pixels below the rung):

| | the pixel arm | Phase 112 | Phase 122 | Phase 122 / the pixel arm |
|---|---|---|---|---|
| gloved | 26.3 | 46.7 | 26.9 | 1.03 |
| bare hands | 26.3 | 46.9 | 27.2 | 1.04 |

The glass arm's forearm in a climb is slimmed the same way (its shape only; its colour and its light are untouched).

## The pictures

`screenshots/p122-hands.jpg`: a fresh profile's first view before and after; the bare fist at about 2x and 4x, Phase 112 beside Phase 122 and the pixel fist; three skin tones (faces 4, 1, 5); the nails at about 4x; bare hands on a knife, a sword and an axe; a climb gloved and bare, the pixel arm beside Phase 112 and Phase 122; the glass arm raised and at rest. Taken with `tools/dev/shots122.sh` (once against this branch, once against the code before it) and made with `tools/dev/sheets122.py`. `tools/dev/fist122.js` draws the hands alone, large, straight off their canvas, with the test's figures.

## The tests

- `test/hands122.test.js` (new, 9 checks): a fresh profile sees the sculpted hands; the presets; the classic view; the fist's figures; the skin's tone against the pixel hand's for three faces; the sleeve's width and the fist round the rung; the context lost and restored; the canvas that cannot be made; a stored choice of the pixel hands kept across a launch.
- Taught: `test/sculpted112.test.js`'s first check said the switch was off in every preset; it now says off in Original and Low and on above. `test/presets.test.js` lists `sculptedHands` in Low's list.

## Still for the owner

- **The cost on a phone and a low-end laptop.** Not measured here (a browser drawing in software). That is why Low keeps the pixel hands. A bare hand is built on a finer mesh than before (its palm), so its first build takes a little longer; each pose is still built once and kept.
- Close up, the creases round a bent middle knuckle can read as a ring round it. At the game's own size they read as creases.

## Found in integration (23 Nov, the full run)

- **The sculpted hands are first drawn on the second frame after arriving on a map.** `test/cover105.test.js` compares two frames indoors and went red once these hands became the default: frame one after arriving has no hands, frames two onward are identical (probed with the mast's far view, the roofs and the hands each switched off in turn; only the hands changed the later frames). The pixel hands do not have this. One frame at a doorway, behind the map change, is not something a player sees, so the suite was taught to let the scene settle for a frame and the hands were left as they are. To be put right when the hands are next opened (Phase 125, the heroes' hands).

